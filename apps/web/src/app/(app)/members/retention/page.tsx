"use client";

import { useState } from "react";
import { Bell, Mail, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

type TabKey = "w1_4" | "w5_8" | "w9_12" | "w13_16";

const tabs: { key: TabKey; label: string }[] = [
  { key: "w1_4", label: "Week 1-4" },
  { key: "w5_8", label: "Week 5-8" },
  { key: "w9_12", label: "Week 9-12" },
  { key: "w13_16", label: "Week 13-16" },
];

type AttendanceColor = "green" | "yellow" | "orange" | "red" | "gray";

interface NewMember {
  id: string;
  name: string;
  coach: string;
  weeks: AttendanceColor[];
  advantageIndex: number;
  selected: boolean;
}

const mockNewMembers: NewMember[] = [
  {
    id: "nm-1", name: "Tiago Neves", coach: "Andre Loureiro",
    weeks: ["green", "green", "yellow", "green"], advantageIndex: 85, selected: false,
  },
  {
    id: "nm-2", name: "Catarina Reis", coach: "Marine Robba",
    weeks: ["green", "green", "green", "green"], advantageIndex: 95, selected: false,
  },
  {
    id: "nm-3", name: "Diogo Martins", coach: "Ricardo Ribeiro",
    weeks: ["green", "yellow", "orange", "red"], advantageIndex: 42, selected: false,
  },
  {
    id: "nm-4", name: "Helena Cardoso", coach: "Andre Loureiro",
    weeks: ["green", "green", "yellow", "yellow"], advantageIndex: 68, selected: false,
  },
  {
    id: "nm-5", name: "Rui Goncalves", coach: "Marine Robba",
    weeks: ["yellow", "orange", "red", "gray"], advantageIndex: 22, selected: false,
  },
  {
    id: "nm-6", name: "Francisca Nunes", coach: "Ricardo Ribeiro",
    weeks: ["green", "green", "green", "yellow"], advantageIndex: 78, selected: false,
  },
];

const colorMap: Record<AttendanceColor, string> = {
  green: "bg-vytal-green",
  yellow: "bg-vytal-amber",
  orange: "bg-vytal-orange",
  red: "bg-vytal-red",
  gray: "bg-vytal-muted/40",
};

function getAdvantageColor(index: number): string {
  if (index >= 75) return "text-vytal-green";
  if (index >= 50) return "text-vytal-amber";
  if (index >= 25) return "text-vytal-orange";
  return "text-vytal-red";
}

export default function RetentionMonitorPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("w1_4");
  const [members, setMembers] = useState(mockNewMembers);
  const [thresholdGreen, setThresholdGreen] = useState(3);
  const [thresholdYellow, setThresholdYellow] = useState(2);

  function toggleSelect(id: string) {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, selected: !m.selected } : m))
    );
  }

  const selectedCount = members.filter((m) => m.selected).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-vytal-text">Retention Monitor</h1>
        <p className="mt-1 text-sm text-vytal-muted">
          Track new member attendance and engagement
        </p>
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
          <span className="text-sm text-vytal-green">{selectedCount} selected</span>
          <div className="flex gap-2">
            <button className="flex items-center gap-1 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs font-medium text-vytal-text transition-colors hover:bg-vytal-bg3">
              <Bell className="h-3 w-3" /> Notification
            </button>
            <button className="flex items-center gap-1 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs font-medium text-vytal-text transition-colors hover:bg-vytal-bg3">
              <Mail className="h-3 w-3" /> Email
            </button>
            <button className="flex items-center gap-1 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs font-medium text-vytal-text transition-colors hover:bg-vytal-bg3">
              <Smartphone className="h-3 w-3" /> SMS
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Member Cards */}
        <div className="space-y-3 lg:col-span-3">
          {members.map((member) => {
            const initials = member.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
            return (
              <div
                key={member.id}
                onClick={() => toggleSelect(member.id)}
                className={cn(
                  "flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors",
                  member.selected
                    ? "border-vytal-green/30 bg-vytal-green/5"
                    : "border-vytal-border bg-vytal-card hover:border-[rgba(61,255,110,0.22)]"
                )}
              >
                {/* Checkbox */}
                <div className={cn(
                  "flex h-5 w-5 items-center justify-center rounded border",
                  member.selected ? "border-vytal-green bg-vytal-green" : "border-vytal-border"
                )}>
                  {member.selected && <span className="text-xs font-bold text-vytal-bg">&#10003;</span>}
                </div>

                {/* Avatar */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-vytal-green/10 text-sm font-bold text-vytal-green">
                  {initials}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-vytal-text">{member.name}</p>
                  <p className="text-xs text-vytal-muted">Coach: {member.coach}</p>
                </div>

                {/* Attendance Dots */}
                <div className="flex gap-2">
                  {member.weeks.map((color, i) => (
                    <div key={i} className="text-center">
                      <div className={cn("h-4 w-8 rounded", colorMap[color])} />
                      <span className="text-[9px] text-vytal-muted">W{i + 1}</span>
                    </div>
                  ))}
                </div>

                {/* Advantage Index */}
                <div className="text-right">
                  <span className={cn("text-lg font-bold", getAdvantageColor(member.advantageIndex))}>
                    {member.advantageIndex}%
                  </span>
                  <p className="text-[10px] text-vytal-muted">Advantage</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Thresholds */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">Thresholds</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Green (min sessions/week)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range" min={1} max={5} value={thresholdGreen}
                  onChange={(e) => setThresholdGreen(Number(e.target.value))}
                  className="flex-1 accent-vytal-green"
                />
                <span className="w-8 text-right font-mono text-sm font-semibold text-vytal-green">{thresholdGreen}</span>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Yellow (min sessions/week)
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
            <div className="space-y-2 border-t border-vytal-border pt-4">
              <p className="text-xs text-vytal-muted">Legend:</p>
              <div className="flex items-center gap-2"><div className="h-3 w-6 rounded bg-vytal-green" /><span className="text-xs text-vytal-muted">On track</span></div>
              <div className="flex items-center gap-2"><div className="h-3 w-6 rounded bg-vytal-amber" /><span className="text-xs text-vytal-muted">Below target</span></div>
              <div className="flex items-center gap-2"><div className="h-3 w-6 rounded bg-vytal-orange" /><span className="text-xs text-vytal-muted">At risk</span></div>
              <div className="flex items-center gap-2"><div className="h-3 w-6 rounded bg-vytal-red" /><span className="text-xs text-vytal-muted">Disengaging</span></div>
              <div className="flex items-center gap-2"><div className="h-3 w-6 rounded bg-vytal-muted/40" /><span className="text-xs text-vytal-muted">No attendance</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
