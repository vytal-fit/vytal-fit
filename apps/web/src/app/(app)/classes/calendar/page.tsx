"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { mockClasses, mockClassTypes, mockCoaches, mockLocations } from "@vytal-fit/shared";
import type { Class } from "@vytal-fit/shared";
import { cn } from "@/lib/utils";

const TIME_SLOTS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00",
];

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
}

function generateWeekClasses(monday: Date): Class[] {
  const templates = [
    { time: "07:00", end: "08:00", ctIdx: 0, coachIdx: 0, cap: 20, enrolled: 18, waitlist: 2 },
    { time: "09:00", end: "10:00", ctIdx: 0, coachIdx: 1, cap: 20, enrolled: 14, waitlist: 0 },
    { time: "10:00", end: "11:30", ctIdx: 1, coachIdx: -1, cap: 15, enrolled: 6, waitlist: 0 },
    { time: "12:00", end: "13:00", ctIdx: 2, coachIdx: 2, cap: 12, enrolled: 10, waitlist: 0 },
    { time: "17:30", end: "18:30", ctIdx: 0, coachIdx: 0, cap: 20, enrolled: 20, waitlist: 4 },
    { time: "18:30", end: "19:30", ctIdx: 0, coachIdx: 1, cap: 20, enrolled: 16, waitlist: 0 },
    { time: "19:30", end: "20:30", ctIdx: 3, coachIdx: 2, cap: 30, enrolled: 22, waitlist: 0 },
  ];

  const satTemplates = [
    { time: "09:00", end: "10:00", ctIdx: 0, coachIdx: 0, cap: 20, enrolled: 12, waitlist: 0 },
    { time: "10:00", end: "11:00", ctIdx: 4, coachIdx: 1, cap: 15, enrolled: 8, waitlist: 0 },
  ];

  const sunTemplates = [
    { time: "10:00", end: "11:30", ctIdx: 1, coachIdx: -1, cap: 15, enrolled: 4, waitlist: 0 },
  ];

  const classes: Class[] = [];
  let idCounter = 100;

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(monday);
    date.setDate(date.getDate() + dayOffset);
    const dateStr = date.toISOString().split("T")[0];

    let dayTemplates = templates;
    if (dayOffset === 5) dayTemplates = satTemplates;
    if (dayOffset === 6) dayTemplates = sunTemplates;

    for (const t of dayTemplates) {
      const ct = mockClassTypes[t.ctIdx] ?? mockClassTypes[0];
      const coach = t.coachIdx >= 0 ? mockCoaches[t.coachIdx] : undefined;
      classes.push({
        id: `cal-${idCounter++}`,
        organizationId: "org-1",
        classTypeId: ct.id,
        classType: ct,
        locationId: mockLocations[0].id,
        location: mockLocations[0],
        coachIds: coach ? [coach.id] : [],
        coaches: coach ? [coach] : [],
        date: dateStr,
        startTime: t.time,
        endTime: t.end,
        maxCapacity: t.cap,
        enrolledCount: t.enrolled,
        waitlistCount: t.waitlist,
      });
    }
  }

  // Also merge in any real mockClasses that fall within the week
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const mondayStr = monday.toISOString().split("T")[0];
  const sundayStr = sunday.toISOString().split("T")[0];

  for (const cls of mockClasses) {
    if (cls.date >= mondayStr && cls.date <= sundayStr) {
      // Avoid duplicates by checking if we already have one at that date+time
      const exists = classes.some(
        (c) => c.date === cls.date && c.startTime === cls.startTime && c.classTypeId === cls.classTypeId
      );
      if (!exists) {
        classes.push(cls);
      }
    }
  }

  return classes;
}

