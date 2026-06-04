"use client";

import { useDataStore } from "@/stores/data-store";
import type { WOD, WODPart, WODType } from "@vytal-fit/shared";
import { Dumbbell, Clock, Flame, Zap, Timer, Repeat, ChevronRight, Plus, Copy, Check, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { useState, useCallback } from "react";

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

function WODCard({ wod }: { wod: WOD }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const storeClassTypes = useDataStore((s) => s.classTypes);
  const classType = storeClassTypes.find((ct: { id: string }) => ct.id === wod.classTypeId);
  const mainPart = wod.parts.find(
    (p) => p.type !== "custom" && p.name !== "Warm Up" && p.name !== "Cool Down"
  );
  const mainType = mainPart?.type ?? "custom";
  const duration = estimateDuration(wod);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const text = wodToClipboardText(wod);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast(t("wods.copied"), "success");
      setTimeout(() => setCopied(false), 2000);
    });
  }, [wod, toast, t]);

  const handleEdit = useCallback(() => {
    toast(t("wods.editComingSoon"), "info");
  }, [toast, t]);

  return (
    <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 transition-colors hover:border-[rgba(61,255,110,0.22)]">
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
          </div>
          {wod.description && (
            <p className="mt-1 text-sm text-vytal-muted">{wod.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
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
            onClick={handleEdit}
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
  );
}

export default function WODsPage() {
  const { t } = useI18n();
  const storeWODs = useDataStore((s) => s.wods);
  const today = new Date().toISOString().split("T")[0];
  const todayWODs = storeWODs.filter((w) => w.date === today);
  const pastWODs = storeWODs.filter((w) => w.date !== today);

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

      {/* Today's WODs */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-lg font-semibold text-vytal-text">{t("wods.today")}</h2>
          <span className="rounded-full bg-vytal-green/10 px-2 py-0.5 text-[10px] font-semibold text-vytal-green">
            {todayWODs.length} {todayWODs.length === 1 ? "WOD" : "WODs"}
          </span>
        </div>
        {todayWODs.length > 0 ? (
          <div className="space-y-4">
            {todayWODs.map((wod) => (
              <WODCard key={wod.id} wod={wod} />
            ))}
          </div>
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
          <div className="space-y-4">
            {pastWODs.map((wod) => (
              <WODCard key={wod.id} wod={wod} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
