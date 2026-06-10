/**
 * seedDatabase integration tests against in-memory PGlite + the real
 * generated migrations:
 *  - first run inserts the full demo dataset,
 *  - re-running is idempotent (zero new rows, no duplicates),
 *  - demo users can sign in with real hashed passwords via Better Auth,
 *  - org-1 row counts match the @vytal-fit/shared mock dataset,
 *  - memberships mirror mockCurrentUser (owner org-1 / athlete org-2 / coach org-3).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { and, count, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { beforeAll, describe, expect, it } from "vitest";
import { createAuth, type Auth } from "@vytal-fit/auth";
import {
  mockClasses,
  mockClassTypes,
  mockCoaches,
  mockCurrentUser,
  mockExercises,
  mockLeads,
  mockLocations,
  mockMembers,
  mockNotifications,
  mockPersonalRecords,
  mockPlans,
  mockSubscriptions,
  mockWODs,
} from "@vytal-fit/shared";
import type { Database } from "../src/client";
import * as schema from "../src/schema";
import {
  DEMO_PASSWORD,
  DEMO_USERS,
  ORG_1,
  seedDatabase,
  type SeedSummary,
} from "../src/seed";

const MIGRATIONS_FOLDER = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../migrations",
);

let db: Database;
let auth: Auth;
let firstRun: SeedSummary;
let secondRun: SeedSummary;

async function countWhereOrg1(
  table:
    | typeof schema.coaches
    | typeof schema.locations
    | typeof schema.classTypes
    | typeof schema.classes
    | typeof schema.gymMembers
    | typeof schema.bookings
    | typeof schema.wods
    | typeof schema.subscriptionPlans
    | typeof schema.subscriptions
    | typeof schema.leads
    | typeof schema.personalRecords
    | typeof schema.notifications,
): Promise<number> {
  const rows = await db
    .select({ n: count() })
    .from(table)
    .where(eq(table.organizationId, ORG_1));
  return rows[0]?.n ?? 0;
}

beforeAll(async () => {
  const client = new PGlite();
  const pgliteDb = drizzle(client, { schema });
  await migrate(pgliteDb, { migrationsFolder: MIGRATIONS_FOLDER });
  db = pgliteDb;
  auth = createAuth({
    db,
    secret: "test-secret-at-least-32-characters-long",
    baseURL: "http://localhost:3000",
  });

  firstRun = await seedDatabase(db, { auth });
  secondRun = await seedDatabase(db, { auth });
});

describe("seedDatabase — first run", () => {
  it("inserts the 3 demo organizations", async () => {
    expect(firstRun.inserted.organizations).toBe(3);
    const orgs = await db.select().from(schema.organization);
    expect(orgs.map((o) => o.slug).sort()).toEqual([
      "crossfit-aveiro",
      "iron-temple",
      "yoga-flow-porto",
    ]);
    expect(orgs.find((o) => o.id === "org-1")?.name).toBe("CrossFit Aveiro");
  });

  it("creates every demo user through Better Auth", () => {
    expect(firstRun.demoUsers).toHaveLength(DEMO_USERS.length);
    expect(firstRun.demoUsers.every((u) => u.created)).toBe(true);
  });

  it("inserts the full org-1 domain dataset (counts match mocks)", () => {
    expect(firstRun.inserted.coaches).toBe(mockCoaches.length);
    expect(firstRun.inserted.locations).toBe(mockLocations.length);
    expect(firstRun.inserted.classTypes).toBe(mockClassTypes.length);
    expect(firstRun.inserted.classes).toBe(mockClasses.length);
    expect(firstRun.inserted.gymMembers).toBe(mockMembers.length);
    expect(firstRun.inserted.exercises).toBe(mockExercises.length);
    expect(firstRun.inserted.wods).toBe(mockWODs.length);
    expect(firstRun.inserted.subscriptionPlans).toBe(mockPlans.length);
    expect(firstRun.inserted.subscriptions).toBe(mockSubscriptions.length);
    expect(firstRun.inserted.leads).toBe(mockLeads.length);
    expect(firstRun.inserted.personalRecords).toBe(mockPersonalRecords.length);
    expect(firstRun.inserted.notifications).toBe(mockNotifications.length);
    expect(firstRun.inserted.bookings).toBeGreaterThan(0);
  });
});

describe("seedDatabase — idempotency", () => {
  it("re-running inserts zero rows", () => {
    for (const [table, n] of Object.entries(secondRun.inserted)) {
      expect(n, `expected 0 new rows in ${table} on re-run`).toBe(0);
    }
  });

  it("re-running does not recreate demo users", () => {
    expect(secondRun.demoUsers.every((u) => !u.created)).toBe(true);
  });

  it("leaves no duplicate rows behind", async () => {
    const orgCount = await db.select({ n: count() }).from(schema.organization);
    expect(orgCount[0]?.n).toBe(3);

    const joseRows = await db
      .select({ n: count() })
      .from(schema.user)
      .where(eq(schema.user.email, "jose@vytal.fit"));
    expect(joseRows[0]?.n).toBe(1);

    const membershipCount = await db.select({ n: count() }).from(schema.member);
    const expectedMemberships = DEMO_USERS.reduce(
      (sum, u) => sum + u.memberships.length,
      0,
    );
    expect(membershipCount[0]?.n).toBe(expectedMemberships);
  });
});

describe("demo authentication", () => {
  it.each(DEMO_USERS.map((u) => [u.email] as const))(
    "%s can sign in with DEMO_PASSWORD",
    async (email) => {
      const result = await auth.api.signInEmail({
        body: { email, password: DEMO_PASSWORD },
      });
      expect(result.user.email).toBe(email);
      expect(result.token).toBeTruthy();
    },
  );
});

describe("org-1 row counts", () => {
  it("matches the mock dataset per table", async () => {
    expect(await countWhereOrg1(schema.coaches)).toBe(mockCoaches.length);
    expect(await countWhereOrg1(schema.locations)).toBe(mockLocations.length);
    expect(await countWhereOrg1(schema.classTypes)).toBe(mockClassTypes.length);
    expect(await countWhereOrg1(schema.classes)).toBe(mockClasses.length);
    expect(await countWhereOrg1(schema.gymMembers)).toBe(mockMembers.length);
    expect(await countWhereOrg1(schema.wods)).toBe(mockWODs.length);
    expect(await countWhereOrg1(schema.subscriptionPlans)).toBe(mockPlans.length);
    expect(await countWhereOrg1(schema.subscriptions)).toBe(
      mockSubscriptions.length,
    );
    expect(await countWhereOrg1(schema.leads)).toBe(mockLeads.length);
    expect(await countWhereOrg1(schema.personalRecords)).toBe(
      mockPersonalRecords.length,
    );
    expect(await countWhereOrg1(schema.notifications)).toBe(
      mockNotifications.length,
    );

    const exerciseCount = await db.select({ n: count() }).from(schema.exercises);
    expect(exerciseCount[0]?.n).toBe(mockExercises.length);
  });
});

describe("memberships mirror mockCurrentUser", () => {
  it("jose@vytal.fit is owner of org-1, athlete of org-2, coach of org-3", async () => {
    const jose = await db
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(eq(schema.user.email, "jose@vytal.fit"));
    const joseId = jose[0]?.id;
    expect(joseId).toBeTruthy();

    const memberships = await db
      .select({
        organizationId: schema.member.organizationId,
        role: schema.member.role,
      })
      .from(schema.member)
      .where(eq(schema.member.userId, joseId ?? ""));

    const byOrg = new Map(memberships.map((m) => [m.organizationId, m.role]));
    const expected = new Map(
      mockCurrentUser.memberships.map((m) => [m.organizationId, m.role]),
    );
    expect(byOrg).toEqual(expected);
  });

  it("coach@ and athlete@ are members of org-1 with their roles", async () => {
    for (const [email, role] of [
      ["coach@vytal.fit", "coach"],
      ["athlete@vytal.fit", "athlete"],
    ] as const) {
      const users = await db
        .select({ id: schema.user.id })
        .from(schema.user)
        .where(eq(schema.user.email, email));
      const userId = users[0]?.id ?? "";
      const memberships = await db
        .select({ role: schema.member.role })
        .from(schema.member)
        .where(
          and(
            eq(schema.member.userId, userId),
            eq(schema.member.organizationId, ORG_1),
          ),
        );
      expect(memberships).toHaveLength(1);
      expect(memberships[0]?.role).toBe(role);
    }
  });
});
