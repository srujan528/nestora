import { z } from 'zod';
import { publicProcedure } from '../trpc';
import { prisma } from '@qrent/shared';

export const collegesRouter = {
  list: publicProcedure.query(async () => {
    const colleges = await prisma.college.findMany({
      orderBy: { name: 'asc' },
      include: {
        hostel: true,
      },
    });
    return colleges;
  }),

  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const college = await prisma.college.findUnique({
      where: { id: input.id },
      include: {
        hostel: true,
      },
    });
    return college;
  }),
};
