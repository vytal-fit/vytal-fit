"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Dumbbell,
  Play,
  Pencil,
  Trophy,
  ArrowUpRight,
  Flame,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { rowToExercise, rowToPersonalRecord } from "@/lib/reference-mappers";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/skeleton";
import type { ExerciseCategory } from "@vytal-fit/shared";

const categoryColors: Record<ExerciseCategory, { bg: string; text: string }> = {
  weightlifting: { bg: "bg-vytal-amber/10", text: "text-vytal-amber" },
  gymnastics: { bg: "bg-vytal-purple/10", text: "text-vytal-purple" },
  cardio: { bg: "bg-vytal-blue/10", text: "text-vytal-blue" },
  strength: { bg: "bg-vytal-green/10", text: "text-vytal-green" },
  mobility: { bg: "bg-vytal-muted/20", text: "text-vytal-muted" },
  other: { bg: "bg-vytal-orange/10", text: "text-vytal-orange" },
};

const categoryLabels: Record<ExerciseCategory, string> = {
  weightlifting: "Weightlifting",
  gymnastics: "Gymnastics",
  cardio: "Cardio",
  strength: "Strength",
  mobility: "Mobility",
  other: "Other",
};

function generateDescription(name: string, category: ExerciseCategory): string {
  const descriptions: Record<string, string> = {
    "Back Squat": "The back squat is a foundational strength movement. With the barbell resting on the upper back, the athlete squats to below parallel and drives up. It builds tremendous lower-body strength and is a staple of any strength program.",
    "Front Squat": "The front squat places the barbell across the front of the shoulders, demanding an upright torso. This variation develops quad strength and core stability, and carries over directly to the clean.",
    "Deadlift": "The deadlift is the ultimate test of full-body strength. Lifting a loaded barbell from the floor to standing engages the entire posterior chain, grip, and core. Proper bracing and hip hinge mechanics are essential.",
    "Clean & Jerk": "The clean and jerk is one of two Olympic lifts contested in competition. The barbell is pulled from the floor to the shoulders (clean), then driven overhead (jerk). It demands power, speed, and coordination.",
    "Snatch": "The snatch is the fastest lift in Olympic weightlifting. The barbell travels from the floor to overhead in one continuous motion. It requires exceptional mobility, timing, and explosive hip extension.",
    "Pull-Up": "The pull-up is a fundamental gymnastics movement for developing upper-body pulling strength. Starting from a dead hang, the athlete pulls until the chin clears the bar.",
    "Muscle-Up (Ring)": "The ring muscle-up combines a pull-up and dip in one fluid motion on gymnastics rings. It requires significant pulling strength, a powerful hip kip, and a fast transition above the rings.",
    "Burpee": "The burpee is a full-body conditioning movement. Drop to the floor, perform a push-up, jump to feet, and jump with hands overhead. Simple but devastatingly effective for metabolic conditioning.",
    "Double Under": "Double unders involve spinning the jump rope twice under the feet per jump. They develop coordination, calf endurance, and cardiovascular capacity. A key CrossFit skill movement.",
    "Wall Ball": "The wall ball shot combines a front squat with a push-press throw to a target. Using a medicine ball, the athlete squats to depth and explosively throws the ball to the specified height.",
    "KB Swing": "The kettlebell swing is a dynamic hip-hinge movement. The kettlebell swings between the legs and is driven forward and upward by explosive hip extension. It builds posterior chain power and grip endurance.",
  };

  if (descriptions[name]) return descriptions[name];

  const genericByCategory: Record<ExerciseCategory, string> = {
    weightlifting: `${name} is a weightlifting movement that develops strength and power. Focus on proper form, controlled tempo, and progressive overload. This exercise is commonly programmed in strength blocks and competition preparation.`,
    gymnastics: `${name} is a gymnastics movement that builds body control, coordination, and relative strength. Start with scaled progressions and work toward the full range of motion. Consistency in practice is key to mastery.`,
    cardio: `${name} is a cardiovascular conditioning exercise that improves aerobic and anaerobic capacity. It can be programmed at various intensities for endurance work, intervals, or as part of metabolic conditioning circuits.`,
    strength: `${name} is an accessory strength movement that targets specific muscle groups. It complements the major compound lifts and helps address weaknesses, prevent imbalances, and build work capacity.`,
    mobility: `${name} is a mobility exercise designed to improve range of motion and tissue quality. Regular practice helps prevent injury, improves movement quality, and supports recovery between training sessions.`,
    other: `${name} is a functional training movement that develops work capacity and general physical preparedness. It can be scaled to various fitness levels and is commonly used in metabolic conditioning workouts.`,
  };

  return genericByCategory[category];
}

