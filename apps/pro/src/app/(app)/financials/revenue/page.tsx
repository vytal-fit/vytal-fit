"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { useOrgFormat } from "@/lib/org-format";
import { TrendingUp, TrendingDown, DollarSign, Users, Clock, Repeat, Sparkles, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
} from "recharts";

// --- Mock Data ---

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const METHOD_META: Record<string, { label: string; color: string }> = {
  mbway: { label: "MB Way", color: "#ff4757" },
  multibanco: { label: "Multibanco", color: "#00d4ff" },
  sepa: { label: "SEPA", color: "#635bff" },
  card: { label: "Cartão", color: "#22c55e" },
  cash: { label: "Numerário", color: "#eab308" },
  transfer: { label: "Transferência", color: "#6b8c72" },
};
const PLAN_BAR_COLOR = "#22c55e";

// --- Forecast Data ---
const forecastData = {
  optimistic: [
    { month: "Jun", value: 16100 },
    { month: "Jul", value: 17200 },
    { month: "Aug", value: 18100 },
    { month: "Sep", value: 19200 },
  ],
  base: [
    { month: "Jun", value: 16100 },
    { month: "Jul", value: 16600 },
    { month: "Aug", value: 17100 },
    { month: "Sep", value: 17600 },
  ],
  conservative: [
    { month: "Jun", value: 16100 },
    { month: "Jul", value: 16200 },
    { month: "Aug", value: 16300 },
    { month: "Sep", value: 16400 },
  ],
};

const forecastChartData = [
  { month: "Jan", actual: 14200 },
  { month: "Feb", actual: 14700 },
  { month: "Mar", actual: 15300 },
  { month: "Apr", actual: 15650 },
  { month: "May", actual: 15750 },
  { month: "Jun", actual: 16100, optimistic: 16100, base: 16100, conservative: 16100 },
  { month: "Jul", optimistic: 17200, base: 16600, conservative: 16200 },
  { month: "Aug", optimistic: 18100, base: 17100, conservative: 16300 },
  { month: "Sep", optimistic: 19200, base: 17600, conservative: 16400 },
];

