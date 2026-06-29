"use client";

import { useState, useMemo } from "react";
import type { ExerciseCategory } from "@vytal-fit/shared";
import Link from "next/link";
import Image from "next/image";
import { Search, Dumbbell, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { rowsToExercises } from "@/lib/reference-mappers";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/skeleton";

const categoryConfig: Record<ExerciseCategory, { labelKey: string; className: string }> = {
  weightlifting: { labelKey: "exercises.category.weightlifting", className: "bg-vytal-amber/10 text-vytal-amber" },
  gymnastics: { labelKey: "exercises.category.gymnastics", className: "bg-vytal-purple/10 text-vytal-purple" },
  cardio: { labelKey: "exercises.category.cardio", className: "bg-vytal-blue/10 text-vytal-blue" },
  strength: { labelKey: "exercises.category.strength", className: "bg-vytal-green/10 text-vytal-green" },
  mobility: { labelKey: "exercises.category.mobility", className: "bg-vytal-muted/20 text-vytal-muted" },
  other: { labelKey: "exercises.category.other", className: "bg-vytal-orange/10 text-vytal-orange" },
};

const categories: ExerciseCategory[] = ["weightlifting", "gymnastics", "cardio", "strength", "mobility", "other"];

export default function ExercisesPage() {
  const { t } = useI18n();

  // ── tRPC: global exercise library (read-only router by design — the
  // library is shared across orgs, so there are no create/edit/delete
  // controls on this page). Category filtering/search stays client-side so
  // the pill counts work off a single fetch.
  const listQuery = trpc.exercises.list.useQuery({});
  const fetchedExercises = useMemo(
    () => rowsToExercises(listQuery.data ?? []),
    [listQuery.data],
  );

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ExerciseCategory | "all">("all");

  const exercises = useMemo(() => {
    let filtered = fetchedExercises;
    if (activeCategory !== "all") {
      filtered = filtered.filter((e) => e.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((e) => e.name.toLowerCase().includes(q));
    }
    return filtered;
  }, [search, activeCategory, fetchedExercises]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-vytal-text">{t("exercises.title")}</h1>
        <p className="mt-1 text-sm text-vytal-muted">{t("exercises.subtitle")} ({fetchedExercises.length})</p>
      </div>

      {listQuery.isError ? (
        <EmptyState
          icon={AlertTriangle}
          title={t("ui.error")}
          description={t("exercises.loadError")}
          action={{ label: t("billing.retry"), onClick: () => void listQuery.refetch() }}
        />
      ) : listQuery.isPending ? (
        <>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-7 w-24 rounded-full" />)}
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[140px] rounded-xl" />)}
          </div>
        </>
      ) : (
        <>
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActiveCategory("all")} className={cn("rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors", activeCategory === "all" ? "bg-vytal-green/10 text-vytal-green" : "bg-vytal-bg2 text-vytal-muted hover:text-vytal-text")}>
              {t("expenses.all")}
            </button>
            {categories.map((cat) => {
              const config = categoryConfig[cat];
              const count = fetchedExercises.filter((e) => e.category === cat).length;
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={cn("rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors", activeCategory === cat ? config.className : "bg-vytal-bg2 text-vytal-muted hover:text-vytal-text")}>
                  {t(config.labelKey)} ({count})
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vytal-muted" />
            <input type="text" placeholder={t("exercises.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 py-2.5 pl-10 pr-4 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20" />
          </div>

          {/* Exercise Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {exercises.map((exercise) => {
              const catConfig = categoryConfig[exercise.category];
              const mediaSrc = exercise.gifUrl ?? exercise.thumbnailUrl;

              return (
                <div key={exercise.id} className="rounded-xl border border-vytal-border bg-vytal-card p-4 card-interactive transition-colors hover:border-[rgba(34,197,94,0.22)]">
                  {mediaSrc && (
                    <div className="mb-3 overflow-hidden rounded-lg border border-vytal-border bg-vytal-bg2">
                      <div className="relative aspect-[16/10]">
                        <Image
                          src={mediaSrc}
                          alt={exercise.name}
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <Link href={`/exercises/${exercise.id}`} className="flex items-center gap-2 hover:opacity-80">
                      <Dumbbell className="h-4 w-4 text-vytal-green" />
                      <span className="text-sm font-semibold text-vytal-text">{exercise.name}</span>
                    </Link>
                  </div>

                  <div className="mb-3">
                    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium", catConfig.className)}>
                      {t(catConfig.labelKey)}
                    </span>
                    {exercise.videoUrl && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-vytal-red/10 px-2.5 py-0.5 text-[10px] font-medium text-vytal-red">
                        {t("exercises.demoLabel")}
                      </span>
                    )}
                    {exercise.instructions && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-vytal-blue/10 px-2.5 py-0.5 text-[10px] font-medium text-vytal-blue">
                        {t("exercises.instructionsBadge")}
                      </span>
                    )}
                  </div>

                  {exercise.equipment && exercise.equipment.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {exercise.equipment.map((eq) => (
                        <span key={eq} className="rounded bg-vytal-bg3 px-1.5 py-0.5 text-[10px] text-vytal-muted">{eq}</span>
                      ))}
                    </div>
                  )}

                  {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {exercise.muscleGroups.map((mg) => (
                        <span key={mg} className="rounded border border-vytal-border px-1.5 py-0.5 text-[10px] text-vytal-muted">{mg}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {exercises.length === 0 && (
            <EmptyState
              icon={Dumbbell}
              title={t("exercises.noResults")}
              description={search ? t("exercises.noResultsFor").replace("{query}", search) : t("exercises.noResultsInCategory")}
              action={
                search || activeCategory !== "all"
                  ? { label: t("exercises.clearFilters"), onClick: () => { setSearch(""); setActiveCategory("all"); } }
                  : undefined
              }
            />
          )}
        </>
      )}
    </div>
  );
}
