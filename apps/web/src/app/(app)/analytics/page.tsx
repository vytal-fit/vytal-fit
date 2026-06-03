"use client";

import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
} from "recharts";

// ---------------------------------------------------------------------------
// Shared tooltip style
// ---------------------------------------------------------------------------

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#0f1610",
    border: "1px solid rgba(34,197,94,0.2)",
    borderRadius: "8px",
    fontSize: 12,
    color: "#dceee0",
  },
  itemStyle: { color: "#dceee0" },
  labelStyle: { color: "#6b8c72", marginBottom: 4 },
};

// ---------------------------------------------------------------------------
// Chart Card
// ---------------------------------------------------------------------------

function ChartCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-vytal-border bg-vytal-card/80 p-6 backdrop-blur-sm",
        className
      )}
    >
      <h3 className="mb-4 text-sm font-semibold text-vytal-text">{title}</h3>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section 1: Key Metrics Sparkline Cards
// ---------------------------------------------------------------------------

const sparklineActiveMembers = [
  { v: 318 }, { v: 325 }, { v: 330 }, { v: 338 }, { v: 345 }, { v: 348 }, { v: 355 }, { v: 358 }, { v: 360 }, { v: 363 }, { v: 365 }, { v: 367 },
];
const sparklineRevenue = [
  { v: 14200 }, { v: 14800 }, { v: 15100 }, { v: 15800 }, { v: 16200 }, { v: 16500 }, { v: 17000 }, { v: 17200 }, { v: 17500 }, { v: 17800 }, { v: 18100 }, { v: 18450 },
];
const sparklineChurn = [
  { v: 4.1 }, { v: 3.9 }, { v: 3.8 }, { v: 3.7 }, { v: 3.6 }, { v: 3.5 }, { v: 3.5 }, { v: 3.4 }, { v: 3.3 }, { v: 3.3 }, { v: 3.2 }, { v: 3.2 },
];
const sparklineAttendance = [
  { v: 12.1 }, { v: 12.4 }, { v: 12.6 }, { v: 13.0 }, { v: 13.2 }, { v: 13.5 }, { v: 13.7 }, { v: 13.9 }, { v: 14.0 }, { v: 14.1 }, { v: 14.2 }, { v: 14.2 },
];

interface SparklineCardProps {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  data: { v: number }[];
  color: string;
}

function SparklineCard({ label, value, trend, trendUp, data, color }: SparklineCardProps) {
  return (
    <div className="rounded-xl border border-vytal-border bg-vytal-card/80 p-5 backdrop-blur-sm">
      <span className="text-[10px] font-medium uppercase tracking-wider text-vytal-muted">
        {label}
      </span>
      <div className="mt-1 flex items-end justify-between">
        <span className="text-2xl font-bold text-vytal-text">{value}</span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
            trendUp
              ? "bg-vytal-green/10 text-vytal-green"
              : "bg-vytal-red/10 text-vytal-red"
          )}
        >
          {trend}
        </span>
      </div>
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

// ---------------------------------------------------------------------------
// Section 2: Member Demographics
// ---------------------------------------------------------------------------

const genderData = [
  { name: "Male", value: 58, color: "#00d4ff" },
  { name: "Female", value: 42, color: "#c084fc" },
];

const ageData = [
  { age: "18-24", pct: 15 },
  { age: "25-34", pct: 35 },
  { age: "35-44", pct: 28 },
  { age: "45-54", pct: 15 },
  { age: "55+", pct: 7 },
];

const planData = [
  { name: "Livre", value: 45, color: "#22c55e" },
  { name: "13 Treinos", value: 25, color: "#00d4ff" },
  { name: "9 Treinos", value: 15, color: "#ffb300" },
  { name: "Semestral", value: 10, color: "#c084fc" },
  { name: "Other", value: 5, color: "#6b8c72" },
];

// ---------------------------------------------------------------------------
// Section 3: Retention Funnel
// ---------------------------------------------------------------------------

