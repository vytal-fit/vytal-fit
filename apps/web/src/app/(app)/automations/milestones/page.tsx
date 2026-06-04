"use client";

import { useState, useCallback } from "react";
import {
  Trophy,
  Star,
  Cake,
  Zap,
  Users,
  Calendar,
  Mail,
  Bell,
  Smartphone,
  Plus,
  X,
  Clock,
  Target,
  Award,
  Heart,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { Breadcrumbs } from "@/components/breadcrumbs";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MilestoneRule {
  id: string;
  name: string;
  trigger: string;
  description: string;
  icon: typeof Trophy;
  iconBg: string;
  iconColor: string;
  messageTemplate: string;
  channels: { email: boolean; push: boolean; sms: boolean };
  active: boolean;
}

interface RecentTrigger {
  id: string;
  milestoneName: string;
  memberName: string;
  memberInitials: string;
  date: string;
  dateLabel: string;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const initialMilestones: MilestoneRule[] = [
  {
    id: "ms-1",
    name: "First Class Completed",
    trigger: "Member completes their first class",
    description: "Send a congratulations message after the member finishes their first ever class.",
    icon: Star,
    iconBg: "bg-vytal-amber/10",
    iconColor: "text-vytal-amber",
    messageTemplate: "Congratulations {name}! You just completed your first class at {gym}! Keep going!",
    channels: { email: true, push: true, sms: false },
    active: true,
  },
  {
    id: "ms-2",
    name: "10th Class",
    trigger: "Member completes their 10th class",
    description: "Celebrate the 10th class milestone with a badge and social post.",
    icon: Trophy,
    iconBg: "bg-vytal-green/10",
    iconColor: "text-vytal-green",
    messageTemplate: "Amazing {name}! 10 classes done! You earned the 'Dedicated' badge!",
    channels: { email: true, push: true, sms: false },
    active: true,
  },
  {
    id: "ms-3",
    name: "50th Class",
    trigger: "Member completes their 50th class",
    description: "Award a certificate and send congratulatory email.",
    icon: Award,
    iconBg: "bg-vytal-blue/10",
    iconColor: "text-vytal-blue",
    messageTemplate: "Incredible achievement {name}! 50 classes completed! Your certificate is ready.",
    channels: { email: true, push: true, sms: true },
    active: true,
  },
  {
    id: "ms-4",
    name: "100th Class",
    trigger: "Member completes their 100th class",
    description: "Special badge and feature on the leaderboard.",
    icon: Zap,
    iconBg: "bg-vytal-amber/10",
    iconColor: "text-vytal-amber",
    messageTemplate: "LEGEND! {name} hit 100 classes! You are now featured on our Wall of Fame!",
    channels: { email: true, push: true, sms: true },
    active: true,
  },
  {
    id: "ms-5",
    name: "First PR",
    trigger: "Member sets their first personal record",
    description: "Celebrate the first PR with a push notification.",
    icon: Target,
    iconBg: "bg-vytal-red/10",
    iconColor: "text-vytal-red",
    messageTemplate: "New PR! {name}, you just set your first personal record! Keep pushing!",
    channels: { email: false, push: true, sms: false },
    active: true,
  },
  {
    id: "ms-6",
    name: "Birthday",
    trigger: "Member's birthday",
    description: "Send a birthday greeting via email and in-app message.",
    icon: Cake,
    iconBg: "bg-vytal-green/10",
    iconColor: "text-vytal-green",
    messageTemplate: "Happy Birthday {name}! Wishing you a fantastic day from everyone at {gym}!",
    channels: { email: true, push: true, sms: false },
    active: true,
  },
  {
    id: "ms-7",
    name: "1 Year Anniversary",
    trigger: "Member reaches 1 year since joining",
    description: "Celebrate the anniversary with a badge and email.",
    icon: Calendar,
    iconBg: "bg-vytal-blue/10",
    iconColor: "text-vytal-blue",
    messageTemplate: "1 year at {gym}! Thank you {name} for being part of our family! Here is your anniversary badge.",
    channels: { email: true, push: true, sms: false },
    active: true,
  },
  {
    id: "ms-8",
    name: "Perfect Month",
    trigger: "Member attends 20+ classes in a month",
    description: "Award an achievement badge for consistency.",
    icon: Star,
    iconBg: "bg-vytal-amber/10",
    iconColor: "text-vytal-amber",
    messageTemplate: "Perfect Month! {name}, you attended {count}+ classes this month! Incredible dedication!",
    channels: { email: true, push: true, sms: false },
    active: false,
  },
  {
    id: "ms-9",
    name: "Comeback",
    trigger: "Member returns after 30+ days of inactivity",
    description: "Send a welcome back message when a member returns.",
    icon: Heart,
    iconBg: "bg-vytal-red/10",
    iconColor: "text-vytal-red",
    messageTemplate: "Welcome back {name}! We missed you at {gym}. Great to have you training again!",
    channels: { email: true, push: true, sms: true },
    active: true,
  },
  {
    id: "ms-10",
    name: "Referral Converted",
    trigger: "A referred friend subscribes to a plan",
    description: "Thank the referrer and reward them.",
    icon: Users,
    iconBg: "bg-vytal-green/10",
    iconColor: "text-vytal-green",
    messageTemplate: "Thank you {name}! Your friend just joined {gym}! Here is your referral reward.",
    channels: { email: true, push: true, sms: false },
    active: true,
  },
];

const initialRecentTriggers: RecentTrigger[] = [
  { id: "rt-1", milestoneName: "10th Class", memberName: "Ana Silva", memberInitials: "AS", date: "2026-06-04", dateLabel: "Today" },
  { id: "rt-2", milestoneName: "Birthday", memberName: "Pedro Almeida", memberInitials: "PA", date: "2026-06-04", dateLabel: "Today" },
  { id: "rt-3", milestoneName: "First Class Completed", memberName: "Ricardo Mendes", memberInitials: "RM", date: "2026-06-03", dateLabel: "Yesterday" },
  { id: "rt-4", milestoneName: "Comeback", memberName: "Maria Oliveira", memberInitials: "MO", date: "2026-06-03", dateLabel: "Yesterday" },
  { id: "rt-5", milestoneName: "50th Class", memberName: "Sofia Santos", memberInitials: "SS", date: "2026-06-02", dateLabel: "2 days ago" },
  { id: "rt-6", milestoneName: "First PR", memberName: "Tiago Neves", memberInitials: "TN", date: "2026-06-02", dateLabel: "2 days ago" },
  { id: "rt-7", milestoneName: "Referral Converted", memberName: "Ines Ferreira", memberInitials: "IF", date: "2026-06-01", dateLabel: "3 days ago" },
  { id: "rt-8", milestoneName: "1 Year Anniversary", memberName: "Jose Fonte", memberInitials: "JF", date: "2026-06-01", dateLabel: "3 days ago" },
  { id: "rt-9", milestoneName: "Perfect Month", memberName: "Miguel Costa", memberInitials: "MC", date: "2026-05-31", dateLabel: "4 days ago" },
  { id: "rt-10", milestoneName: "100th Class", memberName: "Carolina Dias", memberInitials: "CD", date: "2026-05-30", dateLabel: "5 days ago" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MilestonesPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [milestones, setMilestones] = useState<MilestoneRule[]>(initialMilestones);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTemplate, setEditTemplate] = useState("");

  // New milestone form state
  const [newName, setNewName] = useState("");
  const [newTrigger, setNewTrigger] = useState("");
  const [newTemplate, setNewTemplate] = useState("");
  const [newChannels, setNewChannels] = useState({ email: true, push: true, sms: false });

  const handleToggleActive = useCallback(
    (id: string) => {
      setMilestones((prev) =>
        prev.map((ms) => (ms.id === id ? { ...ms, active: !ms.active } : ms))
      );
      const ms = milestones.find((m) => m.id === id);
      if (ms) {
        toast(
          `"${ms.name}" ${ms.active ? t("milestones.disabled") : t("milestones.enabled")}`,
          "success"
        );
      }
    },
    [milestones, toast, t]
  );

  const handleToggleChannel = useCallback(
    (id: string, channel: "email" | "push" | "sms") => {
      setMilestones((prev) =>
        prev.map((ms) =>
          ms.id === id
            ? { ...ms, channels: { ...ms.channels, [channel]: !ms.channels[channel] } }
            : ms
        )
      );
    },
    []
  );

  const handleEditTemplate = useCallback(
    (id: string) => {
      const ms = milestones.find((m) => m.id === id);
      if (ms) {
        setEditingId(id);
        setEditTemplate(ms.messageTemplate);
      }
    },
    [milestones]
  );

  const handleSaveTemplate = useCallback(() => {
    if (!editingId) return;
    setMilestones((prev) =>
      prev.map((ms) =>
        ms.id === editingId ? { ...ms, messageTemplate: editTemplate } : ms
      )
    );
    setEditingId(null);
    setEditTemplate("");
    toast(t("milestones.templateSaved"), "success");
  }, [editingId, editTemplate, toast, t]);

  const handleCreateMilestone = useCallback(() => {
    if (!newName.trim() || !newTrigger.trim()) return;
    const newMs: MilestoneRule = {
      id: `ms-${Date.now()}`,
      name: newName.trim(),
      trigger: newTrigger.trim(),
      description: newTrigger.trim(),
      icon: Star,
      iconBg: "bg-vytal-green/10",
      iconColor: "text-vytal-green",
      messageTemplate: newTemplate.trim() || `Congratulations {name}! ${newName.trim()}!`,
      channels: newChannels,
      active: true,
    };
    setMilestones((prev) => [...prev, newMs]);
    setNewName("");
    setNewTrigger("");
    setNewTemplate("");
    setNewChannels({ email: true, push: true, sms: false });
    setShowCreateForm(false);
    toast(t("milestones.milestoneCreated"), "success");
  }, [newName, newTrigger, newTemplate, newChannels, toast, t]);

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: t("nav.automations"), href: "/automations" },
          { label: t("milestones.title") },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-vytal-text">{t("milestones.title")}</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-medium text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Plus className="h-4 w-4" />
          {t("milestones.createMilestone")}
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="rounded-xl border border-vytal-green/30 bg-vytal-bg2 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-vytal-text">{t("milestones.createMilestone")}</h3>
            <button onClick={() => setShowCreateForm(false)} className="text-vytal-muted hover:text-vytal-text">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder={t("milestones.namePlaceholder")}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="rounded-lg border border-vytal-border bg-vytal-bg3 px-4 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none"
            />
            <input
              type="text"
              placeholder={t("milestones.triggerPlaceholder")}
              value={newTrigger}
              onChange={(e) => setNewTrigger(e.target.value)}
              className="rounded-lg border border-vytal-border bg-vytal-bg3 px-4 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none"
            />
            <textarea
              placeholder={t("milestones.templatePlaceholder")}
              value={newTemplate}
              onChange={(e) => setNewTemplate(e.target.value)}
              rows={2}
              className="col-span-2 rounded-lg border border-vytal-border bg-vytal-bg3 px-4 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none"
            />
            <div className="col-span-2 flex items-center gap-4">
              <span className="text-xs text-vytal-muted">{t("milestones.channels")}:</span>
              {(["email", "push", "sms"] as const).map((ch) => (
                <label key={ch} className="flex items-center gap-1.5 text-xs text-vytal-text">
                  <input
                    type="checkbox"
                    checked={newChannels[ch]}
                    onChange={() =>
                      setNewChannels((prev) => ({ ...prev, [ch]: !prev[ch] }))
                    }
                    className="rounded border-vytal-border accent-vytal-green"
                  />
                  {ch === "email" ? "Email" : ch === "push" ? "Push" : "SMS"}
                </label>
              ))}
            </div>
            <button
              onClick={handleCreateMilestone}
              disabled={!newName.trim() || !newTrigger.trim()}
              className="col-span-2 flex items-center justify-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-medium text-vytal-bg transition-colors hover:bg-vytal-green/90 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {t("milestones.createMilestone")}
            </button>
          </div>
        </div>
      )}

      {/* Milestone Rules */}
      <div className="grid grid-cols-2 gap-4">
        {milestones.map((ms) => {
          const MsIcon = ms.icon;
          const isEditing = editingId === ms.id;

          return (
            <div
              key={ms.id}
              className={cn(
                "rounded-xl border bg-vytal-bg2 p-5 transition-colors",
                ms.active ? "border-vytal-border" : "border-vytal-border/50 opacity-60"
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      ms.iconBg
                    )}
                  >
                    <MsIcon className={cn("h-5 w-5", ms.iconColor)} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-vytal-text">{ms.name}</h3>
                    <p className="text-[10px] text-vytal-muted">{ms.trigger}</p>
                  </div>
                </div>
                {/* Active toggle */}
                <button
                  onClick={() => handleToggleActive(ms.id)}
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    ms.active ? "bg-vytal-green" : "bg-vytal-bg3"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                      ms.active ? "translate-x-[22px]" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>

              {/* Message Template */}
              <div className="mt-3">
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editTemplate}
                      onChange={(e) => setEditTemplate(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-vytal-green/30 bg-vytal-bg3 px-3 py-2 text-xs text-vytal-text focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveTemplate}
                        className="rounded bg-vytal-green px-3 py-1 text-[10px] font-medium text-vytal-bg"
                      >
                        {t("action.save")}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-[10px] text-vytal-muted hover:text-vytal-text"
                      >
                        {t("action.cancel")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEditTemplate(ms.id)}
                    className="w-full rounded-lg bg-vytal-bg3 px-3 py-2 text-left text-xs text-vytal-muted transition-colors hover:text-vytal-text"
                  >
                    {ms.messageTemplate}
                  </button>
                )}
              </div>

              {/* Channels */}
              <div className="mt-3 flex items-center gap-3">
                {(["email", "push", "sms"] as const).map((ch) => {
                  const ChIcon = ch === "email" ? Mail : ch === "push" ? Bell : Smartphone;
                  return (
                    <button
                      key={ch}
                      onClick={() => handleToggleChannel(ms.id, ch)}
                      className={cn(
                        "flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors",
                        ms.channels[ch]
                          ? "bg-vytal-green/10 text-vytal-green"
                          : "bg-vytal-bg3 text-vytal-muted hover:text-vytal-text"
                      )}
                    >
                      <ChIcon className="h-3 w-3" />
                      {ch === "email" ? "Email" : ch === "push" ? "Push" : "SMS"}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Triggers */}
      <div className="rounded-xl border border-vytal-border bg-vytal-bg2">
        <div className="border-b border-vytal-border px-5 py-3">
          <h2 className="text-sm font-semibold text-vytal-text">{t("milestones.recentTriggers")}</h2>
        </div>
        <div className="divide-y divide-vytal-border/50">
          {initialRecentTriggers.map((trigger) => (
            <div key={trigger.id} className="flex items-center gap-3 px-5 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-vytal-green/10 text-[10px] font-bold text-vytal-green">
                {trigger.memberInitials}
              </div>
              <div className="flex-1">
                <p className="text-sm text-vytal-text">
                  <span className="font-semibold">{trigger.memberName}</span>
                  {" - "}
                  <span>{trigger.milestoneName}</span>
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-vytal-muted">
                <Clock className="h-3 w-3" />
                {trigger.dateLabel}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
