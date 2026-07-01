"use client";

import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Trophy,
  CheckCircle,
  Shield,
  TrendingUp,
  Heart,
  Send,
  Pin,
  Trash2,
  Megaphone,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/toast";
import { useI18n } from "@/lib/i18n";

type Tab = "feed" | "moderation" | "challenges" | "analytics";

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#0f1610",
    border: "1px solid rgba(34,197,94,0.2)",
    borderRadius: "8px",
    fontSize: 12,
    color: "#dceee0",
  },
  itemStyle: { color: "#dceee0" },
  labelStyle: { color: "#6b8c72", marginBottom: 4 },
};

const KIND_COLORS: Record<string, string> = {
  post: "#ff8c42",
  announcement: "#c084fc",
  auto_pr: "#ffb300",
  auto_milestone: "#22c55e",
  auto_wod: "#00d4ff",
};

const badgeKey: Record<string, string> = {
  owner: "community.badgeStaff",
  coach: "community.badgeCoach",
  athlete: "community.badgeAthlete",
};

function relativeTime(iso: string | Date): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: "green" | "blue" | "amber" | "purple";
}) {
  const colorMap = {
    green: "text-vytal-green",
    blue: "text-vytal-blue",
    amber: "text-vytal-amber",
    purple: "text-vytal-purple",
  };
  return (
    <div className="rounded-xl border border-vytal-border bg-vytal-card p-4 text-center">
      <p className="text-2xl font-bold text-vytal-text">{value}</p>
      <p className={cn("text-xs font-medium", colorMap[color])}>{label}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-vytal-border bg-vytal-card/80 p-6 backdrop-blur-sm">
      <h3 className="mb-4 text-sm font-semibold text-vytal-text">{title}</h3>
      {children}
    </div>
  );
}

