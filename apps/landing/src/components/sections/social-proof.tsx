"use client";

import { RevealGroup, RevealItem, STAGGER } from "@vytal-fit/brand/motion";

// ── Social Proof ─────────────────────────────────────────────────────────────
export function SocialProof({ t }: { t: (k: string) => string }) {
  const spaceTypes = [
    t("v_crossfit_box"),
    t("v_gym"),
    t("v_yoga_studio"),
    t("v_pilates_studio"),
    t("v_martial_arts"),
    t("v_personal_training"),
  ];

  return (
    <section className="py-16 border-t border-[rgba(34,197,94,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealGroup stagger={STAGGER.tight} amount={0.3}>
          <RevealItem>
            <p className="text-center text-sm text-vytal-muted mb-10 tracking-wider uppercase">
              {t("trustedBy")}
            </p>
          </RevealItem>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {spaceTypes.map((spaceType) => (
              <RevealItem
                key={spaceType}
                className="flex items-center justify-center px-4 py-3.5 rounded-xl border border-[rgba(34,197,94,0.1)] bg-[color-mix(in_srgb,var(--color-vytal-bg3)_40%,transparent)] hover:border-[rgba(34,197,94,0.25)] hover:bg-[rgba(34,197,94,0.04)] transition-all duration-150 group backdrop-blur-sm"
              >
                <span className="text-xs font-medium text-vytal-muted group-hover:text-vytal-text transition-colors text-center leading-tight">
                  {spaceType}
                </span>
              </RevealItem>
            ))}
          </div>
        </RevealGroup>
      </div>
    </section>
  );
}
