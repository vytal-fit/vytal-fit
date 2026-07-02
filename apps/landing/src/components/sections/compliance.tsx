"use client";

import { Shield } from "lucide-react";
import { RevealGroup, RevealItem, STAGGER } from "@vytal-fit/brand/motion";
import { WaveDivider } from "@/components/decor";

// ── Compliance & Segurança ───────────────────────────────────────────────────
export function ComplianceSecurity({ t }: { t: (k: string) => string }) {
  const badges = [
    {
      key: "complianceRgpd",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-vytal-green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      color: "var(--color-vytal-green)",
    },
    {
      key: "complianceSaft",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-vytal-blue)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
      color: "var(--color-vytal-blue)",
    },
    {
      key: "complianceSsl",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-vytal-purple)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      ),
      color: "var(--color-vytal-purple)",
    },
    {
      key: "complianceUptime",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-vytal-green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
      color: "var(--color-vytal-green)",
    },
    {
      key: "complianceIso",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-vytal-amber)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
        </svg>
      ),
      color: "var(--color-vytal-amber)",
    },
    {
      key: "complianceBackup",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-vytal-orange)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
        </svg>
      ),
      color: "var(--color-vytal-orange)",
    },
  ];

  return (
    <section className="py-24 border-t border-[rgba(34,197,94,0.08)]">
      <WaveDivider flip color="rgba(34,197,94,0.03)" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealGroup className="text-center mb-12" stagger={0.08} amount={0.4}>
          <RevealItem>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)] mb-4">
              <Shield size={12} className="text-vytal-green" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-vytal-green">{t("complianceBadge")}</span>
            </div>
          </RevealItem>
          <RevealItem>
            <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold tracking-tight leading-[1.1] text-vytal-text mb-4">
              {t("complianceTitle")}{" "}
              <span
                className="font-normal italic bg-gradient-to-r from-vytal-green to-[#86efac] bg-clip-text text-transparent"
                style={{ fontFamily: "var(--font-accent), serif" }}
              >
                {t("complianceTitleHighlight")}
              </span>
            </h2>
          </RevealItem>
          <RevealItem>
            <p className="text-vytal-muted text-sm max-w-lg mx-auto">{t("complianceSubtitle")}</p>
          </RevealItem>
        </RevealGroup>

        <RevealGroup className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" stagger={STAGGER.tight} amount={0.2}>
          {badges.map((badge) => (
            <RevealItem
              key={badge.key}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl border bg-[color-mix(in_srgb,var(--color-vytal-bg3)_40%,transparent)] backdrop-blur-sm hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(34,197,94,0.08)] transition-all duration-200 group"
              style={{ borderColor: `color-mix(in srgb, ${badge.color} 18%, transparent)` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                style={{ background: `color-mix(in srgb, ${badge.color} 10%, transparent)` }}
              >
                {badge.icon}
              </div>
              <span className="text-xs font-semibold text-vytal-text text-center leading-tight">{t(badge.key)}</span>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
