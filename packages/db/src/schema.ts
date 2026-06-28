/**
 * Single source of truth for the Vytal PostgreSQL schema.
 *
 * Layout:
 *  1. Better Auth core tables (user, session, account, verification)
 *  2. Better Auth organization-plugin tables (organization, member, invitation)
 *  3. Domain tables mirroring @vytal-fit/shared types — every tenant-owned
 *     table carries `organizationId` (FK → organization.id) and is indexed
 *     on it (plus composite indexes for hot filters).
 *
 * Schema-change workflow:
 *   edit this file → `cd packages/db && npx drizzle-kit generate` → commit migration.
 */
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type {
  BookingStatus,
  ExerciseCategory,
  LeadStage,
  MemberStatus,
  NotificationType,
  OrganizationFeatures,
  OrganizationTerminology,
  WODType,
} from "@vytal-fit/shared";

/**
 * Storage shape of a WOD part: exercises are referenced by id only —
 * hydrating the full `Exercise` (shared `WODPart`) is a query concern.
 */
export interface StoredWODPart {
  name: string;
  type: WODType;
  timeCap?: number;
  rounds?: number;
  intervalSeconds?: number;
  exercises: Array<{
    exerciseId: string;
    reps?: string;
    weight?: string;
    notes?: string;
  }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Enum value lists — typed against the shared union types so the DB enums can
// never drift from @vytal-fit/shared. (Type-level exhaustiveness is asserted
// in packages/db/tests/schema.test.ts.)
// ─────────────────────────────────────────────────────────────────────────────

export const MEMBER_STATUSES = [
  "active",
  "inactive",
  "suspended",
  "trial",
] as const satisfies readonly MemberStatus[];

export const GENDERS = ["male", "female"] as const;

export const COACH_ROLES = ["head_coach", "coach", "assistant"] as const;

export const BOOKING_STATUSES = [
  "confirmed",
  "waitlisted",
  "cancelled",
  "checked_in",
  "no_show",
] as const satisfies readonly BookingStatus[];

export const EXERCISE_CATEGORIES = [
  "weightlifting",
  "gymnastics",
  "cardio",
  "strength",
  "mobility",
  "other",
] as const satisfies readonly ExerciseCategory[];

export const WOD_SCORE_TYPES = [
  "time",
  "rounds_reps",
  "weight",
  "reps",
  "distance",
  "calories",
] as const;

export const WOD_SCALES = ["rx", "scaled", "rx_plus"] as const;

export const PR_UNITS = ["kg", "lbs", "time", "reps", "meters", "calories"] as const;

export const PLAN_TYPES = [
  "monthly",
  "quarterly",
  "semester",
  "annual",
  "session_pack",
  "day_pass",
  "trial",
] as const;

export const SUBSCRIPTION_STATUSES = [
  "active",
  "paused",
  "cancelled",
  "expired",
] as const;

export const LEAD_STAGES = [
  "lead",
  "contacted",
  "prospect",
  "trial_booked",
  "subscribed",
  "lost",
] as const satisfies readonly LeadStage[];

export const NOTIFICATION_TYPES = [
  "booking_confirmed",
  "booking_cancelled",
  "class_reminder",
  "wod_published",
  "pr_achieved",
  "payment_success",
  "payment_failed",
  "streak_milestone",
] as const satisfies readonly NotificationType[];

export const CHECK_IN_METHODS = ["qr", "kiosk", "manual", "app"] as const;

export type CheckInMethod = (typeof CHECK_IN_METHODS)[number];

// ─────────────────────────────────────────────────────────────────────────────
// JSONB storage shapes for organization settings
// ─────────────────────────────────────────────────────────────────────────────

/** Branding blob stored on `organization_settings.branding`. */
export interface OrganizationBranding {
  accentColor: string;
  logoUrl: string | null;
}

/** Public-website config blob stored on `organization_settings.public_site`. */
export interface OrganizationPublicSite {
  enabled: boolean;
  slogan?: string;
  description?: string;
  seo?: {
    title?: string;
    description?: string;
  };
  /** Per-section visibility flags (hero, schedule, pricing, shop, team, …). */
  sections: Record<string, boolean>;
  customDomain?: string | null;
}

/** Default public-site blob for orgs that never configured their website. */
export function defaultPublicSite(): OrganizationPublicSite {
  return { enabled: false, sections: {} };
}

// ─────────────────────────────────────────────────────────────────────────────
// pgEnums
// ─────────────────────────────────────────────────────────────────────────────

export const memberStatusEnum = pgEnum("member_status", MEMBER_STATUSES);
export const genderEnum = pgEnum("gender", GENDERS);
export const coachRoleEnum = pgEnum("coach_role", COACH_ROLES);
export const bookingStatusEnum = pgEnum("booking_status", BOOKING_STATUSES);
export const exerciseCategoryEnum = pgEnum("exercise_category", EXERCISE_CATEGORIES);
export const wodScoreTypeEnum = pgEnum("wod_score_type", WOD_SCORE_TYPES);
export const wodScaleEnum = pgEnum("wod_scale", WOD_SCALES);
export const prUnitEnum = pgEnum("pr_unit", PR_UNITS);
export const planTypeEnum = pgEnum("plan_type", PLAN_TYPES);
export const subscriptionStatusEnum = pgEnum("subscription_status", SUBSCRIPTION_STATUSES);
export const leadStageEnum = pgEnum("lead_stage", LEAD_STAGES);
export const notificationTypeEnum = pgEnum("notification_type", NOTIFICATION_TYPES);
export const checkInMethodEnum = pgEnum("check_in_method", CHECK_IN_METHODS);

// ─────────────────────────────────────────────────────────────────────────────
// 1. Better Auth core tables
// ─────────────────────────────────────────────────────────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** Added by the Better Auth organization plugin. */
    activeOrganizationId: text("active_organization_id"),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. Better Auth organization-plugin tables
// ─────────────────────────────────────────────────────────────────────────────

export const organization = pgTable(
  "organization",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    logo: text("logo"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    metadata: text("metadata"),
  },
  (t) => [uniqueIndex("organization_slug_idx").on(t.slug)],
);

/** Better Auth org membership (user ↔ organization link with a role). */
export const member = pgTable(
  "member",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("member_organization_id_idx").on(t.organizationId),
    index("member_user_id_idx").on(t.userId),
  ],
);