const funnelData = [
  { label: "Leads", count: 28, pct: 100, color: "#ffb300" },
  { label: "Contacted", count: 24, pct: 85, color: "#ff8c42" },
  { label: "Trial", count: 17, pct: 60, color: "#22c55e" },
  { label: "Subscribed", count: 11, pct: 40, color: "#00d4ff" },
  { label: "Active 3mo+", count: 10, pct: 35, color: "#22c55e" },
];

// ---------------------------------------------------------------------------
// Section 4: Revenue Breakdown
// ---------------------------------------------------------------------------

const revenueBreakdownData = [
  { month: "Jan", memberships: 12800, services: 900, products: 500 },
  { month: "Feb", memberships: 13500, services: 1000, products: 600 },
  { month: "Mar", memberships: 14000, services: 1100, products: 700 },
  { month: "Apr", memberships: 14600, services: 1200, products: 700 },
  { month: "May", memberships: 15200, services: 1300, products: 700 },
  { month: "Jun", memberships: 16200, services: 1400, products: 800 },
];

const revenuePerMemberData = [
  { month: "Jan", rpm: 45.7 },
  { month: "Feb", rpm: 46.2 },
  { month: "Mar", rpm: 47.1 },
  { month: "Apr", rpm: 48.0 },
  { month: "May", rpm: 49.3 },
  { month: "Jun", rpm: 50.3 },
];

// ---------------------------------------------------------------------------
// Section 5: Peak Hours Heatmap
// ---------------------------------------------------------------------------

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
  for (const row of PEAK_HEATMAP) {
    for (const v of row) {
      if (v > max) max = v;
    }
  }
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

// ---------------------------------------------------------------------------
// Custom tooltip for revenue breakdown
// ---------------------------------------------------------------------------

interface RevenueBreakdownEntry {
  value: number;
  dataKey: string;
  color: string;
  name: string;
}

interface RevenueBreakdownTooltipProps {
  active?: boolean;
  payload?: RevenueBreakdownEntry[];
  label?: string;
}

