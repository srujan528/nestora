import { createTRPC } from '../trpc';
import { authRouter } from './auth';
import { pgsRouter } from './pgs';
import { roomsRouter } from './rooms';
import { amenitiesRouter } from './amenities';
import { weeklyMenuRouter } from './weeklyMenu';
import { photosRouter } from './photos';
import { savedPgsRouter } from './savedPgs';
import { inquiriesRouter } from './inquiries';
import { adminRouter } from './admin';
import { usersRouter } from './users';
import { collegesRouter } from './colleges';
import { aiRouter } from './ai';

const t = createTRPC();

export const appRouter = t.router({
  auth: authRouter,
  pgs: pgsRouter,
  rooms: roomsRouter,
  amenities: amenitiesRouter,
  weeklyMenu: weeklyMenuRouter,
  photos: photosRouter,
  savedPgs: savedPgsRouter,
  inquiries: inquiriesRouter,
  admin: adminRouter,
  users: usersRouter,
  colleges: collegesRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
