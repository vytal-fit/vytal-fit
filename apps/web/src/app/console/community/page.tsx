"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart,
  Users,
  Trophy,
  TrendingUp,
  Star,
  Zap,
  Award,
  Activity,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

// ── Types ────────────────────────────────────────────────────────────────────

interface FeedEvent {
  id: string;
  type: "pr" | "checkin_milestone" | "wod_published" | "streak" | "badge";
  memberName: string;
  memberInitials: string;
  message: string;
  timestamp: string;
  fistbumps: number;
  hasBumped: boolean;
}

interface LeaderEntry {
  rank: number;
  name: string;
  initials: string;
  checkIns: number;
  isMe?: boolean;
}

// ── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_FEED: FeedEvent[] = [
  {
    id: "f1",
    type: "pr",
    memberName: "Ana Silva",
    memberInitials: "AS",
    message: "bateu PR no Back Squat com 95 kg!",
    timestamp: "2026-06-07T09:14:00",
    fistbumps: 14,
    hasBumped: false,
  },
  {
    id: "f2",
    type: "checkin_milestone",
    memberName: "Pedro Ferreira",
    memberInitials: "PF",
    message: "completou 100 check-ins no box!",
    timestamp: "2026-06-07T08:52:00",
    fistbumps: 22,
    hasBumped: false,
  },
  {
    id: "f3",
    type: "wod_published",
    memberName: "Coach Miguel",
    memberInitials: "CM",
    message: "publicou o WOD de amanha: FRAN edition",
    timestamp: "2026-06-06T20:00:00",
    fistbumps: 31,
    hasBumped: false,
  },
  {
    id: "f4",
    type: "streak",
    memberName: "Mariana Costa",
    memberInitials: "MC",
    message: "atingiu 12 semanas seguidas de treino!",
    timestamp: "2026-06-06T18:30:00",
    fistbumps: 18,
    hasBumped: false,
  },
  {
    id: "f5",
    type: "pr",
    memberName: "Rui Mendes",
    memberInitials: "RM",
    message: "fez PR no Clean & Jerk com 110 kg!",
    timestamp: "2026-06-06T17:10:00",
    fistbumps: 9,
    hasBumped: false,
  },
  {
    id: "f6",
    type: "badge",
    memberName: "Sofia Lopes",
    memberInitials: "SL",
    message: 'desbloqueou o badge "Guerreiro do Amanhecer"',
    timestamp: "2026-06-06T06:05:00",
    fistbumps: 7,
    hasBumped: false,
  },
  {
    id: "f7",
    type: "checkin_milestone",
    memberName: "Carlos Nunes",
    memberInitials: "CN",
    message: "completou 50 check-ins este ano!",
    timestamp: "2026-06-05T19:45:00",
    fistbumps: 11,
    hasBumped: false,
  },
  {
    id: "f8",
    type: "pr",
    memberName: "Ines Rodrigues",
    memberInitials: "IR",
    message: "bateu PR no Snatch com 62 kg!",
    timestamp: "2026-06-05T18:20:00",
    fistbumps: 16,
    hasBumped: false,
  },
];

const LEADERBOARD: LeaderEntry[] = [
  { rank: 1, name: "Ana Silva",       initials: "AS", checkIns: 24 },
  { rank: 2, name: "Pedro Ferreira",  initials: "PF", checkIns: 21 },
  { rank: 3, name: "Mariana Costa",   initials: "MC", checkIns: 19 },
  { rank: 4, name: "Tu",              initials: "AT", checkIns: 17, isMe: true },
  { rank: 5, name: "Sofia Lopes",     initials: "SL", checkIns: 15 },
];

const ATHLETE_OF_MONTH = {
  name: "Ana Silva",
  initials: "AS",
  checkIns: 24,
  prs: 3,
  streak: 8,
};

const FEED_STORAGE_KEY = "vytal-community-feed";

function loadFeed(): FeedEvent[] {
  if (typeof window === "undefined") return INITIAL_FEED;
  try {
    const raw = localStorage.getItem(FEED_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FeedEvent[]) : INITIAL_FEED;
  } catch {
    return INITIAL_FEED;
  }
}

function saveFeed(feed: FeedEvent[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(feed));
}

function relativeTime(iso: string, labelNow: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return labelNow;
  if (mins < 60) return `há ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `há ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `há ${days}d`;
}

