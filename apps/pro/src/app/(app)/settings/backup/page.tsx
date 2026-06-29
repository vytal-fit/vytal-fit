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

type ExportFormat = "json" | "csv";

interface ExportOption {
  key: string;
  labelKey: string;
  count: number;
}

interface BackupEntry {
  id: string;
  date: string;
  size: string;
  type: "full" | "partial";
  format: ExportFormat;
}

const exportOptions: ExportOption[] = [
  { key: "members", labelKey: "backup.members", count: 127 },
  { key: "classes", labelKey: "backup.classes", count: 342 },
  { key: "payments", labelKey: "backup.payments", count: 1580 },
  { key: "wods", labelKey: "backup.wods", count: 89 },
  { key: "crm", labelKey: "backup.crm", count: 45 },
];

const mockBackups: BackupEntry[] = [
  { id: "bk-1", date: "2026-06-03T14:30:00", size: "4.2 MB", type: "full", format: "json" },
  { id: "bk-2", date: "2026-05-27T09:00:00", size: "3.8 MB", type: "full", format: "json" },
  { id: "bk-3", date: "2026-05-20T09:00:00", size: "1.1 MB", type: "partial", format: "csv" },
];

export default function BackupPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [format, setFormat] = useState<ExportFormat>("json");
  const [selected, setSelected] = useState<Set<string>>(new Set(exportOptions.map((o) => o.key)));
  const [autoBackup, setAutoBackup] = useState<"off" | "daily" | "weekly">("weekly");
  const [exporting, setExporting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
    setExporting(true);

    // Simulate export with Blob
    setTimeout(() => {
      const mockData = {
        exportedAt: new Date().toISOString(),
        format,
        sections: Array.from(selected),
        data: {
          members: selected.has("members") ? [{ id: "m-1", name: "Sample Member" }] : [],
          classes: selected.has("classes") ? [{ id: "c-1", name: "Sample Class" }] : [],
          payments: selected.has("payments") ? [{ id: "p-1", amount: 65 }] : [],
          wods: selected.has("wods") ? [{ id: "w-1", name: "Sample WOD" }] : [],
          crm: selected.has("crm") ? [{ id: "l-1", name: "Sample Lead" }] : [],
        },
      };

      const content =
        format === "json"
          ? JSON.stringify(mockData, null, 2)
          : "id,name,type\n1,Sample,Data";

      const blob = new Blob([content], {
        type: format === "json" ? "application/json" : "text/csv",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vytal-backup-${new Date().toISOString().slice(0, 10)}.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      setExporting(false);
      toast(t("backup.exportSuccess"), "success");
    }, 1500);
  }, [selected, format, toast, t]);

  const handleDeleteAll = () => {
    setConfirmDelete(false);
    toast(t("backup.dataDeleted"), "success");
  };

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
          {exportOptions.map((opt) => (
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
              <span className="text-xs text-vytal-muted">{opt.count} {t("backup.records")}</span>
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
                <th className="pb-3 font-semibold text-vytal-muted"></th>
              </tr>
            </thead>
            <tbody>
              {mockBackups.map((bk) => (
                <tr key={bk.id} className="border-b border-vytal-border last:border-b-0">
                  <td className="py-3 text-vytal-text">
                    {new Date(bk.date).toLocaleDateString("pt-PT", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-3 text-vytal-muted">{bk.size}</td>
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
                  <td className="py-3 text-right">
                    <button
                      onClick={() => toast(t("backup.downloadStarted"), "success")}
                      className="text-vytal-green hover:text-vytal-green/80 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </td>
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
