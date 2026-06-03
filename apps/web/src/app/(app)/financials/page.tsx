import { DollarSign, TrendingUp, AlertTriangle } from "lucide-react";

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

function StatusBadge({ status }: { status: "paid" | "pending" | "failed" | "overdue" }) {
  const config = {
    paid: { label: "Paid", className: "bg-vytal-green/10 text-vytal-green" },
    pending: { label: "Pending", className: "bg-vytal-amber/10 text-vytal-amber" },
    failed: { label: "Failed", className: "bg-vytal-red/10 text-vytal-red" },
    overdue: { label: "Overdue", className: "bg-vytal-red/10 text-vytal-red" },
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
  return (
    <span className="inline-flex items-center rounded bg-vytal-bg3 px-2 py-0.5 text-xs text-vytal-muted">
      {method}
    </span>
  );
}

export default function FinancialsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-vytal-text">Financials</h1>
        <p className="mt-1 text-sm text-vytal-muted">
          Revenue overview and payment management
        </p>
      </div>

      {/* Revenue Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Monthly Revenue
              </span>
              <span className="text-2xl font-bold text-vytal-text">
                18,450 EUR
              </span>
              <span className="text-xs text-vytal-green">+5.2% vs last month</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-green/10">
              <DollarSign className="h-5 w-5 text-vytal-green" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                YTD Revenue
              </span>
              <span className="text-2xl font-bold text-vytal-text">
                98,200 EUR
              </span>
              <span className="text-xs text-vytal-green">On track</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-blue/10">
              <TrendingUp className="h-5 w-5 text-vytal-blue" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Pending Payments
              </span>
              <span className="text-2xl font-bold text-vytal-text">
                {pendingPayments.length}
              </span>
              <span className="text-xs text-vytal-red">
                {pendingPayments.reduce((s, p) => s + p.amount, 0)} EUR outstanding
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-red/10">
              <AlertTriangle className="h-5 w-5 text-vytal-red" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Payments */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-vytal-text">
          Pending Payments
        </h2>
        <div className="overflow-hidden rounded-xl border border-vytal-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-vytal-border bg-vytal-bg2">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  Member
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  Amount
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted sm:table-cell">
                  Days Overdue
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  Status
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
                    {p.amount} EUR
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
          Recent Transactions
        </h2>
        <div className="overflow-hidden rounded-xl border border-vytal-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-vytal-border bg-vytal-bg2">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  Member
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  Amount
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted sm:table-cell">
                  Method
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vytal-border">
              {recentTransactions.map((t) => (
                <tr
                  key={t.id}
                  className="bg-vytal-card transition-colors hover:bg-vytal-bg3"
                >
                  <td className="px-4 py-3 font-mono text-sm text-vytal-muted">
                    {t.date}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-vytal-text">
                    {t.member}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-vytal-text">
                    {t.amount} EUR
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <MethodBadge method={t.method} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.status} />
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
