"use client";

import { useEffect, useState } from "react";
import { Play, ChevronDown, ChevronUp, Clock, Dumbbell, Flame, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

// ── Types ────────────────────────────────────────────────────────────────────

type Category = "Peso Corporal" | "Mobilidade" | "Core" | "Cardio" | "Recuperacao";
type Difficulty = 1 | 2 | 3 | 4 | 5;

interface Exercise {
  name: string;
  sets?: string;
  reps?: string;
  duration?: string;
  rest?: string;
  note?: string;
}

interface Workout {
  id: string;
  title: string;
  category: Category;
  duration: number;
  difficulty: Difficulty;
  exercises: Exercise[];
  description: string;
  suggested?: boolean;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const WORKOUTS: Workout[] = [
  {
    id: "w1",
    title: "Forca Total",
    category: "Peso Corporal",
    duration: 25,
    difficulty: 3,
    suggested: true,
    description: "Treino completo de forca usando apenas o peso corporal. Perfeito para dias sem box.",
    exercises: [
      { name: "Agachamento", sets: "4", reps: "15", rest: "60s" },
      { name: "Flexoes", sets: "4", reps: "12", rest: "45s" },
      { name: "Afundo alternado", sets: "3", reps: "10 cada", rest: "60s" },
      { name: "Mergulhos no banco", sets: "3", reps: "12", rest: "45s" },
      { name: "Burpees", sets: "3", reps: "8", rest: "90s" },
    ],
  },
  {
    id: "w2",
    title: "Mobilidade Matinal",
    category: "Mobilidade",
    duration: 15,
    difficulty: 1,
    suggested: true,
    description: "Rotina de mobilidade para comecar o dia com o corpo pronto para treinar.",
    exercises: [
      { name: "Rotacao de ombros", duration: "60s cada lado", note: "Suave, sem forcas" },
      { name: "Hip 90/90", duration: "90s cada lado", note: "Mantems a posicao" },
      { name: "Cobra a crianca", reps: "10 ciclos", note: "Respiracao controlada" },
      { name: "World's Greatest Stretch", reps: "5 cada lado", note: "Devagar" },
      { name: "Cat-Cow", duration: "60s", note: "Sincronizado com respiracao" },
    ],
  },
  {
    id: "w3",
    title: "Core de Ferro",
    category: "Core",
    duration: 20,
    difficulty: 4,
    description: "Circuito intenso focado no nucleo. Melhora postura e potencia nos levantamentos.",
    exercises: [
      { name: "Prancha frontal", duration: "60s", rest: "30s" },
      { name: "Prancha lateral", duration: "45s cada lado", rest: "30s" },
      { name: "Dead Bug", sets: "3", reps: "10 cada", rest: "45s" },
      { name: "Rollout de abdominais", sets: "3", reps: "8", rest: "60s" },
      { name: "Hollow Hold", duration: "30s", rest: "30s" },
      { name: "V-Ups", sets: "3", reps: "12", rest: "45s" },
    ],
  },
  {
    id: "w4",
    title: "Cardio HIIT Explosivo",
    category: "Cardio",
    duration: 30,
    difficulty: 5,
    description: "Treino intervalado de alta intensidade. Queima calorias e melhora o condicionamento.",
    exercises: [
      { name: "Sprint no lugar", duration: "20s", rest: "10s", note: "Maxima intensidade" },
      { name: "Jumping Jacks", duration: "30s", rest: "15s" },
      { name: "Mountain Climbers", duration: "20s", rest: "10s" },
      { name: "Burpees com salto", sets: "4", reps: "8", rest: "30s" },
      { name: "Box Jumps (cadeira)", sets: "4", reps: "10", rest: "30s" },
    ],
  },
  {
    id: "w5",
    title: "Recuperacao Ativa",
    category: "Recuperacao",
    duration: 20,
    difficulty: 1,
    description: "Sessao leve para acelerar a recuperacao muscular apos treinos intensos.",
    exercises: [
      { name: "Caminhada lenta", duration: "5min", note: "Respiracao profunda" },
      { name: "Alongamento de quadriceps", duration: "60s cada", note: "Sem saltos" },
      { name: "Rolar costas (foam roller)", duration: "2min", note: "Pontos de tensao" },
      { name: "Respiracao 4-7-8", reps: "6 ciclos", note: "Ativa o parasimpatico" },
      { name: "Supino invertido passivo", duration: "3min", note: "Relaxa os ombros" },
    ],
  },
  {
    id: "w6",
    title: "Guerreiro Silencioso",
    category: "Peso Corporal",
    duration: 35,
    difficulty: 4,
    description: "Treino avancado de peso corporal com movimentos mais tecnicos.",
    exercises: [
      { name: "Pistol Squat (assistido)", sets: "3", reps: "5 cada", rest: "90s" },
      { name: "Pike Push-Up", sets: "4", reps: "10", rest: "60s" },
      { name: "Nordic Curl", sets: "3", reps: "5", rest: "120s", note: "Muito lento na descida" },
      { name: "Archer Push-Up", sets: "3", reps: "6 cada", rest: "60s" },
      { name: "Single Leg Hip Thrust", sets: "3", reps: "12 cada", rest: "45s" },
    ],
  },
  {
    id: "w7",
    title: "Coluna Saudavel",
    category: "Mobilidade",
    duration: 18,
    difficulty: 2,
    description: "Foco na coluna vertebral e reducao de tensao nas costas.",
    exercises: [
      { name: "Bird Dog", sets: "3", reps: "8 cada", rest: "30s" },
      { name: "Superman Hold", duration: "30s", rest: "20s", sets: "3" },
      { name: "Alongamento piriforme", duration: "90s cada", note: "Figura de 4" },
      { name: "Extensao de toraxica", duration: "60s", note: "Sobre foam roller" },
      { name: "Glute Bridge", sets: "3", reps: "15", rest: "45s" },
    ],
  },
  {
    id: "w8",
    title: "Maratona de Core",
    category: "Core",
    duration: 28,
    difficulty: 3,
    description: "Volume alto no nucleo para construir resistencia abdominal duradoura.",
    exercises: [
      { name: "Crunch bicicleta", sets: "3", reps: "20", rest: "30s" },
      { name: "Leg Raises", sets: "4", reps: "12", rest: "30s" },
      { name: "Prancha com toque", sets: "3", reps: "10 cada", rest: "45s" },
      { name: "Russian Twists", sets: "3", reps: "20", rest: "30s" },
      { name: "Flutter Kicks", duration: "30s", sets: "4", rest: "20s" },
      { name: "Sit-Up explosivo", sets: "3", reps: "15", rest: "45s" },
    ],
  },
  {
    id: "w9",
    title: "Reatividade e Velocidade",
    category: "Cardio",
    duration: 22,
    difficulty: 3,
    description: "Melhora a reatividade e velocidade de movimento — fundamental para WODs de CrossFit.",
    exercises: [
      { name: "Pulo de corda imaginario", duration: "2min", note: "Ritmo rapido" },
      { name: "Lateral Shuffles", duration: "20s", sets: "4", rest: "15s" },
      { name: "T-drill (marcadores)", reps: "6 x", rest: "30s" },
      { name: "Box Step-Overs rapidos", duration: "30s", sets: "3", rest: "30s" },
    ],
  },
  {
    id: "w10",
    title: "Descanso Profundo",
    category: "Recuperacao",
    duration: 12,
    difficulty: 1,
    description: "Protocolo para uso antes de dormir. Melhora a qualidade do sono e recuperacao.",
    exercises: [
      { name: "Respiracao diafragmatica", duration: "3min", note: "Deitado, olhos fechados" },
      { name: "Tensao-relaxamento progressivo", duration: "5min", note: "Grupo muscular por vez" },
      { name: "Supinacao com pernas levantadas", duration: "4min", note: "90 graus na parede" },
    ],
  },
];

const CATEGORY_CONFIG: Record<Category, { color: string; bg: string; border: string; icon: React.ElementType }> = {
  "Peso Corporal": { color: "var(--color-vytal-green)",  bg: "rgba(34,197,94,0.08)",    border: "rgba(34,197,94,0.2)",    icon: Dumbbell },
  "Mobilidade":   { color: "var(--color-vytal-purple)", bg: "rgba(192,132,252,0.08)",  border: "rgba(192,132,252,0.2)",  icon: Activity },
  "Core":         { color: "var(--color-vytal-amber)",  bg: "rgba(255,179,0,0.08)",    border: "rgba(255,179,0,0.2)",    icon: Flame },
  "Cardio":       { color: "var(--color-vytal-red)",    bg: "rgba(255,71,87,0.08)",    border: "rgba(255,71,87,0.2)",    icon: Flame },
  "Recuperacao":  { color: "var(--color-vytal-blue)",   bg: "rgba(0,212,255,0.08)",    border: "rgba(0,212,255,0.2)",    icon: Activity },
};

const TIMER_KEY = "vytal-workout-timer";
const ALL_CATEGORIES: Category[] = ["Peso Corporal", "Mobilidade", "Core", "Cardio", "Recuperacao"];

function DifficultyDots({ level, color }: { level: Difficulty; color: string }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full transition-all duration-200"
          style={{
            background: i < level ? color : "var(--color-vytal-bg3)",
            opacity: i < level ? 1 : 0.4,
          }}
        />
      ))}
    </div>
  );
}