export const invitation = pgTable(
  "invitation",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role"),
    status: text("status").notNull().default("pending"),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [
    index("invitation_organization_id_idx").on(t.organizationId),
    index("invitation_email_idx").on(t.email),
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// 3. Domain tables (tenant-owned unless noted)
// ─────────────────────────────────────────────────────────────────────────────

/** Gym members (athletes) — mirrors shared `Member`. */
export const gymMembers = pgTable(
  "gym_members",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    /**
     * Links this gym member to a platform user account so an athlete can act on
     * their own data (self-service booking, results, profile). Nullable — most
     * members have no login. One member per user per org (unique index below).
     */
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    memberNumber: integer("member_number").notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    photo: text("photo"),
    gender: genderEnum("gender"),
    dateOfBirth: date("date_of_birth"),
    nif: text("nif"),
    emergencyContact: text("emergency_contact"),
    status: memberStatusEnum("status").notNull().default("active"),
    planId: text("plan_id"),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
    lastCheckIn: timestamp("last_check_in"),
    streakWeeks: integer("streak_weeks").notNull().default(0),
    totalCheckIns: integer("total_check_ins").notNull().default(0),
  },
  (t) => [
    index("gym_members_org_idx").on(t.organizationId),
    index("gym_members_org_status_idx").on(t.organizationId, t.status),
    index("gym_members_user_id_idx").on(t.userId),
    uniqueIndex("gym_members_org_member_number_idx").on(t.organizationId, t.memberNumber),
    uniqueIndex("gym_members_org_user_id_idx").on(t.organizationId, t.userId),
  ],
);

/** Coaches — mirrors shared `Coach`. */
export const coaches = pgTable(
  "coaches",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    photo: text("photo"),
    role: coachRoleEnum("role").notNull().default("coach"),
  },
  (t) => [index("coaches_org_idx").on(t.organizationId)],
);

/** Locations (rooms/areas) — mirrors shared `Location`. */
export const locations = pgTable(
  "locations",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    capacity: integer("capacity"),
  },
  (t) => [index("locations_org_idx").on(t.organizationId)],
);

/** Class types — mirrors shared `ClassType`. */
export const classTypes = pgTable(
  "class_types",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    abbreviation: text("abbreviation").notNull(),
    color: text("color").notNull(),
    icon: text("icon"),
    active: boolean("active").notNull().default(true),
  },
  (t) => [index("class_types_org_idx").on(t.organizationId)],
);

