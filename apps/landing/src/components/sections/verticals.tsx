"use client";

import { Reveal } from "@vytal-fit/brand";
import { WaveDivider } from "@/components/decor";

// ── Verticals Marquee ────────────────────────────────────────────────────────
const VERTICALS = [
  { emoji: "🏋️", key: "crossfit_box" },
  { emoji: "💪", key: "functional_training" },
  { emoji: "💪", key: "gym" },
  { emoji: "🧘", key: "yoga_studio" },
  { emoji: "🎓", key: "pilates_studio" },
  { emoji: "🥊", key: "martial_arts" },
  { emoji: "🎯", key: "personal_training" },
  { emoji: "🏊", key: "swimming" },
  { emoji: "🩰", key: "dance_studio" },
  { emoji: "🏢", key: "health_club" },
  { emoji: "⚽", key: "sports_club" },
  { emoji: "🧗", key: "climbing_gym" },
  { emoji: "🚴", key: "cycling_studio" },
  { emoji: "🏃", key: "running_club" },
  { emoji: "🤸", key: "gymnastics_academy" },
  { emoji: "🏥", key: "rehabilitation" },
  { emoji: "🏆", key: "weightlifting_club" },
  { emoji: "☀️", key: "bootcamp" },
  { emoji: "🏄", key: "surf_water_sports" },
  { emoji: "➕", key: "other" },
];

export function VerticalsMarquee({ t }: { t: (k: string) => string }) {
  const pills = VERTICALS.map((v) => ({ emoji: v.emoji, label: t(`v_${v.key}`) }));
  const doubled = [...pills, ...pills];

  return (
    <section className="py-20 border-t border-[rgba(34,197,94,0.08)] overflow-hidden">
      <WaveDivider color="rgba(34,197,94,0.03)" />
      <Reveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)] mb-4">
            <span className="text-xs font-medium text-vytal-green">Verticais</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-vytal-text mb-3">
            {t("verticalsTitle")}{" "}
            <span className="bg-gradient-to-r from-vytal-green to-vytal-blue bg-clip-text text-transparent">
              {t("verticalsTitleHighlight")}
            </span>
          </h2>
          <p className="text-vytal-muted text-sm max-w-lg mx-auto">{t("verticalsSubtitle")}</p>
        </div>

        {/* Marquee */}
        <div className="relative w-full overflow-hidden">
          {/* Left fade */}
          <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to right, var(--color-vytal-bg), transparent)" }} />
          {/* Right fade */}
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to left, var(--color-vytal-bg), transparent)" }} />
          <div className="marquee-track gap-3 py-2">
            {doubled.map((pill, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(34,197,94,0.15)] bg-[color-mix(in_srgb,var(--color-vytal-bg3)_60%,transparent)] backdrop-blur-sm shrink-0 mx-1.5 hover:border-[rgba(34,197,94,0.4)] hover:bg-[rgba(34,197,94,0.07)] transition-all duration-150 cursor-default"
              >
                <span className="text-base leading-none">{pill.emoji}</span>
                <span className="text-xs font-medium text-vytal-text whitespace-nowrap">{pill.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
