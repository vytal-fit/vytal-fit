"use client";

import { useState, useCallback } from "react";
import {
  Download,
  HardDrive,
  FileJson,
  FileSpreadsheet,
  Clock,
  Shield,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { trpc } from "@/lib/trpc";

type ExportFormat = "json" | "csv";

function humanBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function toCsv(rows: unknown[]): string {
  if (!Array.isArray(rows) || rows.length === 0) return "";
  const keys = Object.keys(rows[0] as Record<string, unknown>);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [keys.join(","), ...rows.map((r) => keys.map((k) => esc((r as Record<string, unknown>)[k])).join(","))].join("\n");
}

const exportSections: { key: string; labelKey: string }[] = [
  { key: "members", labelKey: "backup.members" },
  { key: "classes", labelKey: "backup.classes" },
  { key: "payments", labelKey: "backup.payments" },
  { key: "wods", labelKey: "backup.wods" },
  { key: "crm", labelKey: "backup.crm" },
];

export default function BackupPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const [format, setFormat] = useState<ExportFormat>("json");
  const [selected, setSelected] = useState<Set<string>>(new Set(exportSections.map((o) => o.key)));
  const [autoBackup, setAutoBackup] = useState<"off" | "daily" | "weekly">("weekly");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const summaryQuery = trpc.backups.summary.useQuery();
  const historyQuery = trpc.backups.history.useQuery();
  const counts = summaryQuery.data ?? { members: 0, classes: 0, payments: 0, wods: 0, crm: 0 };
  const history = historyQuery.data ?? [];

  const createBackup = trpc.backups.create.useMutation({
    onSuccess: (res) => {
      const content =
        res.format === "json"
          ? JSON.stringify(res, null, 2)
          : Object.entries(res.data)
              .map(([section, rows]) => `# ${section}\n${toCsv(rows)}`)
              .join("\n\n");
      const blob = new Blob([content], {
        type: res.format === "json" ? "application/json" : "text/csv",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vytal-backup-${new Date().toISOString().slice(0, 10)}.${res.format}`;
      a.click();
      URL.revokeObjectURL(url);
      void utils.backups.history.invalidate();
      toast(t("backup.exportSuccess"), "success");
    },
    onError: (e) =>
      toast(e.data?.code === "FORBIDDEN" ? t("settings.adminOnly") : t("ui.error"), "error"),
  });

  const toggleOption = (key: string) => {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelected(next);
  };

  const handleExport = useCallback(() => {
    if (selected.size === 0) {
      toast(t("backup.selectAtLeastOne"), "error");
      return;
    }
    createBackup.mutate({ sections: Array.from(selected) as never, format });
  }, [selected, format, toast, t, createBackup]);

  const handleDeleteAll = () => {
    setConfirmDelete(false);
    toast(t("backup.dataDeleted"), "success");
  };

  const exporting = createBackup.isPending;

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs
          items={[
            { label: t("nav.settings"), href: "/settings" },
            { label: t("backup.title") },
          ]}
        />
        <p className="mt-1 text-sm text-vytal-muted">{t("backup.subtitle")}</p>
      </div>

      {/* Export Options */}
      <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-6">
        <h2 className="text-base font-bold text-vytal-text mb-4">{t("backup.exportData")}</h2>

        <div className="space-y-3 mb-6">
          {exportSections.map((opt) => (
            <label
              key={opt.key}
              className="flex items-center justify-between rounded-lg border border-vytal-border px-4 py-3 cursor-pointer transition-colors hover:bg-vytal-bg3"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selected.has(opt.key)}
                  onChange={() => toggleOption(opt.key)}
                  className="h-4 w-4 rounded border-vytal-border text-vytal-green accent-vytal-green"
                />
                <span className="text-sm font-medium text-vytal-text">{t(opt.labelKey)}</span>
              </div>
              <span className="text-xs text-vytal-muted">
                {(counts as Record<string, number>)[opt.key] ?? 0} {t("backup.records")}
              </span>
            </label>
          ))}
        </div>

        {/* Format toggle */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm font-medium text-vytal-muted">{t("backup.format")}:</span>
          <div className="flex items-center gap-1 rounded-lg bg-vytal-bg3 p-1">
            <button
              onClick={() => setFormat("json")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                format === "json"
                  ? "bg-vytal-bg text-vytal-text shadow-sm"
                  : "text-vytal-muted hover:text-vytal-text"
              )}
            >
              <FileJson className="h-3.5 w-3.5" />
              JSON
            </button>
            <button
              onClick={() => setFormat("csv")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                format === "csv"
                  ? "bg-vytal-bg text-vytal-text shadow-sm"
                  : "text-vytal-muted hover:text-vytal-text"
              )}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              CSV
            </button>
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90 disabled:opacity-50"
        >
          {exporting ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {exporting ? t("backup.exporting") : t("backup.exportAll")}
        </button>
      </div>

      {/* Scheduled Backups */}
      <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-5 w-5 text-vytal-muted" />
          <h2 className="text-base font-bold text-vytal-text">{t("backup.scheduledBackups")}</h2>
        </div>
        <div className="flex items-center gap-3">
          {(["off", "daily", "weekly"] as const).map((freq) => (
            <button
              key={freq}
              onClick={() => {
                setAutoBackup(freq);
                toast(
                  freq === "off" ? t("backup.autoBackupOff") : t("backup.autoBackupSet"),
                  "success"
                );
              }}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                autoBackup === freq
                  ? "bg-vytal-green/10 text-vytal-green ring-1 ring-vytal-green/30"
                  : "bg-vytal-bg3 text-vytal-muted hover:text-vytal-text"
              )}
            >
              {t(`backup.freq.${freq}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Backups */}
      <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-6">
        <div className="flex items-center gap-3 mb-4">
          <HardDrive className="h-5 w-5 text-vytal-muted" />
          <h2 className="text-base font-bold text-vytal-text">{t("backup.recentBackups")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-vytal-border text-left">
                <th className="pb-3 font-semibold text-vytal-muted">{t("backup.date")}</th>
                <th className="pb-3 font-semibold text-vytal-muted">{t("backup.size")}</th>
                <th className="pb-3 font-semibold text-vytal-muted">{t("backup.type")}</th>
                <th className="pb-3 font-semibold text-vytal-muted">{t("backup.formatCol")}</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-xs text-vytal-muted">
                    {t("backup.noBackups")}
                  </td>
                </tr>
              )}
              {history.map((bk) => (
                <tr key={bk.id} className="border-b border-vytal-border last:border-b-0">
                  <td className="py-3 text-vytal-text">
                    {new Date(bk.createdAt).toLocaleDateString("pt-PT", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-3 text-vytal-muted">{humanBytes(bk.sizeBytes)}</td>
                  <td className="py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        bk.type === "full"
                          ? "bg-vytal-green/10 text-vytal-green"
                          : "bg-vytal-amber/10 text-vytal-amber"
                      )}
                    >
                      {bk.type === "full" ? t("backup.full") : t("backup.partial")}
                    </span>
                  </td>
                  <td className="py-3 text-vytal-muted uppercase text-xs">{bk.format}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RGPD Section */}
      <div className="rounded-xl border border-red-500/30 bg-red-500/[0.03] p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-vytal-red" />
          <h2 className="text-base font-bold text-vytal-text">{t("backup.rgpd")}</h2>
        </div>
        <p className="text-sm text-vytal-muted mb-4">{t("backup.rgpdDescription")}</p>

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-sm font-semibold text-vytal-red transition-colors hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
            {t("backup.deleteAllData")}
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-vytal-red font-medium">{t("backup.confirmDelete")}</span>
            <button
              onClick={handleDeleteAll}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              {t("backup.yesDelete")}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="rounded-lg border border-vytal-border px-4 py-2 text-sm font-medium text-vytal-muted hover:text-vytal-text transition-colors"
            >
              {t("backup.cancel")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
