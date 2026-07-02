"use client";

import { useScrollReveal } from "@/lib/hooks";

// ── Social Proof ─────────────────────────────────────────────────────────────
export function SocialProof({ t }: { t: (k: string) => string }) {
  const ref = useScrollReveal();
  const gyms = [
    "CrossFit Aveiro",
    "Yoga Flow Porto",
    "Iron Temple",
    "Box 47",
    "Studio Zen",
    "PT Academy",
  ];

  return (
    <section className="py-16 border-t border-[rgba(34,197,94,0.08)]">
      <div ref={ref} className="scroll-reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-vytal-muted mb-10 tracking-wider uppercase">
          {t("trustedBy")}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {gyms.map((gym, i) => (
            <div
              key={gym}
              className="flex items-center justify-center px-4 py-3.5 rounded-xl border border-[rgba(34,197,94,0.1)] bg-[color-mix(in_srgb,var(--color-vytal-bg3)_40%,transparent)] hover:border-[rgba(34,197,94,0.25)] hover:bg-[rgba(34,197,94,0.04)] transition-all duration-150 group backdrop-blur-sm"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="text-xs font-medium text-vytal-muted group-hover:text-vytal-text transition-colors text-center leading-tight">
                {gym}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