/** Scheduled classes — mirrors shared `Class` (enrolled/waitlist counts are computed from bookings). */
export const classes = pgTable(
  "classes",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    classTypeId: text("class_type_id")
      .notNull()
      .references(() => classTypes.id, { onDelete: "restrict" }),
    locationId: text("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "restrict" }),
    coachIds: jsonb("coach_ids").$type<string[]>().notNull().default([]),
    date: date("date").notNull(),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
    maxCapacity: integer("max_capacity").notNull(),
    cancelledAt: timestamp("cancelled_at"),
  },
  (t) => [
    index("classes_org_idx").on(t.organizationId),
    index("classes_org_date_idx").on(t.organizationId, t.date),
  ],
);

/** Bookings — mirrors shared `Booking` (+ organizationId for tenant isolation). */
export const bookings = pgTable(
  "bookings",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    memberId: text("member_id")
      .notNull()
      .references(() => gymMembers.id, { onDelete: "cascade" }),
    classId: text("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    status: bookingStatusEnum("status").notNull().default("confirmed"),
    bookedAt: timestamp("booked_at").notNull().defaultNow(),
    checkedInAt: timestamp("checked_in_at"),
    qrCode: text("qr_code"),
  },
  (t) => [
    index("bookings_org_idx").on(t.organizationId),
    index("bookings_org_class_idx").on(t.organizationId, t.classId),
    index("bookings_org_member_idx").on(t.organizationId, t.memberId),
    index("bookings_org_status_idx").on(t.organizationId, t.status),
  ],
);

/**
 * Exercise/movement library — mirrors shared `Exercise`.
 * Global (not tenant-owned): the shared type carries no organizationId.
 */
export const exercises = pgTable("exercises", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: exerciseCategoryEnum("category").notNull(),
  videoUrl: text("video_url"),
  thumbnailUrl: text("thumbnail_url"),
  gifUrl: text("gif_url"),
  description: text("description"),
  equipment: jsonb("equipment").$type<string[]>(),
  muscleGroups: jsonb("muscle_groups").$type<string[]>(),
  scaledVariations: jsonb("scaled_variations").$type<string[]>(),
  instructions: jsonb("instructions").$type<{
    pt: string[];
    en: string[];
    es: string[];
  }>(),
});

/** Workouts of the day — mirrors shared `WOD` (parts stored as JSONB). */
export const wods = pgTable(
  "wods",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    classTypeId: text("class_type_id")
      .notNull()
      .references(() => classTypes.id, { onDelete: "restrict" }),
    date: date("date").notNull(),
    title: text("title"),
    description: text("description"),
    parts: jsonb("parts").$type<StoredWODPart[]>().notNull().default([]),
    publishedAt: timestamp("published_at"),
    createdBy: text("created_by").notNull(),
  },
  (t) => [
    index("wods_org_idx").on(t.organizationId),
    index("wods_org_date_idx").on(t.organizationId, t.date),
  ],
);

/** WOD results — mirrors shared `WODResult` (+ organizationId for tenant isolation). */
export const wodResults = pgTable(
  "wod_results",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    memberId: text("member_id")
      .notNull()
      .references(() => gymMembers.id, { onDelete: "cascade" }),
    wodId: text("wod_id")
      .notNull()
      .references(() => wods.id, { onDelete: "cascade" }),
    classId: text("class_id").references(() => classes.id, { onDelete: "set null" }),
    score: text("score").notNull(),
    scoreType: wodScoreTypeEnum("score_type").notNull(),
    scale: wodScaleEnum("scale").notNull().default("rx"),
    isPR: boolean("is_pr").notNull().default(false),
    rpe: integer("rpe"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("wod_results_org_idx").on(t.organizationId),
    index("wod_results_org_wod_idx").on(t.organizationId, t.wodId),
    index("wod_results_org_member_idx").on(t.organizationId, t.memberId),
  ],
);

/** Personal records — mirrors shared `PersonalRecord` (+ organizationId for tenant isolation). */
export const personalRecords = pgTable(
  "personal_records",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    memberId: text("member_id")
      .notNull()
      .references(() => gymMembers.id, { onDelete: "cascade" }),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "restrict" }),
    value: text("value").notNull(),
    unit: prUnitEnum("unit").notNull(),
    achievedAt: timestamp("achieved_at").notNull().defaultNow(),
    previousValue: text("previous_value"),
  },
  (t) => [
    index("personal_records_org_idx").on(t.organizationId),
    index("personal_records_org_member_idx").on(t.organizationId, t.memberId),
  ],
);

/** Subscription plans — mirrors shared `SubscriptionPlan`. */
export const subscriptionPlans = pgTable(
  "subscription_plans",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: planTypeEnum("type").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("EUR"),
    sessionsPerWeek: integer("sessions_per_week"),
    maxSessions: integer("max_sessions"),
    allowedClassTypes: jsonb("allowed_class_types").$type<string[]>().notNull().default([]),
    active: boolean("active").notNull().default(true),
  },
  (t) => [
    index("subscription_plans_org_idx").on(t.organizationId),
    index("subscription_plans_org_active_idx").on(t.organizationId, t.active),
  ],
);

