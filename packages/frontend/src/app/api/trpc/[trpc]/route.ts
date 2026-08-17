export const dynamic = 'force-dynamic';

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter, createTRPCContext } from '@qrent/backend/trpc';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: opts => createTRPCContext(opts as any),
  });

export { handler as GET, handler as POST };
