"use client";

import { useEffect, useState } from "react";
import { Clock, Users, MapPin, CheckCircle, X, Star, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";

const DAYS_TO_SHOW = 7;

function getDaysArray(): { date: string; dayNum: string; short: string; isToday: boolean }[] {
  const days = [];
  for (let i = 0; i < DAYS_TO_SHOW; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const date = d.toISOString().split("T")[0];
    const short = d.toLocaleDateString("pt-PT", { weekday: "short" });
    const dayNum = String(d.getDate()).padStart(2, "0");
    days.push({ date, short, dayNum, isToday: i === 0 });
  }
  return days;
}

export default function SchedulePage() {
  const { t } = useI18n();
  const utils = trpc.useUtils();
  const days = getDaysArray();
  const from = days[0]?.date ?? "";
  const to = days[days.length - 1]?.date ?? "";

  const meQuery = trpc.members.me.useQuery();
  const memberId = meQuery.data?.id ?? null;
  const scheduleQuery = trpc.classes.schedule.useQuery({ from, to }, { enabled: !!from });
  const classTypesQuery = trpc.classTypes.list.useQuery();
  const bookingsQuery = trpc.bookings.listByMember.useQuery(
    { memberId: memberId ?? "" },
    { enabled: !!memberId },
  );

  const [mounted, setMounted] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [filterTypeId, setFilterTypeId] = useState<string>("all");
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // The member's bookings (classId → bookingId), excluding cancelled.
  const activeBookings = (bookingsQuery.data ?? []).filter((b) => b.status !== "cancelled");
  const bookedIds = new Set(activeBookings.map((b) => b.classId));
  const bookingIdByClass = new Map(activeBookings.map((b) => [b.classId, b.id] as const));

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const book = trpc.bookings.book.useMutation({
    onSuccess: () => utils.bookings.listByMember.invalidate(),
  });
  const cancel = trpc.bookings.cancel.useMutation({
    onSuccess: () => utils.bookings.listByMember.invalidate(),
  });

  function toggleBooking(cls: {
    id: string;
    classType: { name: string } | null;
    enrolledCount: number;
    maxCapacity: number;
    startTime: string;
  }) {
    if (!memberId) return;
    setAnimatingId(cls.id);
    setTimeout(() => setAnimatingId(null), 600);

    if (bookedIds.has(cls.id)) {
      const bookingId = bookingIdByClass.get(cls.id);
      if (bookingId) cancel.mutate({ id: bookingId });
      showToast(`${t("my.schedule.toastCancelled")}: ${cls.classType?.name ?? "Aula"}`, "error");
    } else {
      book.mutate({ classId: cls.id, memberId });
      if (cls.enrolledCount >= cls.maxCapacity) {
        showToast(t("my.schedule.toastWaitlist"), "success");
      } else {
        showToast(`${t("my.schedule.toastBooked")} — ${cls.classType?.name ?? "Aula"} às ${cls.startTime}`, "success");
      }
    }
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--color-vytal-green)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  const selectedDate = days[selectedDay]?.date ?? "";
  const dayClasses = (scheduleQuery.data ?? [])
    .filter((c) => c.date === selectedDate)
    .filter((c) => filterTypeId === "all" || c.classTypeId === filterTypeId)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const myBookedIds = dayClasses.filter((c) => bookedIds.has(c.id));

  return (
    <div className="flex flex-col min-h-full">
      <h1 className="sr-only">{t("my.schedule.title")}</h1>

      {/* Toast */}
      {toast && (
        <div
          className={cn(
            "fixed top-20 left-4 right-4 z-50 rounded-2xl px-4 py-3 text-sm font-semibold shadow-2xl animate-slide-in-right flex items-center gap-2"
          )}
          style={{
            background: toast.type === "success" ? "var(--color-vytal-green)" : "var(--color-vytal-red)",
            color: toast.type === "success" ? "var(--color-vytal-bg)" : "#fff",
          }}
        >
          {toast.type === "success" ? <CheckCircle size={16} /> : <X size={16} />}
          {toast.msg}
        </div>
      )}

      {/* ── Day selector ── */}
      <div
        className="sticky top-16 z-30 px-4 py-3"
        style={{
          background: "color-mix(in srgb, var(--color-vytal-bg) 90%, transparent)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--color-vytal-border)",
        }}
      >
        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((day, i) => {
            const isSelected = selectedDay === i;
            return (
              <button
                key={day.date}
                onClick={() => setSelectedDay(i)}
                className="flex flex-col items-center px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 min-w-[52px] shrink-0 hover:scale-105"
                style={{
                  background: isSelected
                    ? "var(--color-vytal-green)"
                    : day.isToday
                    ? "rgba(34,197,94,0.1)"
                    : "var(--color-vytal-bg3)",
                  color: isSelected ? "var(--color-vytal-bg)" : "var(--color-vytal-muted)",
                  border: isSelected
                    ? "1px solid var(--color-vytal-green)"
                    : day.isToday
                    ? "1px solid rgba(34,197,94,0.3)"
                    : "1px solid transparent",
                }}
              >
                <span className="font-black text-sm capitalize">{day.isToday ? t("my.schedule.today") : day.short}</span>
                <span className="text-[10px] font-bold mt-0.5 opacity-60">{day.dayNum}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto w-full">

        {/* ── My bookings highlight ── */}
        {myBookedIds.length > 0 && (
          <div
            className="rounded-2xl p-4 space-y-2"
            style={{
              background: "linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.04) 100%)",
              border: "1px solid rgba(34,197,94,0.3)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={13} style={{ color: "var(--color-vytal-green)" }} />
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--color-vytal-green)" }}>
                {t("my.schedule.myBookings")}
              </p>
            </div>
            {myBookedIds.map((cls) => (
              <div
                key={cls.id}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                style={{ background: "rgba(34,197,94,0.08)" }}
              >
                <div
                  className="w-1 h-8 rounded-full shrink-0"
                  style={{ background: cls.classType?.color ?? "var(--color-vytal-green)" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: "var(--color-vytal-text)" }}>
                    {cls.classType?.name}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--color-vytal-muted)" }}>
                    {cls.startTime} – {cls.endTime} · {cls.location?.name}
                  </p>
                </div>
                <button
                  onClick={() => toggleBooking(cls)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{ background: "rgba(255,71,87,0.15)" }}
                  title={t("my.schedule.cancelBooking")}
                >
                  <X size={13} style={{ color: "var(--color-vytal-red)" }} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Filter pills ── */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterTypeId("all")}
            className="px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all duration-200 hover:scale-105 shrink-0"
            style={{
              background: filterTypeId === "all" ? "var(--color-vytal-green)" : "var(--color-vytal-bg3)",
              color: filterTypeId === "all" ? "var(--color-vytal-bg)" : "var(--color-vytal-muted)",
              border: filterTypeId === "all" ? "1px solid var(--color-vytal-green)" : "1px solid transparent",
            }}
          >
            {t("my.schedule.all")}
          </button>
          {(classTypesQuery.data ?? []).filter((ct) => ct.active).map((ct) => (
            <button
              key={ct.id}
              onClick={() => setFilterTypeId(ct.id)}
              className="px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all duration-200 hover:scale-105 shrink-0"
              style={{
                background: filterTypeId === ct.id
                  ? (ct.color ?? "var(--color-vytal-green)")
                  : "var(--color-vytal-bg3)",
                color: filterTypeId === ct.id ? "var(--color-vytal-bg)" : "var(--color-vytal-muted)",
                border: filterTypeId === ct.id
                  ? `1px solid ${ct.color ?? "var(--color-vytal-green)"}`
                  : "1px solid transparent",
              }}
            >
              {ct.abbreviation}
            </button>
          ))}
        </div>

        {/* ── Class list ── */}
        {dayClasses.length === 0 ? (
          <div
            className="rounded-2xl p-10 flex flex-col items-center gap-3 text-center"
            style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
          >
            <Calendar size={32} style={{ color: "var(--color-vytal-muted)", opacity: 0.3 }} />
            <p className="text-sm font-medium" style={{ color: "var(--color-vytal-muted)" }}>
              {t("my.schedule.noClasses")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayClasses.map((cls) => {
              const isBooked = bookedIds.has(cls.id);
              const isFull = cls.enrolledCount >= cls.maxCapacity;
              const spotsLeft = cls.maxCapacity - cls.enrolledCount;
              const fillPct = Math.round((cls.enrolledCount / cls.maxCapacity) * 100);
              const isAnimating = animatingId === cls.id;
              const accentColor = cls.classType?.color ?? "var(--color-vytal-green)";

              return (
                <div
                  key={cls.id}
                  className={cn(
                    "rounded-2xl overflow-hidden transition-all duration-200",
                    !isBooked && "hover:scale-[1.01]"
                  )}
                  style={{
                    background: "var(--color-vytal-bg2)",
                    border: isBooked
                      ? "1px solid rgba(34,197,94,0.4)"
                      : "1px solid var(--color-vytal-border)",
                    boxShadow: isBooked ? "0 0 24px rgba(34,197,94,0.07)" : "none",
                  }}
                >
                  <div className="flex">
                    {/* Left color stripe */}
                    <div
                      className="w-1 shrink-0"
                      style={{
                        background: isBooked
                          ? "var(--color-vytal-green)"
                          : isFull
                          ? "var(--color-vytal-red)"
                          : accentColor,
                      }}
                    />
                    <div className="flex-1 p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span
                              className="px-2 py-0.5 rounded-md text-[10px] font-black"
                              style={{
                                background: `${accentColor}22`,
                                color: accentColor,
                              }}
                            >
                              {cls.classType?.abbreviation ?? "?"}
                            </span>
                            <span className="font-bold text-sm" style={{ color: "var(--color-vytal-text)" }}>
                              {cls.classType?.name}
                            </span>
                            {isBooked && (
                              <CheckCircle size={13} style={{ color: "var(--color-vytal-green)" }} />
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-1">
                            <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--color-vytal-muted)" }}>
                              <Clock size={10} />
                              {cls.startTime} – {cls.endTime}
                            </span>
                            {cls.location?.name && (
                              <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--color-vytal-muted)" }}>
                                <MapPin size={10} />
                                {cls.location.name}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--color-vytal-muted)" }}>
                              <Users size={10} />
                              {cls.enrolledCount}/{cls.maxCapacity}
                            </span>
                          </div>
                          {cls.coaches?.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star size={10} style={{ color: "var(--color-vytal-amber)" }} />
                              <span className="text-[11px]" style={{ color: "var(--color-vytal-muted)" }}>
                                {cls.coaches.map((co) => co.name).join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => toggleBooking(cls)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all duration-200",
                            isAnimating ? "scale-95" : "hover:scale-105"
                          )}
                          style={{
                            background: isBooked
                              ? "rgba(255,71,87,0.12)"
                              : isFull
                              ? "var(--color-vytal-bg3)"
                              : "var(--color-vytal-green)",
                            color: isBooked
                              ? "var(--color-vytal-red)"
                              : isFull
                              ? "var(--color-vytal-muted)"
                              : "var(--color-vytal-bg)",
                            border: isBooked ? "1px solid rgba(255,71,87,0.2)" : "1px solid transparent",
                          }}
                        >
                          {isBooked ? t("my.schedule.cancel") : isFull ? t("my.schedule.waitlist") : t("my.schedule.book")}
                        </button>
                      </div>

                      {/* Capacity bar */}
                      <div className="space-y-1">
                        <div
                          className="h-1.5 rounded-full overflow-hidden"
                          style={{ background: "var(--color-vytal-bg3)" }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(fillPct, 100)}%`,
                              background: fillPct >= 100
                                ? "var(--color-vytal-red)"
                                : fillPct >= 80
                                ? "linear-gradient(90deg, var(--color-vytal-amber), var(--color-vytal-red))"
                                : `linear-gradient(90deg, ${accentColor}, ${accentColor}99)`,
                            }}
                          />
                        </div>
                        <p className="text-[10px]" style={{ color: "var(--color-vytal-muted)" }}>
                          {isFull
                            ? `${t("my.schedule.full")}${cls.waitlistCount > 0 ? ` · ${cls.waitlistCount} ${t("my.schedule.waiting")}` : ""}`
                            : `${spotsLeft} ${spotsLeft !== 1 ? t("my.schedule.spotsAvailable") : t("my.schedule.spotAvailable")}`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