/** Subscriptions — mirrors shared `Subscription` (+ organizationId for tenant isolation). */
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    memberId: text("member_id")
      .notNull()
      .references(() => gymMembers.id, { onDelete: "cascade" }),
    planId: text("plan_id")
      .notNull()
      .references(() => subscriptionPlans.id, { onDelete: "restrict" }),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    status: subscriptionStatusEnum("status").notNull().default("active"),
    sessionsUsed: integer("sessions_used"),
    nextBillingDate: date("next_billing_date"),
  },
  (t) => [
    index("subscriptions_org_idx").on(t.organizationId),
    index("subscriptions_org_status_idx").on(t.organizationId, t.status),
    index("subscriptions_org_member_idx").on(t.organizationId, t.memberId),
  ],
);

/** CRM leads — mirrors shared `Lead`. */
export const leads = pgTable(
  "leads",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    stage: leadStageEnum("stage").notNull().default("lead"),
    source: text("source"),
    assignedCoachId: text("assigned_coach_id").references(() => coaches.id, {
      onDelete: "set null",
    }),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    lastContactAt: timestamp("last_contact_at"),
    trialDate: timestamp("trial_date"),
  },
  (t) => [
    index("leads_org_idx").on(t.organizationId),
    index("leads_org_stage_idx").on(t.organizationId, t.stage),
  ],
);

/** Notifications — mirrors shared `Notification` (+ organizationId for tenant isolation). */
export const notifications = pgTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    memberId: text("member_id")
      .notNull()
      .references(() => gymMembers.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("notifications_org_idx").on(t.organizationId),
    index("notifications_org_member_idx").on(t.organizationId, t.memberId),
  ],
);

/** Support ticket messages stored inline on the ticket row. */
export interface SupportTicketMessage {
  id: string;
  author: string;
  isStaff: boolean;
  content: string;
  date: string;
}

/** Support tickets — org-scoped member issues, operationally owned by staff. */
export const supportTickets = pgTable(
  "support_tickets",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    number: integer("number").notNull(),
    subject: text("subject").notNull(),
    memberName: text("member_name").notNull(),
    priority: text("priority").notNull(),
    status: text("status").notNull(),
    assignedTo: text("assigned_to").notNull(),
    description: text("description").notNull(),
    messages: jsonb("messages").$type<SupportTicketMessage[]>().notNull().default([]),
    internalNotes: text("internal_notes").notNull().default(""),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("support_tickets_org_idx").on(t.organizationId),
    index("support_tickets_org_status_idx").on(t.organizationId, t.status),
  ],
);

/**
 * Check-ins — every gym entry, whether tied to a class booking or open gym.
 * `classId`/`bookingId` are nullable: open-gym check-ins carry neither.
 */
export const checkIns = pgTable(
  "check_ins",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    memberId: text("member_id")
      .notNull()
      .references(() => gymMembers.id, { onDelete: "cascade" }),
    classId: text("class_id").references(() => classes.id, { onDelete: "set null" }),
    bookingId: text("booking_id").references(() => bookings.id, { onDelete: "set null" }),
    method: checkInMethodEnum("method").notNull().default("manual"),
    checkedInAt: timestamp("checked_in_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("check_ins_org_idx").on(t.organizationId),
    index("check_ins_org_member_idx").on(t.organizationId, t.memberId),
    index("check_ins_org_checked_in_at_idx").on(t.organizationId, t.checkedInAt),
    index("check_ins_org_class_idx").on(t.organizationId, t.classId),
  ],
);

/**
 * Per-organization settings — exactly one row per org (PK = organizationId).
 * Orgs without a row fall back to the `ORGANIZATION_CONFIGS` defaults for
 * their type (resolved at read time by the API layer).
 */
export const organizationSettings = pgTable("organization_settings", {
  organizationId: text("organization_id")
    .primaryKey()
    .references(() => organization.id, { onDelete: "cascade" }),
  features: jsonb("features").$type<OrganizationFeatures>().notNull(),
  branding: jsonb("branding").$type<OrganizationBranding>().notNull(),
  publicSite: jsonb("public_site").$type<OrganizationPublicSite>().notNull(),
  terminologyOverrides: jsonb("terminology_overrides").$type<
    Partial<OrganizationTerminology>
  >(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
