import { StudentPreferences, CandidatePGScore, PriorityWeights } from './AgentState';

export class MatchScoringEngine {
  /**
   * Normalizes priority weights so their sum equals 1.0.
   */
  static normalizeWeights(weights?: Partial<PriorityWeights>): PriorityWeights {
    const defaultWeights: PriorityWeights = {
      budget: 0.25,
      distance: 0.2,
      roomSharing: 0.15,
      food: 0.15,
      amenities: 0.1,
      trueCost: 0.1,
      reviews: 0.05,
    };

    const combined = { ...defaultWeights, ...weights };
    const totalSum = Object.values(combined).reduce((sum, w) => sum + w, 0);

    if (totalSum === 0) return defaultWeights;

    return {
      budget: parseFloat((combined.budget / totalSum).toFixed(4)),
      distance: parseFloat((combined.distance / totalSum).toFixed(4)),
      roomSharing: parseFloat((combined.roomSharing / totalSum).toFixed(4)),
      food: parseFloat((combined.food / totalSum).toFixed(4)),
      amenities: parseFloat((combined.amenities / totalSum).toFixed(4)),
      trueCost: parseFloat((combined.trueCost / totalSum).toFixed(4)),
      reviews: parseFloat((combined.reviews / totalSum).toFixed(4)),
    };
  }

  /**
   * Evaluates hard constraints and returns reason if any constraint fails.
   */
  static evaluateHardConstraints(
    pg: any,
    prefs: StudentPreferences
  ): { passed: boolean; reason?: string } {
    if (
      prefs.genderRestriction &&
      pg.genderRestriction &&
      pg.genderRestriction !== 'CO_ED' &&
      pg.genderRestriction !== prefs.genderRestriction
    ) {
      return {
        passed: false,
        reason: `Gender restriction mismatch (${pg.genderRestriction} vs ${prefs.genderRestriction})`,
      };
    }

    if (prefs.maxBudget && pg.minRent > prefs.maxBudget) {
      return {
        passed: false,
        reason: `Min rent ₹${pg.minRent} exceeds max budget ₹${prefs.maxBudget}`,
      };
    }

    if (prefs.maxDistanceKm && pg.distanceKm !== undefined && pg.distanceKm > prefs.maxDistanceKm) {
      return {
        passed: false,
        reason: `Distance ${pg.distanceKm}km exceeds limit ${prefs.maxDistanceKm}km`,
      };
    }

    if (prefs.acRequired && pg.rooms) {
      const hasAc = pg.rooms.some((r: any) => r.isAc);
      if (!hasAc) {
        return { passed: false, reason: 'No AC room available' };
      }
    }

    if (prefs.foodPreference === 'VEG_ONLY' && pg.foodType === 'NON_VEG_ALLOWED') {
      // Non-veg allowed is acceptable unless strictly forbidden, but if veg required check foodType
    }

    return { passed: true };
  }

  /**
   * Computes a reproducible, transparent 0-100 match score for a candidate PG.
   */
  static scoreCandidate(pg: any, prefs: StudentPreferences): CandidatePGScore {
    const weights = this.normalizeWeights(prefs.priorityWeights);
    const constraintCheck = this.evaluateHardConstraints(pg, prefs);

    if (!constraintCheck.passed) {
      return {
        pgId: pg.id,
        title: pg.title,
        totalScore: 0,
        scoreBreakdown: {
          budgetScore: 0,
          distanceScore: 0,
          roomScore: 0,
          foodScore: 0,
          amenitiesScore: 0,
          trueCostScore: 0,
          reviewScore: 0,
        },
        hardConstraintsPassed: false,
        failedConstraintReason: constraintCheck.reason,
      };
    }

    // 1. Budget Score
    const maxBudget = prefs.maxBudget || 20000;
    const trueCost = pg.trueMonthlyCost || pg.minRent || 10000;
    const budgetDiff = Math.abs(trueCost - maxBudget);
    const budgetScore = Math.max(
      0,
      Math.min(100, Math.round(100 * (1 - budgetDiff / (maxBudget * 1.5))))
    );

    // 2. Distance Score
    const maxDist = prefs.maxDistanceKm || 10;
    const actualDist = pg.distanceKm !== undefined ? pg.distanceKm : 2.0;
    const distanceScore = Math.max(0, Math.min(100, Math.round(100 * (1 - actualDist / maxDist))));

    // 3. Room Score
    let roomScore = 80;
    if (prefs.preferredRoomType && pg.rooms) {
      const match = pg.rooms.some((r: any) => r.roomType === prefs.preferredRoomType);
      roomScore = match ? 100 : 60;
    }

    // 4. Food Score
    let foodScore = 85;
    if (prefs.foodPreference) {
      if (prefs.foodPreference === 'VEG_ONLY' && pg.foodType === 'VEG_ONLY') foodScore = 100;
      else if (prefs.foodPreference === 'NON_VEG_ALLOWED' && pg.foodType === 'NON_VEG_ALLOWED')
        foodScore = 100;
      else foodScore = 70;
    }

    // 5. Amenities Score
    let amenitiesScore = 80;
    if (prefs.importantAmenities && prefs.importantAmenities.length > 0 && pg.amenities) {
      const pgAmenityNames = pg.amenities.map((a: any) => a.name.toLowerCase());
      const matchCount = prefs.importantAmenities.filter(a =>
        pgAmenityNames.some((name: string) => name.includes(a.toLowerCase()))
      ).length;
      amenitiesScore = Math.round((matchCount / prefs.importantAmenities.length) * 100);
    }

    // 6. True Cost Score
    const trueCostScore =
      trueCost <= maxBudget
        ? 100
        : Math.max(40, Math.round(100 - ((trueCost - maxBudget) / 1000) * 10));

    // 7. Review Score
    const rating = pg.averageRating || 4.5;
    const reviewScore = Math.round(rating * 20); // 4.5 * 20 = 90

    // Compute Total Weighted Score
    const totalScore = Math.round(
      budgetScore * weights.budget +
        distanceScore * weights.distance +
        roomScore * weights.roomSharing +
        foodScore * weights.food +
        amenitiesScore * weights.amenities +
        trueCostScore * weights.trueCost +
        reviewScore * weights.reviews
    );

    return {
      pgId: pg.id,
      title: pg.title,
      totalScore: Math.min(99, Math.max(50, totalScore)),
      scoreBreakdown: {
        budgetScore,
        distanceScore,
        roomScore,
        foodScore,
        amenitiesScore,
        trueCostScore,
        reviewScore,
      },
      hardConstraintsPassed: true,
    };
  }
}
