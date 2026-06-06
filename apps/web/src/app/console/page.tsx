"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Dumbbell, Trophy, Flame, CheckCircle, ArrowRight, Clock, Users, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useDataStore } from "@/stores/data-store";

export default function ConsolePage() {
  const { user, hydrate } = useAuthStore();
  const { classes, wods, personalRecords, members } = useDataStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--color-vytal-green)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  const firstName = user?.user?.name?.split(" ")[0] ?? "Atleta";

  // Find mock member data (first member = "the logged in member" for demo)
  const member = members?.[0];
  const streakWeeks = member?.streakWeeks ?? 8;
  const totalCheckIns = member?.totalCheckIns ?? 142;

  // Today's classes
  const today = new Date().toISOString().split("T")[0];
  const todayClasses = (classes ?? []).filter((c) => c.date === today);

  // Next upcoming class
  const now = new Date();
  const nowTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const nextClass = todayClasses.find((c) => c.startTime >= nowTime) ?? todayClasses[0];

  // Today's WOD
  const todayWOD = (wods ?? []).find((w) => w.date === today);

  // Quick stat for PRs
  const prCount = (personalRecords ?? []).length;

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
      {/* Greeting */}
      <div>
        <p className="text-sm" style={{ color: "var(--color-vytal-muted)" }}>
          Bem-vindo de volta,
        </p>
        <h1 className="text-2xl font-bold mt-0.5" style={{ color: "var(--color-vytal-text)" }}>
          {firstName}
        </h1>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        <div
          className="rounded-xl p-3 flex flex-col items-center gap-1"
          style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
        >
          <Flame size={18} style={{ color: "var(--color-vytal-amber)" }} />
          <span className="text-lg font-bold" style={{ color: "var(--color-vytal-text)" }}>
            {streakWeeks}
          </span>
          <span className="text-[10px] text-center leading-tight" style={{ color: "var(--color-vytal-muted)" }}>
            semanas seguidas
          </span>
        </div>
        <div
          className="rounded-xl p-3 flex flex-col items-center gap-1"
          style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
        >
          <CheckCircle size={18} style={{ color: "var(--color-vytal-green)" }} />
          <span className="text-lg font-bold" style={{ color: "var(--color-vytal-text)" }}>
            {totalCheckIns}
          </span>
          <span className="text-[10px] text-center leading-tight" style={{ color: "var(--color-vytal-muted)" }}>
            check-ins totais
          </span>
        </div>
        <div
          className="rounded-xl p-3 flex flex-col items-center gap-1"
          style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
        >
          <Trophy size={18} style={{ color: "var(--color-vytal-purple)" }} />
          <span className="text-lg font-bold" style={{ color: "var(--color-vytal-text)" }}>
            {prCount}
          </span>
          <span className="text-[10px] text-center leading-tight" style={{ color: "var(--color-vytal-muted)" }}>
            recordes pessoais
          </span>
        </div>
      </div>

      {/* Next class card */}
      {nextClass ? (
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-vytal-muted)" }}>
              Proxima aula
            </span>
            <Link
              href="/console/schedule"
              className="text-xs flex items-center gap-1 transition-opacity hover:opacity-80"
              style={{ color: "var(--color-vytal-green)" }}
            >
              Ver todas
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="px-2 py-0.5 rounded text-xs font-bold"
                  style={{
                    background: nextClass.classType?.color
                      ? `${nextClass.classType.color}22`
                      : "rgba(34,197,94,0.12)",
                    color: nextClass.classType?.color ?? "var(--color-vytal-green)",
                  }}
                >
                  {nextClass.classType?.abbreviation ?? "CF"}
                </span>
                <span className="font-semibold text-sm" style={{ color: "var(--color-vytal-text)" }}>
                  {nextClass.classType?.name ?? "CrossFit"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-vytal-muted)" }}>
                  <Clock size={12} />
                  {nextClass.startTime} – {nextClass.endTime}
                </div>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-vytal-muted)" }}>
                  <MapPin size={12} />
                  {nextClass.location?.name ?? "Box principal"}
                </div>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-vytal-muted)" }}>
                  <Users size={12} />
                  {nextClass.enrolledCount}/{nextClass.maxCapacity} atletas
                </div>
              </div>
            </div>
            <Link
              href="/console/schedule"
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-90",
                nextClass.enrolledCount >= nextClass.maxCapacity
                  ? "opacity-60 cursor-not-allowed"
                  : ""
              )}
              style={{
                background: nextClass.enrolledCount >= nextClass.maxCapacity
                  ? "var(--color-vytal-bg3)"
                  : "var(--color-vytal-green)",
                color: nextClass.enrolledCount >= nextClass.maxCapacity
                  ? "var(--color-vytal-muted)"
                  : "#080c0a",
              }}
            >
              {nextClass.enrolledCount >= nextClass.maxCapacity ? "Lista espera" : "Reservar"}
            </Link>
          </div>
        </div>
      ) : (
        <div
          className="rounded-xl p-4 text-center"
          style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
        >
          <Calendar size={24} className="mx-auto mb-2 opacity-40" style={{ color: "var(--color-vytal-muted)" }} />
          <p className="text-sm" style={{ color: "var(--color-vytal-muted)" }}>
            Sem aulas hoje. Descansa bem!
          </p>
        </div>
      )}

      {/* Today's WOD preview */}
      {todayWOD ? (
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-vytal-muted)" }}>
              WOD de hoje
            </span>
            <Link
              href="/console/wod"
              className="text-xs flex items-center gap-1 transition-opacity hover:opacity-80"
              style={{ color: "var(--color-vytal-green)" }}
            >
              Ver detalhes
              <ArrowRight size={12} />
            </Link>
          </div>

          <div>
            <h3 className="font-bold text-lg" style={{ color: "var(--color-vytal-green)" }}>
              {todayWOD.title ?? "WOD do Dia"}
            </h3>
            {todayWOD.description && (
              <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--color-vytal-muted)" }}>
                {todayWOD.description}
              </p>
            )}
            {todayWOD.parts?.length > 0 && (
              <div className="mt-3 space-y-1">
                {todayWOD.parts.slice(0, 3).map((part, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs" style={{ color: "var(--color-vytal-text)" }}>
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: "var(--color-vytal-green)" }}
                    />
                    <span className="font-medium">{part.name}</span>
                    <span style={{ color: "var(--color-vytal-muted)" }}>
                      — {part.exercises.slice(0, 2).map((e) => e.exercise?.name).filter(Boolean).join(", ")}
                      {part.exercises.length > 2 ? ` +${part.exercises.length - 2}` : ""}
                    </span>
                  </div>
                ))}
                {todayWOD.parts.length > 3 && (
                  <p className="text-xs" style={{ color: "var(--color-vytal-muted)" }}>
                    +{todayWOD.parts.length - 3} partes
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          className="rounded-xl p-4 text-center"
          style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
        >
          <Dumbbell size={24} className="mx-auto mb-2 opacity-40" style={{ color: "var(--color-vytal-muted)" }} />
          <p className="text-sm" style={{ color: "var(--color-vytal-muted)" }}>
            WOD ainda nao publicado para hoje.
          </p>
        </div>
      )}

      {/* Quick actions */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-vytal-muted)" }}>
          Acoes rapidas
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { href: "/console/schedule", icon: Calendar, label: "Reservar aula" },
            { href: "/console/wod", icon: Dumbbell, label: "Ver WOD" },
            { href: "/console/records", icon: Trophy, label: "Os meus PRs" },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="rounded-xl p-3 flex flex-col items-center gap-2 transition-all hover:scale-[1.02]"
                style={{ background: "var(--color-vytal-bg3)", border: "1px solid var(--color-vytal-border)" }}
              >
                <Icon size={20} style={{ color: "var(--color-vytal-green)" }} />
                <span className="text-[10px] text-center font-medium leading-tight" style={{ color: "var(--color-vytal-text)" }}>
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
