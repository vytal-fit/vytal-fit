import { TRPCError } from "@trpc/server";
import { and, asc, eq } from "drizzle-orm";
import { exercises, EXERCISE_CATEGORIES } from "@vytal-fit/db";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

/**
 * The exercise/movement library is GLOBAL (the table carries no
 * organizationId — see packages/db/src/schema.ts). It is therefore exposed
 * read-only via `protectedProcedure`: any authenticated user can read it,
 * and there are no mutations for now.
 */
export const exercisesRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          category: z.enum(EXERCISE_CATEGORIES).optional(),
        })
        .default({}),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(exercises)
        .where(
          and(input.category ? eq(exercises.category, input.category) : undefined),
        )
        .orderBy(asc(exercises.name));
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select()
        .from(exercises)
        .where(eq(exercises.id, input.id))
        .limit(1);
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Exercise not found." });
      }
      return row;
    }),
});