function TimerModal({ workout, onClose, labels }: {
  workout: Workout;
  onClose: () => void;
  labels: { inProgress: string; estimated: string; pause: string; resume: string; start: string; exit: string };
}) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const secs = String(elapsed % 60).padStart(2, "0");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-sm mx-4 mb-4 md:mb-0 rounded-3xl p-6 space-y-5"
        style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
      >
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--color-vytal-muted)" }}>
            {labels.inProgress}
          </p>
          <h2 className="text-xl font-black" style={{ color: "var(--color-vytal-text)" }}>
            {workout.title}
          </h2>
        </div>

        {/* Timer display */}
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: "var(--color-vytal-bg3)" }}
        >
          <span
            className="text-6xl font-black tabular-nums tracking-tight"
            style={{ color: running ? "var(--color-vytal-green)" : "var(--color-vytal-muted)", fontFamily: "var(--font-mono, monospace)" }}
          >
            {mins}:{secs}
          </span>
          <p className="text-xs mt-1" style={{ color: "var(--color-vytal-muted)" }}>
            {labels.estimated.replace("{n}", String(workout.duration))}
          </p>
          {/* Progress bar */}
          <div
            className="h-1.5 rounded-full mt-3 overflow-hidden"
            style={{ background: "var(--color-vytal-bg2)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min(100, (elapsed / (workout.duration * 60)) * 100)}%`,
                background: "var(--color-vytal-green)",
              }}
            />
          </div>
        </div>

        {/* Exercise list */}
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {workout.exercises.map((ex, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ background: "var(--color-vytal-bg3)" }}
            >
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black shrink-0"
                style={{ background: "var(--color-vytal-green)", color: "#080c0a" }}
              >
                {i + 1}
              </div>
              <span className="text-xs font-semibold" style={{ color: "var(--color-vytal-text)" }}>
                {ex.name}
              </span>
              <span className="text-[10px] ml-auto" style={{ color: "var(--color-vytal-muted)" }}>
                {ex.sets ? `${ex.sets}x${ex.reps}` : ex.duration ?? ""}
              </span>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={() => setRunning((r) => !r)}
            className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all duration-200 hover:opacity-90 hover:scale-[1.01]"
            style={{ background: "var(--color-vytal-green)", color: "#080c0a" }}
          >
            {running ? labels.pause : elapsed > 0 ? labels.resume : labels.start}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-200 hover:scale-[1.01]"
            style={{ background: "var(--color-vytal-bg3)", color: "var(--color-vytal-muted)", border: "1px solid var(--color-vytal-border)" }}
          >
            {labels.exit}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function WorkoutsPage() {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | "Todos">("Todos");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [timerWorkout, setTimerWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const ALL_LABEL = t("my.workouts.all");
  const filtered =
    activeCategory === "Todos"
      ? WORKOUTS
      : WORKOUTS.filter((w) => w.category === activeCategory);

  const suggested = WORKOUTS.filter((w) => w.suggested);

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto space-y-6 md:max-w-5xl">

      {/* Timer modal */}
      {timerWorkout && (
        <TimerModal
          workout={timerWorkout}
          onClose={() => setTimerWorkout(null)}
          labels={{
            inProgress: t("my.workouts.timer.inProgress"),
            estimated: t("my.workouts.timer.estimated"),
            pause: t("my.workouts.timer.pause"),
            resume: t("my.workouts.timer.resume"),
            start: t("my.workouts.timer.start"),
            exit: t("my.workouts.timer.exit"),
          }}
        />
      )}

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-black" style={{ color: "var(--color-vytal-text)" }}>
          {t("my.workouts.title")}
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-vytal-muted)" }}>
          {WORKOUTS.length} {t("my.workouts.subtitle")}
        </p>
      </div>

      {/* ── Suggested ── */}
      {suggested.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Flame size={13} style={{ color: "var(--color-vytal-amber)" }} />
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--color-vytal-muted)" }}>
              {t("my.workouts.suggested")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggested.map((w) => {
              const cfg = CATEGORY_CONFIG[w.category];
              const Icon = cfg.icon;
              return (
                <div
                  key={w.id}
                  className="rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.01]"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md"
                            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                          >
                            {w.category}
                          </span>
                        </div>
                        <h3 className="font-black text-base leading-tight" style={{ color: "var(--color-vytal-text)" }}>
                          {w.title}
                        </h3>
                      </div>
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                      >
                        <Icon size={16} style={{ color: cfg.color }} strokeWidth={1.8} />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Clock size={11} style={{ color: "var(--color-vytal-muted)" }} />
                        <span className="text-xs font-semibold" style={{ color: "var(--color-vytal-muted)" }}>
                          {w.duration} min
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Dumbbell size={11} style={{ color: "var(--color-vytal-muted)" }} />
                        <span className="text-xs font-semibold" style={{ color: "var(--color-vytal-muted)" }}>
                          {w.exercises.length} {t("my.workouts.exercises")}
                        </span>
                      </div>
                    </div>
                    <DifficultyDots level={w.difficulty} color={cfg.color} />
                    <button
                      onClick={() => setTimerWorkout(w)}
                      className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] hover:opacity-90"
                      style={{ background: cfg.color, color: "#080c0a" }}
                    >
                      <Play size={12} fill="currentColor" />
                      {t("my.workouts.start")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Category filter ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {(["Todos", ...ALL_CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat as typeof activeCategory)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 hover:scale-105 shrink-0"
            )}
            style={{
              background: activeCategory === cat ? "var(--color-vytal-green)" : "var(--color-vytal-bg2)",
              color: activeCategory === cat ? "#080c0a" : "var(--color-vytal-muted)",
              border: activeCategory === cat
                ? "1px solid var(--color-vytal-green)"
                : "1px solid var(--color-vytal-border)",
            }}
          >
            {cat === "Todos" ? ALL_LABEL : cat}
          </button>
        ))}
      </div>

      {/* ── Workout list ── */}
      <div className="space-y-2">
        {filtered.map((w) => {
          const cfg = CATEGORY_CONFIG[w.category];
          const Icon = cfg.icon;
          const isExpanded = expandedId === w.id;
          return (
            <div
              key={w.id}
              className="rounded-2xl overflow-hidden transition-all duration-200"
              style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
            >
              {/* Card header — always visible */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : w.id)}
                className="w-full flex items-center gap-3 px-4 py-4 text-left transition-all duration-200 hover:bg-[rgba(34,197,94,0.03)]"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: cfg.bg }}
                >
                  <Icon size={15} style={{ color: cfg.color }} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-sm truncate" style={{ color: "var(--color-vytal-text)" }}>
                      {w.title}
                    </p>
                    {w.suggested && (
                      <span
                        className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md shrink-0"
                        style={{ background: "rgba(255,179,0,0.15)", color: "var(--color-vytal-amber)" }}
                      >
                        {t("my.workouts.suggestedBadge")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-semibold" style={{ color: cfg.color }}>
                      {w.category}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--color-vytal-muted)" }}>
                      {w.duration} min · {w.exercises.length} {t("my.workouts.exercises")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <DifficultyDots level={w.difficulty} color={cfg.color} />
                  {isExpanded
                    ? <ChevronUp size={15} style={{ color: "var(--color-vytal-muted)" }} />
                    : <ChevronDown size={15} style={{ color: "var(--color-vytal-muted)" }} />
                  }
                </div>
              </button>

              {/* Expandable content */}
              {isExpanded && (
                <div
                  className="px-4 pb-4 space-y-3 border-t"
                  style={{ borderColor: "var(--color-vytal-border)" }}
                >
                  <p className="text-xs leading-relaxed pt-3" style={{ color: "var(--color-vytal-muted)" }}>
                    {w.description}
                  </p>
                  <div className="space-y-1.5">
                    {w.exercises.map((ex, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
                        style={{ background: "var(--color-vytal-bg3)" }}
                      >
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black shrink-0"
                          style={{ background: cfg.color, color: "#080c0a" }}
                        >
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold" style={{ color: "var(--color-vytal-text)" }}>
                            {ex.name}
                          </p>
                          {ex.note && (
                            <p className="text-[10px]" style={{ color: "var(--color-vytal-muted)" }}>
                              {ex.note}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          {ex.sets && (
                            <p className="text-xs font-black tabular-nums" style={{ color: cfg.color }}>
                              {ex.sets} × {ex.reps}
                            </p>
                          )}
                          {ex.duration && !ex.sets && (
                            <p className="text-xs font-black" style={{ color: cfg.color }}>
                              {ex.duration}
                            </p>
                          )}
                          {ex.rest && (
                            <p className="text-[9px]" style={{ color: "var(--color-vytal-muted)" }}>
                              {t("my.workouts.rest")} {ex.rest}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setTimerWorkout(w)}
                    className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] hover:opacity-90"
                    style={{ background: cfg.color, color: "#080c0a" }}
                  >
                    <Play size={12} fill="currentColor" />
                    {t("my.workouts.startWorkout")}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
