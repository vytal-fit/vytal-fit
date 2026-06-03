"use client";

import Link from "next/link";
import { ArrowLeft, BarChart3, Clock, Calendar, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIME_SLOTS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00",
];

// Mock heatmap data: [day][timeSlot] = attendance count
const HEATMAP_DATA: number[][] = [
  // Mon
  [4, 16, 12, 8, 5, 3, 10, 4, 3, 5, 6, 18, 20, 17, 6],
  // Tue
  [3, 15, 11, 7, 4, 2, 9, 3, 2, 4, 5, 17, 19, 16, 5],
  // Wed
  [5, 17, 13, 9, 6, 4, 11, 5, 4, 6, 7, 19, 20, 18, 7],
  // Thu
  [6, 18, 14, 10, 7, 5, 12, 6, 5, 7, 8, 20, 22, 19, 8],
  // Fri
  [3, 14, 10, 6, 3, 2, 8, 3, 2, 3, 4, 14, 16, 12, 4],
  // Sat
  [0, 0, 8, 10, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // Sun
  [0, 0, 0, 4, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

function getMaxValue(): number {
  let max = 0;
  for (const row of HEATMAP_DATA) {
    for (const val of row) {
      if (val > max) max = val;
    }
  }
  return max;
}

function getColor(value: number, max: number): string {
  if (value === 0) return "bg-vytal-bg3";
  const intensity = value / max;
  if (intensity <= 0.2) return "bg-vytal-green/10";
  if (intensity <= 0.4) return "bg-vytal-green/20";
  if (intensity <= 0.6) return "bg-vytal-green/40";
  if (intensity <= 0.8) return "bg-vytal-green/60";
  return "bg-vytal-green/80";
}

function getTextColor(value: number, max: number): string {
  if (value === 0) return "text-vytal-muted/50";
  const intensity = value / max;
  if (intensity <= 0.4) return "text-vytal-muted";
  return "text-vytal-bg";
}

export default function AttendanceHeatmapPage() {
  const { t } = useI18n();
  const max = getMaxValue();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("reports.title"), href: "/reports" }, { label: t("attendance.title") }]} />

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/reports"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">
            {t("attendance.title")}
          </h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("attendance.subtitle")}
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Peak Day
              </span>
              <span className="text-2xl font-bold text-vytal-text">
                Thursday
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-green/10">
              <Calendar className="h-5 w-5 text-vytal-green" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Peak Time
              </span>
              <span className="text-2xl font-bold text-vytal-text">
                17:30 - 18:30
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-blue/10">
              <Clock className="h-5 w-5 text-vytal-blue" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Avg per Class
              </span>
              <span className="text-2xl font-bold text-vytal-text">14.2</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-amber/10">
              <Users className="h-5 w-5 text-vytal-amber" />
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-vytal-green" />
          <h3 className="text-sm font-semibold text-vytal-text">
            Weekly Attendance Pattern
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr>
                <th className="w-16 px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-vytal-muted" />
                {TIME_SLOTS.map((t) => (
                  <th
                    key={t}
                    className="px-0.5 py-2 text-center text-[10px] font-medium text-vytal-muted"
                  >
                    {t.slice(0, 2)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day, dayIdx) => (
                <tr key={day}>
                  <td className="px-2 py-0.5 text-xs font-medium text-vytal-muted">
                    {day}
                  </td>
                  {HEATMAP_DATA[dayIdx].map((value, timeIdx) => (
                    <td key={timeIdx} className="px-0.5 py-0.5">
                      <div
                        className={cn(
                          "flex h-10 items-center justify-center rounded",
                          getColor(value, max)
                        )}
                      >
                        <span
                          className={cn(
                            "font-mono text-[11px] font-semibold",
                            getTextColor(value, max)
                          )}
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
        <div className="mt-6 flex items-center gap-4">
          <span className="text-[10px] font-medium uppercase tracking-wider text-vytal-muted">
            Less
          </span>
          <div className="flex gap-1">
            <div className="h-4 w-8 rounded bg-vytal-bg3" />
            <div className="h-4 w-8 rounded bg-vytal-green/10" />
            <div className="h-4 w-8 rounded bg-vytal-green/20" />
            <div className="h-4 w-8 rounded bg-vytal-green/40" />
            <div className="h-4 w-8 rounded bg-vytal-green/60" />
            <div className="h-4 w-8 rounded bg-vytal-green/80" />
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-vytal-muted">
            More
          </span>
        </div>
      </div>
    </div>
  );
}
