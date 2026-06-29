/**
 * Schema integration tests: the generated migration applies cleanly on a real
 * (in-memory PGlite) Postgres, every tenant table carries organizationId, and
 * the pgEnums stay in lockstep with the @vytal-fit/shared union types.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { beforeAll, describe, expect, it } from "vitest";
import type {
  BookingStatus,
  ExerciseCategory,
  LeadStage,
  MemberStatus,
  NotificationType,
  WODType,
} from "@vytal-fit/shared";
import * as schema from "../src/schema";

const MIGRATIONS_FOLDER = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../migrations",
);

let client: PGlite;

beforeAll(async () => {
  client = new PGlite();
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
});

describe("migration", () => {
  it("applies cleanly and creates every expected table", async () => {
    const result = await client.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`,
    );
    const tables = result.rows.map((r) => r.table_name).sort();

    const expected = [
      // Better Auth core
      "user",
      "session",
      "account",
      "verification",
      // Better Auth organization plugin
      "organization",
      "member",
      "invitation",
      // Domain
      "gym_members",
      "coaches",
      "locations",
      "class_types",
      "classes",
      "bookings",
      "wods",
      "wod_results",
      "personal_records",
      "subscription_plans",
      "subscriptions",
      "leads",
      "notifications",
      "support_tickets",
    ];
    for (const table of expected) {
      expect(tables, `missing table ${table}`).toContain(table);
    }
  });

  it("supports a basic org-scoped insert/select round-trip", async () => {
    const db = drizzle(client, { schema });
    await db
      .insert(schema.organization)
      .values({ id: "org-rt", name: "Round Trip", slug: "round-trip" });
    await db.insert(schema.gymMembers).values({
      id: "m-rt",
      organizationId: "org-rt",
      memberNumber: 1,
      name: "Test",
      email: "t@example.com",
    });
    const rows = await db.select().from(schema.gymMembers);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.organizationId).toBe("org-rt");
  });

  it("enforces the organization FK on tenant rows", async () => {
    const db = drizzle(client, { schema });
    await expect(
      db.insert(schema.gymMembers).values({
        id: "m-orphan",
        organizationId: "org-does-not-exist",
        memberNumber: 99,
        name: "Orphan",
        email: "o@example.com",
      }),
    ).rejects.toThrow();
  });
});

describe("tenant isolation columns", () => {
  const TENANT_TABLES = [
    "gym_members",
    "coaches",
    "locations",
    "class_types",
    "classes",
    "bookings",
    "wods",
    "wod_results",
    "personal_records",
    "subscription_plans",
    "subscriptions",
    "leads",
    "notifications",
    "support_tickets",
  ];

  it.each(TENANT_TABLES)("%s has a NOT NULL organization_id column", async (table) => {
    const result = await client.query<{ column_name: string; is_nullable: string }>(
      `SELECT column_name, is_nullable FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1 AND column_name = 'organization_id'`,
      [table],
    );
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.is_nullable).toBe("NO");
  });

  it.each(TENANT_TABLES)("%s has an index on organization_id", async (table) => {
    const result = await client.query<{ indexdef: string }>(
      `SELECT indexdef FROM pg_indexes WHERE schemaname = 'public' AND tablename = $1`,
      [table],
    );
    const hasOrgIndex = result.rows.some((r) => r.indexdef.includes("organization_id"));
    expect(hasOrgIndex, `no organization_id index on ${table}`).toBe(true);
  });
});

describe("enums match shared unions", () => {
  async function enumValues(name: string): Promise<string[]> {
    const result = await client.query<{ enumlabel: string }>(
      `SELECT e.enumlabel FROM pg_enum e
       JOIN pg_type t ON t.oid = e.enumtypid
       WHERE t.typname = $1
       ORDER BY e.enumsortorder`,
      [name],
    );
    return result.rows.map((r) => r.enumlabel);
  }

  it("member_status matches MemberStatus", async () => {
    expect(await enumValues("member_status")).toEqual([...schema.MEMBER_STATUSES]);
  });

  it("booking_status matches BookingStatus", async () => {
    expect(await enumValues("booking_status")).toEqual([...schema.BOOKING_STATUSES]);
  });

  it("exercise_category matches ExerciseCategory", async () => {
    expect(await enumValues("exercise_category")).toEqual([
      ...schema.EXERCISE_CATEGORIES,
    ]);
  });

  it("lead_stage matches LeadStage", async () => {
    expect(await enumValues("lead_stage")).toEqual([...schema.LEAD_STAGES]);
  });

  it("notification_type matches NotificationType", async () => {
    expect(await enumValues("notification_type")).toEqual([
      ...schema.NOTIFICATION_TYPES,
    ]);
  });

  it("remaining enums exist in the database with the declared values", async () => {
    expect(await enumValues("gender")).toEqual([...schema.GENDERS]);
    expect(await enumValues("coach_role")).toEqual([...schema.COACH_ROLES]);
    expect(await enumValues("wod_score_type")).toEqual([...schema.WOD_SCORE_TYPES]);
    expect(await enumValues("wod_scale")).toEqual([...schema.WOD_SCALES]);
    expect(await enumValues("pr_unit")).toEqual([...schema.PR_UNITS]);
    expect(await enumValues("plan_type")).toEqual([...schema.PLAN_TYPES]);
    expect(await enumValues("subscription_status")).toEqual([
      ...schema.SUBSCRIPTION_STATUSES,
    ]);
  });

  it("enum value lists are exhaustive against shared unions (type-level)", () => {
    type Eq<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

    const memberStatus: Eq<MemberStatus, (typeof schema.MEMBER_STATUSES)[number]> = true;
    const bookingStatus: Eq<BookingStatus, (typeof schema.BOOKING_STATUSES)[number]> =
      true;
    const exerciseCategory: Eq<
      ExerciseCategory,
      (typeof schema.EXERCISE_CATEGORIES)[number]
    > = true;
    const leadStage: Eq<LeadStage, (typeof schema.LEAD_STAGES)[number]> = true;
    const notificationType: Eq<
      NotificationType,
      (typeof schema.NOTIFICATION_TYPES)[number]
    > = true;
    // WODType is stored inside the parts JSONB; assert the union shape too.
    const wodType: Eq<
      WODType,
      "amrap" | "emom" | "for_time" | "tabata" | "strength" | "custom"
    > = true;

    expect([
      memberStatus,
      bookingStatus,
      exerciseCategory,
      leadStage,
      notificationType,
      wodType,
    ]).toEqual([true, true, true, true, true, true]);
  });
});
