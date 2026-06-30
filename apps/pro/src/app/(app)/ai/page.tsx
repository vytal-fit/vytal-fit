"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Users,
  CalendarDays,
  Dumbbell,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Mail,
  UserCheck,
  Target,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useOrgFormat } from "@/lib/org-format";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mrrForecastData = [
  { month: "Jan", actual: 14200 },
  { month: "Feb", actual: 15100 },
  { month: "Mar", actual: 15800 },
  { month: "Apr", actual: 16500 },
  { month: "May", actual: 17200 },
  { month: "Jun", actual: 18400 },
  { month: "Jul", forecast: 19100, low: 18500, high: 19700 },
  { month: "Aug", forecast: 19800, low: 18900, high: 20700 },
  { month: "Sep", forecast: 20500, low: 19200, high: 21800 },
];

const churnRiskMembers = [
  { name: "Maria Oliveira", risk: 92, lastVisit: "18 days ago", action: "Send re-engagement email" },
  { name: "Joao Mendes", risk: 85, lastVisit: "16 days ago", action: "Offer 1-on-1 session" },
  { name: "Rita Fernandes", risk: 78, lastVisit: "14 days ago", action: "Call to check in" },
  { name: "Bruno Alves", risk: 65, lastVisit: "12 days ago", action: "Send class recommendation" },
  { name: "Catarina Santos", risk: 52, lastVisit: "10 days ago", action: "Offer plan upgrade" },
];

const focusAreas = ["Upper Body", "Lower Body", "Core", "Cardio", "Olympic Lifting", "Gymnastics"];
const equipmentOptions = ["Barbell", "Dumbbell", "Kettlebell", "Pull-up Bar", "Rower", "Bike", "Box", "Rings", "Rope"];

const generatedWod = {
  title: "Thursday Burner",
  type: "AMRAP" as const,
  duration: 20,
  parts: [
    { name: "Warm Up", exercises: ["400m Run", "10 Air Squats", "10 PVC Pass-throughs", "5 Inchworms"] },
    {
      name: "WOD - AMRAP 20min",
      exercises: [
        "15 Wall Balls (9/6 kg)",
        "12 Toes-to-Bar",
        "9 Power Cleans (60/40 kg)",
        "200m Run",
      ],
    },
    { name: "Cool Down", exercises: ["2min Easy Row", "Pigeon Stretch 1min/side", "Shoulder Stretch 1min/side"] },
  ],
};

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
// Components
// ---------------------------------------------------------------------------

