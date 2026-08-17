import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { ownerProcedure } from '../trpc';
import { prisma } from '@qrent/shared';

export const amenitiesRouter = {
  update: ownerProcedure
    .input(
      z.object({
        pgId: z.number(),
        amenities: z.array(
          z.object({
            name: z.string().min(1),
            category: z.string().default('General'),
            icon: z.string().optional(),
          })
        ),
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
          message: 'Not authorized to manage amenities for this PG',
        });
      }

      await prisma.pGAmenity.deleteMany({ where: { pgId: input.pgId } });
      await prisma.pGAmenity.createMany({
        data: input.amenities.map(a => ({
          pgId: input.pgId,
          name: a.name,
          category: a.category,
          icon: a.icon || null,
        })),
      });

      const updated = await prisma.pGAmenity.findMany({ where: { pgId: input.pgId } });
      return updated;
    }),
};
