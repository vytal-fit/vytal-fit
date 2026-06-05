"use client";

import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Users, TrendingUp, TrendingDown, UserPlus, UserMinus, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

// --- Mock Data ---

const funnelSteps = [
  { key: "leads", count: 100, conversion: 100, avgDays: 0 },
  { key: "contacted", count: 85, conversion: 85, avgDays: 2.1 },
  { key: "trial", count: 60, conversion: 70.6, avgDays: 5.4 },
  { key: "subscribed", count: 42, conversion: 70, avgDays: 8.2 },
  { key: "active3mo", count: 38, conversion: 90.5, avgDays: 90 },
];

const memberGrowthData = [
  { month: "Jul", newMembers: 12, churned: 3, net: 9 },
  { month: "Aug", newMembers: 15, churned: 4, net: 11 },
  { month: "Sep", newMembers: 18, churned: 5, net: 13 },
  { month: "Oct", newMembers: 14, churned: 3, net: 11 },
  { month: "Nov", newMembers: 16, churned: 4, net: 12 },
  { month: "Dec", newMembers: 10, churned: 6, net: 4 },
  { month: "Jan", newMembers: 20, churned: 5, net: 15 },
  { month: "Feb", newMembers: 17, churned: 4, net: 13 },
  { month: "Mar", newMembers: 19, churned: 3, net: 16 },
  { month: "Apr", newMembers: 15, churned: 4, net: 11 },
  { month: "May", newMembers: 14, churned: 3, net: 11 },
  { month: "Jun", newMembers: 16, churned: 4, net: 12 },
];

const retentionCurve = [
  { month: "1m", retention: 92 },
  { month: "2m", retention: 85 },
  { month: "3m", retention: 79 },
  { month: "6m", retention: 68 },
  { month: "12m", retention: 55 },
];

const cohortData = [
  { joinMonth: "Jan", months: [100, 94, 88, 82, 76, 72] },
  { joinMonth: "Feb", months: [100, 92, 85, 80, 74, 70] },
  { joinMonth: "Mar", months: [100, 95, 90, 85, 80, null] },
  { joinMonth: "Apr", months: [100, 93, 87, 82, null, null] },
  { joinMonth: "May", months: [100, 91, 84, null, null, null] },
  { joinMonth: "Jun", months: [100, 94, null, null, null, null] },
];

function getCohortColor(value: number | null): string {
  if (value === null) return "";
  if (value >= 90) return "bg-vytal-green/20 text-vytal-green";
  if (value >= 80) return "bg-vytal-green/10 text-vytal-green";
  if (value >= 70) return "bg-vytal-amber/10 text-vytal-amber";
  if (value >= 60) return "bg-vytal-orange/10 text-vytal-orange";
  return "bg-vytal-red/10 text-vytal-red";
}

function GrowthTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-vytal-border bg-vytal-card px-4 py-3 shadow-lg">
        <p className="mb-1 text-xs font-semibold text-vytal-text">{label}</p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-vytal-muted">{entry.name}:</span>
            <span className="font-mono text-xs font-semibold text-vytal-text">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function MemberAnalyticsPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: t("nav.members"), href: "/members" }, { label: t("memberAnalytics.title") }]} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-vytal-text">{t("memberAnalytics.title")}</h1>
        <p className="mt-1 text-sm text-vytal-muted">{t("memberAnalytics.subtitle")}</p>
      </div>

      {/* Row 1: Acquisition Funnel */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
        <h3 className="mb-6 text-sm font-semibold text-vytal-text">{t("memberAnalytics.acquisitionFunnel")}</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {funnelSteps.map((step, i) => (
            <div key={step.key} className="flex items-center gap-2">
              <div className="flex min-w-[140px] flex-col items-center rounded-xl border border-vytal-border bg-vytal-bg2 p-4">
                <span className="text-2xl font-bold text-vytal-text">{step.count}</span>
                <span className="mt-1 text-xs font-medium text-vytal-muted">{t(`memberAnalytics.funnel.${step.key}`)}</span>
                {i > 0 && (
                  <div className="mt-2 flex flex-col items-center gap-0.5">
                    <span className="text-[10px] font-semibold text-vytal-green">{step.conversion}%</span>
                    <span className="text-[9px] text-vytal-muted">{step.avgDays}d avg</span>
                  </div>
                )}
              </div>
              {i < funnelSteps.length - 1 && (
                <ArrowRight className="h-4 w-4 shrink-0 text-vytal-muted/40" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Two charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Member Growth */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("memberAnalytics.memberGrowth")}</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={memberGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,140,114,0.1)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b8c72" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b8c72" }} />
                <Tooltip content={<GrowthTooltip />} />
                <Legend verticalAlign="top" height={36} />
                <Line type="monotone" dataKey="newMembers" name={t("memberAnalytics.new")} stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e", r: 3 }} />
                <Line type="monotone" dataKey="churned" name={t("memberAnalytics.churned")} stroke="#ff4757" strokeWidth={2} dot={{ fill: "#ff4757", r: 3 }} />
                <Line type="monotone" dataKey="net" name={t("memberAnalytics.net")} stroke="#00d4ff" strokeWidth={2} dot={{ fill: "#00d4ff", r: 3 }} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Retention Curve */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("memberAnalytics.retentionCurve")}</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={retentionCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,140,114,0.1)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b8c72" }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b8c72" }} tickFormatter={(v: number) => `${v}%`} />
                <Tooltip formatter={(value) => `${value}%`} contentStyle={{ backgroundColor: "rgba(22,32,24,0.95)", border: "1px solid rgba(34,197,94,0.12)", borderRadius: "8px" }} labelStyle={{ color: "#dceee0" }} itemStyle={{ color: "#22c55e" }} />
                <Line
                  type="monotone"
                  dataKey="retention"
                  name={t("memberAnalytics.retention")}
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  dot={{ fill: "#22c55e", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Cohort Table */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-vytal-text">{t("memberAnalytics.cohortAnalysis")}</h2>
        <div className="overflow-x-auto rounded-xl border border-vytal-border">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-vytal-border bg-vytal-bg2">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("memberAnalytics.cohort")}
                </th>
                {[0, 1, 2, 3, 4, 5].map((m) => (
                  <th key={m} className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-vytal-muted">
                    {t("memberAnalytics.monthN").replace("{n}", String(m))}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-vytal-border">
              {cohortData.map((row) => (
                <tr key={row.joinMonth} className="bg-vytal-card">
                  <td className="px-4 py-3 text-sm font-medium text-vytal-text">{row.joinMonth} 2026</td>
                  {row.months.map((val, i) => (
                    <td key={i} className="px-4 py-3 text-center">
                      {val !== null ? (
                        <span className={cn("inline-flex items-center justify-center rounded-md px-3 py-1 font-mono text-xs font-semibold", getCohortColor(val))}>
                          {val}%
                        </span>
                      ) : (
                        <span className="text-xs text-vytal-muted/30">--</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
