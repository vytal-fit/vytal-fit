"use client";

import { DollarSign, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatCurrency } from "@/stores/data-store";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const revenueSparkline = [
  { month: "Jan", revenue: 14200 },
  { month: "Feb", revenue: 15800 },
  { month: "Mar", revenue: 16100 },
  { month: "Apr", revenue: 17300 },
  { month: "May", revenue: 17500 },
  { month: "Jun", revenue: 18450 },
];

const paymentMethodData = [
  { name: "Stripe", value: 45, color: "#635bff" },
  { name: "MBWay", value: 25, color: "#ff4757" },
  { name: "SEPA", value: 15, color: "#00d4ff" },
  { name: "Cash", value: 10, color: "#22c55e" },
  { name: "Other", value: 5, color: "#6b8c72" },
];

const pendingPayments = [
  { id: 1, member: "Carlos Mendes", amount: 75, daysOverdue: 15, status: "overdue" as const },
  { id: 2, member: "Ana Ferreira", amount: 60, daysOverdue: 7, status: "overdue" as const },
  { id: 3, member: "Pedro Santos", amount: 50, daysOverdue: 3, status: "pending" as const },
  { id: 4, member: "Marta Oliveira", amount: 75, daysOverdue: 1, status: "pending" as const },
  { id: 5, member: "Joao Silva", amount: 100, daysOverdue: 22, status: "overdue" as const },
];

const recentTransactions = [
  { id: 1, date: "2026-06-02", member: "Rita Costa", amount: 75, method: "Stripe", status: "paid" as const },
  { id: 2, date: "2026-06-02", member: "Bruno Almeida", amount: 60, method: "MBWay", status: "paid" as const },
  { id: 3, date: "2026-06-01", member: "Sofia Martins", amount: 50, method: "SEPA", status: "paid" as const },
  { id: 4, date: "2026-06-01", member: "Carlos Mendes", amount: 75, method: "Stripe", status: "failed" as const },
  { id: 5, date: "2026-05-31", member: "Ana Ferreira", amount: 60, method: "MBWay", status: "pending" as const },
  { id: 6, date: "2026-05-31", member: "Tiago Nunes", amount: 390, method: "SEPA", status: "paid" as const },
  { id: 7, date: "2026-05-30", member: "Ines Rocha", amount: 75, method: "Cash", status: "paid" as const },
  { id: 8, date: "2026-05-30", member: "Miguel Dias", amount: 40, method: "Stripe", status: "paid" as const },
];

const overdueTotal = pendingPayments
  .filter((p) => p.status === "overdue")
  .reduce((s, p) => s + p.amount, 0);

const dso = 12;

