"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, CheckCircle, ChevronDown, ChevronUp, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataStore } from "@/stores/data-store";
import type { WOD } from "@vytal-fit/shared";

const WOD_TYPE_LABELS: Record<string, string> = {
  amrap: "AMRAP",
  emom: "EMOM",
  for_time: "For Time",
  tabata: "Tabata",
  strength: "Forca",
  custom: "Custom",
};

const SCORE_TYPES = [
  { value: "time", label: "Tempo (mm:ss)" },
  { value: "rounds_reps", label: "Rounds + Reps" },
  { value: "reps", label: "Reps" },
  { value: "weight", label: "Peso (kg)" },
  { value: "distance", label: "Distancia (m)" },
  { value: "calories", label: "Calorias" },
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

export default function WODPage() {
  const { wods } = useDataStore();
  const [mounted, setMounted] = useState(false);
  const [expandedParts, setExpandedParts] = useState<Set<number>>(new Set([2]));
  const [logs, setLogs] = useState<WODLog[]>([]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [score, setScore] = useState("");
  const [scoreType, setScoreType] = useState("rounds_reps");
  const [scale, setScale] = useState<"rx" | "scaled" | "rx_plus">("rx");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Timer
  const [timerSeconds, setTimerSeconds] = useState(20 * 60); // default 20min AMRAP
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
    setTimerSeconds(mins * 60);
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
    showToast("Resultado guardado!");
    setTimeout(() => setSubmitted(false), 4000);
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

  const today = new Date().toISOString().split("T")[0];
  const todayWODs = (wods ?? []).filter((w) => w.date === today);
  const pastWODs = (wods ?? []).filter((w) => w.date < today).sort((a, b) => b.date.localeCompare(a.date));

  const mainWOD = todayWODs[0] ?? null;

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
      <h1 className="sr-only">WOD</h1>
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-16 left-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium text-[#080c0a] shadow-xl"
          style={{ background: "var(--color-vytal-green)" }}
        >
          {toast}
        </div>
      )}

      {/* Today's WOD */}
      {mainWOD ? (
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-vytal-muted)" }}>
                WOD de Hoje
              </p>
              <h2 className="text-2xl font-bold mt-0.5" style={{ color: "var(--color-vytal-green)" }}>
                {mainWOD.title ?? "WOD do Dia"}
              </h2>
            </div>
            {submitted && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: "rgba(34,197,94,0.15)" }}>
                <CheckCircle size={14} style={{ color: "var(--color-vytal-green)" }} />
                <span className="text-xs font-medium" style={{ color: "var(--color-vytal-green)" }}>Registado</span>
              </div>
            )}
          </div>

          {mainWOD.description && (
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-vytal-muted)" }}>
              {mainWOD.description}
            </p>
          )}

          {/* WOD Parts */}
          <div className="space-y-2">
            {mainWOD.parts.map((part, i) => {
              const isExpanded = expandedParts.has(i);
              return (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden"
                  style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
                >
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                    onClick={() => {
                      const next = new Set(expandedParts);
                      if (isExpanded) next.delete(i);
                      else next.add(i);
                      setExpandedParts(next);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: "var(--color-vytal-bg3)", color: "var(--color-vytal-green)" }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: "var(--color-vytal-text)" }}>
                          {part.name}
                        </p>
                        <p className="text-xs" style={{ color: "var(--color-vytal-muted)" }}>
                          {WOD_TYPE_LABELS[part.type] ?? part.type}
                          {part.timeCap ? ` · ${part.timeCap} min` : ""}
                          {part.rounds && part.intervalSeconds
                            ? ` · ${part.rounds} rounds × ${part.intervalSeconds}s`
                            : ""}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={16} style={{ color: "var(--color-vytal-muted)" }} />
                    ) : (
                      <ChevronDown size={16} style={{ color: "var(--color-vytal-muted)" }} />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-2 border-t" style={{ borderColor: "var(--color-vytal-border)" }}>
                      {part.exercises.map((ex, j) => (
                        <div
                          key={j}
                          className="flex items-start gap-3 pt-2"
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                            style={{ background: "var(--color-vytal-green)" }}
                          />
                          <div>
                            <p className="text-sm font-medium" style={{ color: "var(--color-vytal-text)" }}>
                              {ex.exercise?.name ?? ex.exerciseId}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-0.5">
                              {ex.reps && (
                                <span className="text-xs" style={{ color: "var(--color-vytal-green)" }}>
                                  {ex.reps}
                                </span>
                              )}
                              {ex.weight && (
                                <span className="text-xs" style={{ color: "var(--color-vytal-amber)" }}>
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

          {/* AMRAP Timer */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Clock size={14} style={{ color: "var(--color-vytal-green)" }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-vytal-muted)" }}>
                Temporizador
              </span>
            </div>
            <div
              className="text-5xl font-bold text-center tabular-nums py-2"
              style={{
                color: timerSeconds === 0
                  ? "var(--color-vytal-red)"
                  : timerSeconds < 60
                  ? "var(--color-vytal-amber)"
                  : "var(--color-vytal-green)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {formatTime(timerSeconds)}
            </div>
            <div className="flex items-center gap-2 justify-center">
              <button
                onClick={() => setTimerRunning((v) => !v)}
                className="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
                style={{
                  background: timerRunning ? "var(--color-vytal-amber)" : "var(--color-vytal-green)",
                  color: "#080c0a",
                }}
              >
                {timerRunning ? <Pause size={16} /> : <Play size={16} />}
                {timerRunning ? "Pausar" : "Iniciar"}
              </button>
              <button
                onClick={resetTimer}
                className="p-2 rounded-lg transition-all hover:opacity-70"
                style={{ background: "var(--color-vytal-bg3)" }}
                title="Reset"
              >
                <RotateCcw size={16} style={{ color: "var(--color-vytal-muted)" }} />
              </button>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <span className="text-xs" style={{ color: "var(--color-vytal-muted)" }}>Minutos:</span>
              <input
                type="number"
                min={1}
                max={60}
                value={timerInputMin}
                onChange={(e) => setTimerInputMin(e.target.value)}
                className="w-16 text-center text-sm rounded-lg px-2 py-1 font-mono outline-none"
                style={{
                  background: "var(--color-vytal-bg3)",
                  color: "var(--color-vytal-text)",
                  border: "1px solid var(--color-vytal-border)",
                }}
                onBlur={resetTimer}
              />
            </div>
          </div>

          {/* Log score */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
          >
            <button
              className="w-full flex items-center justify-between px-4 py-3"
              onClick={() => setShowLogForm((v) => !v)}
            >
              <div className="flex items-center gap-2">
                <Zap size={16} style={{ color: "var(--color-vytal-green)" }} />
                <span className="font-semibold text-sm" style={{ color: "var(--color-vytal-text)" }}>
                  Registar resultado
                </span>
              </div>
              {showLogForm ? (
                <ChevronUp size={16} style={{ color: "var(--color-vytal-muted)" }} />
              ) : (
                <ChevronDown size={16} style={{ color: "var(--color-vytal-muted)" }} />
              )}
            </button>

            {showLogForm && (
              <form
                onSubmit={(e) => handleLogSubmit(e, mainWOD)}
                className="px-4 pb-4 space-y-3 border-t"
                style={{ borderColor: "var(--color-vytal-border)" }}
              >
                {/* Scale */}
                <div className="flex gap-2 pt-3">
                  {(["rx", "scaled", "rx_plus"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setScale(s)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: scale === s ? "var(--color-vytal-green)" : "var(--color-vytal-bg3)",
                        color: scale === s ? "#080c0a" : "var(--color-vytal-muted)",
                      }}
                    >
                      {s === "rx" ? "RX" : s === "scaled" ? "Scaled" : "RX+"}
                    </button>
                  ))}
                </div>

                {/* Score type */}
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "var(--color-vytal-muted)" }}>
                    Tipo de resultado
                  </label>
                  <select
                    value={scoreType}
                    onChange={(e) => setScoreType(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{
                      background: "var(--color-vytal-bg3)",
                      color: "var(--color-vytal-text)",
                      border: "1px solid var(--color-vytal-border)",
                    }}
                  >
                    {SCORE_TYPES.map((st) => (
                      <option key={st.value} value={st.value}>{st.label}</option>
                    ))}
                  </select>
                </div>

                {/* Score value */}
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "var(--color-vytal-muted)" }}>
                    Resultado
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
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none font-mono"
                    style={{
                      background: "var(--color-vytal-bg3)",
                      color: "var(--color-vytal-text)",
                      border: "1px solid var(--color-vytal-border)",
                    }}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "var(--color-vytal-muted)" }}>
                    Notas (opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Como correu? Que peso usaste?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
                    style={{
                      background: "var(--color-vytal-bg3)",
                      color: "var(--color-vytal-text)",
                      border: "1px solid var(--color-vytal-border)",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
                  style={{ background: "var(--color-vytal-green)", color: "#080c0a" }}
                >
                  Guardar resultado
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <div
          className="rounded-xl p-8 text-center"
          style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
        >
          <p className="font-semibold" style={{ color: "var(--color-vytal-text)" }}>
            WOD ainda nao publicado para hoje
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--color-vytal-muted)" }}>
            Volta mais tarde ou consulta o horario
          </p>
        </div>
      )}

      {/* Past WODs & my logs */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-vytal-muted)" }}>
          WODs anteriores
        </p>

        {/* My recent logs */}
        {logs.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium" style={{ color: "var(--color-vytal-green)" }}>
              Os meus resultados
            </p>
            {logs.slice(0, 3).map((log, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--color-vytal-text)" }}>
                    {log.wodTitle}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-vytal-muted)" }}>
                    {new Date(log.date).toLocaleDateString("pt-PT", { weekday: "short", day: "numeric", month: "short" })}
                    {" · "}{log.scale.toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold font-mono text-sm" style={{ color: "var(--color-vytal-green)" }}>
                    {log.score}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--color-vytal-muted)" }}>
                    {SCORE_TYPES.find((st) => st.value === log.scoreType)?.label ?? log.scoreType}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Past WOD cards */}
        {pastWODs.length === 0 ? (
          <p className="text-sm text-center" style={{ color: "var(--color-vytal-muted)" }}>
            Sem WODs anteriores registados.
          </p>
        ) : (
          pastWODs.slice(0, 5).map((wod) => (
            <div
              key={wod.id}
              className="rounded-xl px-4 py-3"
              style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--color-vytal-text)" }}>
                    {wod.title ?? "WOD"}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-vytal-muted)" }}>
                    {new Date(wod.date).toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                  {wod.description && (
                    <p className="text-xs mt-1 leading-relaxed line-clamp-2" style={{ color: "var(--color-vytal-muted)" }}>
                      {wod.description}
                    </p>
                  )}
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded font-medium flex-shrink-0"
                  style={{ background: "var(--color-vytal-bg3)", color: "var(--color-vytal-muted)" }}
                >
                  {wod.parts.length} {wod.parts.length === 1 ? "parte" : "partes"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
