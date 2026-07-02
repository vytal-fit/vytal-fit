"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Users, Calendar, TrendingUp, ArrowRight, Play, ChevronDown } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";
import { Magnetic } from "@vytal-fit/brand";
import { KineticText, CountUp, EASE_OUT_EXPO } from "@vytal-fit/brand/motion";
import { NOISE_SVG } from "@/lib/constants";

// Cinematic hero: an inset, rounded "screen" filled with a dark training-floor
// video (Pexels free license, re-encoded 720p24), green-graded with gradient +
// noise overlays. Content enters on a choreographed timeline once the video
// can play. Reduced-motion users get the static poster and instant text.

const ENTER = { duration: 0.9, ease: EASE_OUT_EXPO } as const;

// ── Floating UI Cards (Hero decorations, mouse-parallax) ─────────────────────
function FloatingCard({
  depth,
  mx,
  my,
  delay,
  ready,
  className,
  style,
  children,
}: {
  depth: number;
  mx: MotionValue<number>;
  my: MotionValue<number>;
  delay: number;
  ready: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const x = useTransform(mx, (v) => v * depth);
  const y = useTransform(my, (v) => v * depth);
  return (
    <motion.div
      className={`absolute hidden lg:block ${className ?? ""}`}
      style={{ ...style, x, y }}
      initial={{ opacity: 0, scale: 0.85, y: 24 }}
      animate={ready ? { opacity: 1, scale: 1, y: 0 } : undefined}
      transition={{ ...ENTER, delay }}
    >
      {children}
    </motion.div>
  );
}

function StatsCardBody() {
  return (
    <div
      className="flex flex-col gap-1.5 p-3.5 rounded-xl border border-[rgba(34,197,94,0.25)] bg-black/55 backdrop-blur-md shadow-xl shadow-black/40 w-[150px]"
      style={{ animation: "landing-float 6s ease-in-out infinite" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-5 h-5 rounded-md bg-[rgba(34,197,94,0.2)] flex items-center justify-center">
          <TrendingUp size={10} className="text-vytal-green" />
        </div>
        <span className="text-[9px] font-medium text-white/60 uppercase tracking-wider">Revenue</span>
      </div>
      <span className="text-lg font-bold text-white">+32%</span>
      <div className="flex gap-0.5">
        {[40, 55, 35, 65, 50, 70, 80, 60, 90, 75].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-vytal-green"
            style={{ height: `${h * 0.25}px`, opacity: 0.3 + (h / 100) * 0.7 }}
          />
        ))}
      </div>
    </div>
  );
}

function CalendarCardBody() {
  return (
    <div
      className="flex flex-col gap-1.5 p-3.5 rounded-xl border border-[rgba(0,212,255,0.25)] bg-black/55 backdrop-blur-md shadow-xl shadow-black/40 w-[140px]"
      style={{ animation: "landing-float-delayed 7s ease-in-out infinite", animationDelay: "1s" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-5 h-5 rounded-md bg-[rgba(0,212,255,0.2)] flex items-center justify-center">
          <Calendar size={10} className="text-vytal-blue" />
        </div>
        <span className="text-[9px] font-medium text-white/60 uppercase tracking-wider">Today</span>
      </div>
      <div className="space-y-1">
        {["09:00 CrossFit", "10:30 Yoga", "17:00 HIIT"].map((cls, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div
              className="w-1 h-1 rounded-full"
              style={{ background: ["var(--color-vytal-green)", "var(--color-vytal-purple)", "var(--color-vytal-amber)"][i] }}
            />
            <span className="text-[9px] text-white/60">{cls}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MembersCardBody() {
  return (
    <div
      className="flex flex-col gap-1 p-3 rounded-xl border border-[rgba(192,132,252,0.25)] bg-black/55 backdrop-blur-md shadow-xl shadow-black/40 w-[130px]"
      style={{ animation: "landing-float 8s ease-in-out infinite", animationDelay: "2s" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-5 h-5 rounded-md bg-[rgba(192,132,252,0.2)] flex items-center justify-center">
          <Users size={10} className="text-vytal-purple" />
        </div>
        <span className="text-[9px] font-medium text-white/60 uppercase tracking-wider">Active</span>
      </div>
      <span className="text-lg font-bold text-white">247</span>
      <span className="text-[9px] text-vytal-green">+12 this week</span>
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
export function Hero({ t }: { t: (k: string) => string }) {
  const reduced = useReducedMotion();
  const [videoReady, setVideoReady] = useState(false);
  const [timedIn, setTimedIn] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  // Content enters when the video can play, or after a grace period if it
  // stalls (slow network), so the page never sits empty.
  useEffect(() => {
    const id = setTimeout(() => setTimedIn(true), 1400);
    return () => clearTimeout(id);
  }, []);
  const ready = Boolean(reduced) || videoReady || timedIn;

  // Mouse-driven parallax + cursor spotlight (desktop, spring-smoothed).
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 60, damping: 20, mass: 0.8 });
  const my = useSpring(rawY, { stiffness: 60, damping: 20, mass: 0.8 });
  const spotX = useMotionValue(-1000);
  const spotY = useMotionValue(-1000);
  const spotXs = useSpring(spotX, { stiffness: 200, damping: 30 });
  const spotYs = useSpring(spotY, { stiffness: 200, damping: 30 });
  const spotlight = useTransform(
    [spotXs, spotYs],
    ([x, y]) =>
      `radial-gradient(circle 340px at ${x}px ${y}px, rgba(34,197,94,0.16), rgba(34,197,94,0.05) 45%, transparent 70%)`
  );

  function onPointerMove(e: React.PointerEvent) {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set(((e.clientX - rect.left) / rect.width - 0.5) * 2 * -14);
    rawY.set(((e.clientY - rect.top) / rect.height - 0.5) * 2 * -10);
    spotX.set(e.clientX - rect.left);
    spotY.set(e.clientY - rect.top);
  }
  function onPointerLeave() {
    rawX.set(0);
    rawY.set(0);
    spotX.set(-1000);
    spotY.set(-1000);
  }

  // Headline: sans-bold lead, serif-italic green-gradient close (last 3 words).
  const words = t("headline").split(" ");
  const lead = words.slice(0, -3).join(" ");
  const close = words.slice(-3).join(" ");

  return (
    <section className="relative p-3 sm:p-4">
      <div
        ref={frameRef}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="relative flex min-h-[calc(100svh-1.5rem)] sm:min-h-[calc(100svh-2rem)] flex-col items-center justify-center overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-black"
      >
        {/* Video backdrop (poster-only under reduced motion) */}
        {reduced ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src="/hero/hero-poster.jpg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: "brightness(0.55) saturate(0.9)" }}
          />
        ) : (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: "brightness(0.55) saturate(0.9)" }}
            src="/hero/hero-loop.mp4"
            poster="/hero/hero-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onCanPlay={() => setVideoReady(true)}
            aria-hidden="true"
          />
        )}

        {/* Color grade: green wash + vignette gradients */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 115%, rgba(34,197,94,0.28), transparent 55%), linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.72))",
          }}
        />
        {/* Cursor spotlight reveal */}
        {!reduced && (
          <motion.div
            className="absolute inset-0 pointer-events-none hidden lg:block"
            style={{ background: spotlight, mixBlendMode: "screen" }}
          />
        )}
        {/* Film grain */}
        <div
          className="absolute inset-0 pointer-events-none opacity-70"
          style={{ backgroundImage: NOISE_SVG }}
        />

        {/* Floating UI cards */}
        <FloatingCard depth={18} mx={mx} my={my} delay={1.15} ready={ready} style={{ top: "13%", right: "3.5%" }}>
          <StatsCardBody />
        </FloatingCard>
        <FloatingCard depth={30} mx={mx} my={my} delay={1.3} ready={ready} style={{ bottom: "24%", left: "6%" }}>
          <CalendarCardBody />
        </FloatingCard>
        <FloatingCard depth={24} mx={mx} my={my} delay={1.45} ready={ready} style={{ top: "56%", right: "4%" }}>
          <MembersCardBody />
        </FloatingCard>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-5xl px-4 pb-20 pt-28 text-center sm:px-6 lg:px-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={ready ? { opacity: 1, y: 0 } : undefined}
            transition={{ ...ENTER, delay: 0.1 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-[rgba(34,197,94,0.35)] bg-black/40 px-4 py-1.5 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-vytal-green" />
            <span className="text-xs font-medium tracking-wide text-vytal-green">{t("badge")}</span>
          </motion.div>

          {/* Headline: kinetic, sans lead + serif-italic gradient close */}
          <h1 className="mb-6 text-[clamp(2.75rem,8vw,6.5rem)] font-bold leading-[0.98] tracking-[-0.03em] text-white">
            {ready && (
              <>
                <KineticText text={lead} delay={0.25} stagger={0.07} />{" "}
                <KineticText
                  text={close}
                  delay={0.25 + lead.split(" ").length * 0.07}
                  stagger={0.09}
                  className="font-normal italic"
                  unitClassName="bg-gradient-to-r from-vytal-green to-[#86efac] bg-clip-text text-transparent"
                  style={{ fontFamily: "var(--font-accent), serif", letterSpacing: "-0.01em" }}
                />
              </>
            )}
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : undefined}
            transition={{ ...ENTER, delay: 0.95 }}
            className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg"
          >
            {t("subtitle")}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : undefined}
            transition={{ ...ENTER, delay: 1.1 }}
            className="mb-16 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Magnetic>
              <div className="animated-gradient-border rounded-[14px] p-[1.5px]">
                <Link
                  href="/signup"
                  className="vy-shimmer inline-flex items-center gap-2 rounded-xl bg-vytal-green px-7 py-3.5 text-sm font-semibold text-black shadow-lg shadow-[rgba(34,197,94,0.35)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#16a34a] hover:shadow-[rgba(34,197,94,0.5)]"
                >
                  {t("ctaStart")}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </Magnetic>
            <Link
              href="/@crossfit-aveiro"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-black/30 px-7 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-all duration-150 hover:border-vytal-green/60 hover:bg-[rgba(34,197,94,0.1)]"
            >
              <Play size={15} className="text-vytal-green" />
              {t("ctaDemo")}
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={ready ? { opacity: 1, y: 0 } : undefined}
            transition={{ ...ENTER, delay: 1.25 }}
            className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md sm:grid-cols-4"
          >
            {[
              { to: 20, suffix: "+", label: t("statVerticals") },
              { to: 500, suffix: "+", label: t("statFeatures") },
              { to: 3, suffix: "", label: t("statLangs") },
              { to: 100, suffix: "%", label: t("statLocal") },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center justify-center bg-black/45 px-4 py-5">
                <span className="text-2xl font-bold text-vytal-green">
                  <CountUp to={s.to} suffix={s.suffix} duration={1.8} />
                </span>
                <span className="mt-0.5 text-xs text-white/60">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : undefined}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2"
          aria-hidden="true"
        >
          <motion.div
            animate={reduced ? undefined : { y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown size={18} className="text-white/50" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
