"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useDataStore } from "@/stores/data-store";
import { useToast } from "@/components/toast";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  ArrowLeft,
  Plus,
  X,
  ClipboardCheck,
  TrendingUp,
  Activity,
  Target,
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
} from "recharts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AssessmentType = "initial" | "progress" | "final";

interface FMSScores {
  deepSquat: number;
  hurdleStep: number;
  inlineLunge: number;
  shoulderMobility: number;
  activeStraightLegRaise: number;
  trunkStabilityPushup: number;
  rotaryStability: number;
}

interface FlexibilityTests {
  sitAndReach: number; // cm
  shoulderMobilityLeft: number; // cm
  shoulderMobilityRight: number; // cm
}

interface EnduranceTests {
  cooperTest: number; // meters
  beepTestLevel: number;
}

interface StrengthRatios {
  backSquatToBodyweight: number;
  deadliftToBodyweight: number;
  benchPressToBodyweight: number;
}

interface Assessment {
  id: string;
  date: string;
  type: AssessmentType;
  assessor: string;
  fms: FMSScores;
  flexibility: FlexibilityTests;
  endurance: EnduranceTests;
  strength: StrengthRatios;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const typeConfig: Record<AssessmentType, { label: string; color: string }> = {
  initial: { label: "Initial", color: "bg-vytal-blue/10 text-vytal-blue" },
  progress: { label: "Progress", color: "bg-vytal-green/10 text-vytal-green" },
  final: { label: "Final", color: "bg-vytal-amber/10 text-vytal-amber" },
};

const fmsMovements: { key: keyof FMSScores; label: string }[] = [
  { key: "deepSquat", label: "Deep Squat" },
  { key: "hurdleStep", label: "Hurdle Step" },
  { key: "inlineLunge", label: "Inline Lunge" },
  { key: "shoulderMobility", label: "Shoulder Mobility" },
  { key: "activeStraightLegRaise", label: "Active Straight Leg Raise" },
  { key: "trunkStabilityPushup", label: "Trunk Stability Pushup" },
  { key: "rotaryStability", label: "Rotary Stability" },
];

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockAssessments: Assessment[] = [
  {
    id: "a1",
    date: "2025-01-15",
    type: "initial",
    assessor: "Coach Ricardo",
    fms: { deepSquat: 2, hurdleStep: 2, inlineLunge: 2, shoulderMobility: 3, activeStraightLegRaise: 2, trunkStabilityPushup: 2, rotaryStability: 1 },
    flexibility: { sitAndReach: 22, shoulderMobilityLeft: 15, shoulderMobilityRight: 12 },
    endurance: { cooperTest: 2200, beepTestLevel: 8.5 },
    strength: { backSquatToBodyweight: 1.0, deadliftToBodyweight: 1.3, benchPressToBodyweight: 0.7 },
  },
  {
    id: "a2",
    date: "2025-04-20",
    type: "progress",
    assessor: "Coach Ana",
    fms: { deepSquat: 2, hurdleStep: 3, inlineLunge: 2, shoulderMobility: 3, activeStraightLegRaise: 3, trunkStabilityPushup: 2, rotaryStability: 2 },
    flexibility: { sitAndReach: 26, shoulderMobilityLeft: 12, shoulderMobilityRight: 10 },
    endurance: { cooperTest: 2450, beepTestLevel: 9.2 },
    strength: { backSquatToBodyweight: 1.2, deadliftToBodyweight: 1.5, benchPressToBodyweight: 0.8 },
  },
  {
    id: "a3",
    date: "2025-08-10",
    type: "progress",
    assessor: "Coach Ricardo",
    fms: { deepSquat: 3, hurdleStep: 3, inlineLunge: 2, shoulderMobility: 3, activeStraightLegRaise: 3, trunkStabilityPushup: 2, rotaryStability: 2 },
    flexibility: { sitAndReach: 30, shoulderMobilityLeft: 10, shoulderMobilityRight: 8 },
    endurance: { cooperTest: 2600, beepTestLevel: 10.1 },
    strength: { backSquatToBodyweight: 1.4, deadliftToBodyweight: 1.7, benchPressToBodyweight: 0.9 },
  },
  {
    id: "a4",
    date: "2026-01-18",
    type: "progress",
    assessor: "Coach Ana",
    fms: { deepSquat: 3, hurdleStep: 3, inlineLunge: 3, shoulderMobility: 3, activeStraightLegRaise: 3, trunkStabilityPushup: 2, rotaryStability: 2 },
    flexibility: { sitAndReach: 32, shoulderMobilityLeft: 8, shoulderMobilityRight: 6 },
    endurance: { cooperTest: 2750, beepTestLevel: 10.8 },
    strength: { backSquatToBodyweight: 1.5, deadliftToBodyweight: 1.8, benchPressToBodyweight: 1.0 },
  },
  {
    id: "a5",
    date: "2026-05-25",
    type: "progress",
    assessor: "Coach Ricardo",
    fms: { deepSquat: 3, hurdleStep: 3, inlineLunge: 3, shoulderMobility: 3, activeStraightLegRaise: 3, trunkStabilityPushup: 3, rotaryStability: 2 },
    flexibility: { sitAndReach: 35, shoulderMobilityLeft: 6, shoulderMobilityRight: 5 },
    endurance: { cooperTest: 2850, beepTestLevel: 11.3 },
    strength: { backSquatToBodyweight: 1.6, deadliftToBodyweight: 2.0, benchPressToBodyweight: 1.1 },
  },
];

function getTotalFMS(fms: FMSScores): number {
  return Object.values(fms).reduce((sum, v) => sum + v, 0);
}

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

export default function AssessmentsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const params = useParams();
  const memberId = params.id as string;
  const members = useDataStore((s) => s.members);
  const member = members.find((m) => m.id === memberId);

