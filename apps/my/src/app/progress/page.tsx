"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Target, Trophy, Calendar, CheckCircle, Edit2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

// ── Types ────────────────────────────────────────────────────────────────────

interface BodyEntry {
  month: string;
  weight: number;
  bodyFat?: number;
}

interface Goal {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: string;
}

interface PREntry {
  exercise: string;
  value: string;
  unit: string;
  date: string;
  isNew?: boolean;
}

// ── Storage keys ──────────────────────────────────────────────────────────────
const GOALS_KEY = "vytal-progress-goals";

// ── Mock data ─────────────────────────────────────────────────────────────────

const DEFAULT_GOALS: Goal[] = [
  { id: "g1", label: "Check-ins este mes",     current: 17, target: 20, unit: "treinos" },
  { id: "g2", label: "Back Squat",             current: 95, target: 120, unit: "kg" },
  { id: "g3", label: "Sequencia de semanas",   current: 8,  target: 12,  unit: "semanas" },
];

const DEFAULT_BODY: BodyEntry[] = [
  { month: "Jan", weight: 84.0, bodyFat: 18.5 },
  { month: "Fev", weight: 83.2, bodyFat: 17.8 },
  { month: "Mar", weight: 82.5, bodyFat: 17.2 },
  { month: "Abr", weight: 81.8, bodyFat: 16.5 },
  { month: "Mai", weight: 81.0, bodyFat: 15.9 },
  { month: "Jun", weight: 80.4, bodyFat: 15.4 },
];

const PR_TIMELINE: PREntry[] = [
  { exercise: "Back Squat",    value: "95",  unit: "kg",   date: "2026-06-04", isNew: true },
  { exercise: "Clean & Jerk", value: "80",  unit: "kg",   date: "2026-05-28" },
  { exercise: "Deadlift",      value: "140", unit: "kg",   date: "2026-05-15" },
  { exercise: "Snatch",        value: "60",  unit: "kg",   date: "2026-05-03" },
  { exercise: "FRAN",          value: "4:32","unit": "min", date: "2026-04-22" },
  { exercise: "Pull-Up",       value: "18",  unit: "reps", date: "2026-04-10" },
  { exercise: "Press",         value: "70",  unit: "kg",   date: "2026-03-28" },
];

function loadGoals(): Goal[] {
  if (typeof window === "undefined") return DEFAULT_GOALS;
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    return raw ? (JSON.parse(raw) as Goal[]) : DEFAULT_GOALS;
  } catch {
    return DEFAULT_GOALS;
  }
}

