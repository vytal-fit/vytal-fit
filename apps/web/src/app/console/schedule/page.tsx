"use client";

import { useEffect, useState } from "react";
import { Clock, Users, MapPin, CheckCircle, X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataStore } from "@/stores/data-store";
import type { Class } from "@vytal-fit/shared";

const DAYS_TO_SHOW = 7;

function getDaysArray(): { date: string; label: string; short: string }[] {
  const days = [];
  for (let i = 0; i < DAYS_TO_SHOW; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const date = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "short" });
    const short = i === 0 ? "Hoje" : d.toLocaleDateString("pt-PT", { weekday: "short" });
    days.push({ date, label, short });
  }
  return days;
}

// Persistent bookings in localStorage (demo)
const BOOKINGS_KEY = "vytal-console-bookings";

function loadBookings(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveBookings(set: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify([...set]));
}

export default function SchedulePage() {
  const { classes, classTypes } = useDataStore();
  const [mounted, setMounted] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [filterTypeId, setFilterTypeId] = useState<string>("all");
  const [bookings, setBookings] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const days = getDaysArray();

  useEffect(() => {
    setBookings(loadBookings());
    setMounted(true);
  }, []);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function toggleBooking(cls: Class) {
    const next = new Set(bookings);
    if (next.has(cls.id)) {
      next.delete(cls.id);
      showToast(`Reserva cancelada: ${cls.classType?.name ?? "Aula"}`, "error");
    } else {
      if (cls.enrolledCount >= cls.maxCapacity) {
        showToast("Adicionado a lista de espera!", "success");
      } else {
        showToast(`Reserva confirmada: ${cls.classType?.name ?? "Aula"} as ${cls.startTime}`, "success");
      }
      next.add(cls.id);
    }
    setBookings(next);
    saveBookings(next);
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="w-6 h-6 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--color-vytal-green)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  const selectedDate = days[selectedDay]?.date ?? "";
  const dayClasses = (classes ?? [])
    .filter((c) => c.date === selectedDate)
    .filter((c) => filterTypeId === "all" || c.classTypeId === filterTypeId)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const myBookedIds = dayClasses.filter((c) => bookings.has(c.id));

  return (
    <div className="flex flex-col min-h-full">
      <h1 className="sr-only">Horário</h1>
      {/* Toast */}
      {toast && (
        <div
          className={cn(
            "fixed top-16 left-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-xl transition-all",
            toast.type === "success"
              ? "text-[#080c0a]"
              : "text-white"
          )}
          style={{
            background: toast.type === "success" ? "var(--color-vytal-green)" : "var(--color-vytal-red)",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Day selector */}
      <div
        className="sticky top-14 z-30 px-4 py-3 border-b overflow-x-auto"
        style={{ background: "var(--color-vytal-bg2)", borderColor: "var(--color-vytal-border)" }}
      >
        <div className="flex gap-2 min-w-max">
          {days.map((day, i) => (
            <button
              key={day.date}
              onClick={() => setSelectedDay(i)}
              className={cn(
                "flex flex-col items-center px-3 py-2 rounded-lg text-xs font-medium transition-all min-w-[52px]",
                selectedDay === i ? "text-[#080c0a]" : ""
              )}
              style={{
                background: selectedDay === i ? "var(--color-vytal-green)" : "var(--color-vytal-bg3)",
                color: selectedDay === i ? "#080c0a" : "var(--color-vytal-muted)",
              }}
            >
              <span className="font-semibold capitalize">{day.short}</span>
              <span className="text-[10px] opacity-75">
                {new Date(day.date + "T12:00:00").getDate()}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto w-full">
        {/* My bookings for today */}
        {myBookedIds.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-vytal-muted)" }}>
              As minhas reservas hoje
            </p>
            {myBookedIds.map((cls) => (
              <div
                key={cls.id}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.25)",
                }}
              >
                <CheckCircle size={16} style={{ color: "var(--color-vytal-green)" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--color-vytal-text)" }}>
                    {cls.classType?.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-vytal-muted)" }}>
                    {cls.startTime} – {cls.endTime} · {cls.location?.name}
                  </p>
                </div>
                <button
                  onClick={() => toggleBooking(cls)}
                  className="p-1 rounded-lg transition-opacity hover:opacity-70"
                  title="Cancelar reserva"
                >
                  <X size={14} style={{ color: "var(--color-vytal-red)" }} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Filter by class type */}
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: "var(--color-vytal-muted)" }} />
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setFilterTypeId("all")}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all"
              )}
              style={{
                background: filterTypeId === "all" ? "var(--color-vytal-green)" : "var(--color-vytal-bg3)",
                color: filterTypeId === "all" ? "#080c0a" : "var(--color-vytal-muted)",
              }}
            >
              Todas
            </button>
            {(classTypes ?? []).filter((ct) => ct.active).map((ct) => (
              <button
                key={ct.id}
                onClick={() => setFilterTypeId(ct.id)}
                className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all"
                style={{
                  background: filterTypeId === ct.id
                    ? (ct.color ?? "var(--color-vytal-green)")
                    : "var(--color-vytal-bg3)",
                  color: filterTypeId === ct.id ? "#080c0a" : "var(--color-vytal-muted)",
                }}
              >
                {ct.abbreviation}
              </button>
            ))}
          </div>
        </div>

        {/* Class list */}
        {dayClasses.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
          >
            <p className="text-sm" style={{ color: "var(--color-vytal-muted)" }}>
              Sem aulas para este dia.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayClasses.map((cls) => {
              const isBooked = bookings.has(cls.id);
              const isFull = cls.enrolledCount >= cls.maxCapacity;
              const spotsLeft = cls.maxCapacity - cls.enrolledCount;
              const fillPct = Math.round((cls.enrolledCount / cls.maxCapacity) * 100);

              return (
                <div
                  key={cls.id}
                  className="rounded-xl p-4 space-y-3"
                  style={{
                    background: "var(--color-vytal-bg2)",
                    border: isBooked
                      ? "1px solid rgba(34,197,94,0.4)"
                      : "1px solid var(--color-vytal-border)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-bold"
                          style={{
                            background: cls.classType?.color
                              ? `${cls.classType.color}22`
                              : "rgba(34,197,94,0.12)",
                            color: cls.classType?.color ?? "var(--color-vytal-green)",
                          }}
                        >
                          {cls.classType?.abbreviation ?? "?"}
                        </span>
                        <span className="font-semibold text-sm" style={{ color: "var(--color-vytal-text)" }}>
                          {cls.classType?.name}
                        </span>
                        {isBooked && (
                          <CheckCircle size={14} style={{ color: "var(--color-vytal-green)" }} />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-vytal-muted)" }}>
                          <Clock size={11} />
                          {cls.startTime} – {cls.endTime}
                        </span>
                        <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-vytal-muted)" }}>
                          <MapPin size={11} />
                          {cls.location?.name}
                        </span>
                        <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-vytal-muted)" }}>
                          <Users size={11} />
                          {cls.enrolledCount}/{cls.maxCapacity}
                          {cls.waitlistCount > 0 && ` (${cls.waitlistCount} espera)`}
                        </span>
                      </div>
                      {cls.coaches?.length > 0 && (
                        <p className="text-xs mt-1" style={{ color: "var(--color-vytal-muted)" }}>
                          Coach: {cls.coaches.map((co) => co.name).join(", ")}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => toggleBooking(cls)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 transition-all hover:opacity-90"
                      )}
                      style={{
                        background: isBooked
                          ? "rgba(255,71,87,0.15)"
                          : isFull
                          ? "var(--color-vytal-bg3)"
                          : "var(--color-vytal-green)",
                        color: isBooked
                          ? "var(--color-vytal-red)"
                          : isFull
                          ? "var(--color-vytal-muted)"
                          : "#080c0a",
                      }}
                    >
                      {isBooked ? "Cancelar" : isFull ? "Espera" : "Reservar"}
                    </button>
                  </div>

                  {/* Capacity bar */}
                  <div className="space-y-1">
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ background: "var(--color-vytal-bg3)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${fillPct}%`,
                          background: fillPct >= 100
                            ? "var(--color-vytal-red)"
                            : fillPct >= 80
                            ? "var(--color-vytal-amber)"
                            : "var(--color-vytal-green)",
                        }}
                      />
                    </div>
                    <p className="text-[10px]" style={{ color: "var(--color-vytal-muted)" }}>
                      {isFull ? "Lotado" : `${spotsLeft} lugar${spotsLeft !== 1 ? "es" : ""} disponivel${spotsLeft !== 1 ? "is" : ""}`}
                    </p>
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
