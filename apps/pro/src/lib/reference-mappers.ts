/**
 * Adapts reference-data tRPC router outputs (coaches, locations, class types,
 * exercises, personal records) to the shared shapes the admin UI was built
 * against — same approach as member-mapper.ts.
 *
 * Differences handled here, at the page boundary — the router contracts and
 * packages/* stay untouched:
 *  - nullable DB columns (`null`) → optional fields (`undefined`)
 *  - `timestamp` columns arrive as `Date` (superjson) → ISO strings
 */
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@vytal-fit/api";
import type {
  ClassType,
  Coach,
  Exercise,
  Location,
  PersonalRecord,
} from "@vytal-fit/shared";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type CoachRow = RouterOutputs["coaches"]["byId"];
export type LocationRow = RouterOutputs["locations"]["byId"];
export type ClassTypeRow = RouterOutputs["classTypes"]["byId"];
export type ExerciseRow = RouterOutputs["exercises"]["byId"];
export type PersonalRecordRow = Omit<
  RouterOutputs["personalRecords"]["byId"],
  "exercise"
> & {
  exercise?: Exercise | null;
};

function iso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

export function rowToCoach(row: CoachRow): Coach {
  return {
    id: row.id,
    organizationId: row.organizationId,
    name: row.name,
    email: row.email,
    photo: row.photo ?? undefined,
    role: row.role,
  };
}

export function rowsToCoaches(rows: CoachRow[]): Coach[] {
  return rows.map(rowToCoach);
}

export function rowToLocation(row: LocationRow): Location {
  return {
    id: row.id,
    organizationId: row.organizationId,
    name: row.name,
    capacity: row.capacity ?? undefined,
  };
}

export function rowsToLocations(rows: LocationRow[]): Location[] {
  return rows.map(rowToLocation);
}

export function rowToClassType(row: ClassTypeRow): ClassType {
  return {
    id: row.id,
    organizationId: row.organizationId,
    name: row.name,
    abbreviation: row.abbreviation,
    color: row.color,
    icon: row.icon ?? undefined,
    active: row.active,
  };
}

export function rowsToClassTypes(rows: ClassTypeRow[]): ClassType[] {
  return rows.map(rowToClassType);
}

export function rowToExercise(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    videoUrl: row.videoUrl ?? undefined,
    thumbnailUrl: row.thumbnailUrl ?? undefined,
    gifUrl: row.gifUrl ?? undefined,
    description: row.description ?? undefined,
    equipment: row.equipment ?? undefined,
    muscleGroups: row.muscleGroups ?? undefined,
    scaledVariations: row.scaledVariations ?? undefined,
    instructions: row.instructions ?? undefined,
  };
}

export function rowsToExercises(rows: ExerciseRow[]): Exercise[] {
  return rows.map(rowToExercise);
}

/**
 * The shared `PersonalRecord` carries the joined `exercise`; the router
 * returns the bare row, so the caller supplies the (already fetched) exercise.
 */
export function rowToPersonalRecord(
  row: PersonalRecordRow,
  exercise: Exercise | null | undefined,
): PersonalRecord {
  const resolvedExercise = row.exercise ?? exercise;
  if (!resolvedExercise) {
    throw new Error("Missing exercise for personal record row.");
  }

  return {
    id: row.id,
    memberId: row.memberId,
    exerciseId: row.exerciseId,
    exercise: resolvedExercise,
    value: row.value,
    unit: row.unit,
    achievedAt: iso(row.achievedAt),
    previousValue: row.previousValue ?? undefined,
  };
}
