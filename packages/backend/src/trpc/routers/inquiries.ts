import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { studentProcedure, ownerProcedure } from '../trpc';
import { prisma } from '@qrent/shared';

const roomTypeEnum = z.enum([
  'SINGLE',
  'DOUBLE_SHARING',
  'TRIPLE_SHARING',
  'FOUR_SHARING',
  'PRIVATE_ROOM',
  'FULL_FLAT',
]);
const inquiryStatusEnum = z.enum(['PENDING', 'CONTACTED', 'SCHEDULED_VISIT', 'CLOSED']);

export const inquiriesRouter = {
  create: studentProcedure
    .input(
      z.object({
        pgId: z.number(),
        message: z.string().min(5).max(1000),
        preferredRoomType: roomTypeEnum.optional(),
        moveInDate: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const pg = await prisma.pGListing.findUnique({ where: { id: input.pgId } });
      if (!pg) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'PG listing not found' });
      }

      const inquiry = await prisma.inquiry.create({
        data: {
          pgId: input.pgId,
          userId: ctx.userId,
          message: input.message,
          preferredRoomType: (input.preferredRoomType as any) || null,
          moveInDate: input.moveInDate ? new Date(input.moveInDate) : null,
          status: 'PENDING' as any,
        },
        include: {
          pg: { select: { title: true } },
        },
      });

      return inquiry;
    }),

  getStudentInquiries: studentProcedure.query(async ({ ctx }) => {
    const inquiries = await prisma.inquiry.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        pg: {
          include: {
            college: true,
            photos: { take: 1 },
          },
        },
      },
    });

    return inquiries;
  }),

  getOwnerInquiries: ownerProcedure.query(async ({ ctx }) => {
    const where = ctx.user.role === 'ADMIN' ? {} : { pg: { ownerId: ctx.userId } };
    const inquiries = await prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        pg: { select: { id: true, title: true, isDemoData: true } },
      },
    });

    return inquiries;
  }),

  updateStatus: ownerProcedure
    .input(
      z.object({
        id: z.number(),
        status: inquiryStatusEnum,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const inquiry = await prisma.inquiry.findUnique({
        where: { id: input.id },
        include: { pg: true },
      });

      if (!inquiry) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Inquiry not found' });
      }

      if (inquiry.pg.ownerId !== ctx.userId && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to manage this inquiry',
        });
      }

      const updated = await prisma.inquiry.update({
        where: { id: input.id },
        data: { status: input.status as any },
      });

      return updated;
    }),
};
