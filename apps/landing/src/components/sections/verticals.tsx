"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  Dumbbell,
  Activity,
  Building2,
  Flower2,
  PersonStanding,
  Swords,
  Target,
  Waves,
  Music,
  HeartPulse,
  Trophy,
  Mountain,
  Bike,
  Footprints,
  Medal,
  Stethoscope,
  Weight,
  Flame,
  Sailboat,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@vytal-fit/brand";

// ── Verticals Marquee ────────────────────────────────────────────────────────
const VERTICALS: { Icon: LucideIcon; key: string }[] = [
  { Icon: Dumbbell, key: "crossfit_box" },
  { Icon: Activity, key: "functional_training" },
  { Icon: Building2, key: "gym" },
  { Icon: Flower2, key: "yoga_studio" },
  { Icon: PersonStanding, key: "pilates_studio" },
  { Icon: Swords, key: "martial_arts" },
  { Icon: Target, key: "personal_training" },
  { Icon: Waves, key: "swimming" },
  { Icon: Music, key: "dance_studio" },
  { Icon: HeartPulse, key: "health_club" },
  { Icon: Trophy, key: "sports_club" },
  { Icon: Mountain, key: "climbing_gym" },
  { Icon: Bike, key: "cycling_studio" },
  { Icon: Footprints, key: "running_club" },
  { Icon: Medal, key: "gymnastics_academy" },
  { Icon: Stethoscope, key: "rehabilitation" },
  { Icon: Weight, key: "weightlifting_club" },
  { Icon: Flame, key: "bootcamp" },
  { Icon: Sailboat, key: "surf_water_sports" },
  { Icon: Plus, key: "other" },
];

function MarqueeRow({
  pills,
  reverse,
  reduced,
}: {
  pills: { Icon: LucideIcon; label: string }[];
  reverse?: boolean;
  reduced: boolean;
}) {
  const doubled = [...pills, ...pills];
  return (
    <div
      className="marquee-track gap-3 py-2"
      style={{
        animationDirection: reverse ? "reverse" : undefined,
        animationPlayState: reduced ? "paused" : undefined,
      }}
    >
      {doubled.map((pill, i) => (
        <motion.div
          key={i}
          whileHover={reduced ? undefined : { y: -3, scale: 1.03 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(34,197,94,0.15)] bg-[color-mix(in_srgb,var(--color-vytal-bg3)_60%,transparent)] backdrop-blur-sm shrink-0 mx-1.5 hover:border-[rgba(34,197,94,0.4)] hover:bg-[rgba(34,197,94,0.07)] transition-colors duration-150 cursor-default"
        >
          <pill.Icon size={13} className="text-vytal-green shrink-0" />
          <span className="text-xs font-medium text-vytal-text whitespace-nowrap">{pill.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

export function VerticalsMarquee({ t }: { t: (k: string) => string }) {
  const reduced = useReducedMotion() ?? false;
  const pills = VERTICALS.map((v) => ({ Icon: v.Icon, label: t(`v_${v.key}`) }));
  const half = Math.ceil(pills.length / 2);
  const rowA = pills.slice(0, half);
  const rowB = pills.slice(half);

  return (
    <section className="pt-20 pb-10 border-t border-[rgba(34,197,94,0.08)] overflow-hidden">
      <Reveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)] mb-4">
            <span className="text-xs font-medium text-vytal-green">Verticais</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-vytal-text mb-3">
            {t("verticalsTitle")}{" "}
            <span
              className="font-normal italic bg-gradient-to-r from-vytal-green to-[#86efac] bg-clip-text text-transparent"
              style={{ fontFamily: "var(--font-accent), serif" }}
            >
              {t("verticalsTitleHighlight")}
            </span>
          </h2>
          <p className="text-vytal-muted text-sm max-w-lg mx-auto">{t("verticalsSubtitle")}</p>
        </div>

        {/* Dual-direction marquee */}
        <div className="relative w-full overflow-hidden">
          {/* Left fade */}
          <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to right, var(--color-vytal-bg), transparent)" }} />
          {/* Right fade */}
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to left, var(--color-vytal-bg), transparent)" }} />
          <MarqueeRow pills={rowA} reduced={reduced} />
          <MarqueeRow pills={rowB} reverse reduced={reduced} />
        </div>
      </Reveal>
    </section>
  );
}
