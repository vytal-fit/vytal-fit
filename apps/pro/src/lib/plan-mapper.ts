/**
 * Adapts `subscriptions.*` tRPC router output (subscription_plans and
 * subscriptions DB rows) to the shared `SubscriptionPlan` / `Subscription`
 * shapes the admin UI was built against — same approach as member-mapper.ts.
 *
 * Differences handled here, at the page boundary — the router contracts and
 * packages/* stay untouched:
 *  - nullable DB columns (`null`) → optional fields (`undefined`)
 *  - `numeric` price arrives as a string → number
 */
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@vytal-fit/api";
import type { Subscription, SubscriptionPlan } from "@vytal-fit/shared";

type RouterOutputs = inferRouterOutputs<AppRouter>;

/** A subscription_plans row as returned by `subscriptions.plans.list`. */
export type PlanRow = RouterOutputs["subscriptions"]["plans"]["list"][number];
/** A subscriptions row as returned by `subscriptions.list`. */
export type SubscriptionRow = RouterOutputs["subscriptions"]["list"][number];

export function rowToPlan(row: PlanRow): SubscriptionPlan {
  return {
    id: row.id,
    organizationId: row.organizationId,
    name: row.name,
    type: row.type,
    price: Number(row.price),
    currency: row.currency,
    sessionsPerWeek: row.sessionsPerWeek ?? undefined,
    maxSessions: row.maxSessions ?? undefined,
    allowedClassTypes: [...row.allowedClassTypes],
    active: row.active,
  };
}

export function rowsToPlans(rows: PlanRow[]): SubscriptionPlan[] {
  return rows.map(rowToPlan);
}

/**
 * The shared `Subscription` carries the joined `plan`; the router returns the
 * bare row, so the caller supplies the (already fetched) plan.
 */
export function rowToSubscription(
  row: SubscriptionRow,
  plan: SubscriptionPlan,
): Subscription {
  return {
    id: row.id,
    memberId: row.memberId,
    planId: row.planId,
    plan,
    startDate: row.startDate,
    endDate: row.endDate ?? undefined,
    status: row.status,
    sessionsUsed: row.sessionsUsed ?? undefined,
    nextBillingDate: row.nextBillingDate ?? undefined,
  };
}
