"use client";

import { useState, useMemo, useCallback } from "react";
import { useDataStore } from "@/stores/data-store";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Clock,
  Trash2,
  Plus,
  X,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ShiftType = "morning" | "afternoon" | "evening";

interface Shift {
  id: string;
  startTime: string;
  endTime: string;
  type: ShiftType;
  hasSwapRequest: boolean;
}

interface CoachSchedule {
  coachId: string;
  coachName: string;
  shifts: Record<string, Shift[]>; // key = day index 0-6
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const shiftTypeColors: Record<ShiftType, string> = {
  morning: "bg-vytal-blue/10 text-vytal-blue border-vytal-blue/20",
  afternoon: "bg-vytal-amber/10 text-vytal-amber border-vytal-amber/20",
  evening: "bg-vytal-green/10 text-vytal-green border-vytal-green/20",
};

function getShiftType(startTime: string): ShiftType {
  const hour = parseInt(startTime.split(":")[0], 10);
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function calcHours(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  return (eh * 60 + em - (sh * 60 + sm)) / 60;
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}

function formatDateShort(d: Date): string {
  return d.toLocaleDateString("pt-PT", { day: "numeric", month: "short" });
}

const HOURLY_RATE = 15;

// ---------------------------------------------------------------------------
// Mock shifts
// ---------------------------------------------------------------------------

function generateMockShifts(): Record<string, Shift[]> {
  let idCounter = 0;
  const shifts: Record<string, Shift[]> = {};
  const shiftPatterns = [
    [
      { start: "07:00", end: "12:00" },
      { start: "17:00", end: "20:00" },
    ],
    [{ start: "07:00", end: "12:00" }],
    [
      { start: "12:00", end: "17:00" },
      { start: "17:00", end: "20:00" },
    ],
    [{ start: "17:00", end: "21:00" }],
    [{ start: "07:00", end: "14:00" }],
    [{ start: "09:00", end: "13:00" }],
    [],
  ];

  for (let day = 0; day < 7; day++) {
    const pattern = shiftPatterns[day];
    shifts[String(day)] = pattern.map((p) => ({
      id: `shift-${idCounter++}`,
      startTime: p.start,
      endTime: p.end,
      type: getShiftType(p.start),
      hasSwapRequest: idCounter === 3, // one swap request
    }));
  }
  return shifts;
}

export default function StaffSchedulePage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const storeCoaches = useDataStore((s) => s.coaches);

  const [weekOffset, setWeekOffset] = useState(0);
  const [addShiftCell, setAddShiftCell] = useState<{
    coachId: string;
    dayIdx: number;
  } | null>(null);
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("12:00");
  const [deleteTarget, setDeleteTarget] = useState<{
    coachId: string;
    dayIdx: number;
    shiftId: string;
  } | null>(null);

  const baseMonday = useMemo(() => {
    const today = new Date();
    return addDays(getMonday(today), weekOffset * 7);
  }, [weekOffset]);

  // Initialize schedules
  const [schedules, setSchedules] = useState<CoachSchedule[]>(() =>
    storeCoaches.map((coach, ci) => {
      const base = generateMockShifts();
      // Vary shifts per coach
      if (ci === 1) {
        base["0"] = [
          {
            id: `s2-0`,
            startTime: "12:00",
            endTime: "17:00",
            type: "afternoon",
            hasSwapRequest: false,
          },
        ];
        base["2"] = [
          {
            id: `s2-2`,
            startTime: "07:00",
            endTime: "12:00",
            type: "morning",
            hasSwapRequest: false,
          },
        ];
        base["4"] = [];
      }
      if (ci === 2) {
        base["0"] = [
          {
            id: `s3-0`,
            startTime: "17:00",
            endTime: "21:00",
            type: "evening",
            hasSwapRequest: true,
          },
        ];
        base["1"] = [
          {
            id: `s3-1`,
            startTime: "17:00",
            endTime: "21:00",
            type: "evening",
            hasSwapRequest: false,
          },
        ];
        base["3"] = [];
        base["5"] = [];
      }
      return {
        coachId: coach.id,
        coachName: coach.name,
        shifts: base,
      };
    })
  );

  function handleAddShift() {
    if (!addShiftCell) return;
    const { coachId, dayIdx } = addShiftCell;
    const type = getShiftType(newStart);
    const newShift: Shift = {
      id: `shift-${Date.now()}`,
      startTime: newStart,
      endTime: newEnd,
      type,
      hasSwapRequest: false,
    };
    setSchedules((prev) =>
      prev.map((s) =>
        s.coachId === coachId
          ? {
              ...s,
              shifts: {
                ...s.shifts,
                [String(dayIdx)]: [
                  ...(s.shifts[String(dayIdx)] ?? []),
                  newShift,
                ],
              },
            }
          : s
      )
    );
    setAddShiftCell(null);
    setNewStart("09:00");
    setNewEnd("12:00");
    toast(t("schedule.shiftAdded"), "success");
  }

  function handleDeleteShift() {
    if (!deleteTarget) return;
    const { coachId, dayIdx, shiftId } = deleteTarget;
    setSchedules((prev) =>
      prev.map((s) =>
        s.coachId === coachId
          ? {
              ...s,
              shifts: {
                ...s.shifts,
                [String(dayIdx)]: (s.shifts[String(dayIdx)] ?? []).filter(
                  (sh) => sh.id !== shiftId
                ),
              },
            }
          : s
      )
    );
    setDeleteTarget(null);
    toast(t("schedule.shiftRemoved"), "success");
  }

  function handleCopyWeek() {
    toast(t("schedule.weekCopied"), "info");
  }

  // Totals
  const coachTotals = useMemo(() => {
    return schedules.map((s) => {
      let totalHours = 0;
      for (let d = 0; d < 7; d++) {
        for (const shift of s.shifts[String(d)] ?? []) {
          totalHours += calcHours(shift.startTime, shift.endTime);
        }
      }
      return {
        coachId: s.coachId,
        coachName: s.coachName,
        hours: totalHours,
        payroll: totalHours * HOURLY_RATE,
      };
    });
  }, [schedules]);

  const totalPayroll = coachTotals.reduce((sum, c) => sum + c.payroll, 0);
  const totalHours = coachTotals.reduce((sum, c) => sum + c.hours, 0);

  const dayDates = Array.from({ length: 7 }, (_, i) => addDays(baseMonday, i));

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: t("nav.staff"), href: "/staff" },
          { label: t("nav.schedule") },
        ]}
      />

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">
            {t("schedule.title")}
          </h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("schedule.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyWeek}
            className="flex items-center gap-2 rounded-lg border border-vytal-border px-3 py-2 text-sm text-vytal-text transition-colors hover:bg-vytal-bg3"
          >
            <Copy className="h-3.5 w-3.5" />
            {t("schedule.copyWeek")}
          </button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setWeekOffset((o) => o - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-vytal-border text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-[200px] text-center text-sm font-medium text-vytal-text">
          {formatDateShort(dayDates[0])} &mdash;{" "}
          {formatDateShort(dayDates[6])}
        </span>
        <button
          onClick={() => setWeekOffset((o) => o + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-vytal-border text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Schedule Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Day headers */}
          <div className="grid grid-cols-[160px_repeat(7,1fr)] gap-1">
            <div className="rounded-tl-lg bg-vytal-bg3 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-vytal-muted">
              {t("schedule.coach")}
            </div>
            {DAY_LABELS.map((day, i) => (
              <div
                key={day}
                className="bg-vytal-bg3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-vytal-muted"
              >
                {day}
                <span className="ml-1 text-[10px] font-normal">
                  {formatDateShort(dayDates[i])}
                </span>
              </div>
            ))}
          </div>

          {/* Coach rows */}
          {schedules.map((schedule) => {
            const initials = schedule.coachName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2);
            const coachTotal = coachTotals.find(
              (c) => c.coachId === schedule.coachId
            );

            return (
              <div
                key={schedule.coachId}
                className="grid grid-cols-[160px_repeat(7,1fr)] gap-1"
              >
                {/* Coach name cell */}
                <div className="flex items-center gap-2 border-b border-vytal-border bg-vytal-card px-3 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-vytal-green/10 text-xs font-bold text-vytal-green">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-vytal-text">
                      {schedule.coachName}
                    </p>
                    <p className="text-[10px] text-vytal-muted">
                      {coachTotal?.hours.toFixed(1)}h
                    </p>
                  </div>
                </div>

                {/* Day cells */}
                {Array.from({ length: 7 }, (_, dayIdx) => {
                  const dayShifts = schedule.shifts[String(dayIdx)] ?? [];
                  return (
                    <div
                      key={dayIdx}
                      className="group min-h-[60px] border-b border-vytal-border bg-vytal-card p-1.5"
                    >
                      {dayShifts.map((shift) => (
                        <button
                          key={shift.id}
                          onClick={() =>
                            setDeleteTarget({
                              coachId: schedule.coachId,
                              dayIdx,
                              shiftId: shift.id,
                            })
                          }
                          className={cn(
                            "relative mb-1 flex w-full items-center gap-1 rounded border px-1.5 py-1 text-[10px] font-medium transition-colors",
                            shiftTypeColors[shift.type]
                          )}
                        >
                          <Clock className="h-2.5 w-2.5 shrink-0" />
                          {shift.startTime}-{shift.endTime}
                          {shift.hasSwapRequest && (
                            <AlertCircle className="ml-auto h-3 w-3 shrink-0 text-vytal-amber" />
                          )}
                        </button>
                      ))}
                      {dayShifts.length === 0 && (
                        <button
                          onClick={() =>
                            setAddShiftCell({
                              coachId: schedule.coachId,
                              dayIdx,
                            })
                          }
                          className="flex h-full w-full items-center justify-center rounded border border-dashed border-transparent py-2 text-vytal-muted/30 opacity-0 transition-all group-hover:border-vytal-border group-hover:opacity-100 hover:text-vytal-green"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      )}
                      {dayShifts.length > 0 && (
                        <button
                          onClick={() =>
                            setAddShiftCell({
                              coachId: schedule.coachId,
                              dayIdx,
                            })
                          }
                          className="flex w-full items-center justify-center rounded py-0.5 text-vytal-muted/30 opacity-0 transition-all group-hover:opacity-100 hover:text-vytal-green"
                        >
                          <Plus className="h-2.5 w-2.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {coachTotals.map((ct) => (
          <div
            key={ct.coachId}
            className="flex items-center justify-between rounded-lg border border-vytal-border bg-vytal-card px-4 py-3"
          >
            <span className="text-xs font-medium text-vytal-text">
              {ct.coachName}
            </span>
            <div className="text-right">
              <p className="text-sm font-bold text-vytal-text">
                {ct.hours.toFixed(1)}h
              </p>
              <p className="text-[10px] text-vytal-green">
                {ct.payroll.toFixed(0)} EUR
              </p>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between rounded-lg border border-vytal-green/20 bg-vytal-green/5 px-4 py-3">
          <span className="text-xs font-semibold text-vytal-green">
            {t("schedule.total")}
          </span>
          <div className="text-right">
            <p className="text-sm font-bold text-vytal-text">
              {totalHours.toFixed(1)}h
            </p>
            <p className="text-[10px] font-semibold text-vytal-green">
              {totalPayroll.toFixed(0)} EUR
            </p>
          </div>
        </div>
      </div>

      {/* Add Shift Modal */}
      {addShiftCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-vytal-border bg-vytal-card p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-vytal-text">
                {t("schedule.addShift")}
              </h3>
              <button
                onClick={() => setAddShiftCell(null)}
                className="text-vytal-muted transition-colors hover:text-vytal-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                    {t("schedule.startTime")}
                  </label>
                  <input
                    type="time"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                    {t("schedule.endTime")}
                  </label>
                  <input
                    type="time"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setAddShiftCell(null)}
                  className="rounded-lg border border-vytal-border px-4 py-2 text-sm text-vytal-text transition-colors hover:bg-vytal-bg3"
                >
                  {t("action.cancel")}
                </button>
                <button
                  onClick={handleAddShift}
                  className="rounded-lg bg-vytal-green px-6 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
                >
                  {t("schedule.add")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Shift Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-vytal-border bg-vytal-card p-6 shadow-2xl">
            <h3 className="mb-3 text-sm font-semibold text-vytal-text">
              {t("schedule.removeShift")}
            </h3>
            <p className="mb-5 text-sm text-vytal-muted">
              {t("schedule.removeShiftConfirm")}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-vytal-border px-4 py-2 text-sm text-vytal-text transition-colors hover:bg-vytal-bg3"
              >
                {t("action.cancel")}
              </button>
              <button
                onClick={handleDeleteShift}
                className="rounded-lg bg-vytal-red px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-vytal-red/90"
              >
                {t("action.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
