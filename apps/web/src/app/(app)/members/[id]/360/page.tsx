"use client";

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { useDataStore, formatCurrency } from "@/stores/data-store";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Flame,
  Calendar,
  Clock,
  Heart,
  CreditCard,
  ScanLine,
  TrendingUp,
  BookOpen,
  RefreshCw,
  XCircle,
  Star,
  Dumbbell,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const engagementBreakdown = [
  { label: "Attendance", value: 85, color: "#22c55e" },
  { label: "Consistency", value: 72, color: "#00d4ff" },
  { label: "Social", value: 45, color: "#c084fc" },
  { label: "Payment", value: 100, color: "#ffb300" },
];

const engagementScore = 76;

// Generate activity heatmap (12 weeks)
function generateHeatmap(): number[][] {
  const weeks: number[][] = [];
  for (let w = 0; w < 12; w++) {
    const week: number[] = [];
    for (let d = 0; d < 7; d++) {
      // Weekend generally less, weekday more
      if (d >= 5) {
        week.push(Math.random() > 0.7 ? 1 : 0);
      } else {
        const r = Math.random();
        week.push(r > 0.6 ? 0 : r > 0.3 ? 1 : 2);
      }
    }
    weeks.push(week);
  }
  return weeks;
}

const heatmapData = generateHeatmap();
const currentStreak = 8;
const longestStreak = 14;

const quickStats = {
  totalSessions: 186,
  avgPerWeek: 4.2,
  favoriteClass: "WOD",
  favoriteTime: "17:30",
  prsThisMonth: 3,
  fistbumps: 42,
  communityPosts: 7,
};

