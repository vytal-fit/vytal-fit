"use client";

import { useState } from "react";
import {
  Heart,
  Users,
  Trophy,
  TrendingUp,
  Star,
  Zap,
  Award,
  Activity,
  MessageSquare,
  Megaphone,
  Send,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";

// ── Helpers ──────────────────────────────────────────────────────────────────

type FeedKind = "post" | "announcement" | "auto_pr" | "auto_milestone" | "auto_wod";

function relativeTime(iso: string | Date, labelNow: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return labelNow;
  if (mins < 60) return `há ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `há ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `há ${days}d`;
}

function feedKindConfig(kind: FeedKind): { icon: React.ElementType; color: string; bg: string } {
  switch (kind) {
    case "auto_pr":
      return { icon: Trophy, color: "var(--color-vytal-amber)", bg: "rgba(255,179,0,0.12)" };
    case "auto_milestone":
      return { icon: Award, color: "var(--color-vytal-green)", bg: "rgba(34,197,94,0.1)" };
    case "auto_wod":
      return { icon: Zap, color: "var(--color-vytal-blue)", bg: "rgba(0,212,255,0.1)" };
    case "announcement":
      return { icon: Megaphone, color: "var(--color-vytal-purple)", bg: "rgba(192,132,252,0.1)" };
    default:
      return { icon: Activity, color: "var(--color-vytal-green)", bg: "rgba(34,197,94,0.08)" };
  }
}

const badgeLabelKey: Record<string, string> = {
  owner: "my.community.badgeStaff",
  coach: "my.community.badgeCoach",
  athlete: "my.community.badgeAthlete",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const { t } = useI18n();
  const utils = trpc.useUtils();

  const feedQuery = trpc.community.feed.useQuery();
  const statsQuery = trpc.community.stats.useQuery();

  const [draft, setDraft] = useState("");
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  const react = trpc.community.react.useMutation({
    onSuccess: () => void utils.community.feed.invalidate(),
  });
  const createPost = trpc.community.post.useMutation({
    onSuccess: () => {
      setDraft("");
      void utils.community.feed.invalidate();
      showToast(t("my.community.posted"));
    },
  });
  const addComment = trpc.community.comment.useMutation({
    onSuccess: (_d, vars) => {
      setCommentDraft("");
      void utils.community.comments.invalidate({ postId: vars.postId });
      void utils.community.feed.invalidate();
    },
  });

  const feed = feedQuery.data ?? [];
  const stats = statsQuery.data;

  const statStrip = [
    {
      icon: Activity,
      value: stats?.checkInsThisWeek ?? 0,
      label: t("my.community.checkins"),
      sub: t("my.community.thisWeek"),
      color: "var(--color-vytal-green)",
      bg: "rgba(34,197,94,0.08)",
      border: "rgba(34,197,94,0.2)",
    },
    {
      icon: Trophy,
      value: stats?.prsThisWeek ?? 0,
      label: t("my.community.prs"),
      sub: t("my.community.thisWeek"),
      color: "var(--color-vytal-amber)",
      bg: "rgba(255,179,0,0.08)",
      border: "rgba(255,179,0,0.2)",
    },
    {
      icon: Users,
      value: stats?.activeToday ?? 0,
      label: t("my.community.members"),
      sub: t("my.community.activeToday"),
      color: "var(--color-vytal-blue)",
      bg: "rgba(0,212,255,0.08)",
      border: "rgba(0,212,255,0.2)",
    },
  ];

  const athlete = stats?.athleteOfMonth ?? null;
  const leaderboard = stats?.leaderboard ?? [];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-20 left-4 right-4 z-50 rounded-2xl px-4 py-3 text-sm font-semibold shadow-2xl flex items-center gap-2 transition-all duration-300"
          style={{ background: "var(--color-vytal-green)", color: "var(--color-vytal-bg)" }}
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
        {statStrip.map((stat, i) => {
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
                <p
                  className="text-[10px] font-semibold uppercase tracking-wide leading-tight"
                  style={{ color: stat.color, opacity: 0.9 }}
                >
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
          {athlete ? (
            <>
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 ring-2"
                  style={{
                    background: "rgba(255,179,0,0.2)",
                    color: "var(--color-vytal-amber)",
                    boxShadow: "0 0 0 2px rgba(255,179,0,0.35)",
                  }}
                >
                  {athlete.initials}
                </div>
                <div>
                  <p className="font-black text-lg leading-tight" style={{ color: "var(--color-vytal-text)" }}>
                    {athlete.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-vytal-amber)" }}>
                    {t("my.community.bestBadge")}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {[
                  { value: athlete.checkIns, label: t("my.community.checkins") },
                  { value: `${athlete.streak}sem`, label: t("my.community.sequence") },
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
            </>
          ) : (
            <p className="text-xs" style={{ color: "var(--color-vytal-muted)" }}>
              {t("my.community.noData")}
            </p>
          )}
        </div>

        {/* ── Leaderboard ── */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={13} style={{ color: "var(--color-vytal-green)" }} />
            <span
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: "var(--color-vytal-muted)" }}
            >
              {t("my.community.leaderboard")}
            </span>
          </div>
          {leaderboard.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--color-vytal-muted)" }}>
              {t("my.community.noData")}
            </p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, idx) => {
                const rank = idx + 1;
                return (
                  <div
                    key={entry.name + rank}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                    style={{ background: "var(--color-vytal-bg3)", border: "1px solid transparent" }}
                  >
                    <span
                      className="text-sm font-black w-5 text-center shrink-0 tabular-nums"
                      style={{
                        color:
                          rank === 1
                            ? "var(--color-vytal-amber)"
                            : rank === 2
                              ? "var(--color-vytal-muted)"
                              : "var(--color-vytal-muted)",
                      }}
                    >
                      {rank}
                    </span>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                      style={{ background: "rgba(34,197,94,0.12)", color: "var(--color-vytal-green)" }}
                    >
                      {entry.initials}
                    </div>
                    <span
                      className="flex-1 text-sm font-semibold truncate"
                      style={{ color: "var(--color-vytal-text)" }}
                    >
                      {entry.name}
                    </span>
                    <span
                      className="text-sm font-black tabular-nums shrink-0"
                      style={{ color: "var(--color-vytal-muted)" }}
                    >
                      {entry.checkIns}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Compose ── */}
      <div
        className="rounded-2xl p-4"
        style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t("my.community.composePlaceholder")}
          rows={2}
          className="w-full resize-none bg-transparent text-sm outline-none"
          style={{ color: "var(--color-vytal-text)" }}
        />
        <div className="flex justify-end">
          <button
            onClick={() => draft.trim() && createPost.mutate({ content: draft.trim() })}
            disabled={!draft.trim() || createPost.isPending}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all disabled:opacity-50"
            style={{ background: "var(--color-vytal-green)", color: "var(--color-vytal-bg)" }}
          >
            <Send size={13} />
            {t("my.community.post")}
          </button>
        </div>
      </div>

      {/* ── Activity feed ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity size={13} style={{ color: "var(--color-vytal-green)" }} />
          <p
            className="text-[10px] font-black uppercase tracking-widest"
            style={{ color: "var(--color-vytal-muted)" }}
          >
            {t("my.community.feed")}
          </p>
        </div>

        {feed.length === 0 ? (
          <p className="text-xs" style={{ color: "var(--color-vytal-muted)" }}>
            {t("my.community.emptyFeed")}
          </p>
        ) : (
          <div className="space-y-2">
            {feed.map((event) => {
              const cfg = feedKindConfig(event.kind as FeedKind);
              const Icon = cfg.icon;
              const isAuto = event.kind.startsWith("auto_");
              return (
                <div
                  key={event.id}
                  className="rounded-2xl px-4 py-3.5"
                  style={{
                    background: "var(--color-vytal-bg2)",
                    border: event.pinned
                      ? "1px solid rgba(192,132,252,0.35)"
                      : "1px solid var(--color-vytal-border)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: cfg.bg }}
                    >
                      <Icon size={14} style={{ color: cfg.color }} strokeWidth={2} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug" style={{ color: "var(--color-vytal-text)" }}>
                        <span className="font-bold">{event.authorName}</span>{" "}
                        <span
                          className="text-[9px] font-bold uppercase rounded px-1 py-0.5 align-middle"
                          style={{ background: "var(--color-vytal-bg3)", color: "var(--color-vytal-muted)" }}
                        >
                          {t(badgeLabelKey[event.authorType] ?? "my.community.badgeAthlete")}
                        </span>
                        {isAuto ? (
                          <span style={{ color: "var(--color-vytal-muted)" }}> {event.content}</span>
                        ) : (
                          <span className="block mt-1" style={{ color: "var(--color-vytal-muted)" }}>
                            {event.content}
                          </span>
                        )}
                      </p>
                      <p
                        className="text-[10px] mt-1"
                        style={{ color: "var(--color-vytal-muted)", opacity: 0.7 }}
                      >
                        {relativeTime(event.createdAt, t("my.community.agora"))}
                      </p>
                    </div>

                    <button
                      onClick={() => react.mutate({ postId: event.id })}
                      className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 transition-all duration-200 hover:scale-110 shrink-0"
                      style={{
                        background: event.hasReacted ? "rgba(255,71,87,0.12)" : "var(--color-vytal-bg3)",
                        border: event.hasReacted
                          ? "1px solid rgba(255,71,87,0.25)"
                          : "1px solid var(--color-vytal-border)",
                      }}
                    >
                      <Heart
                        size={13}
                        strokeWidth={2}
                        style={{ color: event.hasReacted ? "var(--color-vytal-red)" : "var(--color-vytal-muted)" }}
                        fill={event.hasReacted ? "var(--color-vytal-red)" : "none"}
                      />
                      <span
                        className="text-[11px] font-bold tabular-nums"
                        style={{ color: event.hasReacted ? "var(--color-vytal-red)" : "var(--color-vytal-muted)" }}
                      >
                        {event.fistbumps}
                      </span>
                    </button>
                  </div>

                  {/* Comments toggle */}
                  <button
                    onClick={() => {
                      setOpenComments(openComments === event.id ? null : event.id);
                      setCommentDraft("");
                    }}
                    className="mt-2 ml-11 flex items-center gap-1.5 text-[11px] font-semibold"
                    style={{ color: "var(--color-vytal-muted)" }}
                  >
                    <MessageSquare size={12} />
                    {event.commentCount} {t("my.community.comments")}
                  </button>

                  {openComments === event.id && (
                    <CommentThread
                      postId={event.id}
                      draft={commentDraft}
                      setDraft={setCommentDraft}
                      onSubmit={() =>
                        commentDraft.trim() &&
                        addComment.mutate({ postId: event.id, content: commentDraft.trim() })
                      }
                      submitting={addComment.isPending}
                      badgeLabel={(type: string) => t(badgeLabelKey[type] ?? "my.community.badgeAthlete")}
                      nowLabel={t("my.community.agora")}
                      sendLabel={t("my.community.post")}
                      placeholder={t("my.community.addComment")}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Comment thread ────────────────────────────────────────────────────────────

function CommentThread({
  postId,
  draft,
  setDraft,
  onSubmit,
  submitting,
  badgeLabel,
  nowLabel,
  sendLabel,
  placeholder,
}: {
  postId: string;
  draft: string;
  setDraft: (v: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  badgeLabel: (type: string) => string;
  nowLabel: string;
  sendLabel: string;
  placeholder: string;
}) {
  const commentsQuery = trpc.community.comments.useQuery({ postId });
  const comments = commentsQuery.data ?? [];
  return (
    <div className="mt-3 ml-11 space-y-2">
      {comments.map((c) => (
        <div
          key={c.id}
          className="rounded-xl px-3 py-2"
          style={{ background: "var(--color-vytal-bg3)" }}
        >
          <p className="text-xs" style={{ color: "var(--color-vytal-text)" }}>
            <span className="font-bold">{c.authorName}</span>{" "}
            <span
              className="text-[8px] font-bold uppercase rounded px-1 align-middle"
              style={{ background: "var(--color-vytal-bg2)", color: "var(--color-vytal-muted)" }}
            >
              {badgeLabel(c.authorType)}
            </span>
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-vytal-muted)" }}>
            {c.content}
          </p>
          <p className="text-[9px] mt-1" style={{ color: "var(--color-vytal-muted)", opacity: 0.6 }}>
            {relativeTime(c.createdAt, nowLabel)}
          </p>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          placeholder={placeholder}
          className="flex-1 rounded-xl px-3 py-2 text-xs outline-none"
          style={{ background: "var(--color-vytal-bg3)", color: "var(--color-vytal-text)" }}
        />
        <button
          onClick={onSubmit}
          disabled={!draft.trim() || submitting}
          className="rounded-xl px-3 py-2 text-[11px] font-bold disabled:opacity-50"
          style={{ background: "var(--color-vytal-green)", color: "var(--color-vytal-bg)" }}
        >
          {sendLabel}
        </button>
      </div>
    </div>
  );
}
