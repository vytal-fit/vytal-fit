/**
 * Shared test harness: boots an in-memory PGlite database, applies the real
 * generated migrations, seeds TWO organizations (org-a, org-b) and builds
 * tRPC callers with fabricated contexts.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { schema, type Database } from "@vytal-fit/db";
import { ORGANIZATION_CONFIGS } from "@vytal-fit/shared";
import { appRouter } from "../src/router";
import { createCallerFactory, createContext, type SessionContext } from "../src/trpc";

const MIGRATIONS_FOLDER = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../db/migrations",
);

export function todayString(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const IDS = {
  orgA: "org-a",
  orgB: "org-b",
  userA: "user-a",
  userB: "user-b",
  userCoachA: "user-coach-a",
  userAthleteA: "user-athlete-a",
  // org A domain rows
  memberA1: "member-a1",
  memberA2: "member-a2",
  memberA3: "member-a3",
  coachA: "coach-a",
  locationA: "loc-a",
  classTypeA: "ct-a",
  classA: "class-a",
  classASmall: "class-a-small",
  bookingA: "booking-a",
  wodA: "wod-a",
  wodAPublished: "wod-a-published",
  leadA: "lead-a",
  leadA2: "lead-a2",
  planA: "plan-a",
  subA: "sub-a",
  prA1: "pr-a1",
  prA2: "pr-a2",
  wodResultA1: "wr-a1",
  wodResultA2: "wr-a2",
  notifA1: "notif-a1",
  notifA2: "notif-a2",
  convA: "conv-a",
  checkInA1: "checkin-a1",
  checkInA2: "checkin-a2",
  checkInA3: "checkin-a3",
  // org B domain rows
  memberB1: "member-b1",
  coachB: "coach-b",
  locationB: "loc-b",
  classTypeB: "ct-b",
  classB: "class-b",
  bookingB: "booking-b",
  wodB: "wod-b",
  leadB: "lead-b",
  planB: "plan-b",
  subB: "sub-b",
  prB: "pr-b",
  wodResultB: "wr-b",
  notifB: "notif-b",
  checkInB: "checkin-b",
  convB: "conv-b",
  // global
  exercise1: "ex-1",
  exercise2: "ex-2",
  exerciseDataset1: "ds-0001",
} as const;

export async function createTestDb(): Promise<Database> {
  const client = new PGlite();
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  return db;
}

export async function seed(db: Database): Promise<void> {
  const today = todayString();

  await db.insert(schema.organization).values([
    {
      id: IDS.orgA,
      name: "CrossFit Aveiro",
      slug: "crossfit-aveiro",
      metadata: JSON.stringify({ type: "crossfit_box" }),
    },
    {
      id: IDS.orgB,
      name: "Iron Temple",
      slug: "iron-temple",
      metadata: JSON.stringify({ type: "weightlifting_club" }),
    },
  ]);

  await db.insert(schema.user).values([
    { id: IDS.userA, name: "Owner A", email: "owner-a@vytal.fit" },
    { id: IDS.userB, name: "Owner B", email: "owner-b@vytal.fit" },
    { id: IDS.userCoachA, name: "Coach A", email: "coach-a@vytal.fit" },
    { id: IDS.userAthleteA, name: "Athlete A", email: "athlete-a@vytal.fit" },
  ]);

  await db.insert(schema.member).values([
    { id: "ba-member-a", organizationId: IDS.orgA, userId: IDS.userA, role: "owner" },
    { id: "ba-member-b", organizationId: IDS.orgB, userId: IDS.userB, role: "owner" },
    { id: "ba-coach-a", organizationId: IDS.orgA, userId: IDS.userCoachA, role: "coach" },
    { id: "ba-athlete-a", organizationId: IDS.orgA, userId: IDS.userAthleteA, role: "athlete" },
  ]);

  await db.insert(schema.coaches).values([
    {
      id: IDS.coachA,
      organizationId: IDS.orgA,
      name: "Andre Loureiro",
      email: "andre@vytal.fit",
      role: "head_coach",
    },
    {
      id: IDS.coachB,
      organizationId: IDS.orgB,
      name: "Marine Robba",
      email: "marine@vytal.fit",
      role: "coach",
    },
  ]);

  await db.insert(schema.locations).values([
    { id: IDS.locationA, organizationId: IDS.orgA, name: "Main Box", capacity: 20 },
    { id: IDS.locationB, organizationId: IDS.orgB, name: "Weight Room", capacity: 12 },
  ]);

  await db.insert(schema.classTypes).values([
    {
      id: IDS.classTypeA,
      organizationId: IDS.orgA,
      name: "WOD",
      abbreviation: "WOD",
      color: "#3dff6e",
    },
    {
      id: IDS.classTypeB,
      organizationId: IDS.orgB,
      name: "Strength",
      abbreviation: "STR",
      color: "#ffb300",
    },
  ]);

  await db.insert(schema.gymMembers).values([
    {
      id: IDS.memberA1,
      organizationId: IDS.orgA,
      userId: IDS.userAthleteA,
      memberNumber: 1,
      name: "Jose Fonte",
      email: "jose@example.com",
      status: "active",
    },
    {
      id: IDS.memberA2,
      organizationId: IDS.orgA,
      memberNumber: 2,
      name: "Ana Silva",
      email: "ana@example.com",
      status: "active",
    },
    {
      id: IDS.memberA3,
      organizationId: IDS.orgA,
      memberNumber: 3,
      name: "Trial Tina",
      email: "tina@example.com",
      status: "trial",
    },
    {
      id: IDS.memberB1,
      organizationId: IDS.orgB,
      memberNumber: 1,
      name: "Bruno B",
      email: "bruno@example.com",
      status: "active",
    },
  ]);

  await db.insert(schema.classes).values([
    {
      id: IDS.classA,
      organizationId: IDS.orgA,
      classTypeId: IDS.classTypeA,
      locationId: IDS.locationA,
      coachIds: [IDS.coachA],
      date: today,
      startTime: "07:00",
      endTime: "08:00",
      maxCapacity: 20,
    },
    {
      id: IDS.classASmall,
      organizationId: IDS.orgA,
      classTypeId: IDS.classTypeA,
      locationId: IDS.locationA,
      coachIds: [IDS.coachA],
      date: today,
      startTime: "09:00",
      endTime: "10:00",
      maxCapacity: 1,
    },
    {
      id: IDS.classB,
      organizationId: IDS.orgB,
      classTypeId: IDS.classTypeB,
      locationId: IDS.locationB,
      coachIds: [IDS.coachB],
      date: today,
      startTime: "07:00",
      endTime: "08:00",
      maxCapacity: 10,
    },
  ]);

  await db.insert(schema.bookings).values([
    {
      id: IDS.bookingA,
      organizationId: IDS.orgA,
      memberId: IDS.memberA1,
      classId: IDS.classA,
      status: "confirmed",
    },
    {
      id: IDS.bookingB,
      organizationId: IDS.orgB,
      memberId: IDS.memberB1,
      classId: IDS.classB,
      status: "confirmed",
    },
  ]);

  await db.insert(schema.wods).values([
    {
      id: IDS.wodA,
      organizationId: IDS.orgA,
      classTypeId: IDS.classTypeA,
      date: today,
      title: "FRAN",
      parts: [
        {
          name: "WOD",
          type: "for_time",
          timeCap: 10,
          exercises: [{ exerciseId: IDS.exercise1, reps: "21-15-9" }],
        },
      ],
      createdBy: IDS.userA,
    },
    {
      id: IDS.wodAPublished,
      organizationId: IDS.orgA,
      classTypeId: IDS.classTypeA,
      date: today,
      title: "CINDY",
      parts: [],
      publishedAt: new Date(),
      createdBy: IDS.userA,
    },
    {
      id: IDS.wodB,
      organizationId: IDS.orgB,
      classTypeId: IDS.classTypeB,
      date: today,
      title: "HEAVY DAY",
      parts: [],
      createdBy: IDS.userB,
    },
  ]);

  await db.insert(schema.leads).values([
    { id: IDS.leadA, organizationId: IDS.orgA, name: "Lead Alpha", stage: "lead" },
    { id: IDS.leadA2, organizationId: IDS.orgA, name: "Lead Beta", stage: "contacted" },
    { id: IDS.leadB, organizationId: IDS.orgB, name: "Lead Gamma", stage: "lead" },
  ]);

  await db.insert(schema.subscriptionPlans).values([
    {
      id: IDS.planA,
      organizationId: IDS.orgA,
      name: "Unlimited",
      type: "monthly",
      price: "75.00",
      allowedClassTypes: [IDS.classTypeA],
    },
    {
      id: IDS.planB,
      organizationId: IDS.orgB,
      name: "Basic",
      type: "monthly",
      price: "40.00",
      allowedClassTypes: [IDS.classTypeB],
    },
  ]);

  await db.insert(schema.subscriptions).values([
    {
      id: IDS.subA,
      organizationId: IDS.orgA,
      memberId: IDS.memberA1,
      planId: IDS.planA,
      startDate: "2026-01-01",
      status: "active",
    },
    {
      id: IDS.subB,
      organizationId: IDS.orgB,
      memberId: IDS.memberB1,
      planId: IDS.planB,
      startDate: "2026-01-01",
      status: "active",
    },
  ]);

  await db.insert(schema.payments).values([
    {
      id: "pay-a-paid",
      organizationId: IDS.orgA,
      memberId: IDS.memberA1,
      planId: IDS.planA,
      amount: "75.00",
      method: "mbway",
      status: "paid",
      reference: "INV-A-001",
      paidAt: new Date(today),
    },
    {
      id: "pay-a-overdue",
      organizationId: IDS.orgA,
      memberId: IDS.memberA2,
      planId: IDS.planA,
      amount: "60.00",
      method: "sepa",
      status: "overdue",
      reference: "INV-A-002",
      dueDate: "2026-01-15",
    },
    {
      id: "pay-b-paid",
      organizationId: IDS.orgB,
      memberId: IDS.memberB1,
      planId: IDS.planB,
      amount: "90.00",
      method: "card",
      status: "paid",
      reference: "INV-B-001",
      paidAt: new Date(today),
    },
  ]);

  await db.insert(schema.personalRecords).values([
    {
      id: IDS.prA1,
      organizationId: IDS.orgA,
      memberId: IDS.memberA1,
      exerciseId: IDS.exercise1,
      value: "120",
      unit: "kg",
    },
    {
      id: IDS.prA2,
      organizationId: IDS.orgA,
      memberId: IDS.memberA2,
      exerciseId: IDS.exercise2,
      value: "15",
      unit: "reps",
    },
    {
      id: IDS.prB,
      organizationId: IDS.orgB,
      memberId: IDS.memberB1,
      exerciseId: IDS.exercise1,
      value: "90",
      unit: "kg",
    },
  ]);

  await db.insert(schema.wodResults).values([
    {
      id: IDS.wodResultA1,
      organizationId: IDS.orgA,
      memberId: IDS.memberA1,
      wodId: IDS.wodA,
      classId: IDS.classA,
      score: "3:45",
      scoreType: "time",
      scale: "rx",
    },
    {
      id: IDS.wodResultA2,
      organizationId: IDS.orgA,
      memberId: IDS.memberA2,
      wodId: IDS.wodAPublished,
      score: "20+5",
      scoreType: "rounds_reps",
      scale: "scaled",
    },
    {
      id: IDS.wodResultB,
      organizationId: IDS.orgB,
      memberId: IDS.memberB1,
      wodId: IDS.wodB,
      score: "100",
      scoreType: "weight",
      scale: "rx",
    },
  ]);

  await db.insert(schema.notifications).values([
    {
      id: IDS.notifA1,
      organizationId: IDS.orgA,
      memberId: IDS.memberA1,
      type: "booking_confirmed",
      title: "Booking confirmed",
      body: "You are in for the 07:00 WOD.",
      read: false,
    },
    {
      id: IDS.notifA2,
      organizationId: IDS.orgA,
      memberId: IDS.memberA1,
      type: "wod_published",
      title: "WOD published",
      body: "CINDY is live.",
      read: true,
    },
    {
      id: IDS.notifB,
      organizationId: IDS.orgB,
      memberId: IDS.memberB1,
      type: "booking_confirmed",
      title: "Booking confirmed",
      body: "You are in for the 07:00 Strength.",
      read: false,
    },
  ]);

  await db.insert(schema.supportTickets).values([
    {
      id: "ticket-a1",
      organizationId: IDS.orgA,
      number: 1001,
      subject: "Pagamento duplicado",
      memberName: "Ana Silva",
      priority: "high",
      status: "open",
      assignedTo: "Andre Loureiro",
      description: "Cobrança duplicada no plano mensal.",
      messages: [
        {
          id: "msg-a1",
          author: "Ana Silva",
          isStaff: false,
          content: "A cobrança apareceu duas vezes.",
          date: new Date(today).toISOString(),
        },
      ],
      internalNotes: "",
      createdAt: new Date(today),
      updatedAt: new Date(today),
    },
    {
      id: "ticket-a2",
      organizationId: IDS.orgA,
      number: 1002,
      subject: "AC da sala 1",
      memberName: "Catarina Reis",
      priority: "medium",
      status: "in_progress",
      assignedTo: "Marine Robba",
      description: "O AC da sala 1 não está a funcionar.",
      messages: [],
      internalNotes: "Tecnico agendado.",
      createdAt: new Date(today),
      updatedAt: new Date(today),
    },
  ]);

  await db.insert(schema.conversations).values([
    {
      id: IDS.convA,
      organizationId: IDS.orgA,
      contactName: "Ana Silva",
      contactStatus: "active",
      online: true,
      lastMessageAt: new Date(today),
    },
    {
      id: IDS.convB,
      organizationId: IDS.orgB,
      contactName: "Bruno Costa",
      contactStatus: "trial",
      online: false,
      lastMessageAt: new Date(today),
    },
  ]);

  await db.insert(schema.messages).values([
    {
      id: "msg-conv-a-1",
      organizationId: IDS.orgA,
      conversationId: IDS.convA,
      body: "Olá, têm vagas amanhã?",
      fromStaff: false,
      read: false,
      createdAt: new Date(today),
    },
    {
      id: "msg-conv-a-2",
      organizationId: IDS.orgA,
      conversationId: IDS.convA,
      body: "Sim, às 18h!",
      fromStaff: true,
      read: true,
      createdAt: new Date(today),
    },
    {
      id: "msg-conv-b-1",
      organizationId: IDS.orgB,
      conversationId: IDS.convB,
      body: "Quero experimentar.",
      fromStaff: false,
      read: false,
      createdAt: new Date(today),
    },
  ]);

  const now = new Date();
  const yesterday = new Date(now.getTime() - 86_400_000);
  await db.insert(schema.checkIns).values([
    {
      id: IDS.checkInA1,
      organizationId: IDS.orgA,
      memberId: IDS.memberA1,
      classId: IDS.classA,
      bookingId: IDS.bookingA,
      method: "qr",
      checkedInAt: now,
    },
    {
      id: IDS.checkInA2,
      organizationId: IDS.orgA,
      memberId: IDS.memberA2,
      classId: null,
      bookingId: null,
      method: "manual",
      checkedInAt: yesterday,
    },
    {
      id: IDS.checkInA3,
      organizationId: IDS.orgA,
      memberId: IDS.memberA3,
      classId: null,
      bookingId: null,
      method: "kiosk",
      checkedInAt: now,
    },
    {
      id: IDS.checkInB,
      organizationId: IDS.orgB,
      memberId: IDS.memberB1,
      classId: IDS.classB,
      bookingId: IDS.bookingB,
      method: "app",
      checkedInAt: now,
    },
  ]);

  // Settings row for org B ONLY — org A exercises the defaults-derivation
  // path in orgSettings.get.
  const orgBConfig = ORGANIZATION_CONFIGS["weightlifting_club"];
  if (!orgBConfig) throw new Error("Missing weightlifting_club config.");
  await db.insert(schema.organizationSettings).values({
    organizationId: IDS.orgB,
    features: orgBConfig.features,
    branding: { accentColor: "#ef4444", logoUrl: null },
    publicSite: { enabled: true, slogan: "Lift heavy.", sections: { hero: true } },
    terminologyOverrides: { member: "Lifter" },
  });
}

const createCaller = createCallerFactory(appRouter);

export type TestCaller = ReturnType<typeof createCaller>;

export interface TestHarness {
  db: Database;
  /** Authenticated, active org = org-a, role = owner. */
  callerA: TestCaller;
  /** Authenticated, active org = org-b, role = owner. */
  callerB: TestCaller;
  /** Authenticated, active org = org-a, role = coach. */
  callerCoachA: TestCaller;
  /** Authenticated, active org = org-a, role = athlete. */
  callerAthleteA: TestCaller;
  /** No session at all. */
  callerNoSession: TestCaller;
  /** Session but no active organization. */
  callerNoOrg: TestCaller;
  /** Signed in (owner of org-a) but email not yet confirmed. */
  callerUnverified: TestCaller;
}

