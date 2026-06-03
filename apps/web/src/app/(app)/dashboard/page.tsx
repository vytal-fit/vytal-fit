"use client";

import { useState } from "react";
import { mockDashboardStats } from "@vytal-fit/shared";
import type { Class, DashboardStats } from "@vytal-fit/shared";
import { useDataStore, formatCurrency } from "@/stores/data-store";
import { useAuthStore } from "@/stores/auth-store";
import {
  Users,
  UserCheck,
  CalendarDays,
  TrendingUp,
  DollarSign,
  TrendingDown,
  AlertTriangle,
  Trophy,
  ScanLine,
  UserPlus,
  Dumbbell,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
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

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: "green" | "red" | "amber" | "blue" | "purple";
  subtitle?: string;
  trend?: { value: string; up: boolean };
}

function StatCard({ label, value, icon, color, subtitle, trend }: StatCardProps) {
  const colorMap = {
    green: "text-vytal-green",
    red: "text-vytal-red",
    amber: "text-vytal-amber",
    blue: "text-vytal-blue",
    purple: "text-vytal-purple",
  };

  const bgMap = {
    green: "bg-vytal-green/10",
    red: "bg-vytal-red/10",
    amber: "bg-vytal-amber/10",
    blue: "bg-vytal-blue/10",
    purple: "bg-vytal-purple/10",
  };

  return (
    <div className="stat-card-hover min-h-[120px] rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
            {label}
          </span>
          <span className="text-2xl font-bold text-vytal-text">{value}</span>
          <div className="flex items-center gap-2">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-xs font-medium",
                  trend.up ? "text-vytal-green" : "text-vytal-red"
                )}
              >
                {trend.up ? "\u2191" : "\u2193"} {trend.value}
              </span>
            )}
            {subtitle && (
              <span className={`text-xs ${colorMap[color]}`}>{subtitle}</span>
            )}
          </div>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${bgMap[color]}`}
        >
          <div className={colorMap[color]}>{icon}</div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick Action Card
// ---------------------------------------------------------------------------

function QuickActionCard({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 rounded-xl border border-vytal-border bg-vytal-card p-4 transition-all duration-200 hover:border-vytal-green/30 hover:bg-vytal-green/5"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-green/10 text-vytal-green">
        {icon}
      </div>
      <span className="text-xs font-medium text-vytal-text">{label}</span>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Time-of-day greeting
// ---------------------------------------------------------------------------

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 19) return "Boa tarde";
  return "Boa noite";
}

// ---------------------------------------------------------------------------
// Chart Card wrapper
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
// Recharts shared tooltip style
// ---------------------------------------------------------------------------

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
// Mock chart data
// ---------------------------------------------------------------------------

const memberGrowthData = [
  { month: "Jan", total: 280, active: 220 },
  { month: "Feb", total: 295, active: 238 },
  { month: "Mar", total: 310, active: 255 },
  { month: "Apr", total: 328, active: 272 },
  { month: "May", total: 345, active: 290 },
  { month: "Jun", total: 358, active: 305 },
  { month: "Jul", total: 370, active: 318 },
  { month: "Aug", total: 382, active: 325 },
  { month: "Sep", total: 395, active: 338 },
  { month: "Oct", total: 405, active: 348 },
  { month: "Nov", total: 418, active: 358 },
  { month: "Dec", total: 428, active: 367 },
];

const revenueData = [
  { month: "Jan", revenue: 14200 },
  { month: "Feb", revenue: 15100 },
  { month: "Mar", revenue: 15800 },
  { month: "Apr", revenue: 16500 },
  { month: "May", revenue: 17200 },
  { month: "Jun", revenue: 18400 },
];

const occupancyByDayData = [
  { day: "Mon", occupancy: 82 },
  { day: "Tue", occupancy: 78 },
  { day: "Wed", occupancy: 85 },
  { day: "Thu", occupancy: 91 },
  { day: "Fri", occupancy: 75 },
  { day: "Sat", occupancy: 45 },
  { day: "Sun", occupancy: 22 },
];

function getOccupancyColor(pct: number): string {
  if (pct > 90) return "#ff4757";
  if (pct >= 80) return "#ffb300";
  return "#22c55e";
}

const defaultDistributionColors = ["#3dff6e", "#00d4ff", "#ffb300", "#ff4757", "#c084fc", "#ff8c42"];

function buildClassDistributionData(classTypes: { name: string; color: string }[]) {
  const names = ["WOD", "Open Box", "Strength", "Hyrox", "Gymnastics", "Mobility"];
  const values = [45, 15, 12, 10, 8, 5];
  const items = names.map((name, i) => ({
    name,
    value: values[i],
    color: classTypes[i]?.color ?? defaultDistributionColors[i] ?? "#6b8c72",
  }));
  items.push({ name: "Other", value: 5, color: "#6b8c72" });
  return items;
}

// Attendance heatmap data: 7 days x 13 hours (06:00-18:00)
const HEATMAP_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HEATMAP_HOURS = Array.from({ length: 13 }, (_, i) => `${String(i + 6).padStart(2, "0")}:00`);
const HEATMAP_DATA: number[][] = [
  [4, 16, 12, 8, 5, 3, 10, 4, 3, 5, 6, 18, 20],
  [3, 15, 11, 7, 4, 2, 9, 3, 2, 4, 5, 17, 19],
  [5, 17, 13, 9, 6, 4, 11, 5, 4, 6, 7, 19, 20],
  [6, 18, 14, 10, 7, 5, 12, 6, 5, 7, 8, 20, 22],
  [3, 14, 10, 6, 3, 2, 8, 3, 2, 3, 4, 14, 16],
  [0, 0, 8, 10, 6, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 4, 3, 0, 0, 0, 0, 0, 0, 0, 0],
];

function heatmapMax(): number {
  let max = 0;
  for (const row of HEATMAP_DATA) {
    for (const v of row) {
      if (v > max) max = v;
    }
  }
  return max;
}

function heatmapCellColor(value: number, max: number): string {
  if (value === 0) return "rgba(22,32,24,0.9)";
  const intensity = value / max;
  if (intensity <= 0.2) return "rgba(34,197,94,0.1)";
  if (intensity <= 0.4) return "rgba(34,197,94,0.2)";
  if (intensity <= 0.6) return "rgba(34,197,94,0.4)";
  if (intensity <= 0.8) return "rgba(34,197,94,0.6)";
  return "rgba(34,197,94,0.8)";
}

// ---------------------------------------------------------------------------
// Today's schedule row
// ---------------------------------------------------------------------------

function getEnrollmentColor(enrolled: number, capacity: number): string {
  const pct = (enrolled / capacity) * 100;
  if (pct >= 100) return "bg-vytal-red";
  if (pct >= 80) return "bg-vytal-amber";
  return "bg-vytal-green";
}

function ClassScheduleRow({ cls }: { cls: Class }) {
  const { t } = useI18n();
  const pct = Math.min((cls.enrolledCount / cls.maxCapacity) * 100, 100);
  const barColor = getEnrollmentColor(cls.enrolledCount, cls.maxCapacity);
  const isFull = cls.enrolledCount >= cls.maxCapacity;

  return (
    <div className="schedule-row-hover flex items-center gap-4 rounded-lg border border-vytal-border bg-vytal-card px-4 py-3 hover:border-[rgba(61,255,110,0.22)] hover:bg-vytal-bg3/50">
      <div className="w-24 shrink-0">
        <span className="font-mono text-sm font-semibold text-vytal-text">
          {cls.startTime}
        </span>
        <span className="ml-1 font-mono text-xs text-vytal-muted">
          - {cls.endTime}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: cls.classType.color }}
        />
        <span className="text-sm font-medium text-vytal-text">
          {cls.classType.name}
        </span>
      </div>
      <span className="hidden text-xs text-vytal-muted lg:block">
        {cls.location.name}
      </span>
      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-vytal-muted">
          {cls.coaches.map((c) => c.name.split(" ")[0]).join(", ") || "Open Box"}
        </span>
      </div>
      <div className="flex w-32 items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-vytal-bg3">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span
          className={`font-mono text-xs ${isFull ? "font-semibold text-vytal-red" : "text-vytal-muted"}`}
        >
          {cls.enrolledCount}/{cls.maxCapacity}
        </span>
      </div>
      {cls.waitlistCount > 0 && (
        <span className="rounded-full bg-vytal-amber/10 px-2 py-0.5 text-[10px] font-medium text-vytal-amber">
          +{cls.waitlistCount} {t("classes.waitlist")}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Custom tooltip for revenue chart
// ---------------------------------------------------------------------------

interface RevenueTooltipPayloadEntry {
  value: number;
  dataKey: string;
  color: string;
}

interface RevenueTooltipProps {
  active?: boolean;
  payload?: RevenueTooltipPayloadEntry[];
  label?: string;
}

function RevenueTooltip({ active, payload, label }: RevenueTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        backgroundColor: "#0f1610",
        border: "1px solid rgba(34,197,94,0.2)",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 12,
      }}
    >
      <p style={{ color: "#6b8c72", marginBottom: 4 }}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: "#dceee0" }}>
          {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);
  const storeClasses = useDataStore((s) => s.classes);
  const storeClassTypes = useDataStore((s) => s.classTypes);
  const classDistributionData = buildClassDistributionData(storeClassTypes);
  const stats: DashboardStats = mockDashboardStats;
  const today = new Date().toISOString().split("T")[0];
  const todayClasses = storeClasses
    .filter((c) => c.date === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const hMax = heatmapMax();
  const [chartsOpen, setChartsOpen] = useState(true);

  const firstName = user?.user.name.split(" ")[0] ?? "";

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-vytal-text">
          {getGreeting()}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-vytal-muted">
          {new Date().toLocaleDateString("pt-PT", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickActionCard
          href="/members/import"
          icon={<UserPlus className="h-5 w-5" />}
          label={t("dashboard.addMember")}
        />
        <QuickActionCard
          href="/classes/calendar"
          icon={<CalendarDays className="h-5 w-5" />}
          label={t("dashboard.createClass")}
        />
        <QuickActionCard
          href="/wods/builder"
          icon={<Dumbbell className="h-5 w-5" />}
          label={t("dashboard.newWod")}
        />
        <QuickActionCard
          href="/messages"
          icon={<MessageCircle className="h-5 w-5" />}
          label={t("dashboard.sendMessage")}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        <StatCard
          label={t("dashboard.totalMembers")}
          value={stats.totalMembers}
          icon={<Users className="h-5 w-5" />}
          color="blue"
          trend={{ value: "+3.2%", up: true }}
        />
        <StatCard
          label={t("dashboard.activeMembers")}
          value={stats.activeMembers}
          icon={<UserCheck className="h-5 w-5" />}
          color="green"
          subtitle={`${Math.round((stats.activeMembers / stats.totalMembers) * 100)}% ${t("dashboard.ofTotal")}`}
          trend={{ value: "+2.8%", up: true }}
        />
        <StatCard
          label={t("dashboard.todaysClasses")}
          value={stats.todayClasses}
          icon={<CalendarDays className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          label={t("dashboard.occupancy")}
          value={`${stats.occupancyPercent}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          color={stats.occupancyPercent >= 80 ? "green" : "amber"}
          subtitle={stats.occupancyPercent >= 80 ? t("dashboard.aboveTarget") : t("dashboard.belowTarget")}
          trend={{ value: "+5.1%", up: true }}
        />
        <StatCard
          label={t("dashboard.monthlyRevenue")}
          value={formatCurrency(stats.monthlyRevenue)}
          icon={<DollarSign className="h-5 w-5" />}
          color="green"
          trend={{ value: "+5.8%", up: true }}
        />
        <StatCard
          label={t("dashboard.churnRate")}
          value={`${stats.churnRate}%`}
          icon={<TrendingDown className="h-5 w-5" />}
          color={stats.churnRate > 5 ? "red" : stats.churnRate > 3 ? "amber" : "green"}
          subtitle={stats.churnRate <= 3 ? t("dashboard.healthy") : t("dashboard.needsAttention")}
          trend={{ value: "-0.4%", up: true }}
        />
        <StatCard
          label={t("dashboard.atRiskMembers")}
          value={stats.atRiskMembers}
          icon={<AlertTriangle className="h-5 w-5" />}
          color={stats.atRiskMembers > 10 ? "red" : "amber"}
          subtitle={t("dashboard.noTraining7Days")}
          trend={{ value: "+2", up: false }}
        />
        <StatCard
          label={t("dashboard.prsToday")}
          value={stats.prsToday}
          icon={<Trophy className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          label={t("dashboard.checkInsToday")}
          value={stats.checkInsToday}
          icon={<ScanLine className="h-5 w-5" />}
          color="green"
          trend={{ value: "+12%", up: true }}
        />
      </div>

      {/* Charts Section — Collapsible */}
      <div>
        <button
          onClick={() => setChartsOpen((v) => !v)}
          className="mb-4 flex items-center gap-2 text-sm font-semibold text-vytal-text transition-colors hover:text-vytal-green"
        >
          {chartsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {t("dashboard.chartsSection")}
        </button>
      </div>

      {chartsOpen && (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 1: Member Growth */}
        <ChartCard title={t("dashboard.memberGrowth")}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={memberGrowthData}>
                <CartesianGrid stroke="rgba(34,197,94,0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} domain={[200, 450]} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={2} dot={false} name={t("dashboard.totalMembers")} />
                <Line type="monotone" dataKey="active" stroke="#00d4ff" strokeWidth={2} dot={false} name={t("dashboard.activeMembers")} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 2: Revenue Overview */}
        <ChartCard title={t("dashboard.revenueOverview")}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid stroke="rgba(34,197,94,0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: "#6b8c72", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `\u20AC${Math.round(v / 1000)}K`}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Bar dataKey="revenue" fill="#22c55e" radius={[6, 6, 0, 0]} name={t("dashboard.monthlyRevenue")} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 3: Class Occupancy by Day */}
        <ChartCard title={t("dashboard.occupancyByDay")}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyByDayData}>
                <CartesianGrid stroke="rgba(34,197,94,0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
                <Tooltip {...tooltipStyle} formatter={(value) => [`${value}%`, t("dashboard.occupancy")]} />
                {occupancyByDayData.map((entry, index) => (
                  <Bar key={index} dataKey="occupancy" fill={getOccupancyColor(entry.occupancy)} radius={[6, 6, 0, 0]} />
                ))}
                <Bar dataKey="occupancy" radius={[6, 6, 0, 0]}>
                  {occupancyByDayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getOccupancyColor(entry.occupancy)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 4: Class Type Distribution */}
        <ChartCard title={t("dashboard.classDistribution")}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={classDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {classDistributionData.map((entry, index) => (
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
                    <span style={{ color: "#dceee0", fontSize: 12 }}>{value}</span>
                  )}
                />
                <Tooltip {...tooltipStyle} formatter={(value) => [`${value}%`, ""]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      )}

      {/* Chart 5: Attendance Heatmap */}
      {chartsOpen && (
      <ChartCard title={t("dashboard.attendanceHeatmap")} className="col-span-full">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr>
                <th className="w-12 px-1 py-1 text-left text-[10px] font-medium uppercase tracking-wider text-vytal-muted" />
                {HEATMAP_HOURS.map((h) => (
                  <th key={h} className="px-0.5 py-1 text-center text-[10px] font-medium text-vytal-muted">
                    {h.slice(0, 2)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HEATMAP_DAYS.map((day, di) => (
                <tr key={day}>
                  <td className="px-1 py-0.5 text-xs font-medium text-vytal-muted">{day}</td>
                  {HEATMAP_DATA[di].map((value, ti) => (
                    <td key={ti} className="px-0.5 py-0.5">
                      <div
                        className="flex h-8 items-center justify-center rounded"
                        style={{ backgroundColor: heatmapCellColor(value, hMax) }}
                        title={`${day} ${HEATMAP_HOURS[ti]}: ${value} check-ins`}
                      >
                        <span
                          className="font-mono text-[10px] font-semibold"
                          style={{ color: value === 0 ? "rgba(107,140,114,0.3)" : value / hMax > 0.4 ? "#080c0a" : "#6b8c72" }}
                        >
                          {value > 0 ? value : ""}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Legend */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-[10px] font-medium uppercase tracking-wider text-vytal-muted">{t("dashboard.less")}</span>
          <div className="flex gap-1">
            {[0, 0.1, 0.2, 0.4, 0.6, 0.8].map((opacity) => (
              <div
                key={opacity}
                className="h-3 w-6 rounded"
                style={{
                  backgroundColor: opacity === 0 ? "rgba(22,32,24,0.9)" : `rgba(34,197,94,${opacity})`,
                }}
              />
            ))}
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-vytal-muted">{t("dashboard.more")}</span>
        </div>
      </ChartCard>
      )}

      {/* Today's Schedule */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-vytal-text">
            {t("dashboard.todaysSchedule")}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-xs text-vytal-muted">
              {new Date().toLocaleDateString("pt-PT", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <Link
              href="/classes"
              className="flex items-center gap-1 text-xs font-medium text-vytal-green transition-colors hover:text-vytal-green/80"
            >
              {t("dashboard.viewAll")}
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
        <div className="space-y-2">
          {todayClasses.length > 0 ? (
            todayClasses.map((cls) => (
              <ClassScheduleRow key={cls.id} cls={cls} />
            ))
          ) : (
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-8 text-center">
              <p className="text-sm text-vytal-muted">
                {t("dashboard.noClassesToday")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
