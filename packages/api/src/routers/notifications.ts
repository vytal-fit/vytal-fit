import { TRPCError } from "@trpc/server";
import { and, asc, eq, gt } from "drizzle-orm";
import { notifications, NOTIFICATION_TYPES } from "@vytal-fit/db";
import { z } from "zod";
import { adminProcedure, orgProcedure, router } from "../trpc";

export const notificationsRouter = router({
  list: orgProcedure
    .input(
      z
        .object({
          read: z.boolean().optional(),
          type: z.enum(NOTIFICATION_TYPES).optional(),
          memberId: z.string().min(1).optional(),
          cursor: z.string().nullish(),
          limit: z.number().int().min(1).max(100).default(50),
        })
        .default({ limit: 50 }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.organizationId, ctx.activeOrganizationId),
            input.read === undefined ? undefined : eq(notifications.read, input.read),
            input.type ? eq(notifications.type, input.type) : undefined,
            input.memberId ? eq(notifications.memberId, input.memberId) : undefined,
            input.cursor ? gt(notifications.id, input.cursor) : undefined,
          ),
        )
        .orderBy(asc(notifications.id))
        .limit(input.limit + 1);

      let nextCursor: string | null = null;
      if (rows.length > input.limit) {
        rows.pop();
        nextCursor = rows[rows.length - 1]?.id ?? null;
      }
      return { items: rows, nextCursor };
    }),

  markRead: orgProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(notifications)
        .set({ read: true })
        .where(
          and(
            eq(notifications.id, input.id),
            eq(notifications.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Notification not found." });
      }
      return updated;
    }),

  /** Mark every unread notification in the org (optionally one member's) as read. */
  markAllRead: orgProcedure
    .input(
      z
        .object({
          memberId: z.string().min(1).optional(),
        })
        .default({}),
    )
    .mutation(async ({ ctx, input }) => {
      const rows = await ctx.db
        .update(notifications)
        .set({ read: true })
        .where(
          and(
            eq(notifications.organizationId, ctx.activeOrganizationId),
            eq(notifications.read, false),
            input.memberId ? eq(notifications.memberId, input.memberId) : undefined,
          ),
        )
        .returning({ id: notifications.id });
      return { updated: rows.length };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(notifications)
        .where(
          and(
            eq(notifications.id, input.id),
            eq(notifications.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Notification not found." });
      }
      return deleted;
    }),
});
