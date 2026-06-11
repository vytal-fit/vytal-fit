"use client";

import type { ClassType, WOD, WODPart, WODType } from "@vytal-fit/shared";
import { Dumbbell, Clock, Flame, Zap, Timer, Repeat, ChevronRight, Plus, Copy, Check, Pencil, X, Send, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { useState, useCallback, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { rowsToWODs, type WodRow } from "@/lib/wod-mapper";
import { rowsToClassTypes, rowsToExercises } from "@/lib/reference-mappers";
import { Skeleton } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";

const wodTypeConfig: Record<
  WODType,
  { label: string; className: string; icon: React.ReactNode }
> = {
  amrap: {
    label: "AMRAP",
    className: "bg-vytal-green/10 text-vytal-green",
    icon: <Repeat className="h-3 w-3" />,
  },
  emom: {
    label: "EMOM",
    className: "bg-vytal-blue/10 text-vytal-blue",
    icon: <Timer className="h-3 w-3" />,
  },
  for_time: {
    label: "For Time",
    className: "bg-vytal-red/10 text-vytal-red",
    icon: <Flame className="h-3 w-3" />,
  },
  tabata: {
    label: "Tabata",
    className: "bg-vytal-amber/10 text-vytal-amber",
    icon: <Zap className="h-3 w-3" />,
  },
  strength: {
    label: "Strength",
    className: "bg-vytal-purple/10 text-vytal-purple",
    icon: <Dumbbell className="h-3 w-3" />,
  },
  custom: {
    label: "Custom",
    className: "bg-vytal-muted/10 text-vytal-muted",
    icon: <ChevronRight className="h-3 w-3" />,
  },
};

function WODTypeBadge({ type }: { type: WODType }) {
  const config = wodTypeConfig[type];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        config.className
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

function estimateDuration(wod: WOD): number {
  let totalMinutes = 0;
  for (const part of wod.parts) {
    if (part.timeCap) {
      totalMinutes += part.timeCap;
    } else if (part.type === "emom" && part.rounds && part.intervalSeconds) {
      totalMinutes += Math.ceil((part.rounds * part.intervalSeconds) / 60);
    } else if (part.exercises.length > 0) {
      // Rough estimate: ~2 min per exercise for warm-ups/cool-downs
      totalMinutes += part.exercises.length * 2;
    } else {
      totalMinutes += 5; // default for empty parts
    }
  }
  return totalMinutes;
}

function wodToClipboardText(wod: WOD): string {
  const lines: string[] = [];
  if (wod.title) lines.push(wod.title);
  if (wod.description) lines.push(wod.description);
  lines.push("");
  for (const part of wod.parts) {
    let partHeader = part.name;
    if (part.type !== "custom") partHeader += ` (${wodTypeConfig[part.type].label})`;
    if (part.timeCap) partHeader += ` - ${part.timeCap} min`;
    if (part.rounds) partHeader += ` - ${part.rounds} rounds`;
    lines.push(partHeader);
    for (const ex of part.exercises) {
      let exLine = `  ${ex.exercise.name}`;
      if (ex.reps) exLine += ` ${ex.reps}`;
      if (ex.weight) exLine += ` @ ${ex.weight}`;
      if (ex.notes) exLine += ` (${ex.notes})`;
      lines.push(exLine);
    }
    lines.push("");
  }
  return lines.join("\n").trim();
}

function PartSection({ part }: { part: WODPart }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-semibold text-vytal-text">{part.name}</h4>
        <WODTypeBadge type={part.type} />
        {part.timeCap && (
          <span className="flex items-center gap-1 text-[10px] text-vytal-muted">
            <Clock className="h-3 w-3" />
            {part.timeCap} min
          </span>
        )}
        {part.rounds && (
          <span className="flex items-center gap-1 text-[10px] text-vytal-muted">
            <Repeat className="h-3 w-3" />
            {part.rounds} rounds
          </span>
        )}
        {part.intervalSeconds && (
          <span className="text-[10px] text-vytal-muted">
            @ {part.intervalSeconds}s
          </span>
        )}
      </div>
      <div className="space-y-1 pl-3 border-l-2 border-vytal-border">
        {part.exercises.map((ex, i) => (
          <div
            key={`${ex.exerciseId}-${i}`}
            className="flex items-start gap-3 py-1"
          >
            <span className="text-sm font-medium text-vytal-text">
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
            {ex.notes && (
              <span className="text-xs italic text-vytal-muted">
                {ex.notes}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface EditWODForm {
  title: string;
  description: string;
  type: WODType;
  timeCap: string;
}

function WODCard({
  wod,
  classType,
  onSave,
  onPublish,
  publishPending,
}: {
  wod: WOD;
  classType: ClassType | undefined;
  onSave: (wodId: string, updates: { title?: string; description?: string; parts: WODPart[] }) => void;
  onPublish: (wodId: string) => void;
  publishPending: boolean;
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const mainPart = wod.parts.find(
    (p) => p.type !== "custom" && p.name !== "Warm Up" && p.name !== "Cool Down"
  );
  const mainType = mainPart?.type ?? "custom";
  const duration = estimateDuration(wod);
  const [copied, setCopied] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditWODForm>({
    title: wod.title ?? "",
    description: wod.description ?? "",
    type: mainType,
    timeCap: mainPart?.timeCap ? String(mainPart.timeCap) : "",
  });

  const handleCopy = useCallback(() => {
    const text = wodToClipboardText(wod);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast(t("wods.copied"), "success");
      setTimeout(() => setCopied(false), 2000);
    });
  }, [wod, toast, t]);

  const handleEditOpen = useCallback(() => {
    setEditForm({
      title: wod.title ?? "",
      description: wod.description ?? "",
      type: mainType,
      timeCap: mainPart?.timeCap ? String(mainPart.timeCap) : "",
    });
    setEditOpen(true);
  }, [wod, mainType, mainPart]);

  const handleEditSave = useCallback(() => {
    const timeCap = editForm.timeCap ? parseInt(editForm.timeCap, 10) : undefined;
    const updatedParts = wod.parts.map((part) => {
      const isMainPart =
        part.type !== "custom" &&
        part.name !== "Warm Up" &&
        part.name !== "Cool Down";
      if (isMainPart) {
        return {
          ...part,
          type: editForm.type,
          timeCap: timeCap && !isNaN(timeCap) ? timeCap : part.timeCap,
        };
      }
      return part;
    });
    onSave(wod.id, {
      title: editForm.title.trim() || undefined,
      description: editForm.description.trim() || undefined,
      parts: updatedParts,
    });
    toast(t("wods.wodSaved"), "success");
    setEditOpen(false);
  }, [wod, editForm, onSave, toast, t]);

  return (
    <>
      <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 card-interactive transition-colors hover:border-[rgba(61,255,110,0.22)]">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              {wod.title && (
                <h3 className="text-lg font-bold text-vytal-text">
                  {wod.title}
                </h3>
              )}
              <WODTypeBadge type={mainType} />
              {!wod.publishedAt && (
                <span className="inline-flex items-center rounded-full bg-vytal-amber/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-vytal-amber">
                  {t("status.draft")}
                </span>
              )}
            </div>
            {wod.description && (
              <p className="mt-1 text-sm text-vytal-muted">{wod.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Publish button (drafts only) */}
            {!wod.publishedAt && (
              <button
                onClick={() => onPublish(wod.id)}
                disabled={publishPending}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-vytal-green px-3 text-xs font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90 disabled:cursor-not-allowed disabled:opacity-50"
                title={t("action.publish")}
              >
                <Send className="h-3 w-3" />
                {t("action.publish")}
              </button>
            )}
            {/* Duration badge */}
            <div className="flex items-center gap-1 rounded-full bg-vytal-bg2 px-2.5 py-1 text-[10px] font-medium text-vytal-muted">
              <Clock className="h-3 w-3" />
              {t("wods.minutes").replace("{min}", String(duration))}
            </div>
            {/* Copy button */}
            <button
              onClick={handleCopy}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg border border-vytal-border transition-all",
                copied
                  ? "border-vytal-green/30 bg-vytal-green/10 text-vytal-green"
                  : "bg-vytal-bg2 text-vytal-muted hover:text-vytal-text hover:bg-vytal-bg3"
              )}
              title={t("wods.copyClipboard")}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            {/* Edit button */}
            <button
              onClick={handleEditOpen}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-vytal-border bg-vytal-bg2 text-vytal-muted transition-all hover:text-vytal-text hover:bg-vytal-bg3"
              title={t("wods.editWod")}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Class type assignment */}
        {classType && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-vytal-muted">
              {t("wods.assignedTo")}:
            </span>
            <div className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: classType.color }}
              />
              <span className="text-xs font-medium text-vytal-text">
                {classType.name}
              </span>
            </div>
          </div>
        )}

        {/* Parts */}
        <div className="space-y-4">
          {wod.parts.map((part, i) => (
            <PartSection key={i} part={part} />
          ))}
        </div>
      </div>

      {/* Edit WOD Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-vytal-border bg-vytal-card p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-vytal-text">
                  {t("wods.editWodTitle")}
                </h3>
                <p className="text-xs text-vytal-muted">{wod.date}</p>
              </div>
              <button
                onClick={() => setEditOpen(false)}
                className="text-vytal-muted transition-colors hover:text-vytal-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("wods.wodTitle")}
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g., FRAN, MURPH..."
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>
              {/* Description */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("wods.wodDescription")}
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={2}
                  placeholder="Notes, scaling options..."
                  className="w-full resize-none rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>
              {/* Type */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("wods.wodType")}
                </label>
                <select
                  value={editForm.type}
                  onChange={(e) =>
                    setEditForm((prev) => ({
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
              {/* Time Cap */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("wods.timeCap")} (min)
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={editForm.timeCap}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, timeCap: e.target.value }))
                  }
                  placeholder="e.g., 20"
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>
              <div className="flex justify-end gap-3 pt-1">
                <button
                  onClick={() => setEditOpen(false)}
                  className="rounded-lg border border-vytal-border px-4 py-2 text-sm text-vytal-text transition-colors hover:bg-vytal-bg3"
                >
                  {t("action.cancel")}
                </button>
                <button
                  onClick={handleEditSave}
                  className="rounded-lg bg-vytal-green px-6 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
                >
                  {t("wods.saveChanges")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function WODsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const utils = trpc.useUtils();

  // ── tRPC: WODs + reference data for joins ──
  const listQuery = trpc.wods.list.useQuery({});
  const exercisesQuery = trpc.exercises.list.useQuery({});
  const classTypesQuery = trpc.classTypes.list.useQuery();
  const publishWod = trpc.wods.publish.useMutation();

  const classTypes = useMemo(
    () => rowsToClassTypes(classTypesQuery.data ?? []),
    [classTypesQuery.data],
  );

  const wods = useMemo(() => {
    const exercisesById = new Map(
      rowsToExercises(exercisesQuery.data ?? []).map((ex) => [ex.id, ex]),
    );
    return rowsToWODs(listQuery.data ?? [], exercisesById);
  }, [listQuery.data, exercisesQuery.data]);

  const handlePublish = useCallback(
    (wodId: string) => {
      publishWod.mutate(
        { id: wodId },
        {
          onSuccess: (published) => {
            void utils.wods.list.invalidate();
            toast(t("toast.wodPublished").replace("{date}", published.date), "success");
          },
          onError: () => toast(t("ui.error"), "error"),
        },
      );
    },
    [publishWod, utils, toast, t],
  );

  // There is no `wods.update` procedure yet — the edit modal updates the
  // query cache (setData) so the UI reflects the change immediately.
  const handleSave = useCallback(
    (wodId: string, updates: { title?: string; description?: string; parts: WODPart[] }) => {
      const storedParts: WodRow["parts"] = updates.parts.map((part) => ({
        name: part.name,
        type: part.type,
        timeCap: part.timeCap,
        rounds: part.rounds,
        intervalSeconds: part.intervalSeconds,
        exercises: part.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          reps: ex.reps,
          weight: ex.weight,
          notes: ex.notes,
        })),
      }));
      utils.wods.list.setData({}, (old) =>
        old?.map((row) =>
          row.id === wodId
            ? {
                ...row,
                title: updates.title ?? null,
                description: updates.description ?? null,
                parts: storedParts,
              }
            : row,
        ),
      );
    },
    [utils],
  );

  const isPending = listQuery.isPending || exercisesQuery.isPending || classTypesQuery.isPending;
  const today = new Date().toISOString().split("T")[0];
  const todayWODs = wods.filter((w) => w.date === today);
  const pastWODs = wods.filter((w) => w.date !== today);

  const renderCard = (wod: WOD) => (
    <WODCard
      key={wod.id}
      wod={wod}
      classType={classTypes.find((ct) => ct.id === wod.classTypeId)}
      onSave={handleSave}
      onPublish={handlePublish}
      publishPending={publishWod.isPending}
    />
  );

  if (listQuery.isError) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("wods.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">{t("wods.todaysProgramming")}</p>
        </div>
        <EmptyState
          icon={AlertTriangle}
          title={t("ui.error")}
          description={t("wods.loadError")}
          action={{ label: t("billing.retry"), onClick: () => void listQuery.refetch() }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("wods.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("wods.todaysProgramming")} &mdash;{" "}
            {new Date().toLocaleDateString("pt-PT", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <Link
          href="/wods/builder"
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-semibold text-vytal-bg transition-all hover:bg-vytal-green/90"
        >
          <Plus className="h-4 w-4" />
          {t("wods.createWod")}
        </Link>
      </div>

      {/* Quick Actions Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/wods/builder" className="inline-flex items-center gap-1.5 rounded-full border border-vytal-green/20 bg-vytal-green/5 px-3.5 py-1.5 text-xs font-semibold text-vytal-green transition-colors hover:bg-vytal-green/10">
          <Plus className="h-3.5 w-3.5" />
          {t("quickAction.newWod")}
        </Link>
        <Link href="/wods/programming" className="inline-flex items-center gap-1.5 rounded-full border border-vytal-border bg-vytal-card px-3.5 py-1.5 text-xs font-semibold text-vytal-text transition-colors hover:bg-vytal-bg3">
          <Pencil className="h-3.5 w-3.5" />
          {t("quickAction.programming")}
        </Link>
        <Link href="/wods" className="inline-flex items-center gap-1.5 rounded-full border border-vytal-border bg-vytal-card px-3.5 py-1.5 text-xs font-semibold text-vytal-text transition-colors hover:bg-vytal-bg3">
          <Copy className="h-3.5 w-3.5" />
          {t("quickAction.copyLast")}
        </Link>
      </div>

      {/* Today's WODs */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-lg font-semibold text-vytal-text">{t("wods.today")}</h2>
          <span className="rounded-full bg-vytal-green/10 px-2 py-0.5 text-[10px] font-semibold text-vytal-green">
            {todayWODs.length} {todayWODs.length === 1 ? "WOD" : "WODs"}
          </span>
        </div>
        {isPending ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-[240px] w-full rounded-xl" />
            ))}
          </div>
        ) : todayWODs.length > 0 ? (
          <div className="space-y-4">{todayWODs.map(renderCard)}</div>
        ) : (
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-8 text-center">
            <Dumbbell className="mx-auto h-8 w-8 text-vytal-muted" />
            <p className="mt-3 text-sm text-vytal-muted">
              {t("wods.noWodsToday")}
            </p>
          </div>
        )}
      </div>

      {/* Past WODs */}
      {pastWODs.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-vytal-text">
            {t("wods.previous")}
          </h2>
          <div className="space-y-4">{pastWODs.map(renderCard)}</div>
        </div>
      )}
    </div>
  );
}
