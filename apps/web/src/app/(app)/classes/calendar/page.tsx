"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowLeft, X, Trash2, Users } from "lucide-react";
import { mockClassTypes, mockCoaches, mockLocations } from "@vytal-fit/shared";
import type { Class } from "@vytal-fit/shared";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/toast";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";

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

  return classes;
}

function ClassBlock({
  cls,
  onClick,
  isDragging,
  onDragStart,
}: {
  cls: Class;
  onClick: () => void;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
}) {
  const { t } = useI18n();
  const pct = (cls.enrolledCount / cls.maxCapacity) * 100;
  const isFull = pct >= 100;

  return (
    <button
      draggable
      onDragStart={onDragStart}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="group block w-full rounded-lg border border-transparent p-1.5 text-left transition-all hover:border-[rgba(61,255,110,0.22)] hover:shadow-lg"
      style={{
        backgroundColor: `${cls.classType.color}15`,
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
      }}
    >
      <div className="mb-0.5 flex items-center gap-1.5">
        <div
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: cls.classType.color }}
        />
        <span className="truncate text-[11px] font-semibold text-vytal-text">
          {cls.classType.name}
        </span>
      </div>
      <p className="truncate text-[10px] text-vytal-muted">
        {cls.coaches.length > 0
          ? cls.coaches.map((c) => c.name.split(" ")[0]).join(", ")
          : t("calendar.openBox")}
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
    </button>
  );
}

