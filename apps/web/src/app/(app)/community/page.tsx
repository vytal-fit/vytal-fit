"use client";

import { useState, useCallback } from "react";
import { mockMembers } from "@vytal-fit/shared";
import {
  Trophy,
  CheckCircle,
  MessageCircle,
  Flag,
  Eye,
  EyeOff,
  Shield,
  Calendar,
  Users,
  TrendingUp,
  Heart,
  Plus,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tab = "feed" | "moderation" | "challenges" | "analytics";

type ActivityType = "pr" | "checkin" | "comment" | "fistbump" | "post" | "challenge";

interface FeedItem {
  id: string;
  memberName: string;
  initials: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  hidden: boolean;
  flagged: boolean;
}

interface FlaggedItem {
  id: string;
  contentPreview: string;
  reporterName: string;
  reason: string;
  date: string;
  resolved: boolean;
}

type ChallengeStatus = "active" | "upcoming" | "ended";
type ChallengeType = "challenge" | "competition" | "event";

interface Challenge {
  id: string;
  title: string;
  type: ChallengeType;
  startDate: string;
  endDate: string;
  participants: number;
  status: ChallengeStatus;
  description: string;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const activityIcons: Record<ActivityType, { emoji: string; color: string }> = {
  pr: { emoji: "\uD83C\uDFC6", color: "text-vytal-amber" },
  checkin: { emoji: "\u2705", color: "text-vytal-green" },
  comment: { emoji: "\uD83D\uDCAC", color: "text-vytal-blue" },
  fistbump: { emoji: "\uD83D\uDC4A", color: "text-vytal-purple" },
  post: { emoji: "\uD83D\uDCF0", color: "text-vytal-orange" },
  challenge: { emoji: "\uD83C\uDFAF", color: "text-vytal-green" },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const initialFeedItems: FeedItem[] = [
  { id: "f-1", memberName: "Pedro Almeida", initials: "PA", type: "pr", description: "Pedro achieved a new PR: Back Squat 140kg", timestamp: "2m ago", hidden: false, flagged: false },
  { id: "f-2", memberName: "Ana Silva", initials: "AS", type: "checkin", description: "Ana checked in to WOD 17:30", timestamp: "5m ago", hidden: false, flagged: false },
  { id: "f-3", memberName: "Miguel Costa", initials: "MC", type: "comment", description: "Miguel commented on today's WOD", timestamp: "8m ago", hidden: false, flagged: false },
  { id: "f-4", memberName: "Sofia Santos", initials: "SS", type: "fistbump", description: "Sofia fistbumped Pedro's result", timestamp: "12m ago", hidden: false, flagged: false },
  { id: "f-5", memberName: "Ines Ferreira", initials: "IF", type: "post", description: "Ines shared a progress photo", timestamp: "18m ago", hidden: false, flagged: false },
  { id: "f-6", memberName: "Tiago Neves", initials: "TN", type: "challenge", description: "Tiago completed the 30-day challenge", timestamp: "25m ago", hidden: false, flagged: false },
  { id: "f-7", memberName: "Jose Fonte", initials: "JF", type: "pr", description: "Jose achieved a new PR: Clean & Jerk 110kg", timestamp: "32m ago", hidden: false, flagged: false },
  { id: "f-8", memberName: "Maria Oliveira", initials: "MO", type: "checkin", description: "Maria checked in to Open Box 09:00", timestamp: "45m ago", hidden: false, flagged: false },
  { id: "f-9", memberName: "Ana Silva", initials: "AS", type: "fistbump", description: "Ana fistbumped Jose's result", timestamp: "48m ago", hidden: false, flagged: false },
  { id: "f-10", memberName: "Pedro Almeida", initials: "PA", type: "comment", description: "Pedro commented on the Murph challenge", timestamp: "1h ago", hidden: false, flagged: false },
  { id: "f-11", memberName: "Sofia Santos", initials: "SS", type: "post", description: "Sofia shared a training tip", timestamp: "1h ago", hidden: false, flagged: false },
  { id: "f-12", memberName: "Miguel Costa", initials: "MC", type: "checkin", description: "Miguel checked in to Strength 07:00", timestamp: "2h ago", hidden: false, flagged: false },
  { id: "f-13", memberName: "Tiago Neves", initials: "TN", type: "fistbump", description: "Tiago fistbumped Ana's check-in streak", timestamp: "2h ago", hidden: false, flagged: false },
  { id: "f-14", memberName: "Ines Ferreira", initials: "IF", type: "pr", description: "Ines achieved a new PR: Deadlift 100kg", timestamp: "3h ago", hidden: false, flagged: false },
  { id: "f-15", memberName: "Jose Fonte", initials: "JF", type: "comment", description: "Jose commented on the Summer Throwdown", timestamp: "4h ago", hidden: false, flagged: false },
];

const initialFlaggedItems: FlaggedItem[] = [
  { id: "fl-1", contentPreview: "Inappropriate comment on WOD results post", reporterName: "Ana Silva", reason: "Inappropriate language", date: "2026-06-03", resolved: false },
  { id: "fl-2", contentPreview: "Spam link shared in community feed", reporterName: "Pedro Almeida", reason: "Spam / advertising", date: "2026-06-02", resolved: false },
  { id: "fl-3", contentPreview: "Offensive photo in progress update", reporterName: "Miguel Costa", reason: "Inappropriate content", date: "2026-06-02", resolved: false },
  { id: "fl-4", contentPreview: "Misleading supplement recommendation", reporterName: "Sofia Santos", reason: "Misinformation", date: "2026-06-01", resolved: false },
  { id: "fl-5", contentPreview: "Bullying comment towards new member", reporterName: "Ines Ferreira", reason: "Harassment", date: "2026-05-31", resolved: false },
];

const initialChallenges: Challenge[] = [
  { id: "ch-1", title: "30 Day Consistency Challenge", type: "challenge", startDate: "2026-05-15", endDate: "2026-06-14", participants: 45, status: "active", description: "Train at least 4 times per week for 30 days" },
  { id: "ch-2", title: "Summer Throwdown 2026", type: "competition", startDate: "2026-07-01", endDate: "2026-07-03", participants: 22, status: "upcoming", description: "3-day CrossFit competition with teams of 2" },
  { id: "ch-3", title: "Athlete of the Month \u2014 June", type: "event", startDate: "2026-06-01", endDate: "2026-06-30", participants: 8, status: "active", description: "Voting open for the most dedicated athlete" },
  { id: "ch-4", title: "Murph Challenge", type: "challenge", startDate: "2026-05-20", endDate: "2026-05-26", participants: 38, status: "ended", description: "Complete Murph for time: 1mi run, 100 pull-ups, 200 push-ups, 300 squats, 1mi run" },
];

// Chart data
const postsPerDayData = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  posts: Math.floor(Math.random() * 15) + 5,
}));

