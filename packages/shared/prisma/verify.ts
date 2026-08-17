import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ include: { studentProfile: true } });
  const colleges = await prisma.college.findMany({ include: { hostel: true, pgListings: true } });
  const hostels = await prisma.hostel.findMany();
  const pgListings = await prisma.pGListing.findMany({
    include: { rooms: true, photos: true, amenities: true, weeklyMenu: true, reviews: true },
  });
  const rooms = await prisma.room.findMany();
  const photos = await prisma.pGPhoto.findMany();
  const amenities = await prisma.pGAmenity.findMany();
  const menus = await prisma.weeklyMenu.findMany();
  const reviews = await prisma.review.findMany();

  console.log('=====================================================');
  console.log('       NESTORA (PGFINDER) PHASE 1 VERIFICATION       ');
  console.log('=====================================================');
  console.log(`1. Total Users: ${users.length}`);
  users.forEach(u => console.log(`   - [${u.role}] ${u.name} (${u.email})`));

  console.log(`\n2. Student Profiles: ${users.filter(u => u.studentProfile).length}`);
  users
    .filter(u => u.studentProfile)
    .forEach(u => {
      const sp = u.studentProfile!;
      console.log(
        `   - User #${u.id}: Min ₹${sp.minBudget}, Max ₹${sp.maxBudget}, Food: ${sp.foodPreference}, Max Commute: ${sp.maxCommuteTimeMins} mins`
      );
    });

  console.log(`\n3. Colleges: ${colleges.length}`);
  colleges.forEach(c =>
    console.log(`   - ${c.name} (${c.shortName || 'N/A'}) - ${c.city}, ${c.state}`)
  );

  console.log(
    `\n4. Hostels: ${hostels.length} (All isDemoData = ${hostels.every(h => h.isDemoData)})`
  );
  hostels.forEach(h =>
    console.log(
      `   - Hostel #${h.id}: Fee ₹${h.monthlyRentEquivalent}/mo, Total ₹${h.totalMonthlyCost}/mo, Gender: ${h.genderRestriction}`
    )
  );

  console.log(
    `\n5. PG Listings: ${pgListings.length} (All isDemoData = ${pgListings.every(p => p.isDemoData)})`
  );
  pgListings.forEach(p =>
    console.log(
      `   - ${p.title} (₹${p.minRent}-₹${p.maxRent}/mo) - ${p.genderRestriction}, Rating: ${p.averageRating}`
    )
  );

  console.log(`\n6. Rooms: ${rooms.length}`);
  rooms.forEach(r =>
    console.log(
      `   - Room #${r.id} (PG #${r.pgId}): ${r.roomType}, ₹${r.monthlyRent}/mo, Beds: ${r.availableBeds}/${r.totalBeds}`
    )
  );

  console.log(`\n7. Photos: ${photos.length}`);
  const categories = [...new Set(photos.map(p => p.category))];
  console.log(`   - Categories represented: ${categories.join(', ')}`);

  console.log(`\n8. Amenities: ${amenities.length}`);
  console.log(`\n9. Weekly Menus: ${menus.length}`);
  console.log(`\n10. Verified Test Reviews: ${reviews.length}`);
  reviews.forEach(r => console.log(`   - Review #${r.id}: Rating ${r.rating}/5 - "${r.comment}"`));
  console.log('=====================================================');
}

main()
  .catch(e => {
    console.error('Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
