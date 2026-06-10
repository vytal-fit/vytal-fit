"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  Clock,
  Repeat,
  Dumbbell,
  Flame,
  Zap,
  Timer,
  ChevronRight,
  GripVertical,
  Eye,
} from "lucide-react";
import { useDataStore } from "@/stores/data-store";
import type { WODType, Exercise } from "@vytal-fit/shared";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/toast";
import { useI18n } from "@/lib/i18n";

const PART_NAMES = ["Warm Up", "Skill", "Strength", "WOD", "Cool Down", "Custom"];

const WOD_TYPES: { value: WODType; label: string }[] = [
  { value: "amrap", label: "AMRAP" },
  { value: "emom", label: "EMOM" },
  { value: "for_time", label: "For Time" },
  { value: "tabata", label: "Tabata" },
  { value: "strength", label: "Strength" },
  { value: "custom", label: "Custom" },
];

const wodTypeConfig: Record<WODType, { label: string; className: string; icon: React.ReactNode }> = {
  amrap: { label: "AMRAP", className: "bg-vytal-green/10 text-vytal-green", icon: <Repeat className="h-3 w-3" /> },
  emom: { label: "EMOM", className: "bg-vytal-blue/10 text-vytal-blue", icon: <Timer className="h-3 w-3" /> },
  for_time: { label: "For Time", className: "bg-vytal-red/10 text-vytal-red", icon: <Flame className="h-3 w-3" /> },
  tabata: { label: "Tabata", className: "bg-vytal-amber/10 text-vytal-amber", icon: <Zap className="h-3 w-3" /> },
  strength: { label: "Strength", className: "bg-vytal-purple/10 text-vytal-purple", icon: <Dumbbell className="h-3 w-3" /> },
  custom: { label: "Custom", className: "bg-vytal-muted/10 text-vytal-muted", icon: <ChevronRight className="h-3 w-3" /> },
};

interface PartExercise {
  exerciseId: string;
  exercise: Exercise | null;
  reps: string;
  weight: string;
  notes: string;
}

interface Part {
  id: string;
  name: string;
  type: WODType;
  timeCap: string;
  rounds: string;
  exercises: PartExercise[];
}

