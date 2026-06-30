"use client";

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import {
  DollarSign,
  Download,
  RefreshCw,
  FileText,
  CreditCard,
  TrendingUp,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrgFormat } from "@/lib/org-format";
import { trpc } from "@/lib/trpc";
import { rowToMember } from "@/lib/member-mapper";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { Breadcrumbs } from "@/components/breadcrumbs";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  mbway: "MB Way",
  multibanco: "Multibanco",
  sepa: "SEPA",
  card: "Cartão",
  cash: "Numerário",
  transfer: "Transferência",
};

function StatusBadge({
  status,
}: {
  status: "paid" | "pending" | "failed" | "overdue" | "refunded";
}) {
  const config = {
    paid: { label: "Paid", className: "bg-vytal-green/10 text-vytal-green" },
    pending: { label: "Pending", className: "bg-vytal-amber/10 text-vytal-amber" },
    failed: { label: "Failed", className: "bg-vytal-red/10 text-vytal-red" },
    overdue: { label: "Overdue", className: "bg-vytal-red/10 text-vytal-red" },
    refunded: { label: "Refunded", className: "bg-vytal-bg3 text-vytal-muted" },
  };
  const c = config[status];
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", c.className)}>{c.label}</span>;
}

export default function MemberBillingPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { money: formatCurrency } = useOrgFormat();
  const params = useParams();
  const id = params.id as string;
  const memberQuery = trpc.members.byId.useQuery({ id });
  const member = memberQuery.data ? rowToMember(memberQuery.data) : undefined;
  const paymentsQuery = trpc.payments.byMember.useQuery({ memberId: id });
  const billingHistory = (paymentsQuery.data ?? []).map((p) => {
    const when = p.paidAt ?? p.createdAt;
    return {
      id: p.id,
      date: new Date(when).toISOString().slice(0, 10),
      description: p.reference ? `Pagamento ${p.reference}` : "Mensalidade",
      amount: Number(p.amount),
      method: PAYMENT_METHOD_LABELS[p.method] ?? p.method,
      status: p.status,
      receiptId: p.reference ?? p.id,
    };
  });

  if (memberQuery.error?.data?.code === "NOT_FOUND") return notFound();
  if (memberQuery.isPending) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-vytal-muted">{t("ui.loading")}</p>
      </div>
    );
  }
  if (!member) return notFound();

  const totalPaid = billingHistory.filter((b) => b.status === "paid").reduce((s, b) => s + b.amount, 0);
  const thisYear = billingHistory.filter((b) => b.date.startsWith("2026") && b.status === "paid").reduce((s, b) => s + b.amount, 0);
  const outstanding = billingHistory.filter((b) => b.status === "pending" || b.status === "failed" || b.status === "overdue").reduce((s, b) => s + b.amount, 0);

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: t("nav.members"), href: "/members" },
          { label: member.name, href: `/members/${id}` },
          { label: t("billing.title") || "Billing" },
        ]}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-vytal-text">{member.name} - {t("billing.title") || "Billing"}</h1>
        <p className="mt-1 text-sm text-vytal-muted">{t("billing.subtitle") || "Complete payment history and billing details"}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("billing.totalPaid") || "Total Paid"}</span>
              <p className="mt-1 text-2xl font-bold text-vytal-text">{formatCurrency(totalPaid)}</p>
              <span className="text-[10px] text-vytal-muted">{t("billing.lifetime") || "Lifetime"}</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-green/10">
              <DollarSign className="h-5 w-5 text-vytal-green" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("billing.thisYear") || "This Year"}</span>
              <p className="mt-1 text-2xl font-bold text-vytal-text">{formatCurrency(thisYear)}</p>
              <span className="text-[10px] text-vytal-muted">2026</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-blue/10">
              <TrendingUp className="h-5 w-5 text-vytal-blue" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("billing.outstanding") || "Outstanding"}</span>
              <p className={cn("mt-1 text-2xl font-bold", outstanding > 0 ? "text-vytal-red" : "text-vytal-text")}>{formatCurrency(outstanding)}</p>
              <span className="text-[10px] text-vytal-muted">{outstanding > 0 ? (t("billing.needsAttention") || "Needs attention") : (t("billing.allClear") || "All clear")}</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-red/10">
              <CreditCard className="h-5 w-5 text-vytal-red" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("billing.nextPayment") || "Next Payment"}</span>
              <p className="mt-1 text-2xl font-bold text-vytal-text">01 Jul</p>
              <span className="text-[10px] text-vytal-muted">{formatCurrency(75)}</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-amber/10">
              <Clock className="h-5 w-5 text-vytal-amber" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => toast(t("billing.downloadingStatement") || "Downloading annual statement PDF...", "success")}
          className="flex items-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
        >
          <Download className="h-4 w-4" /> {t("billing.downloadStatement") || "Download Statement"}
        </button>
      </div>

      {/* Payment History Table */}
      <div className="rounded-xl border border-vytal-border">
        <div className="border-b border-vytal-border px-6 py-4">
          <h3 className="text-sm font-semibold text-vytal-text">{t("billing.paymentHistory") || "Payment History"}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-vytal-border bg-vytal-bg2">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("financials.date")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("billing.descriptionCol") || "Description"}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("financials.amount")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("financials.method")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("financials.status")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("table.action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vytal-border">
              {billingHistory.map((bill) => (
                <tr key={bill.id} className="bg-vytal-card transition-colors hover:bg-vytal-bg3">
                  <td className="px-4 py-3 font-mono text-sm text-vytal-muted">{bill.date}</td>
                  <td className="px-4 py-3 text-sm text-vytal-text">{bill.description}</td>
                  <td className="px-4 py-3 font-mono text-sm font-semibold text-vytal-text">{formatCurrency(bill.amount)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded bg-vytal-bg3 px-2 py-0.5 text-xs font-medium text-vytal-muted">{bill.method}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={bill.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {bill.status === "paid" && (
                        <button
                          onClick={() => toast(t("billing.downloadingReceipt") || `Downloading receipt ${bill.receiptId}...`, "success")}
                          className="inline-flex items-center gap-1 rounded-lg border border-vytal-border bg-vytal-bg2 px-2.5 py-1 text-[10px] font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
                        >
                          <FileText className="h-3 w-3" /> {t("billing.receipt") || "Receipt"}
                        </button>
                      )}
                      {bill.status === "failed" && (
                        <button
                          onClick={() => toast(t("billing.retryingPayment") || "Retrying payment...", "success")}
                          className="inline-flex items-center gap-1 rounded-lg border border-vytal-red/30 bg-vytal-red/10 px-2.5 py-1 text-[10px] font-medium text-vytal-red transition-colors hover:bg-vytal-red/20"
                        >
                          <RefreshCw className="h-3 w-3" /> {t("billing.retry") || "Retry"}
                        </button>
                      )}
                    </div>
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
