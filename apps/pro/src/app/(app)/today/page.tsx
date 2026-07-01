"use client";

import Link from "next/link";
import {
  Sparkles,
  Target,
  CheckCircle2,
  Circle,
  ChevronRight,
  Trophy,
  CalendarDays,
  Clock,
  Users,
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  Percent,
  CreditCard,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { useOrgFormat } from "@/lib/org-format";

// ---------------------------------------------------------------------------
// Tone → token utility mapping
// ---------------------------------------------------------------------------

type Tone = "amber" | "red" | "blue" | "green" | "purple";

const toneText: Record<Tone, string> = {
  amber: "text-vytal-amber",
  red: "text-vytal-red",
  blue: "text-vytal-blue",
  green: "text-vytal-green",
  purple: "text-vytal-purple",
};

const toneDot: Record<Tone, string> = {
  amber: "bg-vytal-amber",
  red: "bg-vytal-red",
  blue: "bg-vytal-blue",
  green: "bg-vytal-green",
  purple: "bg-vytal-purple",
};

// Highlights are always celebratory → green/purple accents by key
const highlightTone: Record<string, Tone> = {
  newMembers: "green",
  prs: "purple",
  leads: "blue",
};

// ---------------------------------------------------------------------------
// Time-of-day helper
// ---------------------------------------------------------------------------

function timeOfDay(): "morning" | "afternoon" | "evening" {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

function nowHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-vytal-border bg-vytal-card p-5 ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-vytal-border bg-vytal-bg3 text-vytal-green">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-semibold text-vytal-text">{title}</h2>
        {subtitle ? (
          <p className="text-sm text-vytal-muted">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-vytal-border bg-vytal-bg3 text-vytal-green">
        {icon}
      </div>
      <p className="text-sm text-vytal-muted">{label}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TodayPage() {
  const { t } = useI18n();
  const { money } = useOrgFormat();

  const briefing = trpc.today.briefing.useQuery();
  const statsQuery = trpc.dashboard.stats.useQuery();

  if (briefing.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-vytal-border border-t-vytal-green" />
      </div>
    );
  }

  const data = briefing.data;
  const agenda = data?.agenda ?? [];
  const focus = data?.focus ?? [];
  const todos = data?.todos ?? [];
  const highlights = data?.highlights ?? [];
  const dateStr = data?.date ?? "";

  const stats = statsQuery.data;

  const part = timeOfDay();
  const currentTime = nowHHMM();

  // Agenda: sort by start time, find next upcoming class.
  const sortedAgenda = [...agenda].sort((a, b) =>
    a.startTime.localeCompare(b.startTime),
  );
  const nextIndex = sortedAgenda.findIndex((c) => c.startTime >= currentTime);
  const nextClass = nextIndex >= 0 ? sortedAgenda[nextIndex] : undefined;
  const restClasses = nextClass
    ? sortedAgenda.filter((c) => c.id !== nextClass.id)
    : sortedAgenda;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      {/* Sunrise header band */}
      <header className="relative overflow-hidden rounded-3xl border border-vytal-border bg-vytal-bg2 bg-[linear-gradient(180deg,rgba(255,179,0,0.10),transparent)] px-6 py-8 sm:px-10 sm:py-12">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-vytal-text">
            {t("nav.today")}
          </span>
          <span className="rounded-full border border-vytal-border bg-vytal-bg3 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-vytal-amber">
            {t("today.beta")}
          </span>
          {dateStr ? (
            <span className="text-sm capitalize text-vytal-muted">
              {formatDate(dateStr)}
            </span>
          ) : null}
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-vytal-text sm:text-3xl">
            {t(`today.greeting.${part}`)}
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-base text-vytal-muted sm:text-lg">
            {t(`today.tagline.${part}`)}
          </p>
        </div>
      </header>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiTile
          icon={<CalendarDays className="h-4 w-4" />}
          label={t("today.agenda.title")}
          value={String(stats?.classesToday ?? sortedAgenda.length)}
        />
        <KpiTile
          icon={<Percent className="h-4 w-4" />}
          label={t("dashboard.occupancy")}
          value={`${stats?.occupancyPercent ?? 0}%`}
        />
        <KpiTile
          icon={<CreditCard className="h-4 w-4" />}
          label={t("dashboard.pendingPayments")}
          value={money(stats?.pendingPayments ?? 0)}
        />
        <KpiTile
          icon={<Trophy className="h-4 w-4" />}
          label={t("dashboard.prsToday")}
          value={String(stats?.prsToday ?? 0)}
        />
      </div>

      {/* Two-column grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT column */}
        <div className="space-y-6">
          {/* Focus */}
          <Card>
            <CardHeader
              icon={<Target className="h-5 w-5" />}
              title={t("today.focus.title")}
              subtitle={t("today.focus.subtitle")}
            />
            {focus.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 className="h-5 w-5" />}
                label={t("today.focus.empty")}
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {focus.map((f) => (
                  <Link
                    key={f.key}
                    href={f.href}
                    className="group inline-flex items-center gap-2 rounded-full border border-vytal-border bg-vytal-bg3 px-3 py-1.5 text-sm font-medium text-vytal-text transition-colors hover:border-vytal-green/50"
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${toneDot[f.tone as Tone]}`}
                    />
                    <span className={toneText[f.tone as Tone]}>{f.count}</span>
                    <span>{t(`today.focus.${f.key}`)}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-vytal-muted transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* To-dos */}
          <Card>
            <CardHeader
              icon={<CheckCircle2 className="h-5 w-5" />}
              title={t("today.todos.title")}
              subtitle={t("today.todos.subtitle")}
            />
            {todos.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 className="h-6 w-6" />}
                label={t("today.todos.empty")}
              />
            ) : (
              <ul className="space-y-1">
                {todos.map((todo) => (
                  <li key={todo.id}>
                    <Link
                      href={todo.href}
                      className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-vytal-bg3"
                    >
                      <Circle className="h-5 w-5 shrink-0 text-vytal-muted transition-colors group-hover:text-vytal-green" />
                      <span className="flex-1 text-sm text-vytal-text">
                        {todo.key === "wod"
                          ? t("today.todos.wod")
                          : `${todo.count} ${t(`today.todos.${todo.key}`)}`}
                      </span>
                      <ChevronRight className="h-4 w-4 text-vytal-muted transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Highlights */}
          <Card>
            <CardHeader
              icon={<Sparkles className="h-5 w-5" />}
              title={t("today.highlights.title")}
              subtitle={t("today.highlights.subtitle")}
            />
            {highlights.length === 0 ? (
              <EmptyState
                icon={<Sparkles className="h-5 w-5" />}
                label={t("today.highlights.empty")}
              />
            ) : (
              <ul className="space-y-1">
                {highlights.map((h) => {
                  const tone = highlightTone[h.key] ?? "green";
                  return (
                    <li key={h.id}>
                      <Link
                        href={h.href}
                        className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-vytal-bg3"
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-vytal-border bg-vytal-bg3 ${toneText[tone]}`}
                        >
                          <Trophy className="h-4 w-4" />
                        </span>
                        <span className="flex-1 text-sm text-vytal-text">
                          <span className={`font-semibold ${toneText[tone]}`}>
                            {h.count}
                          </span>{" "}
                          {t(`today.highlights.${h.key}`)}
                        </span>
                        <ChevronRight className="h-4 w-4 text-vytal-muted transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        {/* RIGHT column: Agenda */}
        <div>
          <Card>
            <CardHeader
              icon={<CalendarDays className="h-5 w-5" />}
              title={t("today.agenda.title")}
            />
            {sortedAgenda.length === 0 ? (
              <EmptyState
                icon={<CalendarDays className="h-5 w-5" />}
                label={t("today.agenda.empty")}
              />
            ) : (
              <div className="space-y-4">
                {nextClass ? (
                  <NextClassCard cls={nextClass} t={t} />
                ) : null}

                {restClasses.length > 0 ? (
                  <ul className="space-y-1">
                    {restClasses.map((c) => (
                      <li key={c.id}>
                        <div className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-vytal-bg3">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ background: c.color }}
                          />
                          <span className="w-24 shrink-0 text-sm tabular-nums text-vytal-muted">
                            {c.startTime}–{c.endTime}
                          </span>
                          <span className="flex-1 truncate text-sm font-medium text-vytal-text">
                            {c.name}
                          </span>
                          <span
                            className={`shrink-0 truncate text-xs ${
                              c.hasCoach ? "text-vytal-muted" : "text-vytal-amber"
                            }`}
                          >
                            {c.hasCoach
                              ? c.coachNames.join(", ")
                              : t("today.agenda.noCoach")}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// KPI tile
// ---------------------------------------------------------------------------

function KpiTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-vytal-border bg-vytal-card p-4">
      <div className="mb-2 flex items-center gap-2 text-vytal-muted">
        {icon}
        <span className="truncate text-xs font-medium">{label}</span>
      </div>
      <div className="text-xl font-semibold text-vytal-text">{value}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Next class emphasized card
// ---------------------------------------------------------------------------

function NextClassCard({
  cls,
  t,
}: {
  cls: {
    id: string;
    name: string;
    color: string;
    startTime: string;
    endTime: string;
    maxCapacity: number;
    enrolled: number;
    coachNames: string[];
    hasCoach: boolean;
  };
  t: (key: string) => string;
}) {
  const full = cls.enrolled >= cls.maxCapacity;
  const remaining = Math.max(cls.maxCapacity - cls.enrolled, 0);

  return (
    <Link
      href="/classes"
      className="block rounded-2xl border border-vytal-green/40 bg-vytal-bg3 p-4 transition-colors hover:border-vytal-green"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-vytal-green/15 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-vytal-green">
          <CalendarClock className="h-3.5 w-3.5" />
          {t("today.agenda.next")}
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm tabular-nums text-vytal-muted">
          <Clock className="h-3.5 w-3.5" />
          {cls.startTime}–{cls.endTime}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ background: cls.color }}
        />
        <h3 className="text-lg font-semibold text-vytal-text">{cls.name}</h3>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span
          className={`inline-flex items-center gap-1.5 ${
            cls.hasCoach ? "text-vytal-muted" : "text-vytal-amber font-medium"
          }`}
        >
          <Users className="h-4 w-4" />
          {cls.hasCoach ? cls.coachNames.join(", ") : t("today.agenda.noCoach")}
          {!cls.hasCoach ? <AlertTriangle className="h-3.5 w-3.5" /> : null}
        </span>
        <span className="text-vytal-muted">
          {cls.enrolled}/{cls.maxCapacity}
        </span>
        <span
          className={`font-medium ${full ? "text-vytal-red" : "text-vytal-green"}`}
        >
          {full ? t("today.agenda.full") : `${remaining} ${t("today.agenda.spots")}`}
        </span>
      </div>
    </Link>
  );
}