function ClassBlock({ cls }: { cls: Class }) {
  const pct = (cls.enrolledCount / cls.maxCapacity) * 100;
  const isFull = pct >= 100;

  return (
    <Link
      href={`/classes/${cls.id}`}
      className="group block rounded-lg border border-transparent p-1.5 transition-all hover:border-[rgba(61,255,110,0.22)] hover:shadow-lg"
      style={{ backgroundColor: `${cls.classType.color}15` }}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        <div
          className="h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: cls.classType.color }}
        />
        <span className="text-[11px] font-semibold text-vytal-text truncate">
          {cls.classType.name}
        </span>
      </div>
      <p className="text-[10px] text-vytal-muted truncate">
        {cls.coaches.length > 0
          ? cls.coaches.map((c) => c.name.split(" ")[0]).join(", ")
          : "Open Box"}
      </p>
      <p
        className={cn(
          "font-mono text-[10px]",
          isFull ? "text-vytal-red" : "text-vytal-muted"
        )}
      >
        {cls.enrolledCount}/{cls.maxCapacity}
        {cls.waitlistCount > 0 && (
          <span className="text-vytal-amber"> +{cls.waitlistCount}</span>
        )}
      </p>
    </Link>
  );
}

export default function ClassCalendarPage() {
  const [weekOffset, setWeekOffset] = useState(0);

  const monday = useMemo(() => {
    const m = getMonday(new Date());
    m.setDate(m.getDate() + weekOffset * 7);
    return m;
  }, [weekOffset]);

  const sunday = useMemo(() => {
    const s = new Date(monday);
    s.setDate(s.getDate() + 6);
    return s;
  }, [monday]);

  const weekClasses = useMemo(() => generateWeekClasses(monday), [monday]);

  const today = new Date().toISOString().split("T")[0];

  // Group classes by day + time
  const grid = useMemo(() => {
    const map: Record<string, Class[]> = {};
    for (const cls of weekClasses) {
      const key = `${cls.date}|${cls.startTime}`;
      if (!map[key]) map[key] = [];
      map[key].push(cls);
    }
    return map;
  }, [weekClasses]);

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      return d.toISOString().split("T")[0];
    });
  }, [monday]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/classes"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-vytal-text">
              Weekly Calendar
            </h1>
            <p className="mt-1 text-sm text-vytal-muted">
              {formatDateShort(monday)} &mdash; {formatDateShort(sunday)}
            </p>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-vytal-border text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="rounded-lg border border-vytal-border px-3 py-1.5 text-xs font-medium text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
          >
            This Week
          </button>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-vytal-border text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto rounded-xl border border-vytal-border">
        <table className="w-full min-w-[900px] table-fixed">
          <thead>
            <tr className="border-b border-vytal-border bg-vytal-bg2">
              <th className="w-16 px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Time
              </th>
              {weekDates.map((dateStr, i) => {
                const isToday = dateStr === today;
                const d = new Date(dateStr + "T00:00:00");
                return (
                  <th
                    key={dateStr}
                    className={cn(
                      "px-1 py-3 text-center text-xs font-medium uppercase tracking-wider",
                      isToday
                        ? "bg-vytal-green/5 text-vytal-green"
                        : "text-vytal-muted"
                    )}
                  >
                    <div>{DAY_LABELS[i]}</div>
                    <div className="mt-0.5 font-mono text-[11px]">
                      {d.getDate()}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((time) => (
              <tr
                key={time}
                className="border-b border-vytal-border last:border-b-0"
              >
                <td className="px-2 py-1 align-top">
                  <span className="font-mono text-[11px] text-vytal-muted">
                    {time}
                  </span>
                </td>
                {weekDates.map((dateStr) => {
                  const key = `${dateStr}|${time}`;
                  const classes = grid[key] || [];
                  const isToday = dateStr === today;

                  return (
                    <td
                      key={dateStr}
                      className={cn(
                        "px-1 py-1 align-top",
                        isToday && "bg-vytal-green/[0.02]"
                      )}
                    >
                      <div className="space-y-1">
                        {classes.map((cls) => (
                          <ClassBlock key={cls.id} cls={cls} />
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
