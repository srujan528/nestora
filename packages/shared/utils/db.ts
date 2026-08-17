import { prisma } from '../prisma/client';

async function clearDb() {
  await prisma.inquiry.deleteMany();
  await prisma.review.deleteMany();
  await prisma.savedPG.deleteMany();
  await prisma.weeklyMenu.deleteMany();
  await prisma.pGAmenity.deleteMany();
  await prisma.pGPhoto.deleteMany();
  await prisma.room.deleteMany();
  await prisma.pGListing.deleteMany();
  await prisma.hostel.deleteMany();
  await prisma.college.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.user.deleteMany();
}

export { clearDb };
