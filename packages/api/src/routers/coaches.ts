import { TRPCError } from "@trpc/server";
import { and, asc, eq } from "drizzle-orm";
import { coaches, COACH_ROLES } from "@vytal-fit/db";
import { z } from "zod";
import { adminProcedure, orgProcedure, router } from "../trpc";

const coachInput = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  photo: z.string().url().optional(),
  role: z.enum(COACH_ROLES).default("coach"),
});

export const coachesRouter = router({
  /** Full coach roster for the active org (small reference data, no pagination). */
  list: orgProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(coaches)
      .where(eq(coaches.organizationId, ctx.activeOrganizationId))
      .orderBy(asc(coaches.name));
  }),

  byId: orgProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select()
        .from(coaches)
        .where(
          and(
            eq(coaches.id, input.id),
            eq(coaches.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Coach not found." });
      }
      return row;
    }),

  create: adminProcedure.input(coachInput).mutation(async ({ ctx, input }) => {
    const [created] = await ctx.db
      .insert(coaches)
      .values({
        id: crypto.randomUUID(),
        organizationId: ctx.activeOrganizationId,
        ...input,
      })
      .returning();
    return created;
  }),

  update: adminProcedure
    .input(z.object({ id: z.string().min(1), data: coachInput.partial() }))
    .mutation(async ({ ctx, input }) => {
      // Re-fetch scoped to the org before mutating — never trust a client id.
      const [existing] = await ctx.db
        .select({ id: coaches.id })
        .from(coaches)
        .where(
          and(
            eq(coaches.id, input.id),
            eq(coaches.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Coach not found." });
      }

      const [updated] = await ctx.db
        .update(coaches)
        .set(input.data)
        .where(
          and(
            eq(coaches.id, input.id),
            eq(coaches.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      return updated;
    }),

  /**
   * Hard delete — the coaches table carries no status/active column.
   * `leads.assignedCoachId` is `set null` on delete, so removal is safe.
   */
  delete: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(coaches)
        .where(
          and(
            eq(coaches.id, input.id),
            eq(coaches.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Coach not found." });
      }
      return deleted;
    }),
});
