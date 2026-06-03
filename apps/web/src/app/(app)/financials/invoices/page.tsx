"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Download,
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  QrCode,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { formatCurrency } from "@/stores/data-store";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";

type InvoiceStatus = "paid" | "pending" | "overdue";

interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  number: string;
  date: string;
  member: string;
  amount: number;
  status: InvoiceStatus;
  method: string;
  atcud: string;
  saftRef: string;
  lineItems: InvoiceLineItem[];
}

const MOCK_INVOICES: Invoice[] = [
  {
    id: "inv-1",
    number: "FT 2026/0142",
    date: "2026-06-01",
    member: "Jose Fonte",
    amount: 75,
    status: "paid",
    method: "Stripe",
    atcud: "ATCUD:0000-000142",
    saftRef: "SAF-T/2026/FT/0142",
    lineItems: [
      { description: "Unlimited Monthly Plan - June 2026", quantity: 1, unitPrice: 75, total: 75 },
    ],
  },
  {
    id: "inv-2",
    number: "FT 2026/0141",
    date: "2026-06-01",
    member: "Ana Silva",
    amount: 75,
    status: "paid",
    method: "MBWay",
    atcud: "ATCUD:0000-000141",
    saftRef: "SAF-T/2026/FT/0141",
    lineItems: [
      { description: "Unlimited Monthly Plan - June 2026", quantity: 1, unitPrice: 75, total: 75 },
    ],
  },
  {
    id: "inv-3",
    number: "FT 2026/0140",
    date: "2026-05-30",
    member: "Miguel Costa",
    amount: 60,
    status: "paid",
    method: "SEPA",
    atcud: "ATCUD:0000-000140",
    saftRef: "SAF-T/2026/FT/0140",
    lineItems: [
      { description: "3x/week Monthly Plan - June 2026", quantity: 1, unitPrice: 60, total: 60 },
    ],
  },
  {
    id: "inv-4",
    number: "FT 2026/0139",
    date: "2026-05-28",
    member: "Sofia Santos",
    amount: 50,
    status: "pending",
    method: "MBWay",
    atcud: "ATCUD:0000-000139",
    saftRef: "SAF-T/2026/FT/0139",
    lineItems: [
      { description: "3x/week Monthly Plan - June 2026", quantity: 1, unitPrice: 50, total: 50 },
    ],
  },
  {
    id: "inv-5",
    number: "FT 2026/0138",
    date: "2026-05-25",
    member: "Tiago Neves",
    amount: 15,
    status: "paid",
    method: "Cash",
    atcud: "ATCUD:0000-000138",
    saftRef: "SAF-T/2026/FT/0138",
    lineItems: [
      { description: "Trial Session", quantity: 1, unitPrice: 15, total: 15 },
    ],
  },
  {
    id: "inv-6",
    number: "FT 2026/0137",
    date: "2026-05-22",
    member: "Pedro Almeida",
    amount: 75,
    status: "overdue",
    method: "Stripe",
    atcud: "ATCUD:0000-000137",
    saftRef: "SAF-T/2026/FT/0137",
    lineItems: [
      { description: "Unlimited Monthly Plan - May 2026", quantity: 1, unitPrice: 75, total: 75 },
    ],
  },
  {
    id: "inv-7",
    number: "FT 2026/0136",
    date: "2026-05-20",
    member: "Ines Ferreira",
    amount: 100,
    status: "paid",
    method: "SEPA",
    atcud: "ATCUD:0000-000136",
    saftRef: "SAF-T/2026/FT/0136",
    lineItems: [
      { description: "5x/week Monthly Plan - June 2026", quantity: 1, unitPrice: 90, total: 90 },
      { description: "Drop-in Pass (Guest)", quantity: 1, unitPrice: 10, total: 10 },
    ],
  },
  {
    id: "inv-8",
    number: "FT 2026/0135",
    date: "2026-05-18",
    member: "Maria Oliveira",
    amount: 75,
    status: "overdue",
    method: "MBWay",
    atcud: "ATCUD:0000-000135",
    saftRef: "SAF-T/2026/FT/0135",
    lineItems: [
      { description: "Unlimited Monthly Plan - May 2026", quantity: 1, unitPrice: 75, total: 75 },
    ],
  },
  {
    id: "inv-9",
    number: "FT 2026/0134",
    date: "2026-05-15",
    member: "Carlos Mendes",
    amount: 390,
    status: "paid",
    method: "SEPA",
    atcud: "ATCUD:0000-000134",
    saftRef: "SAF-T/2026/FT/0134",
    lineItems: [
      { description: "Unlimited Semester Plan - Jun-Nov 2026", quantity: 1, unitPrice: 390, total: 390 },
    ],
  },
  {
    id: "inv-10",
    number: "FT 2026/0133",
    date: "2026-05-12",
    member: "Rita Sousa",
    amount: 15,
    status: "pending",
    method: "Cash",
    atcud: "ATCUD:0000-000133",
    saftRef: "SAF-T/2026/FT/0133",
    lineItems: [
      { description: "Drop-in Session", quantity: 1, unitPrice: 15, total: 15 },
    ],
  },
];

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const config: Record<InvoiceStatus, { label: string; className: string }> = {
    paid: { label: "Paid", className: "bg-vytal-green/10 text-vytal-green" },
    pending: {
      label: "Pending",
      className: "bg-vytal-amber/10 text-vytal-amber",
    },
    overdue: {
      label: "Overdue",
      className: "bg-vytal-red/10 text-vytal-red",
    },
  };
  const c = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        c.className
      )}
    >
      {c.label}
    </span>
  );
}

