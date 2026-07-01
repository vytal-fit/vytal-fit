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
 *     types, classes, bookings, check-ins, WODs, plans,
 *     subscriptions, gym members, leads, personal records, notifications,
 *     support tickets).
 *     Mock ids are kept verbatim — every domain table uses text PKs.
 *  4. One organization_settings row per org, derived from the
 *     ORGANIZATION_CONFIGS defaults for its type.
 *
 * Idempotency: domain rows use `ON CONFLICT DO NOTHING` on their stable mock
 * ids; users are looked up by email and memberships by (organization, user)
 * before insertion. Re-running is always safe and inserts zero new rows.
 *
 * Date relativity: classes, WODs and check-ins are seeded across a RELATIVE
 * window (check-ins span the last 14 days; classes/WODs yesterday / today /
 * tomorrow) computed at seed time, so "today" agenda views always have data
 * regardless of when the seed ran. Because `ON CONFLICT DO NOTHING` would
 * leave previously-seeded rows pinned to the old run date, every run also
 * REFRESHES the date columns of the seeded class/WOD/check-in ids —
 * re-seeding an old database moves its agenda back to "now".
 *
 * This module is deliberately NOT exported from the package root so that the
 * mock dataset never ends up in app bundles — import it via
 * `@vytal-fit/db/seed` (or a relative path inside this package).
 */
import { and, eq } from "drizzle-orm";
import {
  ORGANIZATION_CONFIGS,
  mockClasses,
  mockClassTypes,
  mockCoaches,
  mockCurrentUser,
  mockLeads,
  mockLocations,
  mockMembers,
  mockNotifications,
  mockOrgAccentColors,
  mockPersonalRecords,
  mockPlans,
  mockSubscriptions,
  mockWODs,
  type BookingStatus,
  type WOD,
} from "@vytal-fit/shared";
import type { Database } from "./client";
import * as schema from "./schema";
import { defaultPublicSite, type CheckInMethod, type StoredWODPart } from "./schema";

/** Org-1 monthly budget plan. Subcategories mirror the seeded expense ledger so
 *  the budget page shows real actual-vs-limit on those lines. */
const ORG1_BUDGET = {
  lines: [
    { category: "Fixed" as const, subcategory: "Renda", limit: 2500 },
    { category: "Fixed" as const, subcategory: "Seguro", limit: 200 },
    { category: "Fixed" as const, subcategory: "Utilidades", limit: 350 },
    { category: "Variable" as const, subcategory: "Equipamento", limit: 600 },
    { category: "Variable" as const, subcategory: "Limpeza", limit: 150 },
    { category: "Variable" as const, subcategory: "Marketing", limit: 300 },
    { category: "Tax" as const, subcategory: "IVA", limit: 900 },
    { category: "Tax" as const, subcategory: "Segurança Social", limit: 700 },
  ],
};

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

/**
 * Demo check-ins into org-1 (mock dataset has none of its own). Date-relative
 * like classes: a handful today tied to today's classes/bookings, the rest a
 * deterministic open-gym pattern spread over the last 13 days (no
 * Math.random — same ids/offsets/methods on every run). `checkedInAt` is
 * refreshed on re-run so the window always tracks "now".
 */
export interface CheckInSeedSpec {
  id: string;
  memberId: string;
  classId: string | null;
  bookingId: string | null;
  method: CheckInMethod;
  /** Days relative to the seed run (0 = today, negative = past). */
  dayOffset: number;
  /** HH:MM, combined with the offset day (UTC, same convention as classes). */
  time: string;
}

const CHECK_IN_METHOD_CYCLE: readonly CheckInMethod[] = ["qr", "kiosk", "manual", "app"];

function buildCheckInSeed(): readonly CheckInSeedSpec[] {
  const specs: CheckInSeedSpec[] = [
    // Today — tied to today's classes and their demo bookings.
    { id: "checkin-1", memberId: "m-1", classId: "cl-1", bookingId: "bk-1", method: "qr", dayOffset: 0, time: "07:02" },
    { id: "checkin-2", memberId: "m-2", classId: "cl-1", bookingId: "bk-2", method: "app", dayOffset: 0, time: "07:05" },
    { id: "checkin-3", memberId: "m-3", classId: "cl-2", bookingId: "bk-3", method: "kiosk", dayOffset: 0, time: "09:01" },
    { id: "checkin-4", memberId: "m-7", classId: "cl-5", bookingId: "bk-5", method: "manual", dayOffset: 0, time: "17:58" },
    // Yesterday — tied to the history class cl-10.
    { id: "checkin-5", memberId: "m-4", classId: "cl-10", bookingId: null, method: "qr", dayOffset: -1, time: "18:03" },
  ];
  // Open-gym history: 25 deterministic entries over the last 13 days.
  for (let i = 6; i <= 30; i++) {
    const n = i - 6; // 0..24
    specs.push({
      id: `checkin-${i}`,
      memberId: `m-${(n % 7) + 1}`,
      classId: null,
      bookingId: null,
      method: CHECK_IN_METHOD_CYCLE[n % CHECK_IN_METHOD_CYCLE.length] as CheckInMethod,
      dayOffset: -((n % 13) + 1),
      time: `${String(7 + ((n * 3) % 12)).padStart(2, "0")}:15`,
    });
  }
  return specs;
}

export const CHECK_IN_SEED: readonly CheckInSeedSpec[] = buildCheckInSeed();