function MetricCard({
  label,
  value,
  trend,
  trendUp,
  icon,
}: {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{label}</p>
          <p className="mt-1 text-2xl font-bold text-vytal-text">{value}</p>
          {trend && (
            <div className="mt-1 flex items-center gap-1">
              {trendUp ? (
                <TrendingUp className="h-3 w-3 text-vytal-green" />
              ) : (
                <TrendingDown className="h-3 w-3 text-vytal-red" />
              )}
              <span className={`text-xs font-semibold ${trendUp ? "text-vytal-green" : "text-vytal-red"}`}>
                {trend}
              </span>
            </div>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-green/10">
          {icon}
        </div>
      </div>
    </div>
  );
}

function MrrTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  const { money: formatCurrency } = useOrgFormat();
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-vytal-border bg-vytal-card px-4 py-3 shadow-lg">
        <p className="mb-1 text-xs font-semibold text-vytal-text">{label}</p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-vytal-muted">{entry.name}:</span>
            <span className="font-mono text-xs font-semibold text-vytal-text">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function RevenuePage() {
  const { t } = useI18n();
  const { money: formatCurrency } = useOrgFormat();
  const [scenario, setScenario] = useState<"optimistic" | "base" | "conservative">("base");
  const [whatIfMembers, setWhatIfMembers] = useState(10);
  const [whatIfPrice, setWhatIfPrice] = useState(75);

  const statsQuery = trpc.payments.stats.useQuery();
  const stats = statsQuery.data;
  const monthsData = stats?.months ?? [];

  // MRR trend: real paid revenue per month (membership = recurring).
  const mrrTrendData = monthsData.map((m) => ({
    month: MONTH_LABELS[Number(m.key.split("-")[1]) - 1] ?? m.key,
    recurring: m.revenue,
    oneTime: 0,
  }));
  const revenueByMethod = (stats?.byMethod ?? []).map((b) => ({
    name: METHOD_META[b.method]?.label ?? b.method,
    value: Math.round(b.total),
    color: METHOD_META[b.method]?.color ?? "#6b8c72",
  }));
  const revenueByPlan = (stats?.byPlan ?? []).map((b) => ({
    name: b.name,
    value: Math.round(b.total),
    color: PLAN_BAR_COLOR,
  }));
  const monthlyBreakdown = monthsData.map((m, i) => {
    const prev = i > 0 ? monthsData[i - 1].revenue : 0;
    const growth = prev ? ((m.revenue - prev) / prev) * 100 : 0;
    return {
      month: `${MONTH_LABELS[Number(m.key.split("-")[1]) - 1] ?? m.key} ${m.key.split("-")[0]}`,
      memberships: m.revenue,
      services: 0,
      products: 0,
      total: m.revenue,
      growth: Number(growth.toFixed(1)),
    };
  });

  const currentMRR = monthsData.length ? monthsData[monthsData.length - 1].revenue : 0;
  const whatIfResult = currentMRR + whatIfMembers * whatIfPrice;
  const scenarioData = forecastData[scenario];
  const scenarioNextMonth = scenarioData[1].value;

  const totalBreakdown = monthlyBreakdown.reduce(
    (acc, row) => ({
      memberships: acc.memberships + row.memberships,
      services: acc.services + row.services,
      products: acc.products + row.products,
      total: acc.total + row.total,
    }),
    { memberships: 0, services: 0, products: 0, total: 0 }
  );

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: t("nav.financials"), href: "/financials" }, { label: t("revenue.title") }]} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-vytal-text">{t("revenue.title")}</h1>
        <p className="mt-1 text-sm text-vytal-muted">{t("revenue.subtitle")}</p>
      </div>

      {/* Row 1: Key Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label={t("revenue.mrr")}
          value={formatCurrency(15200)}
          trend="+4.2%"
          trendUp={true}
          icon={<Repeat className="h-5 w-5 text-vytal-green" />}
        />
        <MetricCard
          label={t("revenue.arr")}
          value={formatCurrency(182400)}
          icon={<DollarSign className="h-5 w-5 text-vytal-green" />}
        />
        <MetricCard
          label={t("revenue.arpm")}
          value={formatCurrency(41.4)}
          icon={<Users className="h-5 w-5 text-vytal-green" />}
        />
        <MetricCard
          label={t("revenue.ltv")}
          value={formatCurrency(496.8)}
          icon={<Clock className="h-5 w-5 text-vytal-green" />}
        />
      </div>

      {/* Row 2: MRR Trend (full width) */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
        <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("revenue.mrrTrend")}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mrrTrendData}>
              <defs>
                <linearGradient id="recurring-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="onetime-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,140,114,0.1)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b8c72" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b8c72" }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<MrrTooltip />} />
              <Legend verticalAlign="top" height={36} />
              <Area type="monotone" dataKey="recurring" name={t("revenue.recurring")} stackId="1" stroke="#22c55e" fill="url(#recurring-grad)" strokeWidth={2} />
              <Area type="monotone" dataKey="oneTime" name={t("revenue.oneTime")} stackId="1" stroke="#00d4ff" fill="url(#onetime-grad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Two charts side by side */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue by Plan */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("revenue.byPlan")}</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByPlan} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,140,114,0.1)" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b8c72" }} tickFormatter={(v: number) => formatCurrency(v)} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#dceee0" }} width={90} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ backgroundColor: "rgba(22,32,24,0.95)", border: "1px solid rgba(34,197,94,0.12)", borderRadius: "8px" }} labelStyle={{ color: "#dceee0" }} itemStyle={{ color: "#22c55e" }} />
                <Bar dataKey="value" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Payment Method */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("revenue.byPaymentMethod")}</h3>
          <div className="flex items-center gap-6">
            <div className="h-48 w-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByMethod}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {revenueByMethod.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-1 flex-col gap-3">
              {revenueByMethod.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm text-vytal-text">{entry.name}</span>
                  </div>
                  <span className="font-mono text-sm font-semibold text-vytal-muted">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Monthly Breakdown Table */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-vytal-text">{t("revenue.monthlyBreakdown")}</h2>
        <div className="overflow-x-auto rounded-xl border border-vytal-border">
          <table className="zebra-table sticky-thead w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-vytal-border bg-vytal-bg2">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("revenue.month")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("revenue.memberships")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("revenue.services")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("revenue.products")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("revenue.totalCol")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("revenue.growth")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vytal-border">
              {monthlyBreakdown.map((row) => (
                <tr key={row.month} className="bg-vytal-card transition-colors hover:bg-vytal-bg3">
                  <td className="px-4 py-3 text-sm font-medium text-vytal-text">{row.month}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-vytal-muted">{formatCurrency(row.memberships)}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-vytal-muted">{formatCurrency(row.services)}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-vytal-muted">{formatCurrency(row.products)}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-vytal-text">{formatCurrency(row.total)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-flex items-center gap-1 font-mono text-sm font-semibold ${row.growth >= 0 ? "text-vytal-green" : "text-vytal-red"}`}>
                      {row.growth >= 0 ? "+" : ""}{row.growth.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
              {/* Total row */}
              <tr className="border-t-2 border-vytal-green/20 bg-vytal-green/5">
                <td className="px-4 py-3 text-sm font-bold text-vytal-text">{t("revenue.totalRow")}</td>
                <td className="px-4 py-3 text-right font-mono text-sm font-bold text-vytal-text">{formatCurrency(totalBreakdown.memberships)}</td>
                <td className="px-4 py-3 text-right font-mono text-sm font-bold text-vytal-text">{formatCurrency(totalBreakdown.services)}</td>
                <td className="px-4 py-3 text-right font-mono text-sm font-bold text-vytal-text">{formatCurrency(totalBreakdown.products)}</td>
                <td className="px-4 py-3 text-right font-mono text-sm font-bold text-vytal-green">{formatCurrency(totalBreakdown.total)}</td>
                <td className="px-4 py-3" />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue Forecast Section */}
      <div className="rounded-xl border border-vytal-green/20 bg-gradient-to-r from-vytal-green/5 to-vytal-blue/5 p-6">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vytal-green/10">
            <Sparkles className="h-4 w-4 text-vytal-green" />
          </div>
          <h2 className="text-lg font-semibold text-vytal-text">{t("revenue.forecastTitle")}</h2>
        </div>

        {/* Scenario Toggle */}
        <div className="mb-6 flex gap-2">
          {(["optimistic", "base", "conservative"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScenario(s)}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-colors",
                scenario === s
                  ? "border-vytal-green/30 bg-vytal-green/10 text-vytal-green"
                  : "border-vytal-border bg-vytal-card text-vytal-text hover:bg-vytal-bg3"
              )}
            >
              {t(`revenue.scenario.${s}`)}
            </button>
          ))}
        </div>

        {/* Forecast Chart */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card/80 p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("revenue.forecastChart")}</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastChartData}>
                <CartesianGrid stroke="rgba(34,197,94,0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f1610", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "8px", fontSize: 12, color: "#dceee0" }}
                  formatter={(value, name) => [formatCurrency(Number(value)), name === "actual" ? t("revenue.actual") : t(`revenue.scenario.${String(name)}`)]}
                />
                <Line type="monotone" dataKey="actual" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: "#22c55e" }} name="actual" />
                {scenario === "optimistic" && (
                  <Line type="monotone" dataKey="optimistic" stroke="#00d4ff" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: "#00d4ff" }} name="optimistic" />
                )}
                {scenario === "base" && (
                  <Line type="monotone" dataKey="base" stroke="#ffb300" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: "#ffb300" }} name="base" />
                )}
                {scenario === "conservative" && (
                  <Line type="monotone" dataKey="conservative" stroke="#ff4757" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: "#ff4757" }} name="conservative" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Assumptions + What-if */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-5">
            <h4 className="mb-3 text-sm font-semibold text-vytal-text">{t("revenue.assumptions")}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-vytal-muted">{t("revenue.growthRate")}</span>
                <span className="font-mono font-semibold text-vytal-text">
                  {scenario === "optimistic" ? "5.2%" : scenario === "base" ? "3.1%" : "0.6%"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-vytal-muted">{t("revenue.churnRateLabel")}</span>
                <span className="font-mono font-semibold text-vytal-text">
                  {scenario === "optimistic" ? "2.0%" : scenario === "base" ? "3.2%" : "4.5%"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-vytal-muted">{t("revenue.avgTicket")}</span>
                <span className="font-mono font-semibold text-vytal-text">{formatCurrency(50.3)}</span>
              </div>
              <div className="flex justify-between border-t border-vytal-border pt-2">
                <span className="font-medium text-vytal-text">{t("revenue.nextMonthProjection")}</span>
                <span className="font-mono font-bold text-vytal-green">{formatCurrency(scenarioNextMonth)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-vytal-border bg-vytal-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-vytal-green" />
              <h4 className="text-sm font-semibold text-vytal-text">{t("revenue.whatIf")}</h4>
            </div>
            <p className="mb-4 text-xs text-vytal-muted">{t("revenue.whatIfDesc")}</p>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-vytal-muted">{t("revenue.newMembers")}</label>
                <input
                  type="number"
                  value={whatIfMembers}
                  onChange={(e) => setWhatIfMembers(Number(e.target.value))}
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-vytal-muted">{t("revenue.pricePerMember")}</label>
                <input
                  type="number"
                  value={whatIfPrice}
                  onChange={(e) => setWhatIfPrice(Number(e.target.value))}
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>
              <div className="rounded-lg bg-vytal-green/5 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-vytal-muted">{t("revenue.projectedRevenue")}</span>
                  <span className="text-lg font-bold text-vytal-green">{formatCurrency(whatIfResult)}</span>
                </div>
                <p className="mt-1 text-[10px] text-vytal-muted">
                  +{formatCurrency(whatIfMembers * whatIfPrice)} {t("revenue.fromNewMembers")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
