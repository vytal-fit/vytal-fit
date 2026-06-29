/**
 * Adapts `leads.*` tRPC router output (leads DB rows) to the shared `Lead`
 * shape the admin UI was built against — same approach as member-mapper.ts.
 *
 * Differences handled here, at the page boundary — the router contract and
 * packages/* stay untouched:
 *  - nullable DB columns (`null`) → optional fields (`undefined`)
 *  - `timestamp` columns arrive as `Date` (superjson) → ISO strings
 *  - `trialDate` is shown as a plain date in the UI → YYYY-MM-DD
 */
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@vytal-fit/api";
import type { Lead } from "@vytal-fit/shared";

type RouterOutputs = inferRouterOutputs<AppRouter>;

/** A leads row as returned by `leads.list`. */
export type LeadRow = RouterOutputs["leads"]["list"][number];

function iso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

export function rowToLead(row: LeadRow): Lead {
  return {
    id: row.id,
    organizationId: row.organizationId,
    name: row.name,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    stage: row.stage,
    source: row.source ?? undefined,
    assignedCoachId: row.assignedCoachId ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: iso(row.createdAt),
    lastContactAt: row.lastContactAt ? iso(row.lastContactAt) : undefined,
    trialDate: row.trialDate ? iso(row.trialDate).slice(0, 10) : undefined,
  };
}

export function rowsToLeads(rows: LeadRow[]): Lead[] {
  return rows.map(rowToLead);
}
