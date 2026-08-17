import HttpError from '@/error/HttpError';
import { initTRPC, TRPCError } from '@trpc/server';
import { ZodError } from 'zod';
import { User } from '@qrent/shared';

export type TrpcContext = {
  userId?: number;
  user?: User | null;
  locale: string;
  req: import('express').Request;
  res: import('express').Response;
};

export const createTRPC = () => {
  return initTRPC.context<TrpcContext>().create({
    errorFormatter({ shape, error }) {
      console.log('TRPC Error:', error);
      if (error.cause instanceof HttpError) {
        const httpError = error.cause as HttpError;
        return {
          ...shape,
          message: httpError.message,
          data: {
            ...shape.data,
            code: httpStatusToTrpcCode(httpError.statusCode),
            httpStatus: httpError.statusCode,
          },
        };
      }

      const zodIssues = error.cause instanceof ZodError ? error.cause.flatten() : null;
      return {
        ...shape,
        data: {
          ...shape.data,
          zodIssues,
        },
      };
    },
  });
};

const t = createTRPC();

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user || !ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      userId: ctx.userId,
    },
  });
});

export const studentProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user || !ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' });
  }
  if (ctx.user.role !== 'STUDENT' && ctx.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Student access required' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      userId: ctx.userId,
    },
  });
});

export const ownerProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user || !ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' });
  }
  if (ctx.user.role !== 'OWNER' && ctx.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Owner access required' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      userId: ctx.userId,
    },
  });
});

export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user || !ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' });
  }
  if (ctx.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      userId: ctx.userId,
    },
  });
});

export function httpStatusToTrpcCode(statusCode: number): TRPCError['code'] {
  if (statusCode === 400) return 'BAD_REQUEST';
  if (statusCode === 401) return 'UNAUTHORIZED';
  if (statusCode === 403) return 'FORBIDDEN';
  if (statusCode === 404) return 'NOT_FOUND';
  if (statusCode === 409) return 'CONFLICT';
  if (statusCode === 422) return 'UNPROCESSABLE_CONTENT';
  return 'INTERNAL_SERVER_ERROR';
}

