import { TRPCError } from "@trpc/server";
import { and, count, eq, gte, inArray, lte } from "drizzle-orm";
import {
  bookings,
  classTypes,
  classes,
  coachCertifications,
  coaches,
  gymMembers,
  organization,
  organizationSettings,
  subscriptionPlans,
} from "@vytal-fit/db";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";

const slugInput = z.object({ slug: z.string().min(1).max(120) });
const ENROLLED = ["confirmed", "checked_in"] as const;

/** Local YYYY-MM-DD. */
function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** JS getDay() (0=Sun) → Monday-first index (0=Mon … 6=Sun). */
function mondayFirst(jsDay: number): number {
  return (jsDay + 6) % 7;
}

/**
 * The PUBLIC org website read layer — unauthenticated, resolved by org slug.
 * Powers the marketing site at /{slug} (home, schedule, team, pricing). Only
 * exposes public-safe data: the org's public-site/branding/profile settings
 * blobs, active plans, coaches (name + photo + certs), and a typical weekly
 * class schedule derived from the next 7 days of real classes.
 */
export const publicRouter = router({
  /** Org identity + public-site content blobs + headline stats. */
  site: publicProcedure.input(slugInput).query(async ({ ctx, input }) => {
    const [org] = await ctx.db
      .select({ id: organization.id, name: organization.name, slug: organization.slug, logo: organization.logo })
      .from(organization)
      .where(eq(organization.slug, input.slug))
      .limit(1);
    if (!org) throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found." });

    const [settingsRow] = await ctx.db
      .select({
        branding: organizationSettings.branding,
        publicSite: organizationSettings.publicSite,
        profile: organizationSettings.profile,
      })
      .from(organizationSettings)
      .where(eq(organizationSettings.organizationId, org.id))
      .limit(1);

    const [[memberCount], [coachCount], [planCount]] = await Promise.all([
      ctx.db
        .select({ value: count() })
        .from(gymMembers)
        .where(and(eq(gymMembers.organizationId, org.id), eq(gymMembers.status, "active"))),
      ctx.db.select({ value: count() }).from(coaches).where(eq(coaches.organizationId, org.id)),
      ctx.db
        .select({ value: count() })
        .from(subscriptionPlans)
        .where(and(eq(subscriptionPlans.organizationId, org.id), eq(subscriptionPlans.active, true))),
    ]);

    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      logo: org.logo,
      branding: settingsRow?.branding ?? null,
      publicSite: settingsRow?.publicSite ?? null,
      profile: settingsRow?.profile ?? null,
      stats: {
        members: memberCount?.value ?? 0,
        coaches: coachCount?.value ?? 0,
        plans: planCount?.value ?? 0,
      },
    };
  }),

  /** Active subscription plans (pricing page). */
  plans: publicProcedure.input(slugInput).query(async ({ ctx, input }) => {
    const [org] = await ctx.db
      .select({ id: organization.id })
      .from(organization)
      .where(eq(organization.slug, input.slug))
      .limit(1);
    if (!org) throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found." });

    const rows = await ctx.db
      .select({
        id: subscriptionPlans.id,
        name: subscriptionPlans.name,
        price: subscriptionPlans.price,
        currency: subscriptionPlans.currency,
        sessionsPerWeek: subscriptionPlans.sessionsPerWeek,
        maxSessions: subscriptionPlans.maxSessions,
      })
      .from(subscriptionPlans)
      .where(and(eq(subscriptionPlans.organizationId, org.id), eq(subscriptionPlans.active, true)));

    return rows.map((p) => ({ ...p, price: Number(p.price) }));
  }),

  /** Coaches (team page): name + photo + certification names. */
  coaches: publicProcedure.input(slugInput).query(async ({ ctx, input }) => {
    const [org] = await ctx.db
      .select({ id: organization.id })
      .from(organization)
      .where(eq(organization.slug, input.slug))
      .limit(1);
    if (!org) throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found." });

    const coachRows = await ctx.db
      .select({ id: coaches.id, name: coaches.name, photo: coaches.photo })
      .from(coaches)
      .where(eq(coaches.organizationId, org.id));
    if (!coachRows.length) return [];

    const certRows = await ctx.db
      .select({ coachId: coachCertifications.coachId, name: coachCertifications.name })
      .from(coachCertifications)
      .where(eq(coachCertifications.organizationId, org.id));
    const certsByCoach = new Map<string, string[]>();
    for (const c of certRows) {
      const list = certsByCoach.get(c.coachId) ?? [];
      list.push(c.name);
      certsByCoach.set(c.coachId, list);
    }

    return coachRows.map((c) => ({
      id: c.id,
      name: c.name,
      photo: c.photo,
      initials: c.name.split(" ").filter(Boolean).map((n) => n[0]).slice(0, 2).join("").toUpperCase(),
      certifications: certsByCoach.get(c.id) ?? [],
    }));
  }),

  /**
   * A typical weekly schedule derived from the next 7 days of real classes,
   * mapped to Monday-first weekday slots with live capacity.
   */
  weeklySchedule: publicProcedure.input(slugInput).query(async ({ ctx, input }) => {
    const [org] = await ctx.db
      .select({ id: organization.id })
      .from(organization)
      .where(eq(organization.slug, input.slug))
      .limit(1);
    if (!org) throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found." });

    const now = new Date();
    const from = ymd(now);
    const to = ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 6));

    const rows = await ctx.db
      .select({
        id: classes.id,
        date: classes.date,
        startTime: classes.startTime,
        endTime: classes.endTime,
        maxCapacity: classes.maxCapacity,
        classTypeId: classes.classTypeId,
        coachIds: classes.coachIds,
      })
      .from(classes)
      .where(and(eq(classes.organizationId, org.id), gte(classes.date, from), lte(classes.date, to)))
      .orderBy(classes.date, classes.startTime);
    const live = rows.filter((r) => r.classTypeId != null);
    if (!live.length) return [];

    const typeIds = [...new Set(live.map((c) => c.classTypeId).filter(Boolean) as string[])];
    const coachIdSet = [...new Set(live.flatMap((c) => c.coachIds ?? []))];
    const classIds = live.map((c) => c.id);

    const [typeRows, coachRows, bookingRows] = await Promise.all([
      typeIds.length
        ? ctx.db
            .select({ id: classTypes.id, name: classTypes.name, color: classTypes.color })
            .from(classTypes)
            .where(inArray(classTypes.id, typeIds))
        : Promise.resolve([] as { id: string; name: string; color: string | null }[]),
      coachIdSet.length
        ? ctx.db.select({ id: coaches.id, name: coaches.name }).from(coaches).where(inArray(coaches.id, coachIdSet))
        : Promise.resolve([] as { id: string; name: string }[]),
      ctx.db
        .select({ classId: bookings.classId })
        .from(bookings)
        .where(
          and(
            eq(bookings.organizationId, org.id),
            inArray(bookings.classId, classIds),
            inArray(bookings.status, [...ENROLLED]),
          ),
        ),
    ]);

    const enrolByClass = new Map<string, number>();
    for (const b of bookingRows) enrolByClass.set(b.classId, (enrolByClass.get(b.classId) ?? 0) + 1);
    const typeById = new Map(typeRows.map((t) => [t.id, t]));
    const coachById = new Map(coachRows.map((c) => [c.id, c.name]));

    return live.map((c) => {
      const type = c.classTypeId ? typeById.get(c.classTypeId) : undefined;
      const coachName = (c.coachIds ?? []).map((id) => coachById.get(id)).filter(Boolean)[0] ?? "";
      const enrolled = enrolByClass.get(c.id) ?? 0;
      return {
        id: c.id,
        day: mondayFirst(new Date(`${c.date}T00:00:00`).getDay()),
        time: c.startTime,
        endTime: c.endTime,
        name: type?.name ?? "Class",
        color: type?.color ?? "#22c55e",
        coach: coachName,
        spots: c.maxCapacity,
        spotsLeft: Math.max(0, c.maxCapacity - enrolled),
      };
    });
  }),
});
