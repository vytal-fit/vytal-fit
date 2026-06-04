"use client";

import { useState } from "react";
import { Save, CalendarDays, Clock, AlertTriangle, Users, ListChecks, Clipboard } from "lucide-react";
import { useToast } from "@/components/toast";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { cn } from "@/lib/utils";

function NumberInput({
  value,
  onChange,
  min = 0,
  max = 999,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!isNaN(v) && v >= min && v <= max) onChange(v);
        }}
        min={min}
        max={max}
        className="w-20 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-center font-mono text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
      />
      {suffix && <span className="text-xs text-vytal-muted">{suffix}</span>}
    </div>
  );
}

function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        enabled ? "bg-vytal-green" : "bg-vytal-bg3"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
          enabled ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

function RuleCard({
  icon,
  title,
  description,
  children,
  enabled,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  enabled?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div className={cn("rounded-xl border border-vytal-border bg-vytal-card p-6", enabled === false && "opacity-60")}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vytal-green/10 text-vytal-green">
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-vytal-text">{title}</h3>
            <p className="text-xs text-vytal-muted">{description}</p>
          </div>
        </div>
        {onToggle && <ToggleSwitch enabled={enabled ?? true} onChange={onToggle} />}
      </div>
      {(enabled === undefined || enabled) && <div className="space-y-4">{children}</div>}
    </div>
  );
}

