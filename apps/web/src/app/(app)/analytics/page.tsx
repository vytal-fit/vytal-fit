"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { formatCurrency, formatCurrencyCompact } from "@/stores/data-store";
import { Lightbulb, TrendingUp, TrendingDown, Users, Clock, Zap } from "lucide-react";
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

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const sparklineActiveMembers = [{ v: 318 }, { v: 325 }, { v: 330 }, { v: 338 }, { v: 345 }, { v: 348 }, { v: 355 }, { v: 358 }, { v: 360 }, { v: 363 }, { v: 365 }, { v: 367 }];
const sparklineRevenue = [{ v: 14200 }, { v: 14800 }, { v: 15100 }, { v: 15800 }, { v: 16200 }, { v: 16500 }, { v: 17000 }, { v: 17200 }, { v: 17500 }, { v: 17800 }, { v: 18100 }, { v: 18450 }];
const sparklineChurn = [{ v: 4.1 }, { v: 3.9 }, { v: 3.8 }, { v: 3.7 }, { v: 3.6 }, { v: 3.5 }, { v: 3.5 }, { v: 3.4 }, { v: 3.3 }, { v: 3.3 }, { v: 3.2 }, { v: 3.2 }];
const sparklineAttendance = [{ v: 12.1 }, { v: 12.4 }, { v: 12.6 }, { v: 13.0 }, { v: 13.2 }, { v: 13.5 }, { v: 13.7 }, { v: 13.9 }, { v: 14.0 }, { v: 14.1 }, { v: 14.2 }, { v: 14.2 }];

const memberGrowthData = [
  { month: "Jan", members: 318 }, { month: "Feb", members: 325 }, { month: "Mar", members: 338 },
  { month: "Apr", members: 345 }, { month: "May", members: 358 }, { month: "Jun", members: 367 },
];

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

const genderData = [
  { name: "Male", value: 58, color: "#00d4ff" },
  { name: "Female", value: 42, color: "#c084fc" },
];

const ageData = [
  { age: "18-24", pct: 15 }, { age: "25-34", pct: 35 }, { age: "35-44", pct: 28 },
  { age: "45-54", pct: 15 }, { age: "55+", pct: 7 },
];

const planData = [
  { name: "Livre", value: 45, color: "#22c55e" },
  { name: "13 Treinos", value: 25, color: "#00d4ff" },
  { name: "9 Treinos", value: 15, color: "#ffb300" },
  { name: "Semestral", value: 10, color: "#c084fc" },
  { name: "Other", value: 5, color: "#6b8c72" },
];

const funnelData = [
  { label: "Leads", count: 28, pct: 100, color: "#ffb300" },
  { label: "Contacted", count: 24, pct: 85, color: "#ff8c42" },
  { label: "Trial", count: 17, pct: 60, color: "#22c55e" },
  { label: "Subscribed", count: 11, pct: 40, color: "#00d4ff" },
  { label: "Active 3mo+", count: 10, pct: 35, color: "#22c55e" },
];

// Conversion percentages between funnel steps
const funnelConversions = [
  Math.round((24 / 28) * 100),
  Math.round((17 / 24) * 100),
  Math.round((11 / 17) * 100),
  Math.round((10 / 11) * 100),
];

const revenueBreakdownData = [
  { month: "Jan", memberships: 12800, services: 900, products: 500 },
  { month: "Feb", memberships: 13500, services: 1000, products: 600 },
  { month: "Mar", memberships: 14000, services: 1100, products: 700 },
  { month: "Apr", memberships: 14600, services: 1200, products: 700 },
  { month: "May", memberships: 15200, services: 1300, products: 700 },
  { month: "Jun", memberships: 16200, services: 1400, products: 800 },
];

const revenuePerMemberData = [
  { month: "Jan", rpm: 45.7 }, { month: "Feb", rpm: 46.2 }, { month: "Mar", rpm: 47.1 },
  { month: "Apr", rpm: 48.0 }, { month: "May", rpm: 49.3 }, { month: "Jun", rpm: 50.3 },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 17 }, (_, i) => `${String(i + 6).padStart(2, "0")}:00`);
const PEAK_HEATMAP: number[][] = [
  [4, 16, 12, 8, 5, 3, 10, 4, 3, 5, 6, 18, 20, 17, 6, 2, 0],
  [3, 15, 11, 7, 4, 2, 9, 3, 2, 4, 5, 17, 19, 16, 5, 1, 0],
  [5, 17, 13, 9, 6, 4, 11, 5, 4, 6, 7, 19, 20, 18, 7, 3, 0],
  [6, 18, 14, 10, 7, 5, 12, 6, 5, 7, 8, 20, 22, 19, 8, 3, 0],
  [3, 14, 10, 6, 3, 2, 8, 3, 2, 3, 4, 14, 16, 12, 4, 1, 0],
  [0, 0, 8, 10, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 4, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

function peakMax(): number {
  let max = 0;
  for (const row of PEAK_HEATMAP) { for (const v of row) { if (v > max) max = v; } }
  return max;
}

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
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: "#0f1610", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
      <p style={{ color: "#6b8c72", marginBottom: 4 }}>{label}</p>
      {payload.map((entry) => <p key={entry.dataKey} style={{ color: entry.color }}>{entry.name}: {formatCurrency(entry.value)}</p>)}
    </div>
  );
}

// Key insights data
const keyInsights = [
  { icon: Clock, text: "Thursday 17:30 is your busiest time slot", color: "text-vytal-amber", bg: "bg-vytal-amber/10" },
  { icon: TrendingDown, text: "Churn rate dropped 0.4% this month", color: "text-vytal-green", bg: "bg-vytal-green/10" },
  { icon: Users, text: "14 new members joined this month", color: "text-vytal-blue", bg: "bg-vytal-blue/10" },
];

export default function AnalyticsPage() {
  const { t } = useI18n();
  const pMax = peakMax();
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: string; value: number } | null>(null);

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
          <h3 className="text-sm font-semibold text-vytal-text">Key Insights</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {keyInsights.map((insight, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-vytal-border bg-vytal-card/60 px-4 py-3">
              <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", insight.bg)}>
                <insight.icon className={cn("h-3.5 w-3.5", insight.color)} />
              </div>
              <p className="text-sm text-vytal-text">{insight.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 1: Key Metrics Sparklines */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SparklineCard label={t("dashboard.activeMembers")} value="367" trend="+ 3.2%" trendUp data={sparklineActiveMembers} color="#22c55e" vsLastMonth="355 (+12)" />
        <SparklineCard label={t("dashboard.monthlyRevenue")} value="18,450 EUR" trend="+ 5.8%" trendUp data={sparklineRevenue} color="#00d4ff" vsLastMonth="17,500 EUR (+950)" />
        <SparklineCard label={t("dashboard.churnRate")} value="3.2%" trend="- 0.4%" trendUp={false} data={sparklineChurn} color="#22c55e" vsLastMonth="3.6% (-0.4%)" />
        <SparklineCard label={t("analytics.avgAttendance")} value="14.2" trend="+ 2.1" trendUp data={sparklineAttendance} color="#c084fc" vsLastMonth="12.1 (+2.1)" />
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
      <ChartCard title="Member Growth">
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
                          style={{ color: value === 0 ? "rgba(107,140,114,0.2)" : value / pMax > 0.4 ? "#080c0a" : "#6b8c72" }}
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
