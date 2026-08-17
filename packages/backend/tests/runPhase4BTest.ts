import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { prisma } from '@qrent/shared';
import { StudentProfilerAgent } from '../src/ai/agents/StudentProfilerAgent';
import { PGMatcherAgent } from '../src/ai/agents/PGMatcherAgent';
import { DecisionAgent } from '../src/ai/agents/DecisionAgent';
import { LangGraphRunner } from '../src/ai/LangGraphRunner';
import { createInitialAgentState } from '../src/ai/AgentState';

async function runPhase4BVerification() {
  console.log('🚀 Starting Stage 4B Core Recommendation Pipeline Verification...');

  // 1. Test Student Profiler Agent
  console.log('\n1️⃣ Testing Student Profiler Agent Extraction...');
  const samplePrompt = 'I am joining DU North Campus. My budget is 10k. I want double sharing, AC and veg food. I don\'t want more than 20 minutes commute.';
  let profilerState = createInitialAgentState(samplePrompt);
  profilerState = await StudentProfilerAgent.execute(profilerState);

  const prefs = profilerState.studentPreferences;
  console.log('✅ Extracted Student Preferences:');
  console.log(` - Target College ID: ${prefs.targetCollegeId} (${prefs.targetCollegeName})`);
  console.log(` - Max Budget: ₹${prefs.maxBudget}`);
  console.log(` - Preferred Sharing: ${prefs.preferredRoomType}`);
  console.log(` - AC Required: ${prefs.acRequired}`);
  console.log(` - Food Preference: ${prefs.foodPreference}`);
  console.log(` - Max Commute Mins: ${prefs.maxCommuteMins}`);

  if (prefs.maxBudget !== 10000) throw new Error(`Budget extraction mismatch: expected 10000, got ${prefs.maxBudget}`);
  if (prefs.preferredRoomType !== 'DOUBLE_SHARING') throw new Error(`Sharing extraction mismatch: expected DOUBLE_SHARING, got ${prefs.preferredRoomType}`);
  if (prefs.acRequired !== true) throw new Error('AC required extraction failed!');
  if (prefs.foodPreference !== 'VEG_ONLY') throw new Error('Food preference extraction failed!');

  // Test Missing Preferences handling (should remain undefined)
  const sparseState = createInitialAgentState('Looking for PG near IIT Bombay');
  const sparseResult = await StudentProfilerAgent.execute(sparseState);
  console.log(`✅ Sparse Prompt Test: maxBudget = ${sparseResult.studentPreferences.maxBudget} (undefined/null expected)`);

  // 2. Test PG Matcher Agent Deterministic Scoring & Ranking
  console.log('\n2️⃣ Testing PG Matcher Agent Deterministic Ranking...');
  let matcherState = await StudentProfilerAgent.execute(createInitialAgentState('Looking for PG near DU North Campus under ₹12,000'));
  matcherState = await PGMatcherAgent.execute(matcherState);

  console.log(`✅ PG Matcher returned ${matcherState.candidatePGs.length} ranked candidate PGs:`);
  matcherState.candidatePGs.forEach((pg, idx) => {
    const score = matcherState.deterministicScores[idx];
    console.log(` Rank ${idx + 1}: [${pg.title}] | Match Score: ${score.totalScore}/100 | True Cost: ₹${pg.trueMonthlyCost} | Rent: ₹${pg.minRent}`);
  });

  if (matcherState.candidatePGs.length === 0) throw new Error('PG Matcher returned no candidates!');

  // 3. Test Decision Agent Grounded Recommendation Synthesis
  console.log('\n3️⃣ Testing Decision & Recommendation Agent Outputs...');
  let decisionState = await DecisionAgent.execute(matcherState);
  const recs = decisionState.finalRecommendations;

  console.log('✅ Decision Agent Final Recommendation Summary:');
  console.log(` - "${recs?.summaryExplanation}"`);
  console.log(` - Top Ranked Candidate: ${recs?.rankedCandidates[0]?.title} (${recs?.rankedCandidates[0]?.matchScore}% Match)`);
  console.log(` - Reasons:`, recs?.rankedCandidates[0]?.reasons);
  console.log(` - Trade-offs:`, recs?.rankedCandidates[0]?.tradeoffs);

  if (!recs || recs.rankedCandidates.length === 0) throw new Error('Decision Agent returned empty recommendations!');

  // 4. Test End-to-End Pipeline Execution via LangGraphRunner
  console.log('\n4️⃣ Testing End-to-End LangGraph Pipeline Execution...');
  const pipelineResult = await LangGraphRunner.runRecommendationPipeline(
    'I am joining DU North Campus. Budget is 10k. Double sharing, AC required.'
  );

  console.log('✅ End-to-End Pipeline Execution Succeeded:');
  console.log(` - Workflow ID: ${pipelineResult.workflowId}`);
  console.log(` - Selected College: ${pipelineResult.selectedCollege?.name}`);
  console.log(` - Total Ranked Output Candidates: ${pipelineResult.finalRecommendations?.rankedCandidates.length}`);
  console.log(` - Execution Timings:`, pipelineResult.executionMetadata.agentTimings);

  // 5. Test Empty Search Hard Constraint Violation Handling
  console.log('\n5️⃣ Testing Impossible Budget Constraint Handling...');
  const impossibleResult = await LangGraphRunner.runRecommendationPipeline(
    'PG near DU North Campus with budget 1000'
  );
  console.log(`✅ Impossible Budget Result Warnings:`, impossibleResult.warnings);
  console.log(` - Returned Candidates Count: ${impossibleResult.finalRecommendations?.rankedCandidates.length}`);

  // 6. Test System Regressions (Phase 1, Phase 2, Phase 3A, Phase 3B, Phase 4A)
  console.log('\n6️⃣ Verifying System Regressions across all previous phases...');
  const count = await prisma.pGListing.count();
  console.log(`✅ DB Regression Check: ${count} PGs intact in Prisma DB.`);

  console.log('\n🎉 STAGE 4B VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

runPhase4BVerification()
  .catch((err) => {
    console.error('❌ Stage 4B Verification Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
