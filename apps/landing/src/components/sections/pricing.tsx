"use client";

import { APP_LINKS } from "@/lib/constants";
import Link from "next/link";
import { Check, X, CreditCard } from "lucide-react";
import { AnimatedMark, TiltCard } from "@vytal-fit/brand";
import { AnimatedBorder, CountUp, RevealGroup, RevealItem } from "@vytal-fit/brand/motion";
import { useScrollReveal, usePricingToggle } from "@/lib/hooks";

// ── Pricing ───────────────────────────────────────────────────────────────────
const PLAN_META = [
  {
    nameKey: "free", priceVal: 0, highlighted: false, color: "var(--color-vytal-muted)",
    descKey: "planFreeDesc", periodKey: "planFreePeriod", ctaKey: "planFreeCta",
    featureKeys: ["planFreeF1","planFreeF2","planFreeF3","planFreeF4","planFreeF5","planFreeF6"],
    notIncludedKeys: ["planFreeN1","planFreeN2","planFreeN3","planFreeN4"],
  },
  {
    nameKey: "pro", priceVal: 49, highlighted: true, color: "var(--color-vytal-green)",
    descKey: "planProDesc", periodKey: "planProPeriod", ctaKey: "planProCta",
    featureKeys: ["planProF1","planProF2","planProF3","planProF4","planProF5","planProF6","planProF7","planProF8","planProF9"],
    notIncludedKeys: ["planProN1","planProN2"],
  },
  {
    nameKey: "enterprise", priceVal: null, highlighted: false, color: "var(--color-vytal-purple)",
    descKey: "planEnterpriseDesc", periodKey: "planEnterprisePeriod", ctaKey: "planEntCta",
    featureKeys: ["planEntF1","planEntF2","planEntF3","planEntF4","planEntF5","planEntF6","planEntF7","planEntF8"],
    notIncludedKeys: [] as string[],
  },
];

