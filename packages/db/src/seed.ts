/**
 * Idempotent database seed for Vytal.
 *
 * `seedDatabase(db, opts?)` populates a freshly-migrated database with:
 *
 *  1. The 3 demo organizations from `@vytal-fit/shared` mocks
 *     (org-1 CrossFit Aveiro, org-2 Yoga Flow Porto, org-3 Iron Temple).
 *  2. Demo users with REAL hashed credentials, created through the Better
 *     Auth server API (`auth.api.signUpEmail`) so email/password login works:
 *       - jose@vytal.fit    → owner of org-1, athlete of org-2, coach of org-3
 *                             (mirrors `mockCurrentUser` memberships)
 *       - coach@vytal.fit   → coach in org-1
 *       - athlete@vytal.fit → athlete in org-1
 *     All share the password `DEMO_PASSWORD` ("VytalDemo2026!").
 *  3. The full domain mock dataset into org-1 (coaches, locations, class
 *     types, classes, bookings, exercises, WODs, plans, subscriptions, gym
 *     members, leads, personal records, notifications). Mock ids are kept
 *     verbatim — every domain table uses text PKs.
 *
 * Idempotency: domain rows use `ON CONFLICT DO NOTHING` on their stable mock
 * ids; users are looked up by email and memberships by (organization, user)
 * before insertion. Re-running is always safe and inserts zero new rows.
 *
 * Date relativity: classes and WODs are seeded across a RELATIVE window
 * (yesterday / today / tomorrow) computed at seed time, so "today" agenda
 * views always have data regardless of when the seed ran. Because
 * `ON CONFLICT DO NOTHING` would leave previously-seeded rows pinned to the
 * old run date, every run also REFRESHES the date columns of the seeded
 * class/WOD ids — re-seeding an old database moves its agenda back to "now".
 *
 * This module is deliberately NOT exported from the package root so that the
 * mock dataset never ends up in app bundles — import it via
 * `@vytal-fit/db/seed` (or a relative path inside this package).
 */
import { and, eq } from "drizzle-orm";
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
  type BookingStatus,
  type WOD,
} from "@vytal-fit/shared";
import type { Database } from "./client";
import * as schema from "./schema";
import type { StoredWODPart } from "./schema";

// ─────────────────────────────────────────────────────────────────────────────
// Demo credentials — documented in docs/BACKEND_WIRING.md
// ─────────────────────────────────────────────────────────────────────────────

/** Shared password for every demo account. */
export const DEMO_PASSWORD = "VytalDemo2026!";

/** Org-1 — owner of the demo box (matches mockCurrentUser's active org). */
export const ORG_1 = "org-1";

export interface DemoMembershipSpec {
  organizationId: string;
  role: "owner" | "coach" | "athlete";
}

export interface DemoUserSpec {
  email: string;
  name: string;
  memberships: readonly DemoMembershipSpec[];
}

/**
 * Demo accounts. `jose@vytal.fit` mirrors `mockCurrentUser` (owner of org-1,
 * athlete of org-2, coach of org-3); the other two exercise the role gates
 * inside org-1.
 */
