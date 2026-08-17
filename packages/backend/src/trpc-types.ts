// Re-export the AppRouter type and runtime router/context for monorepo consumers
import { appRouter } from './trpc/routers/index';
import { createTRPCContext } from './trpc/context';

export { appRouter, createTRPCContext };
export type AppRouter = typeof appRouter;
