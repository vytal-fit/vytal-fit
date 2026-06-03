"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

const MOCK_CSV_PREVIEW = [
  ["Carlos Mendes", "carlos@email.com", "912111222", "123456789", "1990-05-15", "M", "Unlimited", "active"],
  ["Rita Sousa", "rita@email.com", "913222333", "234567890", "1988-11-20", "F", "3x/week", "active"],
  ["Bruno Pereira", "bruno@email.com", "914333444", "345678901", "1995-03-08", "M", "Unlimited", "trial"],
  ["Mariana Lopes", "mariana@email.com", "915444555", "", "1992-07-25", "F", "5x/week", "active"],
  ["Diogo Martins", "diogo@email.com", "916555666", "567890123", "1999-01-12", "M", "Unlimited", "active"],
];

const MOCK_HEADERS = ["nome", "email", "telefone", "nif", "nascimento", "sexo", "plano", "estado"];

type Step = 1 | 2 | 3;

export default function MemberImportPage() {
  const [step, setStep] = useState<Step>(1);
  const [fileName, setFileName] = useState<string | null>(null);
  const [mappings, setMappings] = useState<string[]>(
    MOCK_HEADERS.map((_, i) => FIELDS[i] ?? "-- Skip --")
  );
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);

  function handleFileDrop() {
    setFileName("members_export.csv");
    setStep(2);
  }

  function handleImport() {
    setImporting(true);
    setTimeout(() => {
      setImporting(false);
      setImported(true);
    }, 1500);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/members"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">Import Members</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            Upload a CSV or XLSX file to import members in bulk
          </p>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center gap-3">
        {[
          { num: 1 as Step, label: "Upload File" },
          { num: 2 as Step, label: "Map Columns" },
          { num: 3 as Step, label: "Preview & Import" },
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
          <button
            type="button"
            onClick={handleFileDrop}
            className="flex w-full cursor-pointer flex-col items-center gap-4 rounded-xl border-2 border-dashed border-vytal-border bg-vytal-card p-12 transition-colors hover:border-vytal-green/30"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-vytal-green/10">
              <Upload className="h-8 w-8 text-vytal-green" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-vytal-text">
                Drop your file here, or click to browse
              </p>
              <p className="mt-1 text-xs text-vytal-muted">
                Supports .csv and .xlsx files
              </p>
            </div>
          </button>

          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-vytal-border px-4 py-2.5 text-sm text-vytal-text transition-colors hover:bg-vytal-bg3"
          >
            <Download className="h-4 w-4" />
            Download Template
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
                {MOCK_CSV_PREVIEW.length} rows detected
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-vytal-border">
                    {MOCK_HEADERS.map((header, i) => (
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
                            className="w-full rounded border border-vytal-border bg-vytal-bg2 px-2 py-1 text-xs text-vytal-text focus:border-vytal-green/30 focus:outline-none"
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
                  {MOCK_CSV_PREVIEW.map((row, ri) => (
                    <tr
                      key={ri}
                      className="bg-vytal-card transition-colors hover:bg-vytal-bg3"
                    >
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className="px-3 py-2 text-xs text-vytal-text"
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
              Continue
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-2 rounded-lg border border-vytal-border px-6 py-2.5 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
            >
              Back
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
                  <p className="text-2xl font-bold text-vytal-text">5</p>
                  <p className="text-xs text-vytal-muted">Ready to import</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-amber/10">
                  <AlertTriangle className="h-5 w-5 text-vytal-amber" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-vytal-text">1</p>
                  <p className="text-xs text-vytal-muted">
                    Possible duplicate
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
                  <p className="text-2xl font-bold text-vytal-text">8</p>
                  <p className="text-xs text-vytal-muted">Columns mapped</p>
                </div>
              </div>
            </div>
          </div>

          {/* Warnings */}
          <div className="rounded-xl border border-vytal-amber/20 bg-vytal-amber/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-vytal-amber shrink-0" />
              <div>
                <p className="text-sm font-medium text-vytal-text">
                  Possible duplicate detected
                </p>
                <p className="mt-1 text-xs text-vytal-muted">
                  &quot;Carlos Mendes&quot; (carlos@email.com) may already exist
                  in your members database. The record will be skipped if a
                  matching email is found.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleImport}
              disabled={importing}
              className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-all hover:bg-vytal-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-vytal-bg border-t-transparent" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {importing ? "Importing..." : "Import 5 Members"}
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-2 rounded-lg border border-vytal-border px-6 py-2.5 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
            >
              Back
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
            Import Complete
          </h2>
          <p className="mt-2 text-sm text-vytal-muted">
            5 new members have been successfully imported.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/members"
              className="rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-all hover:bg-vytal-green/90"
            >
              View Members
            </Link>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setFileName(null);
                setImported(false);
              }}
              className="rounded-lg border border-vytal-border px-6 py-2.5 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
            >
              Import More
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