function ClassDetailPopup({
  cls,
  onClose,
  onDelete,
}: {
  cls: Class;
  onClose: () => void;
  onDelete: () => void;
}) {
  const { t } = useI18n();
  const pct = Math.min((cls.enrolledCount / cls.maxCapacity) * 100, 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-vytal-border bg-vytal-bg2 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: cls.classType.color }}
            />
            <h3 className="text-lg font-bold text-vytal-text">
              {cls.classType.name}
            </h3>
          </div>
          <button onClick={onClose} className="text-vytal-muted hover:text-vytal-text">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 space-y-2 text-sm text-vytal-muted">
          <p>
            <span className="font-medium text-vytal-text">{t("calendar.date")}:</span> {cls.date}
          </p>
          <p>
            <span className="font-medium text-vytal-text">{t("calendar.time")}:</span> {cls.startTime} - {cls.endTime}
          </p>
          <p>
            <span className="font-medium text-vytal-text">{t("calendar.coach")}:</span>{" "}
            {cls.coaches.length > 0 ? cls.coaches.map((c) => c.name).join(", ") : t("calendar.openBox")}
          </p>
          <p>
            <span className="font-medium text-vytal-text">{t("classes.location")}:</span> {cls.location.name}
          </p>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="font-medium text-vytal-text">{t("calendar.enrollment")}:</span>
            <span className={cn("font-mono", pct >= 100 ? "text-vytal-red" : "text-vytal-green")}>
              {cls.enrolledCount}/{cls.maxCapacity}
            </span>
          </div>
          {cls.waitlistCount > 0 && (
            <p>
              <span className="font-medium text-vytal-amber">{t("classes.waitlist")}:</span> {cls.waitlistCount}
            </p>
          )}
        </div>

        {/* Enrollment bar */}
        <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-vytal-bg3">
          <div
            className={cn(
              "h-full rounded-full",
              pct >= 100 ? "bg-vytal-red" : pct >= 80 ? "bg-vytal-amber" : "bg-vytal-green"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onDelete}
            className="flex items-center gap-2 rounded-lg border border-vytal-red/30 bg-vytal-red/5 px-4 py-2 text-sm font-medium text-vytal-red transition-colors hover:bg-vytal-red/10"
          >
            <Trash2 className="h-4 w-4" />
            {t("action.delete")}
          </button>
          <button
            onClick={onClose}
            className="ml-auto rounded-lg border border-vytal-border px-4 py-2 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
          >
            {t("action.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateClassModal({
  date,
  time,
  onClose,
  onCreate,
}: {
  date: string;
  time: string;
  onClose: () => void;
  onCreate: (cls: Class) => void;
}) {
  const { t } = useI18n();
  const [classTypeId, setClassTypeId] = useState(mockClassTypes[0].id);
  const [coachId, setCoachId] = useState(mockCoaches[0].id);
  const [endTime, setEndTime] = useState(() => {
    const [h, m] = time.split(":").map(Number);
    return `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  });
  const [maxCapacity, setMaxCapacity] = useState("20");

  function handleCreate() {
    const ct = mockClassTypes.find((c) => c.id === classTypeId) ?? mockClassTypes[0];
    const coach = mockCoaches.find((c) => c.id === coachId);
    const newClass: Class = {
      id: `cal-new-${Date.now()}`,
      organizationId: "org-1",
      classTypeId: ct.id,
      classType: ct,
      locationId: mockLocations[0].id,
      location: mockLocations[0],
      coachIds: coach ? [coach.id] : [],
      coaches: coach ? [coach] : [],
      date,
      startTime: time,
      endTime,
      maxCapacity: parseInt(maxCapacity) || 20,
      enrolledCount: 0,
      waitlistCount: 0,
    };
    onCreate(newClass);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-vytal-border bg-vytal-bg2 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-vytal-text">{t("calendar.createClass")}</h3>
          <button onClick={onClose} className="text-vytal-muted hover:text-vytal-text">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("calendar.date")}</label>
              <input
                type="text"
                value={date}
                readOnly
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg px-3 py-2 text-sm text-vytal-muted"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("calendar.start")}</label>
              <input
                type="text"
                value={time}
                readOnly
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg px-3 py-2 text-sm text-vytal-muted"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("calendar.endTime")}</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("calendar.classType")}</label>
            <select
              value={classTypeId}
              onChange={(e) => setClassTypeId(e.target.value)}
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none"
            >
              {mockClassTypes.filter((ct) => ct.active).map((ct) => (
                <option key={ct.id} value={ct.id}>{ct.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("calendar.coach")}</label>
            <select
              value={coachId}
              onChange={(e) => setCoachId(e.target.value)}
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none"
            >
              {mockCoaches.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("calendar.maxCapacity")}</label>
            <input
              type="number"
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(e.target.value)}
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-vytal-border px-4 py-2 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
          >
            {t("action.cancel")}
          </button>
          <button
            onClick={handleCreate}
            className="rounded-lg bg-vytal-green px-4 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
          >
            {t("action.create")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClassCalendarPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const { toast } = useToast();
  const { t } = useI18n();

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

  const [extraClasses, setExtraClasses] = useState<Class[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const weekClasses = useMemo(() => {
    const base = generateWeekClasses(monday);
    return [...base, ...extraClasses].filter((c) => !deletedIds.has(c.id));
  }, [monday, extraClasses, deletedIds]);

  const today = new Date().toISOString().split("T")[0];

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

  // Popup states
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [createModal, setCreateModal] = useState<{ date: string; time: string } | null>(null);

  // Drag state
  const [draggedClassId, setDraggedClassId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  const handleCellClick = useCallback(
    (dateStr: string, time: string) => {
      const key = `${dateStr}|${time}`;
      const existing = grid[key];
      if (!existing || existing.length === 0) {
        setCreateModal({ date: dateStr, time });
      }
    },
    [grid]
  );

  const handleDelete = useCallback(
    (cls: Class) => {
      setDeletedIds((prev) => new Set([...prev, cls.id]));
      setSelectedClass(null);
      toast(`${t("action.delete")}: ${cls.classType.name} ${cls.date}`, "success");
    },
    [toast, t]
  );

  const handleCreate = useCallback(
    (cls: Class) => {
      setExtraClasses((prev) => [...prev, cls]);
      setCreateModal(null);
      toast(`${t("action.create")}: ${cls.classType.name} ${cls.date} ${cls.startTime}`, "success");
    },
    [toast, t]
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent, classId: string) => {
      e.stopPropagation();
      setDraggedClassId(classId);
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, cellKey: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDropTarget(cellKey);
    },
    []
  );

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dateStr: string, time: string) => {
      e.preventDefault();
      setDropTarget(null);

      if (!draggedClassId) return;

      // Find the dragged class in all sources
      const allClasses = [...generateWeekClasses(monday), ...extraClasses].filter(
        (c) => !deletedIds.has(c.id)
      );
      const draggedClass = allClasses.find((c) => c.id === draggedClassId);

      if (!draggedClass) {
        setDraggedClassId(null);
        return;
      }

      // If dropped on same slot, do nothing
      if (draggedClass.date === dateStr && draggedClass.startTime === time) {
        setDraggedClassId(null);
        return;
      }

      // Calculate new end time preserving duration
      const [startH, startM] = draggedClass.startTime.split(":").map(Number);
      const [endH, endM] = draggedClass.endTime.split(":").map(Number);
      const durationMin = (endH * 60 + endM) - (startH * 60 + startM);
      const [newStartH, newStartM] = time.split(":").map(Number);
      const newEndTotalMin = newStartH * 60 + newStartM + durationMin;
      const newEndTime = `${String(Math.floor(newEndTotalMin / 60)).padStart(2, "0")}:${String(newEndTotalMin % 60).padStart(2, "0")}`;

      // Delete original and create moved copy
      setDeletedIds((prev) => new Set([...prev, draggedClassId]));
      const movedClass: Class = {
        ...draggedClass,
        id: `cal-moved-${Date.now()}`,
        date: dateStr,
        startTime: time,
        endTime: newEndTime,
      };
      setExtraClasses((prev) => [...prev, movedClass]);

      setDraggedClassId(null);
      toast(`${draggedClass.classType.name} → ${dateStr} ${time}`, "success");
    },
    [draggedClassId, monday, extraClasses, deletedIds, toast]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedClassId(null);
    setDropTarget(null);
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("classes.title"), href: "/classes" }, { label: t("calendar.title") }]} />

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
              {t("calendar.title")}
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
            {t("calendar.thisWeek")}
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
                {t("calendar.time")}
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
                  const isDropTarget = dropTarget === key;

                  return (
                    <td
                      key={dateStr}
                      className={cn(
                        "cursor-pointer px-1 py-1 align-top transition-colors hover:bg-vytal-green/[0.04]",
                        isToday && "bg-vytal-green/[0.02]"
                      )}
                      style={
                        isDropTarget
                          ? {
                              outline: "2px dashed rgba(34,197,94,0.6)",
                              outlineOffset: "-2px",
                              backgroundColor: "rgba(34,197,94,0.06)",
                            }
                          : undefined
                      }
                      onClick={() => handleCellClick(dateStr, time)}
                      onDragOver={(e) => handleDragOver(e, key)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, dateStr, time)}
                    >
                      <div className="space-y-1">
                        {classes.map((cls) => (
                          <ClassBlock
                            key={cls.id}
                            cls={cls}
                            isDragging={draggedClassId === cls.id}
                            onDragStart={(e) => handleDragStart(e, cls.id)}
                            onClick={() => {
                              setSelectedClass(cls);
                            }}
                          />
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

      {/* Handle drag end globally */}
      {draggedClassId && (
        <div
          className="fixed inset-0 z-40"
          style={{ pointerEvents: "none" }}
          onDragEnd={handleDragEnd}
        />
      )}

      {/* Class detail popup */}
      {selectedClass && (
        <ClassDetailPopup
          cls={selectedClass}
          onClose={() => setSelectedClass(null)}
          onDelete={() => handleDelete(selectedClass)}
        />
      )}

      {/* Create class modal */}
      {createModal && (
        <CreateClassModal
          date={createModal.date}
          time={createModal.time}
          onClose={() => setCreateModal(null)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
