"use client";

import { useState } from "react";
import {
  Users,
  CalendarDays,
  Dumbbell,
  UserPlus,
  Activity,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowLeft,
  File,
  X,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";

interface ImportType {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  templateColumns: string[];
  color: string;
}

const IMPORT_TYPES: ImportType[] = [
  {
    id: "members",
    title: "importCenter.members",
    description: "importCenter.membersDesc",
    icon: Users,
    templateColumns: ["Name", "Email", "Phone", "Date of Birth", "Plan", "Start Date", "Status"],
    color: "#22c55e",
  },
  {
    id: "classes",
    title: "importCenter.classes",
    description: "importCenter.classesDesc",
    icon: CalendarDays,
    templateColumns: ["Class Name", "Type", "Day", "Start Time", "End Time", "Coach", "Max Capacity"],
    color: "#00d4ff",
  },
  {
    id: "exercises",
    title: "importCenter.exercises",
    description: "importCenter.exercisesDesc",
    icon: Dumbbell,
    templateColumns: ["Name", "Category", "Equipment", "Description", "Video URL"],
    color: "#8b5cf6",
  },
  {
    id: "leads",
    title: "importCenter.leads",
    description: "importCenter.leadsDesc",
    icon: UserPlus,
    templateColumns: ["Name", "Email", "Phone", "Source", "Stage", "Notes"],
    color: "#ff8c42",
  },
  {
    id: "wods",
    title: "importCenter.wods",
    description: "importCenter.wodsDesc",
    icon: Activity,
    templateColumns: ["Date", "Title", "Type", "Exercises", "Time Cap", "Description"],
    color: "#ef4444",
  },
];

interface RecentImport {
  date: string;
  type: string;
  count: number;
  status: "completed" | "failed" | "processing";
  fileName: string;
}

const MOCK_RECENT_IMPORTS: RecentImport[] = [
  { date: "2025-12-01", type: "Members", count: 47, status: "completed", fileName: "members_dec.csv" },
  { date: "2025-11-28", type: "Exercises", count: 120, status: "completed", fileName: "exercise_library.xlsx" },
  { date: "2025-11-25", type: "Leads", count: 15, status: "failed", fileName: "leads_november.csv" },
];

export default function ImportPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [selectedType, setSelectedType] = useState<ImportType | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [mappingStep, setMappingStep] = useState(false);
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setUploadedFile(file.name);
      setMappingStep(true);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file.name);
      setMappingStep(true);
    }
  }

  function handleDownloadTemplate(type: ImportType) {
    const header = type.templateColumns.join(",");
    const blob = new Blob([header + "\n"], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type.id}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast(t("importCenter.templateDownloaded").replace("{file}", `${type.id}_template.csv`), "success");
  }

  function handleImport() {
    toast(t("importCenter.importStarted"), "success");
    setSelectedType(null);
    setUploadedFile(null);
    setMappingStep(false);
    setColumnMappings({});
  }

  function handleBack() {
    if (mappingStep) {
      setMappingStep(false);
      setUploadedFile(null);
    } else {
      setSelectedType(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-vytal-text">{t("importCenter.title")}</h1>
        <p className="mt-1 text-sm text-vytal-muted">
          {t("importCenter.subtitle")}
        </p>
      </div>

      {!selectedType ? (
        <>
          {/* Import type selector */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {IMPORT_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type)}
                  className="group flex flex-col items-center gap-4 rounded-xl border border-vytal-border bg-vytal-card p-6 text-center transition-all duration-200 hover:border-vytal-green/30 hover:shadow-[0_0_20px_rgba(34,197,94,0.05)]"
                >
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110"
                    style={{ backgroundColor: `${type.color}15`, color: type.color }}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-vytal-text">{t(type.title)}</h3>
                    <p className="mt-1 text-xs text-vytal-muted">{t(type.description)}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Recent imports */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-vytal-muted">
              <Clock className="h-4 w-4" />
              {t("importCenter.recentImports")}
            </h2>

            <div className="space-y-3">
              {MOCK_RECENT_IMPORTS.map((imp, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-vytal-border bg-vytal-bg2 p-4"
                >
                  <div className="flex items-center gap-4">
                    <FileSpreadsheet className="h-5 w-5 text-vytal-muted" />
                    <div>
                      <p className="text-sm font-medium text-vytal-text">{imp.fileName}</p>
                      <p className="text-xs text-vytal-muted">
                        {imp.type} &middot; {imp.count} {t("importCenter.records")} &middot; {new Date(imp.date).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold",
                      imp.status === "completed" && "bg-vytal-green/10 text-vytal-green",
                      imp.status === "failed" && "bg-vytal-red/10 text-vytal-red",
                      imp.status === "processing" && "bg-vytal-amber/10 text-vytal-amber"
                    )}
                  >
                    {imp.status === "completed" && <CheckCircle className="h-3 w-3" />}
                    {imp.status === "failed" && <AlertCircle className="h-3 w-3" />}
                    {imp.status === "processing" && <Clock className="h-3 w-3" />}
                    {t(`status.${imp.status}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Selected type - upload zone */}
          <div>
            <button
              onClick={handleBack}
              className="mb-4 flex items-center gap-2 text-sm text-vytal-muted transition-colors hover:text-vytal-text"
            >
              <ArrowLeft className="h-4 w-4" />
              {mappingStep ? t("importCenter.backToUpload") : t("importCenter.backToTypes")}
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${selectedType.color}15`, color: selectedType.color }}
              >
                <selectedType.icon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-vytal-text">{t("importCenter.importType").replace("{type}", t(selectedType.title))}</h2>
                <p className="text-sm text-vytal-muted">{t(selectedType.description)}</p>
              </div>
            </div>

            {!mappingStep ? (
              <div className="space-y-6">
                {/* Upload zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={cn(
                    "flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 transition-colors",
                    dragActive
                      ? "border-vytal-green bg-vytal-green/5"
                      : "border-vytal-border bg-vytal-card hover:border-vytal-green/30"
                  )}
                >
                  <Upload className="h-10 w-10 text-vytal-muted" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-vytal-text">
                      {t("importCenter.dragDrop")}
                    </p>
                    <p className="mt-1 text-xs text-vytal-muted">
                      {t("importCenter.orClickBrowse")}
                    </p>
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      className="hidden"
                      onChange={handleFileInput}
                    />
                    <span className="rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90">
                      {t("importCenter.chooseFile")}
                    </span>
                  </label>
                </div>

                {/* Download template */}
                <div className="rounded-xl border border-vytal-border bg-vytal-card p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-vytal-text">{t("importCenter.downloadTemplate")}</h3>
                      <p className="mt-0.5 text-xs text-vytal-muted">
                        {t("importCenter.useTemplate").replace("{type}", t(selectedType.title).toLowerCase())}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownloadTemplate(selectedType)}
                      className="flex items-center gap-2 rounded-lg border border-vytal-border px-4 py-2 text-sm text-vytal-text transition-colors hover:bg-vytal-bg3"
                    >
                      <Download className="h-4 w-4" />
                      {t("importCenter.downloadCsv")}
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedType.templateColumns.map((col) => (
                      <span
                        key={col}
                        className="rounded-full bg-vytal-bg3 px-3 py-1 text-[10px] font-medium text-vytal-muted"
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* File info */}
                <div className="flex items-center gap-4 rounded-xl border border-vytal-green/30 bg-vytal-green/5 p-4">
                  <File className="h-5 w-5 text-vytal-green" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-vytal-text">{uploadedFile}</p>
                    <p className="text-xs text-vytal-muted">{t("importCenter.fileReady")}</p>
                  </div>
                  <button
                    onClick={() => { setUploadedFile(null); setMappingStep(false); }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-vytal-muted hover:bg-vytal-bg3"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Column mapping */}
                <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-vytal-muted">
                    {t("importCenter.columnMapping")}
                  </h3>
                  <p className="mb-6 text-xs text-vytal-muted">
                    {t("importCenter.mapColumnsDesc")}
                  </p>

                  <div className="space-y-3">
                    {selectedType.templateColumns.map((col, i) => (
                      <div key={col} className="flex items-center gap-4">
                        <span className="w-40 text-sm font-medium text-vytal-text">{col}</span>
                        <div className="h-px flex-1 border-b border-dashed border-vytal-border" />
                        <select
                          value={columnMappings[col] ?? `column_${i}`}
                          onChange={(e) => setColumnMappings((prev) => ({ ...prev, [col]: e.target.value }))}
                          className="w-48 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text outline-none focus:border-vytal-green/40"
                        >
                          <option value={`column_${i}`}>{t("importCenter.columnAuto").replace("{letter}", String.fromCharCode(65 + i))}</option>
                          <option value="skip">{t("importCenter.skipField")}</option>
                          {selectedType.templateColumns.map((c, j) => (
                            <option key={c} value={`col_${j}`}>{c}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Import button */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-vytal-muted">
                    {t("importCenter.readyToImport").replace("{type}", t(selectedType.title).toLowerCase()).replace("{file}", uploadedFile ?? "")}
                  </p>
                  <button
                    onClick={handleImport}
                    className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
                  >
                    <Upload className="h-4 w-4" />
                    {t("importCenter.startImport")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
