"use client";

import { Star } from "lucide-react";
import { WaveDivider } from "@/components/decor";
import { useScrollReveal } from "@/lib/hooks";

// ── Testimonials ──────────────────────────────────────────────────────────────
const TESTIMONIAL_META = [
  { quoteKey: "t1quote", nameKey: "t1name", roleKey: "t1role", gymKey: "t1gym", initials: "AF", color: "var(--color-vytal-green)" },
  { quoteKey: "t2quote", nameKey: "t2name", roleKey: "t2role", gymKey: "t2gym", initials: "RS", color: "var(--color-vytal-blue)" },
  { quoteKey: "t3quote", nameKey: "t3name", roleKey: "t3role", gymKey: "t3gym", initials: "SM", color: "var(--color-vytal-purple)" },
];

export function Testimonials({ t }: { t: (k: string) => string }) {
  const ref = useScrollReveal();

  return (
    <section id="testemunhos" className="py-24 border-t border-[rgba(34,197,94,0.08)]">
      <WaveDivider flip color="rgba(34,197,94,0.03)" />
      <div ref={ref} className="scroll-reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)] mb-4">
            <Star size={12} className="text-vytal-green" />
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-vytal-green">{t("testimonialsBadge")}</span>
          </div>
          <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold tracking-tight leading-[1.1] text-vytal-text mb-4">
            {t("testimonialsTitle")} <span className="bg-gradient-to-r from-vytal-green to-vytal-blue bg-clip-text text-transparent">{t("testimonialsTitleHighlight")}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIAL_META.map((tm) => (
            <div
              key={tm.nameKey}
              className="relative p-6 rounded-2xl border border-[rgba(34,197,94,0.1)] bg-[color-mix(in_srgb,var(--color-vytal-bg3)_40%,transparent)] backdrop-blur-sm hover:border-[rgba(34,197,94,0.22)] hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(34,197,94,0.08)] transition-all duration-300 group"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className="fill-vytal-amber text-vytal-amber" />
                ))}
              </div>
              {/* Quote */}
              <p className="text-sm text-vytal-muted leading-relaxed mb-6 group-hover:text-vytal-text transition-colors duration-200">
                &ldquo;{t(tm.quoteKey)}&rdquo;
              </p>
              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-vytal-bg"
                  style={{ background: tm.color }}
                >
                  {tm.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-vytal-text">{t(tm.nameKey)}</p>
                  <p className="text-xs text-vytal-muted">
                    {t(tm.roleKey)} · {t(tm.gymKey)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
