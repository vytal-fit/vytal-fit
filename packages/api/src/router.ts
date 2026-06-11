import { router } from "./trpc";
import { bookingsRouter } from "./routers/bookings";
import { classTypesRouter } from "./routers/classTypes";
import { classesRouter } from "./routers/classes";
import { coachesRouter } from "./routers/coaches";
import { dashboardRouter } from "./routers/dashboard";
import { exercisesRouter } from "./routers/exercises";
import { leadsRouter } from "./routers/leads";
import { locationsRouter } from "./routers/locations";
import { membersRouter } from "./routers/members";
import { notificationsRouter } from "./routers/notifications";
import { personalRecordsRouter } from "./routers/personalRecords";
import { subscriptionsRouter } from "./routers/subscriptions";
import { wodResultsRouter } from "./routers/wodResults";
import { wodsRouter } from "./routers/wods";

export const appRouter = router({
  members: membersRouter,
  coaches: coachesRouter,
  locations: locationsRouter,
  classTypes: classTypesRouter,
  classes: classesRouter,
  bookings: bookingsRouter,
  exercises: exercisesRouter,
  wods: wodsRouter,
  wodResults: wodResultsRouter,
  personalRecords: personalRecordsRouter,
  leads: leadsRouter,
  subscriptions: subscriptionsRouter,
  notifications: notificationsRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
