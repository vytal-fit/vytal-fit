"use client";

import { mockClasses, mockMembers } from "@vytal-fit/shared";
import {
  MapPin,
  User,
  Clock,
  Users,
  ArrowLeft,
  CalendarDays,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";

function getEnrollmentStatus(enrolled: number, capacity: number) {
  const pct = (enrolled / capacity) * 100;
  if (pct >= 100)
    return {
      color: "bg-vytal-red",
      textColor: "text-vytal-red",
      label: "Full",
    } as const;
  if (pct >= 80)
    return {
      color: "bg-vytal-amber",
      textColor: "text-vytal-amber",
      label: "Filling up",
    } as const;
  return {
    color: "bg-vytal-green",
    textColor: "text-vytal-green",
    label: "Available",
  } as const;
}

export default function ClassDetailPage() {
  const { t } = useI18n();
  const params = useParams();
  const id = params.id as string;
  const cls = mockClasses.find((c) => c.id === id);

  if (!cls) {
    notFound();
  }

  const pct = Math.min((cls.enrolledCount / cls.maxCapacity) * 100, 100);
  const status = getEnrollmentStatus(cls.enrolledCount, cls.maxCapacity);
  const isFull = cls.enrolledCount >= cls.maxCapacity;

  const durationMin = (() => {
    const [sh, sm] = cls.startTime.split(":").map(Number);
    const [eh, em] = cls.endTime.split(":").map(Number);
    return eh * 60 + em - (sh * 60 + sm);
  })();

  // Simulate enrolled members by taking a slice of mock members
  const enrolledMembers = mockMembers.slice(
    0,
    Math.min(cls.enrolledCount, mockMembers.length)
  );

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/classes"
        className="inline-flex items-center gap-1.5 text-sm text-vytal-muted transition-colors hover:text-vytal-text"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Classes
      </Link>

      {/* Class Header */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: cls.classType.color }}
              />
              <h1 className="text-2xl font-bold text-vytal-text">
                {cls.classType.name}
              </h1>
              <span className="rounded bg-vytal-bg3 px-2 py-0.5 font-mono text-xs font-medium text-vytal-muted">
                {cls.classType.abbreviation}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-sm text-vytal-muted">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                <span>
                  {new Date(cls.date).toLocaleDateString("pt-PT", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span className="font-mono">
                  {cls.startTime} - {cls.endTime}
                </span>
                <span className="text-xs">({durationMin} min)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {cls.location.name}
              </div>
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {cls.coaches.length > 0
                  ? cls.coaches.map((c) => c.name).join(", ")
                  : "Open Box (no coach)"}
              </div>
            </div>
          </div>

          <span
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider",
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
      </div>

      {/* Capacity */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-vytal-muted" />
            <span className="text-sm font-medium text-vytal-text">
              Capacity
            </span>
          </div>
          <span
            className={cn(
              "font-mono text-lg font-bold",
              isFull ? "text-vytal-red" : status.textColor
            )}
          >
            {cls.enrolledCount}/{cls.maxCapacity}
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-vytal-bg3">
          <div
            className={cn("h-full rounded-full transition-all", status.color)}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-vytal-muted">
          <span>
            {cls.maxCapacity - cls.enrolledCount > 0
              ? `${cls.maxCapacity - cls.enrolledCount} spots available`
              : "No spots available"}
          </span>
          {cls.waitlistCount > 0 && (
            <span className="rounded-full bg-vytal-amber/10 px-2 py-0.5 text-[10px] font-semibold text-vytal-amber">
              {cls.waitlistCount}{" "}
              {cls.waitlistCount === 1 ? "person" : "people"} on waitlist
            </span>
          )}
        </div>
      </div>

      {/* Enrolled Members */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-vytal-text">
          Enrolled Members
        </h2>
        <div className="overflow-hidden rounded-xl border border-vytal-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-vytal-border bg-vytal-bg2">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  Member
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted md:table-cell">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vytal-border">
              {enrolledMembers.map((member, i) => {
                const initials = member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2);

                return (
                  <tr
                    key={member.id}
                    className="bg-vytal-card transition-colors hover:bg-vytal-bg3"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-vytal-muted">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/members/${member.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-vytal-green/10 text-xs font-semibold text-vytal-green">
                          {initials}
                        </div>
                        <span className="text-sm font-medium text-vytal-text group-hover:text-vytal-green transition-colors">
                          {member.name}
                        </span>
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-vytal-muted md:table-cell">
                      {member.email}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-vytal-green/10 px-2.5 py-0.5 text-xs font-medium text-vytal-green">
                        <CheckCircle className="h-3 w-3" />
                        Confirmed
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {enrolledMembers.length === 0 && (
            <div className="bg-vytal-card p-8 text-center">
              <p className="text-sm text-vytal-muted">
                No members enrolled yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
