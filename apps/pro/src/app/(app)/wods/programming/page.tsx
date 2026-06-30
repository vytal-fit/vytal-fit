"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { rowsToWODs } from "@/lib/wod-mapper";
import { rowsToExercises, rowsToClassTypes } from "@/lib/reference-mappers";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Download,
  Share2,
  X,
  Dumbbell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WOD, WODType } from "@vytal-fit/shared";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const wodTypeColors: Record<WODType, string> = {
  amrap: "bg-vytal-green/10 text-vytal-green border-vytal-green/20",
  emom: "bg-vytal-blue/10 text-vytal-blue border-vytal-blue/20",
  for_time: "bg-vytal-red/10 text-vytal-red border-vytal-red/20",
  tabata: "bg-vytal-amber/10 text-vytal-amber border-vytal-amber/20",
  strength: "bg-vytal-purple/10 text-vytal-purple border-vytal-purple/20",
  custom: "bg-vytal-muted/10 text-vytal-muted border-vytal-muted/20",
};

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function formatDateShort(d: Date): string {
  return d.toLocaleDateString("pt-PT", { day: "numeric", month: "short" });
}

interface CreateWodForm {
  title: string;
  type: WODType;
  exercises: string;
}

export default function WodProgrammingPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const wodsQuery = trpc.wods.list.useQuery({});
  const exercisesQuery = trpc.exercises.list.useQuery({});
  const classTypesQuery = trpc.classTypes.list.useQuery();
  const storeWODs = useMemo(() => {
    const exercisesById = new Map(
      rowsToExercises(exercisesQuery.data ?? []).map((ex) => [ex.id, ex]),
    );
    return rowsToWODs(wodsQuery.data ?? [], exercisesById);
  }, [wodsQuery.data, exercisesQuery.data]);
  const storeClassTypes = useMemo(
    () => rowsToClassTypes(classTypesQuery.data ?? []),
    [classTypesQuery.data],
  );

  const [selectedClassTypeId, setSelectedClassTypeId] = useState("");
  // Default to the first real class type once the catalogue loads.
  if (!selectedClassTypeId && storeClassTypes[0]) {
    setSelectedClassTypeId(storeClassTypes[0].id);
  }
  const [numWeeks, setNumWeeks] = useState(4);
  const [weekOffset, setWeekOffset] = useState(0);
  const [createModal, setCreateModal] = useState<{
    weekIdx: number;
    dayIdx: number;
    date: string;
  } | null>(null);
  const [viewWod, setViewWod] = useState<WOD | null>(null);
  const [form, setForm] = useState<CreateWodForm>({
    title: "",
    type: "for_time",
    exercises: "",
  });

  const baseMonday = useMemo(() => {
    const today = new Date();
    const monday = getMonday(today);
    return addDays(monday, weekOffset * 7);
  }, [weekOffset]);

  const weeks = useMemo(() => {
    return Array.from({ length: numWeeks }, (_, wi) => {
      const weekStart = addDays(baseMonday, wi * 7);
      const days = Array.from({ length: 7 }, (_, di) => {
        const date = addDays(weekStart, di);
        const dateStr = formatDate(date);
        const dayWods = storeWODs.filter(
          (w) =>
            w.date === dateStr &&
            (w.classTypeId === selectedClassTypeId || !w.classTypeId)
        );
        return { date, dateStr, wods: dayWods };
      });
      return { weekStart, days };
    });
  }, [baseMonday, numWeeks, storeWODs, selectedClassTypeId]);

  const startDate = weeks[0]?.days[0]?.date;
  const endDate = weeks[weeks.length - 1]?.days[6]?.date;

  function handleCreateWod() {
    if (!form.title.trim()) {
      toast(t("programming.titleRequired"), "error");
      return;
    }
    toast(
      t("programming.wodCreated").replace("{date}", createModal?.date ?? ""),
      "success"
    );
    setCreateModal(null);
    setForm({ title: "", type: "for_time", exercises: "" });
  }

  function handleExportPDF() {
    toast(t("programming.exportPdf"), "info");
  }

  function handleExportExcel() {
    toast(t("programming.exportExcel"), "info");
  }

  function handleShare() {
    toast(t("programming.shared"), "success");
  }

  const selectedClassType = storeClassTypes.find(
    (ct) => ct.id === selectedClassTypeId
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: t("nav.wods"), href: "/wods" },
          { label: t("nav.programming") },
        ]}
      />

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">
            {t("programming.title")}
          </h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("programming.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 rounded-lg border border-vytal-border px-3 py-2 text-sm text-vytal-text transition-colors hover:bg-vytal-bg3"
          >
            <Download className="h-3.5 w-3.5" />
            PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 rounded-lg border border-vytal-border px-3 py-2 text-sm text-vytal-text transition-colors hover:bg-vytal-bg3"
          >
            <Download className="h-3.5 w-3.5" />
            Excel
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
          >
            <Share2 className="h-3.5 w-3.5" />
            {t("programming.share")}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-vytal-border bg-vytal-card p-4">
        {/* Class type */}
        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-vytal-muted">
            {t("programming.classType")}
          </label>
          <select
            value={selectedClassTypeId}
            onChange={(e) => setSelectedClassTypeId(e.target.value)}
            className="rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
          >
            {storeClassTypes.map((ct) => (
              <option key={ct.id} value={ct.id}>
                {ct.name}
              </option>
            ))}
          </select>
        </div>

        {/* Number of weeks */}
        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-vytal-muted">
            {t("programming.weeks")}
          </label>
          <select
            value={numWeeks}
            onChange={(e) => setNumWeeks(Number(e.target.value))}
            className="rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
          >
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} {i === 0 ? t("programming.week") : t("programming.weeksLabel")}
              </option>
            ))}
          </select>
        </div>

        {/* Week navigation */}
        <div className="flex items-end gap-2">
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-vytal-muted">
              {t("programming.dateRange")}
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeekOffset((o) => o - 1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-vytal-border text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[180px] text-center text-sm font-medium text-vytal-text">
                {startDate ? formatDateShort(startDate) : ""} &mdash;{" "}
                {endDate ? formatDateShort(endDate) : ""}
              </span>
              <button
                onClick={() => setWeekOffset((o) => o + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-vytal-border text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {selectedClassType && (
          <div className="ml-auto flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: selectedClassType.color }}
            />
            <span className="text-sm font-medium text-vytal-text">
              {selectedClassType.name}
            </span>
          </div>
        )}
      </div>

      {/* Weekly Grid */}
      <div className="space-y-1">
        {/* Day headers */}
        <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-1">
          <div />
          {DAY_LABELS.map((day) => (
            <div
              key={day}
              className="rounded-t-lg bg-vytal-bg3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-vytal-muted"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Week rows */}
        {weeks.map((week, wi) => (
          <div
            key={wi}
            className="grid grid-cols-[100px_repeat(7,1fr)] gap-1"
          >
            {/* Week label */}
            <div className="flex items-start justify-center rounded-l-lg bg-vytal-bg3 px-2 py-3">
              <div className="text-center">
                <span className="block text-xs font-semibold text-vytal-text">
                  {t("programming.weekLabel")} {wi + 1}
                </span>
                <span className="block text-[10px] text-vytal-muted">
                  {formatDateShort(week.weekStart)}
                </span>
              </div>
            </div>

            {/* Day cells */}
            {week.days.map((day, di) => {
              const hasWods = day.wods.length > 0;
              const isToday = day.dateStr === formatDate(new Date());

              return (
                <div
                  key={di}
                  className={cn(
                    "group min-h-[80px] rounded-lg border p-2 transition-colors",
                    isToday
                      ? "border-vytal-green/30 bg-vytal-green/5"
                      : "border-vytal-border bg-vytal-card hover:border-[rgba(61,255,110,0.22)]"
                  )}
                >
                  <div className="mb-1 text-[10px] text-vytal-muted">
                    {formatDateShort(day.date)}
                  </div>
                  {hasWods ? (
                    <div className="space-y-1">
                      {day.wods.map((wod) => {
                        const mainPart = wod.parts.find(
                          (p) =>
                            p.type !== "custom" &&
                            p.name !== "Warm Up" &&
                            p.name !== "Cool Down"
                        );
                        const mainType = mainPart?.type ?? "custom";
                        return (
                          <button
                            key={wod.id}
                            onClick={() => setViewWod(wod)}
                            className={cn(
                              "w-full truncate rounded border px-1.5 py-1 text-left text-[11px] font-medium transition-colors",
                              wodTypeColors[mainType]
                            )}
                            title={wod.title}
                          >
                            {wod.title || "WOD"}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        setCreateModal({
                          weekIdx: wi,
                          dayIdx: di,
                          date: day.dateStr,
                        })
                      }
                      className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-transparent py-3 text-vytal-muted/40 opacity-0 transition-all group-hover:border-vytal-border group-hover:opacity-100 hover:text-vytal-green"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Create WOD Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-vytal-border bg-vytal-card p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-vytal-text">
                {t("programming.createWod")} &mdash; {createModal.date}
              </h3>
              <button
                onClick={() => setCreateModal(null)}
                className="text-vytal-muted transition-colors hover:text-vytal-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("programming.wodTitle")}
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g., FRAN, MURPH..."
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("programming.wodType")}
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      type: e.target.value as WODType,
                    }))
                  }
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                >
                  <option value="amrap">AMRAP</option>
                  <option value="emom">EMOM</option>
                  <option value="for_time">For Time</option>
                  <option value="tabata">Tabata</option>
                  <option value="strength">Strength</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("programming.exercises")}
                </label>
                <textarea
                  value={form.exercises}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, exercises: e.target.value }))
                  }
                  rows={4}
                  placeholder="21-15-9 Thrusters / Pull-ups..."
                  className="w-full resize-none rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setCreateModal(null)}
                  className="rounded-lg border border-vytal-border px-4 py-2 text-sm text-vytal-text transition-colors hover:bg-vytal-bg3"
                >
                  {t("action.cancel")}
                </button>
                <button
                  onClick={handleCreateWod}
                  className="rounded-lg bg-vytal-green px-6 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
                >
                  {t("action.create")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View WOD Modal */}
      {viewWod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-vytal-border bg-vytal-card p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-vytal-text">
                  {viewWod.title || "WOD"}
                </h3>
                <p className="text-xs text-vytal-muted">{viewWod.date}</p>
              </div>
              <button
                onClick={() => setViewWod(null)}
                className="text-vytal-muted transition-colors hover:text-vytal-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {viewWod.description && (
              <p className="mb-4 text-sm text-vytal-muted">
                {viewWod.description}
              </p>
            )}
            <div className="space-y-4">
              {viewWod.parts.map((part, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-vytal-text">
                      {part.name}
                    </h4>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                        wodTypeColors[part.type]
                      )}
                    >
                      {part.type.replace("_", " ")}
                    </span>
                  </div>
                  <div className="space-y-1 border-l-2 border-vytal-border pl-3">
                    {part.exercises.map((ex, ei) => (
                      <div
                        key={ei}
                        className="flex items-start gap-3 py-1"
                      >
                        <Dumbbell className="mt-0.5 h-3 w-3 shrink-0 text-vytal-green" />
                        <span className="text-sm text-vytal-text">
                          {ex.exercise.name}
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
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => {
                  router.push("/wods");
                }}
                className="rounded-lg bg-vytal-green px-6 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
              >
                {t("action.edit")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
