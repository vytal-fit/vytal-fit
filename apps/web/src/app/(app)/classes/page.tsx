import { mockClasses } from "@vytal-fit/shared";
import type { Class } from "@vytal-fit/shared";
import { MapPin, User, Clock, Users, CalendarOff, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

function getEnrollmentStatus(enrolled: number, capacity: number) {
  const pct = (enrolled / capacity) * 100;
  if (pct >= 100) return { color: "bg-vytal-red", textColor: "text-vytal-red", label: "Full" } as const;
  if (pct >= 80) return { color: "bg-vytal-amber", textColor: "text-vytal-amber", label: "Filling up" } as const;
  return { color: "bg-vytal-green", textColor: "text-vytal-green", label: "Available" } as const;
}

function ClassCard({ cls }: { cls: Class }) {
  const pct = Math.min((cls.enrolledCount / cls.maxCapacity) * 100, 100);
  const status = getEnrollmentStatus(cls.enrolledCount, cls.maxCapacity);
  const isFull = cls.enrolledCount >= cls.maxCapacity;

  return (
    <Link href={`/classes/${cls.id}`} className="group block rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]">
      {/* Top Row: Time + Class Type */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center rounded-lg bg-vytal-bg3 px-3 py-2">
            <span className="font-mono text-lg font-bold leading-tight text-vytal-text">
              {cls.startTime}
            </span>
            <span className="font-mono text-[10px] text-vytal-muted">
              {cls.endTime}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: cls.classType.color }}
              />
              <h3 className="text-base font-semibold text-vytal-text">
                {cls.classType.name}
              </h3>
            </div>
            <span className="mt-0.5 inline-block rounded bg-vytal-bg3 px-1.5 py-0.5 font-mono text-[10px] font-medium text-vytal-muted">
              {cls.classType.abbreviation}
            </span>
          </div>
        </div>

        {/* Status indicator */}
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
            isFull
              ? "bg-vytal-red/10 text-vytal-red"
              : pct >= 80
                ? "bg-vytal-amber/10 text-vytal-amber"
                : "bg-vytal-green/10 text-vytal-green"
          )}
        >
          {status.label}
        </span>
      </div>

      {/* Details */}
      <div className="mb-4 flex flex-wrap gap-4 text-xs text-vytal-muted">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          <span>{cls.location.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5" />
          <span>
            {cls.coaches.length > 0
              ? cls.coaches.map((c) => c.name).join(", ")
              : "Open Box (no coach)"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span>
            {(() => {
              const [sh, sm] = cls.startTime.split(":").map(Number);
              const [eh, em] = cls.endTime.split(":").map(Number);
              return (eh * 60 + em) - (sh * 60 + sm);
            })()}
            min
          </span>
        </div>
      </div>

      {/* Enrollment Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-vytal-muted">
            <Users className="h-3.5 w-3.5" />
            <span>Enrollment</span>
          </div>
          <span
            className={cn(
              "font-mono text-sm font-semibold",
              isFull ? "text-vytal-red" : status.textColor
            )}
          >
            {cls.enrolledCount}/{cls.maxCapacity}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-vytal-bg3">
          <div
            className={cn("h-full rounded-full transition-all", status.color)}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Waitlist */}
        {cls.waitlistCount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-vytal-muted">Waitlist</span>
            <span className="rounded-full bg-vytal-amber/10 px-2 py-0.5 text-[10px] font-semibold text-vytal-amber">
              {cls.waitlistCount} {cls.waitlistCount === 1 ? "person" : "people"} waiting
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function ClassesPage() {
  const today = new Date().toISOString().split("T")[0];
  const todayClasses = mockClasses
    .filter((c) => c.date === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const totalEnrolled = todayClasses.reduce((s, c) => s + c.enrolledCount, 0);
  const totalCapacity = todayClasses.reduce((s, c) => s + c.maxCapacity, 0);
  const totalWaitlist = todayClasses.reduce((s, c) => s + c.waitlistCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">Classes</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            Today&apos;s schedule &mdash;{" "}
            {new Date().toLocaleDateString("pt-PT", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <div className="hidden items-center gap-4 sm:flex">
          <Link
            href="/classes/calendar"
            className="flex items-center gap-2 rounded-lg border border-vytal-border px-4 py-2 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
          >
            <CalendarDays className="h-4 w-4" />
            Calendar View
          </Link>
          <div className="text-right">
            <p className="text-xs text-vytal-muted">Total Enrolled</p>
            <p className="font-mono text-sm font-semibold text-vytal-text">
              {totalEnrolled}/{totalCapacity}
            </p>
          </div>
          {totalWaitlist > 0 && (
            <div className="text-right">
              <p className="text-xs text-vytal-muted">Waitlisted</p>
              <p className="font-mono text-sm font-semibold text-vytal-amber">
                {totalWaitlist}
              </p>
            </div>
          )}
          <div className="text-right">
            <p className="text-xs text-vytal-muted">Classes</p>
            <p className="font-mono text-sm font-semibold text-vytal-text">
              {todayClasses.length}
            </p>
          </div>
        </div>
      </div>

      {/* Class Cards Grid */}
      {todayClasses.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {todayClasses.map((cls) => (
            <ClassCard key={cls.id} cls={cls} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-12 text-center">
          <CalendarOff className="mx-auto h-8 w-8 text-vytal-muted" />
          <p className="mt-3 text-sm text-vytal-muted">
            No classes scheduled for today
          </p>
        </div>
      )}
    </div>
  );
}
