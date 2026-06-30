"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { useOrgFormat } from "@/lib/org-format";
import { Lightbulb, TrendingDown, Users, Clock, Zap } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend, Area, AreaChart,
} from "recharts";

// ---------------------------------------------------------------------------
// Shared tooltip style
// ---------------------------------------------------------------------------
const tooltipStyle = {
  contentStyle: { backgroundColor: "#0f1610", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "8px", fontSize: 12, color: "#dceee0" },
  itemStyle: { color: "#dceee0" },
  labelStyle: { color: "#6b8c72", marginBottom: 4 },
};

function ChartCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-vytal-border bg-vytal-card/80 p-6 backdrop-blur-sm", className)}>
      <h3 className="mb-4 text-sm font-semibold text-vytal-text">{title}</h3>
      {children}
    </div>
  );
}

interface SparklineCardProps {
  label: string; value: string; trend: string; trendUp: boolean;
  data: { v: number }[]; color: string; vsLastMonth: string;
}

function SparklineCard({ label, value, trend, trendUp, data, color, vsLastMonth }: SparklineCardProps) {
  return (
    <div className="rounded-xl border border-vytal-border bg-vytal-card/80 p-5 backdrop-blur-sm">
      <span className="text-[10px] font-medium uppercase tracking-wider text-vytal-muted">{label}</span>
      <div className="mt-1 flex items-end justify-between">
        <span className="text-2xl font-bold text-vytal-text">{value}</span>
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", trendUp ? "bg-vytal-green/10 text-vytal-green" : "bg-vytal-red/10 text-vytal-red")}>
          {trend}
        </span>
      </div>
      <p className="mt-1 text-[10px] text-vytal-muted">vs last month: {vsLastMonth}</p>
      <div className="mt-3 h-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#grad-${label})`} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function heatCellColor(value: number, max: number): string {
  if (value === 0) return "rgba(22,32,24,0.9)";
  const intensity = value / max;
  if (intensity <= 0.15) return "rgba(34,197,94,0.08)";
  if (intensity <= 0.3) return "rgba(34,197,94,0.18)";
  if (intensity <= 0.45) return "rgba(34,197,94,0.3)";
  if (intensity <= 0.6) return "rgba(34,197,94,0.45)";
  if (intensity <= 0.8) return "rgba(34,197,94,0.65)";
  return "rgba(34,197,94,0.85)";
}

interface RevenueBreakdownEntry { value: number; dataKey: string; color: string; name: string }
function RevenueBreakdownTooltip({ active, payload, label }: { active?: boolean; payload?: RevenueBreakdownEntry[]; label?: string }) {
  const { money: formatCurrency } = useOrgFormat();
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: "#0f1610", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
      <p style={{ color: "#6b8c72", marginBottom: 4 }}>{label}</p>
      {payload.map((entry) => <p key={entry.dataKey} style={{ color: entry.color }}>{entry.name}: {formatCurrency(entry.value)}</p>)}
    </div>
  );
}

// Key insights data
const keyInsightDefs = [
  { icon: Clock, textKey: "analytics.insight.busiest", color: "text-vytal-amber", bg: "bg-vytal-amber/10" },
  { icon: TrendingDown, textKey: "analytics.insight.churn", color: "text-vytal-green", bg: "bg-vytal-green/10" },
  { icon: Users, textKey: "analytics.insight.newMembers", color: "text-vytal-blue", bg: "bg-vytal-blue/10" },
];

