import { router } from "./trpc";
import { bookingsRouter } from "./routers/bookings";
import { classesRouter } from "./routers/classes";
import { dashboardRouter } from "./routers/dashboard";
import { leadsRouter } from "./routers/leads";
import { membersRouter } from "./routers/members";
import { subscriptionsRouter } from "./routers/subscriptions";
import { wodsRouter } from "./routers/wods";

export const appRouter = router({
  members: membersRouter,
  classes: classesRouter,
  bookings: bookingsRouter,
  wods: wodsRouter,
  leads: leadsRouter,
  subscriptions: subscriptionsRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
