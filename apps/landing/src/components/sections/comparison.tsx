"use client";

import { type ReactNode } from "react";
import { Check, X, Shield } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { RevealGroup, RevealItem, SPRING_SNAPPY } from "@vytal-fit/brand/motion";
import { WaveDivider } from "@/components/decor";
import { useScrollReveal } from "@/lib/hooks";

// ── Comparison ────────────────────────────────────────────────────────────────
const COMPARISON_DATA = [
  { key: "compRow1", vytal: true,  regibox: false, wodify: false, generic: false },
  { key: "compRow2", vytal: true,  regibox: true,  wodify: false, generic: false },
  { key: "compRow3", vytal: true,  regibox: false, wodify: false, generic: true  },
  { key: "compRow4", vytal: true,  regibox: false, wodify: true,  generic: false },
  { key: "compRow5", vytal: true,  regibox: true,  wodify: false, generic: false },
  { key: "compRow6", vytal: true,  regibox: true,  wodify: false, generic: false },
  { key: "compRow7", vytal: true,  regibox: false, wodify: false, generic: false },
  { key: "compRow8", vytal: true,  regibox: false, wodify: true,  generic: false },
];

/** Icon that pops in with a snappy spring once it scrolls into view. */
function PopIcon({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  if (reduced) return <span className="inline-flex">{children}</span>;
  return (
    <motion.span
      className="inline-flex"
      initial={{ scale: 0 }}
      whileInView={{ scale: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={SPRING_SNAPPY}
    >
      {children}
    </motion.span>
  );
}

export function Comparison({ t }: { t: (k: string) => string }) {
  const ref = useScrollReveal();

  return (
    <section className="py-24 border-t border-[rgba(34,197,94,0.08)]">
      <WaveDivider color="rgba(34,197,94,0.03)" />
      <div ref={ref} className="scroll-reveal max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)] mb-4">
            <Shield size={12} className="text-vytal-green" />
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-vytal-green">{t("compBadge")}</span>
          </div>
          <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold tracking-tight leading-[1.1] text-vytal-text mb-4">
            {t("compTitle")}
          </h2>
          <p className="text-vytal-muted max-w-xl mx-auto text-sm leading-relaxed">
            {t("compSubtitle")}
          </p>
        </div>

        <div className="rounded-2xl border border-vytal-border overflow-hidden backdrop-blur-sm">
          {/* Header */}
          <div className="grid grid-cols-6 bg-[color-mix(in_srgb,var(--color-vytal-bg3)_80%,transparent)]">
            <div className="col-span-2 px-6 py-4 text-xs font-semibold text-vytal-muted uppercase tracking-wider">
              {t("compColFeature")}
            </div>
            {["Vytal", "Regibox", "Wodify", t("compGeneric")].map((name, i) => (
              <div
                key={name}
                className={`px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider ${
                  i === 0
                    ? "text-vytal-green bg-[rgba(34,197,94,0.08)] shadow-[0_0_24px_rgba(34,197,94,0.25)]"
                    : "text-vytal-muted"
                }`}
              >
                {i === 0 ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-vytal-green text-vytal-bg text-[10px] font-bold">#1</span>
                    {name}
                  </span>
                ) : name}
              </div>
            ))}
          </div>

          {/* Rows cascade in as the table enters the viewport */}
          <RevealGroup stagger={0.06} amount={0.1}>
            {COMPARISON_DATA.map((row, idx) => (
              <RevealItem key={row.key} duration={0.55}>
                <div
                  className={`grid grid-cols-6 border-t border-[rgba(34,197,94,0.06)] ${
                    idx % 2 === 0 ? "bg-[color-mix(in_srgb,var(--color-vytal-bg)_40%,transparent)]" : "bg-[color-mix(in_srgb,var(--color-vytal-bg3)_20%,transparent)]"
                  } hover:bg-[rgba(34,197,94,0.03)] transition-colors`}
                >
                  <div className="col-span-2 px-6 py-4 text-sm text-vytal-text">{t(row.key)}</div>
                  {[row.vytal, row.regibox, row.wodify, row.generic].map((val, i) => (
                    <div key={i} className={`px-4 py-4 flex items-center justify-center ${i === 0 ? "bg-[rgba(34,197,94,0.05)]" : ""}`}>
                      <PopIcon>
                        {val ? (
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              i === 0
                                ? "bg-[rgba(34,197,94,0.15)]"
                                : "bg-[rgba(107,140,114,0.1)]"
                            }`}
                          >
                            <Check
                              size={12}
                              className={i === 0 ? "text-vytal-green" : "text-vytal-muted"}
                            />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[rgba(255,71,87,0.08)] flex items-center justify-center">
                            <X size={12} className="text-[rgba(255,71,87,0.4)]" />
                          </div>
                        )}
                      </PopIcon>
                    </div>
                  ))}
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
