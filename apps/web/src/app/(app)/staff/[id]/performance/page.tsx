"use client";

import { useDataStore } from "@/stores/data-store";
import {
  ArrowLeft,
  Calendar,
  Users,
  TrendingUp,
  Star,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock attendance trend data (12 weeks)
const attendanceTrendData = [
  { week: "W1", avg: 14.2 },
  { week: "W2", avg: 15.1 },
  { week: "W3", avg: 14.8 },
  { week: "W4", avg: 16.0 },
  { week: "W5", avg: 15.5 },
  { week: "W6", avg: 16.8 },
  { week: "W7", avg: 15.2 },
  { week: "W8", avg: 17.1 },
  { week: "W9", avg: 16.4 },
  { week: "W10", avg: 16.9 },
  { week: "W11", avg: 15.8 },
  { week: "W12", avg: 16.2 },
];

// Mock class breakdown data
const classBreakdownData = [
  { type: "WOD", attendance: 18.5 },
  { type: "Strength", attendance: 10.2 },
  { type: "Open Box", attendance: 6.8 },
  { type: "Mobility", attendance: 4.8 },
  { type: "Endurance", attendance: 12.1 },
];

// Mock feedback
const mockFeedback = [
  {
    id: 1,
    rating: 5,
    comment: "Excellent coaching! Always motivating and pays attention to form.",
    date: "2026-05-28",
    author: "Ana S.",
  },
  {
    id: 2,
    rating: 4,
    comment: "Great energy in class. Would love more scaling options for beginners.",
    date: "2026-05-20",
    author: "Pedro A.",
  },
  {
    id: 3,
    rating: 5,
    comment: "Best coach for Olympic lifting. Helped me fix my clean technique.",
    date: "2026-05-12",
    author: "Miguel C.",
  },
];

const roleConfig: Record<string, { label: string; className: string }> = {
  head_coach: { label: "Head Coach", className: "bg-vytal-green/10 text-vytal-green" },
  coach: { label: "Coach", className: "bg-vytal-blue/10 text-vytal-blue" },
  assistant: { label: "Assistant", className: "bg-vytal-amber/10 text-vytal-amber" },
};

export default function CoachPerformancePage() {
  const { t } = useI18n();
  const params = useParams();
  const id = params.id as string;
  const storeCoaches = useDataStore((s) => s.coaches);
  const coach = storeCoaches.find((c) => c.id === id);

  if (!coach) {
    notFound();
  }

  const role = roleConfig[coach.role] ?? roleConfig.coach;
  const initials = coach.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t("staff.title"), href: "/staff" },
          { label: coach.name, href: `/staff/${coach.id}` },
          { label: t("coachPerformance.title") },
        ]}
      />

      <Link
        href={`/staff/${coach.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-vytal-muted transition-colors hover:text-vytal-text"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("coachPerformance.backToCoach")}
      </Link>

      {/* Coach Header */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-vytal-green/10 text-lg font-bold text-vytal-green">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-vytal-text">{coach.name}</h1>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                  role.className
                )}
              >
                {role.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-vytal-muted">
              {t("coachPerformance.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-4 stat-card-hover">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-green/10">
              <Calendar className="h-4 w-4 text-vytal-green" />
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("coachPerformance.classesThisMonth")}
              </span>
              <p className="text-lg font-bold text-vytal-text">24</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-4 stat-card-hover">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-blue/10">
              <Users className="h-4 w-4 text-vytal-blue" />
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("coachPerformance.avgAttendance")}
              </span>
              <p className="text-lg font-bold text-vytal-text">16.2</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-4 stat-card-hover">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-amber/10">
              <TrendingUp className="h-4 w-4 text-vytal-amber" />
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("coachPerformance.attendanceRate")}
              </span>
              <p className="text-lg font-bold text-vytal-text">81%</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-4 stat-card-hover">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-purple/10">
              <Star className="h-4 w-4 text-vytal-purple" />
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("coachPerformance.memberRating")}
              </span>
              <p className="text-lg font-bold text-vytal-text">4.7/5</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Attendance Trend */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-vytal-text">
            {t("coachPerformance.attendanceTrend")}
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,140,114,0.15)" />
                <XAxis
                  dataKey="week"
                  tick={{ fill: "#6b8c72", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(107,140,114,0.2)" }}
                />
                <YAxis
                  tick={{ fill: "#6b8c72", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(107,140,114,0.2)" }}
                  domain={[0, 20]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f1610",
                    border: "1px solid rgba(34,197,94,0.12)",
                    borderRadius: 8,
                    color: "#dceee0",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avg"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#22c55e" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Class Breakdown */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-vytal-text">
            {t("coachPerformance.classBreakdown")}
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={classBreakdownData}
                layout="vertical"
                margin={{ left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,140,114,0.15)" />
                <XAxis
                  type="number"
                  tick={{ fill: "#6b8c72", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(107,140,114,0.2)" }}
                />
                <YAxis
                  type="category"
                  dataKey="type"
                  tick={{ fill: "#6b8c72", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(107,140,114,0.2)" }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f1610",
                    border: "1px solid rgba(34,197,94,0.12)",
                    borderRadius: 8,
                    color: "#dceee0",
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="attendance"
                  fill="#22c55e"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Best / Worst Classes */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-green/10">
              <ThumbsUp className="h-4 w-4 text-vytal-green" />
            </div>
            <h3 className="text-sm font-semibold text-vytal-text">
              {t("coachPerformance.bestClass")}
            </h3>
          </div>
          <p className="text-sm text-vytal-text font-medium">
            {t("coachPerformance.bestClassDetail")}
          </p>
          <p className="mt-1 text-xs text-vytal-muted">
            {t("coachPerformance.bestClassAvg")}
          </p>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-red/10">
              <ThumbsDown className="h-4 w-4 text-vytal-red" />
            </div>
            <h3 className="text-sm font-semibold text-vytal-text">
              {t("coachPerformance.worstClass")}
            </h3>
          </div>
          <p className="text-sm text-vytal-text font-medium">
            {t("coachPerformance.worstClassDetail")}
          </p>
          <p className="mt-1 text-xs text-vytal-muted">
            {t("coachPerformance.worstClassAvg")}
          </p>
        </div>
      </div>

      {/* Member Feedback */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-vytal-text">
          {t("coachPerformance.memberFeedback")}
        </h2>
        <div className="space-y-3">
          {mockFeedback.map((fb) => (
            <div
              key={fb.id}
              className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3.5 w-3.5",
                          i < fb.rating
                            ? "fill-vytal-amber text-vytal-amber"
                            : "text-vytal-bg3"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-vytal-text">
                    {fb.author}
                  </span>
                </div>
                <span className="text-[10px] text-vytal-muted">
                  {new Date(fb.date).toLocaleDateString("pt-PT", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-sm text-vytal-muted leading-relaxed">
                {fb.comment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
