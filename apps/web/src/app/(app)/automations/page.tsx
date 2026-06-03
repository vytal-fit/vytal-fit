"use client";

import { useState } from "react";
import {
  Zap,
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

interface AutomationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  enabled: boolean;
  onToggle: () => void;
  lastTriggered: string;
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
  children,
}: AutomationCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-vytal-card p-6 transition-colors",
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
            <h3 className="text-base font-semibold text-vytal-text">
              {title}
            </h3>
            <p className="text-xs text-vytal-muted">{description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "relative h-6 w-11 shrink-0 rounded-full transition-colors",
            enabled ? "bg-vytal-green" : "bg-vytal-bg3"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
              enabled ? "left-[22px]" : "left-0.5"
            )}
          />
        </button>
      </div>

      <div className="mb-4 flex items-center gap-1.5 text-[10px] text-vytal-muted">
        <Clock className="h-3 w-3" />
        Last triggered: {lastTriggered}
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
  // No-show
  const [noShowEnabled, setNoShowEnabled] = useState(true);
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
  const [birthdayEnabled, setBirthdayEnabled] = useState(true);
  const [birthdayOffer, setBirthdayOffer] = useState(
    "Happy Birthday {name}! Enjoy a free guest pass for a friend this week."
  );
  const [birthdayTiming, setBirthdayTiming] = useState<"on_day" | "day_before">(
    "on_day"
  );

  // Win-back
  const [winBackEnabled, setWinBackEnabled] = useState(false);
  const [winBackDays, setWinBackDays] = useState(21);
  const [winBackInterval, setWinBackInterval] = useState(3);
  const [winBackMessages, setWinBackMessages] = useState([
    "Hey {name}, we noticed you haven't been around lately. Everything ok?",
    "We've got some exciting new programming this week. Would love to see you back!",
    "Special offer: Come back this week and get 20% off your next month!",
  ]);

  // Onboarding
  const [onboardingEnabled, setOnboardingEnabled] = useState(true);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-vytal-text">Automations</h1>
        <p className="mt-1 text-sm text-vytal-muted">
          Configure automated workflows and member communications
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* No-Show */}
        <AutomationCard
          title="No-Show Alert"
          description="Nudge members who haven't checked in"
          icon={<UserX className="h-5 w-5 text-vytal-red" />}
          iconBg="bg-vytal-red/10"
          enabled={noShowEnabled}
          onToggle={() => setNoShowEnabled(!noShowEnabled)}
          lastTriggered="2 days ago"
        >
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
              Trigger after (days without check-in)
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
              Message Template
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
              Channel
            </label>
            <ChannelCheckboxes
              channels={noShowChannels}
              onChange={setNoShowChannels}
            />
          </div>
        </AutomationCard>

        {/* Birthday */}
        <AutomationCard
          title="Birthday"
          description="Celebrate your members' birthdays"
          icon={<Cake className="h-5 w-5 text-vytal-amber" />}
          iconBg="bg-vytal-amber/10"
          enabled={birthdayEnabled}
          onToggle={() => setBirthdayEnabled(!birthdayEnabled)}
          lastTriggered="5 days ago"
        >
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
              Offer Text
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
              Send Timing
            </label>
            <div className="flex gap-3">
              {(
                [
                  { value: "on_day", label: "On the day" },
                  { value: "day_before", label: "Day before" },
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
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </AutomationCard>

        {/* Win-back */}
        <AutomationCard
          title="Win-Back"
          description="Re-engage inactive members with a message sequence"
          icon={<UserMinus className="h-5 w-5 text-vytal-blue" />}
          iconBg="bg-vytal-blue/10"
          enabled={winBackEnabled}
          onToggle={() => setWinBackEnabled(!winBackEnabled)}
          lastTriggered="12 days ago"
        >
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
              Inactive for (days)
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
              Interval between messages (days)
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
              Message Sequence (3 messages)
            </label>
            {winBackMessages.map((msg, i) => (
              <div key={i}>
                <span className="mb-1 block text-[10px] font-semibold text-vytal-muted">
                  Message {i + 1}
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
          title="New Member Onboarding"
          description="Welcome sequence for new members"
          icon={<UserPlus className="h-5 w-5 text-vytal-green" />}
          iconBg="bg-vytal-green/10"
          enabled={onboardingEnabled}
          onToggle={() => setOnboardingEnabled(!onboardingEnabled)}
          lastTriggered="1 day ago"
        >
          <div className="space-y-4">
            {onboardingSteps.map((step, i) => (
              <div
                key={i}
                className="rounded-lg border border-vytal-border bg-vytal-bg2 p-3 space-y-2"
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
