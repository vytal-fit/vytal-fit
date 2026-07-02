"use client";

import { Zap, BarChart3, Mail, Target, Rocket, Gift, TrendingDown, CalendarClock, Dumbbell, Gauge } from "lucide-react";
import { RevealGroup, RevealItem } from "@vytal-fit/brand/motion";

// ── Automations & AI ─────────────────────────────────────────────────────────
export function AutomationsAI({ t }: { t: (k: string) => string }) {
  const automations = [
    { titleKey: "autoA1Title", descKey: "autoA1Desc", Icon: Mail, color: "var(--color-vytal-green)" },
    { titleKey: "autoA2Title", descKey: "autoA2Desc", Icon: Target, color: "var(--color-vytal-orange)" },
    { titleKey: "autoA3Title", descKey: "autoA3Desc", Icon: Rocket, color: "var(--color-vytal-blue)" },
    { titleKey: "autoA4Title", descKey: "autoA4Desc", Icon: Gift, color: "var(--color-vytal-purple)" },
  ];

  const aiInsights = [
    { titleKey: "autoB1Title", descKey: "autoB1Desc", Icon: TrendingDown, color: "var(--color-vytal-red)" },
    { titleKey: "autoB2Title", descKey: "autoB2Desc", Icon: CalendarClock, color: "var(--color-vytal-green)" },
    { titleKey: "autoB3Title", descKey: "autoB3Desc", Icon: Dumbbell, color: "var(--color-vytal-blue)" },
    { titleKey: "autoB4Title", descKey: "autoB4Desc", Icon: Gauge, color: "var(--color-vytal-amber)" },
  ];

  return (
    <section className="py-24 border-t border-[rgba(34,197,94,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealGroup className="text-center mb-12" stagger={0.08} amount={0.4}>
          <RevealItem>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)] mb-4">
              <Zap size={12} className="text-vytal-green" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-vytal-green">{t("autoBadge")}</span>
            </div>
          </RevealItem>
          <RevealItem>
            <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold tracking-tight leading-[1.1] text-vytal-text mb-4">
              {t("autoTitle")}{" "}
              <span
                className="font-normal italic bg-gradient-to-r from-vytal-green to-[#86efac] bg-clip-text text-transparent"
                style={{ fontFamily: "var(--font-accent), serif" }}
              >
                {t("autoTitleHighlight")}
              </span>
            </h2>
          </RevealItem>
          <RevealItem>
            <p className="text-vytal-muted text-sm max-w-lg mx-auto">{t("autoSubtitle")}</p>
          </RevealItem>
        </RevealGroup>

        <RevealGroup className="grid lg:grid-cols-2 gap-8" stagger={0.14} amount={0.15}>
          {/* Automations column */}
          <RevealItem className="rounded-2xl border border-vytal-border bg-[color-mix(in_srgb,var(--color-vytal-bg3)_40%,transparent)] backdrop-blur-sm p-6">
            <h3 className="text-sm font-bold text-vytal-green uppercase tracking-wider mb-5 flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[rgba(34,197,94,0.15)] flex items-center justify-center">
                <Zap size={11} className="text-vytal-green" />
              </div>
              {t("autoColLeft")}
            </h3>
            <div className="space-y-3">
              {automations.map((item) => (
                <div
                  key={item.titleKey}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-[rgba(34,197,94,0.08)] bg-[color-mix(in_srgb,var(--color-vytal-bg)_40%,transparent)] hover:border-[rgba(34,197,94,0.2)] hover:bg-[color-mix(in_srgb,var(--color-vytal-bg)_60%,transparent)] transition-all duration-150 group"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[color-mix(in_srgb,var(--color-vytal-bg3)_80%,transparent)] border border-[rgba(34,197,94,0.1)]">
                    <item.Icon size={15} style={{ color: item.color }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-vytal-text mb-0.5">{t(item.titleKey)}</div>
                    <div className="text-xs text-vytal-muted leading-relaxed">{t(item.descKey)}</div>
                  </div>
                </div>
              ))}
            </div>
          </RevealItem>

          {/* AI column */}
          <RevealItem className="rounded-2xl border border-[rgba(0,212,255,0.18)] bg-[color-mix(in_srgb,var(--color-vytal-bg3)_40%,transparent)] backdrop-blur-sm p-6">
            <h3 className="text-sm font-bold text-vytal-blue uppercase tracking-wider mb-5 flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[rgba(0,212,255,0.15)] flex items-center justify-center">
                <BarChart3 size={11} className="text-vytal-blue" />
              </div>
              {t("autoColRight")}
            </h3>
            <div className="space-y-3">
              {aiInsights.map((item) => (
                <div
                  key={item.titleKey}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-[rgba(0,212,255,0.08)] bg-[color-mix(in_srgb,var(--color-vytal-bg)_40%,transparent)] hover:border-[rgba(0,212,255,0.2)] hover:bg-[color-mix(in_srgb,var(--color-vytal-bg)_60%,transparent)] transition-all duration-150 group"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[color-mix(in_srgb,var(--color-vytal-bg3)_80%,transparent)] border border-[rgba(0,212,255,0.1)]">
                    <item.Icon size={15} style={{ color: item.color }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-vytal-text mb-0.5">{t(item.titleKey)}</div>
                    <div className="text-xs text-vytal-muted leading-relaxed">{t(item.descKey)}</div>
                  </div>
                </div>
              ))}
            </div>
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  );
}