export const DEMO_USERS: readonly DemoUserSpec[] = [
  {
    email: "jose@vytal.fit",
    name: "Jose Fonte",
    memberships: [
      { organizationId: "org-1", role: "owner" },
      { organizationId: "org-2", role: "athlete" },
      { organizationId: "org-3", role: "coach" },
    ],
  },
  {
    email: "coach@vytal.fit",
    name: "Demo Coach",
    memberships: [{ organizationId: "org-1", role: "coach" }],
  },
  {
    email: "athlete@vytal.fit",
    name: "Demo Athlete",
    memberships: [{ organizationId: "org-1", role: "athlete" }],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Relative seed dates — computed at seed time, refreshed on every run
// ─────────────────────────────────────────────────────────────────────────────

/** ISO date (YYYY-MM-DD, UTC — same convention the app uses) offset by N days. */
function isoDateFromToday(offsetDays: number): string {
  return new Date(Date.now() + offsetDays * 86_400_000)
    .toISOString()
    .split("T")[0] as string;
}

/**
 * Day offsets (relative to the seed run) per seeded class id. The window spans
 * yesterday → today → tomorrow so agenda views ("today") always have data:
 *  - cl-1…cl-7  → today   (full day of classes, 07:00–20:30)
 *  - cl-8, cl-9 → tomorrow
 *  - cl-10      → yesterday (history views)
 */
export const CLASS_DATE_OFFSETS: Readonly<Record<string, number>> = {
  "cl-1": 0,
  "cl-2": 0,
  "cl-3": 0,
  "cl-4": 0,
  "cl-5": 0,
  "cl-6": 0,
  "cl-7": 0,
  "cl-8": 1,
  "cl-9": 1,
  "cl-10": -1,
};

/** Day offsets per seeded WOD id: FRAN + HEAVY DAY today, CINDY yesterday. */
export const WOD_DATE_OFFSETS: Readonly<Record<string, number>> = {
  "wod-1": 0,
  "wod-2": 0,
  "wod-3": -1,
};

function classSeedDate(id: string, fallback: string): string {
  const offset = CLASS_DATE_OFFSETS[id];
  return offset === undefined ? fallback : isoDateFromToday(offset);
}

function wodSeedDate(id: string, fallback: string): string {
  const offset = WOD_DATE_OFFSETS[id];
  return offset === undefined ? fallback : isoDateFromToday(offset);
}

/** publishedAt = 12h before "now", shifted by the WOD's day offset. */
function wodSeedPublishedAt(id: string, fallback: Date | null): Date | null {
  const offset = WOD_DATE_OFFSETS[id];
  if (offset === undefined) return fallback;
  return new Date(Date.now() + offset * 86_400_000 - 12 * 3_600_000);
}

/** Demo bookings into org-1 classes (mock dataset has none of its own). */
const DEMO_BOOKINGS: ReadonlyArray<{
  id: string;
  memberId: string;
  classId: string;
  status: BookingStatus;
}> = [
  { id: "bk-1", memberId: "m-1", classId: "cl-1", status: "confirmed" },
  { id: "bk-2", memberId: "m-2", classId: "cl-1", status: "confirmed" },
  { id: "bk-3", memberId: "m-3", classId: "cl-2", status: "confirmed" },
  { id: "bk-4", memberId: "m-4", classId: "cl-5", status: "waitlisted" },
  { id: "bk-5", memberId: "m-7", classId: "cl-5", status: "confirmed" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Options / result types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Minimal structural slice of the Better Auth instance needed by the seed.
 * Kept structural (instead of depending on `@vytal-fit/auth`) so the package
 * graph stays acyclic — callers pass the instance built with `createAuth`.
 */
export interface SeedAuth {
  api: {
    signUpEmail(input: {
      body: { email: string; password: string; name: string };
    }): Promise<{ user: { id: string } }>;
  };
}

export interface SeedDatabaseOptions {
  /**
   * Better Auth instance used to create demo users with properly hashed
   * passwords. When omitted, demo users/memberships are skipped (domain data
   * still seeds) — pass it for a sign-in-ready database.
   */
  auth?: SeedAuth;
  /** Progress logger (defaults to silent). */
  log?: (message: string) => void;
}

export interface SeedSummary {
  /** Rows actually inserted per table (0 everywhere on a re-run). */
  inserted: Record<string, number>;
  /** Demo accounts and whether this run created them. */
  demoUsers: Array<{ email: string; created: boolean }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mapping helpers (mock shapes → schema shapes)
// ─────────────────────────────────────────────────────────────────────────────

function toDate(value: string): Date {
  return new Date(value);
}

function toOptionalDate(value: string | undefined): Date | null {
  return value ? new Date(value) : null;
}

/** Strip the hydrated `exercise` objects — storage keeps exerciseId only. */
function toStoredParts(parts: WOD["parts"]): StoredWODPart[] {
  return parts.map((part) => ({
    name: part.name,
    type: part.type,
    timeCap: part.timeCap,
    rounds: part.rounds,
    intervalSeconds: part.intervalSeconds,
    exercises: part.exercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      reps: exercise.reps,
      weight: exercise.weight,
      notes: exercise.notes,
    })),
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed
// ─────────────────────────────────────────────────────────────────────────────

export async function seedDatabase(
  db: Database,
  opts: SeedDatabaseOptions = {},
): Promise<SeedSummary> {
  const log = opts.log ?? (() => undefined);
  const inserted: Record<string, number> = {};
  const demoUsers: SeedSummary["demoUsers"] = [];

  // 1. Organizations — derived from mockCurrentUser's memberships.
  const orgRows = mockCurrentUser.memberships.map((membership) => ({
    id: membership.organization.id,
    name: membership.organization.name,
    slug: membership.organization.slug,
    metadata: JSON.stringify({ type: membership.organization.type }),
  }));
  inserted.organizations = (
    await db
      .insert(schema.organization)
      .values(orgRows)
      .onConflictDoNothing()
      .returning({ id: schema.organization.id })
  ).length;
  log(`organizations: +${inserted.organizations}`);

  // 2. Demo users (Better Auth) + org memberships.
  inserted.memberships = 0;
  if (!opts.auth) {
    log("auth instance not provided — skipping demo users and memberships");
  } else {
    for (const spec of DEMO_USERS) {
      const existing = await db
        .select({ id: schema.user.id })
        .from(schema.user)
        .where(eq(schema.user.email, spec.email))
        .limit(1);

      let userId: string;
      let created = false;
      if (existing[0]) {
        userId = existing[0].id;
      } else {
        const response = await opts.auth.api.signUpEmail({
          body: { email: spec.email, password: DEMO_PASSWORD, name: spec.name },
        });
        userId = response.user.id;
        created = true;
      }
      demoUsers.push({ email: spec.email, created });
      log(`user ${spec.email}: ${created ? "created" : "exists"}`);

      for (const membership of spec.memberships) {
        const found = await db
          .select({ id: schema.member.id })
          .from(schema.member)
          .where(
            and(
              eq(schema.member.organizationId, membership.organizationId),
              eq(schema.member.userId, userId),
            ),
          )
          .limit(1);
        if (!found[0]) {
          await db.insert(schema.member).values({
            id: `seed-mem-${membership.organizationId}-${spec.email}`,
            organizationId: membership.organizationId,
            userId,
            role: membership.role,
          });
          inserted.memberships += 1;
        }
      }
    }
    log(`memberships: +${inserted.memberships}`);
  }

  // 3. Domain dataset → org-1 (FK-safe order). Mock ids are kept verbatim.
  inserted.coaches = (
    await db
      .insert(schema.coaches)
      .values(
        mockCoaches.map((coach) => ({
          id: coach.id,
          organizationId: coach.organizationId,
          name: coach.name,
          email: coach.email,
          photo: coach.photo ?? null,
          role: coach.role,
        })),
      )
      .onConflictDoNothing()
      .returning({ id: schema.coaches.id })
  ).length;

  inserted.locations = (
    await db
      .insert(schema.locations)
      .values(
        mockLocations.map((location) => ({
          id: location.id,
          organizationId: location.organizationId,
          name: location.name,
          capacity: location.capacity ?? null,
        })),
      )
      .onConflictDoNothing()
      .returning({ id: schema.locations.id })
  ).length;

  inserted.classTypes = (
    await db
      .insert(schema.classTypes)
      .values(
        mockClassTypes.map((classType) => ({
          id: classType.id,
          organizationId: classType.organizationId,
          name: classType.name,
          abbreviation: classType.abbreviation,
          color: classType.color,
          icon: classType.icon ?? null,
          active: classType.active,
        })),
      )
      .onConflictDoNothing()
      .returning({ id: schema.classTypes.id })
  ).length;

  inserted.gymMembers = (
    await db
      .insert(schema.gymMembers)
      .values(
        mockMembers.map((member) => ({
          id: member.id,
          organizationId: member.organizationId,
          memberNumber: member.memberNumber,
          name: member.name,
          email: member.email,
          phone: member.phone ?? null,
          photo: member.photo ?? null,
          gender: member.gender ?? null,
          dateOfBirth: member.dateOfBirth ?? null,
          nif: member.nif ?? null,
          emergencyContact: member.emergencyContact ?? null,
          status: member.status,
          planId: member.planId ?? null,
          joinedAt: toDate(member.joinedAt),
          lastCheckIn: toOptionalDate(member.lastCheckIn),
          streakWeeks: member.streakWeeks,
          totalCheckIns: member.totalCheckIns,
        })),
      )
      .onConflictDoNothing()
      .returning({ id: schema.gymMembers.id })
  ).length;

  inserted.classes = (
    await db
      .insert(schema.classes)
      .values(
        mockClasses.map((klass) => ({
          id: klass.id,
          organizationId: klass.organizationId,
          classTypeId: klass.classTypeId,
          locationId: klass.locationId,
          coachIds: [...klass.coachIds],
          date: classSeedDate(klass.id, klass.date),
          startTime: klass.startTime,
          endTime: klass.endTime,
          maxCapacity: klass.maxCapacity,
        })),
      )
      .onConflictDoNothing()
      .returning({ id: schema.classes.id })
  ).length;

  inserted.bookings = (
    await db
      .insert(schema.bookings)
      .values(
        DEMO_BOOKINGS.map((booking) => ({
          id: booking.id,
          organizationId: ORG_1,
          memberId: booking.memberId,
          classId: booking.classId,
          status: booking.status,
        })),
      )
      .onConflictDoNothing()
      .returning({ id: schema.bookings.id })
  ).length;

  // Exercises are global (no organizationId).
  inserted.exercises = (
    await db
      .insert(schema.exercises)
      .values(
        mockExercises.map((exercise) => ({
          id: exercise.id,
          name: exercise.name,
          category: exercise.category,
          videoUrl: exercise.videoUrl ?? null,
          description: exercise.description ?? null,
          equipment: exercise.equipment ?? null,
          muscleGroups: exercise.muscleGroups ?? null,
          scaledVariations: exercise.scaledVariations ?? null,
        })),
      )
      .onConflictDoNothing()
      .returning({ id: schema.exercises.id })
  ).length;

  inserted.wods = (
    await db
      .insert(schema.wods)
      .values(
        mockWODs.map((wod) => ({
          id: wod.id,
          organizationId: wod.organizationId,
          classTypeId: wod.classTypeId,
          date: wodSeedDate(wod.id, wod.date),
          title: wod.title ?? null,
          description: wod.description ?? null,
          parts: toStoredParts(wod.parts),
          publishedAt: wodSeedPublishedAt(wod.id, toOptionalDate(wod.publishedAt)),
          createdBy: wod.createdBy,
        })),
      )
      .onConflictDoNothing()
      .returning({ id: schema.wods.id })
  ).length;

  // Date refresh — `ON CONFLICT DO NOTHING` never touches existing rows, so a
  // re-run on an old database would leave classes/WODs pinned to the previous
  // seed date. Upsert the date columns for the seeded ids on every run so the
  // relative window (yesterday/today/tomorrow) always tracks "now".
  for (const klass of mockClasses) {
    await db
      .update(schema.classes)
      .set({ date: classSeedDate(klass.id, klass.date) })
      .where(eq(schema.classes.id, klass.id));
  }
  for (const wod of mockWODs) {
    await db
      .update(schema.wods)
      .set({
        date: wodSeedDate(wod.id, wod.date),
        publishedAt: wodSeedPublishedAt(wod.id, toOptionalDate(wod.publishedAt)),
      })
      .where(eq(schema.wods.id, wod.id));
  }
  log("classes/wods: dates refreshed to relative window (yesterday/today/tomorrow)");

  inserted.subscriptionPlans = (
    await db
      .insert(schema.subscriptionPlans)
      .values(
        mockPlans.map((plan) => ({
          id: plan.id,
          organizationId: plan.organizationId,
          name: plan.name,
          type: plan.type,
          price: plan.price.toFixed(2),
          currency: plan.currency,
          sessionsPerWeek: plan.sessionsPerWeek ?? null,
          maxSessions: plan.maxSessions ?? null,
          allowedClassTypes: [...plan.allowedClassTypes],
          active: plan.active,
        })),
      )
      .onConflictDoNothing()
      .returning({ id: schema.subscriptionPlans.id })
  ).length;

  inserted.subscriptions = (
    await db
      .insert(schema.subscriptions)
      .values(
        mockSubscriptions.map((subscription) => ({
          id: subscription.id,
          organizationId: ORG_1,
          memberId: subscription.memberId,
          planId: subscription.planId,
          startDate: subscription.startDate,
          endDate: subscription.endDate ?? null,
          status: subscription.status,
          sessionsUsed: subscription.sessionsUsed ?? null,
          nextBillingDate: subscription.nextBillingDate ?? null,
        })),
      )
      .onConflictDoNothing()
      .returning({ id: schema.subscriptions.id })
  ).length;

  inserted.leads = (
    await db
      .insert(schema.leads)
      .values(
        mockLeads.map((lead) => ({
          id: lead.id,
          organizationId: lead.organizationId,
          name: lead.name,
          email: lead.email ?? null,
          phone: lead.phone ?? null,
          stage: lead.stage,
          source: lead.source ?? null,
          assignedCoachId: lead.assignedCoachId ?? null,
          notes: lead.notes ?? null,
          createdAt: toDate(lead.createdAt),
          lastContactAt: toOptionalDate(lead.lastContactAt),
          trialDate: toOptionalDate(lead.trialDate),
        })),
      )
      .onConflictDoNothing()
      .returning({ id: schema.leads.id })
  ).length;

  inserted.personalRecords = (
    await db
      .insert(schema.personalRecords)
      .values(
        mockPersonalRecords.map((record) => ({
          id: record.id,
          organizationId: ORG_1,
          memberId: record.memberId,
          exerciseId: record.exerciseId,
          value: record.value,
          unit: record.unit,
          achievedAt: toDate(record.achievedAt),
          previousValue: record.previousValue ?? null,
        })),
      )
      .onConflictDoNothing()
      .returning({ id: schema.personalRecords.id })
  ).length;

  inserted.notifications = (
    await db
      .insert(schema.notifications)
      .values(
        mockNotifications.map((notification) => ({
          id: notification.id,
          organizationId: ORG_1,
          memberId: notification.memberId,
          type: notification.type,
          title: notification.title,
          body: notification.body,
          read: notification.read,
          createdAt: toDate(notification.createdAt),
        })),
      )
      .onConflictDoNothing()
      .returning({ id: schema.notifications.id })
  ).length;

  for (const [table, n] of Object.entries(inserted)) {
    if (table !== "organizations" && table !== "memberships") {
      log(`${table}: +${n}`);
    }
  }

  return { inserted, demoUsers };
}