const timelineEntries = [
  { type: "checkin", icon: ScanLine, description: "Checked in to WOD 17:30", time: "2h ago", color: "text-vytal-green" },
  { type: "pr", icon: Trophy, description: "New PR: Back Squat 140kg (+5kg)", time: "2h ago", color: "text-vytal-amber" },
  { type: "booking", icon: Calendar, description: "Booked class Strength 12:00", time: "Yesterday", color: "text-vytal-blue" },
  { type: "checkin", icon: ScanLine, description: "Checked in to WOD 09:00", time: "Yesterday", color: "text-vytal-green" },
  { type: "fistbump", icon: Heart, description: "Received 3 fistbumps on WOD result", time: "Yesterday", color: "text-vytal-purple" },
  { type: "cancellation", icon: XCircle, description: "Cancelled class Open Box 10:00", time: "3 days ago", color: "text-vytal-red" },
  { type: "payment", icon: CreditCard, description: `Payment processed: ${formatCurrency(75)} (Stripe)`, time: "5 days ago", color: "text-vytal-green" },
  { type: "checkin", icon: ScanLine, description: "Checked in to Hyrox 18:00", time: "5 days ago", color: "text-vytal-green" },
  { type: "pr", icon: Trophy, description: "New PR: Deadlift 180kg (+10kg)", time: "1 week ago", color: "text-vytal-amber" },
  { type: "plan", icon: RefreshCw, description: "Plan renewed: Livre (monthly)", time: "1 week ago", color: "text-vytal-blue" },
  { type: "checkin", icon: ScanLine, description: "Checked in to WOD 17:30", time: "1 week ago", color: "text-vytal-green" },
  { type: "booking", icon: Calendar, description: "Booked class Endurance 07:00", time: "1 week ago", color: "text-vytal-blue" },
  { type: "checkin", icon: ScanLine, description: "Checked in to WOD 09:00", time: "2 weeks ago", color: "text-vytal-green" },
  { type: "achievement", icon: Star, description: "Completed 100 check-in milestone", time: "2 weeks ago", color: "text-vytal-green" },
  { type: "checkin", icon: ScanLine, description: "Checked in to Strength 12:00", time: "2 weeks ago", color: "text-vytal-green" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function heatCellColor(value: number): string {
  if (value === 0) return "rgba(22,32,24,0.9)";
  if (value === 1) return "rgba(34,197,94,0.35)";
  return "rgba(34,197,94,0.7)";
}

// ---------------------------------------------------------------------------
// Engagement Ring
// ---------------------------------------------------------------------------

function EngagementRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#ffb300" : "#ff4757";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(34,197,94,0.08)" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-vytal-text">{score}</span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-vytal-muted">Score</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Member360Page() {
  const { t } = useI18n();
  const params = useParams();
  const id = params.id as string;
  const members = useDataStore((s) => s.members);
  const subscriptions = useDataStore((s) => s.subscriptions);
  const plans = useDataStore((s) => s.plans);

  const member = members.find((m) => m.id === id);
  if (!member) return notFound();

  const subscription = subscriptions.find((s) => s.memberId === member.id);
  const plan = subscription ? plans.find((p) => p.id === subscription.planId) : null;

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: t("nav.members"), href: "/members" },
          { label: member.name, href: `/members/${member.id}` },
          { label: t("member360.title") },
        ]}
      />

      {/* Header */}
      <div className="flex items-center gap-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-vytal-green/10 text-2xl font-bold text-vytal-green">
          {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-vytal-text">{member.name}</h1>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                member.status === "active" ? "bg-vytal-green/10 text-vytal-green" :
                member.status === "trial" ? "bg-vytal-amber/10 text-vytal-amber" :
                "bg-vytal-red/10 text-vytal-red"
              )}
            >
              {member.status}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-4 text-sm text-vytal-muted">
            <span>{t("member360.memberSince")} {new Date(member.joinedAt).toLocaleDateString("pt-PT", { month: "long", year: "numeric" })}</span>
            {plan && (
              <span className="rounded-full bg-vytal-bg3 px-2.5 py-0.5 text-xs font-medium text-vytal-text">
                {plan.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Column 1: Engagement Score */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("member360.engagementScore")}</h3>
          <div className="flex justify-center">
            <EngagementRing score={engagementScore} />
          </div>
          <div className="mt-5 space-y-3">
            {engagementBreakdown.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="w-20 text-xs text-vytal-muted">{item.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-vytal-bg3">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${item.value}%`, backgroundColor: item.color }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-xs font-semibold text-vytal-text">{item.value}%</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-1 rounded-lg bg-vytal-green/5 px-3 py-2">
            <TrendingUp className="h-3.5 w-3.5 text-vytal-green" />
            <span className="text-xs font-medium text-vytal-green">{t("member360.trendUp")}</span>
          </div>
        </div>

        {/* Column 2: Activity Heatmap */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("member360.activityHeatmap")}</h3>
          <div className="overflow-x-auto">
            <div className="flex gap-1">
              {/* Day labels */}
              <div className="flex flex-col gap-1 pr-1 pt-0">
                {DAYS.map((d) => (
                  <div key={d} className="flex h-4 items-center">
                    <span className="text-[9px] text-vytal-muted">{d}</span>
                  </div>
                ))}
              </div>
              {/* Grid */}
              {heatmapData.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((val, di) => (
                    <div
                      key={di}
                      className="h-4 w-4 rounded-sm"
                      style={{ backgroundColor: heatCellColor(val) }}
                      title={`${DAYS[di]}: ${val} session${val !== 1 ? "s" : ""}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-6 text-xs text-vytal-muted">
            <div className="flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-vytal-green" />
              <span>{t("member360.currentStreak")}: <span className="font-semibold text-vytal-text">{currentStreak} {t("member360.days")}</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-vytal-amber" />
              <span>{t("member360.longestStreak")}: <span className="font-semibold text-vytal-text">{longestStreak} {t("member360.days")}</span></span>
            </div>
          </div>
          {/* Legend */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[9px] text-vytal-muted">{t("member360.less")}</span>
            <div className="flex gap-0.5">
              <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: "rgba(22,32,24,0.9)" }} />
              <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: "rgba(34,197,94,0.35)" }} />
              <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: "rgba(34,197,94,0.7)" }} />
            </div>
            <span className="text-[9px] text-vytal-muted">{t("member360.more")}</span>
          </div>
        </div>

        {/* Column 3: Quick Stats */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("member360.quickStats")}</h3>
          <div className="space-y-4">
            {[
              { label: t("member360.totalSessions"), value: String(quickStats.totalSessions), icon: <ScanLine className="h-4 w-4 text-vytal-green" /> },
              { label: t("member360.avgPerWeek"), value: String(quickStats.avgPerWeek), icon: <Calendar className="h-4 w-4 text-vytal-blue" /> },
              { label: t("member360.favoriteClass"), value: quickStats.favoriteClass, icon: <Dumbbell className="h-4 w-4 text-vytal-purple" /> },
              { label: t("member360.favoriteTime"), value: quickStats.favoriteTime, icon: <Clock className="h-4 w-4 text-vytal-amber" /> },
              { label: t("member360.prsThisMonth"), value: String(quickStats.prsThisMonth), icon: <Trophy className="h-4 w-4 text-vytal-green" /> },
              { label: t("member360.fistbumps"), value: String(quickStats.fistbumps), icon: <Heart className="h-4 w-4 text-vytal-red" /> },
              { label: t("member360.communityPosts"), value: String(quickStats.communityPosts), icon: <BookOpen className="h-4 w-4 text-vytal-muted" /> },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vytal-bg3">
                    {stat.icon}
                  </div>
                  <span className="text-sm text-vytal-muted">{stat.label}</span>
                </div>
                <span className="font-mono text-sm font-semibold text-vytal-text">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-vytal-text">{t("member360.timeline")}</h2>
        <div className="space-y-2">
          {timelineEntries.map((entry, i) => {
            const Icon = entry.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-4 rounded-lg border border-vytal-border bg-vytal-card px-4 py-3 transition-colors hover:border-[rgba(61,255,110,0.22)]"
              >
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-vytal-bg3", entry.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="flex-1 text-sm text-vytal-text">{entry.description}</p>
                <span className="shrink-0 text-xs text-vytal-muted">{entry.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
