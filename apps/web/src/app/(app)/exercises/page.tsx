"use client";

import { useState, useMemo } from "react";
import { useDataStore } from "@/stores/data-store";
import type { ExerciseCategory } from "@vytal-fit/shared";
import Link from "next/link";
import { Search, Dumbbell, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";

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
  const { toast } = useToast();
  const storeExercises = useDataStore((s) => s.exercises);
  const addExercise = useDataStore((s) => s.addExercise);
  const updateExercise = useDataStore((s) => s.updateExercise);
  const deleteExercise = useDataStore((s) => s.deleteExercise);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ExerciseCategory | "all">("all");

  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState("");
  const [addCategory, setAddCategory] = useState<ExerciseCategory>("weightlifting");
  const [addEquipment, setAddEquipment] = useState("");
  const [addMuscleGroups, setAddMuscleGroups] = useState("");

  // Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState<ExerciseCategory>("weightlifting");
  const [editEquipment, setEditEquipment] = useState("");
  const [editMuscleGroups, setEditMuscleGroups] = useState("");

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const exercises = useMemo(() => {
    let filtered = storeExercises;
    if (activeCategory !== "all") {
      filtered = filtered.filter((e) => e.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((e) => e.name.toLowerCase().includes(q));
    }
    return filtered;
  }, [search, activeCategory, storeExercises]);

  function handleAdd() {
    if (!addName.trim()) { toast(t("exercises.nameRequired"), "error"); return; }
    addExercise({
      name: addName.trim(),
      category: addCategory,
      equipment: addEquipment ? addEquipment.split(",").map((s) => s.trim()).filter(Boolean) : [],
      muscleGroups: addMuscleGroups ? addMuscleGroups.split(",").map((s) => s.trim()).filter(Boolean) : [],
    });
    toast(t("exercises.exerciseAdded"), "success");
    setAddName(""); setAddEquipment(""); setAddMuscleGroups("");
    setShowAddForm(false);
  }

  function startEdit(ex: { id: string; name: string; category: ExerciseCategory; equipment?: string[]; muscleGroups?: string[] }) {
    setEditingId(ex.id);
    setEditName(ex.name);
    setEditCategory(ex.category);
    setEditEquipment(ex.equipment?.join(", ") ?? "");
    setEditMuscleGroups(ex.muscleGroups?.join(", ") ?? "");
  }

  function handleSaveEdit() {
    if (!editingId || !editName.trim()) return;
    updateExercise(editingId, {
      name: editName.trim(),
      category: editCategory,
      equipment: editEquipment ? editEquipment.split(",").map((s) => s.trim()).filter(Boolean) : [],
      muscleGroups: editMuscleGroups ? editMuscleGroups.split(",").map((s) => s.trim()).filter(Boolean) : [],
    });
    toast(t("exercises.exerciseUpdated"), "success");
    setEditingId(null);
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteExercise(deleteTarget.id);
    toast(t("exercises.exerciseDeleted"), "success");
    setDeleteTarget(null);
  }

  const inputClass =
    "w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("exercises.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">{t("exercises.subtitle")} ({storeExercises.length})</p>
        </div>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAddForm ? t("action.cancel") : t("exercises.addExercise")}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="rounded-xl border border-vytal-green/20 bg-vytal-green/5 p-5">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("exercises.addExercise")}</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("table.name")}</label>
              <input type="text" value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="e.g. Clean & Jerk" className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("exercises.category")}</label>
              <select value={addCategory} onChange={(e) => setAddCategory(e.target.value as ExerciseCategory)} className={inputClass}>
                {categories.map((c) => <option key={c} value={c}>{t(categoryConfig[c].labelKey)}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("exercises.equipmentComma")}</label>
              <input type="text" value={addEquipment} onChange={(e) => setAddEquipment(e.target.value)} placeholder="barbell, plates" className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("exercises.muscleGroupsComma")}</label>
              <input type="text" value={addMuscleGroups} onChange={(e) => setAddMuscleGroups(e.target.value)} placeholder="legs, shoulders" className={inputClass} />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={handleAdd} className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2 text-sm font-semibold text-vytal-bg hover:bg-vytal-green/90">
              <Check className="h-4 w-4" /> {t("action.save")}
            </button>
          </div>
        </div>
      )}

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setActiveCategory("all")} className={cn("rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors", activeCategory === "all" ? "bg-vytal-green/10 text-vytal-green" : "bg-vytal-bg2 text-vytal-muted hover:text-vytal-text")}>
          {t("expenses.all")}
        </button>
        {categories.map((cat) => {
          const config = categoryConfig[cat];
          const count = storeExercises.filter((e) => e.category === cat).length;
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
          const isEditing = editingId === exercise.id;

          if (isEditing) {
            return (
              <div key={exercise.id} className="rounded-xl border border-vytal-green/30 bg-vytal-green/5 p-4">
                <div className="space-y-3">
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} autoFocus />
                  <select value={editCategory} onChange={(e) => setEditCategory(e.target.value as ExerciseCategory)} className={inputClass}>
                    {categories.map((c) => <option key={c} value={c}>{t(categoryConfig[c].labelKey)}</option>)}
                  </select>
                  <input type="text" value={editEquipment} onChange={(e) => setEditEquipment(e.target.value)} placeholder={t("exercises.equipmentComma")} className={inputClass} />
                  <input type="text" value={editMuscleGroups} onChange={(e) => setEditMuscleGroups(e.target.value)} placeholder={t("exercises.muscleGroupsComma")} className={inputClass} />
                  <div className="flex gap-2">
                    <button onClick={handleSaveEdit} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-vytal-green px-3 py-1.5 text-xs font-semibold text-vytal-bg hover:bg-vytal-green/90">
                      <Check className="h-3 w-3" /> {t("action.save")}
                    </button>
                    <button onClick={() => setEditingId(null)} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs text-vytal-text hover:bg-vytal-bg3">
                      <X className="h-3 w-3" /> {t("action.cancel")}
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={exercise.id} className="rounded-xl border border-vytal-border bg-vytal-card p-4 transition-colors hover:border-[rgba(61,255,110,0.22)]">
              <div className="mb-3 flex items-start justify-between">
                <Link href={`/exercises/${exercise.id}`} className="flex items-center gap-2 hover:opacity-80">
                  <Dumbbell className="h-4 w-4 text-vytal-green" />
                  <span className="text-sm font-semibold text-vytal-text">{exercise.name}</span>
                </Link>
                <div className="flex items-center gap-1">
                  <button onClick={() => startEdit(exercise)} className="rounded p-1 text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text">
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button onClick={() => setDeleteTarget({ id: exercise.id, name: exercise.name })} className="rounded p-1 text-vytal-muted transition-colors hover:bg-vytal-red/10 hover:text-vytal-red">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium", catConfig.className)}>
                  {t(catConfig.labelKey)}
                </span>
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
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-12 text-center">
          <Dumbbell className="mx-auto h-8 w-8 text-vytal-muted" />
          <p className="mt-3 text-sm font-medium text-vytal-text">{t("exercises.noResults")}</p>
          <p className="mt-1 text-xs text-vytal-muted">
            {search ? t("exercises.noResultsFor").replace("{query}", search) : t("exercises.noResultsInCategory")}
          </p>
          {(search || activeCategory !== "all") && (
            <button onClick={() => { setSearch(""); setActiveCategory("all"); }} className="mt-4 rounded-lg border border-vytal-border px-4 py-2 text-xs font-medium text-vytal-text transition-colors hover:bg-vytal-bg3">
              {t("exercises.clearFilters")}
            </button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={t("exercises.deleteExercise")}
        description={t("exercises.confirmDelete").replace("{name}", deleteTarget?.name ?? "")}
        confirmLabel={t("action.delete")}
        cancelLabel={t("action.cancel")}
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
