"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { trpc } from "@/lib/trpc";
import { Breadcrumbs } from "@/components/breadcrumbs";

const FIELDS = [
  "Name",
  "Email",
  "Phone",
  "NIF",
  "Date of Birth",
  "Gender",
  "Plan",
  "Status",
  "-- Skip --",
];

const fieldToMemberKey: Record<string, string> = {
  Name: "name",
  Email: "email",
  Phone: "phone",
  NIF: "nif",
  "Date of Birth": "dateOfBirth",
  Gender: "gender",
  Plan: "planId",
  Status: "status",
};

/** Minimal RFC-4180-ish CSV parser: handles quoted fields, escaped quotes, and CRLF. */
function parseCsv(text: string): string[][] {
  const out: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else inQuotes = false;
      } else cell += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell); out.push(row); row = []; cell = ""; }
    else if (c !== "\r") cell += c;
  }
  if (cell.length > 0 || row.length > 0) { row.push(cell); out.push(row); }
  return out.filter((r) => r.some((v) => v.trim() !== ""));
}

/** Guess the target field for a CSV header (PT/EN/ES aliases). */
function guessField(header: string): string {
  const h = header.trim().toLowerCase();
  if (/nome|name|nombre/.test(h)) return "Name";
  if (/mail|correo/.test(h)) return "Email";
  if (/telefone|phone|telemovel|telefono|\btel\b|movil|móvil/.test(h)) return "Phone";
  if (/nif|vat|tax|fiscal/.test(h)) return "NIF";
  if (/nascimento|birth|\bdob\b|nacimiento/.test(h)) return "Date of Birth";
  if (/sexo|gender|genero|género/.test(h)) return "Gender";
  if (/plano|\bplan\b/.test(h)) return "Plan";
  if (/estado|status|situacao|situação/.test(h)) return "Status";
  return "-- Skip --";
}

type Step = 1 | 2 | 3;

interface ValidationRow {
  data: Record<string, string>;
  valid: boolean;
  errors: string[];
  isDuplicate: boolean;
}