function InsightCard({
  severity,
  title,
  description,
  linkHref,
  linkLabel,
}: {
  severity: "red" | "amber" | "green";
  title: string;
  description: string;
  linkHref: string;
  linkLabel: string;
}) {
  const colorMap = {
    red: { dot: "bg-vytal-red", border: "border-vytal-red/20", bg: "bg-vytal-red/5" },
    amber: { dot: "bg-vytal-amber", border: "border-vytal-amber/20", bg: "bg-vytal-amber/5" },
    green: { dot: "bg-vytal-green", border: "border-vytal-green/20", bg: "bg-vytal-green/5" },
  };
  const c = colorMap[severity];

  return (
    <div className={cn("rounded-xl border p-5 card-interactive transition-colors hover:border-opacity-40", c.border, c.bg)}>
      <div className="mb-3 flex items-center gap-2">
        <div className={cn("h-2.5 w-2.5 rounded-full", c.dot)} />
        <span className="text-sm font-semibold text-vytal-text">{title}</span>
      </div>
      <p className="mb-4 text-sm text-vytal-muted">{description}</p>
      <Link
        href={linkHref}
        className="inline-flex items-center gap-1 text-xs font-medium text-vytal-green transition-colors hover:text-vytal-green/80"
      >
        {linkLabel}
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

function RiskBar({ risk }: { risk: number }) {
  const color = risk >= 80 ? "#ff4757" : risk >= 60 ? "#ffb300" : "#22c55e";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 overflow-hidden rounded-full bg-vytal-bg3">
        <div className="h-full rounded-full transition-all" style={{ width: `${risk}%`, backgroundColor: color }} />
      </div>
      <span className="font-mono text-xs font-semibold" style={{ color }}>
        {risk}%
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AIInsightsPage() {
  const { money: formatCurrency } = useOrgFormat();
  const { t } = useI18n();
  const { toast } = useToast();
  const [wodExpanded, setWodExpanded] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(20);
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [selectedFocus, setSelectedFocus] = useState<string[]>(["Upper Body", "Core"]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(["Barbell", "Pull-up Bar", "Rower"]);
  const [wodGenerated, setWodGenerated] = useState(false);
  const [predictionsOpen, setPredictionsOpen] = useState(true);

  function toggleFocus(area: string) {
    setSelectedFocus((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }

  function toggleEquipment(eq: string) {
    setSelectedEquipment((prev) =>
      prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq]
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-vytal-green/20 to-vytal-blue/20">
          <Sparkles className="h-5 w-5 text-vytal-green" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("ai.title")}</h1>
          <p className="text-sm text-vytal-muted">{t("ai.subtitle")}</p>
        </div>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InsightCard
          severity="red"
          title={t("ai.churnRiskTitle")}
          description={t("ai.churnRiskDesc")}
          linkHref="/members/retention"
          linkLabel={t("ai.viewAtRisk")}
        />
        <InsightCard
          severity="amber"
          title={t("ai.revenueOpportunityTitle")}
          description={t("ai.revenueOpportunityDesc")}
          linkHref="/classes/create"
          linkLabel={t("ai.addSecondClass")}
        />
        <InsightCard
          severity="green"
          title={t("ai.growthTitle")}
          description={t("ai.growthDesc")}
          linkHref="/analytics"
          linkLabel={t("ai.viewAnalytics")}
        />
      </div>

      {/* AI Predictions Section */}
      <div>
        <button
          onClick={() => setPredictionsOpen((v) => !v)}
          className="mb-4 flex items-center gap-2 text-sm font-semibold text-vytal-text transition-colors hover:text-vytal-green"
        >
          {predictionsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {t("ai.predictions")}
        </button>

        {predictionsOpen && (
          <div className="space-y-6">
            {/* MRR Forecast Chart */}
            <div className="rounded-xl border border-vytal-border bg-vytal-card/80 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-vytal-green" />
                <h3 className="text-sm font-semibold text-vytal-text">{t("ai.nextMonthForecast")}</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mrrForecastData}>
                    <defs>
                      <linearGradient id="actual-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="forecast-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="band-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.1} />
                        <stop offset="100%" stopColor="#00d4ff" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(34,197,94,0.08)" strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fill: "#6b8c72", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      {...tooltipStyle}
                      formatter={(value, name) => [formatCurrency(Number(value)), name === "actual" ? "Actual" : name === "forecast" ? "Forecast" : String(name)]}
                    />
                    <Area type="monotone" dataKey="high" stackId="band" stroke="none" fill="url(#band-grad)" />
                    <Area type="monotone" dataKey="low" stackId="band" stroke="none" fill="transparent" />
                    <Area type="monotone" dataKey="actual" stroke="#22c55e" strokeWidth={2} fill="url(#actual-grad)" dot={{ r: 3, fill: "#22c55e" }} />
                    <Area type="monotone" dataKey="forecast" stroke="#00d4ff" strokeWidth={2} strokeDasharray="6 3" fill="url(#forecast-grad)" dot={{ r: 3, fill: "#00d4ff" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center gap-6 text-xs text-vytal-muted">
                <div className="flex items-center gap-2">
                  <div className="h-0.5 w-5 bg-vytal-green" />
                  <span>{t("ai.actual")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-0.5 w-5 border-t-2 border-dashed border-[#00d4ff]" />
                  <span>{t("ai.forecast")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-5 rounded bg-[#00d4ff]/10" />
                  <span>{t("ai.confidenceBand")}</span>
                </div>
              </div>
            </div>

            {/* Churn Risk Table */}
            <div className="rounded-xl border border-vytal-border bg-vytal-card/80 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-vytal-amber" />
                <h3 className="text-sm font-semibold text-vytal-text">{t("ai.churnRiskMembers")}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-vytal-border">
                      <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("ai.member")}</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("ai.riskScore")}</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("ai.lastVisit")}</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("ai.recommendedAction")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-vytal-border">
                    {churnRiskMembers.map((m) => (
                      <tr key={m.name} className="row-interactive transition-colors hover:bg-vytal-bg3/50">
                        <td className="px-3 py-3 text-sm font-medium text-vytal-text">{m.name}</td>
                        <td className="px-3 py-3"><RiskBar risk={m.risk} /></td>
                        <td className="px-3 py-3 text-sm text-vytal-muted">{m.lastVisit}</td>
                        <td className="px-3 py-3 text-sm text-vytal-muted">{m.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Optimal Class Schedule Suggestions */}
            <div className="rounded-xl border border-vytal-border bg-vytal-card/80 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-vytal-blue" />
                <h3 className="text-sm font-semibold text-vytal-text">{t("ai.optimalSchedule")}</h3>
              </div>
              <div className="space-y-3">
                {[
                  { text: t("ai.scheduleSuggestion1"), icon: <Zap className="h-4 w-4 text-vytal-green" /> },
                  { text: t("ai.scheduleSuggestion2"), icon: <Clock className="h-4 w-4 text-vytal-amber" /> },
                  { text: t("ai.scheduleSuggestion3"), icon: <Users className="h-4 w-4 text-vytal-blue" /> },
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-vytal-border bg-vytal-card px-4 py-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-vytal-bg3">
                      {s.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-vytal-text">{s.text}</p>
                    </div>
                    <button
                      onClick={() => toast(t("ai.suggestionApplied"), "success")}
                      className="shrink-0 rounded-lg border border-vytal-green/20 bg-vytal-green/5 px-3 py-1.5 text-xs font-semibold text-vytal-green transition-colors hover:bg-vytal-green/10"
                    >
                      {t("ai.applySuggestion")}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI WOD Generator */}
      <div className="rounded-xl border border-vytal-green/20 bg-gradient-to-r from-vytal-green/5 to-vytal-blue/5 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vytal-green/10">
              <Dumbbell className="h-4 w-4 text-vytal-green" />
            </div>
            <h3 className="text-sm font-semibold text-vytal-text">{t("ai.wodGenerator")}</h3>
          </div>
          <button
            onClick={() => setWodExpanded((v) => !v)}
            className="text-vytal-muted hover:text-vytal-text"
          >
            {wodExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {wodExpanded && (
          <div className="space-y-6">
            {/* Configuration */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Duration */}
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("ai.targetDuration")}
                </label>
                <div className="flex gap-2">
                  {[10, 15, 20, 30].map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDuration(d)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                        selectedDuration === d
                          ? "border-vytal-green/30 bg-vytal-green/10 text-vytal-green"
                          : "border-vytal-border bg-vytal-card text-vytal-text hover:bg-vytal-bg3"
                      )}
                    >
                      {d} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("ai.difficulty")}
                </label>
                <div className="flex gap-2">
                  {(["easy", "medium", "hard"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDifficulty(d)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors",
                        selectedDifficulty === d
                          ? "border-vytal-green/30 bg-vytal-green/10 text-vytal-green"
                          : "border-vytal-border bg-vytal-card text-vytal-text hover:bg-vytal-bg3"
                      )}
                    >
                      {t(`ai.${d}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Focus Areas */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("ai.focusAreas")}
              </label>
              <div className="flex flex-wrap gap-2">
                {focusAreas.map((area) => (
                  <button
                    key={area}
                    onClick={() => toggleFocus(area)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      selectedFocus.includes(area)
                        ? "border-vytal-green/30 bg-vytal-green/10 text-vytal-green"
                        : "border-vytal-border bg-vytal-card text-vytal-muted hover:text-vytal-text"
                    )}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            {/* Equipment */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("ai.equipment")}
              </label>
              <div className="flex flex-wrap gap-2">
                {equipmentOptions.map((eq) => (
                  <button
                    key={eq}
                    onClick={() => toggleEquipment(eq)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      selectedEquipment.includes(eq)
                        ? "border-vytal-blue/30 bg-vytal-blue/10 text-vytal-blue"
                        : "border-vytal-border bg-vytal-card text-vytal-muted hover:text-vytal-text"
                    )}
                  >
                    {eq}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={() => setWodGenerated(true)}
              className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2.5 text-sm font-semibold text-vytal-bg transition-all hover:bg-vytal-green/90"
            >
              <Sparkles className="h-4 w-4" />
              {t("ai.generateWod")}
            </button>

            {/* Generated WOD Preview */}
            {wodGenerated && (
              <div className="rounded-xl border border-vytal-green/30 bg-vytal-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-vytal-text">{generatedWod.title}</h4>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-vytal-green/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-vytal-green">
                        {generatedWod.type}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-vytal-muted">
                        <Clock className="h-3 w-3" /> {generatedWod.duration} min
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {generatedWod.parts.map((part) => (
                    <div key={part.name}>
                      <h5 className="mb-2 text-sm font-semibold text-vytal-text">{part.name}</h5>
                      <div className="space-y-1 border-l-2 border-vytal-border pl-3">
                        {part.exercises.map((ex, i) => (
                          <p key={i} className="text-sm text-vytal-muted">{ex}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5">
                  <button
                    onClick={() => toast(t("ai.wodAdopted"), "success")}
                    className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2 text-sm font-semibold text-vytal-bg transition-all hover:bg-vytal-green/90"
                  >
                    <Dumbbell className="h-4 w-4" />
                    {t("ai.useThisWod")}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Smart Recommendations */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-vytal-text">{t("ai.smartRecommendations")}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 card-interactive transition-colors hover:border-[rgba(61,255,110,0.22)]">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-purple/10">
              <Target className="h-4 w-4 text-vytal-purple" />
            </div>
            <h4 className="text-sm font-semibold text-vytal-text">{t("ai.hyroxRecommendation")}</h4>
            <p className="mt-1 text-xs text-vytal-muted">{t("ai.hyroxRecommendationDesc")}</p>
          </div>
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 card-interactive transition-colors hover:border-[rgba(61,255,110,0.22)]">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-blue/10">
              <Mail className="h-4 w-4 text-vytal-blue" />
            </div>
            <h4 className="text-sm font-semibold text-vytal-text">{t("ai.emailTiming")}</h4>
            <p className="mt-1 text-xs text-vytal-muted">{t("ai.emailTimingDesc")}</p>
          </div>
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 card-interactive transition-colors hover:border-[rgba(61,255,110,0.22)]">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-green/10">
              <UserCheck className="h-4 w-4 text-vytal-green" />
            </div>
            <h4 className="text-sm font-semibold text-vytal-text">{t("ai.coachImpact")}</h4>
            <p className="mt-1 text-xs text-vytal-muted">{t("ai.coachImpactDesc")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