function formatEur(value: number): string {
  return formatCurrency(value);
}

function MethodBadge({ method }: { method: string }) {
  return (
    <span className="inline-flex items-center rounded bg-vytal-bg3 px-2 py-0.5 text-xs text-vytal-muted">
      {method}
    </span>
  );
}

function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="cursor-pointer bg-vytal-card transition-colors hover:bg-vytal-bg3"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3 font-mono text-xs text-vytal-muted">
          {invoice.number}
        </td>
        <td className="px-4 py-3 font-mono text-xs text-vytal-muted">
          {invoice.date}
        </td>
        <td className="px-4 py-3 text-sm font-medium text-vytal-text">
          {invoice.member}
        </td>
        <td className="px-4 py-3 font-mono text-sm text-vytal-text">
          {formatEur(invoice.amount)}
        </td>
        <td className="px-4 py-3">
          <StatusBadge status={invoice.status} />
        </td>
        <td className="hidden px-4 py-3 sm:table-cell">
          <MethodBadge method={invoice.method} />
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
              title="Download PDF"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5 text-vytal-muted" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-vytal-muted" />
            )}
          </div>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7} className="border-b border-vytal-border bg-vytal-bg2 px-4 py-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Line Items */}
              <div>
                <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  Line Items
                </h4>
                <div className="overflow-hidden rounded-lg border border-vytal-border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-vytal-border bg-vytal-bg3">
                        <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-vytal-muted">
                          Description
                        </th>
                        <th className="px-3 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-vytal-muted">
                          Qty
                        </th>
                        <th className="px-3 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-vytal-muted">
                          Price
                        </th>
                        <th className="px-3 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-vytal-muted">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-vytal-border">
                      {invoice.lineItems.map((item, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 text-xs text-vytal-text">
                            {item.description}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-xs text-vytal-muted">
                            {item.quantity}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-xs text-vytal-muted">
                            {formatEur(item.unitPrice)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-xs font-semibold text-vytal-text">
                            {formatEur(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Fiscal Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  Fiscal Details
                </h4>
                <div className="space-y-2 rounded-lg border border-vytal-border bg-vytal-bg3 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-vytal-muted">ATCUD</span>
                    <span className="font-mono text-xs text-vytal-text">
                      {invoice.atcud}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-vytal-muted">SAF-T Ref</span>
                    <span className="font-mono text-xs text-vytal-text">
                      {invoice.saftRef}
                    </span>
                  </div>
                </div>

                {/* QR Code placeholder */}
                <div className="flex items-center gap-3 rounded-lg border border-dashed border-vytal-border p-3">
                  <QrCode className="h-10 w-10 text-vytal-muted" />
                  <div>
                    <p className="text-xs font-medium text-vytal-text">
                      Fiscal QR Code
                    </p>
                    <p className="text-[10px] text-vytal-muted">
                      Portuguese tax authority compliant
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function InvoicesPage() {
  const { t } = useI18n();
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = MOCK_INVOICES;
    if (statusFilter !== "all") {
      result = result.filter((inv) => inv.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.member.toLowerCase().includes(q) ||
          inv.number.toLowerCase().includes(q)
      );
    }
    return result;
  }, [statusFilter, search]);

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: t("nav.financials"), href: "/financials" },
          { label: t("invoices.title") },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("invoices.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("invoices.subtitle")} ({MOCK_INVOICES.length} total)
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-vytal-border px-4 py-2.5 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
        >
          <FileText className="h-4 w-4" />
          {t("invoices.exportSaft")}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-vytal-border">
          {(
            [
              { value: "all", label: "All" },
              { value: "paid", label: "Paid" },
              { value: "pending", label: "Pending" },
              { value: "overdue", label: "Overdue" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatusFilter(opt.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors",
                statusFilter === opt.value
                  ? "bg-vytal-green/10 text-vytal-green"
                  : "text-vytal-muted hover:text-vytal-text"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vytal-muted" />
          <input
            type="text"
            placeholder="Search by member or invoice number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 py-2 pl-10 pr-4 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-vytal-border">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-vytal-border bg-vytal-bg2">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Invoice #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Member
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Status
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted sm:table-cell">
                Method
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vytal-border">
            {filtered.map((invoice) => (
              <InvoiceRow key={invoice.id} invoice={invoice} />
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <EmptyState
            icon={Inbox}
            title={t("invoices.noInvoices")}
            description={t("invoices.noInvoicesDesc")}
          />
        )}
      </div>
    </div>
  );
}
