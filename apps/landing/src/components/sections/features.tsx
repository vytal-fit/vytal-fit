"use client";

import { APP_LINKS } from "@/lib/constants";
import Link from "next/link";
import { Users, Calendar, Dumbbell, TrendingUp, CreditCard, Globe, Zap, ArrowRight } from "lucide-react";
import { AnimatedMark, TiltCard } from "@vytal-fit/brand";
import { RevealGroup, RevealItem } from "@vytal-fit/brand/motion";

// ── Features ─────────────────────────────────────────────────────────────────
const FEATURE_ICONS = [Users, Calendar, Dumbbell, TrendingUp, CreditCard, Globe];
const FEATURE_COLORS = ["var(--color-vytal-green)", "var(--color-vytal-blue)", "var(--color-vytal-purple)", "var(--color-vytal-amber)", "var(--color-vytal-orange)", "var(--color-vytal-green)"];
const FEATURE_KEYS = [
  { title: "feat1", desc: "feat1d", href: APP_LINKS.demo },
  { title: "feat2", desc: "feat2d", href: APP_LINKS.demo },
  { title: "feat3", desc: "feat3d", href: APP_LINKS.demo },
  { title: "feat4", desc: "feat4d", href: APP_LINKS.getStarted },
  { title: "feat5", desc: "feat5d", href: APP_LINKS.getStarted },
  { title: "feat6", desc: "feat6d", href: APP_LINKS.demo },
];

export function Features({ t }: { t: (k: string) => string }) {
  return (
    <section id="funcionalidades" className="relative overflow-hidden py-24 border-t border-[rgba(34,197,94,0.08)]">
      <AnimatedMark size={340} className="vy-drift absolute -top-10 -right-10 z-0 pointer-events-none" style={{ opacity: "var(--vy-watermark-opacity, 0.04)" }} />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealGroup className="text-center mb-16" stagger={0.08} amount={0.4}>
          <RevealItem>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)] mb-4">
              <Zap size={12} className="text-vytal-green" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-vytal-green">{t("features")}</span>
            </div>
          </RevealItem>
          <RevealItem>
            <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold tracking-tight leading-[1.1] text-vytal-text mb-4">
              {t("everythingTitle").split(".")[0]}.{" "}
              <span
                className="font-normal italic bg-gradient-to-r from-vytal-green to-[#86efac] bg-clip-text text-transparent"
                style={{ fontFamily: "var(--font-accent), serif" }}
              >
                {t("everythingTitle").split(".").slice(1).join(".").trim()}
              </span>
            </h2>
          </RevealItem>
          <RevealItem>
            <p className="text-vytal-muted max-w-xl mx-auto text-sm leading-relaxed">
              {t("everythingSubtitle")}
            </p>
          </RevealItem>
        </RevealGroup>

        <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" stagger={0.08} amount={0.1}>
          {FEATURE_KEYS.map((keys, idx) => {
            const Icon = FEATURE_ICONS[idx];
            const color = FEATURE_COLORS[idx];
            return (
              <RevealItem key={keys.title}>
                <TiltCard
                  max={7}
                  className="group relative h-full p-6 rounded-2xl border border-[rgba(34,197,94,0.1)] bg-[color-mix(in_srgb,var(--color-vytal-bg3)_40%,transparent)] backdrop-blur-sm hover:border-[rgba(34,197,94,0.3)] hover:bg-[color-mix(in_srgb,var(--color-vytal-bg3)_70%,transparent)] hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)] transition-all duration-300 overflow-hidden"
                >
                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 0% 0%, ${color}08 0%, transparent 60%)`,
                    }}
                  />
                  {/* Decorative circle */}
                  <svg className="absolute top-3 right-3 w-16 h-16 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity pointer-events-none" aria-hidden="true">
                    <circle cx="32" cy="32" r="30" stroke={color} strokeWidth="1" fill="none" />
                    <circle cx="32" cy="32" r="20" stroke={color} strokeWidth="0.5" fill="none" />
                  </svg>
                  {/* Decorative line */}
                  <svg className="absolute bottom-0 left-6 right-6 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" aria-hidden="true">
                    <line x1="0" y1="0" x2="100%" y2="0" stroke={color} strokeWidth="1" strokeOpacity="0.2" />
                  </svg>
                  {/* Icon with glow */}
                  <div className="relative">
                    <div
                      className="absolute inset-0 rounded-xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300"
                      style={{ background: color }}
                    />
                    <div
                      className="relative w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: `${color}14` }}
                    >
                      <Icon size={20} style={{ color }} />
                    </div>
                  </div>
                  <h3 className="font-semibold text-vytal-text mb-2 text-sm">{t(keys.title)}</h3>
                  <p className="text-xs text-vytal-muted leading-relaxed">{t(keys.desc)}</p>
                  <Link
                    href={keys.href}
                    className="mt-4 inline-flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ color }}
                  >
                    {t("featLearnMore")} <ArrowRight size={12} />
                  </Link>
                </TiltCard>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
