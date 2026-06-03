"use client";

import { useState, useMemo } from "react";
import { mockPlans, mockClassTypes } from "@vytal-fit/shared";
import type { SubscriptionPlan } from "@vytal-fit/shared";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Tag,
  Dumbbell,
  Users,
  Star,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { formatCurrency as formatCurrencyStore } from "@/stores/data-store";

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

// Mock subscriber counts
const planSubscribers: Record<string, number> = {
  "plan-1": 145,
  "plan-2": 89,
  "plan-3": 62,
  "plan-4": 34,
  "plan-5": 28,
  "plan-6": 15,
  "plan-7": 22,
  "plan-8": 8,
};

// Mock monthly revenue per plan
const planMonthlyRevenue: Record<string, number> = {
  "plan-1": 10875,
  "plan-2": 5340,
  "plan-3": 3100,
  "plan-4": 2210,
  "plan-5": 2800,
  "plan-6": 449,
  "plan-7": 880,
  "plan-8": 120,
};

function formatCurrency(value: number, _currency?: string): string {
  return formatCurrencyStore(value);
}

function PlanCard({
  plan,
  isPopular,
  subscriberCount,
  monthlyRevenue,
  maxSubscribers,
}: {
  plan: SubscriptionPlan;
  isPopular: boolean;
  subscriberCount: number;
  monthlyRevenue: number;
  maxSubscribers: number;
}) {
  const typeConfig = typeLabels[plan.type] ?? {
    label: plan.type,
    className: "bg-vytal-muted/10 text-vytal-muted",
  };
  const allowedTypes = plan.allowedClassTypes
    .map((ctId) => mockClassTypes.find((ct) => ct.id === ctId))
    .filter(Boolean);

  const subscriberPct = maxSubscribers > 0 ? (subscriberCount / maxSubscribers) * 100 : 0;

  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-vytal-card p-6 transition-colors hover:border-[rgba(61,255,110,0.22)]",
        isPopular ? "border-vytal-green/30" : "border-vytal-border"
      )}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-2.5 left-4 flex items-center gap-1 rounded-full bg-vytal-green px-2.5 py-0.5 text-[10px] font-bold text-vytal-bg">
          <Star className="h-2.5 w-2.5" />
          MOST POPULAR
        </div>
      )}

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

      {/* Subscriber & Revenue Stats */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-vytal-bg3 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <Users className="h-3 w-3 text-vytal-blue" />
            <span className="font-mono text-sm font-bold text-vytal-text">
              {subscriberCount}
            </span>
          </div>
          <p className="text-[10px] text-vytal-muted">Subscribers</p>
        </div>
        <div className="rounded-lg bg-vytal-bg3 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 text-vytal-green" />
            <span className="font-mono text-sm font-bold text-vytal-text">
              {formatCurrency(monthlyRevenue, plan.currency)}
            </span>
          </div>
          <p className="text-[10px] text-vytal-muted">Monthly Revenue</p>
        </div>
      </div>

      {/* Subscriber Distribution Bar */}
      <div className="mb-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-vytal-bg3">
          <div
            className="h-full rounded-full bg-vytal-green transition-all"
            style={{ width: `${subscriberPct}%` }}
          />
        </div>
        <p className="mt-1 text-[10px] text-vytal-muted text-right">
          {subscriberPct.toFixed(0)}% of subscribers
        </p>
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
  const { t } = useI18n();
  const [showInactive, setShowInactive] = useState(false);

  const plans = useMemo(() => {
    return showInactive ? mockPlans : mockPlans.filter((p) => p.active);
  }, [showInactive]);

  const totalSubscribers = Object.values(planSubscribers).reduce(
    (s, v) => s + v,
    0
  );
  const totalMonthlyRevenue = Object.values(planMonthlyRevenue).reduce(
    (s, v) => s + v,
    0
  );

  // Find most popular plan
  const mostPopularPlanId = Object.entries(planSubscribers).reduce(
    (max, [id, count]) => (count > max[1] ? [id, count] : max),
    ["", 0]
  )[0];

  const maxSubscribers = Math.max(...Object.values(planSubscribers));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">
            {t("plans.title")}
          </h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("plans.subtitle")}
          </p>
        </div>
        <div className="hidden items-center gap-4 sm:flex">
          <div className="text-right">
            <p className="text-xs text-vytal-muted">Total Subscribers</p>
            <p className="font-mono text-sm font-semibold text-vytal-blue">
              {totalSubscribers}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-vytal-muted">Monthly Revenue</p>
            <p className="font-mono text-sm font-semibold text-vytal-green">
              {formatCurrency(totalMonthlyRevenue, "EUR")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-vytal-muted">Active Plans</p>
            <p className="font-mono text-sm font-semibold text-vytal-text">
              {mockPlans.filter((p) => p.active).length}
            </p>
          </div>
        </div>
      </div>

      {/* Active/Inactive Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowInactive(false)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            !showInactive
              ? "bg-vytal-green/10 text-vytal-green"
              : "bg-vytal-bg2 text-vytal-muted hover:text-vytal-text"
          )}
        >
          Active Plans
        </button>
        <button
          onClick={() => setShowInactive(true)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            showInactive
              ? "bg-vytal-green/10 text-vytal-green"
              : "bg-vytal-bg2 text-vytal-muted hover:text-vytal-text"
          )}
        >
          All Plans
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isPopular={plan.id === mostPopularPlanId}
            subscriberCount={planSubscribers[plan.id] ?? 0}
            monthlyRevenue={planMonthlyRevenue[plan.id] ?? 0}
            maxSubscribers={maxSubscribers}
          />
        ))}
      </div>
    </div>
  );
}
