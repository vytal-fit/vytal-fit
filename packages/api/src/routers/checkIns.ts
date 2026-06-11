import { TRPCError } from "@trpc/server";
import { and, asc, count, countDistinct, eq, gt, gte, lt } from "drizzle-orm";
import { bookings, checkIns, classes, gymMembers, CHECK_IN_METHODS } from "@vytal-fit/db";
import { z } from "zod";
import { adminProcedure, orgProcedure, router, staffProcedure } from "../trpc";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Start-of-day Date (local) for a YYYY-MM-DD string. */
function startOfDay(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y ?? 0, (m ?? 1) - 1, d ?? 1);
}

/** Start of the day AFTER a YYYY-MM-DD string (exclusive upper bound). */
function startOfNextDay(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y ?? 0, (m ?? 1) - 1, (d ?? 1) + 1);
}

export const checkInsRouter = router({
  list: orgProcedure
    .input(
      z
        .object({
          memberId: z.string().min(1).optional(),
          classId: z.string().min(1).optional(),
          from: z.string().regex(DATE_RE).optional(),
          to: z.string().regex(DATE_RE).optional(),
          cursor: z.string().nullish(),
          limit: z.number().int().min(1).max(100).default(50),
        })
        .default({ limit: 50 }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(checkIns)
        .where(
          and(
            eq(checkIns.organizationId, ctx.activeOrganizationId),
            input.memberId ? eq(checkIns.memberId, input.memberId) : undefined,
            input.classId ? eq(checkIns.classId, input.classId) : undefined,
            input.from ? gte(checkIns.checkedInAt, startOfDay(input.from)) : undefined,
            input.to ? lt(checkIns.checkedInAt, startOfNextDay(input.to)) : undefined,
            input.cursor ? gt(checkIns.id, input.cursor) : undefined,
          ),
        )
        .orderBy(asc(checkIns.id))
        .limit(input.limit + 1);

      let nextCursor: string | null = null;
      if (rows.length > input.limit) {
        rows.pop();
        nextCursor = rows[rows.length - 1]?.id ?? null;
      }
      return { items: rows, nextCursor };
    }),

  /** Today's check-in volume: total entries + distinct members through the door. */
  todayStats: orgProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const [stats] = await ctx.db
      .select({
        total: count(),
        uniqueMembers: countDistinct(checkIns.memberId),
      })
      .from(checkIns)
      .where(
        and(
          eq(checkIns.organizationId, ctx.activeOrganizationId),
          gte(checkIns.checkedInAt, dayStart),
          lt(checkIns.checkedInAt, dayEnd),
        ),
      );

    return {
      total: stats?.total ?? 0,
      uniqueMembers: stats?.uniqueMembers ?? 0,
    };
  }),

  create: staffProcedure
    .input(
      z.object({
        memberId: z.string().min(1),
        classId: z.string().min(1).optional(),
        bookingId: z.string().min(1).optional(),
        method: z.enum(CHECK_IN_METHODS).default("manual"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Every referenced row must belong to the ACTIVE org — never trust ids.
      const [member] = await ctx.db
        .select({ id: gymMembers.id })
        .from(gymMembers)
        .where(
          and(
            eq(gymMembers.id, input.memberId),
            eq(gymMembers.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!member) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Member not found." });
      }

      if (input.classId) {
        const [klass] = await ctx.db
          .select({ id: classes.id })
          .from(classes)
          .where(
            and(
              eq(classes.id, input.classId),
              eq(classes.organizationId, ctx.activeOrganizationId),
            ),
          )
          .limit(1);
        if (!klass) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Class not found." });
        }
      }

      if (input.bookingId) {
        const [booking] = await ctx.db
          .select({ id: bookings.id })
          .from(bookings)
          .where(
            and(
              eq(bookings.id, input.bookingId),
              eq(bookings.organizationId, ctx.activeOrganizationId),
            ),
          )
          .limit(1);
        if (!booking) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found." });
        }
      }

      // A member checks into a given class at most once.
      if (input.classId) {
        const [duplicate] = await ctx.db
          .select({ id: checkIns.id })
          .from(checkIns)
          .where(
            and(
              eq(checkIns.organizationId, ctx.activeOrganizationId),
              eq(checkIns.memberId, input.memberId),
              eq(checkIns.classId, input.classId),
            ),
          )
          .limit(1);
        if (duplicate) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Member is already checked in to this class.",
          });
        }
      }

      const [created] = await ctx.db
        .insert(checkIns)
        .values({
          id: crypto.randomUUID(),
          organizationId: ctx.activeOrganizationId,
          memberId: input.memberId,
          classId: input.classId ?? null,
          bookingId: input.bookingId ?? null,
          method: input.method,
        })
        .returning();
      return created;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(checkIns)
        .where(
          and(
            eq(checkIns.id, input.id),
            eq(checkIns.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Check-in not found." });
      }
      return deleted;
    }),
});
