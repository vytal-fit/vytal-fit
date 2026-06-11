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
  // global
  exercise1: "ex-1",
  exercise2: "ex-2",
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
    { id: IDS.orgA, name: "CrossFit Aveiro", slug: "crossfit-aveiro" },
    { id: IDS.orgB, name: "Iron Temple", slug: "iron-temple" },
  ]);

  await db.insert(schema.user).values([
    { id: IDS.userA, name: "Owner A", email: "owner-a@vytal.fit" },
    { id: IDS.userB, name: "Owner B", email: "owner-b@vytal.fit" },
  ]);

  await db.insert(schema.member).values([
    { id: "ba-member-a", organizationId: IDS.orgA, userId: IDS.userA, role: "owner" },
    { id: "ba-member-b", organizationId: IDS.orgB, userId: IDS.userB, role: "owner" },
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

  await db.insert(schema.exercises).values([
    { id: IDS.exercise1, name: "Back Squat", category: "weightlifting" },
    { id: IDS.exercise2, name: "Pull Up", category: "gymnastics" },
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
}

const createCaller = createCallerFactory(appRouter);

export type TestCaller = ReturnType<typeof createCaller>;

export interface TestHarness {
  db: Database;
  /** Authenticated, active org = org-a. */
  callerA: TestCaller;
  /** Authenticated, active org = org-b. */
  callerB: TestCaller;
  /** No session at all. */
  callerNoSession: TestCaller;
  /** Session but no active organization. */
  callerNoOrg: TestCaller;
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
      user: { id: IDS.userA, email: "owner-a@vytal.fit", name: "Owner A" },
      activeOrganizationId: IDS.orgA,
    }),
    callerB: buildCaller(db, {
      user: { id: IDS.userB, email: "owner-b@vytal.fit", name: "Owner B" },
      activeOrganizationId: IDS.orgB,
    }),
    callerNoSession: buildCaller(db, null),
    callerNoOrg: buildCaller(db, {
      user: { id: IDS.userA, email: "owner-a@vytal.fit", name: "Owner A" },
      activeOrganizationId: null,
    }),
  };
}