export function buildCaller(
  db: Database,
  session: SessionContext | null,
): TestCaller {
  return createCaller(createContext({ db, session }));
}

export async function createHarness(): Promise<TestHarness> {
  const db = await createTestDb();
  await seed(db);
  return {
    db,
    callerA: buildCaller(db, {
      user: {
        id: IDS.userA,
        email: "owner-a@vytal.fit",
        name: "Owner A",
        emailVerified: true,
      },
      activeOrganizationId: IDS.orgA,
      role: "owner",
    }),
    callerB: buildCaller(db, {
      user: {
        id: IDS.userB,
        email: "owner-b@vytal.fit",
        name: "Owner B",
        emailVerified: true,
      },
      activeOrganizationId: IDS.orgB,
      role: "owner",
    }),
    callerCoachA: buildCaller(db, {
      user: {
        id: IDS.userCoachA,
        email: "coach-a@vytal.fit",
        name: "Coach A",
        emailVerified: true,
      },
      activeOrganizationId: IDS.orgA,
      role: "coach",
    }),
    callerAthleteA: buildCaller(db, {
      user: {
        id: IDS.userAthleteA,
        email: "athlete-a@vytal.fit",
        name: "Athlete A",
        emailVerified: true,
      },
      activeOrganizationId: IDS.orgA,
      role: "athlete",
    }),
    callerNoSession: buildCaller(db, null),
    callerNoOrg: buildCaller(db, {
      user: {
        id: IDS.userA,
        email: "owner-a@vytal.fit",
        name: "Owner A",
        emailVerified: true,
      },
      activeOrganizationId: null,
      role: null,
    }),
    callerUnverified: buildCaller(db, {
      user: {
        id: IDS.userA,
        email: "owner-a@vytal.fit",
        name: "Owner A",
        emailVerified: false,
      },
      activeOrganizationId: IDS.orgA,
      role: "owner",
    }),
  };
}