function RevenueBreakdownTooltip({ active, payload, label }: RevenueBreakdownTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        backgroundColor: "#0f1610",
        border: "1px solid rgba(34,197,94,0.2)",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 12,
      }}
    >
      <p style={{ color: "#6b8c72", marginBottom: 4 }}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name}: {new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(entry.value)}
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AnalyticsPage() {
  const { t } = useI18n();
  const pMax = peakMax();

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-vytal-text">{t("analytics.title")}</h1>
        <p className="mt-1 text-sm text-vytal-muted">
          {t("analytics.subtitle")}
        </p>
      </div>

      {/* Section 1: Key Metrics Sparklines */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SparklineCard
          label={t("dashboard.activeMembers")}
          value="367"
          trend="+ 3.2%"
          trendUp
          data={sparklineActiveMembers}
          color="#22c55e"
        />
        <SparklineCard
          label={t("dashboard.monthlyRevenue")}
          value="18,450 EUR"
          trend="+ 5.8%"
          trendUp
          data={sparklineRevenue}
          color="#00d4ff"
        />
        <SparklineCard
          label={t("dashboard.churnRate")}
          value="3.2%"
          trend="- 0.4%"
          trendUp={false}
          data={sparklineChurn}
          color="#22c55e"
        />
        <SparklineCard
          label={t("analytics.avgAttendance")}
          value="14.2"
          trend="+ 2.1"
          trendUp
          data={sparklineAttendance}
          color="#c084fc"
        />
      </div>

      {/* Section 2: Member Demographics */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-vytal-text">
          {t("analytics.demographics")}
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Gender Split */}
          <ChartCard title={t("analytics.genderSplit")}>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {genderData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => (
                      <span style={{ color: "#dceee0", fontSize: 12 }}>{value}</span>
                    )}
                  />
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
                  <Pie
                    data={planData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {planData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => (
                      <span style={{ color: "#dceee0", fontSize: 12 }}>{value}</span>
                    )}
                  />
                  <Tooltip {...tooltipStyle} formatter={(value) => [`${value}%`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Section 3: Retention Funnel */}
      <ChartCard title={t("analytics.retentionFunnel")}>
        <div className="flex flex-col gap-3">
          {funnelData.map((step, i) => (
            <div key={step.label} className="flex items-center gap-4">
              <span className="w-24 shrink-0 text-xs font-medium text-vytal-muted">
                {step.label}
              </span>
              <div className="flex-1">
                <div
                  className="flex h-9 items-center rounded-lg px-3 transition-all"
                  style={{
                    width: `${step.pct}%`,
                    backgroundColor: step.color,
                    opacity: 0.85,
                    minWidth: 60,
                  }}
                >
                  <span className="font-mono text-xs font-bold text-vytal-bg">
                    {step.count}
                  </span>
                </div>
              </div>
              <span className="w-10 shrink-0 text-right font-mono text-xs text-vytal-muted">
                {step.pct}%
              </span>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Section 4: Revenue Breakdown */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-vytal-text">
          {t("analytics.revenueBreakdown")}
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Stacked Bar */}
          <ChartCard title={t("analytics.revenueByCategory")}>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueBreakdownData}>
                  <CartesianGrid stroke="rgba(34,197,94,0.08)" strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill: "#6b8c72", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `\u20AC${Math.round(v / 1000)}K`}
                  />
                  <Tooltip content={<RevenueBreakdownTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => (
                      <span style={{ color: "#dceee0", fontSize: 12 }}>{value}</span>
                    )}
                  />
                  <Bar dataKey="memberships" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} name={t("analytics.memberships")} />
                  <Bar dataKey="services" stackId="a" fill="#00d4ff" name={t("analytics.services")} />
                  <Bar dataKey="products" stackId="a" fill="#c084fc" radius={[6, 6, 0, 0]} name={t("analytics.products")} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Revenue per Member */}
          <ChartCard title={t("analytics.revenuePerMember")}>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenuePerMemberData}>
                  <CartesianGrid stroke="rgba(34,197,94,0.08)" strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill: "#6b8c72", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[40, 55]}
                    tickFormatter={(v: number) => `\u20AC${v}`}
                  />
                  <Tooltip {...tooltipStyle} formatter={(value) => [`\u20AC${Number(value).toFixed(1)}`, t("analytics.revenuePerMember")]} />
                  <Line type="monotone" dataKey="rpm" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: "#22c55e" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Section 5: Peak Hours Heatmap */}
      <ChartCard title={t("analytics.peakHours")}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr>
                <th className="w-12 px-1 py-1 text-left text-[10px] font-medium uppercase tracking-wider text-vytal-muted" />
                {HOURS.map((h) => (
                  <th key={h} className="px-0.5 py-1 text-center text-[10px] font-medium text-vytal-muted">
                    {h.slice(0, 2)}
                  </th>
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
                        className="flex h-9 items-center justify-center rounded"
                        style={{ backgroundColor: heatCellColor(value, pMax) }}
                        title={`${day} ${HOURS[ti]}: ${value} check-ins`}
                      >
                        <span
                          className="font-mono text-[10px] font-semibold"
                          style={{
                            color:
                              value === 0
                                ? "rgba(107,140,114,0.2)"
                                : value / pMax > 0.4
                                  ? "#080c0a"
                                  : "#6b8c72",
                          }}
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
        {/* Legend */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-[10px] font-medium uppercase tracking-wider text-vytal-muted">Less</span>
          <div className="flex gap-1">
            {[0, 0.08, 0.18, 0.3, 0.45, 0.65, 0.85].map((opacity) => (
              <div
                key={opacity}
                className="h-3 w-6 rounded"
                style={{
                  backgroundColor: opacity === 0 ? "rgba(22,32,24,0.9)" : `rgba(34,197,94,${opacity})`,
                }}
              />
            ))}
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-vytal-muted">More</span>
        </div>
      </ChartCard>
    </div>
  );
}
