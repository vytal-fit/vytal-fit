"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Maximize,
  RefreshCw,
  Trophy,
  Clock,
  Flame,
  CalendarDays,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { rowsToWODs } from "@/lib/wod-mapper";
import { rowsToExercises } from "@/lib/reference-mappers";

// ---- Mock leaderboard data ----

const mockScreenLeaderboard = [
  { rank: 1, name: "Pedro Almeida", score: "3:42", scale: "Rx", isPR: true },
  { rank: 2, name: "Ana Silva", score: "4:01", scale: "Rx", isPR: false },
  { rank: 3, name: "Miguel Costa", score: "4:15", scale: "Rx", isPR: true },
  { rank: 4, name: "Sofia Santos", score: "4:28", scale: "Rx", isPR: false },
  { rank: 5, name: "Tiago Neves", score: "4:45", scale: "Scaled", isPR: false },
  { rank: 6, name: "Ines Ferreira", score: "5:02", scale: "Rx", isPR: false },
  { rank: 7, name: "Jose Fonte", score: "5:18", scale: "Rx", isPR: true },
  { rank: 8, name: "Maria Oliveira", score: "5:33", scale: "Scaled", isPR: false },
  { rank: 9, name: "Rui Martins", score: "5:51", scale: "Rx", isPR: false },
  { rank: 10, name: "Clara Rodrigues", score: "6:12", scale: "Scaled", isPR: false },
];

const mockScheduleTicker = [
  { time: "07:00", name: "CrossFit", coach: "Coach Pedro", spots: "2/16" },
  { time: "08:00", name: "Open Box", coach: "Coach Ana", spots: "5/20" },
  { time: "09:30", name: "CrossFit", coach: "Coach Miguel", spots: "0/16" },
  { time: "12:00", name: "CrossFit", coach: "Coach Pedro", spots: "8/16" },
  { time: "17:00", name: "CrossFit", coach: "Coach Ana", spots: "3/16" },
  { time: "18:00", name: "CrossFit", coach: "Coach Miguel", spots: "1/16" },
  { time: "19:00", name: "CrossFit", coach: "Coach Pedro", spots: "4/16" },
  { time: "20:00", name: "Open Box", coach: "Coach Ana", spots: "12/20" },
];

