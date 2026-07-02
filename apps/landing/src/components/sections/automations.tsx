"use client";

import { Zap, BarChart3 } from "lucide-react";
import { WaveDivider } from "@/components/decor";
import { useScrollReveal } from "@/lib/hooks";

// ── Automations & AI ─────────────────────────────────────────────────────────
export function AutomationsAI({ t }: { t: (k: string) => string }) {
  const ref = useScrollReveal();

  const automations = [
    { titleKey: "autoA1Title", descKey: "autoA1Desc", icon: "✉️", color: "var(--color-vytal-green)" },
    { titleKey: "autoA2Title", descKey: "autoA2Desc", icon: "🎯", color: "var(--color-vytal-orange)" },
    { titleKey: "autoA3Title", descKey: "autoA3Desc", icon: "🚀", color: "var(--color-vytal-blue)" },
    { titleKey: "autoA4Title", descKey: "autoA4Desc", icon: "🎂", color: "var(--color-vytal-purple)" },
  ];

  const aiInsights = [
    { titleKey: "autoB1Title", descKey: "autoB1Desc", icon: "🔮", color: "var(--color-vytal-red)" },
    { titleKey: "autoB2Title", descKey: "autoB2Desc", icon: "🧠", color: "var(--color-vytal-green)" },
    { titleKey: "autoB3Title", descKey: "autoB3Desc", icon: "🏋️", color: "var(--color-vytal-blue)" },
    { titleKey: "autoB4Title", descKey: "autoB4Desc", icon: "📊", color: "var(--color-vytal-amber)" },
  ];

  return (
    <section className="py-24 border-t border-[rgba(34,197,94,0.08)]">
      <WaveDivider color="rgba(34,197,94,0.03)" />
      <div ref={ref} className="scroll-reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)] mb-4">
            <Zap size={12} className="text-vytal-green" />
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-vytal-green">{t("autoBadge")}</span>
          </div>
          <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold tracking-tight leading-[1.1] text-vytal-text mb-4">
            {t("autoTitle")}{" "}
            <span className="bg-gradient-to-r from-vytal-green to-vytal-blue bg-clip-text text-transparent">
              {t("autoTitleHighlight")}
            </span>
          </h2>
          <p className="text-vytal-muted text-sm max-w-lg mx-auto">{t("autoSubtitle")}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Automations column */}
          <div className="rounded-2xl border border-vytal-border bg-[color-mix(in_srgb,var(--color-vytal-bg3)_40%,transparent)] backdrop-blur-sm p-6">
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
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 bg-[color-mix(in_srgb,var(--color-vytal-bg3)_80%,transparent)] border border-[rgba(34,197,94,0.1)]">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-vytal-text mb-0.5">{t(item.titleKey)}</div>
                    <div className="text-xs text-vytal-muted leading-relaxed">{t(item.descKey)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI column */}
          <div className="rounded-2xl border border-[rgba(0,212,255,0.12)] bg-[rgba(0,30,40,0.4)] backdrop-blur-sm p-6">
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
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 bg-[color-mix(in_srgb,var(--color-vytal-bg3)_80%,transparent)] border border-[rgba(0,212,255,0.1)]">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-vytal-text mb-0.5">{t(item.titleKey)}</div>
                    <div className="text-xs text-vytal-muted leading-relaxed">{t(item.descKey)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
