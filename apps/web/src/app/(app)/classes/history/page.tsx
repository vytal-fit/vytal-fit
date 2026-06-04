"use client";

import { useState, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Users,
  CalendarDays,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HistoryEntry {
  id: string;
  date: string;
  time: string;
  classType: string;
  classTypeColor: string;
  coach: string;
  location: string;
  enrolled: number;
  attended: number;
  noShows: number;
  capacity: number;
  attendees: string[];
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockHistory: HistoryEntry[] = [
  { id: "h1", date: "2026-06-04", time: "07:00", classType: "WOD", classTypeColor: "#22c55e", coach: "Ricardo Santos", location: "Main Box", enrolled: 18, attended: 17, noShows: 1, capacity: 20, attendees: ["Ana Silva", "Pedro Almeida", "Sofia Santos", "Miguel Costa", "Ines Ferreira", "Tiago Neves", "Maria Oliveira", "Jose Fonte", "Carla Mendes", "Bruno Lopes", "Rita Fernandes", "Hugo Sousa", "Diana Pereira", "Luis Martins", "Joana Costa", "Filipe Rodrigues", "Teresa Lima"] },
  { id: "h2", date: "2026-06-04", time: "09:00", classType: "Strength", classTypeColor: "#ff4757", coach: "Ana Martins", location: "Main Box", enrolled: 15, attended: 14, noShows: 1, capacity: 20, attendees: ["Pedro Almeida", "Sofia Santos", "Miguel Costa", "Ines Ferreira", "Tiago Neves", "Maria Oliveira", "Jose Fonte", "Carla Mendes", "Bruno Lopes", "Rita Fernandes", "Hugo Sousa", "Diana Pereira", "Luis Martins", "Joana Costa"] },
  { id: "h3", date: "2026-06-04", time: "12:00", classType: "WOD", classTypeColor: "#22c55e", coach: "Ricardo Santos", location: "Main Box", enrolled: 12, attended: 11, noShows: 1, capacity: 20, attendees: ["Ana Silva", "Pedro Almeida", "Sofia Santos", "Miguel Costa", "Ines Ferreira", "Tiago Neves", "Maria Oliveira", "Jose Fonte", "Carla Mendes", "Bruno Lopes", "Rita Fernandes"] },
  { id: "h4", date: "2026-06-04", time: "17:30", classType: "WOD", classTypeColor: "#22c55e", coach: "Ana Martins", location: "Main Box", enrolled: 20, attended: 19, noShows: 1, capacity: 20, attendees: ["Ana Silva", "Pedro Almeida", "Sofia Santos", "Miguel Costa", "Ines Ferreira", "Tiago Neves", "Maria Oliveira", "Jose Fonte", "Carla Mendes", "Bruno Lopes", "Rita Fernandes", "Hugo Sousa", "Diana Pereira", "Luis Martins", "Joana Costa", "Filipe Rodrigues", "Teresa Lima", "Marco Silva", "Patricia Reis"] },
  { id: "h5", date: "2026-06-04", time: "18:30", classType: "Hyrox", classTypeColor: "#ffb300", coach: "Ricardo Santos", location: "Main Box", enrolled: 16, attended: 15, noShows: 1, capacity: 20, attendees: ["Ana Silva", "Pedro Almeida", "Sofia Santos", "Miguel Costa", "Ines Ferreira", "Tiago Neves", "Maria Oliveira", "Jose Fonte", "Carla Mendes", "Bruno Lopes", "Rita Fernandes", "Hugo Sousa", "Diana Pereira", "Luis Martins", "Joana Costa"] },
  { id: "h6", date: "2026-06-03", time: "07:00", classType: "WOD", classTypeColor: "#22c55e", coach: "Ana Martins", location: "Main Box", enrolled: 16, attended: 15, noShows: 1, capacity: 20, attendees: ["Pedro Almeida", "Sofia Santos", "Miguel Costa", "Ines Ferreira", "Tiago Neves", "Maria Oliveira", "Jose Fonte", "Carla Mendes", "Bruno Lopes", "Rita Fernandes", "Hugo Sousa", "Diana Pereira", "Luis Martins", "Joana Costa", "Filipe Rodrigues"] },
  { id: "h7", date: "2026-06-03", time: "09:00", classType: "Gymnastics", classTypeColor: "#c084fc", coach: "Ricardo Santos", location: "Sala 2", enrolled: 10, attended: 9, noShows: 1, capacity: 15, attendees: ["Ana Silva", "Pedro Almeida", "Sofia Santos", "Miguel Costa", "Ines Ferreira", "Tiago Neves", "Maria Oliveira", "Jose Fonte", "Carla Mendes"] },
  { id: "h8", date: "2026-06-03", time: "12:00", classType: "Open Box", classTypeColor: "#00d4ff", coach: "—", location: "Main Box", enrolled: 8, attended: 7, noShows: 1, capacity: 20, attendees: ["Pedro Almeida", "Sofia Santos", "Miguel Costa", "Ines Ferreira", "Tiago Neves", "Maria Oliveira", "Jose Fonte"] },
  { id: "h9", date: "2026-06-03", time: "17:30", classType: "WOD", classTypeColor: "#22c55e", coach: "Ana Martins", location: "Main Box", enrolled: 19, attended: 18, noShows: 1, capacity: 20, attendees: ["Ana Silva", "Pedro Almeida", "Sofia Santos", "Miguel Costa", "Ines Ferreira", "Tiago Neves", "Maria Oliveira", "Jose Fonte", "Carla Mendes", "Bruno Lopes", "Rita Fernandes", "Hugo Sousa", "Diana Pereira", "Luis Martins", "Joana Costa", "Filipe Rodrigues", "Teresa Lima", "Marco Silva"] },
  { id: "h10", date: "2026-06-03", time: "18:30", classType: "Mobility", classTypeColor: "#6b8c72", coach: "Ricardo Santos", location: "Sala 2", enrolled: 6, attended: 6, noShows: 0, capacity: 15, attendees: ["Ana Silva", "Pedro Almeida", "Sofia Santos", "Miguel Costa", "Ines Ferreira", "Tiago Neves"] },
  { id: "h11", date: "2026-06-02", time: "07:00", classType: "WOD", classTypeColor: "#22c55e", coach: "Ricardo Santos", location: "Main Box", enrolled: 17, attended: 16, noShows: 1, capacity: 20, attendees: [] },
  { id: "h12", date: "2026-06-02", time: "09:00", classType: "Strength", classTypeColor: "#ff4757", coach: "Ana Martins", location: "Main Box", enrolled: 14, attended: 13, noShows: 1, capacity: 20, attendees: [] },
  { id: "h13", date: "2026-06-02", time: "17:30", classType: "WOD", classTypeColor: "#22c55e", coach: "Ricardo Santos", location: "Main Box", enrolled: 20, attended: 18, noShows: 2, capacity: 20, attendees: [] },
  { id: "h14", date: "2026-06-02", time: "18:30", classType: "Hyrox", classTypeColor: "#ffb300", coach: "Ana Martins", location: "Main Box", enrolled: 15, attended: 14, noShows: 1, capacity: 20, attendees: [] },
  { id: "h15", date: "2026-06-01", time: "07:00", classType: "WOD", classTypeColor: "#22c55e", coach: "Ana Martins", location: "Main Box", enrolled: 15, attended: 14, noShows: 1, capacity: 20, attendees: [] },
  { id: "h16", date: "2026-06-01", time: "09:00", classType: "Gymnastics", classTypeColor: "#c084fc", coach: "Ricardo Santos", location: "Sala 2", enrolled: 11, attended: 10, noShows: 1, capacity: 15, attendees: [] },
  { id: "h17", date: "2026-06-01", time: "12:00", classType: "Open Box", classTypeColor: "#00d4ff", coach: "—", location: "Main Box", enrolled: 9, attended: 8, noShows: 1, capacity: 20, attendees: [] },
  { id: "h18", date: "2026-06-01", time: "17:30", classType: "WOD", classTypeColor: "#22c55e", coach: "Ana Martins", location: "Main Box", enrolled: 19, attended: 17, noShows: 2, capacity: 20, attendees: [] },
  { id: "h19", date: "2026-05-31", time: "07:00", classType: "WOD", classTypeColor: "#22c55e", coach: "Ricardo Santos", location: "Main Box", enrolled: 16, attended: 15, noShows: 1, capacity: 20, attendees: [] },
  { id: "h20", date: "2026-05-31", time: "17:30", classType: "WOD", classTypeColor: "#22c55e", coach: "Ana Martins", location: "Main Box", enrolled: 18, attended: 17, noShows: 1, capacity: 20, attendees: [] },
];

const attendanceTrendData = [
  { week: "W1", avg: 12.8 }, { week: "W2", avg: 13.1 }, { week: "W3", avg: 13.5 },
  { week: "W4", avg: 14.2 }, { week: "W5", avg: 13.8 }, { week: "W6", avg: 14.5 },
  { week: "W7", avg: 14.1 }, { week: "W8", avg: 15.0 }, { week: "W9", avg: 14.8 },
  { week: "W10", avg: 14.3 }, { week: "W11", avg: 15.2 }, { week: "W12", avg: 14.9 },
];

const attendanceByTypeData = [
  { type: "WOD", avg: 16.2 }, { type: "Strength", avg: 13.5 }, { type: "Hyrox", avg: 14.8 },
  { type: "Gymnastics", avg: 9.5 }, { type: "Open Box", avg: 7.5 }, { type: "Mobility", avg: 5.8 },
];

const noShowReasonsData = [
  { name: "Forgot", value: 35 }, { name: "Sick", value: 25 },
  { name: "Work", value: 28 }, { name: "Other", value: 12 },
];

const noShowColors = ["#ffb300", "#ff4757", "#00d4ff", "#6b8c72"];

// ---------------------------------------------------------------------------
// Tooltip style
// ---------------------------------------------------------------------------

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#0f1610",
    border: "1px solid rgba(34,197,94,0.2)",
    borderRadius: "8px",
    fontSize: 12,
    color: "#dceee0",
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
    padding: "10px 14px",
  },
  itemStyle: { color: "#dceee0" },
  labelStyle: { color: "#6b8c72", marginBottom: 6, fontWeight: 600 as const },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ClassHistoryPage() {
  const { t } = useI18n();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCoach, setFilterCoach] = useState("all");

  const classTypes = useMemo(() => [...new Set(mockHistory.map((h) => h.classType))], []);
  const coaches = useMemo(() => [...new Set(mockHistory.map((h) => h.coach).filter((c) => c !== "—"))], []);

  const filtered = useMemo(() =>
    mockHistory.filter((h) => {
      if (filterType !== "all" && h.classType !== filterType) return false;
      if (filterCoach !== "all" && h.coach !== filterCoach) return false;
      if (search && !h.classType.toLowerCase().includes(search.toLowerCase()) && !h.coach.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }),
    [search, filterType, filterCoach]
  );

  const totalClasses = filtered.length;
  const totalAttendance = filtered.reduce((sum, h) => sum + h.attended, 0);
  const avgPerClass = totalClasses > 0 ? (totalAttendance / totalClasses).toFixed(1) : "0";
  const totalNoShows = filtered.reduce((sum, h) => sum + h.noShows, 0);
  const noShowRate = totalAttendance + totalNoShows > 0
    ? ((totalNoShows / (totalAttendance + totalNoShows)) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t("nav.classes"), href: "/classes" },
          { label: t("classHistory.title") },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold text-vytal-text">{t("classHistory.title")}</h1>
        <p className="mt-1 text-sm text-vytal-muted">{t("classHistory.subtitle")}</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-blue/10">
              <CalendarDays className="h-5 w-5 text-vytal-blue" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("classHistory.totalClasses")}</p>
              <p className="text-xl font-bold text-vytal-text">{totalClasses}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-green/10">
              <Users className="h-5 w-5 text-vytal-green" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("classHistory.totalAttendance")}</p>
              <p className="text-xl font-bold text-vytal-text">{totalAttendance}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-purple/10">
              <TrendingUp className="h-5 w-5 text-vytal-purple" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("classHistory.avgPerClass")}</p>
              <p className="text-xl font-bold text-vytal-text">{avgPerClass}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-red/10">
              <AlertTriangle className="h-5 w-5 text-vytal-red" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("classHistory.noShowRate")}</p>
              <p className="text-xl font-bold text-vytal-text">{noShowRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vytal-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("classHistory.searchPlaceholder")}
            className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 py-2 pl-10 pr-4 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/40 focus:outline-none"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/40 focus:outline-none"
        >
          <option value="all">{t("classHistory.allTypes")}</option>
          {classTypes.map((ct) => (
            <option key={ct} value={ct}>{ct}</option>
          ))}
        </select>
        <select
          value={filterCoach}
          onChange={(e) => setFilterCoach(e.target.value)}
          className="rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/40 focus:outline-none"
        >
          <option value="all">{t("classHistory.allCoaches")}</option>
          {coaches.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* History Table */}
      <div className="overflow-x-auto rounded-xl border border-vytal-border bg-vytal-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-vytal-border">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("table.date")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("classHistory.time")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("table.type")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("classHistory.coach")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("classHistory.location")}</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("classHistory.enrolled")}</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("classHistory.attended")}</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("classHistory.noShows")}</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("classHistory.rate")}</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => {
              const rate = entry.enrolled > 0 ? ((entry.attended / entry.enrolled) * 100).toFixed(0) : "0";
              const isExpanded = expandedId === entry.id;
              return (
                <React.Fragment key={entry.id}>
                  <tr
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className={cn(
                      "cursor-pointer border-b border-vytal-border/50 transition-colors hover:bg-vytal-bg3/30",
                      isExpanded && "bg-vytal-green/5"
                    )}
                  >
                    <td className="px-4 py-3 text-sm text-vytal-text">{entry.date}</td>
                    <td className="px-4 py-3 font-mono text-sm text-vytal-muted">{entry.time}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.classTypeColor }} />
                        <span className="text-sm font-medium text-vytal-text">{entry.classType}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-vytal-muted">{entry.coach}</td>
                    <td className="px-4 py-3 text-sm text-vytal-muted">{entry.location}</td>
                    <td className="px-4 py-3 text-center text-sm text-vytal-text">{entry.enrolled}</td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-vytal-green">{entry.attended}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("text-sm font-medium", entry.noShows > 0 ? "text-vytal-red" : "text-vytal-muted")}>
                        {entry.noShows}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-vytal-text">{rate}%</td>
                    <td className="px-2 py-3">
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-vytal-muted" /> : <ChevronDown className="h-4 w-4 text-vytal-muted" />}
                    </td>
                  </tr>
                  {isExpanded && entry.attendees.length > 0 && (
                    <tr>
                      <td colSpan={10} className="bg-vytal-bg2/50 px-6 py-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-vytal-muted">{t("classHistory.attendeeList")}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {entry.attendees.map((name, i) => (
                            <span key={i} className="inline-flex rounded-full bg-vytal-bg3 px-2.5 py-1 text-xs font-medium text-vytal-text">
                              {name}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Attendance Trend */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card/80 p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("classHistory.attendanceTrend")}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrendData}>
                <CartesianGrid stroke="rgba(34,197,94,0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="week" tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 20]} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="avg" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: "#22c55e", r: 3 }} name={t("classHistory.avgAttendance")} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By Class Type */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card/80 p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("classHistory.byClassType")}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceByTypeData}>
                <CartesianGrid stroke="rgba(34,197,94,0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="type" tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="avg" fill="#22c55e" radius={[6, 6, 0, 0]} name={t("classHistory.avgAttendance")} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* No-show Reasons */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card/80 p-6 backdrop-blur-sm lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("classHistory.noShowReasons")}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={noShowReasonsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {noShowReasonsData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={noShowColors[index]} />
                  ))}
                </Pie>
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span style={{ color: "#dceee0", fontSize: 12 }}>{value}</span>
                  )}
                />
                <Tooltip {...tooltipStyle} formatter={(value) => [`${value}%`, ""]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// Need React import for Fragment
import React from "react";
