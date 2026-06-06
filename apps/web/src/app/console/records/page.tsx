"use client";

import { useEffect, useState } from "react";
import { Trophy, TrendingUp, Plus, X, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataStore } from "@/stores/data-store";
import type { PersonalRecord } from "@vytal-fit/shared";

const EXTRA_PRS_KEY = "vytal-console-extra-prs";

interface LocalPR {
  id: string;
  exerciseName: string;
  value: string;
  unit: string;
  achievedAt: string;
  previousValue?: string;
}

function loadExtraPRs(): LocalPR[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(EXTRA_PRS_KEY);
    return raw ? (JSON.parse(raw) as LocalPR[]) : [];
  } catch {
    return [];
  }
}

function saveExtraPRs(prs: LocalPR[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(EXTRA_PRS_KEY, JSON.stringify(prs));
}

const UNIT_OPTIONS = ["kg", "lbs", "reps", "time", "metros", "calorias"];
const CATEGORY_ICONS: Record<string, string> = {
  weightlifting: "🏋️",
  gymnastics: "🤸",
  cardio: "🏃",
  strength: "💪",
  mobility: "🧘",
  other: "⚡",
};

// Simple sparkline SVG
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const W = 80;
  const H = 24;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    return `${x},${y}`;
  });
  return (
    <svg width={W} height={H} className="overflow-visible">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Last point dot */}
      {(() => {
        const last = pts[pts.length - 1].split(",");
        return (
          <circle cx={last[0]} cy={last[1]} r={3} fill={color} />
        );
      })()}
    </svg>
  );
}