const scalingOptions = [
  {
    level: "Rx+",
    color: "text-vytal-red",
    bgColor: "bg-vytal-red/10",
    borderColor: "border-vytal-red/20",
    description: "Advanced scaling with heavier loads, stricter standards, or added complexity. For experienced athletes pushing their limits.",
  },
  {
    level: "Rx",
    color: "text-vytal-green",
    bgColor: "bg-vytal-green/10",
    borderColor: "border-vytal-green/20",
    description: "As prescribed. Standard competition weight and movement standards. The target for most trained athletes.",
  },
  {
    level: "Scaled",
    color: "text-vytal-blue",
    bgColor: "bg-vytal-blue/10",
    borderColor: "border-vytal-blue/20",
    description: "Modified weight, range of motion, or movement substitution. Appropriate for developing athletes and those working around limitations.",
  },
];

export default function ExerciseDetailPage() {
  const { t } = useI18n();
  const params = useParams();
  const id = params.id as string;

  // ── tRPC: global exercise library (read-only) + PRs for this movement ──
  const exerciseQuery = trpc.exercises.byId.useQuery({ id });
  const prsQuery = trpc.personalRecords.list.useQuery({ exerciseId: id, limit: 100 });

  const exercise = useMemo(
    () => (exerciseQuery.data ? rowToExercise(exerciseQuery.data) : undefined),
    [exerciseQuery.data],
  );
  const exercisePRs = useMemo(
    () =>
      exercise
        ? (prsQuery.data?.items ?? []).map((row) => rowToPersonalRecord(row, exercise))
        : [],
    [prsQuery.data, exercise],
  );

  if (exerciseQuery.isError) {
    if (exerciseQuery.error.data?.code === "NOT_FOUND") return notFound();
    return (
      <EmptyState
        icon={AlertTriangle}
        title={t("ui.error")}
        description={t("exercises.loadError")}
        action={{ label: t("billing.retry"), onClick: () => void exerciseQuery.refetch() }}
      />
    );
  }

  if (exerciseQuery.isPending || !exercise) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-48" />
        <div className="flex items-start gap-4">
          <Skeleton className="h-14 w-14 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-6 w-40 rounded-full" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const catColor = categoryColors[exercise.category];
  const description = generateDescription(exercise.name, exercise.category);

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: t("nav.exercises"), href: "/exercises" },
          { label: exercise.name },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className={cn("flex h-14 w-14 items-center justify-center rounded-xl", catColor.bg)}>
            <Dumbbell className={cn("h-7 w-7", catColor.text)} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-vytal-text">{exercise.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", catColor.bg, catColor.text)}>
                {categoryLabels[exercise.category]}
              </span>
              {exercise.equipment && exercise.equipment.map((eq) => (
                <span key={eq} className="rounded-full bg-vytal-bg3 px-2.5 py-0.5 text-xs text-vytal-muted">{eq}</span>
              ))}
            </div>
          </div>
        </div>
        <Link
          href={`/exercises`}
          className="flex items-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
        >
          <Pencil className="h-4 w-4" /> {t("action.edit")} {t("nav.exercises").toLowerCase().slice(0, -1)}
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Video Placeholder — opens YouTube search for this exercise */}
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name + " CrossFit movement demo")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-64 items-center justify-center rounded-xl border border-vytal-border bg-vytal-card transition-colors hover:border-vytal-red/30 hover:bg-vytal-red/5"
          >
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-vytal-red/10 transition-colors group-hover:bg-vytal-red/20">
                <Play className="h-8 w-8 text-vytal-red" />
              </div>
              <p className="text-sm font-medium text-vytal-text">{t("exercises.videoPlaceholder") || "YouTube movement demo"}</p>
              <p className="mt-1 text-xs text-vytal-muted">{(t("exercises.videoSubtitle") || "Click to search demo for {name}").replace("{name}", exercise.name)}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-vytal-red/20 bg-vytal-red/10 px-3 py-1 text-xs font-semibold text-vytal-red">
                <Play className="h-3 w-3" />
                {t("exercises.watchOnYouTube") || "Watch on YouTube"}
              </span>
            </div>
          </a>

          {/* Description */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <h3 className="mb-3 text-sm font-semibold text-vytal-text">{t("exercises.description") || "Description"}</h3>
            <p className="text-sm leading-relaxed text-vytal-muted">{description}</p>
          </div>

          {/* Scaling Options */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("exercises.scalingOptions") || "Scaling Options"}</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {scalingOptions.map((opt) => (
                <div key={opt.level} className={cn("rounded-lg border p-4", opt.borderColor, opt.bgColor)}>
                  <span className={cn("text-sm font-bold", opt.color)}>{opt.level}</span>
                  <p className="mt-2 text-xs leading-relaxed text-vytal-muted">{opt.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Records */}
          {exercisePRs.length > 0 && (
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-vytal-green" />
                <h3 className="text-sm font-semibold text-vytal-text">{t("exercises.personalRecords") || "Personal Records"}</h3>
              </div>
              <div className="space-y-3">
                {exercisePRs.map((pr) => (
                  <div key={pr.id} className="flex items-center justify-between rounded-lg bg-vytal-bg2 p-3">
                    <div>
                      <span className="font-mono text-lg font-bold text-vytal-green">{pr.value} {pr.unit}</span>
                      <p className="text-xs text-vytal-muted">{new Date(pr.achievedAt).toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })}</p>
                    </div>
                    {pr.previousValue && (
                      <div className="flex items-center gap-1 rounded-full bg-vytal-green/10 px-2.5 py-1 text-xs font-semibold text-vytal-green">
                        <ArrowUpRight className="h-3 w-3" />
                        {pr.previousValue} {pr.unit}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Muscle Groups */}
          {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
              <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("exercises.muscleGroupsLabel") || "Muscle Groups"}</h3>
              <div className="flex flex-wrap gap-2">
                {exercise.muscleGroups.map((mg) => (
                  <span key={mg} className={cn("rounded-full px-3 py-1.5 text-xs font-medium", catColor.bg, catColor.text)}>
                    {mg}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Used in WODs */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <div className="mb-3 flex items-center gap-2">
              <Flame className="h-4 w-4 text-vytal-amber" />
              <h3 className="text-sm font-semibold text-vytal-text">{t("exercises.usedInWods") || "Used in WODs"}</h3>
            </div>
            <p className="text-sm text-vytal-muted">
              This exercise appears in <span className="font-semibold text-vytal-text">3 WODs</span> this month
            </p>
            <div className="mt-3 space-y-2">
              {["FRAN - For Time", "HEAVY DAY - Strength", "CINDY - AMRAP 20"].map((wod) => (
                <div key={wod} className="rounded-lg bg-vytal-bg2 px-3 py-2 text-xs text-vytal-muted">{wod}</div>
              ))}
            </div>
          </div>

          {/* Equipment */}
          {exercise.equipment && exercise.equipment.length > 0 && (
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
              <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("exercises.equipmentLabel") || "Equipment Required"}</h3>
              <div className="space-y-2">
                {exercise.equipment.map((eq) => (
                  <div key={eq} className="flex items-center gap-2 rounded-lg bg-vytal-bg2 px-3 py-2">
                    <div className="h-2 w-2 rounded-full bg-vytal-green" />
                    <span className="text-sm text-vytal-text capitalize">{eq}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
