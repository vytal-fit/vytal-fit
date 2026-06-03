import { mockPlans, mockClassTypes } from "@vytal-fit/shared";
import type { SubscriptionPlan } from "@vytal-fit/shared";
import { CreditCard, CheckCircle, XCircle, Tag, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

const typeLabels: Record<string, { label: string; className: string }> = {
  monthly: {
    label: "Monthly",
    className: "bg-vytal-green/10 text-vytal-green",
  },
  quarterly: {
    label: "Quarterly",
    className: "bg-vytal-blue/10 text-vytal-blue",
  },
  semester: {
    label: "Semester",
    className: "bg-vytal-blue/10 text-vytal-blue",
  },
  annual: {
    label: "Annual",
    className: "bg-vytal-purple/10 text-vytal-purple",
  },
  session_pack: {
    label: "Session Pack",
    className: "bg-vytal-amber/10 text-vytal-amber",
  },
  day_pass: {
    label: "Day Pass",
    className: "bg-vytal-orange/10 text-vytal-orange",
  },
  trial: {
    label: "Trial",
    className: "bg-vytal-amber/10 text-vytal-amber",
  },
};

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

function PlanCard({ plan }: { plan: SubscriptionPlan }) {
  const typeConfig = typeLabels[plan.type] ?? {
    label: plan.type,
    className: "bg-vytal-muted/10 text-vytal-muted",
  };
  const allowedTypes = plan.allowedClassTypes
    .map((ctId) => mockClassTypes.find((ct) => ct.id === ctId))
    .filter(Boolean);

  return (
    <div className="group rounded-xl border border-vytal-border bg-vytal-card p-6 transition-colors hover:border-[rgba(61,255,110,0.22)]">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-vytal-text">{plan.name}</h3>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                typeConfig.className
              )}
            >
              {typeConfig.label}
            </span>
            {plan.active ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-vytal-green/10 px-2 py-0.5 text-[10px] font-medium text-vytal-green">
                <CheckCircle className="h-2.5 w-2.5" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-vytal-red/10 px-2 py-0.5 text-[10px] font-medium text-vytal-red">
                <XCircle className="h-2.5 w-2.5" />
                Inactive
              </span>
            )}
          </div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-green/10">
          <CreditCard className="h-5 w-5 text-vytal-green" />
        </div>
      </div>

      {/* Price */}
      <div className="mb-4">
        <span className="text-3xl font-bold text-vytal-text">
          {formatCurrency(plan.price, plan.currency)}
        </span>
        <span className="text-sm text-vytal-muted">
          {plan.type === "monthly"
            ? "/month"
            : plan.type === "semester"
              ? "/6 months"
              : plan.type === "annual"
                ? "/year"
                : plan.type === "quarterly"
                  ? "/quarter"
                  : ""}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-3 border-t border-vytal-border pt-4">
        {plan.maxSessions && (
          <div className="flex items-center gap-2 text-sm text-vytal-muted">
            <Tag className="h-3.5 w-3.5" />
            <span>
              {plan.maxSessions} sessions{" "}
              {plan.type === "session_pack" ? "total" : "per month"}
            </span>
          </div>
        )}
        {!plan.maxSessions && plan.type !== "day_pass" && (
          <div className="flex items-center gap-2 text-sm text-vytal-green">
            <Dumbbell className="h-3.5 w-3.5" />
            <span>Unlimited sessions</span>
          </div>
        )}
        {plan.type === "day_pass" && (
          <div className="flex items-center gap-2 text-sm text-vytal-muted">
            <Tag className="h-3.5 w-3.5" />
            <span>Single day access</span>
          </div>
        )}

        {/* Allowed Class Types */}
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-vytal-muted">
            Allowed Classes
          </p>
          <div className="flex flex-wrap gap-1.5">
            {allowedTypes.map((ct) => (
              <span
                key={ct!.id}
                className="inline-flex items-center gap-1 rounded-full bg-vytal-bg3 px-2 py-0.5 text-[10px] font-medium text-vytal-text"
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: ct!.color }}
                />
                {ct!.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlansPage() {
  const activePlans = mockPlans.filter((p) => p.active);
  const inactivePlans = mockPlans.filter((p) => !p.active);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">
            Plans & Subscriptions
          </h1>
          <p className="mt-1 text-sm text-vytal-muted">
            Manage your membership plans and pricing
          </p>
        </div>
        <div className="hidden items-center gap-4 sm:flex">
          <div className="text-right">
            <p className="text-xs text-vytal-muted">Active Plans</p>
            <p className="font-mono text-sm font-semibold text-vytal-green">
              {activePlans.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-vytal-muted">Total Plans</p>
            <p className="font-mono text-sm font-semibold text-vytal-text">
              {mockPlans.length}
            </p>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {activePlans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      {/* Inactive Plans */}
      {inactivePlans.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-vytal-text">
            Inactive Plans
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {inactivePlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
