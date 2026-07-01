import { router } from "./trpc";
import { apiKeysRouter } from "./routers/apiKeys";
import { auditLogRouter } from "./routers/auditLog";
import { backupsRouter } from "./routers/backups";
import { bookingsRouter } from "./routers/bookings";
import { campaignsRouter } from "./routers/campaigns";
import { certificationsRouter } from "./routers/certifications";
import { checkInsRouter } from "./routers/checkIns";
import { classTemplatesRouter } from "./routers/classTemplates";
import { classTypesRouter } from "./routers/classTypes";
import { classesRouter } from "./routers/classes";
import { coachesRouter } from "./routers/coaches";
import { communityRouter } from "./routers/community";
import { contractsRouter } from "./routers/contracts";
import { dashboardRouter } from "./routers/dashboard";
import { exercisesRouter } from "./routers/exercises";
import { expensesRouter } from "./routers/expenses";
import { leadsRouter } from "./routers/leads";
import { locationsRouter } from "./routers/locations";
import { memberGroupsRouter } from "./routers/memberGroups";
import { membersRouter } from "./routers/members";
import { messagesRouter } from "./routers/messages";
import { notificationsRouter } from "./routers/notifications";
import { paymentsRouter } from "./routers/payments";
import { orgSettingsRouter } from "./routers/orgSettings";
import { personalRecordsRouter } from "./routers/personalRecords";
import { shopRouter } from "./routers/shop";
import { subscriptionsRouter } from "./routers/subscriptions";
import { supportTicketsRouter } from "./routers/supportTickets";
import { uploadsRouter } from "./routers/uploads";
import { wellnessCheckinsRouter } from "./routers/wellnessCheckins";
import { wodResultsRouter } from "./routers/wodResults";
import { webhooksRouter } from "./routers/webhooks";
import { wodsRouter } from "./routers/wods";
import { workoutFeedbackRouter } from "./routers/workoutFeedback";

export const appRouter = router({
  members: membersRouter,
  coaches: coachesRouter,
  locations: locationsRouter,
  classTypes: classTypesRouter,
  classes: classesRouter,
  bookings: bookingsRouter,
  checkIns: checkInsRouter,
  exercises: exercisesRouter,
  wods: wodsRouter,
  wodResults: wodResultsRouter,
  workoutFeedback: workoutFeedbackRouter,
  wellnessCheckins: wellnessCheckinsRouter,
  personalRecords: personalRecordsRouter,
  leads: leadsRouter,
  subscriptions: subscriptionsRouter,
  notifications: notificationsRouter,
  supportTickets: supportTicketsRouter,
  shop: shopRouter,
  orgSettings: orgSettingsRouter,
  messages: messagesRouter,
  payments: paymentsRouter,
  expenses: expensesRouter,
  contracts: contractsRouter,
  certifications: certificationsRouter,
  classTemplates: classTemplatesRouter,
  community: communityRouter,
  memberGroups: memberGroupsRouter,
  dashboard: dashboardRouter,
  uploads: uploadsRouter,
  apiKeys: apiKeysRouter,
  auditLog: auditLogRouter,
  webhooks: webhooksRouter,
  backups: backupsRouter,
  campaigns: campaignsRouter,
});

export type AppRouter = typeof appRouter;