function ExerciseSearch({
  onSelect,
}: {
  onSelect: (ex: Exercise) => void;
}) {
  const { t } = useI18n();
  const storeExercises = useDataStore((s) => s.exercises);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = query.trim()
    ? storeExercises.filter((e) =>
        e.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : storeExercises.slice(0, 8);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-vytal-muted" />
        <input
          type="text"
          placeholder={t("wodBuilder.searchExercise")}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 py-2 pl-8 pr-3 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
        />
      </div>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-vytal-border bg-vytal-bg2 shadow-xl">
          {filtered.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => {
                onSelect(ex);
                setQuery("");
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-vytal-text transition-colors hover:bg-vytal-bg3"
            >
              <Dumbbell className="h-3 w-3 shrink-0 text-vytal-green" />
              <span>{ex.name}</span>
              <span className="ml-auto text-[10px] text-vytal-muted">
                {ex.category}
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-4 text-center text-xs text-vytal-muted">
              {t("wodBuilder.noExercisesFound")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

let partIdCounter = 0;

export default function WODBuilderPage() {
  const { t } = useI18n();
  const storeClassTypes = useDataStore((s) => s.classTypes);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [classTypeId, setClassTypeId] = useState(storeClassTypes[0]?.id ?? "ct-1");
  const { toast } = useToast();
  const [parts, setParts] = useState<Part[]>([
    {
      id: `part-${partIdCounter++}`,
      name: "Warm Up",
      type: "custom",
      timeCap: "",
      rounds: "",
      exercises: [],
    },
    {
      id: `part-${partIdCounter++}`,
      name: "WOD",
      type: "for_time",
      timeCap: "12",
      rounds: "",
      exercises: [],
    },
    {
      id: `part-${partIdCounter++}`,
      name: "Cool Down",
      type: "custom",
      timeCap: "",
      rounds: "",
      exercises: [],
    },
  ]);

  // Drag state for exercise reordering
  const [dragExercise, setDragExercise] = useState<{ partId: string; exIdx: number } | null>(null);

  function addPart() {
    setParts((prev) => [
      ...prev,
      {
        id: `part-${partIdCounter++}`,
        name: "Custom",
        type: "custom",
        timeCap: "",
        rounds: "",
        exercises: [],
      },
    ]);
  }

  function removePart(partId: string) {
    setParts((prev) => prev.filter((p) => p.id !== partId));
  }

  function updatePart(partId: string, updates: Partial<Part>) {
    setParts((prev) =>
      prev.map((p) => (p.id === partId ? { ...p, ...updates } : p))
    );
  }

  function addExercise(partId: string, exercise: Exercise) {
    setParts((prev) =>
      prev.map((p) =>
        p.id === partId
          ? {
              ...p,
              exercises: [
                ...p.exercises,
                {
                  exerciseId: exercise.id,
                  exercise,
                  reps: "",
                  weight: "",
                  notes: "",
                },
              ],
            }
          : p
      )
    );
  }

  function updateExercise(
    partId: string,
    exIdx: number,
    updates: Partial<PartExercise>
  ) {
    setParts((prev) =>
      prev.map((p) =>
        p.id === partId
          ? {
              ...p,
              exercises: p.exercises.map((ex, i) =>
                i === exIdx ? { ...ex, ...updates } : ex
              ),
            }
          : p
      )
    );
  }

  function removeExercise(partId: string, exIdx: number) {
    setParts((prev) =>
      prev.map((p) =>
        p.id === partId
          ? { ...p, exercises: p.exercises.filter((_, i) => i !== exIdx) }
          : p
      )
    );
  }

  const handleExDragStart = useCallback(
    (partId: string, exIdx: number) => {
      setDragExercise({ partId, exIdx });
    },
    []
  );

  const handleExDrop = useCallback(
    (partId: string, targetIdx: number) => {
      if (!dragExercise || dragExercise.partId !== partId) {
        setDragExercise(null);
        return;
      }
      const sourceIdx = dragExercise.exIdx;
      if (sourceIdx === targetIdx) {
        setDragExercise(null);
        return;
      }
      setParts((prev) =>
        prev.map((p) => {
          if (p.id !== partId) return p;
          const newExercises = [...p.exercises];
          const [moved] = newExercises.splice(sourceIdx, 1);
          newExercises.splice(targetIdx, 0, moved);
          return { ...p, exercises: newExercises };
        })
      );
      setDragExercise(null);
    },
    [dragExercise]
  );

  function handlePublish() {
    toast(t("toast.wodPublished").replace("{date}", date), "success");
  }

  function handleSaveDraft() {
    toast(t("toast.draftSaved"), "info");
  }

  const selectedClassType = storeClassTypes.find((ct) => ct.id === classTypeId);

  // Determine which fields to show per type
  function showTimeCap(type: WODType) {
    return type === "amrap" || type === "for_time" || type === "tabata";
  }
  function showRounds(type: WODType) {
    return type === "emom" || type === "tabata";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/wods"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("wodBuilder.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("wodBuilder.subtitle")}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Editor - Left */}
        <div className="space-y-6 lg:col-span-3">
          {/* Basic Info */}
          <div className="space-y-4 rounded-xl border border-vytal-border bg-vytal-card p-6">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("wods.title")}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("wodBuilder.titlePlaceholder")}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("wodBuilder.date")}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("wodBuilder.classType")}
                </label>
                <select
                  value={classTypeId}
                  onChange={(e) => setClassTypeId(e.target.value)}
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                >
                  {storeClassTypes.map((ct) => (
                    <option key={ct.id} value={ct.id}>
                      {ct.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Parts */}
          {parts.map((part, partIdx) => (
            <div
              key={part.id}
              className="space-y-4 rounded-xl border border-vytal-border bg-vytal-card p-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-vytal-text">
                  {t("wodBuilder.partName")} {partIdx + 1}
                </h3>
                {parts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePart(part.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-vytal-muted transition-colors hover:bg-vytal-red/10 hover:text-vytal-red"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-vytal-muted">
                    {t("wodBuilder.partName")}
                  </label>
                  <select
                    value={part.name}
                    onChange={(e) =>
                      updatePart(part.id, { name: e.target.value })
                    }
                    className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                  >
                    {PART_NAMES.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-vytal-muted">
                    {t("wodBuilder.type")}
                  </label>
                  <select
                    value={part.type}
                    onChange={(e) =>
                      updatePart(part.id, {
                        type: e.target.value as WODType,
                      })
                    }
                    className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                  >
                    {WOD_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                {showTimeCap(part.type) && (
                  <div>
                    <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-vytal-muted">
                      {t("wods.timeCap")} (min)
                    </label>
                    <input
                      type="number"
                      value={part.timeCap}
                      onChange={(e) =>
                        updatePart(part.id, { timeCap: e.target.value })
                      }
                      placeholder="--"
                      className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                    />
                  </div>
                )}
                {showRounds(part.type) && (
                  <div>
                    <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-vytal-muted">
                      {t("wods.rounds")}
                    </label>
                    <input
                      type="number"
                      value={part.rounds}
                      onChange={(e) =>
                        updatePart(part.id, { rounds: e.target.value })
                      }
                      placeholder="--"
                      className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                    />
                  </div>
                )}
                {!showTimeCap(part.type) && (
                  <div>
                    <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-vytal-muted">
                      {t("wods.timeCap")} (min)
                    </label>
                    <input
                      type="number"
                      value={part.timeCap}
                      onChange={(e) =>
                        updatePart(part.id, { timeCap: e.target.value })
                      }
                      placeholder="--"
                      className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                    />
                  </div>
                )}
                {!showRounds(part.type) && (
                  <div>
                    <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-vytal-muted">
                      {t("wods.rounds")}
                    </label>
                    <input
                      type="number"
                      value={part.rounds}
                      onChange={(e) =>
                        updatePart(part.id, { rounds: e.target.value })
                      }
                      placeholder="--"
                      className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                    />
                  </div>
                )}
              </div>

              {/* Exercises */}
              <div className="space-y-2">
                <span className="text-[10px] font-medium uppercase tracking-wider text-vytal-muted">
                  {t("wods.exercises")}
                </span>
                {part.exercises.map((ex, exIdx) => (
                  <div
                    key={exIdx}
                    draggable
                    onDragStart={() => handleExDragStart(part.id, exIdx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleExDrop(part.id, exIdx)}
                    className={cn(
                      "flex items-start gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 p-3 transition-opacity",
                      dragExercise?.partId === part.id && dragExercise?.exIdx === exIdx && "opacity-40"
                    )}
                  >
                    <GripVertical className="mt-2 h-3.5 w-3.5 shrink-0 cursor-grab text-vytal-muted/50" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="h-3.5 w-3.5 shrink-0 text-vytal-green" />
                        <span className="text-sm font-medium text-vytal-text">
                          {ex.exercise?.name ?? "Unknown"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={ex.reps}
                          onChange={(e) =>
                            updateExercise(part.id, exIdx, {
                              reps: e.target.value,
                            })
                          }
                          placeholder={t("wodBuilder.reps")}
                          className="rounded border border-vytal-border bg-vytal-bg px-2 py-1 text-xs text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={ex.weight}
                          onChange={(e) =>
                            updateExercise(part.id, exIdx, {
                              weight: e.target.value,
                            })
                          }
                          placeholder={t("wodBuilder.weight")}
                          className="rounded border border-vytal-border bg-vytal-bg px-2 py-1 text-xs text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={ex.notes}
                          onChange={(e) =>
                            updateExercise(part.id, exIdx, {
                              notes: e.target.value,
                            })
                          }
                          placeholder={t("wodBuilder.notes")}
                          className="rounded border border-vytal-border bg-vytal-bg px-2 py-1 text-xs text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExercise(part.id, exIdx)}
                      className="mt-1 flex h-6 w-6 items-center justify-center rounded text-vytal-muted transition-colors hover:bg-vytal-red/10 hover:text-vytal-red"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                <ExerciseSearch
                  onSelect={(exercise) => addExercise(part.id, exercise)}
                />
              </div>
            </div>
          ))}

          {/* Add Part Button */}
          <button
            type="button"
            onClick={addPart}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-vytal-border py-4 text-sm text-vytal-muted transition-colors hover:border-vytal-green/30 hover:text-vytal-green"
          >
            <Plus className="h-4 w-4" />
            {t("wodBuilder.addPart")}
          </button>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handlePublish}
              className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-all hover:bg-vytal-green/90"
            >
              {t("action.publish")}
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex items-center gap-2 rounded-lg border border-vytal-border px-6 py-2.5 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
            >
              {t("action.saveDraft")}
            </button>
          </div>
        </div>

        {/* Preview - Right */}
        <div className="lg:col-span-2">
          <div className="sticky top-6">
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
              <div className="mb-5 flex items-center gap-2">
                <Eye className="h-4 w-4 text-vytal-muted" />
                <h3 className="text-sm font-semibold text-vytal-text">
                  {t("wodBuilder.preview")}
                </h3>
              </div>

              {/* Preview Header */}
              <div className="mb-5">
                <div className="mb-1 flex items-center gap-3">
                  {title && (
                    <h4 className="text-lg font-bold text-vytal-text">
                      {title}
                    </h4>
                  )}
                  {!title && (
                    <h4 className="text-lg font-bold italic text-vytal-muted">
                      {t("wodBuilder.untitledWod")}
                    </h4>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-vytal-muted">
                  <span>{date}</span>
                  {selectedClassType && (
                    <span className="flex items-center gap-1.5">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: selectedClassType.color,
                        }}
                      />
                      {selectedClassType.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Preview Parts */}
              <div className="space-y-4">
                {parts.map((part) => {
                  const config = wodTypeConfig[part.type];

                  return (
                    <div key={part.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-semibold text-vytal-text">
                          {part.name}
                        </h5>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                            config.className
                          )}
                        >
                          {config.icon}
                          {config.label}
                        </span>
                        {part.timeCap && (
                          <span className="flex items-center gap-1 text-[10px] text-vytal-muted">
                            <Clock className="h-3 w-3" />
                            {t("wodBuilder.minLabel").replace("{timeCap}", part.timeCap)}
                          </span>
                        )}
                        {part.rounds && (
                          <span className="flex items-center gap-1 text-[10px] text-vytal-muted">
                            <Repeat className="h-3 w-3" />
                            {t("wodBuilder.rdsLabel").replace("{rounds}", part.rounds)}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 border-l-2 border-vytal-border pl-3">
                        {part.exercises.map((ex, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 py-1"
                          >
                            <span className="text-sm font-medium text-vytal-text">
                              {ex.exercise?.name ?? "Unknown"}
                            </span>
                            {ex.reps && (
                              <span className="font-mono text-xs text-vytal-green">
                                {ex.reps}
                              </span>
                            )}
                            {ex.weight && (
                              <span className="font-mono text-xs text-vytal-amber">
                                {ex.weight}
                              </span>
                            )}
                            {ex.notes && (
                              <span className="text-xs italic text-vytal-muted">
                                {ex.notes}
                              </span>
                            )}
                          </div>
                        ))}
                        {part.exercises.length === 0 && (
                          <p className="py-1 text-xs italic text-vytal-muted">
                            {t("wodBuilder.noExercisesAdded")}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
