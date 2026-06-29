"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  Plus,
  X,
  Trophy,
  Medal,
  Users,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BadgeCategory = "attendance" | "performance" | "social" | "challenges";
type TriggerType = "manual" | "automatic";

interface Badge {
  id: string;
  emoji: string;
  name: string;
  description: string;
  points: number;
  category: BadgeCategory;
  membersEarned: number;
  triggerType: TriggerType;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  initials: string;
  totalPoints: number;
  badgeCount: number;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const categoryConfig: Record<BadgeCategory, { label: string; color: string }> = {
  attendance: { label: "Attendance", color: "bg-vytal-green/10 text-vytal-green" },
  performance: { label: "Performance", color: "bg-vytal-blue/10 text-vytal-blue" },
  social: { label: "Social", color: "bg-vytal-purple/10 text-vytal-purple" },
  challenges: { label: "Challenges", color: "bg-vytal-amber/10 text-vytal-amber" },
};

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const initialBadges: Badge[] = [
  { id: "b1", emoji: "\ud83d\udd25", name: "First WOD", description: "Complete your first workout", points: 5, category: "attendance", membersEarned: 428, triggerType: "automatic" },
  { id: "b2", emoji: "\ud83d\udcaa", name: "PR Machine", description: "Achieve 10 personal records", points: 20, category: "performance", membersEarned: 89, triggerType: "automatic" },
  { id: "b3", emoji: "\ud83c\udfc6", name: "100 Club", description: "Complete 100 check-ins", points: 50, category: "attendance", membersEarned: 156, triggerType: "automatic" },
  { id: "b4", emoji: "\u2b50", name: "Perfect Week", description: "Attend 5 classes in one week", points: 15, category: "attendance", membersEarned: 234, triggerType: "automatic" },
  { id: "b5", emoji: "\ud83c\udfaf", name: "Consistency King", description: "Maintain a 12-week streak", points: 30, category: "attendance", membersEarned: 67, triggerType: "automatic" },
  { id: "b6", emoji: "\ud83d\udc4a", name: "Social Butterfly", description: "Give 50 fistbumps", points: 10, category: "social", membersEarned: 178, triggerType: "automatic" },
  { id: "b7", emoji: "\ud83e\udd47", name: "Competition Winner", description: "Win a community event", points: 25, category: "challenges", membersEarned: 23, triggerType: "manual" },
  { id: "b8", emoji: "\ud83c\udf1f", name: "Early Bird", description: "Attend 20 morning classes", points: 15, category: "attendance", membersEarned: 112, triggerType: "automatic" },
  { id: "b9", emoji: "\ud83d\ude80", name: "Level Up", description: "Complete all beginner milestones", points: 20, category: "performance", membersEarned: 198, triggerType: "automatic" },
  { id: "b10", emoji: "\ud83d\udc51", name: "Iron Will", description: "Train 6 days in a week", points: 20, category: "attendance", membersEarned: 45, triggerType: "automatic" },
  { id: "b11", emoji: "\ud83e\udd1d", name: "Welcome Committee", description: "Introduce 5 new members", points: 15, category: "social", membersEarned: 56, triggerType: "manual" },
  { id: "b12", emoji: "\u26a1", name: "Speed Demon", description: "Top 3 in any timed WOD", points: 10, category: "performance", membersEarned: 134, triggerType: "automatic" },
  { id: "b13", emoji: "\ud83c\udfc5", name: "Marathon Month", description: "30 check-ins in one month", points: 35, category: "attendance", membersEarned: 78, triggerType: "automatic" },
  { id: "b14", emoji: "\ud83e\uddbe", name: "Superhero", description: "Achieve bodyweight back squat", points: 15, category: "performance", membersEarned: 203, triggerType: "automatic" },
  { id: "b15", emoji: "\ud83c\udf89", name: "Anniversary", description: "1 year as a member", points: 25, category: "attendance", membersEarned: 167, triggerType: "automatic" },
  { id: "b16", emoji: "\ud83d\udcf8", name: "Influencer", description: "Share 10 workout posts", points: 10, category: "social", membersEarned: 92, triggerType: "automatic" },
  { id: "b17", emoji: "\ud83e\udd4a", name: "Challenge Accepted", description: "Complete 5 community challenges", points: 20, category: "challenges", membersEarned: 87, triggerType: "automatic" },
  { id: "b18", emoji: "\ud83c\udf0a", name: "Night Owl", description: "Attend 20 evening classes", points: 15, category: "attendance", membersEarned: 145, triggerType: "automatic" },
  { id: "b19", emoji: "\ud83d\udd25", name: "Streak Master", description: "52-week training streak", points: 100, category: "attendance", membersEarned: 12, triggerType: "automatic" },
  { id: "b20", emoji: "\ud83c\udf1e", name: "Summer Warrior", description: "Train every day in August", points: 40, category: "challenges", membersEarned: 31, triggerType: "automatic" },
];

const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "Pedro Almeida", initials: "PA", totalPoints: 285, badgeCount: 16 },
  { rank: 2, name: "Ana Silva", initials: "AS", totalPoints: 260, badgeCount: 15 },
  { rank: 3, name: "Sofia Santos", initials: "SS", totalPoints: 245, badgeCount: 14 },
  { rank: 4, name: "Miguel Costa", initials: "MC", totalPoints: 220, badgeCount: 13 },
  { rank: 5, name: "Ines Ferreira", initials: "IF", totalPoints: 210, badgeCount: 12 },
  { rank: 6, name: "Tiago Neves", initials: "TN", totalPoints: 195, badgeCount: 11 },
  { rank: 7, name: "Maria Oliveira", initials: "MO", totalPoints: 180, badgeCount: 10 },
  { rank: 8, name: "Jose Fonte", initials: "JF", totalPoints: 165, badgeCount: 9 },
  { rank: 9, name: "Carla Mendes", initials: "CM", totalPoints: 150, badgeCount: 9 },
  { rank: 10, name: "Bruno Lopes", initials: "BL", totalPoints: 140, badgeCount: 8 },
];

