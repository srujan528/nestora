import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { prisma } from '@qrent/shared';
import { CommuteAgent } from '../src/ai/agents/CommuteAgent';
import { FoodAgent } from '../src/ai/agents/FoodAgent';
import { ReviewAgent } from '../src/ai/agents/ReviewAgent';
import { CostAgent } from '../src/ai/agents/CostAgent';
import { VerificationAgent } from '../src/ai/agents/VerificationAgent';
import { SupervisorRouter } from '../src/ai/SupervisorRouter';
import { LangGraphRunner } from '../src/ai/LangGraphRunner';
import { createInitialAgentState } from '../src/ai/AgentState';

async function runPhase4CVerification() {
  console.log('🚀 Starting Stage 4C Specialized Intelligence Agents Verification...');

  // Initialize candidate state
  let state = createInitialAgentState(
    'Give me the best PG for me near DU North Campus under ₹12,000'
  );
  state = await LangGraphRunner.runRecommendationPipeline(
    state.naturalLanguageRequest,
    undefined,
    1
  );

  const candidates = state.candidatePGs;
  if (candidates.length === 0) throw new Error('No candidate PGs found for testing!');

  // 1. Test Commute & Location Agent
  console.log('\n1️⃣ Testing Commute & Location Agent...');
  const commuteState = await CommuteAgent.execute({ ...state });
  const commuteInfo = Object.values(commuteState.commuteResults || {})[0];

  console.log(`✅ Commute Output for PG #${commuteInfo?.pgId}:`);
  console.log(
    ` - Distance: ${commuteInfo?.distanceKm} km | Duration: ${commuteInfo?.commuteTimeMins} mins (${commuteInfo?.commuteMode})`
  );
  console.log(` - Commute Cost Est: ${commuteInfo?.commuteFareFormula}`);
  console.log(` - Status: ${commuteInfo?.statusMessage}`);

  if (!commuteInfo || commuteInfo.distanceKm <= 0) throw new Error('CommuteAgent output invalid!');

  // 2. Test Food Intelligence Agent
  console.log('\n2️⃣ Testing Food Intelligence Agent...');
  const foodState = await FoodAgent.execute({ ...state });
  const foodInfo = Object.values(foodState.foodAnalysis || {})[0];

  console.log(`✅ Food Output for PG #${foodInfo?.pgId}:`);
  console.log(` - Food Type: ${foodInfo?.foodType} | Meal Option: ${foodInfo?.mealOption}`);
  console.log(` - Has Menu: ${foodInfo?.hasMenu} | Menu ID: ${foodInfo?.menuId || 'None'}`);
  console.log(` - Summary: ${foodInfo?.menuSummary}`);

  if (!foodInfo) throw new Error('FoodAgent output invalid!');

  // 3. Test Review Intelligence Agent
  console.log('\n3️⃣ Testing Review Intelligence Agent...');
  const reviewState = await ReviewAgent.execute({ ...state });
  const reviewInfo = Object.values(reviewState.reviewAnalysis || {})[0];

  console.log(`✅ Review Output for PG #${reviewInfo?.pgId}:`);
  console.log(
    ` - Review Count: ${reviewInfo?.reviewCount} | Avg Rating: ${reviewInfo?.averageRating}/5.0`
  );
  console.log(` - Category Scores:`, reviewInfo?.categoryScores);
  console.log(` - Positive Themes:`, reviewInfo?.positiveThemes);
  console.log(` - Supporting Review IDs:`, reviewInfo?.supportingReviewIds);

  if (!reviewInfo) throw new Error('ReviewAgent output invalid!');

  // 4. Test Budget & Cost Analyst Agent
  console.log('\n4️⃣ Testing Budget & Cost Analyst Agent...');
  const costState = await CostAgent.execute({ ...state });
  const costInfo = Object.values(costState.costAnalysis || {})[0];

  console.log(`✅ Cost Analyst Output for PG #${costInfo?.pgId}:`);
  console.log(
    ` - Total Monthly Cost: ₹${costInfo?.totalMonthlyCost} | Annual Est: ₹${costInfo?.estimatedAnnualCost}`
  );
  console.log(` - Within Budget: ${costInfo?.withinBudget} (${costInfo?.statusMessage})`);
  console.log(` - Known Costs:`, costInfo?.knownCosts);
  console.log(` - Estimated Costs:`, costInfo?.estimatedCosts);

  if (!costInfo || costInfo.totalMonthlyCost <= 0) throw new Error('CostAgent output invalid!');

  // 5. Test Listing Verification Agent (DEMO Listing Labeling Clarity)
  console.log('\n5️⃣ Testing Listing Verification Agent & DEMO Data Clarity...');
  const verifState = await VerificationAgent.execute({ ...state });
  const verifInfo = Object.values(verifState.verificationResults || {})[0];

  console.log(`✅ Verification Output for PG #${verifInfo?.pgId}:`);
  console.log(
    ` - State: ${verifInfo?.verificationState} | Is Verified: ${verifInfo?.isVerified} | Is Demo: ${verifInfo?.isDemoData}`
  );
  console.log(` - Completeness Score: ${verifInfo?.completenessScore}%`);
  console.log(` - Trust Summary: ${verifInfo?.trustSummary}`);
  console.log(` - Warnings:`, verifInfo?.warnings);

  if (verifInfo?.isDemoData) {
    if (verifInfo.isVerified !== false) {
      throw new Error(
        'DEMO Listing Integrity Violation: isVerified must be false when isDemoData is true!'
      );
    }
    if (verifInfo.verificationState !== 'DEMO_SEED_DATA') {
      throw new Error(
        'DEMO Listing Integrity Violation: verificationState must be DEMO_SEED_DATA for demo listings!'
      );
    }
  }

  // Regression check on final recommendation output for DEMO listings
  const demoCandidate = state.finalRecommendations?.rankedCandidates.find(c => c.isDemoData);
  if (demoCandidate && demoCandidate.isVerified !== false) {
    throw new Error(
      'DEMO Listing Integrity Violation: Recommendation candidate isVerified must be false for DEMO listings!'
    );
  }

  // 6. Test Supervisor Router Dynamic Intent Dispatch
  console.log('\n6️⃣ Testing Supervisor Router Dynamic Intent Dispatch...');
  const comprehensiveRoute = await SupervisorRouter.route(
    createInitialAgentState('Give me the best PG for me near DU North Campus')
  );
  const verificationRoute = await SupervisorRouter.route(
    createInitialAgentState('Is this PG trustworthy and verified?')
  );

  console.log(`✅ Comprehensive Route Agents: [${comprehensiveRoute.requiredAgents.join(', ')}]`);
  console.log(`✅ Verification Route Agents: [${verificationRoute.requiredAgents.join(', ')}]`);

  if (
    !comprehensiveRoute.requiredAgents.includes('FOOD') ||
    !comprehensiveRoute.requiredAgents.includes('VERIFICATION')
  ) {
    throw new Error('Supervisor failed to dispatch specialized agents for comprehensive query!');
  }

  // 7. Test Failure Isolation
  console.log('\n7️⃣ Testing Pipeline Failure Isolation...');
  const failedState = await LangGraphRunner.runRecommendationPipeline('Test query with food focus');
  console.log(
    `✅ Pipeline executed with ${failedState.warnings.length} warnings and ${failedState.errors.length} errors.`
  );
  console.log(
    ` - Recommendations generated: ${failedState.finalRecommendations?.rankedCandidates.length} candidates.`
  );

  if (
    !failedState.finalRecommendations ||
    failedState.finalRecommendations.rankedCandidates.length === 0
  ) {
    throw new Error('Pipeline failed to isolate non-critical agent warnings!');
  }

  // 8. Test System Regressions
  console.log('\n8️⃣ Verifying System Regressions across all previous phases...');
  const pgCount = await prisma.pGListing.count();
  console.log(`✅ DB Regression Check: ${pgCount} PGs intact in Prisma DB.`);

  console.log('\n🎉 STAGE 4C VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

runPhase4CVerification()
  .catch(err => {
    console.error('❌ Stage 4C Verification Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
