import { adminProcedure } from '../trpc';
import { prisma } from '@qrent/shared';

export const adminRouter = {
  getOverview: adminProcedure.query(async () => {
    const totalUsers = await prisma.user.count();
    const studentCount = await prisma.user.count({ where: { role: 'STUDENT' } });
    const ownerCount = await prisma.user.count({ where: { role: 'OWNER' } });
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });

    const totalListings = await prisma.pGListing.count();
    const demoListings = await prisma.pGListing.count({ where: { isDemoData: true } });
    const realListings = await prisma.pGListing.count({ where: { isDemoData: false } });
    const verifiedListings = await prisma.pGListing.count({ where: { isVerified: true } });
    const pendingVerification = await prisma.pGListing.count({ where: { isVerified: false, isDemoData: false } });

    return {
      users: {
        total: totalUsers,
        students: studentCount,
        owners: ownerCount,
        admins: adminCount,
      },
      listings: {
        total: totalListings,
        demo: demoListings,
        real: realListings,
        verified: verifiedListings,
        pendingVerification,
      },
    };
  }),

  listUsers: adminProcedure.query(async () => {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
    return users;
  }),

  listListings: adminProcedure.query(async () => {
    const listings = await prisma.pGListing.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        college: { select: { name: true, city: true } },
      },
    });
    return listings;
  }),
};