function generateId(): string {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function BadgesPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [badges, setBadges] = useState<Badge[]>(initialBadges);
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<BadgeCategory | "all">("all");

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmoji, setFormEmoji] = useState("\ud83c\udfc6");
  const [formDescription, setFormDescription] = useState("");
  const [formPoints, setFormPoints] = useState("10");
  const [formTrigger, setFormTrigger] = useState<TriggerType>("automatic");
  const [formCategory, setFormCategory] = useState<BadgeCategory>("attendance");

  const filteredBadges = filterCategory === "all"
    ? badges
    : badges.filter((b) => b.category === filterCategory);

  const resetForm = useCallback(() => {
    setFormName("");
    setFormEmoji("\ud83c\udfc6");
    setFormDescription("");
    setFormPoints("10");
    setFormTrigger("automatic");
    setFormCategory("attendance");
    setShowForm(false);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!formName.trim()) return;
    const newBadge: Badge = {
      id: `b-${generateId()}`,
      emoji: formEmoji,
      name: formName.trim(),
      description: formDescription.trim(),
      points: parseInt(formPoints) || 0,
      category: formCategory,
      membersEarned: 0,
      triggerType: formTrigger,
    };
    setBadges((prev) => [...prev, newBadge]);
    toast(t("badges.badgeCreated"), "success");
    resetForm();
  }, [formName, formEmoji, formDescription, formPoints, formCategory, formTrigger, resetForm, toast, t]);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t("nav.community"), href: "/community" },
          { label: t("badges.title") },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("badges.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">{t("badges.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Plus className="h-4 w-4" />
          {t("badges.createBadge")}
        </button>
      </div>

      {/* Create Badge Form */}
      {showForm && (
        <div className="rounded-xl border border-vytal-green/20 bg-vytal-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-vytal-text">{t("badges.createBadge")}</h3>
            <button onClick={resetForm} className="text-vytal-muted hover:text-vytal-text">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-vytal-muted">{t("badges.badgeName")}</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-vytal-muted">{t("badges.emoji")}</label>
              <input
                type="text"
                value={formEmoji}
                onChange={(e) => setFormEmoji(e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/40 focus:outline-none"
                maxLength={4}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-vytal-muted">{t("badges.points")}</label>
              <input
                type="number"
                value={formPoints}
                onChange={(e) => setFormPoints(e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/40 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="mb-1 block text-xs font-medium text-vytal-muted">{t("badges.description")}</label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-vytal-muted">{t("badges.triggerType")}</label>
              <select
                value={formTrigger}
                onChange={(e) => setFormTrigger(e.target.value as TriggerType)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/40 focus:outline-none"
              >
                <option value="automatic">{t("badges.automatic")}</option>
                <option value="manual">{t("badges.manual")}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-vytal-muted">{t("store.category")}</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as BadgeCategory)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/40 focus:outline-none"
              >
                {(Object.keys(categoryConfig) as BadgeCategory[]).map((cat) => (
                  <option key={cat} value={cat}>{categoryConfig[cat].label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!formName.trim()}
              className="rounded-lg bg-vytal-green px-4 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90 disabled:opacity-50"
            >
              {t("badges.createBadge")}
            </button>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCategory("all")}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            filterCategory === "all" ? "bg-vytal-green/10 text-vytal-green" : "bg-vytal-bg3 text-vytal-muted hover:text-vytal-text"
          )}
        >
          {t("badges.all")} ({badges.length})
        </button>
        {(Object.keys(categoryConfig) as BadgeCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              filterCategory === cat ? categoryConfig[cat].color : "bg-vytal-bg3 text-vytal-muted hover:text-vytal-text"
            )}
          >
            {categoryConfig[cat].label} ({badges.filter((b) => b.category === cat).length})
          </button>
        ))}
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredBadges.map((badge) => (
          <div
            key={badge.id}
            className="group rounded-xl border border-vytal-border bg-vytal-card p-5 transition-all hover:border-vytal-green/20 hover:shadow-lg hover:shadow-black/10"
          >
            <div className="mb-3 flex items-start justify-between">
              <span className="text-3xl">{badge.emoji}</span>
              <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium", categoryConfig[badge.category].color)}>
                {categoryConfig[badge.category].label}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-vytal-text">{badge.name}</h3>
            <p className="mt-1 text-xs text-vytal-muted">{badge.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-vytal-amber" />
                <span className="text-xs font-semibold text-vytal-amber">{badge.points} pts</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-vytal-muted" />
                <span className="text-xs text-vytal-muted">{badge.membersEarned}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-vytal-amber" />
          <h3 className="text-sm font-semibold text-vytal-text">{t("badges.leaderboard")}</h3>
        </div>
        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div
              key={entry.rank}
              className={cn(
                "flex items-center gap-4 rounded-lg px-4 py-3 transition-colors",
                entry.rank <= 3 ? "bg-vytal-green/5" : "hover:bg-vytal-bg3/30"
              )}
            >
              <span className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                entry.rank === 1 ? "bg-vytal-amber/20 text-vytal-amber" :
                entry.rank === 2 ? "bg-gray-400/20 text-gray-400" :
                entry.rank === 3 ? "bg-orange-400/20 text-orange-400" :
                "bg-vytal-bg3 text-vytal-muted"
              )}>
                {entry.rank}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-vytal-green/10 text-xs font-semibold text-vytal-green">
                {entry.initials}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-vytal-text">{entry.name}</p>
                <p className="text-[11px] text-vytal-muted">{entry.badgeCount} {t("badges.badgesEarned")}</p>
              </div>
              <div className="flex items-center gap-1">
                <Medal className="h-4 w-4 text-vytal-amber" />
                <span className="text-sm font-bold text-vytal-text">{entry.totalPoints}</span>
                <span className="text-xs text-vytal-muted">pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