function StatusBadge({ status }: { status: "paid" | "pending" | "failed" | "overdue" }) {
  const { t } = useI18n();
  const config = {
    paid: { label: t("financials.paid"), className: "bg-vytal-green/10 text-vytal-green" },
    pending: { label: t("financials.pending"), className: "bg-vytal-amber/10 text-vytal-amber" },
    failed: { label: t("financials.failed"), className: "bg-vytal-red/10 text-vytal-red" },
    overdue: { label: t("financials.overdue"), className: "bg-vytal-red/10 text-vytal-red" },
  };
  const c = config[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${c.className}`}
    >
      {c.label}
    </span>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    Stripe: "text-[#635bff]",
    MBWay: "text-vytal-red",
    SEPA: "text-vytal-blue",
    Cash: "text-vytal-green",
  };
  return (
    <span className={`inline-flex items-center rounded bg-vytal-bg3 px-2 py-0.5 text-xs font-medium ${colors[method] ?? "text-vytal-muted"}`}>
      {method}
    </span>
  );
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-vytal-border bg-vytal-card px-3 py-2 shadow-lg">
        <p className="text-xs text-vytal-muted">{label}</p>
        <p className="font-mono text-sm font-bold text-vytal-green">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

export default function FinancialsPage() {
  const { t } = useI18n();
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-vytal-text">{t("financials.title")}</h1>
        <p className="mt-1 text-sm text-vytal-muted">
          {t("financials.subtitle")}
        </p>
      </div>

      {/* Revenue Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Monthly Revenue with Sparkline */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)] sm:col-span-2 lg:col-span-1">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("financials.monthlyRevenue")}
              </span>
              <span className="text-2xl font-bold text-vytal-text">
                {formatCurrency(18450)}
              </span>
              <span className="text-xs text-vytal-green">{t("financials.vsLastMonth")}</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-green/10">
              <DollarSign className="h-5 w-5 text-vytal-green" />
            </div>
          </div>
          {/* Mini sparkline */}
          <div className="mt-3 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueSparkline}>
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("financials.ytdRevenue")}
              </span>
              <span className="text-2xl font-bold text-vytal-text">
                {formatCurrency(98200)}
              </span>
              <span className="text-xs text-vytal-green">{t("financials.onTrack")}</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-blue/10">
              <TrendingUp className="h-5 w-5 text-vytal-blue" />
            </div>
          </div>
        </div>

        {/* Overdue Amount */}
        <div className="rounded-xl border border-vytal-red/20 bg-vytal-card p-5 transition-colors hover:border-vytal-red/30">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("financials.overdueAmount")}
              </span>
              <span className="text-2xl font-bold text-vytal-red">
                {formatCurrency(overdueTotal)}
              </span>
              <span className="text-xs text-vytal-red">
                {t("financials.overduePayments").replace("{count}", String(pendingPayments.filter((p) => p.status === "overdue").length))}
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-red/10">
              <AlertTriangle className="h-5 w-5 text-vytal-red" />
            </div>
          </div>
        </div>

        {/* DSO */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("financials.daysOutstanding")}
              </span>
              <span className="text-2xl font-bold text-vytal-text">
                {dso} {t("financials.days")}
              </span>
              <span className="text-xs text-vytal-green">{t("financials.good")}</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-amber/10">
              <Clock className="h-5 w-5 text-vytal-amber" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue Trend */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">
            {t("financials.revenueTrend")}
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueSparkline}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#6b8c72" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#6b8c72" }}
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: "#22c55e", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">
            {t("financials.paymentMethods")}
          </h3>
          <div className="flex items-center gap-6">
            <div className="h-40 w-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-1 flex-col gap-2.5">
              {paymentMethodData.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-vytal-text">{entry.name}</span>
                  </div>
                  <span className="font-mono text-sm font-semibold text-vytal-muted">
                    {entry.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pending Payments */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-vytal-text">
          {t("financials.pendingPayments")}
        </h2>
        <div className="overflow-hidden rounded-xl border border-vytal-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-vytal-border bg-vytal-bg2">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("financials.member")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("financials.amount")}
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted sm:table-cell">
                  {t("financials.daysOverdue")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("financials.status")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vytal-border">
              {pendingPayments.map((p) => (
                <tr
                  key={p.id}
                  className="bg-vytal-card transition-colors hover:bg-vytal-bg3"
                >
                  <td className="px-4 py-3 text-sm font-medium text-vytal-text">
                    {p.member}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-vytal-text">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span
                      className={`font-mono text-sm ${p.daysOverdue > 7 ? "text-vytal-red" : "text-vytal-amber"}`}
                    >
                      {p.daysOverdue}d
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-vytal-text">
          {t("financials.recentTransactions")}
        </h2>
        <div className="overflow-hidden rounded-xl border border-vytal-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-vytal-border bg-vytal-bg2">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("financials.date")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("financials.member")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("financials.amount")}
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted sm:table-cell">
                  {t("financials.method")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("financials.status")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vytal-border">
              {recentTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="bg-vytal-card transition-colors hover:bg-vytal-bg3"
                >
                  <td className="px-4 py-3 font-mono text-sm text-vytal-muted">
                    {tx.date}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-vytal-text">
                    {tx.member}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-vytal-text">
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <MethodBadge method={tx.method} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={tx.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
