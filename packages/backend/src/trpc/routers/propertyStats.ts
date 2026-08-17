import { publicProcedure } from '../trpc';

export const propertyStatsRouter = {
  getStats: publicProcedure.query(async () => {
    return null;
  }),
};

export type PropertyStatsRouter = typeof propertyStatsRouter;