export default function BookingRulesPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [bookingDays, setBookingDays] = useState(7);
  const [bookingHours, setBookingHours] = useState(0);
  const [cancellationHours, setCancellationHours] = useState(2);
  const [noShowThreshold, setNoShowThreshold] = useState(3);
  const [noShowDays, setNoShowDays] = useState(30);
  const [noShowReduceHours, setNoShowReduceHours] = useState(4);
  const [noShowEnabled, setNoShowEnabled] = useState(true);
  const [waitlistEnabled, setWaitlistEnabled] = useState(true);
  const [waitlistMax, setWaitlistMax] = useState(5);
  const [autoPromote, setAutoPromote] = useState(true);
  const [maxPerWeek, setMaxPerWeek] = useState(0);
  const [maxPerMonth, setMaxPerMonth] = useState(0);
  const [classLimitsEnabled, setClassLimitsEnabled] = useState(false);
  const [registrationMode, setRegistrationMode] = useState<"beginning" | "minutes" | "custom">("minutes");
  const [registrationMinutes, setRegistrationMinutes] = useState(30);
  const [scoreMode, setScoreMode] = useState<"always" | "afterClass" | "nextDay">("always");

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t("settings.title"), href: "/settings" },
          { label: t("bookingRules.title") },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold text-vytal-text">{t("bookingRules.title")}</h1>
        <p className="mt-1 text-sm text-vytal-muted">{t("bookingRules.subtitle")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Booking Window */}
        <RuleCard
          icon={<CalendarDays className="h-4 w-4" />}
          title={t("bookingRules.bookingWindow")}
          description={t("bookingRules.bookingWindowDesc")}
        >
          <div className="flex flex-wrap items-center gap-3">
            <NumberInput value={bookingDays} onChange={setBookingDays} suffix={t("bookingRules.days")} />
            <span className="text-xs text-vytal-muted">{t("bookingRules.and")}</span>
            <NumberInput value={bookingHours} onChange={setBookingHours} max={23} suffix={t("bookingRules.hours")} />
          </div>
        </RuleCard>

        {/* Cancellation Deadline */}
        <RuleCard
          icon={<Clock className="h-4 w-4" />}
          title={t("bookingRules.cancellationDeadline")}
          description={t("bookingRules.cancellationDeadlineDesc")}
        >
          <select
            value={cancellationHours}
            onChange={(e) => setCancellationHours(parseInt(e.target.value, 10))}
            className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
          >
            {[1, 2, 3, 4, 6, 8, 12, 24].map((h) => (
              <option key={h} value={h}>{h} {t("bookingRules.hoursBefore")}</option>
            ))}
          </select>
        </RuleCard>

        {/* No-Show Penalty */}
        <RuleCard
          icon={<AlertTriangle className="h-4 w-4" />}
          title={t("bookingRules.noShowPenalty")}
          description={t("bookingRules.noShowPenaltyDesc")}
          enabled={noShowEnabled}
          onToggle={() => setNoShowEnabled((v) => !v)}
        >
          <div className="flex flex-wrap items-center gap-3">
            <NumberInput value={noShowThreshold} onChange={setNoShowThreshold} min={1} max={10} suffix={t("bookingRules.noShows")} />
            <NumberInput value={noShowDays} onChange={setNoShowDays} min={7} max={90} suffix={t("bookingRules.inDays")} />
            <NumberInput value={noShowReduceHours} onChange={setNoShowReduceHours} min={1} max={48} suffix={t("bookingRules.reduceTo")} />
          </div>
        </RuleCard>

        {/* Waitlist */}
        <RuleCard
          icon={<Users className="h-4 w-4" />}
          title={t("bookingRules.waitlistSettings")}
          description={t("bookingRules.enableWaitlist")}
          enabled={waitlistEnabled}
          onToggle={() => setWaitlistEnabled((v) => !v)}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-vytal-muted">{t("bookingRules.maxPerClass")}</span>
              <NumberInput value={waitlistMax} onChange={setWaitlistMax} min={1} max={50} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-vytal-muted">{t("bookingRules.autoPromote")}</span>
              <ToggleSwitch enabled={autoPromote} onChange={() => setAutoPromote((v) => !v)} />
            </div>
          </div>
        </RuleCard>

        {/* Class Limits */}
        <RuleCard
          icon={<ListChecks className="h-4 w-4" />}
          title={t("bookingRules.classLimits")}
          description={t("bookingRules.classLimitsDesc")}
          enabled={classLimitsEnabled}
          onToggle={() => setClassLimitsEnabled((v) => !v)}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-vytal-muted">{t("bookingRules.perWeek")}</span>
              <NumberInput value={maxPerWeek} onChange={setMaxPerWeek} max={30} suffix="" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-vytal-muted">{t("bookingRules.perMonth")}</span>
              <NumberInput value={maxPerMonth} onChange={setMaxPerMonth} max={100} suffix="" />
            </div>
            <p className="text-[10px] text-vytal-muted">0 = {t("bookingRules.custom")}</p>
          </div>
        </RuleCard>

        {/* Registration Rules */}
        <RuleCard
          icon={<CalendarDays className="h-4 w-4" />}
          title={t("bookingRules.registrationRules")}
          description={t("bookingRules.registrationOpens")}
        >
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(["beginning", "minutes", "custom"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setRegistrationMode(mode)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    registrationMode === mode
                      ? "bg-vytal-green/10 text-vytal-green border border-vytal-green/30"
                      : "bg-vytal-bg3 text-vytal-muted border border-vytal-border hover:text-vytal-text"
                  )}
                >
                  {mode === "beginning"
                    ? t("bookingRules.fromBeginning")
                    : mode === "minutes"
                      ? t("bookingRules.minutesBefore")
                      : t("bookingRules.custom")}
                </button>
              ))}
            </div>
            {registrationMode === "minutes" && (
              <NumberInput
                value={registrationMinutes}
                onChange={setRegistrationMinutes}
                min={5}
                max={120}
                suffix={t("bookingRules.minutesBefore")}
              />
            )}
          </div>
        </RuleCard>

        {/* Score Registration */}
        <RuleCard
          icon={<Clipboard className="h-4 w-4" />}
          title={t("bookingRules.scoreRegistration")}
          description={t("bookingRules.scoreAvailable")}
        >
          <div className="flex flex-wrap gap-2">
            {(["always", "afterClass", "nextDay"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setScoreMode(mode)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  scoreMode === mode
                    ? "bg-vytal-green/10 text-vytal-green border border-vytal-green/30"
                    : "bg-vytal-bg3 text-vytal-muted border border-vytal-border hover:text-vytal-text"
                )}
              >
                {t(`bookingRules.${mode}`)}
              </button>
            ))}
          </div>
        </RuleCard>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={() => toast(t("bookingRules.saved"), "success")}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Save className="h-4 w-4" />
          {t("bookingRules.save")}
        </button>
      </div>
    </div>
  );
}
