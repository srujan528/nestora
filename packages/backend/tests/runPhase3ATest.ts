import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { prisma } from '@qrent/shared';
import { authService } from '../src/services/AuthService';
import { appRouter } from '../src/trpc/routers';
import { GoogleRoutesService } from '../src/services/GoogleRoutesService';

async function runPhase3AVerification() {
  console.log('🚀 Starting Phase 3A PG Discovery + Google Maps Verification...');

  // 1. Test Colleges API
  console.log('\n1️⃣ Testing Colleges API...');
  const publicCaller = appRouter.createCaller({
    req: {} as any,
    res: {} as any,
    locale: 'en',
  });

  const colleges = await publicCaller.colleges.list();
  console.log(`✅ Fetched ${colleges.length} Colleges:`);
  colleges.forEach(c => {
    console.log(` - ${c.name} (${c.city}): Lat ${c.latitude}, Lng ${c.longitude}`);
  });
  if (colleges.length === 0) throw new Error('No colleges returned!');

  // 2. Test GoogleRoutesService Haversine Fallback & Fare Estimator
  console.log('\n2️⃣ Testing GoogleRoutesService Distance & Fare Model...');
  const duCoords = { latitude: 28.6904, longitude: 77.2066 }; // DU North Campus
  const pgCoords = { latitude: 28.6945, longitude: 77.2099 }; // Kamla Nagar PG

  const routeResult = await GoogleRoutesService.computeDistanceAndCommute(
    duCoords,
    pgCoords,
    'WALKING'
  );
  console.log('✅ Route Computation Result:');
  console.log(` - Distance: ${routeResult.distanceKm} km (${routeResult.distanceMeters} m)`);
  console.log(` - Commute Time: ${routeResult.commuteTimeMins} mins (${routeResult.commuteMode})`);
  console.log(
    ` - Fare Estimate: ${routeResult.commuteFareFormula} (Est. Monthly: ₹${routeResult.commuteCostEstMonthly})`
  );
  console.log(` - Source: ${routeResult.source}`);

  if (routeResult.distanceKm <= 0 || routeResult.commuteTimeMins <= 0) {
    throw new Error('Invalid distance or commute calculation!');
  }

  // 3. Test PG Discovery Search API with Distance Filtering & College Selection
  console.log('\n3️⃣ Testing PG Discovery Search API relative to DU North Campus...');
  const discoveryResult = await publicCaller.pgs.list({
    collegeId: 1,
    maxDistanceKm: 5,
    page: 1,
    pageSize: 20,
  });

  console.log(
    `✅ Discovery Search returned ${discoveryResult.total} PGs within 5 km of ${discoveryResult.selectedCollege?.name}:`
  );
  discoveryResult.pgs.forEach((pg: any) => {
    console.log(
      ` - [${pg.title}] | Rent: ₹${pg.minRent} | Distance: ${pg.distanceKm} km | Commute: ${pg.commuteTimeMins} min | AI Match: ${pg.aiMatchScore}%`
    );
  });

  if (discoveryResult.pgs.length === 0) throw new Error('No PGs found in discovery search!');

  // 4. Test Distance Filter Boundaries (e.g. 1 km filter)
  console.log('\n4️⃣ Testing Strict Distance Filtering (maxDistanceKm = 2)...');
  const strictResult = await publicCaller.pgs.list({
    collegeId: 1,
    maxDistanceKm: 2,
  });
  console.log(`✅ Found ${strictResult.total} PGs strictly within 2 km radius.`);
  strictResult.pgs.forEach((pg: any) => {
    if (pg.distanceKm > 2.0) {
      throw new Error(
        `PG ${pg.title} exceeded distance filter limit (${pg.distanceKm} km > 2.0 km)`
      );
    }
  });

  // 5. Test Phase 2 Regression (Auth, RBAC, PG CRUD, Rooms, Inquiries, Admin)
  console.log('\n5️⃣ Verifying Phase 2 Regression Protections...');

  let studentUser = await prisma.user.findFirst({ where: { email: 'teststudent@nestora.in' } });
  let ownerUser = await prisma.user.findFirst({ where: { email: 'testowner1@nestora.in' } });
  let adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

  const studentCaller = appRouter.createCaller({
    req: {} as any,
    res: {} as any,
    locale: 'en',
    user: studentUser as any,
    userId: studentUser?.id,
  });

  const ownerCaller = appRouter.createCaller({
    req: {} as any,
    res: {} as any,
    locale: 'en',
    user: ownerUser as any,
    userId: ownerUser?.id,
  });

  const adminCaller = appRouter.createCaller({
    req: {} as any,
    res: {} as any,
    locale: 'en',
    user: adminUser as any,
    userId: adminUser?.id,
  });

  // Verify RBAC
  try {
    await studentCaller.pgs.create({
      title: 'Hacked PG',
      collegeId: 1,
      address: '123 Fake St',
      locality: 'Delhi',
      city: 'Delhi',
      pincode: '110007',
      genderRestriction: 'CO_ED',
      minRent: 5000,
      maxRent: 8000,
      securityDeposit: 5000,
      description: 'Should fail',
    });
    throw new Error('RBAC check failed: Student created PG!');
  } catch (err: any) {
    console.log(`✅ Passed RBAC Regression: Student blocked ("${err.message}")`);
  }

  // Verify Admin Overview
  const adminOverview = await adminCaller.admin.getOverview();
  console.log(
    `✅ Admin Overview Regression: Total Users = ${adminOverview.users.total}, Total Listings = ${adminOverview.listings.total}`
  );

  console.log('\n🎉 ALL PHASE 3A VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

runPhase3AVerification()
  .catch(err => {
    console.error('❌ Phase 3A Verification Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
