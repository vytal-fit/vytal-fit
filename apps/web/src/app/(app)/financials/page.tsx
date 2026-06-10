"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, TrendingUp, AlertTriangle, Clock, ArrowUpRight, ArrowDownRight, Target, Send, ChevronDown, ChevronUp, Download, X, Smartphone, CreditCard, Building2, Banknote, ArrowLeftRight, CheckCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { formatCurrency, useDataStore } from "@/stores/data-store";
import { cn } from "@/lib/utils";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
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
  { id: 1, member: "Carlos Mendes", amount: 75, daysOverdue: 15, status: "overdue" as const, email: "carlos@email.com", plan: "Unlimited" },
  { id: 2, member: "Ana Ferreira", amount: 60, daysOverdue: 7, status: "overdue" as const, email: "ana@email.com", plan: "3x/week" },
  { id: 3, member: "Pedro Santos", amount: 50, daysOverdue: 3, status: "pending" as const, email: "pedro@email.com", plan: "3x/week" },
  { id: 4, member: "Marta Oliveira", amount: 75, daysOverdue: 1, status: "pending" as const, email: "marta@email.com", plan: "Unlimited" },
  { id: 5, member: "Joao Silva", amount: 100, daysOverdue: 22, status: "overdue" as const, email: "joao@email.com", plan: "Unlimited" },
];

const recentTransactions = [
  { id: 1, date: "2026-06-02", member: "Rita Costa", amount: 75, method: "Stripe", status: "paid" as const, plan: "Unlimited", ref: "INV-2026-0142" },
  { id: 2, date: "2026-06-02", member: "Bruno Almeida", amount: 60, method: "MBWay", status: "paid" as const, plan: "3x/week", ref: "INV-2026-0141" },
  { id: 3, date: "2026-06-01", member: "Sofia Martins", amount: 50, method: "SEPA", status: "paid" as const, plan: "3x/week", ref: "INV-2026-0140" },
  { id: 4, date: "2026-06-01", member: "Carlos Mendes", amount: 75, method: "Stripe", status: "failed" as const, plan: "Unlimited", ref: "INV-2026-0139" },
  { id: 5, date: "2026-05-31", member: "Ana Ferreira", amount: 60, method: "MBWay", status: "pending" as const, plan: "3x/week", ref: "INV-2026-0138" },
  { id: 6, date: "2026-05-31", member: "Tiago Nunes", amount: 390, method: "SEPA", status: "paid" as const, plan: "Semester", ref: "INV-2026-0137" },
  { id: 7, date: "2026-05-30", member: "Ines Rocha", amount: 75, method: "Cash", status: "paid" as const, plan: "Unlimited", ref: "INV-2026-0136" },
  { id: 8, date: "2026-05-30", member: "Miguel Dias", amount: 40, method: "Stripe", status: "paid" as const, plan: "Day Pass", ref: "INV-2026-0135" },
];

const currentMonthRevenue = 18450;
const lastMonthRevenue = 17500;
const revenueChange = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100);
const revenueTarget = 20000;
const revenueProgress = (currentMonthRevenue / revenueTarget) * 100;

const overdueTotal = pendingPayments.filter((p) => p.status === "overdue").reduce((s, p) => s + p.amount, 0);
const dso = 12;

// ---------------------------------------------------------------------------
// Payment method icons map
// ---------------------------------------------------------------------------

const METHOD_ICONS: Record<string, React.ReactNode> = {
  mbway: <Smartphone className="h-4 w-4" />,
  multibanco: <Building2 className="h-4 w-4" />,
  sepa: <ArrowLeftRight className="h-4 w-4" />,
  card: <CreditCard className="h-4 w-4" />,
  cash: <Banknote className="h-4 w-4" />,
  transfer: <Building2 className="h-4 w-4" />,
};

const METHOD_LABELS: Record<string, string> = {
  mbway: "MB Way",
  multibanco: "Multibanco",
  sepa: "SEPA DD",
  card: "Cartão",
  cash: "Numerário",
  transfer: "Transferência",
};

// ---------------------------------------------------------------------------
// Register Payment Dialog
// ---------------------------------------------------------------------------

function RegisterPaymentDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const paymentMethods = useDataStore((s) => s.orgSettings.paymentMethods);

  const enabledMethods = Object.entries(paymentMethods ?? {}).filter(
    ([, cfg]) => (cfg as { enabled?: boolean })?.enabled
  );

  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState(
    `INV-2026-${String(recentTransactions.length + 143).padStart(4, "0")}`
  );

  function handleSubmit() {
    if (!selectedMethod || !amount) return;
    const label = METHOD_LABELS[selectedMethod] ?? selectedMethod;
    toast(
      t("payments.registered")
        .replace("{amount}", formatCurrency(parseFloat(amount) || 0))
        .replace("{method}", label),
      "success"
    );
    onClose();
    setSelectedMethod("");
    setAmount("");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-vytal-border bg-vytal-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-vytal-border px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vytal-green/10">
              <DollarSign className="h-4 w-4 text-vytal-green" />
            </div>
            <h2 className="text-sm font-semibold text-vytal-text">
              {t("payments.registerPayment")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {/* Payment method selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-vytal-muted">
              {t("payments.selectMethod")}
            </label>

            {enabledMethods.length === 0 ? (
              <p className="rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-xs text-vytal-muted">
                {t("payments.noMethodsEnabled")}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {enabledMethods.map(([key]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedMethod(key)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-sm font-medium transition-all",
                      selectedMethod === key
                        ? "border-vytal-green/40 bg-vytal-green/10 text-vytal-green"
                        : "border-vytal-border bg-vytal-bg2 text-vytal-text hover:border-vytal-border/80 hover:bg-vytal-bg3"
                    )}
                  >
                    <span
                      className={cn(
                        selectedMethod === key ? "text-vytal-green" : "text-vytal-muted"
                      )}
                    >
                      {METHOD_ICONS[key]}
                    </span>
                    {METHOD_LABELS[key] ?? key}
                    {selectedMethod === key && (
                      <CheckCircle className="ml-auto h-3.5 w-3.5 text-vytal-green" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-vytal-muted">
              {t("payments.amount")}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-vytal-muted">€</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg pl-7 pr-3 py-2.5 text-sm font-mono text-vytal-text placeholder:text-vytal-muted/50 focus:border-vytal-green/50 focus:outline-none focus:ring-1 focus:ring-vytal-green/30"
              />
            </div>
          </div>

          {/* Reference */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-vytal-muted">
              {t("payments.reference")}
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={t("payments.referencePlaceholder")}
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg px-3 py-2.5 text-sm font-mono text-vytal-text placeholder:text-vytal-muted/50 focus:border-vytal-green/50 focus:outline-none focus:ring-1 focus:ring-vytal-green/30"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-vytal-border px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
          >
            {t("action.cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedMethod || !amount}
            className="inline-flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-vytal-green/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <DollarSign className="h-3.5 w-3.5" />
            {t("payments.registerBtn")}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "paid" | "pending" | "failed" | "overdue" }) {
  const { t } = useI18n();
  const config = {
    paid: { label: t("financials.paid"), className: "bg-vytal-green/10 text-vytal-green" },
    pending: { label: t("financials.pending"), className: "bg-vytal-amber/10 text-vytal-amber" },
    failed: { label: t("financials.failed"), className: "bg-vytal-red/10 text-vytal-red" },
    overdue: { label: t("financials.overdue"), className: "bg-vytal-red/10 text-vytal-red" },
  };
  const c = config[status];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${c.className}`}>{c.label}</span>;
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = { Stripe: "text-[#635bff]", MBWay: "text-vytal-red", SEPA: "text-vytal-blue", Cash: "text-vytal-green" };
  return <span className={`inline-flex items-center rounded bg-vytal-bg3 px-2 py-0.5 text-xs font-medium ${colors[method] ?? "text-vytal-muted"}`}>{method}</span>;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-vytal-border bg-vytal-card px-3 py-2 shadow-lg">
        <p className="text-xs text-vytal-muted">{label}</p>
        <p className="font-mono text-sm font-bold text-vytal-green">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

export default function FinancialsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [expandedTxId, setExpandedTxId] = useState<number | null>(null);
  const [showRegisterPayment, setShowRegisterPayment] = useState(false);

  const handleNewInvoice = useCallback(() => {
    const nextRef = `INV-2026-${String(recentTransactions.length + 143).padStart(4, "0")}`;
    const headers = ["Reference", "Date", "Member", "Amount", "Method", "Status"];
    const rows = recentTransactions.map((tx) => [tx.ref, tx.date, tx.member, tx.amount.toString(), tx.method, tx.status]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${nextRef}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast(t("financials.invoiceCreated").replace("{ref}", nextRef), "success");
  }, [toast, t]);

  const handleExportCsv = useCallback(() => {
    const headers = ["Reference", "Date", "Member", "Amount (EUR)", "Method", "Plan", "Status"];
    const rows = recentTransactions.map((tx) => [tx.ref, tx.date, tx.member, tx.amount.toString(), tx.method, tx.plan, tx.status]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast(t("financials.exportedCsv"), "success");
  }, [toast, t]);

  return (
    <>
    <RegisterPaymentDialog
      open={showRegisterPayment}
      onClose={() => setShowRegisterPayment(false)}
    />
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-vytal-text">{t("financials.title")}</h1>
        <p className="mt-1 text-sm text-vytal-muted">{t("financials.subtitle")}</p>
      </div>

      {/* Quick Actions Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setShowRegisterPayment(true)} className="inline-flex items-center gap-1.5 rounded-full border border-vytal-green/20 bg-vytal-green/5 px-3.5 py-1.5 text-xs font-semibold text-vytal-green transition-colors hover:bg-vytal-green/10">
          <DollarSign className="h-3.5 w-3.5" />
          {t("payments.registerPayment")}
        </button>
        <button onClick={handleNewInvoice} className="inline-flex items-center gap-1.5 rounded-full border border-vytal-border bg-vytal-card px-3.5 py-1.5 text-xs font-semibold text-vytal-text transition-colors hover:bg-vytal-bg3">
          <DollarSign className="h-3.5 w-3.5" />
          {t("quickAction.newInvoice")}
        </button>
        <button onClick={() => router.push("/financials/sepa")} className="inline-flex items-center gap-1.5 rounded-full border border-vytal-border bg-vytal-card px-3.5 py-1.5 text-xs font-semibold text-vytal-text transition-colors hover:bg-vytal-bg3">
          <Send className="h-3.5 w-3.5" />
          {t("quickAction.sepa")}
        </button>
        <button onClick={() => router.push("/financials/dunning")} className="inline-flex items-center gap-1.5 rounded-full border border-vytal-border bg-vytal-card px-3.5 py-1.5 text-xs font-semibold text-vytal-text transition-colors hover:bg-vytal-bg3">
          <AlertTriangle className="h-3.5 w-3.5" />
          {t("quickAction.dunning")}
        </button>
        <button onClick={handleExportCsv} className="inline-flex items-center gap-1.5 rounded-full border border-vytal-border bg-vytal-card px-3.5 py-1.5 text-xs font-semibold text-vytal-text transition-colors hover:bg-vytal-bg3">
          <Download className="h-3.5 w-3.5" />
          {t("quickAction.exportCsv")}
        </button>
      </div>

      {/* Top Stats - 3 Column Premium Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Revenue This Month vs Last Month */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 transition-colors hover:border-[rgba(61,255,110,0.22)]">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("financials.monthlyRevenue")}</span>
              <span className="text-3xl font-bold text-vytal-text">{formatCurrency(currentMonthRevenue)}</span>
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${revenueChange >= 0 ? "bg-vytal-green/10 text-vytal-green" : "bg-vytal-red/10 text-vytal-red"}`}>
                  {revenueChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {revenueChange >= 0 ? "+" : ""}{revenueChange.toFixed(1)}%
                </div>
                <span className="text-xs text-vytal-muted">{t("financials.vsLastMonthAmount").replace("{amount}", formatCurrency(lastMonthRevenue))}</span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-vytal-green/10">
              <DollarSign className="h-6 w-6 text-vytal-green" />
            </div>
          </div>
          {/* Mini sparkline */}
          <div className="mt-4 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueSparkline}>
                <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Target Progress */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 transition-colors hover:border-[rgba(61,255,110,0.22)]">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("financials.monthlyTarget")}</span>
              <span className="text-3xl font-bold text-vytal-text">{revenueProgress.toFixed(0)}%</span>
              <span className="text-xs text-vytal-muted">{formatCurrency(currentMonthRevenue)} {t("financials.ofTarget").replace("{target}", formatCurrency(revenueTarget))}</span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-vytal-blue/10">
              <Target className="h-6 w-6 text-vytal-blue" />
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-3 w-full overflow-hidden rounded-full bg-vytal-bg3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-vytal-green to-vytal-blue transition-all"
                style={{ width: `${Math.min(revenueProgress, 100)}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-vytal-muted">
              <span>{formatCurrency(0)}</span>
              <span>{formatCurrency(revenueTarget)}</span>
            </div>
          </div>
        </div>

        {/* Overdue + DSO Combined */}
        <div className="grid grid-rows-2 gap-4">
          <div className="rounded-xl border border-vytal-red/20 bg-vytal-card p-4 transition-colors hover:border-vytal-red/30">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("financials.overdueAmount")}</span>
                <p className="mt-0.5 text-xl font-bold text-vytal-red">{formatCurrency(overdueTotal)}</p>
                <span className="text-[10px] text-vytal-red">{t("financials.overduePayments").replace("{count}", String(pendingPayments.filter((p) => p.status === "overdue").length))}</span>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-red/10">
                <AlertTriangle className="h-5 w-5 text-vytal-red" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-4 transition-colors hover:border-[rgba(61,255,110,0.22)]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("financials.daysOutstanding")}</span>
                <p className="mt-0.5 text-xl font-bold text-vytal-text">{dso} {t("financials.days")}</p>
                <span className="text-[10px] text-vytal-green">{t("financials.good")}</span>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-amber/10">
                <Clock className="h-5 w-5 text-vytal-amber" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* YTD Revenue Card */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("financials.ytdRevenue")}</span>
            <p className="mt-1 text-2xl font-bold text-vytal-text">{formatCurrency(98200)}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-vytal-green/10 px-3 py-1 text-xs font-semibold text-vytal-green">
              <TrendingUp className="h-3 w-3" /> {t("financials.onTrack")}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue Trend */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("financials.revenueTrend")}</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueSparkline}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b8c72" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b8c72" }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("financials.paymentMethods")}</h3>
          <div className="flex items-center gap-6">
            <div className="h-40 w-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentMethodData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                    {paymentMethodData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-1 flex-col gap-2.5">
              {paymentMethodData.map((entry) => (
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

      {/* Pending Payments with Send Reminder */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-vytal-text">{t("financials.pendingPayments")}</h2>
        <div className="overflow-x-auto rounded-xl border border-vytal-border">
          <table className="zebra-table sticky-thead w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-vytal-border bg-vytal-bg2">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("financials.member")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("financials.amount")}</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted sm:table-cell">{t("financials.daysOverdue")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("financials.status")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("table.action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vytal-border">
              {pendingPayments.map((p) => (
                <tr key={p.id} className="bg-vytal-card transition-colors hover:bg-vytal-bg3">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-vytal-text">{p.member}</p>
                      <p className="text-[10px] text-vytal-muted">{p.plan}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm font-semibold text-vytal-text">{formatCurrency(p.amount)}</td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className={`font-mono text-sm font-semibold ${p.daysOverdue > 7 ? "text-vytal-red" : "text-vytal-amber"}`}>{p.daysOverdue}d</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toast(t("financials.reminderSent").replace("{name}", p.member), "success")}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs font-medium text-vytal-text transition-colors hover:bg-vytal-bg3 hover:text-vytal-green"
                    >
                      <Send className="h-3 w-3" /> {t("financials.remind")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions with Expandable Rows */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-vytal-text">{t("financials.recentTransactions")}</h2>
        <div className="overflow-x-auto rounded-xl border border-vytal-border">
          <table className="zebra-table sticky-thead w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-vytal-border bg-vytal-bg2">
                <th className="w-8 px-2 py-3" />
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("financials.date")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("financials.member")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("financials.amount")}</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted sm:table-cell">{t("financials.method")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("financials.status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vytal-border">
              {recentTransactions.map((tx) => (
                <>
                  <tr
                    key={tx.id}
                    className="cursor-pointer bg-vytal-card transition-colors hover:bg-vytal-bg3"
                    onClick={() => setExpandedTxId(expandedTxId === tx.id ? null : tx.id)}
                  >
                    <td className="px-2 py-3 text-center">
                      {expandedTxId === tx.id ? <ChevronUp className="mx-auto h-3.5 w-3.5 text-vytal-muted" /> : <ChevronDown className="mx-auto h-3.5 w-3.5 text-vytal-muted" />}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-vytal-muted">{tx.date}</td>
                    <td className="px-4 py-3 text-sm font-medium text-vytal-text">{tx.member}</td>
                    <td className="px-4 py-3 font-mono text-sm font-semibold text-vytal-text">{formatCurrency(tx.amount)}</td>
                    <td className="hidden px-4 py-3 sm:table-cell"><MethodBadge method={tx.method} /></td>
                    <td className="px-4 py-3"><StatusBadge status={tx.status} /></td>
                  </tr>
                  {expandedTxId === tx.id && (
                    <tr key={`${tx.id}-detail`} className="bg-vytal-bg2/50">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-vytal-muted">{t("table.reference")}</p>
                            <p className="mt-0.5 font-mono text-sm text-vytal-text">{tx.ref}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-vytal-muted">{t("table.plan")}</p>
                            <p className="mt-0.5 text-sm text-vytal-text">{tx.plan}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-vytal-muted">{t("table.paymentMethod")}</p>
                            <p className="mt-0.5 text-sm text-vytal-text">{tx.method}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-vytal-muted">{t("financials.amount")}</p>
                            <p className="mt-0.5 font-mono text-sm font-semibold text-vytal-text">{formatCurrency(tx.amount)}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
}
