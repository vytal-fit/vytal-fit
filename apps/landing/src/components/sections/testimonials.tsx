"use client";

import { type LucideIcon, ShieldCheck, MessageCircle, Unlock } from "lucide-react";
import { TiltCard } from "@vytal-fit/brand";
import { RevealGroup, RevealItem } from "@vytal-fit/brand/motion";
import { useScrollReveal } from "@/lib/hooks";

// ── Commitment ────────────────────────────────────────────────────────────────
// Pre-launch: there are no real customers yet, so this section states the
// promises we make to founding members instead of fake quotes. The perks in the
// early-bird section (founder pricing, assisted onboarding, priority access) are
// deliberately NOT repeated here.
const COMMITMENT_META: { icon: LucideIcon; titleKey: string; bodyKey: string; color: string }[] = [
  { icon: Unlock, titleKey: "commit1Title", bodyKey: "commit1Body", color: "var(--color-vytal-green)" },
  { icon: ShieldCheck, titleKey: "commit2Title", bodyKey: "commit2Body", color: "var(--color-vytal-blue)" },
  { icon: MessageCircle, titleKey: "commit3Title", bodyKey: "commit3Body", color: "var(--color-vytal-purple)" },
];

export function Testimonials({ t }: { t: (k: string) => string }) {
  const ref = useScrollReveal();

  return (
    <section id="testemunhos" className="py-24 border-t border-[rgba(34,197,94,0.08)]">
      <div ref={ref} className="scroll-reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)] mb-4">
            <ShieldCheck size={12} className="text-vytal-green" />
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-vytal-green">{t("testimonialsBadge")}</span>
          </div>
          <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold tracking-tight leading-[1.1] text-vytal-text mb-4">
            {t("testimonialsTitle")}{" "}
            <span
              className="font-normal italic bg-gradient-to-r from-vytal-green to-[#86efac] bg-clip-text text-transparent"
              style={{ fontFamily: "var(--font-accent), serif" }}
            >
              {t("testimonialsTitleHighlight")}
            </span>
          </h2>
          <p className="text-vytal-muted max-w-xl mx-auto text-sm leading-relaxed">
            {t("testimonialsSubtitle")}
          </p>
        </div>

        <RevealGroup className="grid grid-cols-1 md:grid-cols-3 gap-6" stagger={0.12} amount={0.2}>
          {COMMITMENT_META.map((cm) => {
            const Icon = cm.icon;
            return (
              <RevealItem key={cm.titleKey}>
                <TiltCard
                  max={7}
                  className="relative h-full p-6 rounded-2xl border border-[rgba(34,197,94,0.1)] bg-[color-mix(in_srgb,var(--color-vytal-bg3)_40%,transparent)] backdrop-blur-sm hover:border-[rgba(34,197,94,0.22)] hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(34,197,94,0.08)] transition-all duration-300 group"
                >
                  {/* Icon */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 border border-[rgba(34,197,94,0.2)]"
                    style={{ background: "rgba(34,197,94,0.12)" }}
                  >
                    <Icon size={20} style={{ color: cm.color }} />
                  </div>
                  {/* Title */}
                  <h3 className="text-base font-semibold text-vytal-text mb-2">{t(cm.titleKey)}</h3>
                  {/* Body */}
                  <p className="text-sm text-vytal-muted leading-relaxed group-hover:text-vytal-text transition-colors duration-200">
                    {t(cm.bodyKey)}
                  </p>
                </TiltCard>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