function saveGoals(goals: Goal[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function BarChart({ data }: { data: BodyEntry[] }) {
  const maxWeight = Math.max(...data.map((d) => d.weight));
  const minWeight = Math.min(...data.map((d) => d.weight));
  const range = maxWeight - minWeight || 1;

  return (
    <div className="flex items-end gap-1.5 h-24 mt-2">
      {data.map((d, i) => {
        const heightPct = 30 + ((d.weight - minWeight) / range) * 70;
        const isLatest = i === data.length - 1;
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
            <span className={cn("text-[9px] font-bold tabular-nums", isLatest ? "text-vytal-green" : "text-vytal-muted")}>
              {d.weight}
            </span>
            <div className="w-full flex items-end" style={{ height: "56px" }}>
              <div
                className="w-full rounded-t-lg transition-all duration-500"
                style={{
                  height: `${heightPct}%`,
                  background: isLatest
                    ? "var(--color-vytal-green)"
                    : "rgba(34,197,94,0.25)",
                  minHeight: "6px",
                }}
              />
            </div>
            <span className="text-[9px] font-medium text-vytal-muted">
              {d.month}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MonthCalendar() {
  const [trainingDays] = useState<Set<number>>(() => {
    // Mock: random training days for current month
    return new Set([1, 3, 5, 6, 8, 10, 12, 13, 15, 17, 19, 20, 22, 24, 26, 27]);
  });

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const today = now.getDate();

  const DAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

  return (
    <div>
      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="text-center text-[9px] font-bold uppercase text-vytal-muted">
            {d}
          </div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {Array.from({ length: firstDow }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const trained = trainingDays.has(day);
          const isToday = day === today;
          const isFuture = day > today;
          return (
            <div
              key={day}
              className={cn(
                "aspect-square rounded-lg flex items-center justify-center text-[10px] font-semibold transition-all duration-200",
                isToday ? "ring-2" : "",
                isFuture ? "opacity-30" : ""
              )}
              style={{
                background: trained
                  ? "rgba(34,197,94,0.2)"
                  : isToday
                  ? "var(--color-vytal-bg3)"
                  : "transparent",
                boxShadow: isToday ? "0 0 0 2px var(--color-vytal-green)" : "none",
                color: trained
                  ? "var(--color-vytal-green)"
                  : "var(--color-vytal-muted)",
              }}
            >
              {trained ? (
                <CheckCircle size={10} strokeWidth={2.5} />
              ) : (
                <span>{day}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GoalCard({
  goal,
  onUpdate,
  labelDone,
}: {
  goal: Goal;
  onUpdate: (id: string, current: number) => void;
  labelDone: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(goal.current));
  const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
  const isComplete = pct >= 100;

  function commit() {
    const val = parseFloat(draft);
    if (!isNaN(val) && val >= 0) onUpdate(goal.id, val);
    setEditing(false);
  }

  return (
    <div
      className={cn(
        "rounded-2xl p-4 space-y-3 transition-all duration-200 hover:scale-[1.01] bg-vytal-bg2 border",
        isComplete ? "border-[rgba(34,197,94,0.35)]" : "border-vytal-border"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-bold leading-snug text-vytal-text">
          {goal.label}
        </p>
        {isComplete ? (
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg shrink-0 bg-[rgba(34,197,94,0.15)] text-vytal-green">
            {labelDone}
          </span>
        ) : (
          <button
            onClick={() => { setDraft(String(goal.current)); setEditing(true); }}
            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 hover:scale-110 bg-vytal-bg3"
          >
            <Edit2 size={11} className="text-vytal-muted" />
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div>
        <div className="h-2 rounded-full overflow-hidden bg-vytal-bg3">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: isComplete
                ? "var(--color-vytal-green)"
                : "linear-gradient(90deg, var(--color-vytal-green), rgba(34,197,94,0.6))",
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          {editing ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                type="number"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
                className="w-20 rounded-lg px-2 py-1 text-xs font-mono outline-none bg-vytal-bg3 text-vytal-text border border-vytal-green"
              />
              <button onClick={commit} className="w-6 h-6 rounded-md flex items-center justify-center bg-[rgba(34,197,94,0.15)]">
                <Check size={10} className="text-vytal-green" />
              </button>
              <button onClick={() => setEditing(false)} className="w-6 h-6 rounded-md flex items-center justify-center bg-vytal-bg3">
                <X size={10} className="text-vytal-muted" />
              </button>
            </div>
          ) : (
            <span className="text-xs font-semibold tabular-nums text-vytal-muted">
              {goal.current} / {goal.target} {goal.unit}
            </span>
          )}
          <span
            className={cn("text-xs font-black tabular-nums", isComplete ? "text-vytal-green" : "text-vytal-muted")}
          >
            {pct}%
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [goals, setGoals] = useState<Goal[]>(DEFAULT_GOALS);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setGoals(loadGoals());
    setMounted(true);
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function updateGoal(id: string, current: number) {
    setGoals((prev) => {
      const updated = prev.map((g) => (g.id === id ? { ...g, current } : g));
      saveGoals(updated);
      return updated;
    });
    showToast(t("my.progress.toastGoalUpdated"));
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 animate-spin border-vytal-green border-t-transparent" />
      </div>
    );
  }

  // Summary stats
  const checkInsThisMonth = 17;
  const prsThisMonth = 3;
  const classesAttended = 17;

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-4 right-4 z-50 rounded-2xl px-4 py-3 text-sm font-semibold shadow-2xl flex items-center gap-2 transition-all duration-300 bg-vytal-green text-vytal-bg">
          <Target size={14} />
          {toast}
        </div>
      )}

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-black text-vytal-text">
          {t("my.progress.title")}
        </h1>
        <p className="text-xs mt-0.5 text-vytal-muted">
          {t("my.progress.subtitle")}
        </p>
      </div>

      {/* ── Month summary ── */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.03) 100%)",
          border: "1px solid rgba(34,197,94,0.2)",
        }}
      >
        <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-vytal-muted">
          {t("my.progress.monthSummary")}
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: checkInsThisMonth,  label: t("my.progress.checkins"),  color: "var(--color-vytal-green)" },
            { value: prsThisMonth,       label: t("my.progress.prs"),       color: "var(--color-vytal-amber)" },
            { value: classesAttended,    label: t("my.progress.classes"),   color: "var(--color-vytal-blue)" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-black tabular-nums" style={{ color: s.color }}>
                {s.value}
              </p>
              <p className="text-[10px] font-semibold mt-0.5 text-vytal-muted">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ── Body comp chart ── */}
        <div className="rounded-2xl p-5 bg-vytal-bg2 border border-vytal-border">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={13} className="text-vytal-green" />
            <p className="text-[10px] font-black uppercase tracking-widest text-vytal-muted">
              {t("my.progress.bodyWeight")}
            </p>
          </div>
          <div className="flex items-center gap-3 mb-1">
            <p className="text-3xl font-black tabular-nums text-vytal-green">
              {DEFAULT_BODY[DEFAULT_BODY.length - 1].weight}
            </p>
            <div>
              <p className="text-xs font-bold text-vytal-green">
                -{(DEFAULT_BODY[0].weight - DEFAULT_BODY[DEFAULT_BODY.length - 1].weight).toFixed(1)} kg
              </p>
              <p className="text-[10px] text-vytal-muted">
                {t("my.progress.sinceJan")}
              </p>
            </div>
          </div>
          <BarChart data={DEFAULT_BODY} />
        </div>

        {/* ── Monthly training calendar ── */}
        <div className="rounded-2xl p-5 bg-vytal-bg2 border border-vytal-border">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={13} className="text-vytal-green" />
            <p className="text-[10px] font-black uppercase tracking-widest text-vytal-muted">
              {t("my.progress.trainingCalendar")}
            </p>
          </div>
          <MonthCalendar />
          <p className="text-[10px] mt-3 text-vytal-muted">
            <span className="font-bold text-vytal-green">16</span> {t("my.progress.trainingDays")}
          </p>
        </div>
      </div>

      {/* ── Goals ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target size={13} className="text-vytal-green" />
          <p className="text-[10px] font-black uppercase tracking-widest text-vytal-muted">
            {t("my.progress.goals")}
          </p>
        </div>
        <div className="space-y-2">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onUpdate={updateGoal} labelDone={t("my.progress.goalDone")} />
          ))}
        </div>
      </div>

      {/* ── PR timeline ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={13} className="text-vytal-amber" />
          <p className="text-[10px] font-black uppercase tracking-widest text-vytal-muted">
            {t("my.progress.prTimeline")}
          </p>
        </div>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-2 bottom-2 w-px bg-vytal-border" />
          <div className="space-y-2 pl-10">
            {PR_TIMELINE.map((pr, i) => (
              <div
                key={i}
                className="relative rounded-2xl px-4 py-3 flex items-center gap-3 transition-all duration-200 hover:scale-[1.01]"
                style={{
                  background: pr.isNew ? "rgba(34,197,94,0.08)" : "var(--color-vytal-bg2)",
                  border: pr.isNew ? "1px solid rgba(34,197,94,0.25)" : "1px solid var(--color-vytal-border)",
                }}
              >
                {/* Dot on timeline */}
                <div
                  className="absolute -left-[26px] w-3 h-3 rounded-full border-2 shrink-0"
                  style={{
                    background: pr.isNew ? "var(--color-vytal-green)" : "var(--color-vytal-bg3)",
                    borderColor: pr.isNew ? "var(--color-vytal-green)" : "var(--color-vytal-border)",
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-vytal-text">
                      {pr.exercise}
                    </p>
                    {pr.isNew && (
                      <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-[rgba(34,197,94,0.15)] text-vytal-green">
                        {t("my.progress.prNew")}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] mt-0.5 text-vytal-muted">
                    {new Date(pr.date).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={cn("font-black font-mono text-lg tabular-nums", pr.isNew ? "text-vytal-green" : "text-vytal-amber")}
                  >
                    {pr.value}
                    <span className="text-xs font-normal ml-1 text-vytal-muted">
                      {pr.unit}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
