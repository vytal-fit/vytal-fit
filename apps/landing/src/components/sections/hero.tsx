"use client";

import Link from "next/link";
import { Users, Calendar, TrendingUp, ArrowRight, Play } from "lucide-react";
import { LogoLayer, AnimatedMark, Spotlight, Magnetic } from "@vytal-fit/brand";
import { DotGrid } from "@/components/decor";

// ── Floating UI Cards (Hero decorations) ─────────────────────────────────────
function FloatingStatsCard() {
  return (
    <div
      className="absolute hidden lg:flex flex-col gap-1.5 p-3.5 rounded-xl border border-[rgba(34,197,94,0.2)] bg-[color-mix(in_srgb,var(--color-vytal-bg)_85%,transparent)] backdrop-blur-md shadow-xl shadow-black/30 w-[150px]"
      style={{
        top: "18%",
        right: "6%",
        animation: "landing-float 6s ease-in-out infinite",
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-5 h-5 rounded-md bg-[rgba(34,197,94,0.15)] flex items-center justify-center">
          <TrendingUp size={10} className="text-vytal-green" />
        </div>
        <span className="text-[9px] font-medium text-vytal-muted uppercase tracking-wider">Revenue</span>
      </div>
      <span className="text-lg font-bold text-vytal-text">+32%</span>
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

function FloatingCalendarCard() {
  return (
    <div
      className="absolute hidden lg:flex flex-col gap-1.5 p-3.5 rounded-xl border border-[rgba(0,212,255,0.2)] bg-[color-mix(in_srgb,var(--color-vytal-bg)_85%,transparent)] backdrop-blur-md shadow-xl shadow-black/30 w-[140px]"
      style={{
        bottom: "22%",
        left: "5%",
        animation: "landing-float-delayed 7s ease-in-out infinite",
        animationDelay: "1s",
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-5 h-5 rounded-md bg-[rgba(0,212,255,0.15)] flex items-center justify-center">
          <Calendar size={10} className="text-vytal-blue" />
        </div>
        <span className="text-[9px] font-medium text-vytal-muted uppercase tracking-wider">Today</span>
      </div>
      <div className="space-y-1">
        {["09:00 CrossFit", "10:30 Yoga", "17:00 HIIT"].map((cls, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full" style={{ background: ["var(--color-vytal-green)", "var(--color-vytal-purple)", "var(--color-vytal-amber)"][i] }} />
            <span className="text-[9px] text-vytal-muted">{cls}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FloatingMembersCard() {
  return (
    <div
      className="absolute hidden lg:flex flex-col gap-1 p-3 rounded-xl border border-[rgba(192,132,252,0.2)] bg-[color-mix(in_srgb,var(--color-vytal-bg)_85%,transparent)] backdrop-blur-md shadow-xl shadow-black/30 w-[130px]"
      style={{
        top: "55%",
        right: "3%",
        animation: "landing-float 8s ease-in-out infinite",
        animationDelay: "2s",
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-5 h-5 rounded-md bg-[rgba(192,132,252,0.15)] flex items-center justify-center">
          <Users size={10} className="text-vytal-purple" />
        </div>
        <span className="text-[9px] font-medium text-vytal-muted uppercase tracking-wider">Active</span>
      </div>
      <span className="text-lg font-bold text-vytal-text">247</span>
      <span className="text-[9px] text-vytal-green">+12 this week</span>
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
export function Hero({ t }: { t: (k: string) => string }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Vytal brand backdrop — breathing mark watermark + drifting glow + grid */}
      <LogoLayer intensity="bold" />

      {/* Dot grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <DotGrid />
      </div>

      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-[0.07] animate-auth-gradient"
          style={{
            background: "radial-gradient(circle, var(--color-vytal-green) 0%, transparent 70%)",
            top: "-150px",
            left: "-100px",
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-[0.05] animate-auth-gradient-delayed"
          style={{
            background: "radial-gradient(circle, var(--color-vytal-blue) 0%, transparent 70%)",
            top: "30%",
            right: "-150px",
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-[0.04] animate-auth-gradient"
          style={{
            background: "radial-gradient(circle, var(--color-vytal-purple) 0%, transparent 70%)",
            bottom: "-100px",
            left: "30%",
            animationDelay: "5s",
          }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(34,197,94,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Floating UI cards */}
      <FloatingStatsCard />
      <FloatingCalendarCard />
      <FloatingMembersCard />

      <Spotlight size={620} className="relative z-10 w-full">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center page-enter">
        {/* Large animated mark — hero focal accent */}
        <AnimatedMark size={128} animated className="vy-breathe mx-auto mb-6" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.06)] mb-8 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-vytal-green animate-pulse" />
          <span className="text-xs font-medium text-vytal-green tracking-wide">
            {t("badge")}
          </span>
        </div>

        {/* Headline — bold editorial scale with gradient text */}
        <h1 className="text-[clamp(3rem,9vw,7rem)] font-bold text-vytal-text leading-[0.98] tracking-[-0.02em] mb-6">
          <span className="bg-gradient-to-r from-vytal-green to-[#4ade80] bg-clip-text text-transparent">{t("headline").split(" ").slice(0, 3).join(" ")}</span>{" "}
          {t("headline").split(" ").slice(3).join(" ")}
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-vytal-muted max-w-2xl mx-auto leading-relaxed mb-10">
          {t("subtitle")}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-16">
          {/* Animated gradient border CTA */}
          <Magnetic>
            <div className="rounded-[14px] p-[1.5px] animated-gradient-border">
              <Link
                href="/signup"
                className="vy-shimmer inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-vytal-green text-vytal-bg font-semibold text-sm hover:bg-[#16a34a] transition-all duration-150 shadow-lg shadow-[rgba(34,197,94,0.25)] hover:shadow-[rgba(34,197,94,0.4)] hover:-translate-y-0.5"
              >
                {t("ctaStart")}
                <ArrowRight size={16} />
              </Link>
            </div>
          </Magnetic>
          <Link
            href="/@crossfit-aveiro"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-[rgba(34,197,94,0.25)] text-vytal-text font-medium text-sm hover:border-[rgba(34,197,94,0.5)] hover:bg-[rgba(34,197,94,0.05)] transition-all duration-150 backdrop-blur-sm"
          >
            <Play size={15} className="text-vytal-green" />
            {t("ctaDemo")}
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[rgba(34,197,94,0.1)] rounded-2xl overflow-hidden border border-[rgba(34,197,94,0.1)] backdrop-blur-sm">
          {[
            { value: "20+", label: t("statVerticals") },
            { value: "500+", label: t("statFeatures") },
            { value: "3", label: t("statLangs") },
            { value: "100%", label: t("statLocal") },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center justify-center py-5 px-4 bg-vytal-bg/80 hover:bg-[rgba(34,197,94,0.04)] transition-colors"
            >
              <span className="text-2xl font-bold text-vytal-green">{s.value}</span>
              <span className="text-xs text-vytal-muted mt-0.5">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
      </Spotlight>
    </section>
  );
}
