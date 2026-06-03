import {
  mockDashboardStats,
  mockClasses,
} from "@vytal-fit/shared";
import type { Class, DashboardStats } from "@vytal-fit/shared";
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
} from "lucide-react";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(value);
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: "green" | "red" | "amber" | "blue" | "purple";
  subtitle?: string;
}

function StatCard({ label, value, icon, color, subtitle }: StatCardProps) {
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
    <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
            {label}
          </span>
          <span className="text-2xl font-bold text-vytal-text">{value}</span>
          {subtitle && (
            <span className={`text-xs ${colorMap[color]}`}>{subtitle}</span>
          )}
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

function getEnrollmentColor(enrolled: number, capacity: number): string {
  const pct = (enrolled / capacity) * 100;
  if (pct >= 100) return "bg-vytal-red";
  if (pct >= 80) return "bg-vytal-amber";
  return "bg-vytal-green";
}

function ClassScheduleRow({ cls }: { cls: Class }) {
  const pct = Math.min((cls.enrolledCount / cls.maxCapacity) * 100, 100);
  const barColor = getEnrollmentColor(cls.enrolledCount, cls.maxCapacity);
  const isFull = cls.enrolledCount >= cls.maxCapacity;

  return (
    <div className="flex items-center gap-4 rounded-lg border border-vytal-border bg-vytal-card px-4 py-3 transition-colors hover:border-[rgba(61,255,110,0.22)]">
      {/* Time */}
      <div className="w-24 shrink-0">
        <span className="font-mono text-sm font-semibold text-vytal-text">
          {cls.startTime}
        </span>
        <span className="ml-1 font-mono text-xs text-vytal-muted">
          - {cls.endTime}
        </span>
      </div>

      {/* Class Type */}
      <div className="flex items-center gap-2">
        <div
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: cls.classType.color }}
        />
        <span className="text-sm font-medium text-vytal-text">
          {cls.classType.name}
        </span>
      </div>

      {/* Location */}
      <span className="hidden text-xs text-vytal-muted lg:block">
        {cls.location.name}
      </span>

      {/* Coach */}
      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-vytal-muted">
          {cls.coaches.map((c) => c.name.split(" ")[0]).join(", ") || "Open Box"}
        </span>
      </div>

      {/* Enrollment */}
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

      {/* Waitlist */}
      {cls.waitlistCount > 0 && (
        <span className="rounded-full bg-vytal-amber/10 px-2 py-0.5 text-[10px] font-medium text-vytal-amber">
          +{cls.waitlistCount} waitlist
        </span>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const stats: DashboardStats = mockDashboardStats;
  const today = new Date().toISOString().split("T")[0];
  const todayClasses = mockClasses
    .filter((c) => c.date === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-vytal-text">Dashboard</h1>
        <p className="mt-1 text-sm text-vytal-muted">
          Overview of your box performance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        <StatCard
          label="Total Members"
          value={stats.totalMembers}
          icon={<Users className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          label="Active Members"
          value={stats.activeMembers}
          icon={<UserCheck className="h-5 w-5" />}
          color="green"
          subtitle={`${Math.round((stats.activeMembers / stats.totalMembers) * 100)}% of total`}
        />
        <StatCard
          label="Today's Classes"
          value={stats.todayClasses}
          icon={<CalendarDays className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          label="Occupancy"
          value={`${stats.occupancyPercent}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          color={stats.occupancyPercent >= 80 ? "green" : "amber"}
          subtitle={stats.occupancyPercent >= 80 ? "Above target" : "Below 80% target"}
        />
        <StatCard
          label="Monthly Revenue"
          value={formatCurrency(stats.monthlyRevenue)}
          icon={<DollarSign className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          label="Churn Rate"
          value={`${stats.churnRate}%`}
          icon={<TrendingDown className="h-5 w-5" />}
          color={stats.churnRate > 5 ? "red" : stats.churnRate > 3 ? "amber" : "green"}
          subtitle={stats.churnRate <= 3 ? "Healthy" : "Needs attention"}
        />
        <StatCard
          label="At-Risk Members"
          value={stats.atRiskMembers}
          icon={<AlertTriangle className="h-5 w-5" />}
          color={stats.atRiskMembers > 10 ? "red" : "amber"}
          subtitle="Haven't trained in 7+ days"
        />
        <StatCard
          label="PRs Today"
          value={stats.prsToday}
          icon={<Trophy className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          label="Check-ins Today"
          value={stats.checkInsToday}
          icon={<ScanLine className="h-5 w-5" />}
          color="green"
        />
      </div>

      {/* Today's Schedule */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-vytal-text">
            Today&apos;s Schedule
          </h2>
          <span className="text-xs text-vytal-muted">
            {new Date().toLocaleDateString("pt-PT", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        <div className="space-y-2">
          {todayClasses.length > 0 ? (
            todayClasses.map((cls) => (
              <ClassScheduleRow key={cls.id} cls={cls} />
            ))
          ) : (
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-8 text-center">
              <p className="text-sm text-vytal-muted">
                No classes scheduled for today
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
