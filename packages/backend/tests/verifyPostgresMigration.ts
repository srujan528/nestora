import { prisma } from '@qrent/shared/prisma/client';

async function verifyMigration() {
  console.log('🔍 Verifying Aiven PostgreSQL Database Migration...');

  const usersCount = await prisma.user.count();
  const studentProfilesCount = await prisma.studentProfile.count();
  const collegesCount = await prisma.college.count();
  const pgListingsCount = await prisma.pGListing.count();
  const roomsCount = await prisma.room.count();
  const photosCount = await prisma.pGPhoto.count();
  const amenitiesCount = await prisma.pGAmenity.count();
  const weeklyMenusCount = await prisma.weeklyMenu.count();
  const reviewsCount = await prisma.review.count();
  const savedPGsCount = await prisma.savedPG.count();
  const inquiriesCount = await prisma.inquiry.count();
  const hostelsCount = await prisma.hostel.count();

  console.log('📊 Aiven PostgreSQL Model Counts:');
  console.log(`- Users: ${usersCount}`);
  console.log(`- Student Profiles: ${studentProfilesCount}`);
  console.log(`- Colleges: ${collegesCount}`);
  console.log(`- PG Listings: ${pgListingsCount}`);
  console.log(`- Rooms: ${roomsCount}`);
  console.log(`- PG Photos: ${photosCount}`);
  console.log(`- PG Amenities: ${amenitiesCount}`);
  console.log(`- Weekly Menus: ${weeklyMenusCount}`);
  console.log(`- Reviews: ${reviewsCount}`);
  console.log(`- Saved PGs: ${savedPGsCount}`);
  console.log(`- Inquiries: ${inquiriesCount}`);
  console.log(`- Hostels: ${hostelsCount}`);

  // Fetch sample PG with relations
  const samplePg = await prisma.pGListing.findFirst({
    where: { isVerified: true },
    include: {
      owner: true,
      college: true,
      rooms: true,
      photos: true,
      amenities: true,
      weeklyMenu: true,
      reviews: { include: { user: true } },
    },
  });

  if (samplePg) {
    console.log(`\n✅ Verified sample PG query: "${samplePg.title}" at ${samplePg.locality}`);
    console.log(`  Owner: ${samplePg.owner.name} (${samplePg.owner.email})`);
    console.log(`  College Proximity: ${samplePg.college.name}`);
    console.log(`  Rooms: ${samplePg.rooms.length}, Photos: ${samplePg.photos.length}, Amenities: ${samplePg.amenities.length}`);
    console.log(`  Reviews: ${samplePg.reviews.length}`);
  } else {
    throw new Error('❌ Sample PG listing not found in PostgreSQL!');
  }

  console.log('\n🎉 ALL POSTGRESQL DATA VERIFICATIONS PASSED!');
  await prisma.$disconnect();
}

verifyMigration().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
