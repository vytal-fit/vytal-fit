"use client";

import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { cn } from "@/lib/utils";
import {
  Brain,
  Zap,
  Clock,
  Users,
  TrendingUp,
  ArrowRight,
  CalendarDays,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 16 }, (_, i) => `${String(i + 6).padStart(2, "0")}:00`);

// Demand heatmap: rows = days, cols = hours (6:00 to 21:00)
const demandHeatmap: number[][] = [
  [8, 18, 14, 6, 3, 2, 5, 3, 2, 4, 6, 16, 20, 15, 8, 3],
  [6, 16, 12, 5, 2, 1, 4, 2, 1, 3, 5, 15, 18, 14, 7, 2],
  [9, 19, 15, 7, 4, 3, 6, 4, 3, 5, 7, 18, 22, 17, 9, 4],
  [10, 20, 16, 8, 5, 4, 7, 5, 4, 6, 8, 20, 24, 19, 10, 5],
  [5, 15, 11, 4, 2, 1, 4, 2, 1, 2, 4, 13, 16, 11, 5, 2],
  [0, 0, 10, 12, 8, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 6, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

function heatmapMax(): number {
  let max = 0;
  for (const row of demandHeatmap) {
    for (const v of row) {
      if (v > max) max = v;
    }
  }
  return max;
}

function heatCellColor(value: number, max: number): string {
  if (value === 0) return "rgba(22,32,24,0.9)";
  const intensity = value / max;
  if (intensity <= 0.15) return "rgba(34,197,94,0.08)";
  if (intensity <= 0.3) return "rgba(34,197,94,0.18)";
  if (intensity <= 0.45) return "rgba(34,197,94,0.3)";
  if (intensity <= 0.6) return "rgba(34,197,94,0.45)";
  if (intensity <= 0.8) return "rgba(34,197,94,0.65)";
  return "rgba(34,197,94,0.85)";
}

const suggestions = [
  {
    type: "high" as const,
    icon: Zap,
    iconColor: "text-vytal-green",
    iconBg: "bg-vytal-green/10",
    borderColor: "border-vytal-green/20",
    title: "High demand detected: Thursday 06:00",
    description: "15 members requested early morning classes. Consider adding a WOD session at this time slot to capture unmet demand.",
  },
  {
    type: "low" as const,
    icon: AlertTriangle,
    iconColor: "text-vytal-amber",
    iconBg: "bg-vytal-amber/10",
    borderColor: "border-vytal-amber/20",
    title: "Low attendance: Saturday 14:00 Mobility",
    description: "Average 3 members per session. Consider moving to Saturday 10:00 where demand is 4x higher, or replacing with Open Box.",
  },
  {
    type: "overlap" as const,
    icon: Users,
    iconColor: "text-vytal-blue",
    iconBg: "bg-vytal-blue/10",
    borderColor: "border-vytal-blue/20",
    title: "Overlap opportunity: Monday WOD & Strength",
    description: "Both classes at 18:00 compete for the same members. Split to 17:30 and 18:30 to increase total attendance by an estimated 22%.",
  },
];

const utilizationData = [
  { slot: "06:00", capacity: 20, actual: 18 },
  { slot: "07:00", capacity: 20, actual: 16 },
  { slot: "09:00", capacity: 20, actual: 12 },
  { slot: "10:00", capacity: 15, actual: 8 },
  { slot: "12:00", capacity: 20, actual: 14 },
  { slot: "17:00", capacity: 20, actual: 17 },
  { slot: "17:30", capacity: 20, actual: 19 },
  { slot: "18:00", capacity: 20, actual: 20 },
  { slot: "18:30", capacity: 20, actual: 18 },
  { slot: "19:00", capacity: 20, actual: 15 },
  { slot: "20:00", capacity: 15, actual: 6 },
];

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#0f1610",
    border: "1px solid rgba(34,197,94,0.2)",
    borderRadius: "8px",
    fontSize: 12,
    color: "#dceee0",
  },
  itemStyle: { color: "#dceee0" },
  labelStyle: { color: "#6b8c72", marginBottom: 4 },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SmartSchedulingPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const hMax = heatmapMax();

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: t("nav.classes"), href: "/classes" },
          { label: t("smart.title") },
        ]}
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-vytal-green/20 to-vytal-blue/20">
          <Brain className="h-5 w-5 text-vytal-green" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("smart.title")}</h1>
          <p className="text-sm text-vytal-muted">{t("smart.subtitle")}</p>
        </div>
      </div>

      {/* Demand Heatmap */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card/80 p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-vytal-green" />
          <h3 className="text-sm font-semibold text-vytal-text">{t("smart.demandHeatmap")}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr>
                <th className="w-12 px-1 py-1 text-left text-[10px] font-medium uppercase tracking-wider text-vytal-muted" />
                {HOURS.map((h) => (
                  <th key={h} className="px-0.5 py-1 text-center text-[10px] font-medium text-vytal-muted">{h.slice(0, 2)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day, di) => (
                <tr key={day}>
                  <td className="px-1 py-0.5 text-xs font-medium text-vytal-muted">{day}</td>
                  {demandHeatmap[di].map((value, ti) => (
                    <td key={ti} className="px-0.5 py-0.5">
                      <div
                        className="flex h-9 items-center justify-center rounded cursor-pointer transition-all hover:ring-1 hover:ring-vytal-green/40"
                        style={{ backgroundColor: heatCellColor(value, hMax) }}
                        title={`${day} ${HOURS[ti]}: ${value} bookings`}
                      >
                        <span
                          className="font-mono text-[10px] font-semibold"
                          style={{ color: value === 0 ? "rgba(107,140,114,0.2)" : value / hMax > 0.4 ? "#080c0a" : "#6b8c72" }}
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
        <div className="mt-4 flex items-center gap-3">
          <span className="text-[10px] font-medium uppercase tracking-wider text-vytal-muted">{t("smart.lowDemand")}</span>
          <div className="flex gap-1">
            {[0, 0.08, 0.18, 0.3, 0.45, 0.65, 0.85].map((opacity) => (
              <div key={opacity} className="h-3 w-6 rounded" style={{ backgroundColor: opacity === 0 ? "rgba(22,32,24,0.9)" : `rgba(34,197,94,${opacity})` }} />
            ))}
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-vytal-muted">{t("smart.highDemand")}</span>
        </div>
      </div>

      {/* Suggestions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-vytal-text">{t("smart.suggestions")}</h2>
        <div className="space-y-3">
          {suggestions.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className={cn("flex items-start gap-4 rounded-xl border bg-vytal-card p-5 transition-colors hover:border-opacity-40", s.borderColor)}>
                <div className={cn("mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", s.iconBg)}>
                  <Icon className={cn("h-5 w-5", s.iconColor)} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-vytal-text">{s.title}</h4>
                  <p className="mt-1 text-sm text-vytal-muted">{s.description}</p>
                </div>
                <button
                  onClick={() => toast(t("smart.suggestionApplied"), "success")}
                  className="shrink-0 rounded-lg border border-vytal-green/20 bg-vytal-green/5 px-4 py-2 text-xs font-semibold text-vytal-green transition-colors hover:bg-vytal-green/10"
                >
                  {t("smart.applySuggestion")}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Utilization Analysis */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card/80 p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-vytal-green" />
          <h3 className="text-sm font-semibold text-vytal-text">{t("smart.utilizationAnalysis")}</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={utilizationData}>
              <CartesianGrid stroke="rgba(34,197,94,0.08)" strokeDasharray="3 3" />
              <XAxis dataKey="slot" tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 25]} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="capacity" fill="rgba(34,197,94,0.15)" radius={[4, 4, 0, 0]} name={t("smart.capacity")} />
              <Bar dataKey="actual" radius={[4, 4, 0, 0]} name={t("smart.actual")}>
                {utilizationData.map((entry, i) => {
                  const pct = (entry.actual / entry.capacity) * 100;
                  const fill = pct >= 95 ? "#ff4757" : pct >= 80 ? "#ffb300" : "#22c55e";
                  return <Cell key={i} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-vytal-muted">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-vytal-green" />
            <span>&lt; 80%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-vytal-amber" />
            <span>80-95%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-vytal-red" />
            <span>&gt; 95%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: "rgba(34,197,94,0.15)" }} />
            <span>{t("smart.capacity")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