export default function CommunityPage() {
  const { toast } = useToast();
  const { t } = useI18n();
  const utils = trpc.useUtils();

  const [activeTab, setActiveTab] = useState<Tab>("feed");
  const [draft, setDraft] = useState("");
  const [announce, setAnnounce] = useState(true);

  const feedQuery = trpc.community.feed.useQuery();
  const membersQuery = trpc.members.list.useQuery({});
  const feed = useMemo(() => feedQuery.data ?? [], [feedQuery.data]);

  const createPost = trpc.community.post.useMutation({
    onSuccess: () => {
      setDraft("");
      void utils.community.feed.invalidate();
      toast(t("community.posted"), "success");
    },
    onError: () => toast(t("ui.error"), "error"),
  });
  const pinPost = trpc.community.pin.useMutation({
    onSuccess: () => void utils.community.feed.invalidate(),
    onError: () => toast(t("ui.error"), "error"),
  });
  const removePost = trpc.community.deletePost.useMutation({
    onSuccess: () => {
      void utils.community.feed.invalidate();
      toast(t("community.remove"), "success");
    },
    onError: () => toast(t("ui.error"), "error"),
  });

  function handleCompose() {
    if (!draft.trim()) return;
    createPost.mutate({ content: draft.trim(), kind: announce ? "announcement" : "post" });
  }

  const stats = useMemo(() => {
    const fistbumps = feed.reduce((s, p) => s + p.fistbumps, 0);
    const comments = feed.reduce((s, p) => s + p.commentCount, 0);
    const posters = new Set(feed.map((p) => p.authorName)).size;
    const engaged = feed.filter((p) => p.fistbumps > 0 || p.commentCount > 0).length;
    return {
      posts: feed.length,
      fistbumps,
      comments,
      posters,
      rate: feed.length ? Math.round((engaged / feed.length) * 100) : 0,
    };
  }, [feed]);

  const breakdown = useMemo(() => {
    const byKind = new Map<string, number>();
    for (const p of feed) byKind.set(p.kind, (byKind.get(p.kind) ?? 0) + 1);
    return [...byKind.entries()].map(([name, value]) => ({
      name: t(`community.kind_${name}`),
      value,
      color: KIND_COLORS[name] ?? "#6b8c72",
    }));
  }, [feed, t]);

  const topMembers = useMemo(
    () =>
      (membersQuery.data?.items ?? [])
        .map((m) => ({ name: m.name.split(" ")[0], activity: m.totalCheckIns }))
        .sort((a, b) => b.activity - a.activity)
        .slice(0, 10),
    [membersQuery.data],
  );

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "feed", label: t("community.feed"), icon: <Heart className="h-4 w-4" /> },
    { key: "moderation", label: t("community.moderation"), icon: <Shield className="h-4 w-4" /> },
    { key: "challenges", label: t("community.challenges"), icon: <Trophy className="h-4 w-4" /> },
    { key: "analytics", label: t("community.engagementAnalytics"), icon: <TrendingUp className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-vytal-text">{t("community.title")}</h1>
        <p className="mt-1 text-sm text-vytal-muted">{t("community.subtitle")}</p>
      </div>

      {/* Stats Row (derived from the real feed) */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label={t("community.postsToday")} value={stats.posts} color="blue" />
        <StatCard label={t("community.fistBumpsToday")} value={stats.fistbumps} color="purple" />
        <StatCard label={t("community.commentsToday")} value={stats.comments} color="green" />
        <StatCard label={t("community.activePosters")} value={stats.posters} color="amber" />
        <StatCard label={t("community.engagementRate")} value={`${stats.rate}%`} color="green" />
      </div>

      {/* Tab Pills */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-vytal-green/10 text-vytal-green"
                : "bg-vytal-bg2 text-vytal-muted hover:text-vytal-text",
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Feed */}
      {activeTab === "feed" && (
        <div className="space-y-4">
          {/* Compose (staff posts carry a staff badge) */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-4">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("community.composePlaceholder")}
              rows={2}
              className="w-full resize-none bg-transparent text-sm text-vytal-text placeholder:text-vytal-muted focus:outline-none"
            />
            <div className="mt-2 flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-vytal-muted">
                <input
                  type="checkbox"
                  checked={announce}
                  onChange={(e) => setAnnounce(e.target.checked)}
                  className="accent-vytal-green"
                />
                <Megaphone className="h-3.5 w-3.5" />
                {t("community.postAsAnnouncement")}
              </label>
              <button
                onClick={handleCompose}
                disabled={!draft.trim() || createPost.isPending}
                className="flex items-center gap-1.5 rounded-lg bg-vytal-green px-4 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {t("community.publishPost")}
              </button>
            </div>
          </div>

          {feed.length === 0 ? (
            <p className="text-sm text-vytal-muted">{t("community.emptyFeed")}</p>
          ) : (
            feed.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-start gap-4 rounded-xl border bg-vytal-card p-4 transition-colors",
                  item.pinned ? "border-vytal-purple/30" : "border-vytal-border",
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-vytal-green/10 text-sm font-bold text-vytal-green">
                  {initials(item.authorName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-vytal-text">{item.authorName}</span>
                    <span className="rounded bg-vytal-bg3 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-vytal-muted">
                      {t(badgeKey[item.authorType] ?? "community.badgeAthlete")}
                    </span>
                    {item.pinned && (
                      <span className="flex items-center gap-1 rounded bg-vytal-purple/10 px-1.5 py-0.5 text-[10px] font-semibold text-vytal-purple">
                        <Pin className="h-2.5 w-2.5" /> {t("community.pinned")}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-vytal-muted">{item.content}</p>
                  <span className="mt-1 flex items-center gap-3 text-xs text-vytal-muted">
                    <span>{relativeTime(item.createdAt)}</span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" /> {item.fistbumps}
                    </span>
                    <span>{item.commentCount} {t("community.commentsShort")}</span>
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => pinPost.mutate({ id: item.id, pinned: !item.pinned })}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded bg-vytal-bg3 transition-colors",
                      item.pinned ? "text-vytal-purple" : "text-vytal-muted hover:text-vytal-purple",
                    )}
                    title={item.pinned ? t("community.unpin") : t("community.pin")}
                  >
                    <Pin className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => removePost.mutate({ id: item.id })}
                    className="flex h-7 w-7 items-center justify-center rounded bg-vytal-bg3 text-vytal-muted transition-colors hover:text-vytal-red"
                    title={t("community.remove")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Moderation queue (report system not built yet — honest empty state) */}
      {activeTab === "moderation" && (
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-12 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-vytal-green/50" />
          <p className="mt-4 text-lg font-semibold text-vytal-text">{t("community.allClear")}</p>
          <p className="mt-1 text-sm text-vytal-muted">{t("community.noFlaggedContent")}</p>
        </div>
      )}

      {/* Tab 3: Challenges (subsystem not built yet) */}
      {activeTab === "challenges" && (
        <div className="rounded-xl border border-dashed border-vytal-border bg-vytal-card p-12 text-center">
          <Trophy className="mx-auto h-12 w-12 text-vytal-amber/50" />
          <p className="mt-4 text-lg font-semibold text-vytal-text">{t("community.challengesSoon")}</p>
          <p className="mt-1 text-sm text-vytal-muted">{t("community.challengesSoonDesc")}</p>
        </div>
      )}

      {/* Tab 4: Engagement analytics (real: post mix + top members) */}
      {activeTab === "analytics" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title={t("community.activityBreakdown")}>
            {breakdown.length === 0 ? (
              <p className="text-sm text-vytal-muted">{t("community.emptyFeed")}</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={breakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {breakdown.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>

          <ChartCard title={t("community.topMembers")}>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topMembers} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,140,114,0.15)" />
                  <XAxis type="number" tick={{ fill: "#6b8c72", fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#6b8c72", fontSize: 11 }} width={70} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="activity" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      )}
    </div>
  );
}
