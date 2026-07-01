"use client";

import { useState } from "react";
import { Trophy, TrendingUp, Plus, X, ChevronUp, ChevronDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";

const UNIT_OPTIONS = ["kg", "lbs", "reps", "time", "meters", "calories"] as const;
type Unit = (typeof UNIT_OPTIONS)[number];

const CATEGORY_CONFIG: Record<string, { emoji: string; color: string; bg: string }> = {
  weightlifting: { emoji: "🏋️", color: "var(--color-vytal-amber)",  bg: "rgba(255,179,0,0.1)" },
  gymnastics:    { emoji: "🤸", color: "var(--color-vytal-purple)", bg: "rgba(192,132,252,0.1)" },
  cardio:        { emoji: "🏃", color: "var(--color-vytal-blue)",   bg: "rgba(0,212,255,0.1)" },
  strength:      { emoji: "💪", color: "var(--color-vytal-green)",  bg: "rgba(34,197,94,0.1)" },
  mobility:      { emoji: "🧘", color: "var(--color-vytal-orange)", bg: "rgba(255,140,66,0.1)" },
  other:         { emoji: "⚡", color: "var(--color-vytal-green)",  bg: "rgba(34,197,94,0.08)" },
};

function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const W = 64;
  const H = 20;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    return `${x},${y}`;
  });
  const last = pts[pts.length - 1].split(",");
  return (
    <svg width={W} height={H} className="overflow-visible">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.6}
      />
      <circle cx={last[0]} cy={last[1]} r={2.5} fill={color} />
    </svg>
  );
}

