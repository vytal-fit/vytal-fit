"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowLeft, X, Trash2, Users, Copy, ClipboardPaste, Check, AlertTriangle } from "lucide-react";
import type { Class, ClassType, Coach, Location } from "@vytal-fit/shared";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/toast";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { trpc } from "@/lib/trpc";
import { rowsToClasses, type ClassCounts } from "@/lib/class-mapper";
import { rowsToClassTypes, rowsToCoaches, rowsToLocations } from "@/lib/reference-mappers";
import { Skeleton } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";

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

/** Fields needed to create a class through `classes.create`. */
interface NewClassInput {
  classTypeId: string;
  locationId: string;
  coachIds: string[];
  date: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
}

function ClassBlock({
  cls,
  onClick,
  isDragging,
  onDragStart,
  isPastePreview,
}: {
  cls: Class;
  onClick: () => void;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  isPastePreview?: boolean;
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
      className={cn(
        "group block w-full rounded-lg p-1.5 text-left transition-all hover:shadow-lg",
        isPastePreview
          ? "border-2 border-dashed border-vytal-green/50"
          : "border border-transparent hover:border-[rgba(61,255,110,0.22)]"
      )}
      style={{
        backgroundColor: isPastePreview ? `${cls.classType.color}08` : `${cls.classType.color}15`,
        opacity: isDragging ? 0.5 : isPastePreview ? 0.7 : 1,
        cursor: isPastePreview ? "default" : "grab",
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
  deletePending,
}: {
  cls: Class;
  onClose: () => void;
  onDelete: () => void;
  deletePending: boolean;
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
            disabled={deletePending}
            className="flex items-center gap-2 rounded-lg border border-vytal-red/30 bg-vytal-red/5 px-4 py-2 text-sm font-medium text-vytal-red transition-colors hover:bg-vytal-red/10 disabled:cursor-not-allowed disabled:opacity-50"
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
  classTypes,
  coaches,
  locations,
  onClose,
  onCreate,
  createPending,
}: {
  date: string;
  time: string;
  classTypes: ClassType[];
  coaches: Coach[];
  locations: Location[];
  onClose: () => void;
  onCreate: (input: NewClassInput) => void;
  createPending: boolean;
}) {
  const { t } = useI18n();
  const [classTypeId, setClassTypeId] = useState(classTypes[0]?.id ?? "");
  const [coachId, setCoachId] = useState(coaches[0]?.id ?? "");
  const [endTime, setEndTime] = useState(() => {
    const [h, m] = time.split(":").map(Number);
    return `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  });
  const [maxCapacity, setMaxCapacity] = useState("20");

  function handleCreate() {
    if (!classTypeId || locations.length === 0) return;
    onCreate({
      classTypeId,
      locationId: locations[0].id,
      coachIds: coachId ? [coachId] : [],
      date,
      startTime: time,
      endTime,
      maxCapacity: parseInt(maxCapacity) || 20,
    });
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
              {classTypes.filter((ct) => ct.active).map((ct) => (
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
              {coaches.map((c) => (
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
            disabled={createPending}
            className="rounded-lg bg-vytal-green px-4 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90 disabled:cursor-not-allowed disabled:opacity-50"
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
  const utils = trpc.useUtils();

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

  const mondayStr = monday.toISOString().split("T")[0];
  const sundayStr = sunday.toISOString().split("T")[0];

  // ── tRPC: week classes + reference data ──
  const listQuery = trpc.classes.list.useQuery({ from: mondayStr, to: sundayStr });
  const classTypesQuery = trpc.classTypes.list.useQuery();
  const locationsQuery = trpc.locations.list.useQuery();
  const coachesQuery = trpc.coaches.list.useQuery();

  const classTypes = useMemo(
    () => rowsToClassTypes(classTypesQuery.data ?? []),
    [classTypesQuery.data],
  );
  const coaches = useMemo(() => rowsToCoaches(coachesQuery.data ?? []), [coachesQuery.data]);
  const locations = useMemo(
    () => rowsToLocations(locationsQuery.data ?? []),
    [locationsQuery.data],
  );

  const activeRows = useMemo(
    () => (listQuery.data ?? []).filter((row) => !row.cancelledAt),
    [listQuery.data],
  );

  // Enrollment counts only exist on `classes.byId` — fan out per row.
  const countQueries = trpc.useQueries((q) =>
    activeRows.map((row) => q.classes.byId({ id: row.id })),
  );

  const weekClasses = useMemo(() => {
    const countsById = new Map<string, ClassCounts>();
    for (const query of countQueries) {
      if (query.data) {
        countsById.set(query.data.id, {
          enrolledCount: query.data.enrolledCount,
          waitlistCount: query.data.waitlistCount,
        });
      }
    }
    return rowsToClasses(activeRows, { classTypes, locations, coaches }, countsById);
  }, [activeRows, classTypes, locations, coaches, countQueries]);

  const isPending =
    listQuery.isPending ||
    classTypesQuery.isPending ||
    locationsQuery.isPending ||
    coachesQuery.isPending;

  // ── Mutations ──
  const createClass = trpc.classes.create.useMutation();
  const cancelClass = trpc.classes.cancel.useMutation();

  const invalidateClasses = useCallback(() => {
    void utils.classes.list.invalidate();
    void utils.classes.byId.invalidate();
  }, [utils]);

  // Copy/Paste state
  const [copiedClasses, setCopiedClasses] = useState<Class[] | null>(null);
  const [pastedPreview, setPastedPreview] = useState<Class[]>([]);
  const [showPastePreview, setShowPastePreview] = useState(false);

  // Combine weekClasses with paste preview for display
  const displayClasses = useMemo(() => {
    if (!showPastePreview) return weekClasses;
    return [...weekClasses, ...pastedPreview];
  }, [weekClasses, pastedPreview, showPastePreview]);

  const pastedIds = useMemo(() => new Set(pastedPreview.map((c) => c.id)), [pastedPreview]);

  const today = new Date().toISOString().split("T")[0];

  const grid = useMemo(() => {
    const map: Record<string, Class[]> = {};
    for (const cls of displayClasses) {
      const key = `${cls.date}|${cls.startTime}`;
      if (!map[key]) map[key] = [];
      map[key].push(cls);
    }
    return map;
  }, [displayClasses]);

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      return d.toISOString().split("T")[0];
    });
  }, [monday]);

  const handleCopyWeek = useCallback(() => {
    setCopiedClasses([...weekClasses]);
    setPastedPreview([]);
    setShowPastePreview(false);
    toast(t("toast.weekCopied"), "success");
  }, [weekClasses, toast, t]);

  const handlePasteWeek = useCallback(() => {
    if (!copiedClasses || copiedClasses.length === 0) return;
    // Generate pasted classes for the current week by adjusting dates
    const copiedMonday = getMonday(new Date(copiedClasses[0]?.date ?? new Date()));
    const targetMonday = monday;

    const pasted: Class[] = copiedClasses.map((cls) => {
      const clsDate = new Date(cls.date + "T00:00:00");
      const dayOfWeek = Math.round((clsDate.getTime() - copiedMonday.getTime()) / (1000 * 60 * 60 * 24));
      const newDate = new Date(targetMonday);
      newDate.setDate(newDate.getDate() + dayOfWeek);
      const dateStr = newDate.toISOString().split("T")[0];

      return {
        ...cls,
        id: `cal-paste-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        date: dateStr,
        enrolledCount: 0,
        waitlistCount: 0,
      };
    });

    setPastedPreview(pasted);
    setShowPastePreview(true);
  }, [copiedClasses, monday]);

  const handleConfirmPaste = useCallback(async () => {
    const toCreate = pastedPreview;
    try {
      await Promise.all(
        toCreate.map((cls) =>
          createClass.mutateAsync({
            classTypeId: cls.classTypeId,
            locationId: cls.locationId,
            coachIds: cls.coachIds,
            date: cls.date,
            startTime: cls.startTime,
            endTime: cls.endTime,
            maxCapacity: cls.maxCapacity,
          }),
        ),
      );
      invalidateClasses();
      toast(t("toast.classesPasted").replace("{count}", String(toCreate.length)), "success");
      setPastedPreview([]);
      setShowPastePreview(false);
      setCopiedClasses(null);
    } catch {
      invalidateClasses();
      toast(t("ui.error"), "error");
    }
  }, [pastedPreview, createClass, invalidateClasses, toast, t]);

  const handleCancelPaste = useCallback(() => {
    setPastedPreview([]);
    setShowPastePreview(false);
  }, []);

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
      cancelClass.mutate(
        { id: cls.id },
        {
          onSuccess: () => {
            invalidateClasses();
            setSelectedClass(null);
            toast(`${t("action.delete")}: ${cls.classType.name} ${cls.date}`, "success");
          },
          onError: () => toast(t("ui.error"), "error"),
        },
      );
    },
    [cancelClass, invalidateClasses, toast, t]
  );

  const handleCreate = useCallback(
    (input: NewClassInput) => {
      createClass.mutate(input, {
        onSuccess: (created) => {
          invalidateClasses();
          setCreateModal(null);
          const ctName = classTypes.find((ct) => ct.id === created.classTypeId)?.name ?? "";
          toast(`${t("action.create")}: ${ctName} ${created.date} ${created.startTime}`, "success");
        },
        onError: () => toast(t("ui.error"), "error"),
      });
    },
    [createClass, invalidateClasses, classTypes, toast, t]
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
    async (e: React.DragEvent, dateStr: string, time: string) => {
      e.preventDefault();
      setDropTarget(null);

      if (!draggedClassId) return;
      const draggedClass = weekClasses.find((c) => c.id === draggedClassId);
      setDraggedClassId(null);

      if (!draggedClass) return;

      // If dropped on same slot, do nothing
      if (draggedClass.date === dateStr && draggedClass.startTime === time) return;

      // Calculate new end time preserving duration
      const [startH, startM] = draggedClass.startTime.split(":").map(Number);
      const [endH, endM] = draggedClass.endTime.split(":").map(Number);
      const durationMin = (endH * 60 + endM) - (startH * 60 + startM);
      const [newStartH, newStartM] = time.split(":").map(Number);
      const newEndTotalMin = newStartH * 60 + newStartM + durationMin;
      const newEndTime = `${String(Math.floor(newEndTotalMin / 60)).padStart(2, "0")}:${String(newEndTotalMin % 60).padStart(2, "0")}`;

      // No `classes.update` procedure exists yet — a move is modelled as
      // create-at-new-slot + cancel-original.
      try {
        await createClass.mutateAsync({
          classTypeId: draggedClass.classTypeId,
          locationId: draggedClass.locationId,
          coachIds: draggedClass.coachIds,
          date: dateStr,
          startTime: time,
          endTime: newEndTime,
          maxCapacity: draggedClass.maxCapacity,
        });
        await cancelClass.mutateAsync({ id: draggedClass.id });
        invalidateClasses();
        toast(`${draggedClass.classType.name} → ${dateStr} ${time}`, "success");
      } catch {
        invalidateClasses();
        toast(t("ui.error"), "error");
      }
    },
    [draggedClassId, weekClasses, createClass, cancelClass, invalidateClasses, toast, t]
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

        {/* Week Navigation + Copy/Paste */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyWeek}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              copiedClasses
                ? "border-vytal-green/30 bg-vytal-green/10 text-vytal-green"
                : "border-vytal-border text-vytal-muted hover:bg-vytal-bg3 hover:text-vytal-text"
            )}
          >
            <Copy className="h-3.5 w-3.5" />
            {copiedClasses ? t("calendar.copied") : t("quickAction.copyWeek")}
          </button>
          {copiedClasses && !showPastePreview && (
            <button
              onClick={handlePasteWeek}
              className="flex items-center gap-1.5 rounded-lg border border-vytal-amber/30 bg-vytal-amber/10 px-3 py-1.5 text-xs font-medium text-vytal-amber transition-colors hover:bg-vytal-amber/20"
            >
              <ClipboardPaste className="h-3.5 w-3.5" />
              {t("calendar.pasteWeek")}
            </button>
          )}
          {showPastePreview && (
            <>
              <button
                onClick={() => void handleConfirmPaste()}
                disabled={createClass.isPending}
                className="flex items-center gap-1.5 rounded-lg bg-vytal-green px-3 py-1.5 text-xs font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
                {t("calendar.confirmPaste")}
              </button>
              <button
                onClick={handleCancelPaste}
                className="flex items-center gap-1.5 rounded-lg border border-vytal-red/30 bg-vytal-red/10 px-3 py-1.5 text-xs font-medium text-vytal-red transition-colors hover:bg-vytal-red/20"
              >
                <X className="h-3.5 w-3.5" />
                {t("action.cancel")}
              </button>
            </>
          )}
          <div className="mx-1 h-5 w-px bg-vytal-border" />
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
      {listQuery.isError ? (
        <EmptyState
          icon={AlertTriangle}
          title={t("ui.error")}
          description={t("classes.loadError")}
          action={{ label: t("billing.retry"), onClick: () => void listQuery.refetch() }}
        />
      ) : isPending ? (
        <div className="space-y-2 rounded-xl border border-vytal-border bg-vytal-card p-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
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
                      onDrop={(e) => void handleDrop(e, dateStr, time)}
                    >
                      <div className="space-y-1">
                        {classes.map((cls) => (
                          <ClassBlock
                            key={cls.id}
                            cls={cls}
                            isDragging={draggedClassId === cls.id}
                            onDragStart={(e) => handleDragStart(e, cls.id)}
                            isPastePreview={pastedIds.has(cls.id)}
                            onClick={() => {
                              if (!pastedIds.has(cls.id)) {
                                setSelectedClass(cls);
                              }
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
      )}

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
          deletePending={cancelClass.isPending}
        />
      )}

      {/* Create class modal */}
      {createModal && classTypes.length > 0 && locations.length > 0 && (
        <CreateClassModal
          date={createModal.date}
          time={createModal.time}
          classTypes={classTypes}
          coaches={coaches}
          locations={locations}
          onClose={() => setCreateModal(null)}
          onCreate={handleCreate}
          createPending={createClass.isPending}
        />
      )}
    </div>
  );
}