function feedTypeConfig(type: FeedEvent["type"]): {
  icon: React.ElementType;
  color: string;
  bg: string;
} {
  switch (type) {
    case "pr":
      return { icon: Trophy, color: "var(--color-vytal-amber)", bg: "rgba(255,179,0,0.12)" };
    case "checkin_milestone":
      return { icon: Award, color: "var(--color-vytal-green)", bg: "rgba(34,197,94,0.1)" };
    case "wod_published":
      return { icon: Zap, color: "var(--color-vytal-blue)", bg: "rgba(0,212,255,0.1)" };
    case "streak":
      return { icon: Activity, color: "var(--color-vytal-orange)", bg: "rgba(255,140,66,0.1)" };
    case "badge":
      return { icon: Star, color: "var(--color-vytal-purple)", bg: "rgba(192,132,252,0.1)" };
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [feed, setFeed] = useState<FeedEvent[]>(INITIAL_FEED);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setFeed(loadFeed());
    setMounted(true);
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function toggleFistbump(id: string) {
    setFeed((prev) => {
      const updated = prev.map((e) =>
        e.id === id
          ? {
              ...e,
              hasBumped: !e.hasBumped,
              fistbumps: e.hasBumped ? e.fistbumps - 1 : e.fistbumps + 1,
            }
          : e
      );
      saveFeed(updated);
      return updated;
    });
    const event = feed.find((e) => e.id === id);
    if (event && !event.hasBumped) showToast(t("my.community.fistbump"));
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--color-vytal-green)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  const totalCheckInsWeek = 87;
  const prsThisWeek = 12;
  const activeMembers = 34;

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto space-y-6 md:max-w-5xl">

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-20 left-4 right-4 z-50 rounded-2xl px-4 py-3 text-sm font-semibold shadow-2xl flex items-center gap-2 transition-all duration-300"
          style={{ background: "var(--color-vytal-green)", color: "#080c0a" }}
        >
          <Heart size={14} fill="currentColor" />
          {toast}
        </div>
      )}

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-black" style={{ color: "var(--color-vytal-text)" }}>
          {t("my.community.title")}
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-vytal-muted)" }}>
          {t("my.community.subtitle")}
        </p>
      </div>

      {/* ── Community stats strip ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: Activity,
            value: totalCheckInsWeek,
            label: t("my.community.checkins"),
            sub: t("my.community.thisWeek"),
            color: "var(--color-vytal-green)",
            bg: "rgba(34,197,94,0.08)",
            border: "rgba(34,197,94,0.2)",
          },
          {
            icon: Trophy,
            value: prsThisWeek,
            label: t("my.community.prs"),
            sub: t("my.community.thisWeek"),
            color: "var(--color-vytal-amber)",
            bg: "rgba(255,179,0,0.08)",
            border: "rgba(255,179,0,0.2)",
          },
          {
            icon: Users,
            value: activeMembers,
            label: t("my.community.members"),
            sub: t("my.community.activeToday"),
            color: "var(--color-vytal-blue)",
            bg: "rgba(0,212,255,0.08)",
            border: "rgba(0,212,255,0.2)",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="rounded-2xl p-4 flex flex-col items-center gap-1.5 transition-all duration-200 hover:scale-[1.02]"
              style={{ background: stat.bg, border: `1px solid ${stat.border}` }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: stat.bg, border: `1px solid ${stat.border}` }}
              >
                <Icon size={15} style={{ color: stat.color }} strokeWidth={2} />
              </div>
              <span className="text-2xl font-black tabular-nums" style={{ color: stat.color }}>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ── Athlete of the Month ── */}
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(255,179,0,0.12) 0%, rgba(34,197,94,0.06) 100%)",
            border: "1px solid rgba(255,179,0,0.25)",
          }}
        >
          <div
            className="absolute -top-6 -right-6 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(255,179,0,0.1) 0%, transparent 70%)" }}
          />
          <div className="flex items-center gap-2 mb-4">
            <Star size={13} style={{ color: "var(--color-vytal-amber)" }} fill="currentColor" />
            <span
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: "var(--color-vytal-amber)" }}
            >
              {t("my.community.athleteOfMonth")}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 ring-2"
              style={{
                background: "rgba(255,179,0,0.2)",
                color: "var(--color-vytal-amber)",
                boxShadow: "0 0 0 2px rgba(255,179,0,0.35)",
              }}
            >
              {ATHLETE_OF_MONTH.initials}
            </div>
            <div>
              <p className="font-black text-lg leading-tight" style={{ color: "var(--color-vytal-text)" }}>
                {ATHLETE_OF_MONTH.name}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-vytal-amber)" }}>
                {t("my.community.bestBadge")}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { value: ATHLETE_OF_MONTH.checkIns, label: t("my.community.checkins") },
              { value: ATHLETE_OF_MONTH.prs,      label: "PRs" },
              { value: `${ATHLETE_OF_MONTH.streak}sem`, label: t("my.community.sequence") },
            ].map((s, i) => (
              <div
                key={i}
                className="rounded-xl px-2 py-2 text-center"
                style={{ background: "rgba(255,179,0,0.08)", border: "1px solid rgba(255,179,0,0.15)" }}
              >
                <p className="text-base font-black tabular-nums" style={{ color: "var(--color-vytal-amber)" }}>
                  {s.value}
                </p>
                <p className="text-[9px] font-medium" style={{ color: "var(--color-vytal-muted)" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Leaderboard ── */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: "var(--color-vytal-bg2)",
            border: "1px solid var(--color-vytal-border)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={13} style={{ color: "var(--color-vytal-green)" }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--color-vytal-muted)" }}>
              {t("my.community.leaderboard")}
            </span>
          </div>
          <div className="space-y-2">
            {LEADERBOARD.map((entry) => (
              <div
                key={entry.rank}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200"
                style={{
                  background: entry.isMe
                    ? "rgba(34,197,94,0.1)"
                    : "var(--color-vytal-bg3)",
                  border: entry.isMe
                    ? "1px solid rgba(34,197,94,0.25)"
                    : "1px solid transparent",
                }}
              >
                <span
                  className="text-sm font-black w-5 text-center shrink-0 tabular-nums"
                  style={{
                    color: entry.rank === 1
                      ? "var(--color-vytal-amber)"
                      : entry.rank === 2
                      ? "var(--color-vytal-muted)"
                      : entry.rank === 3
                      ? "var(--color-vytal-orange)"
                      : "var(--color-vytal-muted)",
                  }}
                >
                  {entry.rank}
                </span>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={{
                    background: entry.isMe ? "var(--color-vytal-green)" : "rgba(34,197,94,0.12)",
                    color: entry.isMe ? "#080c0a" : "var(--color-vytal-green)",
                  }}
                >
                  {entry.initials}
                </div>
                <span
                  className="flex-1 text-sm font-semibold truncate"
                  style={{ color: entry.isMe ? "var(--color-vytal-green)" : "var(--color-vytal-text)" }}
                >
                  {entry.name}
                </span>
                <span
                  className="text-sm font-black tabular-nums shrink-0"
                  style={{ color: entry.isMe ? "var(--color-vytal-green)" : "var(--color-vytal-muted)" }}
                >
                  {entry.checkIns}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Activity feed ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity size={13} style={{ color: "var(--color-vytal-green)" }} />
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--color-vytal-muted)" }}>
            {t("my.community.feed")}
          </p>
        </div>
        <div className="space-y-2">
          {feed.map((event) => {
            const cfg = feedTypeConfig(event.type);
            const Icon = cfg.icon;
            return (
              <div
                key={event.id}
                className="flex items-start gap-3 rounded-2xl px-4 py-3.5 transition-all duration-200 hover:scale-[1.005]"
                style={{
                  background: "var(--color-vytal-bg2)",
                  border: "1px solid var(--color-vytal-border)",
                }}
              >
                {/* Type icon */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: cfg.bg }}
                >
                  <Icon size={14} style={{ color: cfg.color }} strokeWidth={2} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug" style={{ color: "var(--color-vytal-text)" }}>
                    <span className="font-bold">{event.memberName}</span>{" "}
                    <span style={{ color: "var(--color-vytal-muted)" }}>{event.message}</span>
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: "var(--color-vytal-muted)", opacity: 0.7 }}>
                    {relativeTime(event.timestamp, t("my.community.agora"))}
                  </p>
                </div>

                {/* Fistbump button */}
                <button
                  onClick={() => toggleFistbump(event.id)}
                  className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 transition-all duration-200 hover:scale-110 shrink-0"
                  style={{
                    background: event.hasBumped ? "rgba(255,71,87,0.12)" : "var(--color-vytal-bg3)",
                    border: event.hasBumped
                      ? "1px solid rgba(255,71,87,0.25)"
                      : "1px solid var(--color-vytal-border)",
                  }}
                >
                  <Heart
                    size={13}
                    strokeWidth={2}
                    style={{ color: event.hasBumped ? "var(--color-vytal-red)" : "var(--color-vytal-muted)" }}
                    fill={event.hasBumped ? "var(--color-vytal-red)" : "none"}
                  />
                  <span
                    className="text-[11px] font-bold tabular-nums"
                    style={{ color: event.hasBumped ? "var(--color-vytal-red)" : "var(--color-vytal-muted)" }}
                  >
                    {event.fistbumps}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
