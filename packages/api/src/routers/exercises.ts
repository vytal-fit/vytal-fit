import { TRPCError } from "@trpc/server";
import { EXERCISE_CATEGORIES } from "@vytal-fit/db";
import { mockExercises } from "@vytal-fit/shared";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

/**
 * The exercise/movement library is GLOBAL and comes from the shared catalog.
 * It is therefore exposed read-only via `protectedProcedure`: any authenticated
 * user can read it, and there are no mutations for now.
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
    .query(async ({ input }) => {
      return mockExercises
        .filter((exercise) =>
          input.category ? exercise.category === input.category : true,
        )
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name));
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input }) => {
      const row = mockExercises.find((exercise) => exercise.id === input.id);
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Exercise not found." });
      }
      return row;
    }),
});
