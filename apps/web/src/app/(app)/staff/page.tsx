"use client";

import { mockCoaches, mockClasses } from "@vytal-fit/shared";
import type { Coach } from "@vytal-fit/shared";
import { Users, Plus, Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { EmptyState } from "@/components/empty-state";

const roleBadgeConfig: Record<Coach["role"], { label: string; className: string }> = {
  head_coach: {
    label: "Head Coach",
    className: "bg-vytal-green/10 text-vytal-green",
  },
  coach: {
    label: "Coach",
    className: "bg-vytal-blue/10 text-vytal-blue",
  },
  assistant: {
    label: "Assistant",
    className: "bg-vytal-amber/10 text-vytal-amber",
  },
};

function RoleBadge({ role }: { role: Coach["role"] }) {
  const c = roleBadgeConfig[role];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${c.className}`}
    >
      {c.label}
    </span>
  );
}

// Mock specialties/certifications
const coachSpecialties: Record<string, string[]> = {
  "coach-1": ["CrossFit L3", "Weightlifting", "Nutrition"],
  "coach-2": ["CrossFit L2", "Gymnastics", "Mobility"],
  "coach-3": ["CrossFit L2", "Endurance", "Kids"],
  "coach-4": ["CrossFit L1", "First Aid"],
};

// Mock avg attendance for each coach
const coachAvgAttendance: Record<string, number> = {
  "coach-1": 87,
  "coach-2": 82,
  "coach-3": 78,
  "coach-4": 91,
};

function getWeeklyClassCount(coachId: string): number {
  return mockClasses.filter((c) =>
    c.coachIds.includes(coachId)
  ).length;
}

function CoachCard({ coach }: { coach: Coach }) {
  const initials = coach.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const weeklyClasses = getWeeklyClassCount(coach.id);
  const avgAttendance = coachAvgAttendance[coach.id] ?? 0;
  const specialties = coachSpecialties[coach.id] ?? [];
  const roleConfig = roleBadgeConfig[coach.role];

  return (
    <Link
      href={`/staff/${coach.id}`}
      className="group block rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]"
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold",
            roleConfig.className
          )}
        >
          {initials}
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-semibold text-vytal-text transition-colors group-hover:text-vytal-green">
            {coach.name}
          </span>
          <span className="text-xs text-vytal-muted">{coach.email}</span>
          <div className="mt-1">
            <RoleBadge role={coach.role} />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mt-4 flex items-center gap-4 border-t border-vytal-border pt-3">
        <div className="flex items-center gap-1.5 text-xs text-vytal-muted">
          <Calendar className="h-3 w-3" />
          <span>
            <span className="font-semibold text-vytal-text">{weeklyClasses}</span>{" "}
            classes/week
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-vytal-muted">
          <TrendingUp className="h-3 w-3" />
          <span>
            <span
              className={cn(
                "font-semibold",
                avgAttendance >= 85
                  ? "text-vytal-green"
                  : avgAttendance >= 70
                    ? "text-vytal-amber"
                    : "text-vytal-red"
              )}
            >
              {avgAttendance}%
            </span>{" "}
            avg attendance
          </span>
        </div>
      </div>

      {/* Specialties */}
      {specialties.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {specialties.map((spec) => (
            <span
              key={spec}
              className="rounded-full bg-vytal-bg3 px-2 py-0.5 text-[10px] font-medium text-vytal-muted"
            >
              {spec}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

export default function StaffPage() {
  const { t } = useI18n();
  const coaches = mockCoaches;

  const headCoaches = coaches.filter((c) => c.role === "head_coach").length;
  const coachCount = coaches.filter((c) => c.role === "coach").length;
  const assistants = coaches.filter((c) => c.role === "assistant").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("staff.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("staff.subtitle")}
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90">
          <Plus className="h-4 w-4" />
          {t("staff.addCoach")}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex items-center gap-3 rounded-lg border border-vytal-border bg-vytal-card px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vytal-blue/10">
            <Users className="h-4 w-4 text-vytal-blue" />
          </div>
          <div>
            <p className="text-lg font-bold text-vytal-text">{coaches.length}</p>
            <p className="text-xs text-vytal-muted">Total Staff</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-vytal-border bg-vytal-card px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vytal-green/10">
            <Users className="h-4 w-4 text-vytal-green" />
          </div>
          <div>
            <p className="text-lg font-bold text-vytal-text">{headCoaches}</p>
            <p className="text-xs text-vytal-muted">Head Coaches</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-vytal-border bg-vytal-card px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vytal-blue/10">
            <Users className="h-4 w-4 text-vytal-blue" />
          </div>
          <div>
            <p className="text-lg font-bold text-vytal-text">{coachCount}</p>
            <p className="text-xs text-vytal-muted">Coaches</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-vytal-border bg-vytal-card px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vytal-amber/10">
            <Users className="h-4 w-4 text-vytal-amber" />
          </div>
          <div>
            <p className="text-lg font-bold text-vytal-text">{assistants}</p>
            <p className="text-xs text-vytal-muted">Assistants</p>
          </div>
        </div>
      </div>

      {/* Coach Grid */}
      {coaches.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {coaches.map((coach) => (
            <CoachCard key={coach.id} coach={coach} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title={t("staff.noStaff")}
          description={t("staff.noStaffDesc")}
        />
      )}
    </div>
  );
}
