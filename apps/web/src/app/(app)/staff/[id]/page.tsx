import { mockCoaches, mockClasses } from "@vytal-fit/shared";
import {
  ArrowLeft,
  Mail,
  Phone,
  Shield,
  Calendar,
  Users,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";

const roleConfig: Record<string, { label: string; className: string }> = {
  head_coach: { label: "Head Coach", className: "bg-vytal-green/10 text-vytal-green" },
  coach: { label: "Coach", className: "bg-vytal-blue/10 text-vytal-blue" },
  assistant: { label: "Assistant", className: "bg-vytal-amber/10 text-vytal-amber" },
};

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const coachSchedules: Record<string, string[]> = {
  "coach-1": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  "coach-2": ["Monday", "Wednesday", "Thursday", "Saturday"],
  "coach-3": ["Tuesday", "Thursday", "Friday", "Saturday"],
  "coach-4": ["Monday", "Wednesday", "Friday"],
};

const coachSpecialties: Record<string, string> = {
  "coach-1": "Olympic Weightlifting, Programming",
  "coach-2": "Gymnastics, Mobility",
  "coach-3": "Strength, Hyrox",
  "coach-4": "CrossFit Kids, Fundamentals",
};

const coachBios: Record<string, string> = {
  "coach-1": "CrossFit L3 trainer with 10+ years of experience. Former competitive athlete. Specializes in Olympic weightlifting and custom programming for athletes of all levels.",
  "coach-2": "Former gymnast turned CrossFit coach. Expert in bodyweight movements, mobility work, and helping athletes achieve their first muscle-ups and handstand walks.",
  "coach-3": "Strength and conditioning specialist. Hyrox certified. Passionate about helping members build solid foundations and reach new PRs.",
  "coach-4": "Certified youth fitness coach. Specializes in making fitness fun and accessible for teens and beginners. First aid and CPR certified.",
};

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const coach = mockCoaches.find((c) => c.id === id);

  if (!coach) {
    notFound();
  }

  const role = roleConfig[coach.role] ?? roleConfig.coach;
  const schedule = coachSchedules[coach.id] ?? [];
  const specialty = coachSpecialties[coach.id] ?? "General CrossFit";
  const bio = coachBios[coach.id] ?? "";
  const initials = coach.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  const assignedClasses = mockClasses.filter((cls) =>
    cls.coachIds.includes(coach.id)
  );

  const classesThisWeek = assignedClasses.length;
  const totalClasses = classesThisWeek * 48;
  const avgAttendance = Math.round(75 + Math.random() * 20);

  return (
    <div className="space-y-6">
      <Link
        href="/staff"
        className="inline-flex items-center gap-1.5 text-sm text-vytal-muted transition-colors hover:text-vytal-text"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Staff
      </Link>

      {/* Profile Header */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
        <div className="flex items-start gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-vytal-green/10 text-xl font-bold text-vytal-green">
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-vytal-text">{coach.name}</h1>
              <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", role.className)}>
                {role.label}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-vytal-muted">
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {coach.email}
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                {specialty}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-4 transition-colors hover:border-[rgba(61,255,110,0.22)]">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-green/10">
              <Calendar className="h-4 w-4 text-vytal-green" />
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">This Week</span>
              <p className="text-lg font-bold text-vytal-text">{classesThisWeek} classes</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-4 transition-colors hover:border-[rgba(61,255,110,0.22)]">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-blue/10">
              <TrendingUp className="h-4 w-4 text-vytal-blue" />
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">Total Classes</span>
              <p className="text-lg font-bold text-vytal-text">{totalClasses}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-4 transition-colors hover:border-[rgba(61,255,110,0.22)]">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-amber/10">
              <Users className="h-4 w-4 text-vytal-amber" />
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">Avg Attendance</span>
              <p className="text-lg font-bold text-vytal-text">{avgAttendance}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Schedule */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-vytal-text">Weekly Schedule</h2>
          <div className="space-y-2">
            {weekDays.map((day) => {
              const isActive = schedule.includes(day);
              return (
                <div
                  key={day}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-4 py-2.5",
                    isActive ? "bg-vytal-green/10" : "bg-vytal-bg2"
                  )}
                >
                  <span className={cn("text-sm font-medium", isActive ? "text-vytal-green" : "text-vytal-muted")}>
                    {day}
                  </span>
                  <span className={cn("text-xs", isActive ? "text-vytal-green" : "text-vytal-muted")}>
                    {isActive ? "Active" : "Off"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assigned Classes */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-vytal-text">Assigned Classes</h2>
          {assignedClasses.length === 0 ? (
            <p className="text-sm text-vytal-muted">No classes assigned this week.</p>
          ) : (
            <div className="space-y-2">
              {assignedClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center justify-between rounded-lg border border-vytal-border px-4 py-3 transition-colors hover:border-[rgba(61,255,110,0.22)]"
                >
                  <div>
                    <p className="text-sm font-medium text-vytal-text">{cls.classType.name}</p>
                    <p className="text-xs text-vytal-muted">{cls.date} {cls.startTime}-{cls.endTime}</p>
                  </div>
                  <span className="text-xs text-vytal-muted">{cls.enrolledCount}/{cls.maxCapacity}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-vytal-text">Bio</h2>
        <p className="text-sm leading-relaxed text-vytal-muted">{bio}</p>
      </div>
    </div>
  );
}
