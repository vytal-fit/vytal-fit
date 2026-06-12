import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { classTypes, wods } from "@vytal-fit/db";
import { z } from "zod";
import { orgProcedure, router, staffProcedure } from "../trpc";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

const WOD_TYPES = ["amrap", "emom", "for_time", "tabata", "strength", "custom"] as const;

const wodPartSchema = z.object({
  name: z.string().min(1).max(120),
  type: z.enum(WOD_TYPES),
  timeCap: z.number().int().positive().optional(),
  rounds: z.number().int().positive().optional(),
  intervalSeconds: z.number().int().positive().optional(),
  exercises: z.array(
    z.object({
      exerciseId: z.string().min(1),
      reps: z.string().max(60).optional(),
      weight: z.string().max(60).optional(),
      notes: z.string().max(500).optional(),
    }),
  ),
});

const wodInput = z.object({
  classTypeId: z.string().min(1),
  date: dateString,
  title: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  parts: z.array(wodPartSchema).default([]),
});

/**
 * Update payload: `wodInput` with the `parts` default stripped — a defaulted
 * field inside `.partial()` would otherwise coerce `undefined` back to `[]`
 * and silently wipe stored parts on partial updates.
 */
const wodUpdateInput = wodInput.extend({ parts: z.array(wodPartSchema) }).partial();

export const wodsRouter = router({
  list: orgProcedure
    .input(
      z
        .object({
          from: dateString.optional(),
          to: dateString.optional(),
        })
        .default({}),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(wods)
        .where(
          and(
            eq(wods.organizationId, ctx.activeOrganizationId),
            input.from ? gte(wods.date, input.from) : undefined,
            input.to ? lte(wods.date, input.to) : undefined,
          ),
        )
        .orderBy(desc(wods.date));
    }),

  byId: orgProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select()
        .from(wods)
        .where(
          and(eq(wods.id, input.id), eq(wods.organizationId, ctx.activeOrganizationId)),
        )
        .limit(1);
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "WOD not found." });
      }
      return row;
    }),

  create: staffProcedure.input(wodInput).mutation(async ({ ctx, input }) => {
    const [classType] = await ctx.db
      .select({ id: classTypes.id })
      .from(classTypes)
      .where(
        and(
          eq(classTypes.id, input.classTypeId),
          eq(classTypes.organizationId, ctx.activeOrganizationId),
        ),
      )
      .limit(1);
    if (!classType) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Class type not found." });
    }

    const [created] = await ctx.db
      .insert(wods)
      .values({
        id: crypto.randomUUID(),
        organizationId: ctx.activeOrganizationId,
        createdBy: ctx.session.user.id,
        ...input,
      })
      .returning();
    return created;
  }),

  /**
   * Partial update of a WOD (title/date/parts/classTypeId/description).
   * Works on both draft and published WODs — publication state is managed
   * exclusively via `publish`.
   */
  update: staffProcedure
    .input(z.object({ id: z.string().min(1), data: wodUpdateInput }))
    .mutation(async ({ ctx, input }) => {
      // Re-fetch scoped to the org before mutating — never trust a client id.
      const [existing] = await ctx.db
        .select({ id: wods.id })
        .from(wods)
        .where(
          and(eq(wods.id, input.id), eq(wods.organizationId, ctx.activeOrganizationId)),
        )
        .limit(1);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "WOD not found." });
      }

      // A re-targeted class type must belong to the active org.
      if (input.data.classTypeId) {
        const [classType] = await ctx.db
          .select({ id: classTypes.id })
          .from(classTypes)
          .where(
            and(
              eq(classTypes.id, input.data.classTypeId),
              eq(classTypes.organizationId, ctx.activeOrganizationId),
            ),
          )
          .limit(1);
        if (!classType) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Class type not found." });
        }
      }

      const [updated] = await ctx.db
        .update(wods)
        .set(input.data)
        .where(
          and(eq(wods.id, input.id), eq(wods.organizationId, ctx.activeOrganizationId)),
        )
        .returning();
      return updated;
    }),

  publish: staffProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ id: wods.id, publishedAt: wods.publishedAt })
        .from(wods)
        .where(
          and(eq(wods.id, input.id), eq(wods.organizationId, ctx.activeOrganizationId)),
        )
        .limit(1);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "WOD not found." });
      }
      if (existing.publishedAt) {
        throw new TRPCError({ code: "CONFLICT", message: "WOD is already published." });
      }

      const [published] = await ctx.db
        .update(wods)
        .set({ publishedAt: new Date() })
        .where(
          and(eq(wods.id, input.id), eq(wods.organizationId, ctx.activeOrganizationId)),
        )
        .returning();
      return published;
    }),
});
