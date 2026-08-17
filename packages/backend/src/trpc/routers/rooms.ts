import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { ownerProcedure } from '../trpc';
import { prisma } from '@qrent/shared';

export const roomsRouter = {
  create: ownerProcedure
    .input(
      z.object({
        pgId: z.number(),
        roomType: z.enum(['SINGLE', 'DOUBLE_SHARING', 'TRIPLE_SHARING', 'FOUR_SHARING', 'PRIVATE_ROOM', 'FULL_FLAT']),
        monthlyRent: z.number().positive(),
        securityDeposit: z.number().nonnegative(),
        isAc: z.boolean().default(false),
        hasAttachedBath: z.boolean().default(false),
        totalBeds: z.number().int().positive(),
        availableBeds: z.number().int().nonnegative(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const pg = await prisma.pGListing.findUnique({ where: { id: input.pgId } });
      if (!pg) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'PG listing not found' });
      }

      if (pg.ownerId !== ctx.userId && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized to manage rooms for this PG' });
      }

      const room = await prisma.room.create({
        data: {
          ...input,
          roomType: input.roomType as any,
          description: input.description || null,
        },
      });

      return room;
    }),

  update: ownerProcedure
    .input(
      z.object({
        id: z.number(),
        roomType: z.enum(['SINGLE', 'DOUBLE_SHARING', 'TRIPLE_SHARING', 'FOUR_SHARING', 'PRIVATE_ROOM', 'FULL_FLAT']).optional(),
        monthlyRent: z.number().positive().optional(),
        securityDeposit: z.number().nonnegative().optional(),
        isAc: z.boolean().optional(),
        hasAttachedBath: z.boolean().optional(),
        totalBeds: z.number().int().positive().optional(),
        availableBeds: z.number().int().nonnegative().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const room = await prisma.room.findUnique({
        where: { id: input.id },
        include: { pg: true },
      });
      if (!room) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Room not found' });
      }

      if (room.pg.ownerId !== ctx.userId && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized to edit this room' });
      }

      const { id, ...data } = input;
      const updated = await prisma.room.update({
        where: { id },
        data: data as any,
      });

      return updated;
    }),

  delete: ownerProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const room = await prisma.room.findUnique({
        where: { id: input.id },
        include: { pg: true },
      });
      if (!room) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Room not found' });
      }

      if (room.pg.ownerId !== ctx.userId && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized to delete this room' });
      }

      await prisma.room.delete({ where: { id: input.id } });
      return { success: true };
    }),
};
