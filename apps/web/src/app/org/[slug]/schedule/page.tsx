"use client";

import { use, useState } from "react";
import { CalendarDays, Clock, Users, Lock } from "lucide-react";
import { MOCK_ORGS } from "../org-data";
import Link from "next/link";

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const DAYS_SHORT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

// All distinct class types for the legend
function getClassTypes(slug: string) {
  const org = MOCK_ORGS[slug];
  if (!org) return [];
  const seen = new Map<string, string>();
  for (const c of org.weeklyClasses) {
    if (!seen.has(c.name)) seen.set(c.name, c.color);
  }
  return Array.from(seen.entries()).map(([name, color]) => ({ name, color }));
}

function BookModal({ onClose, className }: { onClose: () => void; className: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-vytal-border bg-vytal-card p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-vytal-green/10">
          <Lock className="h-6 w-6 text-vytal-green" />
        </div>
        <h3 className="text-lg font-bold text-vytal-text">Reservar Aula</h3>
        <p className="mt-1 text-sm text-vytal-muted">
          Para reservar <span className="font-medium text-vytal-text">{className}</span>, é necessário ter uma conta.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/login"
            className="flex w-full items-center justify-center rounded-lg bg-vytal-green py-2.5 text-sm font-semibold text-vytal-bg hover:bg-vytal-green/90"
          >
            Entrar na conta
          </Link>
          <button
            onClick={onClose}
            className="flex w-full items-center justify-center rounded-lg border border-vytal-border py-2.5 text-sm font-medium text-vytal-muted hover:text-vytal-text"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SchedulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const org = MOCK_ORGS[slug];
  const [activeDay, setActiveDay] = useState(0); // 0=Mon default
  const [bookingClass, setBookingClass] = useState<string | null>(null);

  if (!org) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-vytal-muted">Organização não encontrada</p>
      </div>
    );
  }

  const classTypes = getClassTypes(slug);
  const dayClasses = org.weeklyClasses
    .filter((c) => c.day === activeDay)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <>
      {bookingClass && (
        <BookModal className={bookingClass} onClose={() => setBookingClass(null)} />
      )}

      {/* Page header */}
      <section className="border-b border-vytal-border bg-vytal-bg2">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vytal-green/10">
              <CalendarDays className="h-5 w-5 text-vytal-green" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-vytal-text">Horário de Aulas</h1>
              <p className="text-sm text-vytal-muted">{org.name} · {org.stats.classes} aulas/semana</p>
            </div>
          </div>
        </div>
      </section>

      {/* Day selector */}
      <section className="sticky top-[113px] z-10 border-b border-vytal-border bg-vytal-bg2/95 backdrop-blur-sm md:top-[57px]">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex gap-0.5 overflow-x-auto py-2">
            {DAYS.map((day, idx) => {
              const count = org.weeklyClasses.filter((c) => c.day === idx).length;
              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(idx)}
                  className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-4 py-2 text-xs transition-colors ${
                    activeDay === idx
                      ? "bg-vytal-green/10 text-vytal-green font-semibold"
                      : "text-vytal-muted hover:text-vytal-text hover:bg-vytal-bg3"
                  }`}
                >
                  <span className="hidden sm:block">{day}</span>
                  <span className="sm:hidden">{DAYS_SHORT[idx]}</span>
                  {count > 0 && (
                    <span className={`text-[10px] ${activeDay === idx ? "text-vytal-green/70" : "text-vytal-muted/50"}`}>
                      {count} aulas
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Class list */}
      <section className="mx-auto max-w-5xl px-6 py-8">
        {dayClasses.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-vytal-border bg-vytal-card">
            <CalendarDays className="h-10 w-10 text-vytal-muted/30" />
            <p className="mt-3 text-sm text-vytal-muted">Sem aulas programadas para {DAYS[activeDay]}</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dayClasses.map((cls) => {
              const isFull = cls.spotsLeft === 0;
              const isAlmostFull = cls.spotsLeft > 0 && cls.spotsLeft <= 3;
              return (
                <div
                  key={cls.id}
                  className={`group relative rounded-xl border bg-vytal-card p-4 transition-all hover:shadow-sm ${cls.color}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{cls.name}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs opacity-80">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {cls.time} · {cls.duration}min
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs opacity-70">{cls.coach}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="flex items-center gap-1 text-xs opacity-70">
                        <Users className="h-3 w-3" />
                        <span>
                          {isFull ? (
                            <span className="font-semibold text-red-400">Cheio</span>
                          ) : (
                            <span className={isAlmostFull ? "font-semibold text-amber-400" : ""}>
                              {cls.spotsLeft}/{cls.spots}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Spots bar */}
                  <div className="mt-3 h-1 w-full rounded-full bg-black/10">
                    <div
                      className="h-full rounded-full bg-current opacity-40"
                      style={{ width: `${((cls.spots - cls.spotsLeft) / cls.spots) * 100}%` }}
                    />
                  </div>

                  <button
                    onClick={() => setBookingClass(cls.name)}
                    disabled={isFull}
                    className={`mt-3 w-full rounded-lg py-2 text-xs font-semibold transition-colors ${
                      isFull
                        ? "cursor-not-allowed bg-black/10 opacity-50"
                        : "bg-current/10 hover:bg-current/20"
                    }`}
                  >
                    {isFull ? "Lista de Espera" : "Reservar"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Legend */}
      {classTypes.length > 0 && (
        <section className="border-t border-vytal-border">
          <div className="mx-auto max-w-5xl px-6 py-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-vytal-muted">Tipos de Aula</p>
            <div className="flex flex-wrap gap-2">
              {classTypes.map(({ name, color }) => (
                <span
                  key={name}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${color}`}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Opening hours info */}
      <section className="border-t border-vytal-border bg-vytal-bg2">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-vytal-muted">Horário de Funcionamento</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {org.schedule.map((s) => (
              <div key={s.day} className="flex items-center justify-between rounded-lg border border-vytal-border bg-vytal-card px-4 py-2.5">
                <span className="text-sm text-vytal-text">{s.day}</span>
                <span className="text-sm font-medium text-vytal-muted">{s.hours}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