export default function AnalyticsPage() {
  const { money: formatCurrency, moneyCompact: formatCurrencyCompact } = useOrgFormat();
  const { t } = useI18n();
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: string; value: number } | null>(null);

  // ── Real, org-scoped aggregates ──
  const statsQuery = trpc.dashboard.stats.useQuery();
  const chartsQuery = trpc.dashboard.charts.useQuery();
  const analyticsQuery = trpc.dashboard.analytics.useQuery();
  const stats = statsQuery.data;

  const memberGrowthData = (chartsQuery.data?.memberGrowth ?? []).map((m) => ({
    month: m.month,
    members: m.total,
  }));
  const genderData = analyticsQuery.data?.genderDistribution ?? [];
  const ageData = analyticsQuery.data?.ageDistribution ?? [];
  const planData = analyticsQuery.data?.planDistribution ?? [];
  const funnelData = analyticsQuery.data?.leadFunnel ?? [];
  const funnelConversions = funnelData
    .slice(1)
    .map((f, i) => (funnelData[i].count ? Math.round((f.count / funnelData[i].count) * 100) : 0));
  const revenueBreakdownData = (chartsQuery.data?.revenueByMonth ?? []).map((m) => ({
    month: m.month,
    memberships: m.revenue,
    services: 0,
    products: 0,
  }));
  const revenuePerMemberData = analyticsQuery.data?.revenuePerMember ?? [];

  const PEAK_HEATMAP = chartsQuery.data?.heatmap ?? [];
  const HOURS = (chartsQuery.data?.hours ?? []).map((h) => `${String(h).padStart(2, "0")}:00`);
  const pMax = Math.max(1, ...PEAK_HEATMAP.flat());

  // Sparklines from the real series.
  const growth = chartsQuery.data?.memberGrowth ?? [];
  const sparklineActiveMembers = growth.map((m) => ({ v: m.active }));
  const sparklineRevenue = (chartsQuery.data?.revenueByMonth ?? []).map((m) => ({ v: m.revenue }));
  const sparklineRpm = revenuePerMemberData.map((m) => ({ v: m.rpm }));
  const sparklineNewMembers = growth.map((m, i) => ({
    v: i === 0 ? 0 : Math.max(0, m.total - growth[i - 1].total),
  }));

  // Month-over-month trend from a real series.
  const trendOf = (series: { v: number }[]): { trend: string; up: boolean; prev: number } => {
    if (series.length < 2) return { trend: "+0%", up: true, prev: 0 };
    const last = series[series.length - 1].v;
    const prev = series[series.length - 2].v;
    const pct = prev ? Math.round(((last - prev) / prev) * 1000) / 10 : 0;
    return { trend: `${pct >= 0 ? "+" : ""}${pct}%`, up: pct >= 0, prev };
  };
  const amTrend = trendOf(sparklineActiveMembers);
  const revTrend = trendOf(sparklineRevenue);
  const rpmTrend = trendOf(sparklineRpm);
  const nmTrend = trendOf(sparklineNewMembers);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-vytal-text">{t("analytics.title")}</h1>
        <p className="mt-1 text-sm text-vytal-muted">{t("analytics.subtitle")}</p>
      </div>

      {/* Key Insights Card */}
      <div className="rounded-xl border border-vytal-green/20 bg-gradient-to-r from-vytal-green/5 to-vytal-blue/5 p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vytal-green/10">
            <Lightbulb className="h-4 w-4 text-vytal-green" />
          </div>
          <h3 className="text-sm font-semibold text-vytal-text">{t("analytics.keyInsights")}</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {keyInsightDefs.map((insight, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-vytal-border bg-vytal-card/60 px-4 py-3">
              <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", insight.bg)}>
                <insight.icon className={cn("h-3.5 w-3.5", insight.color)} />
              </div>
              <p className="text-sm text-vytal-text">{t(insight.textKey)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 1: Key Metrics Sparklines */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SparklineCard label={t("dashboard.activeMembers")} value={String(stats?.activeMembers ?? 0)} trend={amTrend.trend} trendUp={amTrend.up} data={sparklineActiveMembers} color="#22c55e" vsLastMonth={String(amTrend.prev)} />
        <SparklineCard label={t("dashboard.monthlyRevenue")} value={formatCurrency(stats?.monthlyRevenue ?? 0)} trend={revTrend.trend} trendUp={revTrend.up} data={sparklineRevenue} color="#00d4ff" vsLastMonth={formatCurrency(revTrend.prev)} />
        <SparklineCard label={t("analytics.revenuePerMember")} value={formatCurrency(revenuePerMemberData[revenuePerMemberData.length - 1]?.rpm ?? 0)} trend={rpmTrend.trend} trendUp={rpmTrend.up} data={sparklineRpm} color="#c084fc" vsLastMonth={formatCurrency(rpmTrend.prev)} />
        <SparklineCard label={t("dashboard.newMembersThisMonth") || "Novos membros"} value={String(stats?.newMembersThisMonth ?? 0)} trend={nmTrend.trend} trendUp={nmTrend.up} data={sparklineNewMembers} color="#ffb300" vsLastMonth={String(nmTrend.prev)} />
      </div>

      {/* Section 2: Member Demographics */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-vytal-text">{t("analytics.demographics")}</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Gender Split */}
          <ChartCard title={t("analytics.genderSplit")}>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" nameKey="name">
                    {genderData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} formatter={(value: string) => <span style={{ color: "#dceee0", fontSize: 12 }}>{value}</span>} />
                  <Tooltip {...tooltipStyle} formatter={(value) => [`${value}%`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Age Distribution */}
          <ChartCard title={t("analytics.ageDistribution")}>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData}>
                  <CartesianGrid stroke="rgba(34,197,94,0.08)" strokeDasharray="3 3" />
                  <XAxis dataKey="age" tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip {...tooltipStyle} formatter={(value) => [`${value}%`, t("analytics.percentage")]} />
                  <Bar dataKey="pct" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Plan Distribution */}
          <ChartCard title={t("analytics.planDistribution")}>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={planData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value" nameKey="name">
                    {planData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} formatter={(value: string) => <span style={{ color: "#dceee0", fontSize: 12 }}>{value}</span>} />
                  <Tooltip {...tooltipStyle} formatter={(value) => [`${value}%`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Member Growth Trend */}
      <ChartCard title={t("analytics.memberGrowth")}>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={memberGrowthData}>
              <defs>
                <linearGradient id="memberGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(34,197,94,0.08)" strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} domain={[300, 380]} />
              <Tooltip {...tooltipStyle} formatter={(value) => [`${value} members`, "Total"]} />
              <Area type="monotone" dataKey="members" stroke="#22c55e" strokeWidth={2} fill="url(#memberGrowthGrad)" dot={{ r: 3, fill: "#22c55e" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Section 3: Retention Funnel with Conversion % */}
      <ChartCard title={t("analytics.retentionFunnel")}>
        <div className="flex flex-col gap-3">
          {funnelData.map((step, i) => (
            <div key={step.label}>
              <div className="flex items-center gap-4">
                <span className="w-24 shrink-0 text-xs font-medium text-vytal-muted">{step.label}</span>
                <div className="flex-1">
                  <div className="flex h-9 items-center rounded-lg px-3 transition-all" style={{ width: `${step.pct}%`, backgroundColor: step.color, opacity: 0.85, minWidth: 60 }}>
                    <span className="font-mono text-xs font-bold text-vytal-bg">{step.count}</span>
                  </div>
                </div>
                <span className="w-10 shrink-0 text-right font-mono text-xs text-vytal-muted">{step.pct}%</span>
              </div>
              {/* Conversion arrow between steps */}
              {i < funnelData.length - 1 && (
                <div className="ml-28 mt-1 mb-1 flex items-center gap-1.5">
                  <div className="h-4 w-px bg-vytal-border" />
                  <span className="rounded-full bg-vytal-bg3 px-2 py-0.5 text-[10px] font-semibold text-vytal-muted">
                    {funnelConversions[i]}% conversion
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Section 4: Revenue Breakdown */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-vytal-text">{t("analytics.revenueBreakdown")}</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard title={t("analytics.revenueByCategory")}>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueBreakdownData}>
                  <CartesianGrid stroke="rgba(34,197,94,0.08)" strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatCurrencyCompact(v)} />
                  <Tooltip content={<RevenueBreakdownTooltip />} />
                  <Legend iconType="circle" iconSize={8} formatter={(value: string) => <span style={{ color: "#dceee0", fontSize: 12 }}>{value}</span>} />
                  <Bar dataKey="memberships" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} name={t("analytics.memberships")} />
                  <Bar dataKey="services" stackId="a" fill="#00d4ff" name={t("analytics.services")} />
                  <Bar dataKey="products" stackId="a" fill="#c084fc" radius={[6, 6, 0, 0]} name={t("analytics.products")} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title={t("analytics.revenuePerMember")}>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenuePerMemberData}>
                  <CartesianGrid stroke="rgba(34,197,94,0.08)" strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} domain={[40, 55]} tickFormatter={(v: number) => formatCurrency(v)} />
                  <Tooltip {...tooltipStyle} formatter={(value) => [formatCurrency(Number(value)), t("analytics.revenuePerMember")]} />
                  <Line type="monotone" dataKey="rpm" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: "#22c55e" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Section 5: Peak Hours Heatmap with Tooltip */}
      <ChartCard title={t("analytics.peakHours")}>
        {/* Hover tooltip */}
        {hoveredCell && (
          <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-vytal-green/20 bg-vytal-green/5 px-3 py-1.5">
            <Zap className="h-3 w-3 text-vytal-green" />
            <span className="text-xs text-vytal-text">
              <span className="font-semibold">{hoveredCell.day} {hoveredCell.hour}</span>: {hoveredCell.value} check-ins
            </span>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr>
                <th className="w-12 px-1 py-1 text-left text-[10px] font-medium uppercase tracking-wider text-vytal-muted" />
                {HOURS.map((h) => (
                  <th key={h} className="px-0.5 py-1 text-center text-[10px] font-medium text-vytal-muted">{h.slice(0, 2)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day, di) => (
                <tr key={day}>
                  <td className="px-1 py-0.5 text-xs font-medium text-vytal-muted">{day}</td>
                  {PEAK_HEATMAP[di].map((value, ti) => (
                    <td key={ti} className="px-0.5 py-0.5">
                      <div
                        className="flex h-9 items-center justify-center rounded cursor-pointer transition-all hover:ring-1 hover:ring-vytal-green/40"
                        style={{ backgroundColor: heatCellColor(value, pMax) }}
                        onMouseEnter={() => setHoveredCell({ day, hour: HOURS[ti], value })}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        <span
                          className="font-mono text-[10px] font-semibold"
                          style={{ color: value === 0 ? "rgba(107,140,114,0.2)" : value / pMax > 0.4 ? "var(--color-vytal-bg)" : "#6b8c72" }}
                        >
                          {value > 0 ? value : ""}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-[10px] font-medium uppercase tracking-wider text-vytal-muted">{t("analytics.less")}</span>
          <div className="flex gap-1">
            {[0, 0.08, 0.18, 0.3, 0.45, 0.65, 0.85].map((opacity) => (
              <div key={opacity} className="h-3 w-6 rounded" style={{ backgroundColor: opacity === 0 ? "rgba(22,32,24,0.9)" : `rgba(34,197,94,${opacity})` }} />
            ))}
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-vytal-muted">{t("analytics.more")}</span>
        </div>
      </ChartCard>
    </div>
  );
}
