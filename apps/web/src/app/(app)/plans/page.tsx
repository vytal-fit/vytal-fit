"use client";

import { useState, useMemo } from "react";
import { useDataStore } from "@/stores/data-store";
import type { SubscriptionPlan } from "@vytal-fit/shared";
import {
  CreditCard, CheckCircle, XCircle, Tag, Dumbbell, Users, Star, TrendingUp, Trash2, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { formatCurrency as formatCurrencyStore } from "@/stores/data-store";

const typeLabels: Record<string, { labelKey: string; className: string }> = {
  monthly: { labelKey: "plans.monthly", className: "bg-vytal-green/10 text-vytal-green" },
  quarterly: { labelKey: "plans.quarterly", className: "bg-vytal-blue/10 text-vytal-blue" },
  semester: { labelKey: "plans.semester", className: "bg-vytal-blue/10 text-vytal-blue" },
  annual: { labelKey: "plans.annual", className: "bg-vytal-purple/10 text-vytal-purple" },
  session_pack: { labelKey: "plans.sessionPack", className: "bg-vytal-amber/10 text-vytal-amber" },
  day_pass: { labelKey: "plans.dayPass", className: "bg-vytal-orange/10 text-vytal-orange" },
  trial: { labelKey: "plans.trialType", className: "bg-vytal-amber/10 text-vytal-amber" },
};

const planSubscribers: Record<string, number> = {
  "plan-1": 145, "plan-2": 89, "plan-3": 62, "plan-4": 34,
  "plan-5": 28, "plan-6": 15, "plan-7": 22, "plan-8": 8,
};

const planMonthlyRevenue: Record<string, number> = {
  "plan-1": 10875, "plan-2": 5340, "plan-3": 3100, "plan-4": 2210,
  "plan-5": 2800, "plan-6": 449, "plan-7": 880, "plan-8": 120,
};

function formatCurrency(value: number): string {
  return formatCurrencyStore(value);
}

function PlanCard({
  plan, isPopular, subscriberCount, monthlyRevenue, maxSubscribers,
  onToggleActive, onDelete,
}: {
  plan: SubscriptionPlan; isPopular: boolean; subscriberCount: number;
  monthlyRevenue: number; maxSubscribers: number;
  onToggleActive: () => void; onDelete: () => void;
}) {
  const { t } = useI18n();
  const storeClassTypes = useDataStore((s) => s.classTypes);
  const typeConfig = typeLabels[plan.type] ?? { labelKey: plan.type, className: "bg-vytal-muted/10 text-vytal-muted" };
  const allowedTypes = plan.allowedClassTypes.map((ctId) => storeClassTypes.find((ct) => ct.id === ctId)).filter(Boolean);
  const subscriberPct = maxSubscribers > 0 ? (subscriberCount / maxSubscribers) * 100 : 0;

  return (
    <div className={cn("group relative rounded-xl border bg-vytal-card p-6 transition-colors hover:border-[rgba(34,197,94,0.22)]", isPopular ? "border-vytal-green/30" : "border-vytal-border")}>
      {isPopular && (
        <div className="absolute -top-2.5 left-4 flex items-center gap-1 rounded-full bg-vytal-green px-2.5 py-0.5 text-[10px] font-bold text-vytal-bg">
          <Star className="h-2.5 w-2.5" /> {t("plans.mostPopular")}
        </div>
      )}

      {/* Delete button */}
      <button onClick={onDelete} className="absolute right-3 top-3 rounded-lg p-1.5 text-vytal-muted opacity-0 transition-all hover:bg-vytal-red/10 hover:text-vytal-red group-hover:opacity-100" title={t("action.delete")}>
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-vytal-text">{plan.name}</h3>
          <div className="mt-1 flex items-center gap-2">
            <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider", typeConfig.className)}>{t(typeConfig.labelKey)}</span>
            {/* Active toggle */}
            <button onClick={onToggleActive} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors hover:opacity-80">
              {plan.active ? (
                <span className="inline-flex items-center gap-1 bg-vytal-green/10 rounded-full px-2 py-0.5 text-vytal-green"><CheckCircle className="h-2.5 w-2.5" /> {t("plans.active")}</span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-vytal-red/10 rounded-full px-2 py-0.5 text-vytal-red"><XCircle className="h-2.5 w-2.5" /> {t("plans.inactive")}</span>
              )}
            </button>
          </div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-green/10">
          <CreditCard className="h-5 w-5 text-vytal-green" />
        </div>
      </div>

      {/* Price */}
      <div className="mb-4">
        <span className="text-3xl font-bold text-vytal-text">{formatCurrency(plan.price)}</span>
        <span className="text-sm text-vytal-muted">
          {plan.type === "monthly" ? t("plans.perMonth") : plan.type === "semester" ? t("plans.per6Months") : plan.type === "annual" ? t("plans.perYear") : plan.type === "quarterly" ? t("plans.perQuarter") : ""}
        </span>
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-vytal-bg3 px-3 py-2">
          <div className="flex items-center gap-1.5"><Users className="h-3 w-3 text-vytal-blue" /><span className="font-mono text-sm font-bold text-vytal-text">{subscriberCount}</span></div>
          <p className="text-[10px] text-vytal-muted">{t("plans.subscribers")}</p>
        </div>
        <div className="rounded-lg bg-vytal-bg3 px-3 py-2">
          <div className="flex items-center gap-1.5"><TrendingUp className="h-3 w-3 text-vytal-green" /><span className="font-mono text-sm font-bold text-vytal-text">{formatCurrency(monthlyRevenue)}</span></div>
          <p className="text-[10px] text-vytal-muted">{t("plans.monthlyRevenue")}</p>
        </div>
      </div>

      {/* Distribution Bar */}
      <div className="mb-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-vytal-bg3">
          <div className="h-full rounded-full bg-vytal-green transition-all" style={{ width: `${subscriberPct}%` }} />
        </div>
        <p className="mt-1 text-[10px] text-vytal-muted text-right">{subscriberPct.toFixed(0)}% {t("plans.ofSubscribers")}</p>
      </div>

      {/* Details */}
      <div className="space-y-3 border-t border-vytal-border pt-4">
        {plan.maxSessions && (
          <div className="flex items-center gap-2 text-sm text-vytal-muted">
            <Tag className="h-3.5 w-3.5" />
            <span>{plan.maxSessions} {t("plans.sessions")} {plan.type === "session_pack" ? t("plans.total") : t("plans.perMonthLabel")}</span>
          </div>
        )}
        {!plan.maxSessions && plan.type !== "day_pass" && (
          <div className="flex items-center gap-2 text-sm text-vytal-green">
            <Dumbbell className="h-3.5 w-3.5" />
            <span>{t("plans.unlimitedSessions")}</span>
          </div>
        )}
        {plan.type === "day_pass" && (
          <div className="flex items-center gap-2 text-sm text-vytal-muted">
            <Tag className="h-3.5 w-3.5" />
            <span>{t("plans.singleDayAccess")}</span>
          </div>
        )}
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("plans.allowedClasses")}</p>
          <div className="flex flex-wrap gap-1.5">
            {allowedTypes.map((ct) => (
              <span key={ct!.id} className="inline-flex items-center gap-1 rounded-full bg-vytal-bg3 px-2 py-0.5 text-[10px] font-medium text-vytal-text">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: ct!.color }} />
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
  const { toast } = useToast();
  const storePlans = useDataStore((s) => s.plans);
  const addPlan = useDataStore((s) => s.addPlan);
  const updatePlan = useDataStore((s) => s.updatePlan);
  const deletePlan = useDataStore((s) => s.deletePlan);
  const [showInactive, setShowInactive] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const plans = useMemo(() => {
    return showInactive ? storePlans : storePlans.filter((p) => p.active);
  }, [showInactive, storePlans]);

  const totalSubscribers = Object.values(planSubscribers).reduce((s, v) => s + v, 0);
  const totalMonthlyRevenue = Object.values(planMonthlyRevenue).reduce((s, v) => s + v, 0);
  const mostPopularPlanId = Object.entries(planSubscribers).reduce((max, [id, count]) => (count > max[1] ? [id, count] : max), ["", 0])[0];
  const maxSubscribers = Math.max(...Object.values(planSubscribers));

  function handleToggleActive(id: string, currentActive: boolean) {
    updatePlan(id, { active: !currentActive });
    toast(currentActive ? t("plans.planDeactivated") : t("plans.planActivated"), "success");
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    const removed = storePlans.find((p) => p.id === deleteTarget.id);
    deletePlan(deleteTarget.id);
    toast(t("plans.planDeleted"), "success", {
      action: removed
        ? {
            label: t("action.undo"),
            onClick: () => addPlan({ organizationId: removed.organizationId, name: removed.name, type: removed.type, price: removed.price, currency: removed.currency, maxSessions: removed.maxSessions, allowedClassTypes: removed.allowedClassTypes, active: removed.active }),
          }
        : undefined,
    });
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("plans.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">{t("plans.subtitle")}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-4 sm:flex">
            <div className="text-right"><p className="text-xs text-vytal-muted">{t("plans.totalSubscribers")}</p><p className="font-mono text-sm font-semibold text-vytal-blue">{totalSubscribers}</p></div>
            <div className="text-right"><p className="text-xs text-vytal-muted">{t("plans.monthlyRevenue")}</p><p className="font-mono text-sm font-semibold text-vytal-green">{formatCurrency(totalMonthlyRevenue)}</p></div>
            <div className="text-right"><p className="text-xs text-vytal-muted">{t("plans.activePlans")}</p><p className="font-mono text-sm font-semibold text-vytal-text">{storePlans.filter((p) => p.active).length}</p></div>
          </div>
          <Link href="/plans/create" className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90">
            <Plus className="h-4 w-4" /> {t("action.create")}
          </Link>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex items-center gap-3">
        <button onClick={() => setShowInactive(false)} className={cn("rounded-full px-4 py-1.5 text-sm font-medium transition-colors", !showInactive ? "bg-vytal-green/10 text-vytal-green" : "bg-vytal-bg2 text-vytal-muted hover:text-vytal-text")}>
          {t("plans.activeFilter")}
        </button>
        <button onClick={() => setShowInactive(true)} className={cn("rounded-full px-4 py-1.5 text-sm font-medium transition-colors", showInactive ? "bg-vytal-green/10 text-vytal-green" : "bg-vytal-bg2 text-vytal-muted hover:text-vytal-text")}>
          {t("plans.allFilter")}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isPopular={plan.id === mostPopularPlanId}
            subscriberCount={planSubscribers[plan.id] ?? 0}
            monthlyRevenue={planMonthlyRevenue[plan.id] ?? 0}
            maxSubscribers={maxSubscribers}
            onToggleActive={() => handleToggleActive(plan.id, plan.active)}
            onDelete={() => setDeleteTarget({ id: plan.id, name: plan.name })}
          />
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title={t("plans.deletePlan")}
        description={t("plans.confirmDelete").replace("{name}", deleteTarget?.name ?? "")}
        confirmLabel={t("action.delete")}
        cancelLabel={t("action.cancel")}
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
