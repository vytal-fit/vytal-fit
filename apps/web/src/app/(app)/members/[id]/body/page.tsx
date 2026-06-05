"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { useDataStore } from "@/stores/data-store";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { cn } from "@/lib/utils";
import {
  Scale,
  Ruler,
  Activity,
  TrendingDown,
  TrendingUp,
  Plus,
  Camera,
  Calendar,
  Save,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const currentStats = {
  weight: 78,
  height: 175,
  bmi: 25.5,
  bodyFat: 18,
};

const weightHistory = [
  { month: "Jan", weight: 82 },
  { month: "Feb", weight: 81 },
  { month: "Mar", weight: 80.2 },
  { month: "Apr", weight: 79.5 },
  { month: "May", weight: 78.8 },
  { month: "Jun", weight: 78 },
];

const measurements = [
  { part: "Chest", current: 102, threeMonths: 104, start: 106 },
  { part: "Waist", current: 82, threeMonths: 85, start: 89 },
  { part: "Hips", current: 98, threeMonths: 99, start: 101 },
  { part: "Right Arm", current: 36, threeMonths: 35, start: 34 },
  { part: "Left Arm", current: 35.5, threeMonths: 34.5, start: 33.5 },
  { part: "Right Thigh", current: 58, threeMonths: 57, start: 56 },
  { part: "Left Thigh", current: 57.5, threeMonths: 56.5, start: 55.5 },
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

function StatCard({
  label,
  value,
  unit,
  icon,
  trend,
}: {
  label: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  trend?: { value: string; up: boolean };
}) {
  return (
    <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{label}</p>
          <p className="mt-1 text-2xl font-bold text-vytal-text">
            {value}<span className="ml-1 text-sm font-normal text-vytal-muted">{unit}</span>
          </p>
          {trend && (
            <div className="mt-1 flex items-center gap-1">
              {trend.up ? (
                <TrendingUp className="h-3 w-3 text-vytal-green" />
              ) : (
                <TrendingDown className="h-3 w-3 text-vytal-green" />
              )}
              <span className="text-xs font-semibold text-vytal-green">{trend.value}</span>
            </div>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-green/10">
          {icon}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function BodyCompositionPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const params = useParams();
  const id = params.id as string;
  const members = useDataStore((s) => s.members);

  const member = members.find((m) => m.id === id);
  if (!member) return notFound();

  const [showForm, setShowForm] = useState(false);
  const [formWeight, setFormWeight] = useState("");
  const [formBodyFat, setFormBodyFat] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);

  function handleSave() {
    toast(t("body.measurementSaved"), "success");
    setShowForm(false);
    setFormWeight("");
    setFormBodyFat("");
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: t("nav.members"), href: "/members" },
          { label: member.name, href: `/members/${member.id}` },
          { label: t("body.title") },
        ]}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-vytal-text">{t("body.title")}</h1>
        <p className="mt-1 text-sm text-vytal-muted">{t("body.subtitle").replace("{name}", member.name)}</p>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={t("body.weight")}
          value={currentStats.weight}
          unit="kg"
          icon={<Scale className="h-5 w-5 text-vytal-green" />}
          trend={{ value: "-4kg (6mo)", up: false }}
        />
        <StatCard
          label={t("body.height")}
          value={currentStats.height}
          unit="cm"
          icon={<Ruler className="h-5 w-5 text-vytal-green" />}
        />
        <StatCard
          label="BMI"
          value={currentStats.bmi}
          unit=""
          icon={<Activity className="h-5 w-5 text-vytal-green" />}
          trend={{ value: "-1.3 (6mo)", up: false }}
        />
        <StatCard
          label={t("body.bodyFat")}
          value={currentStats.bodyFat}
          unit="%"
          icon={<TrendingDown className="h-5 w-5 text-vytal-green" />}
          trend={{ value: "-3% (6mo)", up: false }}
        />
      </div>

      {/* Weight Progress Chart */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card/80 p-6 backdrop-blur-sm">
        <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("body.weightProgress")}</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightHistory}>
              <CartesianGrid stroke="rgba(34,197,94,0.08)" strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} domain={[75, 85]} />
              <Tooltip {...tooltipStyle} formatter={(value) => [`${value} kg`, t("body.weight")]} />
              <Line type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={2} dot={{ r: 4, fill: "#22c55e" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Measurements Table */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-vytal-text">{t("body.measurements")}</h2>
        <div className="overflow-x-auto rounded-xl border border-vytal-border">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-vytal-border bg-vytal-bg2">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("body.bodyPart")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("body.current")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("body.threeMonthsAgo")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("body.start")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("body.change")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vytal-border">
              {measurements.map((m) => {
                const change = m.current - m.start;
                return (
                  <tr key={m.part} className="bg-vytal-card transition-colors hover:bg-vytal-bg3">
                    <td className="px-4 py-3 text-sm font-medium text-vytal-text">{m.part}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-vytal-text">{m.current} cm</td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-vytal-muted">{m.threeMonths} cm</td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-vytal-muted">{m.start} cm</td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn("font-mono text-sm font-semibold", change <= 0 ? "text-vytal-green" : "text-vytal-red")}>
                        {change > 0 ? "+" : ""}{change} cm
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Progress Photos Placeholder */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-vytal-text">{t("body.progressPhotos")}</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {(["front", "back", "left", "right"] as const).map((view) => (
            <div
              key={view}
              className="flex aspect-[3/4] flex-col items-center justify-center rounded-xl border-2 border-dashed border-vytal-border bg-vytal-card/50 transition-colors hover:border-vytal-green/30"
            >
              <Camera className="h-8 w-8 text-vytal-muted/40" />
              <span className="mt-2 text-xs font-medium text-vytal-muted">{t(`body.${view}`)}</span>
              <button className="mt-3 rounded-lg border border-vytal-border px-3 py-1 text-[10px] font-medium text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text">
                {t("body.upload")}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Measurement Form */}
      <div>
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2.5 text-sm font-semibold text-vytal-bg transition-all hover:bg-vytal-green/90"
          >
            <Plus className="h-4 w-4" />
            {t("body.addMeasurement")}
          </button>
        ) : (
          <div className="rounded-xl border border-vytal-green/20 bg-vytal-green/5 p-6">
            <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("body.addMeasurement")}</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-vytal-muted">{t("body.date")}</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vytal-muted" />
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 py-2.5 pl-10 pr-3 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-vytal-muted">{t("body.weight")} (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formWeight}
                  onChange={(e) => setFormWeight(e.target.value)}
                  placeholder="78.0"
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-vytal-muted">{t("body.bodyFat")} (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formBodyFat}
                  onChange={(e) => setFormBodyFat(e.target.value)}
                  placeholder="18.0"
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2 text-sm font-semibold text-vytal-bg hover:bg-vytal-green/90"
              >
                <Save className="h-4 w-4" />
                {t("action.save")}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-vytal-border px-4 py-2 text-sm text-vytal-text hover:bg-vytal-bg3"
              >
                {t("action.cancel")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
