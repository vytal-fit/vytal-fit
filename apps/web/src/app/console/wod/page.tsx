"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  Dumbbell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataStore } from "@/stores/data-store";
import { useI18n } from "@/lib/i18n";
import type { WOD } from "@vytal-fit/shared";

const WOD_TYPE_LABELS: Record<string, { labelKey: string; color: string }> = {
  amrap:    { labelKey: "AMRAP",                    color: "var(--color-vytal-green)" },
  emom:     { labelKey: "EMOM",                     color: "var(--color-vytal-blue)" },
  for_time: { labelKey: "For Time",                 color: "var(--color-vytal-amber)" },
  tabata:   { labelKey: "Tabata",                   color: "var(--color-vytal-purple)" },
  strength: { labelKey: "my.wod.type.strength",     color: "var(--color-vytal-orange)" },
  custom:   { labelKey: "Custom",                   color: "var(--color-vytal-muted)" },
};

const SCORE_TYPE_KEYS = [
  { value: "time",        key: "my.wod.score.time" },
  { value: "rounds_reps", key: "my.wod.score.roundsReps" },
  { value: "reps",        key: "my.wod.score.reps" },
  { value: "weight",      key: "my.wod.score.weight" },
  { value: "distance",    key: "my.wod.score.distance" },
  { value: "calories",    key: "my.wod.score.calories" },
];

const LOG_KEY = "vytal-console-wod-logs";

interface WODLog {
  wodId: string;
  wodTitle: string;
  date: string;
  score: string;
  scoreType: string;
  scale: "rx" | "scaled" | "rx_plus";
  notes: string;
  loggedAt: string;
}

function loadLogs(): WODLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? (JSON.parse(raw) as WODLog[]) : [];
  } catch {
    return [];
  }
}

function saveLogs(logs: WODLog[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOG_KEY, JSON.stringify(logs));
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Circular progress SVG
function CircularTimer({
  seconds,
  total,
  running,
  labelRunning,
  labelFinished,
  labelPaused,
}: {
  seconds: number;
  total: number;
  running: boolean;
  labelRunning: string;
  labelFinished: string;
  labelPaused: string;
}) {
  const radius = 72;
  const circ = 2 * Math.PI * radius;
  const pct = total > 0 ? seconds / total : 0;
  const offset = circ * (1 - pct);

  const color =
    seconds === 0
      ? "var(--color-vytal-red)"
      : seconds < 60
      ? "var(--color-vytal-amber)"
      : "var(--color-vytal-green)";

  return (
    <div className="relative flex items-center justify-center" style={{ width: 176, height: 176 }}>
      <svg width={176} height={176} className="absolute -rotate-90">
        {/* Track */}
        <circle
          cx={88}
          cy={88}
          r={radius}
          fill="none"
          stroke="var(--color-vytal-bg3)"
          strokeWidth={8}
        />
        {/* Progress */}
        <circle
          cx={88}
          cy={88}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
        />
      </svg>
      <div className="flex flex-col items-center gap-1 z-10">
        <span
          className="text-5xl font-black tabular-nums"
          style={{
            color,
            fontFamily: "var(--font-mono)",
          }}
        >
          {formatTime(seconds)}
        </span>
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: running ? color : "var(--color-vytal-muted)" }}
        >
          {running ? labelRunning : seconds === 0 ? labelFinished : labelPaused}
        </span>
      </div>
    </div>
  );
}

