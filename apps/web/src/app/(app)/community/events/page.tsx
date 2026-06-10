"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  Calendar,
  Users,
  Plus,
  X,
  Trophy,
  Target,
  PartyPopper,
  Vote,
  Footprints,
  ChevronDown,
  ChevronUp,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EventType = "competition" | "challenge" | "race" | "voting" | "social";
type EventStatus = "upcoming" | "active" | "ended";

interface Heat {
  name: string;
  athletes: string[];
}

interface LeaderboardEntry {
  name: string;
  score: number;
}

interface Nominee {
  name: string;
  votes: number;
}

interface Participant {
  name: string;
  registered: boolean;
}

interface EventItem {
  id: string;
  title: string;
  type: EventType;
  description: string;
  startDate: string;
  endDate: string;
  participants: Participant[];
  status: EventStatus;
  maxParticipants: number;
  rules: string;
  heats?: Heat[];
  leaderboard?: LeaderboardEntry[];
  nominees?: Nominee[];
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const eventTypeConfig: Record<
  EventType,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  competition: { label: "Competition", color: "bg-vytal-red/10 text-vytal-red", icon: Trophy },
  challenge: { label: "Challenge", color: "bg-vytal-amber/10 text-vytal-amber", icon: Target },
  race: { label: "Race", color: "bg-vytal-blue/10 text-vytal-blue", icon: Footprints },
  voting: { label: "Voting", color: "bg-vytal-purple/10 text-vytal-purple", icon: Vote },
  social: { label: "Social Event", color: "bg-vytal-green/10 text-vytal-green", icon: PartyPopper },
};

const statusConfig: Record<EventStatus, { label: string; color: string }> = {
  upcoming: { label: "Upcoming", color: "bg-vytal-blue/10 text-vytal-blue" },
  active: { label: "Active", color: "bg-vytal-green/10 text-vytal-green" },
  ended: { label: "Ended", color: "bg-vytal-muted/10 text-vytal-muted" },
};

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const initialEvents: EventItem[] = [
  {
    id: "ev-1",
    title: "Summer Throwdown 2026",
    type: "competition",
    description: "3-day CrossFit competition with individual and team categories. 6 WODs over 3 days.",
    startDate: "2026-07-10",
    endDate: "2026-07-12",
    participants: [
      { name: "Pedro Almeida", registered: true },
      { name: "Ana Silva", registered: true },
      { name: "Miguel Costa", registered: true },
      { name: "Sofia Santos", registered: true },
      { name: "Jose Fonte", registered: true },
      { name: "Ines Ferreira", registered: false },
    ],
    status: "upcoming",
    maxParticipants: 40,
    rules: "RX and Scaled divisions. Athletes must complete all 6 WODs. 15-minute time cap per WOD.",
    heats: [
      { name: "Heat 1 - RX Male", athletes: ["Pedro Almeida", "Jose Fonte"] },
      { name: "Heat 2 - RX Female", athletes: ["Ana Silva", "Sofia Santos"] },
      { name: "Heat 3 - Scaled", athletes: ["Miguel Costa"] },
    ],
  },
  {
    id: "ev-2",
    title: "30-Day Challenge",
    type: "challenge",
    description: "Train at least 5 times per week for 30 days. Track your progress and compete for the top spot!",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    participants: [
      { name: "Pedro Almeida", registered: true },
      { name: "Ana Silva", registered: true },
      { name: "Miguel Costa", registered: true },
      { name: "Tiago Neves", registered: true },
      { name: "Maria Oliveira", registered: true },
    ],
    status: "active",
    maxParticipants: 100,
    rules: "Minimum 5 check-ins per week. Open Box counts. Points awarded for consistency and PRs.",
    leaderboard: [
      { name: "Pedro Almeida", score: 145 },
      { name: "Tiago Neves", score: 132 },
      { name: "Ana Silva", score: 128 },
      { name: "Miguel Costa", score: 115 },
      { name: "Maria Oliveira", score: 98 },
    ],
  },
  {
    id: "ev-3",
    title: "5K Run",
    type: "race",
    description: "Annual community 5K run along the Aveiro canal. All fitness levels welcome!",
    startDate: "2026-08-15",
    endDate: "2026-08-15",
    participants: [
      { name: "Ana Silva", registered: true },
      { name: "Jose Fonte", registered: true },
      { name: "Ines Ferreira", registered: true },
    ],
    status: "upcoming",
    maxParticipants: 60,
    rules: "Start at 08:00. Water stations at 1km and 3km. Medals for top 3 in each age group.",
  },
  {
    id: "ev-4",
    title: "Athlete of the Month - June",
    type: "voting",
    description: "Vote for the most dedicated athlete of June 2026. Consider consistency, attitude, and progress.",
    startDate: "2026-06-25",
    endDate: "2026-06-30",
    participants: [
      { name: "Pedro Almeida", registered: true },
      { name: "Ana Silva", registered: true },
      { name: "Miguel Costa", registered: true },
      { name: "Sofia Santos", registered: true },
    ],
    status: "active",
    maxParticipants: 10,
    rules: "Each member gets one vote. Self-voting is not allowed. Winner announced on July 1st.",
    nominees: [
      { name: "Pedro Almeida", votes: 18 },
      { name: "Ana Silva", votes: 15 },
      { name: "Sofia Santos", votes: 12 },
      { name: "Miguel Costa", votes: 9 },
    ],
  },
  {
    id: "ev-5",
    title: "Christmas Party",
    type: "social",
    description: "Annual box Christmas party! Food, drinks, games, and the traditional ugly sweater contest.",
    startDate: "2026-12-20",
    endDate: "2026-12-20",
    participants: [
      { name: "Pedro Almeida", registered: true },
      { name: "Ana Silva", registered: true },
      { name: "Sofia Santos", registered: true },
    ],
    status: "upcoming",
    maxParticipants: 80,
    rules: "Starts at 19:00. Bring a dish to share. Ugly sweater contest at 21:00.",
  },
];