export default function MemberImportPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const membersQuery = trpc.members.list.useQuery({});
  const existingMembers = useMemo(
    () => membersQuery.data?.items ?? [],
    [membersQuery.data],
  );
  const createMember = trpc.members.create.useMutation();
  const [step, setStep] = useState<Step>(1);
  const [fileName, setFileName] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mappings, setMappings] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; skipped: number; errors: number }>({ created: 0, skipped: 0, errors: 0 });

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseCsv(String(reader.result ?? ""));
      if (parsed.length < 2) {
        toast(t("memberImport.emptyFile"), "error");
        return;
      }
      const [hdr, ...body] = parsed;
      setHeaders(hdr);
      setRows(body);
      setMappings(hdr.map((h) => guessField(h)));
      setFileName(file.name);
      setStep(2);
      toast(`${file.name} · ${body.length} ${t("memberImport.rowsDetected")}`, "success");
    };
    reader.onerror = () => toast(t("memberImport.readError"), "error");
    reader.readAsText(file);
  }

  function downloadTemplate() {
    const header = "nome,email,telefone,nif,nascimento,sexo,plano,estado";
    const example = "Ana Exemplo,ana@exemplo.com,912000000,123456789,1990-01-01,F,Unlimited,active";
    const blob = new Blob([`${header}\n${example}\n`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vytal-members-template.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast(t("memberImport.templateDownloaded"), "success");
  }

  // Map CSV data using column mappings
  const mappedData: ValidationRow[] = useMemo(() => {
    return rows.map((row) => {
      const data: Record<string, string> = {};
      const errors: string[] = [];

      mappings.forEach((field, colIdx) => {
        if (field !== "-- Skip --") {
          const key = fieldToMemberKey[field] || field.toLowerCase();
          data[key] = row[colIdx] || "";
        }
      });

      // Validation
      if (!data.name) errors.push("Name is required");
      if (!data.email) errors.push("Email is required");
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push("Invalid email format");
      }

      // Check for duplicates against existing members
      const isDuplicate = existingMembers.some(
        (m) => m.email.toLowerCase() === (data.email || "").toLowerCase()
      );

      return {
        data,
        valid: errors.length === 0 && !isDuplicate,
        errors,
        isDuplicate,
      };
    });
  }, [rows, mappings, existingMembers]);

  const readyCount = mappedData.filter((r) => r.valid).length;
  const duplicateCount = mappedData.filter((r) => r.isDuplicate).length;
  const mappedFieldCount = mappings.filter((m) => m !== "-- Skip --").length;

  const handleImport = useCallback(async () => {
    setImporting(true);
    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const row of mappedData) {
      if (row.isDuplicate) {
        skipped++;
        continue;
      }
      if (row.errors.length > 0) {
        errors++;
        continue;
      }

      const dob = /^\d{4}-\d{2}-\d{2}$/.test(row.data.dateOfBirth ?? "")
        ? row.data.dateOfBirth
        : undefined;
      try {
        await createMember.mutateAsync({
          name: row.data.name || "Unknown",
          email: row.data.email || "",
          phone: row.data.phone || undefined,
          nif: row.data.nif || undefined,
          dateOfBirth: dob,
          gender: row.data.gender === "M" ? "male" : row.data.gender === "F" ? "female" : undefined,
          status: (row.data.status as "active" | "inactive" | "trial" | "suspended") || "active",
        });
        created++;
      } catch {
        errors++;
      }
    }

    await utils.members.list.invalidate();
    setImportResult({ created, skipped, errors });
    setImporting(false);
    setImported(true);
    toast(`${created} members imported successfully!`, "success");
  }, [mappedData, createMember, utils, toast]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("members.title"), href: "/members" }, { label: t("memberImport.title") }]} />

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/members"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("memberImport.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("memberImport.subtitle")}
          </p>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center gap-3">
        {[
          { num: 1 as Step, label: t("memberImport.uploadFile") },
          { num: 2 as Step, label: t("memberImport.mapColumns") },
          { num: 3 as Step, label: t("memberImport.previewImport") },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center gap-3">
            {i > 0 && (
              <ChevronRight className="h-4 w-4 text-vytal-muted" />
            )}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                  step >= s.num
                    ? "bg-vytal-green/10 text-vytal-green"
                    : "bg-vytal-bg3 text-vytal-muted"
                )}
              >
                {step > s.num ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  s.num
                )}
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  step >= s.num ? "text-vytal-text" : "text-vytal-muted"
                )}
              >
                {s.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="space-y-4">
          <label
            className="flex w-full cursor-pointer flex-col items-center gap-4 rounded-xl border-2 border-dashed border-vytal-border bg-vytal-card p-12 transition-colors hover:border-vytal-green/30"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-vytal-green/10">
              <Upload className="h-8 w-8 text-vytal-green" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-vytal-text">
                {t("memberImport.dropHere")}
              </p>
              <p className="mt-1 text-xs text-vytal-muted">
                {t("memberImport.supportsFormats")}
              </p>
            </div>
          </label>

          <button
            type="button"
            onClick={downloadTemplate}
            className="flex items-center gap-2 rounded-lg border border-vytal-border px-4 py-2.5 text-sm text-vytal-text transition-colors hover:bg-vytal-bg3"
          >
            <Download className="h-4 w-4" />
            {t("memberImport.downloadTemplate")}
          </button>
        </div>
      )}

      {/* Step 2: Column Mapping */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-vytal-green" />
              <span className="text-sm font-medium text-vytal-text">
                {fileName}
              </span>
              <span className="rounded bg-vytal-bg3 px-2 py-0.5 text-[10px] text-vytal-muted">
                {rows.length} {t("memberImport.rowsDetected")}
              </span>
              <span className="rounded bg-vytal-green/10 px-2 py-0.5 text-[10px] text-vytal-green">
                {mappedFieldCount}/{headers.length} mapped
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-vytal-border">
                    {headers.map((header, i) => (
                      <th key={i} className="px-3 py-2 text-left">
                        <div className="space-y-2">
                          <span className="text-[10px] font-medium uppercase tracking-wider text-vytal-muted">
                            {header}
                          </span>
                          <select
                            value={mappings[i]}
                            onChange={(e) => {
                              const newMappings = [...mappings];
                              newMappings[i] = e.target.value;
                              setMappings(newMappings);
                            }}
                            className={cn(
                              "w-full rounded border px-2 py-1 text-xs text-vytal-text focus:border-vytal-green/30 focus:outline-none",
                              mappings[i] === "-- Skip --"
                                ? "border-vytal-border bg-vytal-bg2 text-vytal-muted"
                                : "border-vytal-green/30 bg-vytal-green/5"
                            )}
                          >
                            {FIELDS.map((f) => (
                              <option key={f} value={f}>
                                {f}
                              </option>
                            ))}
                          </select>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-vytal-border">
                  {rows.map((row, ri) => (
                    <tr
                      key={ri}
                      className="bg-vytal-card transition-colors hover:bg-vytal-bg3"
                    >
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className={cn(
                            "px-3 py-2 text-xs",
                            mappings[ci] === "-- Skip --" ? "text-vytal-muted/40 line-through" : "text-vytal-text"
                          )}
                        >
                          {cell || (
                            <span className="text-vytal-muted italic">
                              empty
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-all hover:bg-vytal-green/90"
            >
              {t("memberImport.continue")}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-2 rounded-lg border border-vytal-border px-6 py-2.5 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
            >
              {t("action.back")}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview & Import */}
      {step === 3 && !imported && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-green/10">
                  <CheckCircle className="h-5 w-5 text-vytal-green" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-vytal-text">{readyCount}</p>
                  <p className="text-xs text-vytal-muted">{t("memberImport.readyToImport")}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-amber/10">
                  <AlertTriangle className="h-5 w-5 text-vytal-amber" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-vytal-text">{duplicateCount}</p>
                  <p className="text-xs text-vytal-muted">
                    {t("memberImport.possibleDuplicate")}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-blue/10">
                  <FileSpreadsheet className="h-5 w-5 text-vytal-blue" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-vytal-text">{mappedFieldCount}</p>
                  <p className="text-xs text-vytal-muted">{t("memberImport.columnsMapped")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Table with Validation */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-vytal-text">Preview - Mapped Data</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-vytal-border">
                    <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-vytal-muted">Status</th>
                    {mappings.filter((m) => m !== "-- Skip --").map((field, i) => (
                      <th key={i} className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-vytal-muted">{field}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-vytal-border">
                  {mappedData.map((row, ri) => (
                    <tr key={ri} className={cn(
                      "transition-colors",
                      row.isDuplicate ? "bg-vytal-amber/5" : row.valid ? "bg-vytal-card" : "bg-vytal-red/5"
                    )}>
                      <td className="px-3 py-2">
                        {row.valid ? (
                          <CheckCircle className="h-4 w-4 text-vytal-green" />
                        ) : row.isDuplicate ? (
                          <AlertTriangle className="h-4 w-4 text-vytal-amber" />
                        ) : (
                          <XCircle className="h-4 w-4 text-vytal-red" />
                        )}
                      </td>
                      {mappings.filter((m) => m !== "-- Skip --").map((field, ci) => {
                        const key = fieldToMemberKey[field] || field.toLowerCase();
                        return (
                          <td key={ci} className="px-3 py-2 text-xs text-vytal-text">
                            {row.data[key] || <span className="text-vytal-muted italic">empty</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Warnings */}
          {duplicateCount > 0 && (
            <div className="rounded-xl border border-vytal-amber/20 bg-vytal-amber/5 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-vytal-amber" />
                <div>
                  <p className="text-sm font-medium text-vytal-text">
                    {t("memberImport.duplicateDetected")}
                  </p>
                  <p className="mt-1 text-xs text-vytal-muted">
                    {duplicateCount} record(s) match existing members by email and will be skipped.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleImport}
              disabled={importing || readyCount === 0}
              className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-all hover:bg-vytal-green/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {importing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-vytal-bg border-t-transparent" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {importing ? t("memberImport.importing") : `Import ${readyCount} Members`}
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-2 rounded-lg border border-vytal-border px-6 py-2.5 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
            >
              {t("action.back")}
            </button>
          </div>
        </div>
      )}

      {/* Success */}
      {imported && (
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-vytal-green/10">
            <CheckCircle className="h-8 w-8 text-vytal-green" />
          </div>
          <h2 className="text-xl font-bold text-vytal-text">
            {t("memberImport.importComplete")}
          </h2>
          <p className="mt-2 text-sm text-vytal-muted">
            {importResult.created} members imported successfully.
          </p>

          {/* Import Summary */}
          <div className="mx-auto mt-4 flex max-w-sm justify-center gap-4">
            <div className="rounded-lg bg-vytal-green/10 px-4 py-2">
              <p className="text-lg font-bold text-vytal-green">{importResult.created}</p>
              <p className="text-[10px] text-vytal-muted">Created</p>
            </div>
            <div className="rounded-lg bg-vytal-amber/10 px-4 py-2">
              <p className="text-lg font-bold text-vytal-amber">{importResult.skipped}</p>
              <p className="text-[10px] text-vytal-muted">Skipped</p>
            </div>
            <div className="rounded-lg bg-vytal-red/10 px-4 py-2">
              <p className="text-lg font-bold text-vytal-red">{importResult.errors}</p>
              <p className="text-[10px] text-vytal-muted">Errors</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/members"
              className="rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-all hover:bg-vytal-green/90"
            >
              {t("memberImport.viewMembers")}
            </Link>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setFileName(null);
                setHeaders([]);
                setRows([]);
                setMappings([]);
                setImported(false);
                setImportResult({ created: 0, skipped: 0, errors: 0 });
              }}
              className="rounded-lg border border-vytal-border px-6 py-2.5 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
            >
              {t("memberImport.importMore")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
