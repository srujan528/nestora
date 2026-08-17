import { AgentState } from '../AgentState';
import { getLLMProvider } from '../LLMProviderWrapper';

export class DecisionAgent {
  /**
   * Executes the Decision Agent, consuming structured outputs from all prior agents with evidence citations and DEMO listing clarity.
   */
  static async execute(state: AgentState): Promise<AgentState> {
    const startTime = Date.now();
    const prefs = state.studentPreferences;
    const candidates = state.candidatePGs.slice(0, 5); // Top 5 candidates
    const scores = state.deterministicScores;

    if (candidates.length === 0) {
      state.finalRecommendations = {
        rankedCandidates: [],
        summaryExplanation:
          'No PG listings are available in the system for the requested college location.',
      };
      state.executionMetadata.agentTimings['DecisionAgent'] = Date.now() - startTime;
      return state;
    }

    const structuredCandidates = candidates.map((pg, idx) => {
      const scoreObj = scores.find(s => s.pgId === pg.id) || {
        totalScore: 75,
        scoreBreakdown: {},
        hardConstraintsPassed: true,
      };

      const commuteInfo = state.commuteResults?.[pg.id];
      const foodInfo = state.foodAnalysis?.[pg.id];
      const reviewInfo = state.reviewAnalysis?.[pg.id];
      const costInfo = state.costAnalysis?.[pg.id];
      const verifInfo = state.verificationResults?.[pg.id];

      const bedsOpen = pg.rooms?.reduce((acc: number, r: any) => acc + r.availableBeds, 0) || 0;
      const roomTypes =
        pg.rooms?.map((r: any) => `${r.roomType} (${r.isAc ? 'AC' : 'Non-AC'})`).join(', ') ||
        'Sharing rooms';

      const reasons: string[] = [];
      const advantages: string[] = [];
      const tradeoffs: string[] = [];
      const warnings: string[] = [];
      const missingInfo: string[] = [];

      // 1. Cost & Budget Reasons
      if (costInfo) {
        if (costInfo.withinBudget) {
          reasons.push(
            `Total True Monthly Cost ₹${costInfo.totalMonthlyCost.toLocaleString()} fits within your ₹${prefs.maxBudget || 20000} budget (${costInfo.statusMessage})`
          );
        } else {
          tradeoffs.push(costInfo.statusMessage);
        }
        if (costInfo.missingCostFields?.length > 0) {
          missingInfo.push(...costInfo.missingCostFields);
        }
      } else {
        reasons.push(`Base rent starts at ₹${pg.minRent.toLocaleString()}/month`);
      }

      // 2. Commute & Location Reasons
      if (commuteInfo) {
        if (commuteInfo.satisfiesCommuteRequirement) {
          reasons.push(
            `Commute is ${commuteInfo.distanceKm} km (${commuteInfo.commuteTimeMins} min ${commuteInfo.commuteMode.toLowerCase()}) to ${state.selectedCollege?.name || 'college'}`
          );
        } else {
          tradeoffs.push(
            `Commute time ${commuteInfo.commuteTimeMins} mins exceeds your target requirement`
          );
        }
      } else {
        reasons.push(`Located ${pg.distanceKm || 1.0} km from target college`);
      }

      // 3. Room & Amenities Advantages
      if (pg.rooms?.some((r: any) => r.isAc)) advantages.push('AC room configuration available');
      if (bedsOpen > 0)
        advantages.push(`${bedsOpen} beds currently available for immediate occupancy`);
      if (pg.curfewTime) tradeoffs.push(`Curfew timing enforced: ${pg.curfewTime}`);

      // 4. Food Intelligence Advantages & Warnings
      if (foodInfo) {
        if (foodInfo.hasMenu) {
          advantages.push(foodInfo.menuSummary);
        } else {
          missingInfo.push('Food menu details not provided by owner.');
        }
      }

      // 5. Review Intelligence Insights
      if (reviewInfo) {
        if (reviewInfo.positiveThemes.length > 0) {
          advantages.push(...reviewInfo.positiveThemes);
        }
        if (reviewInfo.negativeThemes.length > 0) {
          tradeoffs.push(...reviewInfo.negativeThemes);
        }
        if (reviewInfo.reviewCount === 0) {
          missingInfo.push('No student reviews written yet for this accommodation.');
        }
      }

      // 6. Verification & Trust Warnings (Strict DEMO clarity)
      if (verifInfo) {
        if (verifInfo.isDemoData) {
          warnings.push('DEMO LISTING (SEED DATA) — Created for platform demonstration purposes.');
        } else if (verifInfo.isVerified) {
          advantages.push('Verified Listing — Inspected & verified by Nestora Admin Team.');
        } else {
          warnings.push('Pending Admin Verification — Unverified listing.');
        }
        if (verifInfo.missingFields.length > 0) {
          missingInfo.push(...verifInfo.missingFields);
        }
      } else if (pg.isDemoData) {
        warnings.push('DEMO LISTING (SEED DATA) — Created for platform demonstration purposes.');
      }

      // Build Evidence Citation References
      const evidenceReferences = {
        pgId: pg.id,
        reviewIds: reviewInfo?.supportingReviewIds || [],
        menuId: foodInfo?.menuId,
        roomIds: pg.rooms?.map((r: any) => r.id) || [],
      };

      return {
        pgId: pg.id,
        title: pg.title,
        matchScore: scoreObj.totalScore, // Renamed from aiMatchScore to matchScore
        rank: idx + 1,
        reasons,
        advantages,
        tradeoffs,
        warnings,
        missingInfo,
        evidenceReferences,
        trueMonthlyCost: pg.trueMonthlyCost || pg.minRent,
        costBreakdown: pg.trueMonthlyCostBreakdown || {
          baseRent: pg.minRent,
          foodCost: pg.extraFoodCharges || 0,
          electricityCost: pg.estElectricityMonthly || 800,
          maintenanceCost: pg.estMaintenanceMonthly || 0,
          commuteCost: pg.commuteCostEstMonthly || 0,
          totalMonthlyCost: pg.trueMonthlyCost || pg.minRent,
        },
        distanceKm: pg.distanceKm || 0,
        commuteMins: pg.commuteTimeMins || 0,
        commuteMode: pg.commuteMode || 'WALKING',
        isDemoData: Boolean(pg.isDemoData),
        isVerified: pg.isDemoData ? false : Boolean(pg.isVerified),
      };
    });

    // Generate grounded summary explanation
    const llm = getLLMProvider();
    let summaryExplanation = `Based on your preferences, ${structuredCandidates[0]?.title} is your top recommendation with a deterministic Match Score of ${structuredCandidates[0]?.matchScore}%. It offers a True Monthly Cost of ₹${structuredCandidates[0]?.trueMonthlyCost.toLocaleString()} and a ${structuredCandidates[0]?.commuteMins}-min commute to ${state.selectedCollege?.name || 'your college'}.`;

    try {
      const llmExplanation = await llm.generateCompletion(
        `Synthesize a 2-sentence grounded recommendation explanation based ONLY on these candidates: ${JSON.stringify(structuredCandidates.slice(0, 2))}. State clearly that the Match Score is generated deterministically by the scoring engine.`
      );
      if (llmExplanation && !llmExplanation.includes('Mock Response')) {
        summaryExplanation = llmExplanation;
      }
    } catch {
      // Fallback summary
    }

    state.finalRecommendations = {
      rankedCandidates: structuredCandidates,
      summaryExplanation,
    };

    state.executionMetadata.agentTimings['DecisionAgent'] = Date.now() - startTime;
    return state;
  }
}
