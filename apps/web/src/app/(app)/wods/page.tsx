import { mockWODs, mockClassTypes } from "@vytal-fit/shared";
import type { WOD, WODPart, WODType } from "@vytal-fit/shared";
import { Dumbbell, Clock, Flame, Zap, Timer, Repeat, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const classType = mockClassTypes.find((ct) => ct.id === wod.classTypeId);
  const mainPart = wod.parts.find(
    (p) => p.type !== "custom" && p.name !== "Warm Up" && p.name !== "Cool Down"
  );
  const mainType = mainPart?.type ?? "custom";

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
        {classType && (
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: classType.color }}
            />
            <span className="text-xs font-medium text-vytal-muted">
              {classType.name}
            </span>
          </div>
        )}
      </div>

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
  const today = new Date().toISOString().split("T")[0];
  const todayWODs = mockWODs.filter((w) => w.date === today);
  const pastWODs = mockWODs.filter((w) => w.date !== today);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-vytal-text">WODs</h1>
        <p className="mt-1 text-sm text-vytal-muted">
          Today&apos;s programming &mdash;{" "}
          {new Date().toLocaleDateString("pt-PT", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* Today's WODs */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-lg font-semibold text-vytal-text">Today</h2>
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
              No WODs published for today yet
            </p>
          </div>
        )}
      </div>

      {/* Past WODs */}
      {pastWODs.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-vytal-text">
            Previous
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
