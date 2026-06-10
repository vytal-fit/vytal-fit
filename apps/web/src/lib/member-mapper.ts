/**
 * Adapts `members.*` tRPC router output (gym_members DB rows) to the shared
 * `Member` shape the admin UI was built against.
 *
 * Differences handled here, at the page boundary — the router contract and
 * packages/* stay untouched:
 *  - nullable DB columns (`null`) → optional fields (`undefined`)
 *  - `timestamp` columns arrive as `Date` (superjson) → ISO strings
 */
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@vytal-fit/api";
import type { Member } from "@vytal-fit/shared";

type RouterOutputs = inferRouterOutputs<AppRouter>;

/** A single gym_members row as returned by the members router. */
export type MemberRow = RouterOutputs["members"]["byId"];

function iso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

export function rowToMember(row: MemberRow): Member {
  return {
    id: row.id,
    organizationId: row.organizationId,
    memberNumber: row.memberNumber,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    photo: row.photo ?? undefined,
    gender: row.gender ?? undefined,
    dateOfBirth: row.dateOfBirth ?? undefined,
    nif: row.nif ?? undefined,
    emergencyContact: row.emergencyContact ?? undefined,
    status: row.status,
    planId: row.planId ?? undefined,
    joinedAt: iso(row.joinedAt),
    lastCheckIn: row.lastCheckIn ? iso(row.lastCheckIn) : undefined,
    streakWeeks: row.streakWeeks,
    totalCheckIns: row.totalCheckIns,
  };
}

export function rowsToMembers(rows: MemberRow[]): Member[] {
  return rows.map(rowToMember);
}
