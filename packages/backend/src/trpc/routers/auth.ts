import { z } from 'zod';
import { publicProcedure, protectedProcedure } from '../trpc';
import { authService } from '../../services/AuthService';
import { prisma } from '@qrent/shared';

export const authRouter = {
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(1).max(100),
        role: z.enum(['STUDENT', 'OWNER']).default('STUDENT'),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await authService.register(input as any);
      return result;
    }),

  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const result = await authService.login(input);
      return result;
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        studentProfile: true,
      },
    });
    return user;
  }),

  changeProfile: protectedProcedure
    .input(
      z.object({
        oldPassword: z.string().min(1),
        password: z.string().min(6).optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const updateData: Record<string, any> = {};
      if (input.password !== undefined) updateData.password = input.password;
      if (input.phone !== undefined) updateData.phone = input.phone;
      if (input.email !== undefined) updateData.email = input.email;

      const profile = await authService.changeAuthProfile(
        ctx.userId!,
        input.oldPassword,
        updateData as any
      );
      return profile;
    }),
};

export type AuthRouter = typeof authRouter;