export default function RecordsPage() {
  const { personalRecords, exercises } = useDataStore();
  const [mounted, setMounted] = useState(false);
  const [extraPRs, setExtraPRs] = useState<LocalPR[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Form state
  const [formExercise, setFormExercise] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formUnit, setFormUnit] = useState("kg");
  const [formPrev, setFormPrev] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    setExtraPRs(loadExtraPRs());
    setMounted(true);
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleAddPR(e: React.FormEvent) {
    e.preventDefault();
    if (!formExercise.trim() || !formValue.trim()) return;
    const pr: LocalPR = {
      id: `local-pr-${Date.now()}`,
      exerciseName: formExercise.trim(),
      value: formValue.trim(),
      unit: formUnit,
      achievedAt: formDate,
      previousValue: formPrev.trim() || undefined,
    };
    const updated = [pr, ...extraPRs];
    setExtraPRs(updated);
    saveExtraPRs(updated);
    setFormExercise("");
    setFormValue("");
    setFormPrev("");
    setFormUnit("kg");
    setFormDate(new Date().toISOString().split("T")[0]);
    setShowForm(false);
    showToast("Record pessoal adicionado!");
  }

  function deleteExtraPR(id: string) {
    const updated = extraPRs.filter((p) => p.id !== id);
    setExtraPRs(updated);
    saveExtraPRs(updated);
    showToast("Record removido");
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="w-6 h-6 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--color-vytal-green)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  const storePRs: PersonalRecord[] = personalRecords ?? [];

  // Sort store PRs
  const sortedStorePRs = [...storePRs].sort((a, b) => {
    if (sortBy === "date") {
      return sortDir === "desc"
        ? b.achievedAt.localeCompare(a.achievedAt)
        : a.achievedAt.localeCompare(b.achievedAt);
    }
    const nameA = a.exercise?.name ?? "";
    const nameB = b.exercise?.name ?? "";
    return sortDir === "desc"
      ? nameB.localeCompare(nameA)
      : nameA.localeCompare(nameB);
  });

  function toggleSort(field: "date" | "name") {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  }

  const SortIcon = ({ field }: { field: "date" | "name" }) => {
    if (sortBy !== field) return null;
    return sortDir === "desc" ? (
      <ChevronDown size={12} />
    ) : (
      <ChevronUp size={12} />
    );
  };

  // Group by exercise category for mini chart (numeric only)
  const numericPRs = sortedStorePRs.filter(
    (pr) => pr.unit === "kg" || pr.unit === "lbs" || pr.unit === "reps"
  );

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-16 left-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium text-[#080c0a] shadow-xl"
          style={{ background: "var(--color-vytal-green)" }}
        >
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--color-vytal-text)" }}>
            Records Pessoais
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-vytal-muted)" }}>
            {storePRs.length + extraPRs.length} records registados
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
          style={{ background: "var(--color-vytal-green)", color: "#080c0a" }}
        >
          <Plus size={14} />
          Novo PR
        </button>
      </div>

      {/* Add PR form */}
      {showForm && (
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
        >
          <p className="font-semibold text-sm" style={{ color: "var(--color-vytal-text)" }}>
            Adicionar novo record
          </p>
          <form onSubmit={handleAddPR} className="space-y-3">
            {/* Exercise name */}
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--color-vytal-muted)" }}>
                Exercicio
              </label>
              <input
                type="text"
                required
                placeholder="ex: Back Squat, Snatch, Fran..."
                value={formExercise}
                onChange={(e) => setFormExercise(e.target.value)}
                list="exercise-suggestions"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: "var(--color-vytal-bg3)",
                  color: "var(--color-vytal-text)",
                  border: "1px solid var(--color-vytal-border)",
                }}
              />
              <datalist id="exercise-suggestions">
                {(exercises ?? []).map((ex) => (
                  <option key={ex.id} value={ex.name} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Value */}
              <div>
                <label className="text-xs mb-1 block" style={{ color: "var(--color-vytal-muted)" }}>
                  Valor
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: 140"
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none font-mono"
                  style={{
                    background: "var(--color-vytal-bg3)",
                    color: "var(--color-vytal-text)",
                    border: "1px solid var(--color-vytal-border)",
                  }}
                />
              </div>
              {/* Unit */}
              <div>
                <label className="text-xs mb-1 block" style={{ color: "var(--color-vytal-muted)" }}>
                  Unidade
                </label>
                <select
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{
                    background: "var(--color-vytal-bg3)",
                    color: "var(--color-vytal-text)",
                    border: "1px solid var(--color-vytal-border)",
                  }}
                >
                  {UNIT_OPTIONS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Previous value */}
              <div>
                <label className="text-xs mb-1 block" style={{ color: "var(--color-vytal-muted)" }}>
                  Valor anterior (opcional)
                </label>
                <input
                  type="text"
                  placeholder="ex: 135"
                  value={formPrev}
                  onChange={(e) => setFormPrev(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none font-mono"
                  style={{
                    background: "var(--color-vytal-bg3)",
                    color: "var(--color-vytal-text)",
                    border: "1px solid var(--color-vytal-border)",
                  }}
                />
              </div>
              {/* Date */}
              <div>
                <label className="text-xs mb-1 block" style={{ color: "var(--color-vytal-muted)" }}>
                  Data
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{
                    background: "var(--color-vytal-bg3)",
                    color: "var(--color-vytal-text)",
                    border: "1px solid var(--color-vytal-border)",
                    colorScheme: "dark",
                  }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
                style={{ background: "var(--color-vytal-green)", color: "#080c0a" }}
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium"
                style={{ background: "var(--color-vytal-bg3)", color: "var(--color-vytal-muted)" }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Progress highlight — top 3 by improvement */}
      {numericPRs.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} style={{ color: "var(--color-vytal-green)" }} />
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-vytal-muted)" }}>
              Progresso de destaque
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {numericPRs.slice(0, 3).map((pr) => {
              const prev = pr.previousValue ? parseFloat(pr.previousValue) : null;
              const curr = parseFloat(pr.value);
              const diff = prev !== null && !isNaN(prev) && !isNaN(curr) ? curr - prev : null;
              const sparkValues = prev !== null && !isNaN(prev) ? [prev, curr] : [curr];

              return (
                <div
                  key={pr.id}
                  className="rounded-xl p-3 space-y-2"
                  style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
                >
                  <p className="text-[10px] font-medium leading-tight truncate" style={{ color: "var(--color-vytal-muted)" }}>
                    {pr.exercise?.name ?? "?"}
                  </p>
                  <div>
                    <p className="text-base font-bold font-mono" style={{ color: "var(--color-vytal-green)" }}>
                      {pr.value}
                      <span className="text-[10px] font-normal ml-0.5">{pr.unit}</span>
                    </p>
                    {diff !== null && (
                      <p className="text-[10px]" style={{ color: "var(--color-vytal-green)" }}>
                        +{diff > 0 ? diff.toFixed(1) : 0} {pr.unit}
                      </p>
                    )}
                  </div>
                  <Sparkline
                    values={sparkValues}
                    color="var(--color-vytal-green)"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sort controls */}
      <div className="flex items-center gap-3">
        <span className="text-xs" style={{ color: "var(--color-vytal-muted)" }}>Ordenar por:</span>
        {(["date", "name"] as const).map((field) => (
          <button
            key={field}
            onClick={() => toggleSort(field)}
            className="flex items-center gap-1 text-xs font-medium transition-colors"
            style={{ color: sortBy === field ? "var(--color-vytal-green)" : "var(--color-vytal-muted)" }}
          >
            {field === "date" ? "Data" : "Nome"}
            <SortIcon field={field} />
          </button>
        ))}
      </div>

      {/* PRs from store */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-vytal-muted)" }}>
          Todos os records
        </p>

        {sortedStorePRs.length === 0 && extraPRs.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
          >
            <Trophy size={24} className="mx-auto mb-2 opacity-40" style={{ color: "var(--color-vytal-muted)" }} />
            <p className="text-sm" style={{ color: "var(--color-vytal-muted)" }}>
              Sem records registados ainda.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Extra (locally added) PRs */}
            {extraPRs.map((pr) => (
              <div
                key={pr.id}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}
              >
                <Trophy size={16} style={{ color: "var(--color-vytal-green)" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--color-vytal-text)" }}>
                    {pr.exerciseName}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-vytal-muted)" }}>
                    {new Date(pr.achievedAt).toLocaleDateString("pt-PT", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {pr.previousValue && ` · anterior: ${pr.previousValue} ${pr.unit}`}
                  </p>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <p className="font-bold font-mono text-sm" style={{ color: "var(--color-vytal-green)" }}>
                      {pr.value}
                      <span className="text-xs font-normal ml-0.5" style={{ color: "var(--color-vytal-muted)" }}>
                        {pr.unit}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => deleteExtraPR(pr.id)}
                    className="p-1 rounded transition-opacity hover:opacity-70"
                    title="Remover"
                  >
                    <X size={12} style={{ color: "var(--color-vytal-muted)" }} />
                  </button>
                </div>
              </div>
            ))}

            {/* Store PRs */}
            {sortedStorePRs.map((pr) => {
              const prev = pr.previousValue ? parseFloat(pr.previousValue) : null;
              const curr = parseFloat(pr.value);
              const diff = prev !== null && !isNaN(prev) && !isNaN(curr) ? curr - prev : null;
              const categoryIcon = CATEGORY_ICONS[pr.exercise?.category ?? "other"] ?? "⚡";

              return (
                <div
                  key={pr.id}
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
                >
                  <span className="text-base flex-shrink-0">{categoryIcon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--color-vytal-text)" }}>
                      {pr.exercise?.name ?? pr.exerciseId}
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-vytal-muted)" }}>
                      {new Date(pr.achievedAt).toLocaleDateString("pt-PT", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {pr.previousValue && (
                        <span> · anterior: {pr.previousValue} {pr.unit}</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold font-mono text-sm" style={{ color: "var(--color-vytal-green)" }}>
                      {pr.value}
                      <span className="text-xs font-normal ml-0.5" style={{ color: "var(--color-vytal-muted)" }}>
                        {pr.unit}
                      </span>
                    </p>
                    {diff !== null && diff > 0 && (
                      <p className="text-[10px]" style={{ color: "var(--color-vytal-green)" }}>
                        +{diff.toFixed(1)} {pr.unit}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