export function Pricing({ t }: { t: (k: string) => string }) {
  const { annual, setAnnual } = usePricingToggle();
  const ref = useScrollReveal();

  return (
    <section id="precos" className="relative overflow-hidden py-24 border-t border-[rgba(34,197,94,0.08)]">
      <AnimatedMark size={340} className="vy-drift absolute -top-12 -left-12 z-0 pointer-events-none" style={{ opacity: "var(--vy-watermark-opacity, 0.04)" }} />
      <div ref={ref} className="scroll-reveal relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)] mb-4">
            <CreditCard size={12} className="text-vytal-green" />
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-vytal-green">{t("pricingBadge")}</span>
          </div>
          <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold tracking-tight leading-[1.1] text-vytal-text mb-4">
            {t("pricingTitle")}{" "}
            <span
              className="font-normal italic bg-gradient-to-r from-vytal-green to-[#86efac] bg-clip-text text-transparent"
              style={{ fontFamily: "var(--font-accent), serif" }}
            >
              {t("pricingTitleHighlight")}
            </span>
          </h2>
          <p className="text-vytal-muted max-w-xl mx-auto text-sm leading-relaxed mb-8">
            {t("pricingSubtitle")}
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-xl bg-[color-mix(in_srgb,var(--color-vytal-bg3)_60%,transparent)] border border-[rgba(34,197,94,0.1)] backdrop-blur-sm">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                !annual ? "bg-[rgba(34,197,94,0.15)] text-vytal-green" : "text-vytal-muted"
              }`}
            >
              {t("monthly")}
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                annual ? "bg-[rgba(34,197,94,0.15)] text-vytal-green" : "text-vytal-muted"
              }`}
            >
              {t("annual")}
              <span className="text-[10px] bg-vytal-green text-vytal-bg px-1.5 py-0.5 rounded-full font-bold">
                -20%
              </span>
            </button>
          </div>
        </div>

        <RevealGroup className="grid grid-cols-1 md:grid-cols-3 gap-6" stagger={0.12} amount={0.15}>
          {PLAN_META.map((plan) => {
            const displayPrice =
              plan.priceVal === null
                ? null
                : plan.priceVal === 0
                ? 0
                : annual
                ? Math.round(plan.priceVal * 0.8)
                : plan.priceVal;

            const cardInner = (
              <>
                <div className="mb-6">
                  <h3 className="font-bold text-vytal-text text-lg mb-1">
                    {plan.nameKey.charAt(0).toUpperCase() + plan.nameKey.slice(1)}
                  </h3>
                  <p className="text-xs text-vytal-muted mb-4">{t(plan.descKey)}</p>
                  <div className="flex items-end gap-1">
                    {displayPrice === null ? (
                      <span className="text-3xl font-bold text-vytal-text">{t("onRequest")}</span>
                    ) : (
                      <>
                        <span className="text-5xl font-bold text-vytal-text tracking-tight">
                          {displayPrice === 0 ? (
                            t("planFreePrice")
                          ) : (
                            <CountUp to={displayPrice} suffix="€" duration={1.2} />
                          )}
                        </span>
                        <span className="text-sm text-vytal-muted mb-2">{t(plan.periodKey)}</span>
                      </>
                    )}
                  </div>
                  {annual && plan.priceVal && plan.priceVal > 0 && (
                    <p className="text-xs text-vytal-green mt-1">
                      {t("billedAnnually")} {plan.priceVal * 12 - Math.round(plan.priceVal * 0.8) * 12}{t("perYear")}
                    </p>
                  )}
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.featureKeys.map((fk) => (
                    <li key={fk} className="flex items-start gap-2.5 text-sm text-vytal-text">
                      <Check size={14} className="text-vytal-green shrink-0 mt-0.5" />
                      {t(fk)}
                    </li>
                  ))}
                  {plan.notIncludedKeys.map((fk) => (
                    <li key={fk} className="flex items-start gap-2.5 text-sm text-vytal-muted/50">
                      <X size={14} className="text-[rgba(255,71,87,0.3)] shrink-0 mt-0.5" />
                      {t(fk)}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.nameKey === "enterprise" ? APP_LINKS.signIn : APP_LINKS.getStarted}
                  className={`block text-center py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    plan.highlighted
                      ? "vy-shimmer bg-vytal-green text-vytal-bg hover:bg-[#16a34a] shadow-md shadow-[rgba(34,197,94,0.2)]"
                      : "border border-[rgba(34,197,94,0.25)] text-vytal-text hover:border-[rgba(34,197,94,0.5)] hover:bg-[rgba(34,197,94,0.05)]"
                  }`}
                >
                  {t(plan.ctaKey)}
                </Link>
              </>
            );

            return (
              <RevealItem
                key={plan.nameKey}
                className={plan.highlighted ? "md:-mt-2 md:mb-[-8px]" : ""}
                duration={0.7}
              >
                <TiltCard max={7} className="relative flex flex-col h-full">
                  {plan.highlighted ? (
                    <>
                      {/* Badge sits above the rotating ring (which clips overflow) */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                        <span
                          className="px-3 py-1 rounded-full bg-vytal-green text-vytal-bg text-xs font-bold inline-flex items-center gap-1.5"
                          style={{ animation: "landing-pulse-glow 2s ease-in-out infinite" }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-vytal-bg animate-pulse" />
                          {t("mostPopular")}
                        </span>
                      </div>
                      <AnimatedBorder
                        colors={["#22c55e", "rgba(34,197,94,0.06)", "#4ade80"]}
                        borderWidth={1.5}
                        radius={24}
                        duration={5}
                        className="flex flex-col flex-1 shadow-lg shadow-[rgba(34,197,94,0.08)]"
                        innerClassName="p-6 flex flex-col flex-1 bg-[color-mix(in_srgb,var(--color-vytal-bg)_95%,var(--color-vytal-green))]"
                      >
                        {cardInner}
                      </AnimatedBorder>
                    </>
                  ) : (
                    <div className="relative p-6 rounded-2xl border border-[rgba(34,197,94,0.1)] bg-[color-mix(in_srgb,var(--color-vytal-bg3)_40%,transparent)] backdrop-blur-sm transition-all duration-200 flex flex-col flex-1 hover:-translate-y-1 hover:border-vytal-green/40">
                      {cardInner}
                    </div>
                  )}
                </TiltCard>
              </RevealItem>
            );
          })}
        </RevealGroup>

        <p className="text-center text-xs text-vytal-muted mt-8">
          {t("pricingNote")}
        </p>
      </div>
    </section>
  );
}
