"use client";

import { useState } from "react";
import { useDataStore } from "@/stores/data-store";
import {
  ArrowLeft,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  User,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";

type AttendanceStatus = "checked_in" | "enrolled" | "no_show" | "waitlisted";

interface AttendeeRecord {
  memberId: string;
  name: string;
  initials: string;
  memberNumber: number;
  plan: string;
  status: AttendanceStatus;
}

export default function ClassAttendancePage() {
  const { t } = useI18n();
  const params = useParams();
  const id = params.id as string;
  const storeClasses = useDataStore((s) => s.classes);
  const storeMembers = useDataStore((s) => s.members);
  const cls = storeClasses.find((c) => c.id === id);

  if (!cls) {
    notFound();
  }

  // Build mock attendee list from members
  const totalSlots = Math.min(cls.enrolledCount + cls.waitlistCount, storeMembers.length);
  const initialAttendees: AttendeeRecord[] = storeMembers
    .slice(0, totalSlots)
    .map((member, i) => {
      let status: AttendanceStatus;
      if (i < 5) status = "checked_in";
      else if (i < 8) status = "enrolled";
      else if (i < 10) status = "no_show";
      else status = "waitlisted";

      const initials = member.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2);

      const planNames = ["Livre", "8x/mes", "12x/mes", "Trial"];
      const plan = planNames[i % planNames.length];

      return {
        memberId: member.id,
        name: member.name,
        initials,
        memberNumber: member.memberNumber,
        plan,
        status,
      };
    });

  const [attendees, setAttendees] = useState<AttendeeRecord[]>(initialAttendees);

  const checkedIn = attendees.filter((a) => a.status === "checked_in").length;
  const enrolled = attendees.filter(
    (a) => a.status === "checked_in" || a.status === "enrolled"
  ).length;
  const noShows = attendees.filter((a) => a.status === "no_show").length;
  const waitlisted = attendees.filter((a) => a.status === "waitlisted").length;

  const durationMin = (() => {
    const [sh, sm] = cls.startTime.split(":").map(Number);
    const [eh, em] = cls.endTime.split(":").map(Number);
    return eh * 60 + em - (sh * 60 + sm);
  })();

  const capacityPct = Math.min((enrolled / cls.maxCapacity) * 100, 100);

  function handleCheckIn(memberId: string) {
    setAttendees((prev) =>
      prev.map((a) =>
        a.memberId === memberId ? { ...a, status: "checked_in" as const } : a
      )
    );
  }

  function handleMarkNoShow(memberId: string) {
    setAttendees((prev) =>
      prev.map((a) =>
        a.memberId === memberId ? { ...a, status: "no_show" as const } : a
      )
    );
  }

  const statusConfig: Record<
    AttendanceStatus,
    { label: string; icon: React.ReactNode; className: string }
  > = {
    checked_in: {
      label: t("classAttendance.checkedIn"),
      icon: <CheckCircle className="h-3.5 w-3.5" />,
      className: "bg-vytal-green/10 text-vytal-green",
    },
    enrolled: {
      label: t("classAttendance.enrolled"),
      icon: <Clock className="h-3.5 w-3.5" />,
      className: "bg-vytal-amber/10 text-vytal-amber",
    },
    no_show: {
      label: t("classAttendance.noShow"),
      icon: <XCircle className="h-3.5 w-3.5" />,
      className: "bg-vytal-red/10 text-vytal-red",
    },
    waitlisted: {
      label: t("classAttendance.waitlistedStatus"),
      icon: <Clock className="h-3.5 w-3.5" />,
      className: "bg-vytal-bg3 text-vytal-muted",
    },
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t("classes.title"), href: "/classes" },
          { label: cls.classType.name, href: `/classes/${cls.id}` },
          { label: t("classAttendance.title") },
        ]}
      />

      <Link
        href={`/classes/${cls.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-vytal-muted transition-colors hover:text-vytal-text"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("classAttendance.backToClass")}
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
                {cls.classType.name} &mdash; {t("classAttendance.title")}
              </h1>
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
                  : t("classAttendance.openBox")}
              </div>
            </div>
          </div>
        </div>

        {/* Capacity bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-vytal-muted mb-1">
            <span>{t("classAttendance.capacity")}</span>
            <span className="font-mono font-semibold text-vytal-text">
              {enrolled}/{cls.maxCapacity}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-vytal-bg3">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                capacityPct >= 100
                  ? "bg-vytal-red"
                  : capacityPct >= 80
                    ? "bg-vytal-amber"
                    : "bg-vytal-green"
              )}
              style={{ width: `${capacityPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-4 stat-card-hover">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-blue/10">
              <Users className="h-4 w-4 text-vytal-blue" />
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("classAttendance.enrolledCount")}
              </span>
              <p className="text-lg font-bold text-vytal-text">
                {enrolled}/{cls.maxCapacity}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-4 stat-card-hover">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-green/10">
              <CheckCircle className="h-4 w-4 text-vytal-green" />
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("classAttendance.checkedInCount")}
              </span>
              <p className="text-lg font-bold text-vytal-text">{checkedIn}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-4 stat-card-hover">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-red/10">
              <XCircle className="h-4 w-4 text-vytal-red" />
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("classAttendance.noShowCount")}
              </span>
              <p className="text-lg font-bold text-vytal-text">{noShows}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-4 stat-card-hover">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-amber/10">
              <Clock className="h-4 w-4 text-vytal-amber" />
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("classAttendance.waitlistCount")}
              </span>
              <p className="text-lg font-bold text-vytal-text">{waitlisted}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled List Table */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-vytal-text">
          {t("classAttendance.enrolledList")}
        </h2>
        <div className="overflow-hidden rounded-xl border border-vytal-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-vytal-border bg-vytal-bg2">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("classAttendance.member")}
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted md:table-cell">
                  {t("classAttendance.memberNo")}
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted lg:table-cell">
                  {t("classAttendance.plan")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("classAttendance.status")}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("classAttendance.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vytal-border">
              {attendees.map((attendee) => {
                const cfg = statusConfig[attendee.status];
                return (
                  <tr
                    key={attendee.memberId}
                    className="bg-vytal-card transition-colors hover:bg-vytal-bg3"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/members/${attendee.memberId}`}
                        className="flex items-center gap-3 group"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-vytal-green/10 text-xs font-semibold text-vytal-green">
                          {attendee.initials}
                        </div>
                        <span className="text-sm font-medium text-vytal-text group-hover:text-vytal-green transition-colors">
                          {attendee.name}
                        </span>
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 font-mono text-xs text-vytal-muted md:table-cell">
                      #{attendee.memberNumber}
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-vytal-muted lg:table-cell">
                      {attendee.plan}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                          cfg.className
                        )}
                      >
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {attendee.status === "enrolled" && (
                          <>
                            <button
                              onClick={() => handleCheckIn(attendee.memberId)}
                              className="rounded-lg bg-vytal-green/10 px-3 py-1.5 text-xs font-medium text-vytal-green transition-colors hover:bg-vytal-green/20"
                            >
                              {t("classAttendance.checkInBtn")}
                            </button>
                            <button
                              onClick={() => handleMarkNoShow(attendee.memberId)}
                              className="rounded-lg bg-vytal-red/10 px-3 py-1.5 text-xs font-medium text-vytal-red transition-colors hover:bg-vytal-red/20"
                            >
                              {t("classAttendance.markNoShowBtn")}
                            </button>
                          </>
                        )}
                        {attendee.status === "checked_in" && (
                          <span className="text-xs font-medium text-vytal-green">
                            {t("classAttendance.checkedInDone")}
                          </span>
                        )}
                        {attendee.status === "no_show" && (
                          <button
                            onClick={() => handleCheckIn(attendee.memberId)}
                            className="rounded-lg bg-vytal-green/10 px-3 py-1.5 text-xs font-medium text-vytal-green transition-colors hover:bg-vytal-green/20"
                          >
                            {t("classAttendance.checkInBtn")}
                          </button>
                        )}
                        {attendee.status === "waitlisted" && (
                          <span className="text-xs text-vytal-muted">
                            {t("classAttendance.waitingLabel")}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {attendees.length === 0 && (
            <div className="bg-vytal-card p-8 text-center">
              <p className="text-sm text-vytal-muted">
                {t("classAttendance.noAttendees")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