export default function ScreenPage() {
  const wodsQuery = trpc.wods.list.useQuery({});
  const exercisesQuery = trpc.exercises.list.useQuery({});
  const settingsQuery = trpc.orgSettings.get.useQuery();
  const wods = useMemo(() => {
    const exercisesById = new Map(
      rowsToExercises(exercisesQuery.data ?? []).map((ex) => [ex.id, ex]),
    );
    return rowsToWODs(wodsQuery.data ?? [], exercisesById);
  }, [wodsQuery.data, exercisesQuery.data]);
  const orgSettings = { name: settingsQuery.data?.name ?? "" };

  const [clock, setClock] = useState(new Date());
  const [, setLastRefresh] = useState(new Date());

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-refresh every 30s
  useEffect(() => {
    const timer = setInterval(() => setLastRefresh(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const handleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  // Get today's WOD
  const today = new Date().toISOString().split("T")[0];
  const todayWod = wods.find((w) => w.date === today) ?? wods[0];

  const formatTime = (d: Date) =>
    `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;

  const formatDate = (d: Date) =>
    d.toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050805] text-white overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/40 border-b border-white/5">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-white/40 transition-colors hover:bg-white/5 hover:text-white/70"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Admin
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-sm font-bold text-vytal-green">{orgSettings.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <RefreshCw className="h-3 w-3" />
            <span>Auto-refresh 30s</span>
          </div>
          <button
            onClick={handleFullscreen}
            className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Maximize className="h-3.5 w-3.5" />
            Fullscreen
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left 60% - WOD */}
        <div className="flex-[3] flex flex-col border-r border-white/5 p-8 overflow-y-auto">
          {/* Date */}
          <p className="mb-2 text-sm uppercase tracking-widest text-white/30">
            {formatDate(clock)}
          </p>

          {todayWod ? (
            <>
              {/* WOD Title */}
              <div className="mb-6 flex items-center gap-4">
                <Flame className="h-8 w-8 text-vytal-green" />
                <div>
                  <h1 className="text-4xl font-black tracking-tight text-white">
                    {todayWod.title ?? "WOD"}
                  </h1>
                  {todayWod.description && (
                    <p className="mt-1 text-lg text-white/40">{todayWod.description}</p>
                  )}
                </div>
              </div>

              {/* WOD Parts */}
              <div className="space-y-6">
                {todayWod.parts.map((part, pi) => (
                  <div key={pi} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <span className="rounded-lg bg-vytal-green/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-vytal-green">
                        {part.name}
                      </span>
                      <span className="text-xs uppercase text-white/30">
                        {part.type.replace(/_/g, " ")}
                      </span>
                      {part.timeCap && (
                        <span className="flex items-center gap-1 text-xs text-vytal-amber">
                          <Clock className="h-3 w-3" />
                          {part.timeCap} min cap
                        </span>
                      )}
                      {part.rounds && (
                        <span className="text-xs text-vytal-blue">
                          {part.rounds} rounds
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      {part.exercises.map((ex, ei) => (
                        <div
                          key={ei}
                          className="flex items-baseline gap-4 text-xl"
                        >
                          <span className="font-mono font-bold text-vytal-green min-w-[80px] text-right">
                            {ex.reps ?? ""}
                          </span>
                          <span className="font-semibold text-white">
                            {ex.exercise.name}
                          </span>
                          {ex.weight && (
                            <span className="text-base text-white/40">
                              @ {ex.weight}
                            </span>
                          )}
                          {ex.notes && (
                            <span className="text-sm italic text-white/20">
                              ({ex.notes})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-white/20">
              <Flame className="h-16 w-16" />
              <p className="text-2xl font-bold">No WOD published today</p>
              <p className="text-sm">Check back later</p>
            </div>
          )}
        </div>

        {/* Right 40% - Leaderboard */}
        <div className="flex-[2] flex flex-col bg-black/20 p-8 overflow-y-auto">
          <div className="mb-6 flex items-center gap-3">
            <Trophy className="h-6 w-6 text-vytal-amber" />
            <h2 className="text-2xl font-black tracking-tight text-white">
              Leaderboard
            </h2>
          </div>

          {todayWod?.title && (
            <p className="mb-4 text-sm text-white/30">
              Top 10 &mdash; {todayWod.title}
            </p>
          )}

          <div className="space-y-2">
            {mockScreenLeaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-4 rounded-xl px-4 py-3 transition-colors ${
                  entry.rank <= 3
                    ? "bg-white/[0.04] border border-white/5"
                    : "bg-transparent"
                }`}
              >
                {/* Rank */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-black ${
                    entry.rank === 1
                      ? "bg-vytal-amber/20 text-vytal-amber"
                      : entry.rank === 2
                        ? "bg-white/10 text-white/60"
                        : entry.rank === 3
                          ? "bg-vytal-orange/20 text-vytal-orange"
                          : "text-white/20"
                  }`}
                >
                  {entry.rank}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-white truncate">
                    {entry.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        entry.scale === "Rx"
                          ? "text-vytal-green"
                          : "text-vytal-blue"
                      }`}
                    >
                      {entry.scale}
                    </span>
                    {entry.isPR && (
                      <span className="rounded-full bg-vytal-amber/10 px-2 py-0.5 text-[10px] font-bold text-vytal-amber">
                        PR!
                      </span>
                    )}
                  </div>
                </div>

                {/* Score */}
                <span className="font-mono text-xl font-bold text-white">
                  {entry.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between border-t border-white/5 bg-black/60 px-6 py-3">
        {/* Clock */}
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-vytal-green" />
          <span className="font-mono text-2xl font-bold text-white tracking-wider">
            {formatTime(clock)}
          </span>
        </div>

        {/* Schedule ticker */}
        <div className="flex items-center gap-2 overflow-hidden">
          <CalendarDays className="h-4 w-4 shrink-0 text-white/30" />
          <div className="flex items-center gap-4 overflow-x-auto">
            {mockScheduleTicker.map((cls, i) => {
              const now = clock;
              const [h, m] = cls.time.split(":").map(Number);
              const isPast =
                now.getHours() > h || (now.getHours() === h && now.getMinutes() >= (m + 60));
              const isNow =
                now.getHours() === h ||
                (now.getHours() === h - 1 && now.getMinutes() >= 30);

              return (
                <div
                  key={i}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-1 text-xs ${
                    isNow
                      ? "bg-vytal-green/10 text-vytal-green font-bold"
                      : isPast
                        ? "text-white/15"
                        : "text-white/40"
                  }`}
                >
                  <span className="font-mono font-bold">{cls.time}</span>
                  <span>{cls.name}</span>
                  <span className="text-white/20">{cls.spots}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