  const [assessments, setAssessments] = useState<Assessment[]>(mockAssessments);
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(assessments[assessments.length - 1]?.id ?? null);

  // Form state
  const [formType, setFormType] = useState<AssessmentType>("progress");
  const [formAssessor, setFormAssessor] = useState("");
  const [formFms, setFormFms] = useState<FMSScores>({
    deepSquat: 2, hurdleStep: 2, inlineLunge: 2, shoulderMobility: 2,
    activeStraightLegRaise: 2, trunkStabilityPushup: 2, rotaryStability: 2,
  });
  const [formFlexSitReach, setFormFlexSitReach] = useState("25");
  const [formFlexShoulderL, setFormFlexShoulderL] = useState("10");
  const [formFlexShoulderR, setFormFlexShoulderR] = useState("10");
  const [formCooper, setFormCooper] = useState("2500");
  const [formBeep, setFormBeep] = useState("9.0");
  const [formSquatRatio, setFormSquatRatio] = useState("1.2");
  const [formDeadliftRatio, setFormDeadliftRatio] = useState("1.5");
  const [formBenchRatio, setFormBenchRatio] = useState("0.8");

  const selected = assessments.find((a) => a.id === selectedId) ?? assessments[assessments.length - 1];

  const chartData = useMemo(() =>
    assessments.map((a) => ({
      date: new Date(a.date).toLocaleDateString("pt-PT", { month: "short", year: "2-digit" }),
      score: getTotalFMS(a.fms),
    })),
    [assessments]
  );

  const memberName = member?.name ?? "Member";

