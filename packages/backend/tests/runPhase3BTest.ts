import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { prisma, calculateTrueMonthlyCost } from '@qrent/shared';
import { appRouter } from '../src/trpc/routers';

async function runPhase3BVerification() {
  console.log('🚀 Starting Phase 3B PG True Monthly Cost + PG-to-PG Comparison Verification...');

  // 1. Test True Monthly Cost Calculator Utility
  console.log('\n1️⃣ Testing True Monthly Cost Calculator Utility...');
  const testBreakdown = calculateTrueMonthlyCost({
    minRent: 9000,
    foodIncludedInRent: true,
    extraFoodCharges: 0,
    estElectricityMonthly: 800,
    estMaintenanceMonthly: 200,
    commuteCostEstMonthly: 300,
  });

  console.log('✅ True Monthly Cost Output:');
  console.log(` - Base Rent: ₹${testBreakdown.baseRent}`);
  console.log(` - Food Cost: ₹${testBreakdown.foodCost}`);
  console.log(` - Electricity Cost: ₹${testBreakdown.electricityCost}`);
  console.log(` - Maintenance Cost: ₹${testBreakdown.maintenanceCost}`);
  console.log(` - Commute Cost: ₹${testBreakdown.commuteCost}`);
  console.log(` - Total True Monthly Cost: ₹${testBreakdown.totalMonthlyCost}`);

  if (testBreakdown.totalMonthlyCost !== 10300) {
    throw new Error(`Cost calculation mismatch: expected 10300, got ${testBreakdown.totalMonthlyCost}`);
  }

  // 2. Test tRPC pgs.list Enriched True Monthly Cost Output
  console.log('\n2️⃣ Testing pgs.list API with True Monthly Cost...');
  const publicCaller = appRouter.createCaller({
    req: {} as any,
    res: {} as any,
    locale: 'en',
  });

  const discoveryResult = await publicCaller.pgs.list({
    collegeId: 1, // DU North Campus
    maxDistanceKm: 10,
  });

  console.log(`✅ Fetched ${discoveryResult.total} PGs enriched with True Monthly Cost:`);
  discoveryResult.pgs.forEach((pg: any) => {
    console.log(` - [${pg.title}] | Base Rent: ₹${pg.minRent} | True Monthly Cost: ₹${pg.trueMonthlyCost} | Commute: ₹${pg.commuteCostEstMonthly}`);
    if (!pg.trueMonthlyCost || !pg.trueMonthlyCostBreakdown) {
      throw new Error(`PG ${pg.title} missing trueMonthlyCost payload!`);
    }
  });

  // 3. Test tRPC pgs.getById Enriched True Monthly Cost Output
  console.log('\n3️⃣ Testing pgs.getById API with True Monthly Cost Breakdown...');
  const firstPg = discoveryResult.pgs[0];
  const singlePg = await publicCaller.pgs.getById({ id: firstPg.id });

  console.log(`✅ Single PG Details (${singlePg.title}):`);
  console.log(` - Total True Monthly Cost: ₹${(singlePg as any).trueMonthlyCost}`);
  console.log(` - Breakdown:`, (singlePg as any).trueMonthlyCostBreakdown);

  if (!(singlePg as any).trueMonthlyCost) {
    throw new Error('getById returned invalid trueMonthlyCost!');
  }

  // 4. Test Multi-PG Side-by-Side Comparison Simulation
  console.log('\n4️⃣ Testing Multi-PG Side-by-Side Comparison Data Structure...');
  if (discoveryResult.pgs.length >= 2) {
    const compareSet = discoveryResult.pgs.slice(0, 2);
    console.log(`✅ Side-by-Side Comparison Payload (${compareSet.length} PGs):`);
    compareSet.forEach((p: any, idx: number) => {
      console.log(` PG ${idx + 1}: ${p.title} | True Cost: ₹${p.trueMonthlyCost} | Beds Open: ${p.rooms?.reduce((acc: number, r: any) => acc + r.availableBeds, 0)}`);
    });
  }

  // 5. Test Phase 2 & 3A Regressions
  console.log('\n5️⃣ Verifying System Regressions...');
  let adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const adminCaller = appRouter.createCaller({
    req: {} as any,
    res: {} as any,
    locale: 'en',
    user: adminUser as any,
    userId: adminUser?.id,
  });

  const adminOverview = await adminCaller.admin.getOverview();
  console.log(`✅ Admin Overview Regression: Total Users = ${adminOverview.users.total}, Total Listings = ${adminOverview.listings.total}`);

  console.log('\n🎉 ALL PHASE 3B VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

runPhase3BVerification()
  .catch((err) => {
    console.error('❌ Phase 3B Verification Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
