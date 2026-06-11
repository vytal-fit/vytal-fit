/**
 * Adapts `classes.*` tRPC router output (classes DB rows) to the shared
 * `Class` shape the admin UI was built against — same approach as
 * member-mapper.ts.
 *
 * The router returns bare rows (classTypeId/locationId/coachIds only) while
 * the shared `Class` carries the joined `classType`, `location` and `coaches`
 * plus enrollment counts computed from bookings. Both are supplied by the
 * caller (reference data from the classTypes/locations/coaches routers,
 * counts from `classes.byId`), keeping packages/* untouched.
 */
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@vytal-fit/api";
import type { Class, ClassType, Coach, Location } from "@vytal-fit/shared";

type RouterOutputs = inferRouterOutputs<AppRouter>;

/** A classes row as returned by `classes.list`. */
export type ClassRow = RouterOutputs["classes"]["list"][number];

export interface ClassReferenceData {
  classTypes: ClassType[];
  locations: Location[];
  coaches: Coach[];
}

export interface ClassCounts {
  enrolledCount: number;
  waitlistCount: number;
}

/** Neutral placeholder while reference data is still loading. */
function placeholderClassType(row: ClassRow): ClassType {
  return {
    id: row.classTypeId,
    organizationId: row.organizationId,
    name: "—",
    abbreviation: "—",
    color: "#6b7280",
    active: true,
  };
}

function placeholderLocation(row: ClassRow): Location {
  return { id: row.locationId, organizationId: row.organizationId, name: "—" };
}

export function rowToClass(
  row: ClassRow,
  refs: ClassReferenceData,
  counts?: ClassCounts,
): Class {
  const classType =
    refs.classTypes.find((ct) => ct.id === row.classTypeId) ?? placeholderClassType(row);
  const location =
    refs.locations.find((loc) => loc.id === row.locationId) ?? placeholderLocation(row);
  const coaches = row.coachIds
    .map((id) => refs.coaches.find((c) => c.id === id))
    .filter((c): c is Coach => c !== undefined);

  return {
    id: row.id,
    organizationId: row.organizationId,
    classTypeId: row.classTypeId,
    classType,
    locationId: row.locationId,
    location,
    coachIds: [...row.coachIds],
    coaches,
    date: row.date,
    startTime: row.startTime,
    endTime: row.endTime,
    maxCapacity: row.maxCapacity,
    enrolledCount: counts?.enrolledCount ?? 0,
    waitlistCount: counts?.waitlistCount ?? 0,
  };
}

export function rowsToClasses(
  rows: ClassRow[],
  refs: ClassReferenceData,
  countsById?: Map<string, ClassCounts>,
): Class[] {
  return rows.map((row) => rowToClass(row, refs, countsById?.get(row.id)));
}
