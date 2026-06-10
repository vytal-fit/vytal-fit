"use client";

import {
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { formatCurrency } from "@/stores/data-store";
import { Breadcrumbs } from "@/components/breadcrumbs";

interface LTVByPlan {
  plan: string;
  avgLTV: number;
  members: number;
  avgDuration: number;
}

interface LTVBySource {
  source: string;
  avgLTV: number;
  members: number;
}

interface TopMember {
  name: string;
  ltv: number;
  monthsActive: number;
  plan: string;
}

interface CohortLTV {
  month: string;
  ltv: number;
  members: number;
}

const ARPM = 41.40;
const AVG_DURATION_MONTHS = 12;
const LTV = ARPM * AVG_DURATION_MONTHS;

const ltvDistribution = [
  { range: "0-200", count: 12 },
  { range: "200-400", count: 28 },
  { range: "400-600", count: 45 },
  { range: "600-800", count: 22 },
  { range: "800-1000", count: 14 },
  { range: "1000+", count: 6 },
];

const ltvByPlan: LTVByPlan[] = [
  { plan: "Anual Unlimited", avgLTV: 828, members: 34, avgDuration: 20 },
  { plan: "Semestral", avgLTV: 546, members: 28, avgDuration: 14 },
  { plan: "Mensal Unlimited", avgLTV: 414, members: 42, avgDuration: 10 },
  { plan: "Pack 10 Aulas", avgLTV: 280, members: 15, avgDuration: 7 },
  { plan: "Trial", avgLTV: 82, members: 8, avgDuration: 2 },
];

const ltvBySource: LTVBySource[] = [
  { source: "Referral", avgLTV: 680, members: 35 },
  { source: "Instagram", avgLTV: 520, members: 28 },
  { source: "Walk-in", avgLTV: 490, members: 22 },
  { source: "Google Ads", avgLTV: 380, members: 18 },
  { source: "Facebook", avgLTV: 340, members: 16 },
  { source: "Website", avgLTV: 310, members: 8 },
];

const topMembers: TopMember[] = [
  { name: "Ana Silva", ltv: 1490, monthsActive: 36, plan: "Anual Unlimited" },
  { name: "Pedro Almeida", ltv: 1240, monthsActive: 30, plan: "Anual Unlimited" },
  { name: "Sofia Santos", ltv: 1100, monthsActive: 28, plan: "Semestral" },
  { name: "Tiago Neves", ltv: 990, monthsActive: 24, plan: "Anual Unlimited" },
  { name: "Catarina Reis", ltv: 920, monthsActive: 22, plan: "Mensal Unlimited" },
  { name: "Miguel Costa", ltv: 870, monthsActive: 21, plan: "Semestral" },
  { name: "Diogo Martins", ltv: 830, monthsActive: 20, plan: "Anual Unlimited" },
  { name: "Helena Cardoso", ltv: 780, monthsActive: 19, plan: "Mensal Unlimited" },
  { name: "Francisca Nunes", ltv: 740, monthsActive: 18, plan: "Semestral" },
  { name: "Rui Goncalves", ltv: 690, monthsActive: 17, plan: "Mensal Unlimited" },
];

const cohortLTV: CohortLTV[] = [
  { month: "Jan 2025", ltv: 380, members: 12 },
  { month: "Feb 2025", ltv: 420, members: 8 },
  { month: "Mar 2025", ltv: 510, members: 15 },
  { month: "Apr 2025", ltv: 460, members: 10 },
  { month: "May 2025", ltv: 390, members: 14 },
  { month: "Jun 2025", ltv: 540, members: 11 },
  { month: "Jul 2025", ltv: 350, members: 9 },
  { month: "Aug 2025", ltv: 480, members: 13 },
  { month: "Sep 2025", ltv: 520, members: 16 },
  { month: "Oct 2025", ltv: 410, members: 7 },
  { month: "Nov 2025", ltv: 560, members: 12 },
  { month: "Dec 2025", ltv: 490, members: 10 },
];

export default function MemberLTVPage() {
  const { t } = useI18n();

  const maxDist = Math.max(...ltvDistribution.map((d) => d.count));
  const maxSource = Math.max(...ltvBySource.map((s) => s.avgLTV));
  const maxCohort = Math.max(...cohortLTV.map((c) => c.ltv));

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs
          items={[
            { label: t("nav.members"), href: "/members" },
            { label: t("ltv.title") },
          ]}
        />
        <p className="mt-1 text-sm text-vytal-muted">{t("ltv.subtitle")}</p>
      </div>

      {/* LTV Formula */}
      <div className="rounded-xl border border-vytal-green/20 bg-vytal-green/[0.03] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vytal-green/10">
            <Sparkles className="h-5 w-5 text-vytal-green" />
          </div>
          <div>
            <h2 className="text-base font-bold text-vytal-text">{t("ltv.formula")}</h2>
            <p className="text-xs text-vytal-muted">{t("ltv.formulaExplain")}</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 rounded-lg bg-vytal-bg2 p-5">
          <div className="text-center">
            <p className="text-xs text-vytal-muted">ARPM</p>
            <p className="text-2xl font-bold text-vytal-text">{formatCurrency(ARPM)}</p>
          </div>
          <span className="text-2xl font-bold text-vytal-muted">&times;</span>
          <div className="text-center">
            <p className="text-xs text-vytal-muted">{t("ltv.avgDuration")}</p>
            <p className="text-2xl font-bold text-vytal-text">{AVG_DURATION_MONTHS} {t("ltv.months")}</p>
          </div>
          <span className="text-2xl font-bold text-vytal-muted">=</span>
          <div className="text-center">
            <p className="text-xs text-vytal-muted">LTV</p>
            <p className="text-3xl font-bold text-vytal-green">{formatCurrency(LTV)}</p>
          </div>
        </div>
      </div>

      {/* LTV Distribution */}
      <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-6">
        <h3 className="text-base font-bold text-vytal-text mb-4">{t("ltv.distribution")}</h3>
        <div className="flex items-end gap-2 h-40">
          {ltvDistribution.map((d) => (
            <div key={d.range} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-semibold text-vytal-text">{d.count}</span>
              <div
                className="w-full rounded-t bg-vytal-green/80 transition-all"
                style={{ height: `${(d.count / maxDist) * 100}%` }}
              />
              <span className="text-[9px] text-vytal-muted">{d.range}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LTV by Plan */}
        <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-6">
          <h3 className="text-base font-bold text-vytal-text mb-4">{t("ltv.byPlan")}</h3>
          <div className="space-y-3">
            {ltvByPlan.map((plan) => (
              <div key={plan.plan} className="flex items-center justify-between rounded-lg border border-vytal-border px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-vytal-text">{plan.plan}</p>
                  <p className="text-xs text-vytal-muted">{plan.members} {t("ltv.members")} &middot; {plan.avgDuration} {t("ltv.months")}</p>
                </div>
                <span className="text-sm font-bold text-vytal-green">{formatCurrency(plan.avgLTV)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* LTV by Source */}
        <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-6">
          <h3 className="text-base font-bold text-vytal-text mb-4">{t("ltv.bySource")}</h3>
          <div className="space-y-2">
            {ltvBySource.map((src) => (
              <div key={src.source} className="flex items-center gap-3">
                <span className="w-24 text-sm text-vytal-text truncate">{src.source}</span>
                <div className="flex-1 h-6 rounded-full bg-vytal-bg3 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-vytal-blue/80 transition-all"
                    style={{ width: `${(src.avgLTV / maxSource) * 100}%` }}
                  />
                </div>
                <span className="w-16 text-right text-sm font-semibold text-vytal-text">{formatCurrency(src.avgLTV)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top 10 Members */}
      <div className="rounded-xl border border-vytal-border bg-vytal-bg2 overflow-hidden">
        <div className="px-5 py-4 border-b border-vytal-border">
          <h3 className="text-base font-bold text-vytal-text">{t("ltv.topMembers")}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-vytal-border bg-vytal-bg3/50 text-left">
                <th className="px-5 py-3 font-semibold text-vytal-muted">#</th>
                <th className="px-5 py-3 font-semibold text-vytal-muted">{t("ltv.name")}</th>
                <th className="px-5 py-3 font-semibold text-vytal-muted">{t("ltv.plan")}</th>
                <th className="px-5 py-3 font-semibold text-vytal-muted text-right">{t("ltv.monthsActive")}</th>
                <th className="px-5 py-3 font-semibold text-vytal-muted text-right">LTV</th>
              </tr>
            </thead>
            <tbody>
              {topMembers.map((m, idx) => (
                <tr key={m.name} className="border-b border-vytal-border last:border-b-0 hover:bg-vytal-bg3/30 transition-colors">
                  <td className="px-5 py-3">
                    <span className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                      idx === 0 ? "bg-vytal-amber/10 text-vytal-amber" :
                      idx === 1 ? "bg-vytal-muted/10 text-vytal-muted" :
                      idx === 2 ? "bg-orange-500/10 text-orange-500" :
                      "bg-vytal-bg3 text-vytal-muted"
                    )}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-vytal-text">{m.name}</td>
                  <td className="px-5 py-3 text-vytal-muted">{m.plan}</td>
                  <td className="px-5 py-3 text-right text-vytal-muted">{m.monthsActive}</td>
                  <td className="px-5 py-3 text-right font-bold text-vytal-green">{formatCurrency(m.ltv)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cohort LTV */}
      <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-6">
        <h3 className="text-base font-bold text-vytal-text mb-4">{t("ltv.cohort")}</h3>
        <div className="flex items-end gap-2 h-40">
          {cohortLTV.map((c) => (
            <div key={c.month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] font-semibold text-vytal-text">{formatCurrency(c.ltv)}</span>
              <div
                className="w-full rounded-t bg-gradient-to-t from-vytal-green/60 to-vytal-green transition-all"
                style={{ height: `${(c.ltv / maxCohort) * 100}%` }}
              />
              <span className="text-[8px] text-vytal-muted whitespace-nowrap">{c.month.slice(0, 3)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
