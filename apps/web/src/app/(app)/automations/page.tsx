"use client";

import { useState, useCallback, useEffect } from "react";
import {
  UserX,
  Cake,
  UserMinus,
  UserPlus,
  Mail,
  MessageSquare,
  Bell,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/toast";
import { useI18n } from "@/lib/i18n";

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------
const AUTOMATIONS_KEY = "vytal-automations";

interface AutomationStates {
  noShow: boolean;
  birthday: boolean;
  winBack: boolean;
  onboarding: boolean;
}

function loadAutomationStates(): AutomationStates {
  if (typeof window === "undefined")
    return { noShow: true, birthday: true, winBack: false, onboarding: true };
  try {
    const raw = localStorage.getItem(AUTOMATIONS_KEY);
    if (!raw)
      return { noShow: true, birthday: true, winBack: false, onboarding: true };
    return JSON.parse(raw) as AutomationStates;
  } catch {
    return { noShow: true, birthday: true, winBack: false, onboarding: true };
  }
}

function persistAutomationStates(states: AutomationStates) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTOMATIONS_KEY, JSON.stringify(states));
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

interface AutomationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  enabled: boolean;
  onToggle: () => void;
  lastTriggered: string;
  justEnabled: boolean;
  children: React.ReactNode;
}

function AutomationCard({
  title,
  description,
  icon,
  iconBg,
  enabled,
  onToggle,
  lastTriggered,
  justEnabled,
  children,
}: AutomationCardProps) {
  const { t } = useI18n();
  return (
    <div
      className={cn(
        "rounded-xl border bg-vytal-card p-6 transition-all duration-300",
        enabled
          ? "border-vytal-green/20"
          : "border-vytal-border opacity-75"
      )}
    >
      <div className="mb-5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              iconBg
            )}
          >
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-vytal-text">
                {title}
              </h3>
              {/* Status indicator */}
              <span
                className={cn(
                  "h-2 w-2 rounded-full transition-colors duration-300",
                  enabled ? "bg-vytal-green" : "bg-vytal-muted/40"
                )}
              />
            </div>
            <p className="text-xs text-vytal-muted">{description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300",
            enabled ? "bg-vytal-green" : "bg-vytal-bg3"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-300",
              enabled ? "left-[22px]" : "left-0.5"
            )}
          />
        </button>
      </div>

      <div className={cn(
        "mb-4 flex items-center gap-1.5 text-[10px] text-vytal-muted",
        justEnabled && "animate-pulse"
      )}>
        <Clock className="h-3 w-3" />
        {t("automations.lastTriggered").replace("{time}", lastTriggered)}
      </div>

      {enabled && <div className="space-y-4 border-t border-vytal-border pt-4">{children}</div>}
    </div>
  );
}

function ChannelCheckboxes({
  channels,
  onChange,
}: {
  channels: { push: boolean; email: boolean; sms: boolean };
  onChange: (channels: { push: boolean; email: boolean; sms: boolean }) => void;
}) {
  return (
    <div className="flex gap-3">
      {(
        [
          { key: "push", label: "Push", icon: <Bell className="h-3 w-3" /> },
          { key: "email", label: "Email", icon: <Mail className="h-3 w-3" /> },
          { key: "sms", label: "SMS", icon: <MessageSquare className="h-3 w-3" /> },
        ] as const
      ).map((ch) => (
        <label
          key={ch.key}
          className={cn(
            "flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
            channels[ch.key]
              ? "border-vytal-green/30 bg-vytal-green/10 text-vytal-green"
              : "border-vytal-border text-vytal-muted"
          )}
        >
          <input
            type="checkbox"
            checked={channels[ch.key]}
            onChange={(e) =>
              onChange({ ...channels, [ch.key]: e.target.checked })
            }
            className="sr-only"
          />
          {ch.icon}
          {ch.label}
        </label>
      ))}
    </div>
  );
}

