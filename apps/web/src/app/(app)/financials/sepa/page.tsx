"use client";

import { useState, useRef, useCallback } from "react";
import {
  Building2,
  Download,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { formatCurrency } from "@/stores/data-store";

type Tab = "creditor" | "generate" | "returns";

const mockCreditor = {
  name: "CrossFit Aveiro Lda",
  iban: "PT50000201231234567890154",
  bic: "BPPIITM1XXX",
  creditorId: "PT28ZZZ123456789",
};

const mockPendingMembers = [
  { id: 1, name: "Ana Silva", iban: "****4523", amount: 75, mandateId: "MNDT-2024-0142" },
  { id: 2, name: "Pedro Almeida", iban: "****8901", amount: 60, mandateId: "MNDT-2024-0087" },
  { id: 3, name: "Sofia Santos", iban: "****2345", amount: 75, mandateId: "MNDT-2024-0201" },
  { id: 4, name: "Miguel Costa", iban: "****6789", amount: 50, mandateId: "MNDT-2024-0156" },
  { id: 5, name: "Rita Oliveira", iban: "****3456", amount: 100, mandateId: "MNDT-2024-0098" },
  { id: 6, name: "Tiago Neves", iban: "****7890", amount: 60, mandateId: "MNDT-2024-0223" },
];

const mockReturnFiles = [
  { id: 1, date: "2026-05-15", fileName: "return_2026-05.xml", status: "Processed" as const, validated: 42, rejected: 2 },
  { id: 2, date: "2026-04-16", fileName: "return_2026-04.xml", status: "Processed" as const, validated: 38, rejected: 1 },
  { id: 3, date: "2026-06-02", fileName: "return_2026-06.xml", status: "Pending" as const, validated: 0, rejected: 0 },
];

export default function SepaPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("creditor");
  const [creditor, setCreditor] = useState(mockCreditor);
  const [dateFrom, setDateFrom] = useState("2026-06-01");
  const [dateTo, setDateTo] = useState("2026-06-30");
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const isXml = file.name.endsWith(".xml");
      const isZip = file.name.endsWith(".zip");
      if (!isXml && !isZip) {
        toast(t("sepa.fileInvalid") || "Please select an XML or ZIP file", "error");
        e.target.value = "";
        return;
      }
      toast((t("sepa.fileUploaded") || "File {name} uploaded successfully").replace("{name}", file.name), "success");
      e.target.value = "";
    },
    [toast, t]
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: "creditor", label: t("sepa.creditorSetup") || "Creditor Setup" },
    { key: "generate", label: t("sepa.generateCollection") || "Generate Collection" },
    { key: "returns", label: t("sepa.returnFiles") || "Return Files" },
  ];

  const inputClass =
    "w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20";

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: t("nav.financials"), href: "/financials" },
          { label: t("nav.sepa") || "SEPA Direct Debit" },
        ]}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-vytal-text">{t("sepa.title") || "SEPA Direct Debit"}</h1>
        <p className="mt-1 text-sm text-vytal-muted">{t("sepa.subtitle") || "Manage SEPA C2B collections and bank integrations"}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-vytal-bg2 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-vytal-card text-vytal-text shadow-sm"
                : "text-vytal-muted hover:text-vytal-text"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "creditor" && (
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-blue/10">
              <Building2 className="h-5 w-5 text-vytal-blue" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-vytal-text">{t("sepa.creditorInfo") || "Creditor Information"}</h3>
              <p className="text-xs text-vytal-muted">{t("sepa.creditorDesc") || "Your organization's SEPA creditor details"}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("sepa.creditorName") || "Creditor Name"}</label>
              <input
                type="text"
                value={creditor.name}
                onChange={(e) => setCreditor({ ...creditor, name: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">IBAN</label>
              <input
                type="text"
                value={creditor.iban}
                onChange={(e) => setCreditor({ ...creditor, iban: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">BIC / SWIFT</label>
              <input
                type="text"
                value={creditor.bic}
                onChange={(e) => setCreditor({ ...creditor, bic: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("sepa.creditorId") || "Creditor ID"}</label>
              <input
                type="text"
                value={creditor.creditorId}
                onChange={(e) => setCreditor({ ...creditor, creditorId: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => toast(t("sepa.creditorSaved") || "Creditor details saved", "success")}
              className="rounded-lg bg-vytal-green px-5 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
            >
              {t("action.save")}
            </button>
          </div>
        </div>
      )}

      {activeTab === "generate" && (
        <div className="space-y-6">
          {/* Date Range */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-vytal-green" />
              <h3 className="text-sm font-semibold text-vytal-text">{t("sepa.collectionPeriod") || "Collection Period"}</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("sepa.dateFrom") || "From"}</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("sepa.dateTo") || "To"}</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Pending Members Table */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card">
            <div className="border-b border-vytal-border px-6 py-4">
              <h3 className="text-sm font-semibold text-vytal-text">{t("sepa.pendingPayments") || "Members with Pending Payments"}</h3>
              <p className="mt-0.5 text-xs text-vytal-muted">{mockPendingMembers.length} {t("sepa.membersToCollect") || "members to collect"}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-vytal-border bg-vytal-bg2">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("table.name")}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">IBAN</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("financials.amount")}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("sepa.mandateId") || "Mandate ID"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vytal-border">
                  {mockPendingMembers.map((m) => (
                    <tr key={m.id} className="bg-vytal-card transition-colors hover:bg-vytal-bg3">
                      <td className="px-4 py-3 text-sm font-medium text-vytal-text">{m.name}</td>
                      <td className="px-4 py-3 font-mono text-sm text-vytal-muted">{m.iban}</td>
                      <td className="px-4 py-3 font-mono text-sm font-semibold text-vytal-text">{formatCurrency(m.amount)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-vytal-muted">{m.mandateId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-vytal-border px-6 py-4">
              <div className="text-sm text-vytal-muted">
                Total: <span className="font-semibold text-vytal-text">{formatCurrency(mockPendingMembers.reduce((s, m) => s + m.amount, 0))}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => toast(t("sepa.fileGenerated") || "SEPA file generated: collection_2026-06.xml", "success")}
                  className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
                >
                  <FileText className="h-4 w-4" /> {t("sepa.generateC2B") || "Generate C2B File"}
                </button>
                <button
                  onClick={() => toast(t("sepa.downloading") || "Downloading collection_2026-06.xml", "success")}
                  className="flex items-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
                >
                  <Download className="h-4 w-4" /> {t("sepa.download") || "Download"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "returns" && (
        <div className="space-y-6">
          {/* Hidden file input */}
          <input
            ref={uploadInputRef}
            type="file"
            accept=".xml,.zip"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Upload Drop Zone */}
          <div
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-vytal-border bg-vytal-card px-6 py-12 transition-colors hover:border-vytal-green/30 cursor-pointer"
            onClick={() => uploadInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (!file) return;
              const isXml = file.name.endsWith(".xml");
              const isZip = file.name.endsWith(".zip");
              if (!isXml && !isZip) {
                toast(t("sepa.fileInvalid") || "Please select an XML or ZIP file", "error");
                return;
              }
              toast((t("sepa.fileUploaded") || "File {name} uploaded successfully").replace("{name}", file.name), "success");
            }}
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-vytal-bg3">
              <Upload className="h-6 w-6 text-vytal-muted" />
            </div>
            <p className="text-sm font-medium text-vytal-text">{t("sepa.uploadReturnFile") || "Upload Return File"}</p>
            <p className="mt-1 text-xs text-vytal-muted">{t("sepa.uploadDesc") || "Drag and drop your XML return file here, or click to browse"}</p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); uploadInputRef.current?.click(); }}
              className="mt-4 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2 text-xs font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
            >
              {t("sepa.browse") || "Browse Files"}
            </button>
          </div>

          {/* Recent Returns Table */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card">
            <div className="border-b border-vytal-border px-6 py-4">
              <h3 className="text-sm font-semibold text-vytal-text">{t("sepa.recentReturns") || "Recent Return Files"}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-vytal-border bg-vytal-bg2">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("financials.date")}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("sepa.fileName") || "File Name"}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("financials.status")}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("sepa.validated") || "Validated"}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("sepa.rejected") || "Rejected"}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("table.action")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vytal-border">
                  {mockReturnFiles.map((rf) => (
                    <tr key={rf.id} className="bg-vytal-card transition-colors hover:bg-vytal-bg3">
                      <td className="px-4 py-3 font-mono text-sm text-vytal-muted">{rf.date}</td>
                      <td className="px-4 py-3 text-sm text-vytal-text">{rf.fileName}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                          rf.status === "Processed" ? "bg-vytal-green/10 text-vytal-green" : "bg-vytal-amber/10 text-vytal-amber"
                        )}>
                          {rf.status === "Processed" ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                          {rf.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-vytal-green">{rf.validated}</td>
                      <td className="px-4 py-3 font-mono text-sm text-vytal-red">{rf.rejected}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => toast(rf.status === "Pending" ? (t("sepa.processing") || "Processing return file...") : (t("sepa.alreadyProcessed") || "File already processed"), rf.status === "Pending" ? "success" : "info")}
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                            rf.status === "Pending"
                              ? "border-vytal-green/30 bg-vytal-green/10 text-vytal-green hover:bg-vytal-green/20"
                              : "border-vytal-border bg-vytal-bg2 text-vytal-muted"
                          )}
                        >
                          {t("sepa.process") || "Process"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