export default function EventsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "competition" as EventType,
    description: "",
    startDate: "",
    endDate: "",
    maxParticipants: 40,
    rules: "",
  });

  const handleCreate = useCallback(() => {
    if (!newEvent.title.trim()) {
      toast(t("events.titleRequired"), "error");
      return;
    }
    const ev: EventItem = {
      id: `ev-${Date.now()}`,
      title: newEvent.title.trim(),
      type: newEvent.type,
      description: newEvent.description.trim(),
      startDate: newEvent.startDate || "2026-07-01",
      endDate: newEvent.endDate || "2026-07-01",
      participants: [],
      status: "upcoming",
      maxParticipants: newEvent.maxParticipants,
      rules: newEvent.rules.trim(),
    };
    setEvents((prev) => [ev, ...prev]);
    setShowCreate(false);
    setNewEvent({
      title: "",
      type: "competition",
      description: "",
      startDate: "",
      endDate: "",
      maxParticipants: 40,
      rules: "",
    });
    toast(t("events.created"), "success");
  }, [newEvent, toast, t]);

  function handlePublishResults() {
    toast(t("events.resultsPublished"), "success");
  }

  const inputClass =
    "w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20";

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: t("nav.community"), href: "/community" },
          { label: t("nav.events") },
        ]}
      />

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">
            {t("events.title")}
          </h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("events.subtitle")}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showCreate ? t("action.cancel") : t("events.createEvent")}
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="rounded-xl border border-vytal-green/20 bg-vytal-green/5 p-6">
          <h3 className="mb-4 text-sm font-semibold text-vytal-green">
            {t("events.newEvent")}
          </h3>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("events.eventTitle")}
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g., Summer Throwdown"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("events.type")}
                </label>
                <select
                  value={newEvent.type}
                  onChange={(e) =>
                    setNewEvent((prev) => ({
                      ...prev,
                      type: e.target.value as EventType,
                    }))
                  }
                  className={inputClass}
                >
                  <option value="competition">Competition</option>
                  <option value="challenge">Challenge</option>
                  <option value="race">Race</option>
                  <option value="social">Social Event</option>
                  <option value="voting">Voting</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("events.description")}
              </label>
              <textarea
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className={cn(inputClass, "resize-none")}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("events.startDate")}
                </label>
                <input
                  type="date"
                  value={newEvent.startDate}
                  onChange={(e) =>
                    setNewEvent((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("events.endDate")}
                </label>
                <input
                  type="date"
                  value={newEvent.endDate}
                  onChange={(e) =>
                    setNewEvent((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("events.maxParticipants")}
                </label>
                <input
                  type="number"
                  value={newEvent.maxParticipants}
                  onChange={(e) =>
                    setNewEvent((prev) => ({
                      ...prev,
                      maxParticipants: Number(e.target.value),
                    }))
                  }
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("events.rules")}
              </label>
              <textarea
                value={newEvent.rules}
                onChange={(e) =>
                  setNewEvent((prev) => ({ ...prev, rules: e.target.value }))
                }
                rows={3}
                placeholder={t("events.rulesPlaceholder")}
                className={cn(inputClass, "resize-none")}
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleCreate}
                className="rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
              >
                {t("action.create")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {events.map((ev) => {
          const typeConf = eventTypeConfig[ev.type];
          const statConf = statusConfig[ev.status];
          const TypeIcon = typeConf.icon;
          const isExpanded = expandedId === ev.id;
          const registeredCount = ev.participants.filter(
            (p) => p.registered
          ).length;

          return (
            <div
              key={ev.id}
              className="flex flex-col rounded-xl border border-vytal-border bg-vytal-card transition-colors hover:border-[rgba(61,255,110,0.22)]"
            >
              <div className="flex-1 p-5">
                {/* Title row */}
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="text-sm font-semibold text-vytal-text">
                    {ev.title}
                  </h3>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                      statConf.color
                    )}
                  >
                    {statConf.label}
                  </span>
                </div>

                {/* Type badge */}
                <span
                  className={cn(
                    "mb-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    typeConf.color
                  )}
                >
                  <TypeIcon className="h-3 w-3" />
                  {typeConf.label}
                </span>

                <p className="mb-3 text-xs text-vytal-muted line-clamp-2">
                  {ev.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-vytal-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {ev.startDate}
                    {ev.endDate !== ev.startDate && ` - ${ev.endDate}`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {registeredCount}/{ev.maxParticipants}
                  </span>
                </div>
              </div>

              {/* Expand/collapse */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : ev.id)}
                className="flex items-center justify-center gap-1 border-t border-vytal-border py-2.5 text-xs font-medium text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
              >
                {isExpanded ? t("events.collapse") : t("events.details")}
                {isExpanded ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="space-y-4 border-t border-vytal-border p-5">
                  {/* Participants */}
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-vytal-muted">
                      {t("events.participants")}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {ev.participants.map((p) => (
                        <span
                          key={p.name}
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-medium",
                            p.registered
                              ? "bg-vytal-green/10 text-vytal-green"
                              : "bg-vytal-amber/10 text-vytal-amber"
                          )}
                        >
                          {p.name}
                          {!p.registered && " (pending)"}
                        </span>
                      ))}
                      {ev.participants.length === 0 && (
                        <span className="text-xs text-vytal-muted">
                          {t("events.noParticipants")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rules */}
                  {ev.rules && (
                    <div>
                      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-vytal-muted">
                        {t("events.rules")}
                      </h4>
                      <p className="text-xs text-vytal-text">{ev.rules}</p>
                    </div>
                  )}

                  {/* Heats (competition) */}
                  {ev.heats && ev.heats.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-vytal-muted">
                        {t("events.heats")}
                      </h4>
                      <div className="space-y-2">
                        {ev.heats.map((heat, hi) => (
                          <div
                            key={hi}
                            className="rounded-lg border border-vytal-border bg-vytal-bg2 p-3"
                          >
                            <p className="mb-1 text-xs font-semibold text-vytal-text">
                              {heat.name}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {heat.athletes.map((a) => (
                                <span
                                  key={a}
                                  className="rounded bg-vytal-bg3 px-1.5 py-0.5 text-[10px] text-vytal-muted"
                                >
                                  {a}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Leaderboard (challenge) */}
                  {ev.leaderboard && ev.leaderboard.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-vytal-muted">
                        {t("events.leaderboard")}
                      </h4>
                      <div className="space-y-1">
                        {ev.leaderboard.map((entry, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2"
                          >
                            <span
                              className={cn(
                                "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                                i === 0
                                  ? "bg-vytal-amber/20 text-vytal-amber"
                                  : i === 1
                                    ? "bg-vytal-muted/20 text-vytal-muted"
                                    : i === 2
                                      ? "bg-vytal-amber/10 text-vytal-amber/70"
                                      : "bg-vytal-bg3 text-vytal-muted"
                              )}
                            >
                              {i + 1}
                            </span>
                            <span className="flex-1 text-xs font-medium text-vytal-text">
                              {entry.name}
                            </span>
                            <span className="font-mono text-xs font-semibold text-vytal-green">
                              {entry.score} pts
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nominees (voting) */}
                  {ev.nominees && ev.nominees.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-vytal-muted">
                        {t("events.nominees")}
                      </h4>
                      <div className="space-y-1">
                        {ev.nominees.map((nominee, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2"
                          >
                            <Award
                              className={cn(
                                "h-3.5 w-3.5",
                                i === 0
                                  ? "text-vytal-amber"
                                  : "text-vytal-muted"
                              )}
                            />
                            <span className="flex-1 text-xs font-medium text-vytal-text">
                              {nominee.name}
                            </span>
                            <span className="font-mono text-xs font-semibold text-vytal-purple">
                              {nominee.votes} {t("events.votes")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Publish Results */}
                  {ev.status !== "ended" && (
                    <button
                      onClick={() => handlePublishResults()}
                      className="w-full rounded-lg bg-vytal-green px-4 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
                    >
                      {t("events.publishResults")}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