export default function RecordsPage() {
  const { t } = useI18n();
  const utils = trpc.useUtils();

  const meQuery = trpc.members.me.useQuery();
  const memberId = meQuery.data?.id ?? null;

  const prQuery = trpc.personalRecords.list.useQuery(
    { memberId: memberId ?? "" },
    { enabled: !!memberId },
  );
  const exercisesQuery = trpc.exercises.list.useQuery();

  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [formExerciseId, setFormExerciseId] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formUnit, setFormUnit] = useState<Unit>("kg");
  const [formPrev, setFormPrev] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);

  const create = trpc.personalRecords.create.useMutation({
    onSuccess: async () => {
      setToast(t("my.records.toastAdded"));
      setTimeout(() => setToast(null), 3000);
      setShowForm(false);
      setFormExerciseId("");
      setFormValue("");
      setFormPrev("");
      setFormUnit("kg");
      setFormDate(new Date().toISOString().split("T")[0]);
      await utils.personalRecords.list.invalidate();
    },
  });

  function handleAddPR(e: React.FormEvent) {
    e.preventDefault();
    if (!memberId || !formExerciseId || !formValue.trim()) return;
    create.mutate({
      memberId,
      exerciseId: formExerciseId,
      value: formValue.trim(),
      unit: formUnit,
      previousValue: formPrev.trim() || undefined,
      achievedAt: new Date(formDate),
    });
  }

  function toggleSort(field: "date" | "name") {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  }

  const loading = meQuery.isLoading || (!!memberId && prQuery.isLoading);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--color-vytal-green)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  const storePRs = prQuery.data?.items ?? [];
  const exercises = exercisesQuery.data ?? [];

  const sortedStorePRs = [...storePRs].sort((a, b) => {
    if (sortBy === "date") {
      const da = new Date(a.achievedAt).getTime();
      const db = new Date(b.achievedAt).getTime();
      return sortDir === "desc" ? db - da : da - db;
    }
    const nameA = a.exercise?.name ?? "";
    const nameB = b.exercise?.name ?? "";
    return sortDir === "desc"
      ? nameB.localeCompare(nameA)
      : nameA.localeCompare(nameB);
  });

  const numericPRs = sortedStorePRs.filter(
    (pr) => pr.unit === "kg" || pr.unit === "lbs" || pr.unit === "reps"
  );

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-20 left-4 right-4 z-50 rounded-2xl px-4 py-3 text-sm font-semibold shadow-2xl animate-slide-in-right flex items-center gap-2"
          style={{ background: "var(--color-vytal-green)", color: "var(--color-vytal-bg)" }}
        >
          <Trophy size={15} />
          {toast}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "var(--color-vytal-text)" }}>
            {t("my.records.title")}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-vytal-muted)" }}>
            {storePRs.length} {t("my.records.count")}
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 hover:scale-105"
          style={{ background: "var(--color-vytal-green)", color: "var(--color-vytal-bg)" }}
        >
          <Plus size={14} />
          {t("my.records.addPr")}
        </button>
      </div>

      {/* ── Add PR modal-like form ── */}
      {showForm && (
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{
            background: "var(--color-vytal-bg2)",
            border: "1px solid rgba(34,197,94,0.3)",
            boxShadow: "0 0 40px rgba(34,197,94,0.07)",
          }}
        >
          <div className="flex items-center justify-between">
            <p className="font-black text-base" style={{ color: "var(--color-vytal-text)" }}>
              {t("my.records.addTitle")}
            </p>
            <button
              onClick={() => setShowForm(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
              style={{ background: "var(--color-vytal-bg3)" }}
            >
              <X size={13} style={{ color: "var(--color-vytal-muted)" }} />
            </button>
          </div>
          <form onSubmit={handleAddPR} className="space-y-4">
            {/* Exercise name */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "var(--color-vytal-muted)" }}>
                {t("my.records.exercise")}
              </label>
              <select
                required
                value={formExerciseId}
                onChange={(e) => setFormExerciseId(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{
                  background: "var(--color-vytal-bg3)",
                  color: "var(--color-vytal-text)",
                  border: "1px solid var(--color-vytal-border)",
                }}
              >
                <option value="" disabled>{t("my.records.exercisePlaceholder")}</option>
                {exercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "var(--color-vytal-muted)" }}>
                  {t("my.records.value")}
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: 140"
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none font-mono"
                  style={{
                    background: "var(--color-vytal-bg3)",
                    color: "var(--color-vytal-text)",
                    border: "1px solid var(--color-vytal-border)",
                  }}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "var(--color-vytal-muted)" }}>
                  {t("my.records.unit")}
                </label>
                <select
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value as Unit)}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
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
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "var(--color-vytal-muted)" }}>
                  {t("my.records.previousValue")}
                </label>
                <input
                  type="text"
                  placeholder="ex: 135"
                  value={formPrev}
                  onChange={(e) => setFormPrev(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none font-mono"
                  style={{
                    background: "var(--color-vytal-bg3)",
                    color: "var(--color-vytal-text)",
                    border: "1px solid var(--color-vytal-border)",
                  }}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "var(--color-vytal-muted)" }}>
                  {t("my.records.date")}
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{
                    background: "var(--color-vytal-bg3)",
                    color: "var(--color-vytal-text)",
                    border: "1px solid var(--color-vytal-border)",
                    colorScheme: "dark",
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={create.isPending}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.01] hover:opacity-90 disabled:opacity-60"
              style={{ background: "var(--color-vytal-green)", color: "var(--color-vytal-bg)" }}
            >
              {t("my.records.save")}
            </button>
          </form>
        </div>
      )}

      {/* ── Top 3 progress highlights ── */}
      {numericPRs.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={13} style={{ color: "var(--color-vytal-green)" }} />
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--color-vytal-muted)" }}>
              {t("my.records.progressHighlight")}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {numericPRs.slice(0, 3).map((pr) => {
              const prev = pr.previousValue ? parseFloat(pr.previousValue) : null;
              const curr = parseFloat(pr.value);
              const diff = prev !== null && !isNaN(prev) && !isNaN(curr) ? curr - prev : null;
              const sparkValues = prev !== null && !isNaN(prev) ? [prev, curr] : [curr];
              const cat = CATEGORY_CONFIG[pr.exercise?.category ?? "other"] ?? CATEGORY_CONFIG.other;

              return (
                <div
                  key={pr.id}
                  className="rounded-2xl p-3.5 space-y-2 transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: cat.bg,
                    border: `1px solid ${cat.color}33`,
                  }}
                >
                  <p className="text-[10px] font-bold leading-tight truncate" style={{ color: "var(--color-vytal-muted)" }}>
                    {pr.exercise?.name ?? "?"}
                  </p>
                  <div>
                    <p className="text-xl font-black font-mono leading-none" style={{ color: cat.color }}>
                      {pr.value}
                      <span className="text-[10px] font-normal ml-1">{pr.unit}</span>
                    </p>
                    {diff !== null && diff > 0 && (
                      <p className="text-[10px] font-bold mt-0.5" style={{ color: cat.color }}>
                        +{diff.toFixed(1)} {pr.unit}
                      </p>
                    )}
                  </div>
                  <Sparkline values={sparkValues} color={cat.color} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Sort controls ── */}
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--color-vytal-muted)" }}>
          {t("my.records.sortBy")}
        </span>
        {(["date", "name"] as const).map((field) => (
          <button
            key={field}
            onClick={() => toggleSort(field)}
            className="flex items-center gap-1 text-xs font-bold transition-all duration-200 hover:scale-105"
            style={{ color: sortBy === field ? "var(--color-vytal-green)" : "var(--color-vytal-muted)" }}
          >
            {field === "date" ? t("my.records.sortDate") : t("my.records.sortName")}
            {sortBy === field && (
              sortDir === "desc"
                ? <ChevronDown size={11} />
                : <ChevronUp size={11} />
            )}
          </button>
        ))}
      </div>

      {/* ── PR list ── */}
      <div className="space-y-2">
        {sortedStorePRs.length === 0 ? (
          <div
            className="rounded-2xl p-10 flex flex-col items-center gap-4 text-center"
            style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
          >
            <Trophy size={36} style={{ color: "var(--color-vytal-muted)", opacity: 0.3 }} />
            <div>
              <p className="font-bold" style={{ color: "var(--color-vytal-text)" }}>
                {t("my.records.empty")}
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--color-vytal-muted)" }}>
                {t("my.records.addFirst")}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Store PRs */}
            {sortedStorePRs.map((pr) => {
              const prev = pr.previousValue ? parseFloat(pr.previousValue) : null;
              const curr = parseFloat(pr.value);
              const diff = prev !== null && !isNaN(prev) && !isNaN(curr) ? curr - prev : null;
              const cat = CATEGORY_CONFIG[pr.exercise?.category ?? "other"] ?? CATEGORY_CONFIG.other;

              return (
                <div
                  key={pr.id}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-200 hover:scale-[1.01]"
                  style={{
                    background: "var(--color-vytal-bg2)",
                    border: "1px solid var(--color-vytal-border)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base"
                    style={{ background: cat.bg }}
                  >
                    {cat.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: "var(--color-vytal-text)" }}>
                      {pr.exercise?.name ?? pr.exerciseId}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--color-vytal-muted)" }}>
                      {new Date(pr.achievedAt).toLocaleDateString("pt-PT", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {pr.previousValue && (
                        <span> · {t("my.records.previous")}: {pr.previousValue} {pr.unit}</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className="font-black font-mono text-base"
                      style={{ color: cat.color }}
                    >
                      {pr.value}
                      <span className="text-xs font-normal ml-1" style={{ color: "var(--color-vytal-muted)" }}>
                        {pr.unit}
                      </span>
                    </p>
                    {diff !== null && diff > 0 && (
                      <p className="text-[10px] font-bold" style={{ color: cat.color }}>
                        +{diff.toFixed(1)} {pr.unit}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
