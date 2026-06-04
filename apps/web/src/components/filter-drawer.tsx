"use client";

import { useState } from "react";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export interface FilterField {
  key: string;
  label: string;
  type: "select" | "multiselect" | "daterange" | "search" | "toggle";
  options?: { value: string; label: string }[];
}

interface FilterDrawerProps {
  fields: FilterField[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  onClear: () => void;
  activeCount: number;
}

function MultiSelect({
  field,
  value,
  onChange,
}: {
  field: FilterField;
  value: string[];
  onChange: (val: string[]) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium uppercase tracking-wider text-vytal-muted">
        {field.label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {field.options?.map((opt) => {
          const selected = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => {
                if (selected) {
                  onChange(value.filter((v) => v !== opt.value));
                } else {
                  onChange([...value, opt.value]);
                }
              }}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                selected
                  ? "bg-vytal-green/10 text-vytal-green"
                  : "bg-vytal-bg3 text-vytal-muted hover:text-vytal-text"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SelectField({
  field,
  value,
  onChange,
}: {
  field: FilterField;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium uppercase tracking-wider text-vytal-muted">
        {field.label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
      >
        <option value="">All</option>
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function DateRangeField({
  field,
  value,
  onChange,
}: {
  field: FilterField;
  value: { from: string; to: string };
  onChange: (val: { from: string; to: string }) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium uppercase tracking-wider text-vytal-muted">
        {field.label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={value.from}
          onChange={(e) => onChange({ ...value, from: e.target.value })}
          className="flex-1 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
        />
        <span className="text-xs text-vytal-muted">-</span>
        <input
          type="date"
          value={value.to}
          onChange={(e) => onChange({ ...value, to: e.target.value })}
          className="flex-1 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
        />
      </div>
    </div>
  );
}

function SearchField({
  field,
  value,
  onChange,
}: {
  field: FilterField;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium uppercase tracking-wider text-vytal-muted">
        {field.label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Search ${field.label.toLowerCase()}...`}
        className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
      />
    </div>
  );
}

function ToggleField({
  field,
  value,
  onChange,
}: {
  field: FilterField;
  value: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
        {field.label}
      </label>
      <button
        onClick={() => onChange(!value)}
        className={cn(
          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
          value ? "bg-vytal-green" : "bg-vytal-bg3"
        )}
      >
        <span
          className={cn(
            "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform",
            value ? "translate-x-4" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}

export function FilterDrawer({
  fields,
  values,
  onChange,
  onClear,
  activeCount,
}: FilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  // Build active pills from values
  const activePills: { key: string; label: string; displayValue: string }[] = [];
  for (const field of fields) {
    const val = values[field.key];
    if (!val) continue;
    if (field.type === "multiselect" && Array.isArray(val) && val.length > 0) {
      const labels = val
        .map((v: string) => field.options?.find((o) => o.value === v)?.label ?? v)
        .join(", ");
      activePills.push({ key: field.key, label: field.label, displayValue: labels });
    } else if (field.type === "select" && typeof val === "string" && val) {
      const optLabel = field.options?.find((o) => o.value === val)?.label ?? val;
      activePills.push({ key: field.key, label: field.label, displayValue: optLabel });
    } else if (field.type === "daterange" && typeof val === "object" && val !== null) {
      const dr = val as { from: string; to: string };
      if (dr.from || dr.to) {
        activePills.push({
          key: field.key,
          label: field.label,
          displayValue: `${dr.from || "..."} - ${dr.to || "..."}`,
        });
      }
    } else if (field.type === "search" && typeof val === "string" && val) {
      activePills.push({ key: field.key, label: field.label, displayValue: val });
    } else if (field.type === "toggle" && val === true) {
      activePills.push({ key: field.key, label: field.label, displayValue: "Yes" });
    }
  }

  return (
    <div className="space-y-3">
      {/* Toggle Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
          activeCount > 0
            ? "border-vytal-green/30 bg-vytal-green/5 text-vytal-green"
            : "border-vytal-border text-vytal-muted hover:text-vytal-text"
        )}
      >
        <Filter className="h-4 w-4" />
        {t("action.filter")}
        {activeCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-vytal-green text-[10px] font-bold text-vytal-bg">
            {activeCount}
          </span>
        )}
        {open ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Drawer content */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-vytal-text">
              {t("action.filter")}
            </span>
            {activeCount > 0 && (
              <button
                onClick={onClear}
                className="text-xs font-medium text-vytal-muted transition-colors hover:text-vytal-red"
              >
                {t("members.clearFilters")}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map((field) => {
              const val = values[field.key];
              switch (field.type) {
                case "multiselect":
                  return (
                    <MultiSelect
                      key={field.key}
                      field={field}
                      value={(val as string[]) ?? []}
                      onChange={(v) => onChange(field.key, v)}
                    />
                  );
                case "select":
                  return (
                    <SelectField
                      key={field.key}
                      field={field}
                      value={(val as string) ?? ""}
                      onChange={(v) => onChange(field.key, v)}
                    />
                  );
                case "daterange":
                  return (
                    <DateRangeField
                      key={field.key}
                      field={field}
                      value={(val as { from: string; to: string }) ?? { from: "", to: "" }}
                      onChange={(v) => onChange(field.key, v)}
                    />
                  );
                case "search":
                  return (
                    <SearchField
                      key={field.key}
                      field={field}
                      value={(val as string) ?? ""}
                      onChange={(v) => onChange(field.key, v)}
                    />
                  );
                case "toggle":
                  return (
                    <ToggleField
                      key={field.key}
                      field={field}
                      value={(val as boolean) ?? false}
                      onChange={(v) => onChange(field.key, v)}
                    />
                  );
                default:
                  return null;
              }
            })}
          </div>
        </div>
      </div>

      {/* Active filter pills (shown when drawer is collapsed) */}
      {!open && activePills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activePills.map((pill) => (
            <span
              key={pill.key}
              className="inline-flex items-center gap-1.5 rounded-full bg-vytal-green/10 px-3 py-1 text-xs font-medium text-vytal-green"
            >
              <span className="text-vytal-green/60">{pill.label}:</span>
              {pill.displayValue}
              <button
                onClick={() => {
                  const field = fields.find((f) => f.key === pill.key);
                  if (!field) return;
                  if (field.type === "multiselect") onChange(pill.key, []);
                  else if (field.type === "daterange") onChange(pill.key, { from: "", to: "" });
                  else if (field.type === "toggle") onChange(pill.key, false);
                  else onChange(pill.key, "");
                }}
                className="ml-0.5 text-vytal-green/60 transition-colors hover:text-vytal-green"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
