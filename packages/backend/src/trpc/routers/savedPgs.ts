import { z } from 'zod';
import { studentProcedure } from '../trpc';
import { prisma } from '@qrent/shared';

export const savedPgsRouter = {
  toggle: studentProcedure
    .input(z.object({ pgId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.userId;
      const existing = await prisma.savedPG.findUnique({
        where: {
          userId_pgId: {
            userId,
            pgId: input.pgId,
          },
        },
      });

      if (existing) {
        await prisma.savedPG.delete({
          where: {
            userId_pgId: {
              userId,
              pgId: input.pgId,
            },
          },
        });
        return { isSaved: false };
      } else {
        await prisma.savedPG.create({
          data: {
            userId,
            pgId: input.pgId,
          },
        });
        return { isSaved: true };
      }
    }),

  list: studentProcedure.query(async ({ ctx }) => {
    const saved = await prisma.savedPG.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        pg: {
          include: {
            college: true,
            rooms: true,
            photos: { take: 1 },
          },
        },
      },
    });

    return saved.map(s => s.pg);
  }),
};
