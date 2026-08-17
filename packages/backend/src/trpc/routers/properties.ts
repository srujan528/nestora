import { publicProcedure } from '../trpc';

export const propertiesRouter = {
  list: publicProcedure.query(async () => {
    return [];
  }),
};

export type PropertiesRouter = typeof propertiesRouter;
