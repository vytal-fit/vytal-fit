/**
 * Adapts `wods.*` tRPC router output (wods DB rows) to the shared `WOD`
 * shape the admin UI was built against — same approach as member-mapper.ts.
 *
 * The DB stores WOD parts with exercise *references* only (StoredWODPart);
 * the shared `WODPart` embeds the full `Exercise`. The caller supplies the
 * (already fetched, global) exercise library so hydration stays a page-level
 * concern and packages/* stay untouched.
 */
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@vytal-fit/api";
import type { Exercise, WOD, WODPart } from "@vytal-fit/shared";

type RouterOutputs = inferRouterOutputs<AppRouter>;

/** A wods row as returned by the wods router. */
export type WodRow = RouterOutputs["wods"]["byId"];

function iso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

/** Neutral placeholder when an exercise id is not in the library. */
function placeholderExercise(exerciseId: string): Exercise {
  return { id: exerciseId, name: "—", category: "other" };
}

export function rowToWOD(row: WodRow, exercisesById: Map<string, Exercise>): WOD {
  const parts: WODPart[] = row.parts.map((part) => ({
    name: part.name,
    type: part.type,
    timeCap: part.timeCap,
    rounds: part.rounds,
    intervalSeconds: part.intervalSeconds,
    exercises: part.exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      exercise: exercisesById.get(ex.exerciseId) ?? placeholderExercise(ex.exerciseId),
      reps: ex.reps,
      weight: ex.weight,
      notes: ex.notes,
    })),
  }));

  return {
    id: row.id,
    organizationId: row.organizationId,
    classTypeId: row.classTypeId,
    date: row.date,
    title: row.title ?? undefined,
    description: row.description ?? undefined,
    parts,
    publishedAt: row.publishedAt ? iso(row.publishedAt) : undefined,
    createdBy: row.createdBy,
  };
}

export function rowsToWODs(rows: WodRow[], exercisesById: Map<string, Exercise>): WOD[] {
  return rows.map((row) => rowToWOD(row, exercisesById));
}