export default function AutomationsPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  // Load persisted states
  const [automationStates, setAutomationStates] = useState<AutomationStates>(
    () => loadAutomationStates()
  );
  const [justEnabled, setJustEnabled] = useState<Record<string, boolean>>({});

  // Persist on change
  useEffect(() => {
    persistAutomationStates(automationStates);
  }, [automationStates]);

  // No-show
  const [noShowLastTriggered, setNoShowLastTriggered] = useState("2 days ago");
  const [noShowDays, setNoShowDays] = useState(14);
  const [noShowMessage, setNoShowMessage] = useState(
    "Hey {name}, we miss you! It's been {days} days since your last visit. Come back and crush a WOD with us!"
  );
  const [noShowChannels, setNoShowChannels] = useState({
    push: true,
    email: true,
    sms: false,
  });

  // Birthday
  const [birthdayLastTriggered, setBirthdayLastTriggered] = useState("5 days ago");
  const [birthdayOffer, setBirthdayOffer] = useState(
    "Happy Birthday {name}! Enjoy a free guest pass for a friend this week."
  );
  const [birthdayTiming, setBirthdayTiming] = useState<"on_day" | "day_before">(
    "on_day"
  );

  // Win-back
  const [winBackLastTriggered, setWinBackLastTriggered] = useState("12 days ago");
  const [winBackDays, setWinBackDays] = useState(21);
  const [winBackInterval, setWinBackInterval] = useState(3);
  const [winBackMessages, setWinBackMessages] = useState([
    "Hey {name}, we noticed you haven't been around lately. Everything ok?",
    "We've got some exciting new programming this week. Would love to see you back!",
    "Special offer: Come back this week and get 20% off your next month!",
  ]);

  // Onboarding
  const [onboardingLastTriggered, setOnboardingLastTriggered] = useState("1 day ago");
  const [onboardingSteps, setOnboardingSteps] = useState([
    {
      day: "D+0",
      label: "Welcome",
      content: "Welcome to {box_name}, {name}! We're thrilled to have you.",
      channel: { push: true, email: true, sms: false },
    },
    {
      day: "D+1",
      label: "Profile",
      content:
        "Complete your profile to get the most out of your membership. Add your PRs and goals!",
      channel: { push: true, email: false, sms: false },
    },
    {
      day: "D+3",
      label: "First Class",
      content:
        "Ready for your first class? Book a session and our coaches will take great care of you.",
      channel: { push: true, email: true, sms: false },
    },
    {
      day: "D+7",
      label: "Check-in",
      content:
        "How's your first week going? Reply to this message if you have any questions!",
      channel: { push: false, email: true, sms: true },
    },
  ]);

  const handleToggle = useCallback(
    (
      key: keyof AutomationStates,
      name: string,
      setLastTriggered: (v: string) => void
    ) => {
      const newState = !automationStates[key];
      setAutomationStates((prev) => ({ ...prev, [key]: newState }));
      if (newState) {
        setLastTriggered(t("automations.justNow"));
        setJustEnabled((prev) => ({ ...prev, [key]: true }));
        // Clear pulse after 3s
        setTimeout(() => {
          setJustEnabled((prev) => ({ ...prev, [key]: false }));
        }, 3000);
        toast(`${name} ${t("automations.enabled")}`, "success");
      } else {
        toast(`${name} ${t("automations.disabled")}`, "info");
      }
    },
    [automationStates, toast, t]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-vytal-text">{t("automations.title")}</h1>
        <p className="mt-1 text-sm text-vytal-muted">
          {t("automations.subtitle")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* No-Show */}
        <AutomationCard
          title={t("automations.noShowAlert")}
          description={t("automations.noShowDesc")}
          icon={<UserX className="h-5 w-5 text-vytal-red" />}
          iconBg="bg-vytal-red/10"
          enabled={automationStates.noShow}
          onToggle={() =>
            handleToggle("noShow", t("automations.noShowAlert"), setNoShowLastTriggered)
          }
          lastTriggered={noShowLastTriggered}
          justEnabled={!!justEnabled.noShow}
        >
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
              {t("automations.triggerAfterDays")}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={30}
                value={noShowDays}
                onChange={(e) => setNoShowDays(Number(e.target.value))}
                className="flex-1 accent-vytal-green"
              />
              <span className="w-12 text-right font-mono text-sm font-semibold text-vytal-text">
                {noShowDays}d
              </span>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
              {t("automations.messageTemplate")}
            </label>
            <textarea
              value={noShowMessage}
              onChange={(e) => setNoShowMessage(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
              {t("automations.channel")}
            </label>
            <ChannelCheckboxes
              channels={noShowChannels}
              onChange={setNoShowChannels}
            />
          </div>
        </AutomationCard>

        {/* Birthday */}
        <AutomationCard
          title={t("automations.birthday")}
          description={t("automations.birthdayDesc")}
          icon={<Cake className="h-5 w-5 text-vytal-amber" />}
          iconBg="bg-vytal-amber/10"
          enabled={automationStates.birthday}
          onToggle={() =>
            handleToggle("birthday", t("automations.birthday"), setBirthdayLastTriggered)
          }
          lastTriggered={birthdayLastTriggered}
          justEnabled={!!justEnabled.birthday}
        >
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
              {t("automations.offerText")}
            </label>
            <textarea
              value={birthdayOffer}
              onChange={(e) => setBirthdayOffer(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
              {t("automations.sendTiming")}
            </label>
            <div className="flex gap-3">
              {(
                [
                  { value: "on_day", labelKey: "automations.onTheDay" },
                  { value: "day_before", labelKey: "automations.dayBefore" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBirthdayTiming(opt.value)}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-xs font-medium transition-colors",
                    birthdayTiming === opt.value
                      ? "border-vytal-green/30 bg-vytal-green/10 text-vytal-green"
                      : "border-vytal-border text-vytal-muted hover:text-vytal-text"
                  )}
                >
                  {t(opt.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </AutomationCard>

        {/* Win-back */}
        <AutomationCard
          title={t("automations.winBack")}
          description={t("automations.winBackDesc")}
          icon={<UserMinus className="h-5 w-5 text-vytal-blue" />}
          iconBg="bg-vytal-blue/10"
          enabled={automationStates.winBack}
          onToggle={() =>
            handleToggle("winBack", t("automations.winBack"), setWinBackLastTriggered)
          }
          lastTriggered={winBackLastTriggered}
          justEnabled={!!justEnabled.winBack}
        >
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
              {t("automations.inactiveDays")}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={7}
                max={60}
                value={winBackDays}
                onChange={(e) => setWinBackDays(Number(e.target.value))}
                className="flex-1 accent-vytal-green"
              />
              <span className="w-12 text-right font-mono text-sm font-semibold text-vytal-text">
                {winBackDays}d
              </span>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
              {t("automations.intervalDays")}
            </label>
            <input
              type="number"
              min={1}
              max={14}
              value={winBackInterval}
              onChange={(e) => setWinBackInterval(Number(e.target.value))}
              className="w-24 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-xs font-medium uppercase tracking-wider text-vytal-muted">
              {t("automations.messageSequence").replace("{count}", "3")}
            </label>
            {winBackMessages.map((msg, i) => (
              <div key={i}>
                <span className="mb-1 block text-[10px] font-semibold text-vytal-muted">
                  {t("automations.messageN").replace("{n}", String(i + 1))}
                </span>
                <textarea
                  value={msg}
                  onChange={(e) => {
                    const updated = [...winBackMessages];
                    updated[i] = e.target.value;
                    setWinBackMessages(updated);
                  }}
                  rows={2}
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>
            ))}
          </div>
        </AutomationCard>

        {/* Onboarding */}
        <AutomationCard
          title={t("automations.onboarding")}
          description={t("automations.onboardingDesc")}
          icon={<UserPlus className="h-5 w-5 text-vytal-green" />}
          iconBg="bg-vytal-green/10"
          enabled={automationStates.onboarding}
          onToggle={() =>
            handleToggle(
              "onboarding",
              t("automations.onboarding"),
              setOnboardingLastTriggered
            )
          }
          lastTriggered={onboardingLastTriggered}
          justEnabled={!!justEnabled.onboarding}
        >
          <div className="space-y-4">
            {onboardingSteps.map((step, i) => (
              <div
                key={i}
                className="space-y-2 rounded-lg border border-vytal-border bg-vytal-bg2 p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded bg-vytal-green/10 px-2 py-0.5 text-[10px] font-bold text-vytal-green">
                    {step.day}
                  </span>
                  <span className="text-sm font-semibold text-vytal-text">
                    {step.label}
                  </span>
                </div>
                <textarea
                  value={step.content}
                  onChange={(e) => {
                    const updated = [...onboardingSteps];
                    updated[i] = { ...updated[i], content: e.target.value };
                    setOnboardingSteps(updated);
                  }}
                  rows={2}
                  className="w-full rounded border border-vytal-border bg-vytal-bg px-2 py-1.5 text-xs text-vytal-text focus:border-vytal-green/30 focus:outline-none"
                />
                <ChannelCheckboxes
                  channels={step.channel}
                  onChange={(ch) => {
                    const updated = [...onboardingSteps];
                    updated[i] = { ...updated[i], channel: ch };
                    setOnboardingSteps(updated);
                  }}
                />
              </div>
            ))}
          </div>
        </AutomationCard>
      </div>
    </div>
  );
}
