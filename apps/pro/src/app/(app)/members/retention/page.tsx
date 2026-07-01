"use client";

import { useState, useMemo, useCallback } from "react";
import { Bell, Mail, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { trpc } from "@/lib/trpc";

type TabKey = "w1_4" | "w5_8" | "w9_12" | "w13_16";

const tabs: { key: TabKey; label: string; weekOffset: number }[] = [
  { key: "w1_4", label: "Week 1-4", weekOffset: 0 },
  { key: "w5_8", label: "Week 5-8", weekOffset: 4 },
  { key: "w9_12", label: "Week 9-12", weekOffset: 8 },
  { key: "w13_16", label: "Week 13-16", weekOffset: 12 },
];

type AttendanceColor = "green" | "yellow" | "orange" | "red" | "gray";

interface WeekAttendance {
  sessions: number;
  color: AttendanceColor;
}

interface NewMember {
  id: string;
  name: string;
  coach: string;
  joinWeek: number; // 0-based window column they joined in
  weeklyAttendance: number[]; // sessions per week for 16 weeks
}

function getAdvantageColor(index: number): string {
  if (index >= 75) return "text-vytal-green";
  if (index >= 50) return "text-vytal-amber";
  if (index >= 25) return "text-vytal-orange";
  return "text-vytal-red";
}

function getAdvantageBarColor(index: number): string {
  if (index >= 75) return "bg-vytal-green";
  if (index >= 50) return "bg-vytal-amber";
  if (index >= 25) return "bg-vytal-orange";
  return "bg-vytal-red";
}

const colorMap: Record<AttendanceColor, string> = {
  green: "bg-vytal-green",
  yellow: "bg-vytal-amber",
  orange: "bg-vytal-orange",
  red: "bg-vytal-red",
  gray: "bg-vytal-muted/40",
};

const colorTooltips: Record<AttendanceColor, string> = {
  green: "On track (3+ sessions)",
  yellow: "Below target (1-2 sessions)",
  orange: "At risk (0 sessions, grace period)",
  red: "Disengaging (0 sessions, 2+ weeks)",
  gray: "Not yet in this period",
};

export default function RetentionMonitorPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>("w1_4");
  const retentionQuery = trpc.members.retention.useQuery();
  const members: NewMember[] = useMemo(() => retentionQuery.data ?? [], [retentionQuery.data]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [thresholdGreen, setThresholdGreen] = useState(3);
  const [thresholdYellow, setThresholdYellow] = useState(1);
  const [advantageThreshold, setAdvantageThreshold] = useState(50);

  const activeTabConfig = tabs.find((tab) => tab.key === activeTab)!;

  // Compute color for each week based on thresholds
  const getWeekColor = useCallback(
    (member: NewMember, weekIndex: number): AttendanceColor => {
      // weekIndex is absolute (0-15)
      if (weekIndex < member.joinWeek) return "gray";
      const sessions = member.weeklyAttendance[weekIndex];
      if (sessions >= thresholdGreen) return "green";
      if (sessions >= thresholdYellow) return "yellow";
      // Check for consecutive zero weeks
      if (sessions === 0) {
        // Check if previous week was also 0
        if (weekIndex > 0 && member.weeklyAttendance[weekIndex - 1] === 0) {
          return "red";
        }
        return "orange";
      }
      return "yellow";
    },
    [thresholdGreen, thresholdYellow]
  );

  // Compute advantage index for each member (0-100%)
  const computeAdvantageIndex = useCallback(
    (member: NewMember): number => {
      const relevantWeeks = member.weeklyAttendance.filter((_, i) => i >= member.joinWeek);
      if (relevantWeeks.length === 0) return 0;
      const totalPossible = relevantWeeks.length * thresholdGreen;
      const totalAttended = relevantWeeks.reduce((sum, s) => sum + Math.min(s, thresholdGreen), 0);
      return Math.round((totalAttended / totalPossible) * 100);
    },
    [thresholdGreen]
  );

  // Get weeks for current tab
  const getTabWeeks = useCallback(
    (member: NewMember): WeekAttendance[] => {
      const offset = activeTabConfig.weekOffset;
      return Array.from({ length: 4 }, (_, i) => {
        const weekIdx = offset + i;
        return {
          sessions: member.weeklyAttendance[weekIdx],
          color: getWeekColor(member, weekIdx),
        };
      });
    },
    [activeTabConfig.weekOffset, getWeekColor]
  );

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(members.map((m) => m.id)));
  }

  function deselectAll() {
    setSelectedIds(new Set());
  }

  const selectedCount = selectedIds.size;
  const selectedNames = members.filter((m) => selectedIds.has(m.id)).map((m) => m.name);

  const handleBulkNotification = useCallback(() => {
    toast(t("toast.pushSent").replace("{count}", String(selectedCount)).replace("{names}", selectedNames.join(", ")), "success");
    deselectAll();
  }, [selectedCount, selectedNames, toast, t]);

  const handleBulkEmail = useCallback(() => {
    toast(t("toast.emailSentMembers").replace("{count}", String(selectedCount)).replace("{names}", selectedNames.join(", ")), "success");
    deselectAll();
  }, [selectedCount, selectedNames, toast, t]);

  const handleBulkSMS = useCallback(() => {
    toast(t("toast.smsSentMembers").replace("{count}", String(selectedCount)).replace("{names}", selectedNames.join(", ")), "success");
    deselectAll();
  }, [selectedCount, selectedNames, toast, t]);

  // Filter members below advantage threshold (for highlighting)
  const atRiskCount = useMemo(() => {
    return members.filter((m) => computeAdvantageIndex(m) < advantageThreshold).length;
  }, [members, computeAdvantageIndex, advantageThreshold]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("members.title"), href: "/members" }, { label: t("retention.title") }]} />

      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("retention.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("retention.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-full bg-vytal-red/10 px-3 py-1 text-xs font-medium text-vytal-red">
            {t("retention.atRiskCount").replace("{count}", String(atRiskCount))}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-vytal-green/10 text-vytal-green"
                : "bg-vytal-bg2 text-vytal-muted hover:text-vytal-text"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-vytal-green/20 bg-vytal-green/5 p-3">
          <span className="text-sm text-vytal-green">{selectedCount} {t("retention.selected")}</span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkNotification}
              className="flex items-center gap-1 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
            >
              <Bell className="h-3 w-3" /> {t("retention.notification")}
            </button>
            <button
              onClick={handleBulkEmail}
              className="flex items-center gap-1 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
            >
              <Mail className="h-3 w-3" /> {t("retention.email")}
            </button>
            <button
              onClick={handleBulkSMS}
              className="flex items-center gap-1 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
            >
              <Smartphone className="h-3 w-3" /> {t("retention.sms")}
            </button>
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={selectAll}
              className="text-xs text-vytal-muted underline hover:text-vytal-text"
            >
              {t("retention.selectAll")}
            </button>
            <button
              onClick={deselectAll}
              className="text-xs text-vytal-muted underline hover:text-vytal-text"
            >
              {t("retention.deselectAll")}
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Member Cards */}
        <div className="space-y-3 lg:col-span-3">
          {members.length === 0 && (
            <div className="rounded-xl border border-dashed border-vytal-border bg-vytal-card p-10 text-center text-sm text-vytal-muted">
              {t("retention.empty")}
            </div>
          )}
          {members.map((member) => {
            const initials = member.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
            const weekData = getTabWeeks(member);
            const advantageIndex = computeAdvantageIndex(member);
            const isAtRisk = advantageIndex < advantageThreshold;
            const isSelected = selectedIds.has(member.id);

            return (
              <div
                key={member.id}
                onClick={() => toggleSelect(member.id)}
                className={cn(
                  "flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors",
                  isSelected
                    ? "border-vytal-green/30 bg-vytal-green/5"
                    : isAtRisk
                    ? "border-vytal-red/20 bg-vytal-card hover:border-vytal-red/40"
                    : "border-vytal-border bg-vytal-card hover:border-[rgba(61,255,110,0.22)]"
                )}
              >
                {/* Checkbox */}
                <div className={cn(
                  "flex h-5 w-5 items-center justify-center rounded border",
                  isSelected ? "border-vytal-green bg-vytal-green" : "border-vytal-border"
                )}>
                  {isSelected && <span className="text-xs font-bold text-vytal-bg">&#10003;</span>}
                </div>

                {/* Avatar */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-vytal-green/10 text-sm font-bold text-vytal-green">
                  {initials}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-vytal-text">{member.name}</p>
                  {member.coach && (
                    <p className="text-xs text-vytal-muted">{t("retention.coach")}: {member.coach}</p>
                  )}
                </div>

                {/* Attendance Dots with session counts */}
                <div className="flex gap-2">
                  {weekData.map((week, i) => (
                    <div key={i} className="text-center" title={colorTooltips[week.color]}>
                      <div className={cn("flex h-8 w-10 items-center justify-center rounded", colorMap[week.color])}>
                        <span className="text-[10px] font-bold text-white/90">{week.color !== "gray" ? week.sessions : "-"}</span>
                      </div>
                      <span className="text-[9px] text-vytal-muted">W{activeTabConfig.weekOffset + i + 1}</span>
                    </div>
                  ))}
                </div>

                {/* Advantage Index with bar */}
                <div className="w-24 text-right">
                  <span className={cn("text-lg font-bold", getAdvantageColor(advantageIndex))}>
                    {advantageIndex}%
                  </span>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-vytal-bg3">
                    <div
                      className={cn("h-full rounded-full transition-all", getAdvantageBarColor(advantageIndex))}
                      style={{ width: `${advantageIndex}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-vytal-muted">{t("retention.advantage")}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Thresholds */}
        <div className="space-y-6">
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("retention.thresholds")}</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("retention.greenLabel")}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range" min={1} max={7} value={thresholdGreen}
                    onChange={(e) => setThresholdGreen(Number(e.target.value))}
                    className="flex-1 accent-vytal-green"
                  />
                  <span className="w-8 text-right font-mono text-sm font-semibold text-vytal-green">{thresholdGreen}</span>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("retention.yellowLabel")}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range" min={1} max={5} value={thresholdYellow}
                    onChange={(e) => setThresholdYellow(Number(e.target.value))}
                    className="flex-1 accent-vytal-amber"
                  />
                  <span className="w-8 text-right font-mono text-sm font-semibold text-vytal-amber">{thresholdYellow}</span>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("retention.advantageThreshold")}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range" min={10} max={90} step={5} value={advantageThreshold}
                    onChange={(e) => setAdvantageThreshold(Number(e.target.value))}
                    className="flex-1 accent-vytal-red"
                  />
                  <span className="w-8 text-right font-mono text-sm font-semibold text-vytal-red">{advantageThreshold}%</span>
                </div>
                <p className="mt-1 text-[10px] text-vytal-muted">
                  {t("retention.membersBelow").replace("{threshold}", String(advantageThreshold))}
                </p>
              </div>
              <div className="space-y-2 border-t border-vytal-border pt-4">
                <p className="text-xs text-vytal-muted">{t("retention.legend")}</p>
                <div className="flex items-center gap-2"><div className="h-3 w-6 rounded bg-vytal-green" /><span className="text-xs text-vytal-muted">{thresholdGreen}+ sessions - {t("retention.onTrack")}</span></div>
                <div className="flex items-center gap-2"><div className="h-3 w-6 rounded bg-vytal-amber" /><span className="text-xs text-vytal-muted">{thresholdYellow}-{thresholdGreen - 1} sessions - {t("retention.belowTarget")}</span></div>
                <div className="flex items-center gap-2"><div className="h-3 w-6 rounded bg-vytal-orange" /><span className="text-xs text-vytal-muted">0 sessions (grace) - {t("retention.atRisk")}</span></div>
                <div className="flex items-center gap-2"><div className="h-3 w-6 rounded bg-vytal-red" /><span className="text-xs text-vytal-muted">0 for 2+ weeks - {t("retention.disengaging")}</span></div>
                <div className="flex items-center gap-2"><div className="h-3 w-6 rounded bg-vytal-muted/40" /><span className="text-xs text-vytal-muted">{t("retention.noAttendance")}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
