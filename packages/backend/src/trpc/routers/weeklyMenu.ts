import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { ownerProcedure } from '../trpc';
import { prisma } from '@qrent/shared';

export const weeklyMenuRouter = {
  upsert: ownerProcedure
    .input(
      z.object({
        pgId: z.number(),
        monday: z.string(),
        tuesday: z.string(),
        wednesday: z.string(),
        thursday: z.string(),
        friday: z.string(),
        saturday: z.string(),
        sunday: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const pg = await prisma.pGListing.findUnique({ where: { id: input.pgId } });
      if (!pg) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'PG listing not found' });
      }

      if (pg.ownerId !== ctx.userId && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to manage menu for this PG',
        });
      }

      const { pgId, ...menuData } = input;
      const menu = await prisma.weeklyMenu.upsert({
        where: { pgId },
        update: menuData,
        create: {
          pgId,
          ...menuData,
        },
      });

      return menu;
    }),
};
