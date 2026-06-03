"use client";

import { useState, useMemo } from "react";
import { mockExercises } from "@vytal-fit/shared";
import type { ExerciseCategory } from "@vytal-fit/shared";
import { Search, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

const categoryConfig: Record<
  ExerciseCategory,
  { label: string; className: string }
> = {
  weightlifting: {
    label: "Weightlifting",
    className: "bg-vytal-amber/10 text-vytal-amber",
  },
  gymnastics: {
    label: "Gymnastics",
    className: "bg-vytal-purple/10 text-vytal-purple",
  },
  cardio: {
    label: "Cardio",
    className: "bg-vytal-blue/10 text-vytal-blue",
  },
  strength: {
    label: "Strength",
    className: "bg-vytal-green/10 text-vytal-green",
  },
  mobility: {
    label: "Mobility",
    className: "bg-vytal-muted/20 text-vytal-muted",
  },
  other: {
    label: "Other",
    className: "bg-vytal-orange/10 text-vytal-orange",
  },
};

const categories: ExerciseCategory[] = [
  "weightlifting",
  "gymnastics",
  "cardio",
  "strength",
  "mobility",
  "other",
];

export default function ExercisesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    ExerciseCategory | "all"
  >("all");

  const exercises = useMemo(() => {
    let filtered = mockExercises;

    if (activeCategory !== "all") {
      filtered = filtered.filter((e) => e.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((e) => e.name.toLowerCase().includes(q));
    }

    return filtered;
  }, [search, activeCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-vytal-text">Exercise Library</h1>
        <p className="mt-1 text-sm text-vytal-muted">
          Browse and manage exercises ({mockExercises.length} total)
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
            activeCategory === "all"
              ? "bg-vytal-green/10 text-vytal-green"
              : "bg-vytal-bg2 text-vytal-muted hover:text-vytal-text"
          )}
        >
          All
        </button>
        {categories.map((cat) => {
          const config = categoryConfig[cat];
          const count = mockExercises.filter((e) => e.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                activeCategory === cat
                  ? config.className
                  : "bg-vytal-bg2 text-vytal-muted hover:text-vytal-text"
              )}
            >
              {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vytal-muted" />
        <input
          type="text"
          placeholder="Search exercises by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 py-2.5 pl-10 pr-4 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
        />
      </div>

      {/* Exercise Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {exercises.map((exercise) => {
          const catConfig = categoryConfig[exercise.category];
          return (
            <div
              key={exercise.id}
              className="rounded-xl border border-vytal-border bg-vytal-card p-4 transition-colors hover:border-[rgba(61,255,110,0.22)]"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-vytal-green" />
                  <span className="text-sm font-semibold text-vytal-text">
                    {exercise.name}
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium",
                    catConfig.className
                  )}
                >
                  {catConfig.label}
                </span>
              </div>

              {exercise.equipment && exercise.equipment.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {exercise.equipment.map((eq) => (
                    <span
                      key={eq}
                      className="rounded bg-vytal-bg3 px-1.5 py-0.5 text-[10px] text-vytal-muted"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              )}

              {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {exercise.muscleGroups.map((mg) => (
                    <span
                      key={mg}
                      className="rounded border border-vytal-border px-1.5 py-0.5 text-[10px] text-vytal-muted"
                    >
                      {mg}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {exercises.length === 0 && (
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-8 text-center">
          <p className="text-sm text-vytal-muted">
            No exercises found matching your filters
          </p>
        </div>
      )}
    </div>
  );
}
