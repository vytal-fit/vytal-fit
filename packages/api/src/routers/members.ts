import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, gt, gte, inArray } from "drizzle-orm";
import { checkIns, gymMembers, GENDERS, MEMBER_STATUSES } from "@vytal-fit/db";
import { z } from "zod";
import { adminProcedure, orgProcedure, router } from "../trpc";

const RETENTION_WEEKS = 16;
const WEEK_MS = 7 * 86_400_000;

const memberInput = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  photo: z.string().url().optional(),
  gender: z.enum(GENDERS).optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  nif: z.string().max(20).optional(),
  emergencyContact: z.string().max(200).optional(),
  status: z.enum(MEMBER_STATUSES).default("active"),
  planId: z.string().min(1).optional(),
});

export const membersRouter = router({
  list: orgProcedure
    .input(
      z
        .object({
          status: z.enum(MEMBER_STATUSES).optional(),
          cursor: z.string().nullish(),
          limit: z.number().int().min(1).max(100).default(50),
        })
        .default({ limit: 50 }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(gymMembers)
        .where(
          and(
            eq(gymMembers.organizationId, ctx.activeOrganizationId),
            input.status ? eq(gymMembers.status, input.status) : undefined,
            input.cursor ? gt(gymMembers.id, input.cursor) : undefined,
          ),
        )
        .orderBy(asc(gymMembers.id))
        .limit(input.limit + 1);

      let nextCursor: string | null = null;
      if (rows.length > input.limit) {
        rows.pop();
        nextCursor = rows[rows.length - 1]?.id ?? null;
      }
      return { items: rows, nextCursor };
    }),

  /** The caller's own gym-member profile in the active org, or null if unlinked. */
  me: orgProcedure.query(async ({ ctx }) => {
    const [row] = await ctx.db
      .select()
      .from(gymMembers)
      .where(
        and(
          eq(gymMembers.organizationId, ctx.activeOrganizationId),
          eq(gymMembers.userId, ctx.session.user.id),
        ),
      )
      .limit(1);
    return row ?? null;
  }),

  byId: orgProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select()
        .from(gymMembers)
        .where(
          and(
            eq(gymMembers.id, input.id),
            eq(gymMembers.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Member not found." });
      }
      return row;
    }),

  create: adminProcedure.input(memberInput).mutation(async ({ ctx, input }) => {
    const [last] = await ctx.db
      .select({ memberNumber: gymMembers.memberNumber })
      .from(gymMembers)
      .where(eq(gymMembers.organizationId, ctx.activeOrganizationId))
      .orderBy(desc(gymMembers.memberNumber))
      .limit(1);

    const [created] = await ctx.db
      .insert(gymMembers)
      .values({
        id: crypto.randomUUID(),
        organizationId: ctx.activeOrganizationId,
        memberNumber: (last?.memberNumber ?? 0) + 1,
        ...input,
      })
      .returning();
    return created;
  }),

  update: adminProcedure
    // Strip defaults before .partial() — zod applies .default() even for
    // omitted keys in a partial, which would silently reset status to
    // "active" (resurrecting archived members on any field edit).
    .input(
      z.object({
        id: z.string().min(1),
        data: memberInput.extend({ status: z.enum(MEMBER_STATUSES) }).partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Re-fetch scoped to the org before mutating — never trust a client id.
      const [existing] = await ctx.db
        .select({ id: gymMembers.id })
        .from(gymMembers)
        .where(
          and(
            eq(gymMembers.id, input.id),
            eq(gymMembers.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Member not found." });
      }

      const [updated] = await ctx.db
        .update(gymMembers)
        .set(input.data)
        .where(
          and(
            eq(gymMembers.id, input.id),
            eq(gymMembers.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      return updated;
    }),

  archive: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [archived] = await ctx.db
        .update(gymMembers)
        .set({ status: "inactive" })
        .where(
          and(
            eq(gymMembers.id, input.id),
            eq(gymMembers.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      if (!archived) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Member not found." });
      }
      return archived;
    }),

  /**
   * Onboarding retention cohort: members who joined within the last 16 calendar
   * weeks, with their per-week check-in counts across a fixed 16-week window
   * (current week is week 16). `joinWeek` is the 0-based window column they
   * joined in, so the UI greys out the weeks before they existed. Fully derived
   * from real join dates + check-ins.
   */
  retention: orgProcedure.query(async ({ ctx }) => {
    const org = ctx.activeOrganizationId;
    const now = new Date();
    const dow = (now.getUTCDay() + 6) % 7; // 0 = Monday
    const thisMonday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dow);
    const windowStart = thisMonday - (RETENTION_WEEKS - 1) * WEEK_MS;
    const windowStartDate = new Date(windowStart);

    const members = await ctx.db
      .select({ id: gymMembers.id, name: gymMembers.name, joinedAt: gymMembers.joinedAt })
      .from(gymMembers)
      .where(and(eq(gymMembers.organizationId, org), gte(gymMembers.joinedAt, windowStartDate)))
      .orderBy(asc(gymMembers.joinedAt));
    if (members.length === 0) return [];

    const ids = members.map((m) => m.id);
    const cis = await ctx.db
      .select({ memberId: checkIns.memberId, checkedInAt: checkIns.checkedInAt })
      .from(checkIns)
      .where(
        and(
          eq(checkIns.organizationId, org),
          gte(checkIns.checkedInAt, windowStartDate),
          inArray(checkIns.memberId, ids),
        ),
      );

    const weekOf = (d: Date) =>
      Math.min(RETENTION_WEEKS - 1, Math.max(0, Math.floor((d.getTime() - windowStart) / WEEK_MS)));
    const byMember = new Map<string, number[]>();
    for (const id of ids) byMember.set(id, Array(RETENTION_WEEKS).fill(0));
    for (const c of cis) {
      const arr = byMember.get(c.memberId);
      if (arr) arr[weekOf(c.checkedInAt)] += 1;
    }

    return members.map((m) => ({
      id: m.id,
      name: m.name,
      coach: "",
      joinWeek: weekOf(m.joinedAt),
      weeklyAttendance: byMember.get(m.id) ?? Array(RETENTION_WEEKS).fill(0),
    }));
  }),
});
