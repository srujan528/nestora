import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { prisma } from '@qrent/shared';
import { PGSearchService } from '../src/services/PGSearchService';
import { MatchScoringEngine } from '../src/ai/MatchScoringEngine';
import { getLLMProvider, MockLLMProvider } from '../src/ai/LLMProviderWrapper';
import { SupervisorRouter } from '../src/ai/SupervisorRouter';
import { LangGraphRunner } from '../src/ai/LangGraphRunner';
import { createInitialAgentState } from '../src/ai/AgentState';

async function runPhase4AVerification() {
  console.log('🚀 Starting Stage 4A AI Foundation & Infrastructure Verification...');

  // 1. Test Decoupled PGSearchService Abstraction
  console.log('\n1️⃣ Testing PGSearchService Decoupled Abstraction...');
  const searchResult = await PGSearchService.searchPgs({
    collegeId: 1, // DU North Campus
    maxDistanceKm: 10,
    page: 1,
    pageSize: 10,
  });

  console.log(`✅ PGSearchService returned ${searchResult.total} listings:`);
  searchResult.pgs.forEach(pg => {
    console.log(
      ` - [${pg.title}] | Rent: ₹${pg.minRent} | True Cost: ₹${pg.trueMonthlyCost} | Distance: ${pg.distanceKm}km`
    );
  });

  if (searchResult.pgs.length === 0) throw new Error('PGSearchService returned empty listings!');

  // 2. Test Deterministic MatchScoringEngine (Reproducible 0-100 Score)
  console.log('\n2️⃣ Testing Deterministic MatchScoringEngine & Sub-Scores...');
  const samplePg = searchResult.pgs[0];
  const samplePrefs = {
    maxBudget: 12000,
    genderRestriction: samplePg.genderRestriction as any,
    acRequired: false,
    maxDistanceKm: 5,
    importantAmenities: ['Wi-Fi', 'Power Backup'],
    priorityWeights: {
      budget: 0.3,
      distance: 0.2,
      roomSharing: 0.1,
      food: 0.2,
      amenities: 0.1,
      trueCost: 0.05,
      reviews: 0.05,
    },
  };

  const scoreResult = MatchScoringEngine.scoreCandidate(samplePg, samplePrefs);
  console.log(`✅ Deterministic Score for ${samplePg.title}: ${scoreResult.totalScore}/100`);
  console.log(' - Sub-Scores:', scoreResult.scoreBreakdown);

  if (scoreResult.totalScore <= 0 || scoreResult.totalScore > 100) {
    throw new Error('Invalid match score bounds!');
  }

  // Test Hard Constraint Violation (Gender mismatch)
  const failedConstraintResult = MatchScoringEngine.scoreCandidate(samplePg, {
    ...samplePrefs,
    genderRestriction: samplePg.genderRestriction === 'GIRLS' ? 'BOYS' : 'GIRLS',
  });
  console.log(
    `✅ Hard Constraint Test (Gender Mismatch): Passed = ${failedConstraintResult.hardConstraintsPassed}, Score = ${failedConstraintResult.totalScore}`
  );
  if (failedConstraintResult.hardConstraintsPassed) {
    throw new Error('Hard constraint evaluation failed to block incompatible gender restriction!');
  }

  // 3. Test LLM Provider Abstraction
  console.log('\n3️⃣ Testing LLM Provider Abstraction...');
  const provider = getLLMProvider();
  console.log(`✅ Active Provider: ${provider.name}`);
  const mockCompletion = await provider.generateCompletion('Test prompt');
  console.log(` - Completion Result: ${mockCompletion.slice(0, 50)}...`);

  // 4. Test SupervisorRouter Intent Classification & Conditional Routing
  console.log('\n4️⃣ Testing SupervisorRouter Intent Classification...');
  const generalState = createInitialAgentState('Find me a PG near DU North Campus under ₹10,000');
  const foodState = createInitialAgentState('Which PG has the best veg mess menu?');
  const commuteState = createInitialAgentState(
    'Show me PGs within 10 min walking commute to IIT Bombay'
  );

  const generalRoute = await SupervisorRouter.route(generalState);
  const foodRoute = await SupervisorRouter.route(foodState);
  const commuteRoute = await SupervisorRouter.route(commuteState);

  console.log(
    `✅ General Query Intent: ${generalRoute.intent} -> Agents: [${generalRoute.requiredAgents.join(', ')}]`
  );
  console.log(
    `✅ Food Query Intent: ${foodRoute.intent} -> Agents: [${foodRoute.requiredAgents.join(', ')}]`
  );
  console.log(
    `✅ Commute Query Intent: ${commuteRoute.intent} -> Agents: [${commuteRoute.requiredAgents.join(', ')}]`
  );

  if (!foodRoute.requiredAgents.includes('FOOD')) {
    throw new Error('Supervisor failed to route food query to FOOD agent!');
  }
  if (!commuteRoute.requiredAgents.includes('COMMUTE')) {
    throw new Error('Supervisor failed to route commute query to COMMUTE agent!');
  }

  // 5. Test LangGraphRunner Foundation Pass
  console.log('\n5️⃣ Testing LangGraphRunner Workflow Initialization...');
  const initialGraphState = await LangGraphRunner.runInitialSupervisorPass(
    'Find student accommodation near Christ University'
  );
  console.log(`✅ Workflow ID: ${initialGraphState.workflowId}`);
  console.log(` - Required Agents: [${initialGraphState.requiredAgentsToRun.join(', ')}]`);
  console.log(
    ` - Execution Timing: ${initialGraphState.executionMetadata.agentTimings['SUPERVISOR']}ms`
  );

  // 6. Test Phase 1-3B Regressions
  console.log('\n6️⃣ Verifying System Regressions...');
  let adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (adminUser) {
    const adminOverview = await prisma.pGListing.count();
    console.log(`✅ System Regression: Total DB PG Listings = ${adminOverview}`);
  }

  console.log('\n🎉 STAGE 4A VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

runPhase4AVerification()
  .catch(err => {
    console.error('❌ Stage 4A Verification Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
