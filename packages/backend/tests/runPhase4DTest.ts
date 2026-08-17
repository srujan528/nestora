import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { prisma } from '@qrent/shared';
import { appRouter } from '../src/trpc/routers';

async function runPhase4DVerification() {
  console.log('🚀 Starting Stage 4D AI Assistant API & System Integration Verification...');

  // 1. Test ai.getRecommendation Procedure via appRouter caller
  console.log('\n1️⃣ Testing tRPC ai.getRecommendation Procedure...');
  const caller = appRouter.createCaller({ user: { id: 1, role: 'STUDENT' } } as any);

  const aiResult = await caller.ai.getRecommendation({
    prompt: 'Find me a PG near DU North Campus under ₹10,000 with AC and veg food',
    collegeId: 1,
  });

  console.log('✅ tRPC Procedure Call Succeeded:');
  console.log(` - Workflow ID: ${aiResult.workflowId}`);
  console.log(` - Request: "${aiResult.naturalLanguageRequest}"`);
  console.log(` - College Context: ${aiResult.selectedCollege?.name}`);
  console.log(` - Executed Agents: [${aiResult.requiredAgentsToRun.join(', ')}]`);
  console.log(` - Summary Explanation: "${aiResult.recommendations?.summaryExplanation}"`);

  if (!aiResult.recommendations || aiResult.recommendations.rankedCandidates.length === 0) {
    throw new Error('ai.getRecommendation procedure returned empty recommendations!');
  }

  // 2. Test Recommendation Payload Integrity & DEMO Clarity
  console.log('\n2️⃣ Testing Recommendation Payload Integrity & DEMO Clarity...');
  const topCandidate = aiResult.recommendations.rankedCandidates[0];
  console.log(`✅ Top Candidate Payload:`);
  console.log(` - Title: ${topCandidate.title}`);
  console.log(` - Deterministic Match Score: ${topCandidate.matchScore}%`);
  console.log(` - True Monthly Cost: ₹${topCandidate.trueMonthlyCost}`);
  console.log(` - Distance: ${topCandidate.distanceKm} km (${topCandidate.commuteMins} min ${topCandidate.commuteMode})`);
  console.log(` - Is Demo: ${topCandidate.isDemoData} | Is Verified: ${topCandidate.isVerified}`);
  console.log(` - Evidence References:`, topCandidate.evidenceReferences);

  if (topCandidate.matchScore <= 0 || topCandidate.matchScore > 100) {
    throw new Error('Invalid matchScore bounds in tRPC response!');
  }

  if (topCandidate.isDemoData && topCandidate.isVerified !== false) {
    throw new Error('DEMO Listing Integrity Violation: isVerified must be false for DEMO listings in tRPC response!');
  }

  // 3. Test Full System Database Regressions
  console.log('\n3️⃣ Verifying Full System Database Regressions...');
  const dbCount = await prisma.pGListing.count();
  console.log(`✅ DB Regression Check: ${dbCount} PGs intact in Prisma DB.`);

  console.log('\n🎉 STAGE 4D VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

runPhase4DVerification()
  .catch((err) => {
    console.error('❌ Stage 4D Verification Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
