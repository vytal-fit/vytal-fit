"use client";

import {
  ArrowLeft,
  Calendar,
  Users,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { rowToCoach } from "@/lib/reference-mappers";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/skeleton";
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

const roleConfig: Record<string, { label: string; className: string }> = {
  head_coach: { label: "Head Coach", className: "bg-vytal-green/10 text-vytal-green" },
  coach: { label: "Coach", className: "bg-vytal-blue/10 text-vytal-blue" },
  assistant: { label: "Assistant", className: "bg-vytal-amber/10 text-vytal-amber" },
};

export default function CoachPerformancePage() {
  const { t } = useI18n();
  const params = useParams();
  const id = params.id as string;
  // ── tRPC: coach record + performance derived from real classes/attendance ──
  const coachQuery = trpc.coaches.byId.useQuery({ id });
  const perfQuery = trpc.coaches.performance.useQuery({ id });
  const coach = coachQuery.data ? rowToCoach(coachQuery.data) : undefined;
  const perf = perfQuery.data;
  const attendanceTrendData = perf?.attendanceTrend ?? [];
  const classBreakdownData = perf?.classBreakdown ?? [];

  if (coachQuery.isError) {
    if (coachQuery.error.data?.code === "NOT_FOUND") notFound();
    return (
      <EmptyState
        icon={AlertTriangle}
        title={t("ui.error")}
        description={t("staff.loadError")}
        action={{ label: t("billing.retry"), onClick: () => void coachQuery.refetch() }}
      />
    );
  }

  if (coachQuery.isPending || !coach) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-[90px] rounded-xl" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[74px] rounded-xl" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[300px] rounded-xl" />
          <Skeleton className="h-[300px] rounded-xl" />
        </div>
      </div>
    );
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-4 stat-card-hover">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-green/10">
              <Calendar className="h-4 w-4 text-vytal-green" />
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("coachPerformance.classesThisMonth")}
              </span>
              <p className="text-lg font-bold text-vytal-text">{perf?.classesThisMonth ?? 0}</p>
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
              <p className="text-lg font-bold text-vytal-text">{perf?.avgAttendance ?? 0}</p>
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
              <p className="text-lg font-bold text-vytal-text">{perf?.attendanceRate ?? 0}%</p>
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
            {perf?.bestClass ? perf.bestClass.type : "-"}
          </p>
          <p className="mt-1 text-xs text-vytal-muted">
            {perf?.bestClass
              ? `${perf.bestClass.avg} ${t("coachPerformance.avgPerClass")}`
              : t("coachPerformance.noData")}
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
            {perf?.worstClass ? perf.worstClass.type : "-"}
          </p>
          <p className="mt-1 text-xs text-vytal-muted">
            {perf?.worstClass
              ? `${perf.worstClass.avg} ${t("coachPerformance.avgPerClass")}`
              : t("coachPerformance.noData")}
          </p>
        </div>
      </div>
    </div>
  );
}
