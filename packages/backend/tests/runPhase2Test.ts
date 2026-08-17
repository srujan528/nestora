import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { prisma } from '@qrent/shared';
import { authService } from '../src/services/AuthService';
import { appRouter } from '../src/trpc/routers';

async function runPhase2Verification() {
  console.log('🚀 Starting Phase 2 End-to-End Verification...');

  // Setup Test Users
  console.log('1️⃣ Registering & Authenticating Users (Student, Owner 1, Owner 2, Admin)...');

  let studentUser = await prisma.user.findFirst({ where: { email: 'teststudent@nestora.in' } });
  if (!studentUser) {
    const res = await authService.register({
      email: 'teststudent@nestora.in',
      password: 'password123',
      name: 'Test Student',
      role: 'STUDENT',
    } as any);
    studentUser = res.user;
  }

  let owner1User = await prisma.user.findFirst({ where: { email: 'testowner1@nestora.in' } });
  if (!owner1User) {
    const res = await authService.register({
      email: 'testowner1@nestora.in',
      password: 'password123',
      name: 'Test Owner One',
      role: 'OWNER',
    } as any);
    owner1User = res.user;
  }

  let owner2User = await prisma.user.findFirst({ where: { email: 'testowner2@nestora.in' } });
  if (!owner2User) {
    const res = await authService.register({
      email: 'testowner2@nestora.in',
      password: 'password123',
      name: 'Test Owner Two',
      role: 'OWNER',
    } as any);
    owner2User = res.user;
  }

  const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!adminUser) {
    throw new Error('Admin user missing in database. Please run seed script.');
  }

  console.log('✅ Users Verified:');
  console.log(` - Student ID: ${studentUser!.id} (${studentUser!.email})`);
  console.log(` - Owner 1 ID: ${owner1User!.id} (${owner1User!.email})`);
  console.log(` - Owner 2 ID: ${owner2User!.id} (${owner2User!.email})`);
  console.log(` - Admin ID: ${adminUser!.id} (${adminUser!.email})`);

  const createCaller = (userObj: any, userId?: number) => {
    return appRouter.createCaller({
      req: {} as any,
      res: {} as any,
      locale: 'en',
      user: userObj,
      userId: userId,
    });
  };

  // Test 1: Server-side RBAC
  console.log('\n2️⃣ Testing Server-Side RBAC Protection...');
  const studentCaller = createCaller(studentUser, studentUser!.id);
  try {
    await studentCaller.pgs.create({
      title: 'Illegal PG Creation',
      collegeId: 1,
      address: '123 Test St',
      locality: 'Test Locality',
      city: 'Delhi',
      pincode: '110007',
      genderRestriction: 'CO_ED',
      minRent: 5000,
      maxRent: 10000,
      securityDeposit: 5000,
      description: 'Should fail with FORBIDDEN',
    });
    console.error('❌ Failed RBAC Test: Student was allowed to create PG listing!');
    process.exit(1);
  } catch (err: any) {
    console.log(`✅ Passed RBAC Test: Student blocked with error "${err.message}"`);
  }

  // Test 2: Owner 1 PG Creation
  console.log('\n3️⃣ Testing Owner PG Creation...');
  const owner1Caller = createCaller(owner1User, owner1User!.id);
  const createdPg = await owner1Caller.pgs.create({
    title: 'Green View Student Residency',
    collegeId: 1,
    address: 'Plot 15, Hudson Lane',
    locality: 'Hudson Lane',
    city: 'New Delhi',
    pincode: '110009',
    genderRestriction: 'BOYS',
    minRent: 9000,
    maxRent: 15000,
    securityDeposit: 10000,
    foodType: 'VEG_ONLY',
    description: 'Premium boys accommodation near DU North Campus with 3 meals daily.',
  });
  console.log(`✅ PG Created Successfully: ID #${createdPg.id} (${createdPg.title}), Status: ${createdPg.status}, isDemoData: ${createdPg.isDemoData}`);

  // Test 3: Ownership Protection
  console.log('\n4️⃣ Testing Server-Side Ownership Protection...');
  const owner2Caller = createCaller(owner2User, owner2User!.id);
  try {
    await owner2Caller.pgs.update({
      id: createdPg.id,
      title: 'Hacked PG Title',
    });
    console.error('❌ Failed Ownership Test: Owner 2 was allowed to modify Owner 1 listing!');
    process.exit(1);
  } catch (err: any) {
    console.log(`✅ Passed Ownership Protection Test: Owner 2 blocked with error "${err.message}"`);
  }

  // Test 4: Room Creation
  console.log('\n5️⃣ Testing Room Creation...');
  const createdRoom = await owner1Caller.rooms.create({
    pgId: createdPg.id,
    roomType: 'DOUBLE_SHARING',
    monthlyRent: 9500,
    securityDeposit: 10000,
    isAc: true,
    hasAttachedBath: true,
    totalBeds: 4,
    availableBeds: 2,
  });
  console.log(`✅ Room Added Successfully: Room ID #${createdRoom.id}, Rent: ₹${createdRoom.monthlyRent}, AC: ${createdRoom.isAc}`);

  // Test 5: Publish PG Listing
  console.log('\n6️⃣ Testing Listing Publication...');
  const publishedPg = await owner1Caller.pgs.updateStatus({
    id: createdPg.id,
    status: 'PUBLISHED',
  });
  console.log(`✅ Listing Status Updated to: ${publishedPg.status}`);

  // Test 6: Saved PGs / Favorites
  console.log('\n7️⃣ Testing Student Saved PGs Flow...');
  const saveResult = await studentCaller.savedPgs.toggle({ pgId: createdPg.id });
  console.log(`✅ Toggled Saved PG: isSaved = ${saveResult.isSaved}`);
  const savedPgsList = await studentCaller.savedPgs.list();
  console.log(`✅ Saved PGs Count: ${savedPgsList.length} listings saved by student.`);

  // Test 7: Inquiry Flow
  console.log('\n8️⃣ Testing Student Inquiry Submission & Owner Response...');
  const inquiry = await studentCaller.inquiries.create({
    pgId: createdPg.id,
    message: 'Hi, I want to visit this PG tomorrow for admission in DU North Campus.',
    preferredRoomType: 'DOUBLE_SHARING',
    moveInDate: '2026-09-01',
  });
  console.log(`✅ Inquiry Submitted: ID #${inquiry.id}, Status: ${inquiry.status}`);

  const ownerInquiries = await owner1Caller.inquiries.getOwnerInquiries();
  console.log(`✅ Owner Received ${ownerInquiries.length} Inquiries.`);

  const updatedInquiry = await owner1Caller.inquiries.updateStatus({
    id: inquiry.id,
    status: 'CONTACTED',
  });
  console.log(`✅ Owner Updated Inquiry Status to: ${updatedInquiry.status}`);

  // Test 8: Admin Foundation
  console.log('\n9️⃣ Testing Admin Overview & Auditing...');
  const adminCaller = createCaller(adminUser, adminUser.id);
  const overview = await adminCaller.admin.getOverview();
  console.log('✅ Admin Overview Metrics:');
  console.log(` - Total Users: ${overview.users.total} (Students: ${overview.users.students}, Owners: ${overview.users.owners})`);
  console.log(` - Total Listings: ${overview.listings.total} (Real: ${overview.listings.real}, Demo: ${overview.listings.demo})`);
  console.log(` - Verified Listings: ${overview.listings.verified}`);

  console.log('\n🎉 ALL PHASE 2 VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

runPhase2Verification()
  .catch((err) => {
    console.error('❌ Phase 2 Verification Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