  const handleSubmit = () => {
    if (!formAssessor.trim()) return;
    const newAssessment: Assessment = {
      id: `a-${Date.now().toString(36)}`,
      date: new Date().toISOString().split("T")[0],
      type: formType,
      assessor: formAssessor,
      fms: { ...formFms },
      flexibility: {
        sitAndReach: parseFloat(formFlexSitReach) || 0,
        shoulderMobilityLeft: parseFloat(formFlexShoulderL) || 0,
        shoulderMobilityRight: parseFloat(formFlexShoulderR) || 0,
      },
      endurance: {
        cooperTest: parseFloat(formCooper) || 0,
        beepTestLevel: parseFloat(formBeep) || 0,
      },
      strength: {
        backSquatToBodyweight: parseFloat(formSquatRatio) || 0,
        deadliftToBodyweight: parseFloat(formDeadliftRatio) || 0,
        benchPressToBodyweight: parseFloat(formBenchRatio) || 0,
      },
    };
    setAssessments((prev) => [...prev, newAssessment]);
    setSelectedId(newAssessment.id);
    setShowForm(false);
    toast(t("assessments.saved"), "success");
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t("nav.members"), href: "/members" },
          { label: memberName, href: `/members/${memberId}` },
          { label: t("assessments.title") },
        ]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/members/${memberId}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-vytal-border text-vytal-muted transition-colors hover:text-vytal-text"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-vytal-text">{t("assessments.title")}</h1>
            <p className="mt-0.5 text-sm text-vytal-muted">{memberName}</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Plus className="h-4 w-4" />
          {t("assessments.newAssessment")}
        </button>
      </div>

      {/* New Assessment Form */}
      {showForm && (
        <div className="rounded-xl border border-vytal-green/20 bg-vytal-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-vytal-text">{t("assessments.newAssessment")}</h3>
            <button onClick={() => setShowForm(false)} className="text-vytal-muted hover:text-vytal-text">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left: Basic Info + FMS */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-vytal-muted">{t("assessments.type")}</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as AssessmentType)}
                    className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/40 focus:outline-none"
                  >
                    <option value="initial">Initial</option>
                    <option value="progress">Progress</option>
                    <option value="final">Final</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-vytal-muted">{t("assessments.assessor")}</label>
                  <input
                    type="text"
                    value={formAssessor}
                    onChange={(e) => setFormAssessor(e.target.value)}
                    placeholder="Coach Name"
                    className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/40 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-vytal-muted">FMS (0-3 per movement)</h4>
                <div className="space-y-2">
                  {fmsMovements.map((m) => (
                    <div key={m.key} className="flex items-center justify-between rounded-lg border border-vytal-border/50 bg-vytal-bg2 px-3 py-2">
                      <span className="text-sm text-vytal-text">{m.label}</span>
                      <div className="flex gap-1">
                        {[0, 1, 2, 3].map((score) => (
                          <button
                            key={score}
                            onClick={() => setFormFms((prev) => ({ ...prev, [m.key]: score }))}
                            className={cn(
                              "flex h-7 w-7 items-center justify-center rounded text-xs font-semibold transition-colors",
                              formFms[m.key] === score
                                ? "bg-vytal-green text-vytal-bg"
                                : "bg-vytal-bg3 text-vytal-muted hover:text-vytal-text"
                            )}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Other Tests */}
            <div className="space-y-4">
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-vytal-muted">{t("assessments.flexibility")}</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1 block text-[11px] text-vytal-muted">Sit & Reach (cm)</label>
                    <input type="number" value={formFlexSitReach} onChange={(e) => setFormFlexSitReach(e.target.value)} className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/40 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-vytal-muted">Shoulder L (cm)</label>
                    <input type="number" value={formFlexShoulderL} onChange={(e) => setFormFlexShoulderL(e.target.value)} className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/40 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-vytal-muted">Shoulder R (cm)</label>
                    <input type="number" value={formFlexShoulderR} onChange={(e) => setFormFlexShoulderR(e.target.value)} className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/40 focus:outline-none" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-vytal-muted">{t("assessments.endurance")}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-[11px] text-vytal-muted">Cooper Test (m)</label>
                    <input type="number" value={formCooper} onChange={(e) => setFormCooper(e.target.value)} className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/40 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-vytal-muted">Beep Test Level</label>
                    <input type="number" step="0.1" value={formBeep} onChange={(e) => setFormBeep(e.target.value)} className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/40 focus:outline-none" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-vytal-muted">{t("assessments.strength")}</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1 block text-[11px] text-vytal-muted">Squat/BW</label>
                    <input type="number" step="0.1" value={formSquatRatio} onChange={(e) => setFormSquatRatio(e.target.value)} className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/40 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-vytal-muted">Deadlift/BW</label>
                    <input type="number" step="0.1" value={formDeadliftRatio} onChange={(e) => setFormDeadliftRatio(e.target.value)} className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/40 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-vytal-muted">Bench/BW</label>
                    <input type="number" step="0.1" value={formBenchRatio} onChange={(e) => setFormBenchRatio(e.target.value)} className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/40 focus:outline-none" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={!formAssessor.trim()}
                  className="rounded-lg bg-vytal-green px-6 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90 disabled:opacity-50"
                >
                  {t("assessments.saveAssessment")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assessment History Table */}
      <div className="overflow-x-auto rounded-xl border border-vytal-border bg-vytal-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-vytal-border">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("table.date")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("table.type")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("assessments.assessor")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("assessments.fmsScore")}</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((a) => {
              const total = getTotalFMS(a.fms);
              return (
                <tr
                  key={a.id}
                  onClick={() => setSelectedId(a.id)}
                  className={cn(
                    "cursor-pointer border-b border-vytal-border/50 transition-colors hover:bg-vytal-bg3/30",
                    selectedId === a.id && "bg-vytal-green/5"
                  )}
                >
                  <td className="px-4 py-3 text-sm text-vytal-text">{a.date}</td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", typeConfig[a.type].color)}>
                      {typeConfig[a.type].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-vytal-muted">{a.assessor}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-vytal-text">{total}/21</span>
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-vytal-bg3">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            total >= 17 ? "bg-vytal-green" : total >= 14 ? "bg-vytal-amber" : "bg-vytal-red"
                          )}
                          style={{ width: `${(total / 21) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs font-medium text-vytal-green hover:text-vytal-green/80">
                      {t("ui.details")}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Latest/Selected Assessment Detail */}
      {selected && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* FMS Detail Card */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-vytal-green" />
              <h3 className="text-sm font-semibold text-vytal-text">
                Functional Movement Screen — {selected.date}
              </h3>
            </div>
            <div className="space-y-3">
              {fmsMovements.map((m) => (
                <div key={m.key} className="flex items-center justify-between">
                  <span className="text-sm text-vytal-muted">{m.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map((dot) => (
                        <div
                          key={dot}
                          className={cn(
                            "h-2.5 w-2.5 rounded-full",
                            dot <= selected.fms[m.key] ? "bg-vytal-green" : "bg-vytal-bg3"
                          )}
                        />
                      ))}
                    </div>
                    <span className="w-6 text-right text-sm font-semibold text-vytal-text">
                      {selected.fms[m.key]}
                    </span>
                  </div>
                </div>
              ))}
              <div className="mt-4 border-t border-vytal-border pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-vytal-text">{t("assessments.totalScore")}</span>
                  <span className="text-lg font-bold text-vytal-green">{getTotalFMS(selected.fms)}/21</span>
                </div>
                <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-vytal-bg3">
                  <div
                    className="h-full rounded-full bg-vytal-green transition-all"
                    style={{ width: `${(getTotalFMS(selected.fms) / 21) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Other Tests Card */}
          <div className="space-y-4">
            {/* Flexibility */}
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4 text-vytal-blue" />
                <h4 className="text-sm font-semibold text-vytal-text">{t("assessments.flexibility")}</h4>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[11px] text-vytal-muted">Sit & Reach</p>
                  <p className="text-lg font-bold text-vytal-text">{selected.flexibility.sitAndReach} cm</p>
                </div>
                <div>
                  <p className="text-[11px] text-vytal-muted">Shoulder L</p>
                  <p className="text-lg font-bold text-vytal-text">{selected.flexibility.shoulderMobilityLeft} cm</p>
                </div>
                <div>
                  <p className="text-[11px] text-vytal-muted">Shoulder R</p>
                  <p className="text-lg font-bold text-vytal-text">{selected.flexibility.shoulderMobilityRight} cm</p>
                </div>
              </div>
            </div>

            {/* Endurance */}
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-vytal-amber" />
                <h4 className="text-sm font-semibold text-vytal-text">{t("assessments.endurance")}</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-vytal-muted">Cooper Test</p>
                  <p className="text-lg font-bold text-vytal-text">{selected.endurance.cooperTest} m</p>
                </div>
                <div>
                  <p className="text-[11px] text-vytal-muted">Beep Test</p>
                  <p className="text-lg font-bold text-vytal-text">Level {selected.endurance.beepTestLevel}</p>
                </div>
              </div>
            </div>

            {/* Strength */}
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-vytal-red" />
                <h4 className="text-sm font-semibold text-vytal-text">{t("assessments.strength")}</h4>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[11px] text-vytal-muted">Squat/BW</p>
                  <p className="text-lg font-bold text-vytal-text">{selected.strength.backSquatToBodyweight}x</p>
                </div>
                <div>
                  <p className="text-[11px] text-vytal-muted">Deadlift/BW</p>
                  <p className="text-lg font-bold text-vytal-text">{selected.strength.deadliftToBodyweight}x</p>
                </div>
                <div>
                  <p className="text-[11px] text-vytal-muted">Bench/BW</p>
                  <p className="text-lg font-bold text-vytal-text">{selected.strength.benchPressToBodyweight}x</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Chart */}
      {chartData.length > 1 && (
        <div className="rounded-xl border border-vytal-border bg-vytal-card/80 p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("assessments.progressChart")}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="rgba(34,197,94,0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 21]} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: "#22c55e", r: 4 }} name="FMS Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