const topActiveMembers = mockMembers
  .slice(0, 8)
  .map((m) => ({
    name: m.name.split(" ")[0],
    activity: Math.floor(Math.random() * 50) + 10,
  }))
  .concat([
    { name: "Ricardo", activity: 35 },
    { name: "Silvina", activity: 28 },
  ])
  .sort((a, b) => b.activity - a.activity)
  .slice(0, 10);

const activityBreakdownData = [
  { name: "PRs", value: 25, color: "#ffb300" },
  { name: "Check-ins", value: 35, color: "#22c55e" },
  { name: "Comments", value: 20, color: "#00d4ff" },
  { name: "Fistbumps", value: 15, color: "#c084fc" },
  { name: "Posts", value: 5, color: "#ff8c42" },
];

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

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Chart Card
// ---------------------------------------------------------------------------

function ChartCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-vytal-border bg-vytal-card/80 p-6 backdrop-blur-sm",
        className
      )}
    >
      <h3 className="mb-4 text-sm font-semibold text-vytal-text">{title}</h3>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<Tab>("feed");
  const [feedItems, setFeedItems] = useState<FeedItem[]>(initialFeedItems);
  const [flaggedItems, setFlaggedItems] = useState<FlaggedItem[]>(initialFlaggedItems);
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    type: "challenge" as ChallengeType,
    startDate: "",
    endDate: "",
  });
  const { toast } = useToast();

  // Feed actions
  const handleHide = useCallback(
    (id: string) => {
      setFeedItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, hidden: !item.hidden } : item))
      );
      toast("Post visibility toggled", "success");
    },
    [toast]
  );

  const handleFlag = useCallback(
    (id: string) => {
      setFeedItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, flagged: !item.flagged } : item))
      );
      toast("Post flagged for review", "info");
    },
    [toast]
  );

  // Moderation actions
  const handleApprove = useCallback(
    (id: string) => {
      setFlaggedItems((prev) => prev.filter((item) => item.id !== id));
      toast("Content approved", "success");
    },
    [toast]
  );

  const handleRemove = useCallback(
    (id: string) => {
      setFlaggedItems((prev) => prev.filter((item) => item.id !== id));
      toast("Content removed", "success");
    },
    [toast]
  );

  const handleWarnUser = useCallback(
    (id: string) => {
      setFlaggedItems((prev) => prev.filter((item) => item.id !== id));
      toast("Warning sent to user", "info");
    },
    [toast]
  );

  // Create challenge
  const handleCreateChallenge = useCallback(() => {
    if (!newChallenge.title.trim()) {
      toast("Title is required", "error");
      return;
    }
    const challenge: Challenge = {
      id: `ch-${Date.now()}`,
      title: newChallenge.title.trim(),
      description: newChallenge.description.trim(),
      type: newChallenge.type,
      startDate: newChallenge.startDate || "2026-06-10",
      endDate: newChallenge.endDate || "2026-07-10",
      participants: 0,
      status: "upcoming",
    };
    setChallenges((prev) => [challenge, ...prev]);
    setNewChallenge({ title: "", description: "", type: "challenge", startDate: "", endDate: "" });
    setShowCreateChallenge(false);
    toast("Challenge created!", "success");
  }, [newChallenge, toast]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "feed", label: "Feed", icon: <Heart className="h-4 w-4" /> },
    { key: "moderation", label: "Moderation", icon: <Shield className="h-4 w-4" /> },
    { key: "challenges", label: "Challenges & Events", icon: <Trophy className="h-4 w-4" /> },
    { key: "analytics", label: "Engagement Analytics", icon: <TrendingUp className="h-4 w-4" /> },
  ];

  const statusColors: Record<ChallengeStatus, { text: string; bg: string }> = {
    active: { text: "text-vytal-green", bg: "bg-vytal-green/10" },
    upcoming: { text: "text-vytal-blue", bg: "bg-vytal-blue/10" },
    ended: { text: "text-vytal-muted", bg: "bg-vytal-bg3" },
  };

  const typeBadgeColors: Record<ChallengeType, { text: string; bg: string }> = {
    challenge: { text: "text-vytal-amber", bg: "bg-vytal-amber/10" },
    competition: { text: "text-vytal-red", bg: "bg-vytal-red/10" },
    event: { text: "text-vytal-purple", bg: "bg-vytal-purple/10" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-vytal-text">Comunidade</h1>
        <p className="mt-1 text-sm text-vytal-muted">
          Community management and social activity
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Posts Today" value={12} color="blue" />
        <StatCard label="Fist Bumps Today" value={47} color="purple" />
        <StatCard label="Comments Today" value={23} color="green" />
        <StatCard label="Active Posters" value={89} color="amber" />
        <StatCard label="Engagement Rate" value="72%" color="green" />
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
                : "bg-vytal-bg2 text-vytal-muted hover:text-vytal-text"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Feed */}
      {activeTab === "feed" && (
        <div className="space-y-3">
          {feedItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-start gap-4 rounded-xl border border-vytal-border bg-vytal-card p-4 transition-colors hover:border-[rgba(61,255,110,0.22)]",
                item.hidden && "opacity-40",
                item.flagged && "border-vytal-amber/30"
              )}
            >
              {/* Avatar */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-vytal-green/10 text-sm font-bold text-vytal-green">
                {item.initials}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-vytal-text">
                    {item.memberName}
                  </span>
                  <span className={cn("text-sm", activityIcons[item.type].color)}>
                    {activityIcons[item.type].emoji}
                  </span>
                  {item.flagged && (
                    <span className="rounded bg-vytal-amber/10 px-1.5 py-0.5 text-[10px] font-semibold text-vytal-amber">
                      FLAGGED
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-vytal-muted">{item.description}</p>
                <span className="mt-1 text-xs text-vytal-muted">{item.timestamp}</span>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => handleHide(item.id)}
                  className="flex h-7 w-7 items-center justify-center rounded bg-vytal-bg3 text-vytal-muted transition-colors hover:text-vytal-text"
                  title={item.hidden ? "Show" : "Hide"}
                >
                  {item.hidden ? (
                    <Eye className="h-3.5 w-3.5" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  onClick={() => handleFlag(item.id)}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded bg-vytal-bg3 transition-colors",
                    item.flagged
                      ? "text-vytal-amber"
                      : "text-vytal-muted hover:text-vytal-amber"
                  )}
                  title="Flag"
                >
                  <Flag className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Moderation Queue */}
      {activeTab === "moderation" && (
        <div className="space-y-3">
          {flaggedItems.length === 0 ? (
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-12 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-vytal-green/50" />
              <p className="mt-4 text-lg font-semibold text-vytal-text">
                All clear!
              </p>
              <p className="mt-1 text-sm text-vytal-muted">
                No flagged content.
              </p>
            </div>
          ) : (
            flaggedItems.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-vytal-amber" />
                      <p className="text-sm font-semibold text-vytal-text">
                        {item.contentPreview}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-vytal-muted">
                      <span>
                        Reported by{" "}
                        <span className="text-vytal-text">{item.reporterName}</span>
                      </span>
                      <span>\u00B7</span>
                      <span>{item.reason}</span>
                      <span>\u00B7</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="rounded-lg bg-vytal-green/10 px-4 py-2 text-xs font-semibold text-vytal-green transition-colors hover:bg-vytal-green/20"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="rounded-lg bg-vytal-red/10 px-4 py-2 text-xs font-semibold text-vytal-red transition-colors hover:bg-vytal-red/20"
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => handleWarnUser(item.id)}
                    className="rounded-lg bg-vytal-amber/10 px-4 py-2 text-xs font-semibold text-vytal-amber transition-colors hover:bg-vytal-amber/20"
                  >
                    Warn User
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Challenges & Events */}
      {activeTab === "challenges" && (
        <div className="space-y-4">
          <button
            onClick={() => setShowCreateChallenge(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-vytal-border py-4 text-sm text-vytal-muted transition-colors hover:border-vytal-green/30 hover:text-vytal-green"
          >
            <Plus className="h-4 w-4" />
            Create Challenge
          </button>

          {showCreateChallenge && (
            <div className="rounded-xl border border-vytal-green/20 bg-vytal-green/5 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-vytal-green">
                  New Challenge
                </h3>
                <button
                  onClick={() => setShowCreateChallenge(false)}
                  className="text-vytal-muted transition-colors hover:text-vytal-text"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Title"
                  value={newChallenge.title}
                  onChange={(e) =>
                    setNewChallenge((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
                <textarea
                  placeholder="Description"
                  value={newChallenge.description}
                  onChange={(e) =>
                    setNewChallenge((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full resize-none rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
                <select
                  value={newChallenge.type}
                  onChange={(e) =>
                    setNewChallenge((prev) => ({
                      ...prev,
                      type: e.target.value as ChallengeType,
                    }))
                  }
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                >
                  <option value="challenge">Challenge</option>
                  <option value="competition">Competition</option>
                  <option value="event">Event</option>
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={newChallenge.startDate}
                    onChange={(e) =>
                      setNewChallenge((prev) => ({ ...prev, startDate: e.target.value }))
                    }
                    className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                  />
                  <input
                    type="date"
                    value={newChallenge.endDate}
                    onChange={(e) =>
                      setNewChallenge((prev) => ({ ...prev, endDate: e.target.value }))
                    }
                    className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleCreateChallenge}
                    className="rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {challenges.map((ch) => (
              <div
                key={ch.id}
                className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]"
              >
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="text-sm font-semibold text-vytal-text">
                    {ch.title}
                  </h3>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                      statusColors[ch.status].text,
                      statusColors[ch.status].bg
                    )}
                  >
                    {ch.status}
                  </span>
                </div>
                <span
                  className={cn(
                    "mb-3 inline-block rounded px-2 py-0.5 text-[10px] font-semibold capitalize",
                    typeBadgeColors[ch.type].text,
                    typeBadgeColors[ch.type].bg
                  )}
                >
                  {ch.type}
                </span>
                <p className="mb-3 text-xs text-vytal-muted">{ch.description}</p>
                <div className="flex items-center gap-4 text-xs text-vytal-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {ch.startDate} \u2014 {ch.endDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {ch.participants} participants
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Engagement Analytics */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Stat highlights */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Most Popular WOD This Week
              </p>
              <p className="mt-2 text-lg font-bold text-vytal-text">Fran</p>
              <p className="text-xs text-vytal-green">85 completions</p>
            </div>
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Most Fistbumped Result
              </p>
              <p className="mt-2 text-lg font-bold text-vytal-text">
                Pedro - Back Squat 140kg
              </p>
              <p className="text-xs text-vytal-purple">32 fistbumps</p>
            </div>
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Longest Active Streak
              </p>
              <p className="mt-2 text-lg font-bold text-vytal-text">Jose Fonte</p>
              <p className="text-xs text-vytal-amber">15 weeks</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Posts per Day */}
            <ChartCard title="Posts per Day (Last 30 Days)">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={postsPerDayData}>
                    <CartesianGrid
                      stroke="rgba(34,197,94,0.08)"
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "#6b8c72", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#6b8c72", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip {...tooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="posts"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                      name="Posts"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Top 10 Most Active */}
            <ChartCard title="Top 10 Most Active Members">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topActiveMembers} layout="vertical">
                    <CartesianGrid
                      stroke="rgba(34,197,94,0.08)"
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      type="number"
                      tick={{ fill: "#6b8c72", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: "#6b8c72", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={70}
                    />
                    <Tooltip {...tooltipStyle} />
                    <Bar
                      dataKey="activity"
                      fill="#22c55e"
                      radius={[0, 6, 6, 0]}
                      name="Activity"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Activity Type Breakdown (Donut) */}
            <ChartCard title="Activity Type Breakdown" className="lg:col-span-2">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activityBreakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {activityBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      iconType="circle"
                      iconSize={8}
                      formatter={(value: string) => (
                        <span style={{ color: "#dceee0", fontSize: 12 }}>
                          {value}
                        </span>
                      )}
                    />
                    <Tooltip
                      {...tooltipStyle}
                      formatter={(value) => [`${value}%`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  );
}
