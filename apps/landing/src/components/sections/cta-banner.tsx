"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { AnimatedMark, Magnetic } from "@vytal-fit/brand";
import { KineticText, RevealGroup, RevealItem } from "@vytal-fit/brand/motion";

// ── CTA Banner ────────────────────────────────────────────────────────────────
export function CTABanner({ t }: { t: (k: string) => string }) {
  const reduced = useReducedMotion();

  return (
    <section className="py-24 border-t border-[rgba(34,197,94,0.08)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="relative rounded-3xl border border-[rgba(34,197,94,0.2)] bg-[color-mix(in_srgb,var(--color-vytal-bg3)_60%,transparent)] backdrop-blur-sm p-12 overflow-hidden">
          {/* Background blobs */}
          <div
            className="absolute -top-20 -left-20 w-60 h-60 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle, var(--color-vytal-green) 0%, transparent 70%)" }}
          />
          <div
            className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle, var(--color-vytal-blue) 0%, transparent 70%)" }}
          />
          {/* Breathing green glow */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 55%, rgba(34,197,94,0.12), transparent 70%)",
            }}
            animate={reduced ? undefined : { opacity: [0.4, 1, 0.4], scale: [1, 1.08, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          <AnimatedMark size={340} className="vy-drift absolute -top-10 -right-8 z-0 pointer-events-none" style={{ opacity: 0.04 }} />

          <div className="relative z-10">
            <RevealGroup stagger={0.1} amount={0.3}>
              <RevealItem>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.08)] mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-vytal-green animate-pulse" />
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-vytal-green">{t("ctaBannerBadge")}</span>
                </div>
              </RevealItem>
              <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold tracking-tight leading-[1.1] text-vytal-text mb-4">
                <KineticText text={t("ctaBannerTitle")} delay={0.15} stagger={0.06} />
                <br />
                <KineticText text={t("ctaBannerTitleLine2")} delay={0.45} stagger={0.06} />
              </h2>
              <RevealItem>
                <p className="text-vytal-muted mb-8 max-w-md mx-auto text-sm leading-relaxed">
                  {t("ctaBannerSubtitle")}
                </p>
              </RevealItem>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <RevealItem>
                  <Magnetic>
                    <div className="rounded-[14px] p-[1.5px] animated-gradient-border inline-flex">
                      <Link
                        href="/signup"
                        className="vy-shimmer inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-vytal-green text-vytal-bg font-bold text-sm hover:bg-[#16a34a] transition-all duration-150 shadow-lg shadow-[rgba(34,197,94,0.3)] hover:-translate-y-0.5"
                      >
                        {t("ctaBannerStart")}
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </Magnetic>
                </RevealItem>
                <RevealItem>
                  <Link
                    href="/@crossfit-aveiro"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-[rgba(34,197,94,0.25)] text-vytal-text font-medium text-sm hover:border-[rgba(34,197,94,0.5)] hover:bg-[rgba(34,197,94,0.05)] transition-all duration-150"
                  >
                    <Play size={14} className="text-vytal-green" />
                    {t("ctaBannerDemo")}
                  </Link>
                </RevealItem>
              </div>
            </RevealGroup>
          </div>
        </div>
      </div>
    </section>
  );
}
