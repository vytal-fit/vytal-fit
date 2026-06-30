"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Dumbbell,
  Trophy,
  Flame,
  CheckCircle,
  ArrowRight,
  Clock,
  Users,
  MapPin,
  TrendingUp,
  Star,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";

function getGreetingKey(): string {
  const h = new Date().getHours();
  if (h < 12) return "my.home.greeting.morning";
  if (h < 18) return "my.home.greeting.afternoon";
  return "my.home.greeting.evening";
}

function getMotivationalQuoteKey(): string {
  const keys = [
    "my.home.quote1",
    "my.home.quote2",
    "my.home.quote3",
    "my.home.quote4",
    "my.home.quote5",
  ];
  return keys[new Date().getDay() % keys.length];
}

// Weekly streak calendar — last 7 days
function getWeekDays(): { date: string; label: string; isToday: boolean }[] {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toISOString().split("T")[0],
      label: d.toLocaleDateString("pt-PT", { weekday: "narrow" }),
      isToday: i === 0,
    });
  }
  return days;
}

export default function ConsolePage() {
  const { user, hydrate } = useAuthStore();
  const { t } = useI18n();
  const today = new Date().toISOString().split("T")[0];

  const meQuery = trpc.members.me.useQuery();
  const memberId = meQuery.data?.id ?? null;
  const scheduleQuery = trpc.classes.schedule.useQuery({ from: today, to: today });
  const wodsQuery = trpc.wods.list.useQuery();
  const exercisesQuery = trpc.exercises.list.useQuery();
  const prQuery = trpc.personalRecords.list.useQuery(
    { memberId: memberId ?? "" },
    { enabled: !!memberId },
  );
  const wellnessQuery = trpc.wellnessCheckins.list.useQuery(
    { memberId: memberId ?? "" },
    { enabled: !!memberId },
  );

  const [mounted, setMounted] = useState(false);
  const weekDays = getWeekDays();

  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--color-vytal-green)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  const firstName = user?.user?.name?.split(" ")[0] ?? "Atleta";
  const member = meQuery.data ?? null;
  const streakWeeks = member?.streakWeeks ?? 0;
  const totalCheckIns = member?.totalCheckIns ?? 0;
  const todayClasses = (scheduleQuery.data ?? []).filter((c) => c.date === today);
  const now = new Date();
  const nowTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const nextClass = todayClasses.find((c) => c.startTime >= nowTime) ?? todayClasses[0];
  const todayWOD = (wodsQuery.data ?? []).find((w) => w.date === today && w.publishedAt != null);
  const prCount = prQuery.data?.items.length ?? 0;
  const checkins = new Set((wellnessQuery.data?.items ?? []).map((c) => c.date));
  const exMap = new Map((exercisesQuery.data ?? []).map((e) => [e.id, e.name] as const));

  const classColor = nextClass?.classType?.color ?? "#22c55e";

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto space-y-6 md:max-w-5xl">

      {/* ── Hero greeting ── */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.04) 60%, transparent 100%)",
          border: "1px solid rgba(34,197,94,0.2)",
        }}
      >
        {/* Background glow */}
        <div
          className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)" }}
        />
        <p className="text-sm font-medium mb-1" style={{ color: "var(--color-vytal-muted)" }}>
          {t(getGreetingKey())},
        </p>
        <h1 className="text-3xl font-black tracking-tight mb-2" style={{ color: "var(--color-vytal-text)" }}>
          {firstName}
        </h1>
        <p className="text-xs leading-relaxed italic max-w-sm" style={{ color: "var(--color-vytal-muted)" }}>
          &ldquo;{t(getMotivationalQuoteKey())}&rdquo;
        </p>
      </div>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: Flame,
            value: streakWeeks,
            label: t("my.home.stats.weeks"),
            sub: t("my.home.stats.consecutive"),
            color: "var(--color-vytal-amber)",
            bg: "rgba(255,179,0,0.1)",
            border: "rgba(255,179,0,0.2)",
          },
          {
            icon: CheckCircle,
            value: totalCheckIns,
            label: t("my.home.stats.checkins"),
            sub: t("my.home.stats.total"),
            color: "var(--color-vytal-green)",
            bg: "rgba(34,197,94,0.08)",
            border: "rgba(34,197,94,0.2)",
          },
          {
            icon: Trophy,
            value: prCount,
            label: t("my.home.stats.records"),
            sub: t("my.home.stats.personal"),
            color: "var(--color-vytal-purple)",
            bg: "rgba(192,132,252,0.1)",
            border: "rgba(192,132,252,0.2)",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="rounded-2xl p-4 flex flex-col items-center gap-1.5 transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: stat.bg,
                border: `1px solid ${stat.border}`,
              }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: stat.bg, border: `1px solid ${stat.border}` }}
              >
                <Icon size={15} style={{ color: stat.color }} strokeWidth={2} />
              </div>
              <span
                className="text-2xl font-black tabular-nums"
                style={{ color: stat.color }}
              >
                {stat.value}
              </span>
              <div className="text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wide leading-tight" style={{ color: stat.color, opacity: 0.9 }}>
                  {stat.label}
                </p>
                <p className="text-[9px] leading-tight" style={{ color: "var(--color-vytal-muted)" }}>
                  {stat.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Streak calendar ── */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: "var(--color-vytal-bg2)",
          border: "1px solid var(--color-vytal-border)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} style={{ color: "var(--color-vytal-green)" }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-vytal-muted)" }}>
              {t("my.home.thisWeek")}
            </span>
          </div>
          <span className="text-xs font-bold" style={{ color: "var(--color-vytal-green)" }}>
            {checkins.size} / 7
          </span>
        </div>
        <div className="flex gap-1.5 justify-between">
          {weekDays.map((day) => {
            const checked = checkins.has(day.date);
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[9px] font-medium uppercase" style={{ color: "var(--color-vytal-muted)" }}>
                  {day.label}
                </span>
                <div
                  className={cn(
                    "w-full aspect-square rounded-lg flex items-center justify-center transition-all duration-200",
                    day.isToday ? "ring-2" : ""
                  )}
                  style={{
                    background: checked ? "rgba(34,197,94,0.2)" : "var(--color-vytal-bg3)",
                    boxShadow: day.isToday ? "0 0 0 2px var(--color-vytal-green)" : "none",
                  }}
                >
                  {checked && (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: "var(--color-vytal-green)" }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ── Next class card ── */}
        {nextClass ? (
          <div
            className="rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.01]"
            style={{
              background: "var(--color-vytal-bg2)",
              border: "1px solid var(--color-vytal-border)",
            }}
          >
            {/* Color accent bar */}
            <div
              className="h-1 w-full"
              style={{
                background: `linear-gradient(90deg, ${classColor}, ${classColor}66)`,
              }}
            />
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--color-vytal-muted)" }}>
                  {t("my.home.nextClass")}
                </span>
                <Link
                  href="/schedule"
                  className="flex items-center gap-1 text-[10px] font-semibold transition-opacity hover:opacity-70"
                  style={{ color: "var(--color-vytal-green)" }}
                >
                  {t("my.home.viewAll")} <ArrowRight size={10} />
                </Link>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="px-2 py-0.5 rounded-md text-[10px] font-black tracking-wide"
                    style={{
                      background: `${classColor}22`,
                      color: classColor,
                    }}
                  >
                    {nextClass.classType?.abbreviation ?? "CF"}
                  </span>
                  <span className="font-bold text-base" style={{ color: "var(--color-vytal-text)" }}>
                    {nextClass.classType?.name ?? "CrossFit"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {[
                    { icon: Clock, text: `${nextClass.startTime} – ${nextClass.endTime}` },
                    { icon: MapPin, text: nextClass.location?.name ?? "Box principal" },
                    {
                      icon: Users,
                      text: `${nextClass.enrolledCount}/${nextClass.maxCapacity} ${t("my.home.athletes")}`,
                    },
                    ...(nextClass.coaches?.length > 0
                      ? [{ icon: Star, text: `Coach ${nextClass.coaches[0].name}` }]
                      : []),
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--color-vytal-muted)" }}>
                        <Icon size={11} />
                        <span className="truncate">{item.text}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Capacity bar */}
                <div className="space-y-1.5 mb-3">
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: "var(--color-vytal-bg3)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.round((nextClass.enrolledCount / nextClass.maxCapacity) * 100))}%`,
                        background: nextClass.enrolledCount >= nextClass.maxCapacity
                          ? "var(--color-vytal-red)"
                          : nextClass.enrolledCount / nextClass.maxCapacity >= 0.8
                          ? "var(--color-vytal-amber)"
                          : `linear-gradient(90deg, ${classColor}, ${classColor}cc)`,
                      }}
                    />
                  </div>
                  <p className="text-[10px]" style={{ color: "var(--color-vytal-muted)" }}>
                    {nextClass.maxCapacity - nextClass.enrolledCount} {t("my.home.spotsLeft")}
                  </p>
                </div>

                <Link
                  href="/schedule"
                  className="block w-full py-2 rounded-xl text-xs font-bold text-center transition-all duration-200 hover:opacity-90 hover:scale-[1.01]"
                  style={{
                    background: nextClass.enrolledCount >= nextClass.maxCapacity
                      ? "var(--color-vytal-bg3)"
                      : "var(--color-vytal-green)",
                    color: nextClass.enrolledCount >= nextClass.maxCapacity
                      ? "var(--color-vytal-muted)"
                      : "var(--color-vytal-bg)",
                  }}
                >
                  {nextClass.enrolledCount >= nextClass.maxCapacity ? t("my.home.waitlist") : t("my.home.bookNow")}
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3"
            style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
          >
            <Calendar size={28} style={{ color: "var(--color-vytal-muted)", opacity: 0.4 }} />
            <p className="text-sm font-medium" style={{ color: "var(--color-vytal-muted)" }}>
              {t("my.home.noClasses")}
            </p>
            <p className="text-xs" style={{ color: "var(--color-vytal-muted)", opacity: 0.6 }}>
              {t("my.home.restWell")}
            </p>
          </div>
        )}

        {/* ── WOD preview ── */}
        {todayWOD ? (
          <div
            className="rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.01]"
            style={{
              background: "var(--color-vytal-bg2)",
              border: "1px solid var(--color-vytal-border)",
            }}
          >
            <div
              className="h-1 w-full"
              style={{
                background: "linear-gradient(90deg, var(--color-vytal-green), rgba(34,197,94,0.3))",
              }}
            />
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--color-vytal-muted)" }}>
                  {t("my.home.todayWod")}
                </span>
                <Link
                  href="/wod"
                  className="flex items-center gap-1 text-[10px] font-semibold transition-opacity hover:opacity-70"
                  style={{ color: "var(--color-vytal-green)" }}
                >
                  {t("my.home.viewDetails")} <ArrowRight size={10} />
                </Link>
              </div>

              <div>
                <h3 className="font-black text-xl leading-tight mb-1" style={{ color: "var(--color-vytal-green)" }}>
                  {todayWOD.title ?? "WOD do Dia"}
                </h3>
                {todayWOD.description && (
                  <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: "var(--color-vytal-muted)" }}>
                    {todayWOD.description}
                  </p>
                )}

                {todayWOD.parts?.length > 0 && (
                  <div className="space-y-1.5">
                    {todayWOD.parts.slice(0, 3).map((part, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 rounded-lg px-2.5 py-2"
                        style={{ background: "var(--color-vytal-bg3)" }}
                      >
                        <div
                          className="w-4 h-4 rounded flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5"
                          style={{ background: "var(--color-vytal-green)", color: "var(--color-vytal-bg)" }}
                        >
                          {i + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold truncate" style={{ color: "var(--color-vytal-text)" }}>
                            {part.name}
                          </p>
                          <p className="text-[10px] truncate" style={{ color: "var(--color-vytal-muted)" }}>
                            {part.exercises.slice(0, 2).map((e) => exMap.get(e.exerciseId)).filter(Boolean).join(" · ")}
                            {part.exercises.length > 2 ? ` +${part.exercises.length - 2}` : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                    {todayWOD.parts.length > 3 && (
                      <p className="text-[10px] text-center" style={{ color: "var(--color-vytal-muted)" }}>
                        +{todayWOD.parts.length - 3} {t("my.home.moreParts")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3"
            style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
          >
            <Dumbbell size={28} style={{ color: "var(--color-vytal-muted)", opacity: 0.4 }} />
            <p className="text-sm font-medium" style={{ color: "var(--color-vytal-muted)" }}>
              {t("my.home.wodNotPublished")}
            </p>
          </div>
        )}
      </div>

      {/* ── Quick actions ── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--color-vytal-muted)" }}>
          {t("my.home.quickActions")}
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              href: "/schedule",
              icon: Calendar,
              label: t("my.home.bookClass"),
              color: "var(--color-vytal-blue)",
              bg: "rgba(0,212,255,0.08)",
              border: "rgba(0,212,255,0.2)",
            },
            {
              href: "/wod",
              icon: Dumbbell,
              label: t("my.home.viewWod"),
              color: "var(--color-vytal-green)",
              bg: "rgba(34,197,94,0.08)",
              border: "rgba(34,197,94,0.2)",
            },
            {
              href: "/records",
              icon: Trophy,
              label: t("my.home.myPRs"),
              color: "var(--color-vytal-purple)",
              bg: "rgba(192,132,252,0.08)",
              border: "rgba(192,132,252,0.2)",
            },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="rounded-2xl p-4 flex flex-col items-center gap-3 transition-all duration-200 hover:scale-[1.03]"
                style={{
                  background: action.bg,
                  border: `1px solid ${action.border}`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: action.bg, border: `1px solid ${action.border}` }}
                >
                  <Icon size={18} style={{ color: action.color }} strokeWidth={1.8} />
                </div>
                <span className="text-[10px] font-bold text-center leading-tight uppercase tracking-wide" style={{ color: action.color }}>
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Community teaser ── */}
      <Link
        href="/community"
        className="block rounded-2xl p-4 transition-all duration-200 hover:scale-[1.01]"
        style={{
          background: "linear-gradient(135deg, rgba(0,212,255,0.07) 0%, rgba(34,197,94,0.05) 100%)",
          border: "1px solid rgba(0,212,255,0.2)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}
            >
              <Users size={16} style={{ color: "var(--color-vytal-blue)" }} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--color-vytal-text)" }}>
                {t("my.home.community")}
              </p>
              <p className="text-xs" style={{ color: "var(--color-vytal-muted)" }}>
                {t("my.home.fistbumpsToday")}
              </p>
            </div>
          </div>
          <ArrowRight size={15} style={{ color: "var(--color-vytal-blue)" }} />
        </div>
      </Link>

      {/* ── Workout suggestion teaser ── */}
      <Link
        href="/workouts"
        className="block rounded-2xl p-4 transition-all duration-200 hover:scale-[1.01]"
        style={{
          background: "linear-gradient(135deg, rgba(192,132,252,0.08) 0%, rgba(34,197,94,0.04) 100%)",
          border: "1px solid rgba(192,132,252,0.2)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(192,132,252,0.1)", border: "1px solid rgba(192,132,252,0.2)" }}
            >
              <Dumbbell size={16} style={{ color: "var(--color-vytal-purple)" }} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--color-vytal-text)" }}>
                {t("my.home.suggestedWorkout")}
              </p>
              <p className="text-xs" style={{ color: "var(--color-vytal-muted)" }}>
                {t("my.home.suggestedWorkoutSub")}
              </p>
            </div>
          </div>
          <ArrowRight size={15} style={{ color: "var(--color-vytal-purple)" }} />
        </div>
      </Link>

      {/* ── Achievements ── */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: "linear-gradient(135deg, rgba(34,197,94,0.06) 0%, transparent 100%)",
          border: "1px solid var(--color-vytal-border)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Zap size={14} style={{ color: "var(--color-vytal-green)" }} />
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-vytal-muted)" }}>
            {t("my.home.recentAchievements")}
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { label: t("my.home.badge.streak"), icon: "🔥" },
            { label: t("my.home.badge.checkins"), icon: "💎" },
            { label: t("my.home.badge.firstPR"), icon: "🏆" },
          ].map((badge, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105"
              style={{
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.2)",
              }}
            >
              <span className="text-xs">{badge.icon}</span>
              <span className="text-[11px] font-semibold" style={{ color: "var(--color-vytal-text)" }}>
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
