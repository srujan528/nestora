import { z } from 'zod';
import { protectedProcedure } from '../trpc';
import { userService } from '../../services/UserService';

export const usersRouter = {
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const profile = await userService.getProfile(ctx.userId!);
    return profile;
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const profile = await userService.updateProfile(ctx.userId!, input);
      return profile;
    }),
};

export type UsersRouter = typeof usersRouter;
