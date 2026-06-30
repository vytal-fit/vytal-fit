"use client";

import { useEffect, useState } from "react";
import { Activity, Check, Moon, Battery, Brain, Smile, Flame, Heart, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";

type MetricKey = "sleep" | "fatigue" | "stress" | "mood";
type FeedbackKey = "rpe" | "enjoyment" | "injuryLimitation";

const METRICS: { key: MetricKey; labelKey: string; icon: typeof Moon; color: string }[] = [
  { key: "sleep", labelKey: "my.wellness.sleep", icon: Moon, color: "var(--color-vytal-blue)" },
  { key: "fatigue", labelKey: "my.wellness.fatigue", icon: Battery, color: "var(--color-vytal-amber)" },
  { key: "stress", labelKey: "my.wellness.stress", icon: Brain, color: "var(--color-vytal-red)" },
  { key: "mood", labelKey: "my.wellness.mood", icon: Smile, color: "var(--color-vytal-green)" },
];

const FEEDBACK: { key: FeedbackKey; labelKey: string; icon: typeof Moon; color: string }[] = [
  { key: "rpe", labelKey: "my.wellness.rpe", icon: Flame, color: "var(--color-vytal-amber)" },
  { key: "enjoyment", labelKey: "my.wellness.enjoyment", icon: Heart, color: "var(--color-vytal-green)" },
  { key: "injuryLimitation", labelKey: "my.wellness.injury", icon: AlertTriangle, color: "var(--color-vytal-red)" },
];

function todayYmd(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function WellnessPage() {
  const { t } = useI18n();
  const utils = trpc.useUtils();
  const day = todayYmd();

  const meQuery = trpc.members.me.useQuery();
  const memberId = meQuery.data?.id ?? null;

  const todayQuery = trpc.wellnessCheckins.forDay.useQuery(
    { memberId: memberId ?? "", date: day },
    { enabled: !!memberId },
  );

  const [values, setValues] = useState<Record<MetricKey, number>>({
    sleep: 7,
    fatigue: 4,
    stress: 3,
    mood: 7,
  });
  const [notes, setNotes] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [fb, setFb] = useState<Record<FeedbackKey, number>>({
    rpe: 7,
    enjoyment: 7,
    injuryLimitation: 1,
  });
  const [fbNotes, setFbNotes] = useState("");

  function flashToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  // Seed the sliders from an existing check-in for today.
  useEffect(() => {
    const c = todayQuery.data;
    if (!c) return;
    setValues({
      sleep: c.sleep ?? 7,
      fatigue: c.fatigue ?? 4,
      stress: c.stress ?? 3,
      mood: c.mood ?? 7,
    });
    setNotes(c.notes ?? "");
  }, [todayQuery.data]);

  const upsert = trpc.wellnessCheckins.upsert.useMutation({
    onSuccess: async () => {
      flashToast(t("my.wellness.saved"));
      await utils.wellnessCheckins.forDay.invalidate();
      await utils.wellnessCheckins.list.invalidate();
    },
  });

  const logFeedback = trpc.workoutFeedback.create.useMutation({
    onSuccess: async () => {
      flashToast(t("my.wellness.feedbackSaved"));
      await utils.workoutFeedback.list.invalidate();
    },
  });

  function save() {
    if (!memberId) return;
    upsert.mutate({ memberId, date: day, notes: notes.trim() || undefined, ...values });
  }

  function saveFeedback() {
    if (!memberId) return;
    logFeedback.mutate({ memberId, notes: fbNotes.trim() || undefined, ...fb });
  }

  const loading = meQuery.isLoading || (!!memberId && todayQuery.isLoading);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--color-vytal-green)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (!memberId) {
    return (
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
        >
          <Activity size={32} className="mx-auto mb-3" style={{ color: "var(--color-vytal-muted)", opacity: 0.4 }} />
          <p className="text-sm" style={{ color: "var(--color-vytal-muted)" }}>
            {t("my.wellness.noMember")}
          </p>
        </div>
      </div>
    );
  }

  const alreadyToday = !!todayQuery.data;

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
      {toast && (
        <div
          className="fixed top-20 left-4 right-4 z-50 rounded-2xl px-4 py-3 text-sm font-semibold shadow-2xl flex items-center gap-2"
          style={{ background: "var(--color-vytal-green)", color: "var(--color-vytal-bg)" }}
        >
          <Check size={15} />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "var(--color-vytal-text)" }}>
            {t("my.wellness.title")}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-vytal-muted)" }}>
            {t("my.wellness.subtitle")}
          </p>
        </div>
        <span
          className="px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider"
          style={{ background: "var(--color-vytal-bg3)", color: "var(--color-vytal-muted)" }}
        >
          {t("my.wellness.today")}
        </span>
      </div>

      {alreadyToday && (
        <p className="text-xs flex items-center gap-1.5" style={{ color: "var(--color-vytal-green)" }}>
          <Check size={13} /> {t("my.wellness.loggedToday")}
        </p>
      )}

      {/* Metric sliders */}
      <div className="space-y-3">
        {METRICS.map(({ key, labelKey, icon: Icon, color }) => (
          <div
            key={key}
            className="rounded-2xl p-4"
            style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-2 text-sm font-bold" style={{ color: "var(--color-vytal-text)" }}>
                <Icon size={15} style={{ color }} />
                {t(labelKey)}
              </span>
              <span className="font-mono text-lg font-black" style={{ color }}>
                {values[key]}
                <span className="text-[11px] font-normal" style={{ color: "var(--color-vytal-muted)" }}>/10</span>
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={values[key]}
              onChange={(e) => setValues((v) => ({ ...v, [key]: Number(e.target.value) }))}
              className="w-full"
              style={{ accentColor: color }}
              aria-label={t(labelKey)}
            />
            <div className="flex justify-between mt-1">
              <span className="text-[10px]" style={{ color: "var(--color-vytal-muted)" }}>{t("my.wellness.low")}</span>
              <span className="text-[10px]" style={{ color: "var(--color-vytal-muted)" }}>{t("my.wellness.high")}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "var(--color-vytal-muted)" }}>
          {t("my.wellness.notes")}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("my.wellness.notesPlaceholder")}
          rows={3}
          maxLength={2000}
          className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
          style={{
            background: "var(--color-vytal-bg3)",
            color: "var(--color-vytal-text)",
            border: "1px solid var(--color-vytal-border)",
          }}
        />
      </div>

      <button
        onClick={save}
        disabled={upsert.isPending}
        className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 hover:scale-[1.01] disabled:opacity-60"
        style={{ background: "var(--color-vytal-green)", color: "var(--color-vytal-bg)" }}
      >
        {t("my.wellness.save")}
      </button>

      {/* ── Post-workout feedback (D1) ── */}
      <div className="pt-2">
        <div className="mb-3">
          <h2 className="text-lg font-black" style={{ color: "var(--color-vytal-text)" }}>
            {t("my.wellness.feedbackTitle")}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-vytal-muted)" }}>
            {t("my.wellness.feedbackSubtitle")}
          </p>
        </div>

        <div className="space-y-3">
          {FEEDBACK.map(({ key, labelKey, icon: Icon, color }) => (
            <div
              key={key}
              className="rounded-2xl p-4"
              style={{ background: "var(--color-vytal-bg2)", border: "1px solid var(--color-vytal-border)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-2 text-sm font-bold" style={{ color: "var(--color-vytal-text)" }}>
                  <Icon size={15} style={{ color }} />
                  {t(labelKey)}
                </span>
                <span className="font-mono text-lg font-black" style={{ color }}>
                  {fb[key]}
                  <span className="text-[11px] font-normal" style={{ color: "var(--color-vytal-muted)" }}>/9</span>
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={9}
                step={1}
                value={fb[key]}
                onChange={(e) => setFb((v) => ({ ...v, [key]: Number(e.target.value) }))}
                className="w-full"
                style={{ accentColor: color }}
                aria-label={t(labelKey)}
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px]" style={{ color: "var(--color-vytal-muted)" }}>{t("my.wellness.low")}</span>
                <span className="text-[10px]" style={{ color: "var(--color-vytal-muted)" }}>{t("my.wellness.high")}</span>
              </div>
            </div>
          ))}
        </div>

        <textarea
          value={fbNotes}
          onChange={(e) => setFbNotes(e.target.value)}
          placeholder={t("my.wellness.notesPlaceholder")}
          rows={2}
          maxLength={2000}
          className="w-full mt-3 rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
          style={{
            background: "var(--color-vytal-bg3)",
            color: "var(--color-vytal-text)",
            border: "1px solid var(--color-vytal-border)",
          }}
        />

        <button
          onClick={saveFeedback}
          disabled={logFeedback.isPending}
          className="w-full mt-3 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 hover:scale-[1.01] disabled:opacity-60"
          style={{
            background: "var(--color-vytal-bg3)",
            color: "var(--color-vytal-text)",
            border: "1px solid var(--color-vytal-border)",
          }}
        >
          {t("my.wellness.feedbackSave")}
        </button>
      </div>
    </div>
  );
}