/** Timestamp for a check-in spec — offset day + HH:MM, UTC like class dates. */
function checkInSeedTimestamp(spec: CheckInSeedSpec): Date {
  return new Date(`${isoDateFromToday(spec.dayOffset)}T${spec.time}:00.000Z`);
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

/** Support tickets seeded into org-1 so the support page starts populated. */
export const SUPPORT_TICKET_SEED = [
  {
    id: "tk-1",
    number: 1001,
    subject: "Pagamento duplicado no mes de Maio",
    memberName: "Ana Silva",
    priority: "high",
    status: "open",
    createdAt: "2026-06-03T10:30:00Z",
    assignedTo: "Andre Loureiro",
    description: "Foi-me cobrado duas vezes o valor do plano mensal em Maio. Preciso de reembolso.",
    messages: [
      { id: "m1", author: "Ana Silva", isStaff: false, content: "Bom dia, verifiquei que fui cobrada duas vezes. Podem verificar?", date: "2026-06-03T10:30:00Z" },
      { id: "m2", author: "Andre Loureiro", isStaff: true, content: "Bom dia Ana! Vou verificar com o departamento financeiro.", date: "2026-06-03T11:00:00Z" },
      { id: "m3", author: "Ana Silva", isStaff: false, content: "Obrigada, fico a aguardar.", date: "2026-06-03T11:15:00Z" },
    ],
    internalNotes: "Verificar com Stripe - possivel duplicacao de webhook.",
  },
  {
    id: "tk-2",
    number: 1002,
    subject: "Nao consigo reservar aula de quarta",
    memberName: "Pedro Almeida",
    priority: "medium",
    status: "in_progress",
    createdAt: "2026-06-02T14:00:00Z",
    assignedTo: "Marine Robba",
    description: "A app da erro quando tento reservar a aula das 18:00 de quarta-feira.",
    messages: [
      { id: "m1", author: "Pedro Almeida", isStaff: false, content: "A app da-me um erro 500 quando tento reservar.", date: "2026-06-02T14:00:00Z" },
      { id: "m2", author: "Marine Robba", isStaff: true, content: "Pode enviar-nos um screenshot do erro?", date: "2026-06-02T14:30:00Z" },
      { id: "m3", author: "Pedro Almeida", isStaff: false, content: "Ja enviei por email.", date: "2026-06-02T15:00:00Z" },
    ],
    internalNotes: "Bug reportado a equipa de dev. Ticket interno #DEV-234.",
  },
  {
    id: "tk-3",
    number: 1003,
    subject: "Rower da zona 2 esta avariado",
    memberName: "Tiago Neves",
    priority: "medium",
    status: "open",
    createdAt: "2026-06-02T09:00:00Z",
    assignedTo: "Ricardo Ribeiro",
    description: "O rower numero 4 na zona 2 tem a correia partida.",
    messages: [
      { id: "m1", author: "Tiago Neves", isStaff: false, content: "O rower 4 na zona 2 nao funciona, a correia esta partida.", date: "2026-06-02T09:00:00Z" },
    ],
    internalNotes: "",
  },
  {
    id: "tk-4",
    number: 1004,
    subject: "Quero mudar para plano anual",
    memberName: "Sofia Santos",
    priority: "low",
    status: "resolved",
    createdAt: "2026-06-01T16:00:00Z",
    assignedTo: "Andre Loureiro",
    description: "Gostaria de mudar do plano mensal para o plano anual.",
    messages: [
      { id: "m1", author: "Sofia Santos", isStaff: false, content: "Ola, quero mudar para o plano anual. Como faco?", date: "2026-06-01T16:00:00Z" },
      { id: "m2", author: "Andre Loureiro", isStaff: true, content: "Ja atualizamos o seu plano! A diferenca sera ajustada na proxima fatura.", date: "2026-06-01T17:00:00Z" },
      { id: "m3", author: "Sofia Santos", isStaff: false, content: "Excelente, obrigada!", date: "2026-06-01T17:15:00Z" },
    ],
    internalNotes: "Plano atualizado. Diferenca de 180 EUR cobrada.",
  },
  {
    id: "tk-5",
    number: 1005,
    subject: "Ac nao funciona na sala 1",
    memberName: "Catarina Reis",
    priority: "high",
    status: "in_progress",
    createdAt: "2026-06-01T11:00:00Z",
    assignedTo: "Ricardo Ribeiro",
    description: "O ar condicionado da sala 1 nao esta a funcionar. A temperatura esta insuportavel.",
    messages: [
      { id: "m1", author: "Catarina Reis", isStaff: false, content: "O AC da sala 1 esta avariado. Esta impossivel treinar.", date: "2026-06-01T11:00:00Z" },
      { id: "m2", author: "Ricardo Ribeiro", isStaff: true, content: "Ja contactamos o tecnico. Deve estar resolvido amanha.", date: "2026-06-01T12:00:00Z" },
    ],
    internalNotes: "Tecnico agendado para 2/Jun.",
  },
  {
    id: "tk-6",
    number: 1006,
    subject: "Perdi o meu cartao de acesso",
    memberName: "Miguel Costa",
    priority: "low",
    status: "resolved",
    createdAt: "2026-05-30T08:00:00Z",
    assignedTo: "Marine Robba",
    description: "Perdi o meu cartao RFID de acesso ao box.",
    messages: [
      { id: "m1", author: "Miguel Costa", isStaff: false, content: "Perdi o cartao, como obtenho um novo?", date: "2026-05-30T08:00:00Z" },
      { id: "m2", author: "Marine Robba", isStaff: true, content: "Pode passar na recepcao para pedir um novo. Custo de 5 EUR.", date: "2026-05-30T09:00:00Z" },
    ],
    internalNotes: "",
  },
] as const;

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

  // Coach certifications (date-relative so the page always shows a mix of
  // valid / expiring-soon / expired). Status is derived at read time.
  inserted.coachCertifications = (
    await db
      .insert(schema.coachCertifications)
      .values(
        [
          { coachId: "coach-1", name: "CrossFit Level 3", issued: -820, expiry: 610 },
          { coachId: "coach-1", name: "First Aid & CPR", issued: -170, expiry: 40 },
          { coachId: "coach-1", name: "Weightlifting Coach L2", issued: -520, expiry: 210 },
          { coachId: "coach-2", name: "CrossFit Level 2", issued: -1010, expiry: 80 },
          { coachId: "coach-2", name: "Nutrition Certification", issued: -390, expiry: 30 },
          { coachId: "coach-3", name: "CrossFit Level 1", issued: -1330, expiry: -35 },
          { coachId: "coach-3", name: "Hyrox Coach", issued: -300, expiry: 700 },
          { coachId: "coach-3", name: "First Aid", issued: -770, expiry: -60 },
          { coachId: "coach-4", name: "CrossFit Level 1", issued: -480, expiry: 560 },
          { coachId: "coach-4", name: "CPR Certification", issued: -210, expiry: 55 },
        ].map((c, i) => ({
          id: `cert-${i + 1}`,
          organizationId: ORG_1,
          coachId: c.coachId,
          name: c.name,
          issuedDate: isoDateFromToday(c.issued),
          expiryDate: isoDateFromToday(c.expiry),
          documentUrl: null,
        })),
      )
      .onConflictDoNothing()
      .returning({ id: schema.coachCertifications.id })
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

  // Member groups (segments) + their memberships. Only reference org-1 members.
  const org1MemberIds = mockMembers
    .filter((m) => m.organizationId === ORG_1)
    .map((m) => m.id);
  const groupSeeds = [
    { id: "grp-1", name: "Competition Team", description: "Atletas que competem em throwdowns e competicoes", color: "#f59e0b", take: [0, 1, 2] },
    { id: "grp-2", name: "Beginners", description: "Membros nos primeiros 3 meses", color: "#8b5cf6", take: [3, 4, 5, 6] },
    { id: "grp-3", name: "VIP Members", description: "Membros com plano anual ou premium", color: "#ec4899", take: [7, 8] },
    { id: "grp-4", name: "CF Teens", description: "Membros adolescentes (13-17 anos)", color: "#3b82f6", take: [9, 10, 11] },
  ];
  inserted.memberGroups = (
    await db
      .insert(schema.memberGroups)
      .values(
        groupSeeds.map((g) => ({
          id: g.id,
          organizationId: ORG_1,
          name: g.name,
          description: g.description,
          color: g.color,
        })),
      )
      .onConflictDoNothing()
      .returning({ id: schema.memberGroups.id })
  ).length;

  const groupMemberRows = groupSeeds.flatMap((g) =>
    g.take
      .map((idx) => org1MemberIds[idx])
      .filter((mid): mid is string => Boolean(mid))
      .map((mid) => ({ id: `${g.id}:${mid}`, groupId: g.id, memberId: mid })),
  );
  inserted.memberGroupMembers = groupMemberRows.length
    ? (
        await db
          .insert(schema.memberGroupMembers)
          .values(groupMemberRows)
          .onConflictDoNothing()
          .returning({ id: schema.memberGroupMembers.id })
      ).length
    : 0;

  inserted.classTemplates = (
    await db
      .insert(schema.classTemplates)
      .values(
        [
          { id: "ctpl-1", name: "Morning WOD (Mon-Fri 07:00)", classType: "WOD", time: "07:00", duration: "60 min", coach: "Andre Loureiro", capacity: 20, location: "Main Box", days: "Mon-Fri" },
          { id: "ctpl-2", name: "Lunch Strength (Tue/Thu 12:00)", classType: "Strength", time: "12:00", duration: "75 min", coach: "Marine Robba", capacity: 15, location: "Main Box", days: "Tue/Thu" },
          { id: "ctpl-3", name: "Evening WOD (Mon-Fri 17:30)", classType: "WOD", time: "17:30", duration: "60 min", coach: "Ricardo Ribeiro", capacity: 24, location: "Main Box", days: "Mon-Fri" },
          { id: "ctpl-4", name: "Saturday Open Box", classType: "Open Box", time: "10:00", duration: "120 min", coach: "Silvina Resende", capacity: 30, location: "Main Box", days: "Sat" },
        ].map((tpl) => ({ ...tpl, organizationId: ORG_1 })),
      )
      .onConflictDoNothing()
      .returning({ id: schema.classTemplates.id })
  ).length;

  // Community feed: a mix of a pinned staff announcement, auto-events and
  // athlete posts, with reactions + a couple of comments. Times are relative.
  const minsAgo = (m: number) => new Date(Date.now() - m * 60_000);
  const communitySeed = [
    { id: "cp-1", authorName: "Coach Miguel", authorType: "coach", kind: "announcement", content: "Amanhã: FRAN edition às 18:30. Vamos com tudo! 🔥", pinned: true, mins: 60 },
    { id: "cp-2", authorName: "Ana Silva", authorType: "athlete", kind: "auto_pr", content: "bateu PR no Back Squat com 95 kg!", pinned: false, mins: 130 },
    { id: "cp-3", authorName: "Pedro Ferreira", authorType: "athlete", kind: "auto_milestone", content: "completou 100 check-ins no box!", pinned: false, mins: 200 },
    { id: "cp-4", authorName: "Mariana Costa", authorType: "athlete", kind: "post", content: "Alguém para o open gym de sábado de manhã?", pinned: false, mins: 320 },
    { id: "cp-5", authorName: "Rui Mendes", authorType: "athlete", kind: "auto_pr", content: "fez PR no Clean & Jerk com 110 kg!", pinned: false, mins: 500 },
    { id: "cp-6", authorName: "Silvina Resende", authorType: "owner", kind: "announcement", content: "Novo horário de verão em vigor a partir de segunda. Vejam o calendário.", pinned: false, mins: 900 },
  ];
  inserted.communityPosts = (
    await db
      .insert(schema.communityPosts)
      .values(
        communitySeed.map((p) => ({
          id: p.id,
          organizationId: ORG_1,
          authorUserId: null,
          authorName: p.authorName,
          authorType: p.authorType,
          kind: p.kind,
          content: p.content,
          pinned: p.pinned,
          createdAt: minsAgo(p.mins),
        })),
      )
      .onConflictDoNothing()
      .returning({ id: schema.communityPosts.id })
  ).length;

  // Reactions: spread distinct actor ids so counts look organic.
  const reactionRows = communitySeed.flatMap((p, pi) => {
    const n = [14, 22, 31, 5, 9, 8][pi] ?? 3;
    return Array.from({ length: Math.min(n, 12) }, (_, i) => ({
      id: `cr-${p.id}-${i}`,
      organizationId: ORG_1,
      postId: p.id,
      actorId: `seed-actor-${i}`,
      createdAt: minsAgo(p.mins - 1),
    }));
  });
  inserted.communityReactions = (
    await db
      .insert(schema.communityReactions)
      .values(reactionRows)
      .onConflictDoNothing()
      .returning({ id: schema.communityReactions.id })
  ).length;

  inserted.communityComments = (
    await db
      .insert(schema.communityComments)
      .values([
        { id: "cc-1", organizationId: ORG_1, postId: "cp-1", authorUserId: null, authorName: "Ana Silva", authorType: "athlete", content: "Vamos! 💪", createdAt: minsAgo(50) },
        { id: "cc-2", organizationId: ORG_1, postId: "cp-1", authorUserId: null, authorName: "Rui Mendes", authorType: "athlete", content: "Conta comigo", createdAt: minsAgo(40) },
        { id: "cc-3", organizationId: ORG_1, postId: "cp-4", authorUserId: null, authorName: "Coach Miguel", authorType: "coach", content: "Abro o box às 09:00 :)", createdAt: minsAgo(300) },
      ])
      .onConflictDoNothing()
      .returning({ id: schema.communityComments.id })
  ).length;

  // Audit log: a realistic historical trail so every filter has data. Grows
  // live as members/API keys are created/updated/archived (see recordAudit).
  const auditSeed: {
    actor: string; action: string; resource: string; details: string; expanded?: string; mins: number;
  }[] = [
    { actor: "André Loureiro", action: "create", resource: "Member", details: "Criou o membro Carlos Mendes (#42)", expanded: "Plano: Mensal (75 EUR) · Origem: Referência", mins: 30 },
    { actor: "Marine Robba", action: "update", resource: "Member", details: "Atualizou estado: Maria Oliveira → inativo", expanded: "Estado anterior: ativo · Motivo: sem presença há 45 dias", mins: 95 },
    { actor: "André Loureiro", action: "settings", resource: "API Key", details: "Criou API key: Produção", expanded: "Prefix: vk_live_a1b2····9f3c", mins: 180 },
    { actor: "System", action: "payment", resource: "Payment", details: "Pagamento de 75 EUR processado para Rita Costa", expanded: "Método: MB Way", mins: 240 },
    { actor: "Ricardo Ribeiro", action: "create", resource: "Class", details: "Criou aula CrossFit para amanhã 18:00", mins: 320 },
    { actor: "André Loureiro", action: "delete", resource: "Class", details: "Cancelou Open Box de sábado", expanded: "Motivo: treinador indisponível · 3 membros notificados", mins: 400 },
    { actor: "Marine Robba", action: "crm", resource: "Lead", details: "Lead mudou de fase: Helena Cardoso → Contactado", mins: 500 },
    { actor: "André Loureiro", action: "settings", resource: "Permission", details: "Alterou função de Marine Robba: Staff → Gestor", mins: 620 },
    { actor: "Ricardo Ribeiro", action: "create", resource: "WOD", details: "Publicou WOD de hoje (FRAN)", mins: 900 },
    { actor: "System", action: "payment", resource: "Payment", details: "Pagamento de 60 EUR falhou para Ana Ferreira", expanded: "Erro: fundos insuficientes · retry agendado", mins: 1100 },
    { actor: "André Loureiro", action: "export", resource: "Report", details: "Exportou relatório de presenças (mês anterior)", expanded: "Formato: CSV · 1.247 registos", mins: 1400 },
    { actor: "Marine Robba", action: "update", resource: "Plan", details: "Alterou plano de Pedro Almeida: Mensal → Anual", mins: 1600 },
  ];
  inserted.auditLogs = (
    await db
      .insert(schema.auditLogs)
      .values(
        auditSeed.map((a, i) => ({
          id: `audit-${i + 1}`,
          organizationId: ORG_1,
          actorName: a.actor,
          action: a.action,
          resource: a.resource,
          details: a.details,
          expandedDetails: a.expanded ?? null,
          ip: a.actor === "System" ? null : "192.168.1.10",
          createdAt: minsAgo(a.mins),
        })),
      )
      .onConflictDoNothing()
      .returning({ id: schema.auditLogs.id })
  ).length;

  // Webhooks + a couple of delivery records (mix of success + failure).
  inserted.webhooks = (
    await db
      .insert(schema.webhooks)
      .values([
        { id: "wh-1", organizationId: ORG_1, name: "Zapier: Novo Membro", url: "https://hooks.zapier.com/hooks/catch/123456/abcdef", events: ["member.created", "member.updated"], secret: "whsec_seed_a1b2c3d4e5f6a1b2c3d4e5f6", active: true, lastTriggeredAt: minsAgo(120), successCount: 48, failureCount: 1 },
        { id: "wh-2", organizationId: ORG_1, name: "Slack: Pagamentos", url: "https://hooks.slack.com/services/T000/B000/XXXX", events: ["payment.success", "payment.failed"], secret: "whsec_seed_f6e5d4c3b2a1f6e5d4c3b2a1", active: true, lastTriggeredAt: minsAgo(35), successCount: 30, failureCount: 0 },
        { id: "wh-3", organizationId: ORG_1, name: "Custom: Aula cheia", url: "https://api.example.com/webhooks/vytal", events: ["class.booked", "class.cancelled"], secret: "whsec_seed_112233445566778899aabbcc", active: false, lastTriggeredAt: minsAgo(4320), successCount: 12, failureCount: 3 },
      ])
      .onConflictDoNothing()
      .returning({ id: schema.webhooks.id })
  ).length;
  inserted.webhookDeliveries = (
    await db
      .insert(schema.webhookDeliveries)
      .values([
        { id: "wd-1", organizationId: ORG_1, webhookId: "wh-2", event: "payment.success", statusCode: 200, ok: true, responseMs: 142, payload: '{"event":"payment.success","data":{"memberId":"m-1","amount":75}}', createdAt: minsAgo(35) },
        { id: "wd-2", organizationId: ORG_1, webhookId: "wh-1", event: "member.created", statusCode: 200, ok: true, responseMs: 238, payload: '{"event":"member.created","data":{"id":"m-12","name":"Carlos Mendes"}}', createdAt: minsAgo(120) },
        { id: "wd-3", organizationId: ORG_1, webhookId: "wh-3", event: "class.booked", statusCode: 500, ok: false, responseMs: 5012, payload: '{"event":"class.booked","data":{"classId":"cl-5"}}', createdAt: minsAgo(4320) },
      ])
      .onConflictDoNothing()
      .returning({ id: schema.webhookDeliveries.id })
  ).length;

  inserted.backups = (
    await db
      .insert(schema.backups)
      .values([
        { id: "bk-1", organizationId: ORG_1, sections: ["members", "classes", "payments", "wods", "crm"], format: "json", sizeBytes: 4_404_019, createdAt: minsAgo(1440) },
        { id: "bk-2", organizationId: ORG_1, sections: ["members", "payments"], format: "csv", sizeBytes: 1_153_024, createdAt: minsAgo(10080) },
      ])
      .onConflictDoNothing()
      .returning({ id: schema.backups.id })
  ).length;

  inserted.campaigns = (
    await db
      .insert(schema.campaigns)
      .values([
        { id: "camp-1", organizationId: ORG_1, name: "Desafio de Verão", subject: "Junta-te ao desafio de verão 🔥", body: "<p>Treina connosco este verão e ganha prémios!</p>", audience: "all_active", status: "sent", sentCount: 118, skippedCount: 4, failedCount: 1, sentAt: minsAgo(2880) },
        { id: "camp-2", organizationId: ORG_1, name: "Reativação inativos", subject: "Sentimos a tua falta", body: "<p>Volta ao box com 20% no próximo mês.</p>", audience: "all_active", status: "draft" },
      ])
      .onConflictDoNothing()
      .returning({ id: schema.campaigns.id })
  ).length;
  inserted.emailSuppressions = (
    await db
      .insert(schema.emailSuppressions)
      .values([
        { id: "sup-1", organizationId: ORG_1, email: "opted.out@example.com", reason: "unsubscribe" },
      ])
      .onConflictDoNothing()
      .returning({ id: schema.emailSuppressions.id })
  ).length;

  // Media library catalog.
  inserted.mediaAssets = (
    await db
      .insert(schema.mediaAssets)
      .values([
        { id: "media-1", organizationId: ORG_1, name: "Back Squat Tutorial", type: "video", folder: "Exercises", sizeBytes: 47_185_920, uploadedBy: "André Loureiro" },
        { id: "media-2", organizationId: ORG_1, name: "Clean & Jerk Demo", type: "video", folder: "Exercises", sizeBytes: 65_011_712, uploadedBy: "Ricardo Ribeiro" },
        { id: "media-3", organizationId: ORG_1, name: "Team Photo Junho", type: "image", folder: "Events", sizeBytes: 5_347_737, uploadedBy: "Marine Robba" },
        { id: "media-4", organizationId: ORG_1, name: "Logo alta resolução", type: "image", folder: "Marketing", sizeBytes: 1_258_291, uploadedBy: "Silvina Resende" },
        { id: "media-5", organizationId: ORG_1, name: "Contrato de adesão.pdf", type: "document", folder: "Documents", sizeBytes: 327_680, uploadedBy: "Silvina Resende" },
        { id: "media-6", organizationId: ORG_1, name: "PAR-Q.pdf", type: "document", folder: "Documents", sizeBytes: 184_320, uploadedBy: "Silvina Resende" },
      ])
      .onConflictDoNothing()
      .returning({ id: schema.mediaAssets.id })
  ).length;

  // Automation drip sequences + steps + a few enrollments.
  inserted.automationSequences = (
    await db
      .insert(schema.automationSequences)
      .values([
        { id: "seq-1", organizationId: ORG_1, name: "Boas-vindas a novos membros", trigger: "new_member", active: true },
        { id: "seq-2", organizationId: ORG_1, name: "Reativação de inativos", trigger: "inactive", active: false },
      ])
      .onConflictDoNothing()
      .returning({ id: schema.automationSequences.id })
  ).length;
  inserted.automationSteps = (
    await db
      .insert(schema.automationSteps)
      .values([
        { id: "step-1", organizationId: ORG_1, sequenceId: "seq-1", stepOrder: 0, delayDays: 0, subject: "Bem-vindo ao box! 🎉", body: "<p>Estamos muito felizes por te ter connosco.</p>" },
        { id: "step-2", organizationId: ORG_1, sequenceId: "seq-1", stepOrder: 1, delayDays: 3, subject: "Dicas para os primeiros treinos", body: "<p>Aqui vão dicas para arrancares bem.</p>" },
        { id: "step-3", organizationId: ORG_1, sequenceId: "seq-1", stepOrder: 2, delayDays: 7, subject: "Como está a correr?", body: "<p>Uma semana depois: conta-nos como vai.</p>" },
        { id: "step-4", organizationId: ORG_1, sequenceId: "seq-2", stepOrder: 0, delayDays: 0, subject: "Sentimos a tua falta", body: "<p>Volta ao box, temos novidades.</p>" },
        { id: "step-5", organizationId: ORG_1, sequenceId: "seq-2", stepOrder: 1, delayDays: 7, subject: "20% para regressares", body: "<p>Oferta especial de regresso.</p>" },
      ])
      .onConflictDoNothing()
      .returning({ id: schema.automationSteps.id })
  ).length;
  inserted.automationEnrollments = (
    await db
      .insert(schema.automationEnrollments)
      .values(
        mockMembers
          .filter((m) => m.organizationId === ORG_1)
          .slice(0, 8)
          .map((m, i) => ({
            id: `enr-${i + 1}`,
            organizationId: ORG_1,
            sequenceId: "seq-1",
            memberEmail: m.email,
            currentStep: (i % 3) + 1,
            status: i % 4 === 0 ? "completed" : "active",
            sentCount: (i % 3) + 1,
            lastSentAt: minsAgo(i * 300 + 60),
          })),
      )
      .onConflictDoNothing()
      .returning({ id: schema.automationEnrollments.id })
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

  inserted.checkIns = (
    await db
      .insert(schema.checkIns)
      .values(
        CHECK_IN_SEED.map((spec) => ({
          id: spec.id,
          organizationId: ORG_1,
          memberId: spec.memberId,
          classId: spec.classId,
          bookingId: spec.bookingId,
          method: spec.method,
          checkedInAt: checkInSeedTimestamp(spec),
        })),
      )
      .onConflictDoNothing()
      .returning({ id: schema.checkIns.id })
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
  for (const spec of CHECK_IN_SEED) {
    await db
      .update(schema.checkIns)
      .set({ checkedInAt: checkInSeedTimestamp(spec) })
      .where(eq(schema.checkIns.id, spec.id));
  }
  log("classes/wods/check-ins: dates refreshed to the relative window");

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

  // Payment ledger: 6 monthly payments per org-1 subscription (plan price),
  // with the latest month varied across overdue/pending so the financials
  // dashboard shows a realistic mix.
  const planPriceById = new Map(mockPlans.map((p) => [p.id, p.price]));
  const PAY_METHODS = ["mbway", "multibanco", "sepa", "card", "cash"] as const;
  const payNow = new Date();
  let invSeq = 100;
  const paymentRows = mockSubscriptions.flatMap((sub, si) => {
    const price = planPriceById.get(sub.planId) ?? 50;
    const method = PAY_METHODS[si % PAY_METHODS.length];
    return Array.from({ length: 6 }, (_, k) => {
      const m = 5 - k;
      const d = new Date(Date.UTC(payNow.getUTCFullYear(), payNow.getUTCMonth() - m, 5));
      let status: schema.PaymentStatus = "paid";
      if (m === 0 && si % 5 === 0) status = "overdue";
      else if (m === 0 && si % 5 === 1) status = "pending";
      return {
        id: `pay-${sub.id}-${m}`,
        organizationId: ORG_1,
        memberId: sub.memberId,
        planId: sub.planId,
        amount: String(price),
        currency: "EUR",
        method,
        status,
        reference: `INV-2026-${String(invSeq++).padStart(4, "0")}`,
        dueDate: status === "paid" ? null : d.toISOString().slice(0, 10),
        paidAt: status === "paid" ? d : null,
      };
    });
  });

  // Insert in chunks: a single ~150-row payload can trip flaky TLS on pooled
  // Neon connections. Chunking keeps each statement small and resumable.
  let paymentsInserted = 0;
  for (let i = 0; i < paymentRows.length; i += 50) {
    const chunk = paymentRows.slice(i, i + 50);
    paymentsInserted += (
      await db
        .insert(schema.payments)
        .values(chunk)
        .onConflictDoNothing()
        .returning({ id: schema.payments.id })
    ).length;
  }
  inserted.payments = paymentsInserted;

  // A small operating-expense ledger for org-1 (last weeks).
  const expenseSeed: {
    id: string;
    date: string;
    category: schema.ExpenseCategoryKind;
    subcategory: string;
    amount: string;
    method: string;
    description: string;
    hasReceipt: boolean;
  }[] = [
    { id: "exp-1", date: "2026-06-01", category: "Fixed", subcategory: "Renda", amount: "2500", method: "transfer", description: "Renda mensal do espaço", hasReceipt: true },
    { id: "exp-2", date: "2026-06-01", category: "Fixed", subcategory: "Seguro", amount: "180", method: "transfer", description: "Prémio de seguro", hasReceipt: true },
    { id: "exp-3", date: "2026-05-30", category: "Variable", subcategory: "Equipamento", amount: "450", method: "card", description: "Cordas e bandas de substituição", hasReceipt: true },
    { id: "exp-4", date: "2026-05-28", category: "Variable", subcategory: "Limpeza", amount: "120", method: "transfer", description: "Serviço de limpeza mensal", hasReceipt: false },
    { id: "exp-5", date: "2026-05-25", category: "Tax", subcategory: "IVA", amount: "890", method: "transfer", description: "Pagamento de IVA Q2", hasReceipt: true },
    { id: "exp-6", date: "2026-05-22", category: "Variable", subcategory: "Marketing", amount: "200", method: "card", description: "Campanha Instagram", hasReceipt: true },
    { id: "exp-7", date: "2026-05-20", category: "Fixed", subcategory: "Utilidades", amount: "310", method: "transfer", description: "Eletricidade", hasReceipt: true },
    { id: "exp-8", date: "2026-05-18", category: "Tax", subcategory: "Segurança Social", amount: "650", method: "transfer", description: "Contribuições de funcionários", hasReceipt: false },
  ];
  inserted.expenses = (
    await db
      .insert(schema.expenses)
      .values(expenseSeed.map((e) => ({ ...e, organizationId: ORG_1 })))
      .onConflictDoNothing()
      .returning({ id: schema.expenses.id })
  ).length;

  // Contract templates + per-member contracts (digital waivers, F2).
  inserted.contractTemplates = (
    await db
      .insert(schema.contractTemplates)
      .values([
        { id: "tpl-1", organizationId: ORG_1, name: "Contrato de Adesão", required: true },
        { id: "tpl-2", organizationId: ORG_1, name: "Termo de Saúde (PAR-Q)", required: true },
        { id: "tpl-3", organizationId: ORG_1, name: "Política de Privacidade (RGPD)", required: true },
      ])
      .onConflictDoNothing()
      .returning({ id: schema.contractTemplates.id })
  ).length;

  const contractRows = mockMembers
    .filter((m) => m.organizationId === ORG_1)
    .flatMap((m, i) => {
      const joined = toDate(m.joinedAt);
      const joinedYmd = joined.toISOString().slice(0, 10);
      const expiry = new Date(joined.getTime() + 365 * 86_400_000).toISOString().slice(0, 10);
      const membershipStatus: schema.ContractStatus =
        i % 7 === 0 ? "expired" : i % 5 === 0 ? "pending" : "signed";
      return [
        {
          id: `ct-${m.id}-membership`,
          organizationId: ORG_1,
          memberId: m.id,
          contractType: "Contrato de Adesão",
          status: membershipStatus,
          signedDate: membershipStatus === "pending" ? null : joinedYmd,
          expiryDate: expiry,
        },
        {
          id: `ct-${m.id}-parq`,
          organizationId: ORG_1,
          memberId: m.id,
          contractType: "Termo de Saúde (PAR-Q)",
          status: (i % 6 === 0 ? "pending" : "signed") as schema.ContractStatus,
          signedDate: i % 6 === 0 ? null : joinedYmd,
          expiryDate: null,
        },
      ];
    });
  inserted.memberContracts = (
    await db
      .insert(schema.memberContracts)
      .values(contractRows)
      .onConflictDoNothing()
      .returning({ id: schema.memberContracts.id })
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

  // Lead timeline entries derived from each org-1 lead's current state, so the
  // CRM detail view shows a real (not mocked) activity history.
  const leadActivityRows = mockLeads
    .filter((lead) => lead.organizationId === ORG_1)
    .flatMap((lead) => {
      const base = toDate(lead.createdAt);
      const rows: {
        id: string;
        organizationId: string;
        leadId: string;
        type: schema.LeadActivityType;
        title: string;
        details: string | null;
        createdAt: Date;
      }[] = [
        {
          id: `act-${lead.id}-created`,
          organizationId: ORG_1,
          leadId: lead.id,
          type: "stage_change",
          title: "Lead criada",
          details: `Origem: ${lead.source ?? "desconhecida"}.`,
          createdAt: base,
        },
      ];
      if (lead.notes) {
        rows.push({
          id: `act-${lead.id}-note`,
          organizationId: ORG_1,
          leadId: lead.id,
          type: "note",
          title: "Nota adicionada",
          details: lead.notes,
          createdAt: toOptionalDate(lead.lastContactAt) ?? base,
        });
      }
      if (lead.trialDate) {
        rows.push({
          id: `act-${lead.id}-trial`,
          organizationId: ORG_1,
          leadId: lead.id,
          type: "booking",
          title: "Aula de teste marcada",
          details: "Sessão experimental agendada.",
          createdAt: toDate(lead.trialDate),
        });
      }
      return rows;
    });

  inserted.leadActivities = (
    await db
      .insert(schema.leadActivities)
      .values(leadActivityRows)
      .onConflictDoNothing()
      .returning({ id: schema.leadActivities.id })
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

  // CRM-style message threads (org-1). Timestamps are relative to seed time so
  // the inbox always shows recent activity. `minutesAgo` keeps ordering stable.
  const seedNow = new Date();
  const minutesAgo = (m: number) => new Date(seedNow.getTime() - m * 60_000);
  const CONVERSATION_SEED: {
    id: string;
    contactName: string;
    contactStatus: schema.ConversationContactStatus;
    online: boolean;
    messages: { body: string; fromStaff: boolean; read: boolean; minutesAgo: number }[];
  }[] = [
    {
      id: "conv-1",
      contactName: "Ana Sousa",
      contactStatus: "active",
      online: true,
      messages: [
        { body: "Olá! A aula de amanhã às 18h tem vagas?", fromStaff: false, read: false, minutesAgo: 8 },
        { body: "E posso levar uma amiga para experimentar?", fromStaff: false, read: false, minutesAgo: 7 },
      ],
    },
    {
      id: "conv-2",
      contactName: "Bruno Lima",
      contactStatus: "trial",
      online: false,
      messages: [
        { body: "Confirmo a minha aula experimental de quinta.", fromStaff: false, read: false, minutesAgo: 16 },
        { body: "Perfeito, Bruno! Ficamos à espera às 19h.", fromStaff: true, read: true, minutesAgo: 14 },
      ],
    },
    {
      id: "conv-3",
      contactName: "Carla Mendes",
      contactStatus: "active",
      online: false,
      messages: [
        { body: "O pagamento deste mês já foi processado?", fromStaff: false, read: true, minutesAgo: 70 },
        { body: "Sim, recebido com sucesso. Obrigado!", fromStaff: true, read: true, minutesAgo: 64 },
      ],
    },
    {
      id: "conv-4",
      contactName: "Diogo Faria",
      contactStatus: "inactive",
      online: false,
      messages: [
        { body: "Gostava de retomar o plano. Que opções têm?", fromStaff: false, read: true, minutesAgo: 200 },
        { body: "Bem-vindo de volta! Envio-te os planos hoje.", fromStaff: true, read: true, minutesAgo: 180 },
      ],
    },
    {
      id: "conv-5",
      contactName: "Eva Santos",
      contactStatus: "active",
      online: true,
      messages: [
        { body: "Adorei o WOD de hoje 💪", fromStaff: false, read: true, minutesAgo: 1440 },
      ],
    },
  ];

  inserted.conversations = (
    await db
      .insert(schema.conversations)
      .values(
        CONVERSATION_SEED.map((c) => {
          const last = c.messages[c.messages.length - 1];
          return {
            id: c.id,
            organizationId: ORG_1,
            memberId: null,
            contactName: c.contactName,
            contactStatus: c.contactStatus,
            online: c.online,
            lastMessageAt: minutesAgo(last?.minutesAgo ?? 0),
          };
        }),
      )
      .onConflictDoNothing()
      .returning({ id: schema.conversations.id })
  ).length;

  inserted.messages = (
    await db
      .insert(schema.messages)
      .values(
        CONVERSATION_SEED.flatMap((c) =>
          c.messages.map((m, idx) => ({
            id: `${c.id}-m${idx + 1}`,
            organizationId: ORG_1,
            conversationId: c.id,
            body: m.body,
            fromStaff: m.fromStaff,
            read: m.read,
            createdAt: minutesAgo(m.minutesAgo),
          })),
        ),
      )
      .onConflictDoNothing()
      .returning({ id: schema.messages.id })
  ).length;

  inserted.supportTickets = (
    await db
      .insert(schema.supportTickets)
      .values(
        SUPPORT_TICKET_SEED.map((ticket) => ({
          id: ticket.id,
          organizationId: ORG_1,
          number: ticket.number,
          subject: ticket.subject,
          memberName: ticket.memberName,
          priority: ticket.priority,
          status: ticket.status,
          assignedTo: ticket.assignedTo,
          description: ticket.description,
          messages: ticket.messages.map((message) => ({ ...message })),
          internalNotes: ticket.internalNotes,
          createdAt: toDate(ticket.createdAt),
          updatedAt: toDate(ticket.createdAt),
        })),
      )
      .onConflictDoNothing()
      .returning({ id: schema.supportTickets.id })
  ).length;

  // 3b. Core domain dataset → org-2 (Yoga Flow Porto) and org-3 (Iron Temple).
  // Ids mirror the app's demo mock so the two converge when these orgs' pages
  // move onto the API. Date-relative entities (classes/WODs/check-ins) land with
  // the F2 wiring; this seeds the static core (coaches, locations, class types,
  // members, plans, leads). FK-safe and idempotent (ON CONFLICT DO NOTHING).
  inserted.coachesOrg23 = (
    await db
      .insert(schema.coaches)
      .values([
        { id: "coach-21", organizationId: "org-2", name: "Sofia Menezes", email: "sofia@yogaflowporto.pt", photo: null, role: "head_coach" },
        { id: "coach-22", organizationId: "org-2", name: "Beatriz Ramos", email: "beatriz@yogaflowporto.pt", photo: null, role: "coach" },
        { id: "coach-31", organizationId: "org-3", name: "Rui Lameira", email: "rui@irontemple.pt", photo: null, role: "head_coach" },
        { id: "coach-32", organizationId: "org-3", name: "Sandro Pires", email: "sandro@irontemple.pt", photo: null, role: "coach" },
      ])
      .onConflictDoNothing()
      .returning({ id: schema.coaches.id })
  ).length;

  inserted.locationsOrg23 = (
    await db
      .insert(schema.locations)
      .values([
        { id: "loc-21", organizationId: "org-2", name: "Sala Principal", capacity: 20 },
        { id: "loc-22", organizationId: "org-2", name: "Sala de Meditação", capacity: 10 },
        { id: "loc-31", organizationId: "org-3", name: "Plataforma Principal", capacity: 25 },
        { id: "loc-32", organizationId: "org-3", name: "Sala de Levantamento", capacity: 12 },
      ])
      .onConflictDoNothing()
      .returning({ id: schema.locations.id })
  ).length;

  inserted.classTypesOrg23 = (
    await db
      .insert(schema.classTypes)
      .values([
        { id: "ct-21", organizationId: "org-2", name: "Vinyasa Flow", abbreviation: "VIN", color: "#8b5cf6", icon: null, active: true },
        { id: "ct-22", organizationId: "org-2", name: "Hatha Yoga", abbreviation: "HAT", color: "#a78bfa", icon: null, active: true },
        { id: "ct-23", organizationId: "org-2", name: "Yin Yoga", abbreviation: "YIN", color: "#c4b5fd", icon: null, active: true },
        { id: "ct-24", organizationId: "org-2", name: "Meditação", abbreviation: "MED", color: "#7c3aed", icon: null, active: true },
        { id: "ct-31", organizationId: "org-3", name: "Levantamento Olímpico", abbreviation: "OLY", color: "#ef4444", icon: null, active: true },
        { id: "ct-32", organizationId: "org-3", name: "Powerlifting", abbreviation: "PL", color: "#dc2626", icon: null, active: true },
        { id: "ct-33", organizationId: "org-3", name: "Força Geral", abbreviation: "STR", color: "#f87171", icon: null, active: true },
        { id: "ct-34", organizationId: "org-3", name: "Acessórios", abbreviation: "ACC", color: "#fca5a5", icon: null, active: true },
      ])
      .onConflictDoNothing()
      .returning({ id: schema.classTypes.id })
  ).length;

  inserted.gymMembersOrg23 = (
    await db
      .insert(schema.gymMembers)
      .values([
        { id: "m2-21", organizationId: "org-2", memberNumber: 1, name: "Leonor Azevedo", email: "leonor@example.com", phone: "912111001", gender: "female", status: "active", joinedAt: toDate("2025-01-10"), lastCheckIn: toDate("2026-06-03"), streakWeeks: 10, totalCheckIns: 198 },
        { id: "m2-22", organizationId: "org-2", memberNumber: 2, name: "Marta Vieira", email: "marta@example.com", phone: "913222002", gender: "female", status: "active", joinedAt: toDate("2025-03-15"), lastCheckIn: toDate("2026-06-02"), streakWeeks: 7, totalCheckIns: 142 },
        { id: "m2-23", organizationId: "org-2", memberNumber: 3, name: "Joana Pinto", email: "joana@example.com", phone: "914333003", gender: "female", status: "active", joinedAt: toDate("2025-06-01"), lastCheckIn: toDate("2026-06-01"), streakWeeks: 4, totalCheckIns: 87 },
        { id: "m2-24", organizationId: "org-2", memberNumber: 4, name: "Ricardo Faria", email: "ricardo@example.com", phone: "915444004", gender: "male", status: "trial", joinedAt: toDate("2026-05-20"), lastCheckIn: toDate("2026-06-02"), streakWeeks: 1, totalCheckIns: 5 },
        { id: "m2-25", organizationId: "org-2", memberNumber: 5, name: "Catarina Braga", email: "catarina@example.com", phone: "916555005", gender: "female", status: "inactive", joinedAt: toDate("2024-09-01"), lastCheckIn: toDate("2026-03-10"), streakWeeks: 0, totalCheckIns: 320 },
        { id: "m-31", organizationId: "org-3", memberNumber: 1, name: "Goncalo Vieira", email: "goncalo@example.com", phone: "912100011", gender: "male", status: "active", joinedAt: toDate("2024-05-01"), lastCheckIn: toDate("2026-06-03"), streakWeeks: 20, totalCheckIns: 410 },
        { id: "m-32", organizationId: "org-3", memberNumber: 2, name: "Vitor Santos", email: "vitor@example.com", phone: "913200022", gender: "male", status: "active", joinedAt: toDate("2024-09-10"), lastCheckIn: toDate("2026-06-02"), streakWeeks: 14, totalCheckIns: 280 },
        { id: "m-33", organizationId: "org-3", memberNumber: 3, name: "Patricia Lima", email: "patricia@example.com", phone: "914300033", gender: "female", status: "active", joinedAt: toDate("2025-02-20"), lastCheckIn: toDate("2026-06-01"), streakWeeks: 9, totalCheckIns: 165 },
        { id: "m-34", organizationId: "org-3", memberNumber: 4, name: "Hugo Rodrigues", email: "hugo@example.com", phone: "915400044", gender: "male", status: "trial", joinedAt: toDate("2026-05-28"), lastCheckIn: toDate("2026-06-03"), streakWeeks: 1, totalCheckIns: 4 },
      ])
      .onConflictDoNothing()
      .returning({ id: schema.gymMembers.id })
  ).length;

  inserted.subscriptionPlansOrg23 = (
    await db
      .insert(schema.subscriptionPlans)
      .values([
        { id: "plan-21", organizationId: "org-2", name: "Mensal Livre", type: "monthly", price: "55.00", currency: "EUR", allowedClassTypes: ["ct-21", "ct-22", "ct-23", "ct-24"], active: true },
        { id: "plan-22", organizationId: "org-2", name: "8 Aulas/Mês", type: "monthly", price: "45.00", currency: "EUR", maxSessions: 8, allowedClassTypes: ["ct-21", "ct-22"], active: true },
        { id: "plan-23", organizationId: "org-2", name: "Trimestral Livre", type: "semester", price: "150.00", currency: "EUR", allowedClassTypes: ["ct-21", "ct-22", "ct-23", "ct-24"], active: true },
        { id: "plan-24", organizationId: "org-2", name: "Aula Avulso", type: "day_pass", price: "12.00", currency: "EUR", allowedClassTypes: ["ct-21", "ct-22"], active: true },
        { id: "plan-31", organizationId: "org-3", name: "Mensal Completo", type: "monthly", price: "80.00", currency: "EUR", allowedClassTypes: ["ct-31", "ct-32", "ct-33", "ct-34"], active: true },
        { id: "plan-32", organizationId: "org-3", name: "Levantamento Olímpico", type: "monthly", price: "65.00", currency: "EUR", allowedClassTypes: ["ct-31"], active: true },
        { id: "plan-33", organizationId: "org-3", name: "Semestral Completo", type: "semester", price: "440.00", currency: "EUR", allowedClassTypes: ["ct-31", "ct-32", "ct-33", "ct-34"], active: true },
      ])
      .onConflictDoNothing()
      .returning({ id: schema.subscriptionPlans.id })
  ).length;

  inserted.leadsOrg23 = (
    await db
      .insert(schema.leads)
      .values([
        { id: "lead-21", organizationId: "org-2", name: "Ana Peixoto", email: "ana.p@email.com", phone: "912100001", stage: "lead", source: "Instagram", createdAt: toDate("2026-06-01T10:00:00Z") },
        { id: "lead-22", organizationId: "org-2", name: "Vera Carvalho", email: "vera.c@email.com", phone: "913200002", stage: "contacted", source: "Website", assignedCoachId: "coach-21", createdAt: toDate("2026-05-28T09:00:00Z"), lastContactAt: toDate("2026-05-30T11:00:00Z") },
        { id: "lead-23", organizationId: "org-2", name: "Nuno Seabra", email: "nuno.s@email.com", phone: "914300003", stage: "prospect", source: "Referral", assignedCoachId: "coach-22", createdAt: toDate("2026-05-20T11:00:00Z"), lastContactAt: toDate("2026-06-01T15:00:00Z"), trialDate: toDate("2026-06-07") },
        { id: "lead-24", organizationId: "org-2", name: "Filipa Monteiro", email: "filipa.m@email.com", phone: "915400004", stage: "subscribed", source: "Walk-in", assignedCoachId: "coach-21", createdAt: toDate("2026-04-10T12:00:00Z"), lastContactAt: toDate("2026-05-15T10:00:00Z") },
      ])
      .onConflictDoNothing()
      .returning({ id: schema.leads.id })
  ).length;

  // Store / merch (D7): suppliers (china/pt/eu) + catalog + a few supplier
  // orders for org-1, mirroring the storefront mock so the real shop has data.
  inserted.suppliers = (
    await db
      .insert(schema.suppliers)
      .values([
        { id: "sup-1", organizationId: "org-1", name: "Shenzhen Activewear Co.", region: "china", status: "active", contact: "wei@sz-active.cn", leadTimeDays: 21 },
        { id: "sup-2", organizationId: "org-1", name: "Guangzhou Knit Works", region: "china", status: "active", contact: "lia@gzknit.cn", leadTimeDays: 25 },
        { id: "sup-3", organizationId: "org-1", name: "Porto Print & Stitch", region: "portugal", status: "active", contact: "geral@portoprint.pt", leadTimeDays: 7 },
        { id: "sup-4", organizationId: "org-1", name: "EU Grips Supply", region: "europe", status: "active", contact: "sales@eugrips.eu", leadTimeDays: 12 },
      ])
      .onConflictDoNothing()
      .returning({ id: schema.suppliers.id })
  ).length;

  inserted.storeProducts = (
    await db
      .insert(schema.storeProducts)
      .values([
        { id: "sp-1", organizationId: "org-1", name: "Aero Tee", category: "apparel", price: "25.00", stock: 48, fulfillment: "external", supplierId: "sup-1", sku: "VT-AERO-TEE-BLK", style: "Relaxed fit", color: "Black", size: "S-XXL", branding: "Front chest logo" },
        { id: "sp-2", organizationId: "org-1", name: "Crop Top", category: "apparel", price: "22.00", stock: 35, fulfillment: "external", supplierId: "sup-2", sku: "VT-CROP-SND", style: "Athletic crop", color: "Sand", size: "XS-L", branding: "Back print" },
        { id: "sp-3", organizationId: "org-1", name: "Heavy Hoodie", category: "apparel", price: "35.00", stock: 20, fulfillment: "external", supplierId: "sup-3", sku: "VT-HOOD-GPH", style: "Oversized hoodie", color: "Graphite", size: "S-XXL", branding: "Sleeve mark" },
        { id: "sp-4", organizationId: "org-1", name: "Training Backpack", category: "accessories", price: "45.00", stock: 12, fulfillment: "external", supplierId: "sup-3", sku: "VT-BACKPACK-BLK", style: "Daily carry", color: "Black", size: "One size", branding: "Debossed logo" },
        { id: "sp-5", organizationId: "org-1", name: "Gymnastics Grips", category: "equipment", price: "18.00", stock: 60, fulfillment: "in_house", supplierId: "sup-4", sku: "VT-GRIPS-2H", style: "2-hole", color: "Tan", size: "S-L", branding: "Laser mark" },
        { id: "sp-6", organizationId: "org-1", name: "Whey Protein 1kg", category: "supplements", price: "32.00", stock: 40, fulfillment: "in_house", sku: "VT-WHEY-1KG", style: "Single scoop", branding: "Chocolate" },
      ])
      .onConflictDoNothing()
      .returning({ id: schema.storeProducts.id })
  ).length;

  inserted.storeOrders = (
    await db
      .insert(schema.storeOrders)
      .values([
        { id: "so-1", organizationId: "org-1", productId: "sp-1", supplierId: "sup-1", quantity: 50, total: "1250.00", currency: "EUR", status: "in_production", placedAt: toDate("2026-06-20T10:00:00Z") },
        { id: "so-2", organizationId: "org-1", productId: "sp-3", supplierId: "sup-3", quantity: 30, total: "1050.00", currency: "EUR", status: "shipped", trackingCode: "SF7788CN", placedAt: toDate("2026-06-18T09:00:00Z") },
        { id: "so-3", organizationId: "org-1", productId: "sp-4", supplierId: "sup-3", quantity: 15, total: "675.00", currency: "EUR", status: "delivered", placedAt: toDate("2026-06-05T09:00:00Z") },
      ])
      .onConflictDoNothing()
      .returning({ id: schema.storeOrders.id })
  ).length;

  inserted.storeSales = (
    await db
      .insert(schema.storeSales)
      .values([
        { id: "ssale-1", organizationId: "org-1", customerName: "Ana Silva", items: [{ productId: "sp-1", productName: "Aero Tee", qty: 1, unitPrice: 25 }], total: "25.00", paymentMethod: "mbway", status: "completed", soldAt: toDate("2026-06-28T11:00:00Z") },
        { id: "ssale-2", organizationId: "org-1", customerName: "Pedro Almeida", items: [{ productId: "sp-5", productName: "Gymnastics Grips", qty: 1, unitPrice: 18 }], total: "18.00", paymentMethod: "card", status: "completed", soldAt: toDate("2026-06-27T18:30:00Z") },
        { id: "ssale-3", organizationId: "org-1", customerName: "Sofia Santos", items: [{ productId: "sp-3", productName: "Heavy Hoodie", qty: 1, unitPrice: 35 }, { productId: "sp-6", productName: "Whey Protein 1kg", qty: 1, unitPrice: 32 }], total: "67.00", paymentMethod: "cash", status: "completed", soldAt: toDate("2026-06-25T17:00:00Z") },
      ])
      .onConflictDoNothing()
      .returning({ id: schema.storeSales.id })
  ).length;

  // One organization_settings row per demo org, derived from the
  // ORGANIZATION_CONFIGS defaults for its type (accent colors per mock org).
  // ON CONFLICT DO NOTHING — never clobber settings edited through the app.
  inserted.organizationSettings = (
    await db
      .insert(schema.organizationSettings)
      .values(
        mockCurrentUser.memberships.map((membership) => {
          const org = membership.organization;
          const config =
            ORGANIZATION_CONFIGS[org.type] ?? ORGANIZATION_CONFIGS["other"];
          if (!config) {
            throw new Error(`No ORGANIZATION_CONFIGS entry for type "${org.type}".`);
          }
          return {
            organizationId: org.id,
            features: config.features,
            branding: {
              accentColor:
                mockOrgAccentColors[org.id] ?? config.accentColor ?? "#22c55e",
              logoUrl: null,
            },
            publicSite: defaultPublicSite(),
            budget: org.id === ORG_1 ? ORG1_BUDGET : { lines: [] },
            terminologyOverrides: null,
          };
        }),
      )
      .onConflictDoNothing()
      .returning({ organizationId: schema.organizationSettings.organizationId })
  ).length;

  // Backfill the org-1 budget on rows that predate the budget column (the
  // insert above is ON CONFLICT DO NOTHING, so existing rows keep their data).
  await db
    .update(schema.organizationSettings)
    .set({ budget: ORG1_BUDGET })
    .where(eq(schema.organizationSettings.organizationId, ORG_1));

  for (const [table, n] of Object.entries(inserted)) {
    if (table !== "organizations" && table !== "memberships") {
      log(`${table}: +${n}`);
    }
  }

  return { inserted, demoUsers };
}
