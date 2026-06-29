/**
 * Adapts `checkIns.*` tRPC router output (check_ins DB rows) to the shape the
 * admin UI renders.
 *
 * Differences handled here, at the page boundary — the router contract and
 * packages/* stay untouched:
 *  - nullable DB columns (`null`) → optional fields (`undefined`)
 *  - `timestamp` columns arrive as `Date` (superjson) → ISO strings
 */
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@vytal-fit/api";

type RouterOutputs = inferRouterOutputs<AppRouter>;

/** A single check_ins row as returned by the checkIns router. */
export type CheckInRow = RouterOutputs["checkIns"]["list"]["items"][number];

export interface CheckInEntry {
  id: string;
  organizationId: string;
  memberId: string;
  classId?: string;
  bookingId?: string;
  method: CheckInRow["method"];
  /** ISO timestamp. */
  checkedInAt: string;
}

function iso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

export function rowToCheckIn(row: CheckInRow): CheckInEntry {
  return {
    id: row.id,
    organizationId: row.organizationId,
    memberId: row.memberId,
    classId: row.classId ?? undefined,
    bookingId: row.bookingId ?? undefined,
    method: row.method,
    checkedInAt: iso(row.checkedInAt),
  };
}

export function rowsToCheckIns(rows: CheckInRow[]): CheckInEntry[] {
  return rows.map(rowToCheckIn);
}
