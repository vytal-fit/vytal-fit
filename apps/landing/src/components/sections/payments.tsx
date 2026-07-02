"use client";

import { CreditCard } from "lucide-react";
import { AnimatedMark } from "@vytal-fit/brand";
import { RevealGroup, RevealItem, STAGGER } from "@vytal-fit/brand/motion";
import { WaveDivider } from "@/components/decor";

// ── Payments Portugal ────────────────────────────────────────────────────────
export function PaymentsPortugal({ t }: { t: (k: string) => string }) {
  const methods = [
    {
      key: "paymentsMbway",
      icon: (
        <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="10" fill="rgba(255,71,87,0.12)" />
          <rect x="16" y="10" width="16" height="28" rx="4" stroke="var(--color-vytal-red)" strokeWidth="2.5" fill="none"/>
          <path d="M22 33h4" stroke="var(--color-vytal-red)" strokeWidth="2" strokeLinecap="round"/>
          <path d="M21 21l3 4 3-4" stroke="var(--color-vytal-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "var(--color-vytal-red)",
    },
    {
      key: "paymentsMultibanco",
      icon: (
        <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="10" fill="rgba(0,100,200,0.12)" />
          <rect x="12" y="14" width="24" height="20" rx="3" stroke="#0064c8" strokeWidth="2.5" fill="none"/>
          <path d="M12 20h24" stroke="#0064c8" strokeWidth="2"/>
          <rect x="16" y="26" width="6" height="4" rx="1" fill="#0064c8" opacity="0.6"/>
        </svg>
      ),
      color: "#0064c8",
    },
    {
      key: "paymentsSepa",
      icon: (
        <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="10" fill="rgba(0,212,255,0.12)" />
          <circle cx="24" cy="24" r="10" stroke="var(--color-vytal-blue)" strokeWidth="2.5" fill="none"/>
          <path d="M19 24h10M22 20l-3 4 3 4" stroke="var(--color-vytal-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "var(--color-vytal-blue)",
    },
    {
      key: "paymentsVisa",
      icon: (
        <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="10" fill="rgba(192,132,252,0.12)" />
          <rect x="8" y="14" width="32" height="20" rx="4" stroke="var(--color-vytal-purple)" strokeWidth="2" fill="none"/>
          <path d="M20 28l2-8 2 8M24 24h3" stroke="var(--color-vytal-purple)" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="32" cy="24" r="3" fill="none" stroke="var(--color-vytal-purple)" strokeWidth="1.5"/>
        </svg>
      ),
      color: "var(--color-vytal-purple)",
    },
    {
      key: "paymentsCash",
      icon: (
        <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="10" fill="rgba(34,197,94,0.12)" />
          <rect x="8" y="16" width="32" height="16" rx="3" stroke="var(--color-vytal-green)" strokeWidth="2.5" fill="none"/>
          <circle cx="24" cy="24" r="4" stroke="var(--color-vytal-green)" strokeWidth="2" fill="none"/>
          <path d="M12 20v8M36 20v8" stroke="var(--color-vytal-green)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      color: "var(--color-vytal-green)",
    },
    {
      key: "paymentsTransfer",
      icon: (
        <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="10" fill="rgba(255,179,0,0.12)" />
          <path d="M10 24h28M30 16l8 8-8 8" stroke="var(--color-vytal-amber)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "var(--color-vytal-amber)",
    },
  ];

  return (
    <section className="relative overflow-hidden py-24 border-t border-[rgba(34,197,94,0.08)]">
      <AnimatedMark size={340} className="vy-drift absolute -bottom-12 -left-10 z-0 pointer-events-none" style={{ opacity: "var(--vy-watermark-opacity, 0.04)" }} />
      <WaveDivider flip color="rgba(34,197,94,0.03)" />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealGroup className="text-center mb-12" stagger={0.08} amount={0.4}>
          <RevealItem>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)] mb-4">
              <CreditCard size={12} className="text-vytal-green" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-vytal-green">{t("paymentsBadge")}</span>
            </div>
          </RevealItem>
          <RevealItem>
            <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold tracking-tight leading-[1.1] text-vytal-text mb-4">
              {t("paymentsTitle")}{" "}
              <span
                className="font-normal italic bg-gradient-to-r from-vytal-green to-[#86efac] bg-clip-text text-transparent"
                style={{ fontFamily: "var(--font-accent), serif" }}
              >
                {t("paymentsTitleHighlight")}
              </span>
            </h2>
          </RevealItem>
          <RevealItem>
            <p className="text-vytal-muted text-sm max-w-lg mx-auto">{t("paymentsSubtitle")}</p>
          </RevealItem>
        </RevealGroup>

        <RevealGroup className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" stagger={STAGGER.tight} amount={0.2}>
          {methods.map((m) => (
            <RevealItem
              key={m.key}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-[rgba(34,197,94,0.1)] bg-[color-mix(in_srgb,var(--color-vytal-bg3)_40%,transparent)] backdrop-blur-sm hover:border-[rgba(34,197,94,0.3)] hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(34,197,94,0.08)] transition-all duration-200 group"
            >
              <div className="transition-transform duration-200 group-hover:scale-110">
                {m.icon}
              </div>
              <span className="text-xs font-semibold text-vytal-text text-center">{t(m.key)}</span>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
