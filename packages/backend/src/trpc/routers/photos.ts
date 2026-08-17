import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { ownerProcedure } from '../trpc';
import { prisma } from '@qrent/shared';

const photoCategoryEnum = z.enum([
  'ROOM',
  'BATHROOM',
  'KITCHEN',
  'DINING',
  'COMMON_AREA',
  'EXTERIOR',
  'BUILDING',
]);

export const photosRouter = {
  add: ownerProcedure
    .input(
      z.object({
        pgId: z.number(),
        url: z.string().min(1),
        category: photoCategoryEnum.default('ROOM'),
        caption: z.string().optional(),
        roomId: z.number().optional(),
        displayOrder: z.number().default(0),
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
          message: 'Not authorized to add photos to this PG',
        });
      }

      const photo = await prisma.pGPhoto.create({
        data: {
          pgId: input.pgId,
          url: input.url,
          category: input.category as any,
          caption: input.caption || null,
          roomId: input.roomId || null,
          displayOrder: input.displayOrder,
        },
      });

      return photo;
    }),

  delete: ownerProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    const photo = await prisma.pGPhoto.findUnique({
      where: { id: input.id },
      include: { pg: true },
    });
    if (!photo) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Photo not found' });
    }

    if (photo.pg.ownerId !== ctx.userId && ctx.user.role !== 'ADMIN') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized to delete this photo' });
    }

    await prisma.pGPhoto.delete({ where: { id: input.id } });
    return { success: true };
  }),
};