export default function WODPage() {
  const { wods } = useDataStore();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [expandedParts, setExpandedParts] = useState<Set<number>>(new Set([0]));
  const [logs, setLogs] = useState<WODLog[]>([]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [score, setScore] = useState("");
  const [scoreType, setScoreType] = useState("rounds_reps");
  const [scale, setScale] = useState<"rx" | "scaled" | "rx_plus">("rx");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [timerTotal, setTimerTotal] = useState(20 * 60);
  const [timerSeconds, setTimerSeconds] = useState(20 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerInputMin, setTimerInputMin] = useState("20");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setLogs(loadLogs());
    setMounted(true);
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerRunning(false);
  }, []);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds((s) => {
          if (s <= 1) {
            stopTimer();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning, stopTimer]);

  function resetTimer() {
    stopTimer();
    const mins = parseInt(timerInputMin, 10) || 20;
    const total = mins * 60;
    setTimerTotal(total);
    setTimerSeconds(total);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleLogSubmit(e: React.FormEvent, wod: WOD) {
    e.preventDefault();
    if (!score.trim()) return;
    const log: WODLog = {
      wodId: wod.id,
      wodTitle: wod.title ?? "WOD",
      date: wod.date,
      score: score.trim(),
      scoreType,
      scale,
      notes: notes.trim(),
      loggedAt: new Date().toISOString(),
    };
    const updated = [log, ...logs];
    setLogs(updated);
    saveLogs(updated);
    setScore("");
    setNotes("");
    setSubmitted(true);
    setShowLogForm(false);
    showToast(t("my.wod.log.saved"));
    setTimeout(() => setSubmitted(false), 5000);
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--color-vytal-green)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const todayWODs = (wods ?? []).filter((w) => w.date === today);
  const pastWODs = (wods ?? [])
    .filter((w) => w.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));
  const mainWOD = todayWODs[0] ?? null;

  const wodTypeMeta = mainWOD
    ? (WOD_TYPE_LABELS[mainWOD.parts?.[0]?.type ?? "custom"] ?? WOD_TYPE_LABELS.custom)
    : null;

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
      <h1 className="sr-only">WOD</h1>

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-20 left-4 right-4 z-50 rounded-2xl px-4 py-3 text-sm font-semibold shadow-2xl animate-slide-in-right flex items-center gap-2"
          style={{ background: "var(--color-vytal-green)", color: "var(--color-vytal-bg)" }}
        >
          <CheckCircle size={16} />
          {toast}
        </div>
      )}

      {/* ── Today's WOD ── */}
      {mainWOD ? (
        <div className="space-y-5">
          {/* WOD Header */}
          <div
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.03) 100%)",
              border: "1px solid rgba(34,197,94,0.25)",
            }}
          >
            <div
              className="absolute -top-6 -right-6 w-32 h-32 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)" }}
            />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--color-vytal-muted)" }}>
                  {t("my.wod.todayTitle")}
                </p>
                <h2 className="text-3xl font-black leading-tight" style={{ color: "var(--color-vytal-green)" }}>
                  {mainWOD.title ?? "WOD do Dia"}
                </h2>
                {wodTypeMeta && (
                  <span
                    className="inline-block mt-2 px-2.5 py-1 rounded-lg text-xs font-black tracking-wide"
                    style={{
                      background: `${wodTypeMeta.color}22`,
                      color: wodTypeMeta.color,
                      border: `1px solid ${wodTypeMeta.color}44`,
                    }}
                  >
                    {wodTypeMeta.labelKey.startsWith("my.") ? t(wodTypeMeta.labelKey) : wodTypeMeta.labelKey}
                  </span>
                )}
              </div>
              {submitted && (
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl shrink-0"
                  style={{ background: "rgba(34,197,94,0.15)" }}
                >
                  <CheckCircle size={13} style={{ color: "var(--color-vytal-green)" }} />
                  <span className="text-xs font-bold" style={{ color: "var(--color-vytal-green)" }}>
                    {t("my.wod.registered")}
                  </span>
                </div>
              )}
            </div>
            {mainWOD.description && (
              <p className="text-sm leading-relaxed mt-3" style={{ color: "var(--color-vytal-muted)" }}>
                {mainWOD.description}
              </p>
            )}
          </div>

          {/* WOD Parts */}
          <div className="space-y-2">
            {mainWOD.parts.map((part, i) => {
              const isExpanded = expandedParts.has(i);
              const partType = WOD_TYPE_LABELS[part.type] ?? WOD_TYPE_LABELS.custom;
              return (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden transition-all duration-200"
                  style={{
                    background: "var(--color-vytal-bg2)",
                    border: "1px solid var(--color-vytal-border)",
                  }}
                >
                  <button
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[rgba(34,197,94,0.03)] transition-colors"
                    onClick={() => {
                      const next = new Set(expandedParts);
                      if (isExpanded) next.delete(i);
                      else next.add(i);
                      setExpandedParts(next);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0"
                        style={{ background: "var(--color-vytal-green)", color: "var(--color-vytal-bg)" }}
                      >
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-bold text-sm" style={{ color: "var(--color-vytal-text)" }}>
                          {part.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{
                              background: `${partType.color}22`,
                              color: partType.color,
                            }}
                          >
                            {partType.labelKey.startsWith("my.") ? t(partType.labelKey) : partType.labelKey}
                          </span>
                          {part.timeCap && (
                            <span className="text-[10px]" style={{ color: "var(--color-vytal-muted)" }}>
                              {part.timeCap} min
                            </span>
                          )}
                          {part.rounds && part.intervalSeconds && (
                            <span className="text-[10px]" style={{ color: "var(--color-vytal-muted)" }}>
                              {part.rounds} rounds × {part.intervalSeconds}s
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={15} style={{ color: "var(--color-vytal-muted)" }} />
                    ) : (
                      <ChevronDown size={15} style={{ color: "var(--color-vytal-muted)" }} />
                    )}
                  </button>

                  {isExpanded && (
                    <div
                      className="px-4 pb-4 space-y-2"
                      style={{ borderTop: "1px solid var(--color-vytal-border)" }}
                    >
                      {part.exercises.map((ex, j) => (
                        <div
                          key={j}
                          className="flex items-start gap-3 pt-3"
                        >
                          <div
                            className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5"
                            style={{ background: "var(--color-vytal-bg3)", color: "var(--color-vytal-green)" }}
                          >
                            {j + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold" style={{ color: "var(--color-vytal-text)" }}>
                              {ex.exercise?.name ?? ex.exerciseId}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-0.5">
                              {ex.reps && (
                                <span
                                  className="text-xs font-bold px-2 py-0.5 rounded-md"
                                  style={{ background: "rgba(34,197,94,0.12)", color: "var(--color-vytal-green)" }}
                                >
                                  {ex.reps}
                                </span>
                              )}
                              {ex.weight && (
                                <span
                                  className="text-xs font-bold px-2 py-0.5 rounded-md"
                                  style={{ background: "rgba(255,179,0,0.12)", color: "var(--color-vytal-amber)" }}
                                >
                                  @ {ex.weight}
                                </span>
                              )}
                              {ex.notes && (
                                <span className="text-xs italic" style={{ color: "var(--color-vytal-muted)" }}>
                                  {ex.notes}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Circular Timer ── */}
          <div
            className="rounded-2xl p-6 flex flex-col items-center gap-5"
            style={{
              background: "var(--color-vytal-bg2)",
              border: "1px solid var(--color-vytal-border)",
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest self-start" style={{ color: "var(--color-vytal-muted)" }}>
              {t("my.wod.timer.label")}
            </p>

            <CircularTimer
              seconds={timerSeconds}
              total={timerTotal}
              running={timerRunning}
              labelRunning={t("my.wod.timer.running")}
              labelFinished={t("my.wod.timer.finished")}
              labelPaused={t("my.wod.timer.paused")}
            />

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTimerRunning((v) => !v)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 hover:scale-105"
                style={{
                  background: timerRunning ? "var(--color-vytal-amber)" : "var(--color-vytal-green)",
                  color: "var(--color-vytal-bg)",
                }}
              >
                {timerRunning ? <Pause size={16} /> : <Play size={16} />}
                {timerRunning ? t("my.wod.timer.pause") : t("my.wod.timer.start")}
              </button>
              <button
                onClick={resetTimer}
                className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{
                  background: "var(--color-vytal-bg3)",
                  border: "1px solid var(--color-vytal-border)",
                }}
                title="Reset"
              >
                <RotateCcw size={15} style={{ color: "var(--color-vytal-muted)" }} />
              </button>
            </div>

            {/* Duration input */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium" style={{ color: "var(--color-vytal-muted)" }}>
                {t("my.wod.timer.duration")}
              </span>
              <input
                type="number"
                min={1}
                max={60}
                value={timerInputMin}
                onChange={(e) => setTimerInputMin(e.target.value)}
                className="w-16 text-center text-sm rounded-xl px-2 py-1.5 font-mono outline-none"
                style={{
                  background: "var(--color-vytal-bg3)",
                  color: "var(--color-vytal-text)",
                  border: "1px solid var(--color-vytal-border)",
                }}
                onBlur={resetTimer}
              />
            </div>
          </div>

          {/* ── Log Result ── */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "var(--color-vytal-bg2)",
              border: showLogForm ? "1px solid rgba(34,197,94,0.3)" : "1px solid var(--color-vytal-border)",
            }}
          >
            <button
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-[rgba(34,197,94,0.04)] transition-colors"
              onClick={() => setShowLogForm((v) => !v)}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(34,197,94,0.15)" }}
                >
                  <Zap size={14} style={{ color: "var(--color-vytal-green)" }} />
                </div>
                <span className="font-bold text-sm" style={{ color: "var(--color-vytal-text)" }}>
                  {t("my.wod.log.register")}
                </span>
              </div>
              {showLogForm ? (
                <ChevronUp size={15} style={{ color: "var(--color-vytal-muted)" }} />
              ) : (
                <ChevronDown size={15} style={{ color: "var(--color-vytal-muted)" }} />
              )}
            </button>

            {showLogForm && (
              <form
                onSubmit={(e) => handleLogSubmit(e, mainWOD)}
                className="px-5 pb-5 space-y-4"
                style={{ borderTop: "1px solid var(--color-vytal-border)" }}
              >
                {/* Scale selector */}
                <div className="pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--color-vytal-muted)" }}>
                    {t("my.wod.log.scale")}
                  </p>
                  <div className="flex gap-2">
                    {(["rx", "scaled", "rx_plus"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setScale(s)}
                        className="flex-1 py-2 rounded-xl text-xs font-black transition-all duration-200 hover:scale-105"
                        style={{
                          background: scale === s
                            ? s === "rx_plus"
                              ? "var(--color-vytal-purple)"
                              : s === "scaled"
                              ? "var(--color-vytal-amber)"
                              : "var(--color-vytal-green)"
                            : "var(--color-vytal-bg3)",
                          color: scale === s ? "var(--color-vytal-bg)" : "var(--color-vytal-muted)",
                        }}
                      >
                        {s === "rx" ? "RX" : s === "scaled" ? "Scaled" : "RX+"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Score type */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--color-vytal-muted)" }}>
                    {t("my.wod.log.scoreType")}
                  </label>
                  <select
                    value={scoreType}
                    onChange={(e) => setScoreType(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                    style={{
                      background: "var(--color-vytal-bg3)",
                      color: "var(--color-vytal-text)",
                      border: "1px solid var(--color-vytal-border)",
                    }}
                  >
                    {SCORE_TYPE_KEYS.map((st) => (
                      <option key={st.value} value={st.value}>{t(st.key)}</option>
                    ))}
                  </select>
                </div>

                {/* Score value */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--color-vytal-muted)" }}>
                    {t("my.wod.log.result")}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      scoreType === "time" ? "ex: 08:45" :
                      scoreType === "rounds_reps" ? "ex: 12 + 7" :
                      "ex: 42"
                    }
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none font-mono"
                    style={{
                      background: "var(--color-vytal-bg3)",
                      color: "var(--color-vytal-text)",
                      border: "1px solid var(--color-vytal-border)",
                    }}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--color-vytal-muted)" }}>
                    {t("my.wod.log.notes")}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={t("my.wod.log.notesPlaceholder")}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
                    style={{
                      background: "var(--color-vytal-bg3)",
                      color: "var(--color-vytal-text)",
                      border: "1px solid var(--color-vytal-border)",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.01] hover:opacity-90"
                  style={{ background: "var(--color-vytal-green)", color: "var(--color-vytal-bg)" }}
                >
                  {t("my.wod.log.save")}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <div
          className="rounded-2xl p-10 flex flex-col items-center gap-4 text-center"
          style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
        >
          <Dumbbell size={36} style={{ color: "var(--color-vytal-muted)", opacity: 0.3 }} />
          <div>
            <p className="font-bold" style={{ color: "var(--color-vytal-text)" }}>
              {t("my.wod.notPublished")}
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--color-vytal-muted)" }}>
              {t("my.wod.checkLater")}
            </p>
          </div>
        </div>
      )}

      {/* ── History ── */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--color-vytal-muted)" }}>
          {t("my.wod.history")}
        </p>

        {/* My recent logs */}
        {logs.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold" style={{ color: "var(--color-vytal-green)" }}>
              {t("my.wod.myResults")}
            </p>
            {logs.slice(0, 3).map((log, i) => {
              const scaleColor =
                log.scale === "rx_plus"
                  ? "var(--color-vytal-purple)"
                  : log.scale === "scaled"
                  ? "var(--color-vytal-amber)"
                  : "var(--color-vytal-green)";
              return (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 transition-all duration-200 hover:scale-[1.01]"
                  style={{
                    background: "rgba(34,197,94,0.06)",
                    border: "1px solid rgba(34,197,94,0.15)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${scaleColor}22` }}
                    >
                      <Zap size={13} style={{ color: scaleColor }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "var(--color-vytal-text)" }}>
                        {log.wodTitle}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--color-vytal-muted)" }}>
                        {new Date(log.date).toLocaleDateString("pt-PT", { weekday: "short", day: "numeric", month: "short" })}
                        {" · "}
                        <span style={{ color: scaleColor }}>{log.scale.toUpperCase().replace("_", "+")}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className="font-black font-mono text-base"
                      style={{ color: "var(--color-vytal-green)" }}
                    >
                      {log.score}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--color-vytal-muted)" }}>
                      {t(SCORE_TYPE_KEYS.find((st) => st.value === log.scoreType)?.key ?? log.scoreType)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Past WOD cards */}
        {pastWODs.length === 0 ? (
          <p className="text-sm text-center py-4" style={{ color: "var(--color-vytal-muted)" }}>
            {t("my.wod.noPastWods")}
          </p>
        ) : (
          pastWODs.slice(0, 5).map((wod) => (
            <div
              key={wod.id}
              className="rounded-2xl px-4 py-3 transition-all duration-200 hover:scale-[1.01]"
              style={{
                background: "var(--color-vytal-bg2)",
                border: "1px solid var(--color-vytal-border)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-sm" style={{ color: "var(--color-vytal-text)" }}>
                    {wod.title ?? "WOD"}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--color-vytal-muted)" }}>
                    {new Date(wod.date).toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                </div>
                <span
                  className="text-[10px] px-2 py-1 rounded-lg font-bold flex-shrink-0"
                  style={{ background: "var(--color-vytal-bg3)", color: "var(--color-vytal-muted)" }}
                >
                  {wod.parts.length} {wod.parts.length === 1 ? t("my.wod.part") : t("my.wod.parts")}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
