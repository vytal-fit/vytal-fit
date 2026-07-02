"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, BarChart3, ArrowRight } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { EASE_OUT_EXPO, StickyScene } from "@vytal-fit/brand/motion";
import { WaveDivider } from "@/components/decor";

// ── Product Showcase ──────────────────────────────────────────────────────────
const TAB_META = [
  { id: "admin",   gradient: "from-vytal-green/20 via-vytal-bg2 to-vytal-bg", accent: "var(--color-vytal-green)",
    labelKey: "tabAdmin", titleKey: "tabAdminTitle", descKey: "tabAdminDesc",
    itemKeys: ["tabAdminI1","tabAdminI2","tabAdminI3","tabAdminI4","tabAdminI5","tabAdminI6"] },
  { id: "website", gradient: "from-vytal-blue/20 via-vytal-bg2 to-vytal-bg", accent: "var(--color-vytal-blue)",
    labelKey: "tabWebsite", titleKey: "tabWebsiteTitle", descKey: "tabWebsiteDesc",
    itemKeys: ["tabWebsiteI1","tabWebsiteI2","tabWebsiteI3","tabWebsiteI4","tabWebsiteI5","tabWebsiteI6"] },
  { id: "membro",  gradient: "from-vytal-purple/20 via-vytal-bg2 to-vytal-bg", accent: "var(--color-vytal-purple)",
    labelKey: "tabMembro", titleKey: "tabMembroTitle", descKey: "tabMembroDesc",
    itemKeys: ["tabMembroI1","tabMembroI2","tabMembroI3","tabMembroI4","tabMembroI5","tabMembroI6"] },
  { id: "mobile",  gradient: "from-vytal-orange/20 via-vytal-bg2 to-vytal-bg", accent: "var(--color-vytal-orange)",
    labelKey: "tabMobile", titleKey: "tabMobileTitle", descKey: "tabMobileDesc",
    itemKeys: ["tabMobileI1","tabMobileI2","tabMobileI3","tabMobileI4","tabMobileI5","tabMobileI6"] },
];

// Shared markup for both the sticky (scroll-driven) and classic (click) modes.
function ShowcaseBody({
  t,
  activeTab,
  setActiveTab,
  animate,
}: {
  t: (k: string) => string;
  activeTab: string;
  setActiveTab: (id: string) => void;
  animate: boolean;
}) {
  const tab = TAB_META.find((tb) => tb.id === activeTab)!;
  const mockItems = tab.itemKeys.map((k) => t(k));

  const content = (
    <>
      {/* Mock screen */}
      <div
        className={`relative rounded-2xl border border-[rgba(34,197,94,0.15)] overflow-hidden h-80 bg-gradient-to-br ${tab.gradient}`}
      >
        {/* Mock UI chrome */}
        <div className="absolute top-0 left-0 right-0 h-10 bg-[color-mix(in_srgb,var(--color-vytal-bg)_80%,transparent)] flex items-center gap-2 px-4 border-b border-[rgba(34,197,94,0.08)]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-vytal-red/60" />
            <div className="w-3 h-3 rounded-full bg-vytal-amber/60" />
            <div className="w-3 h-3 rounded-full bg-vytal-green/60" />
          </div>
          <div className="flex-1 h-5 rounded bg-[rgba(34,197,94,0.06)] mx-4" />
        </div>
        {/* Mock content grid */}
        <div className="absolute top-12 left-4 right-4 bottom-4 grid grid-cols-3 gap-2">
          {mockItems.map((item, i) => (
            <div
              key={item}
              className="rounded-lg border border-[rgba(34,197,94,0.1)] bg-[color-mix(in_srgb,var(--color-vytal-bg)_60%,transparent)] backdrop-blur-sm flex flex-col items-center justify-center gap-1 p-2 hover:border-[rgba(34,197,94,0.3)] transition-colors"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div
                className="w-6 h-6 rounded-md"
                style={{ background: `${tab.accent}20` }}
              />
              <span className="text-[10px] text-vytal-muted text-center leading-tight">{item}</span>
            </div>
          ))}
        </div>
        {/* Glow */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ background: tab.accent }}
        />
      </div>

      {/* Description */}
      <div>
        <h3 className="text-2xl font-bold text-vytal-text mb-4">{t(tab.titleKey)}</h3>
        <p className="text-vytal-muted leading-relaxed mb-6">{t(tab.descKey)}</p>
        <ul className="space-y-3">
          {mockItems.map((item) => (
            <li key={item} className="flex items-center gap-3 text-sm text-vytal-text">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                style={{ background: `${tab.accent}20` }}
              >
                <Check size={10} style={{ color: tab.accent }} />
              </div>
              {item}
            </li>
          ))}
        </ul>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 mt-8 px-5 py-2.5 rounded-lg text-sm font-semibold text-vytal-bg transition-all duration-150 hover:-translate-y-0.5"
          style={{ background: tab.accent }}
        >
          {t("showcaseExplore")} {t(tab.labelKey)}
          <ArrowRight size={14} />
        </Link>
      </div>
    </>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)] mb-4">
          <BarChart3 size={12} className="text-vytal-green" />
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-vytal-green">{t("showcaseBadge")}</span>
        </div>
        <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold tracking-tight leading-[1.1] text-vytal-text mb-4">
          {t("showcaseTitle")}{" "}
          <span
            className="font-normal italic bg-gradient-to-r from-vytal-green to-[#86efac] bg-clip-text text-transparent"
            style={{ fontFamily: "var(--font-accent), serif" }}
          >
            {t("showcaseTitleHighlight")}
          </span>
        </h2>
        <p className="text-vytal-muted max-w-xl mx-auto text-sm leading-relaxed">
          {t("showcaseSubtitle")}
        </p>
      </div>

      {/* Tab bar (also acts as progress indicator in the sticky scene) */}
      <div className="flex items-center justify-center gap-1 mb-8 p-1 rounded-xl bg-[color-mix(in_srgb,var(--color-vytal-bg3)_60%,transparent)] border border-[rgba(34,197,94,0.1)] w-fit mx-auto backdrop-blur-sm">
        {TAB_META.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setActiveTab(tb.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === tb.id
                ? "bg-vytal-green text-vytal-bg"
                : "text-vytal-muted hover:text-vytal-text"
            }`}
          >
            {t(tb.labelKey)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {animate ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={tab.id}
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
            className="grid lg:grid-cols-2 gap-8 items-center"
          >
            {content}
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8 items-center">{content}</div>
      )}
    </div>
  );
}

// Sticky-scene wrapper: derives the active product from scroll progress.
function StickyShowcase({
  t,
  progress,
  activeTab,
  setActiveTab,
}: {
  t: (k: string) => string;
  progress: MotionValue<number>;
  activeTab: string;
  setActiveTab: (id: string) => void;
}) {
  useMotionValueEvent(progress, "change", (v) => {
    const idx = Math.min(TAB_META.length - 1, Math.max(0, Math.floor(v * TAB_META.length)));
    setActiveTab(TAB_META[idx].id);
  });

  return (
    <div className="flex h-full items-center">
      <ShowcaseBody t={t} activeTab={activeTab} setActiveTab={setActiveTab} animate />
    </div>
  );
}

export function ProductShowcase({ t }: { t: (k: string) => string }) {
  const [activeTab, setActiveTab] = useState("admin");
  const reduced = useReducedMotion();

  return (
    <section className="py-24 border-t border-[rgba(34,197,94,0.08)]">
      <WaveDivider flip color="rgba(34,197,94,0.03)" />
      {/* Classic click-tabs: always on mobile, everywhere under reduced motion */}
      <div className={reduced ? "" : "md:hidden"}>
        <ShowcaseBody t={t} activeTab={activeTab} setActiveTab={setActiveTab} animate={!reduced} />
      </div>
      {/* Scroll-driven sticky scene on md+ */}
      {!reduced && (
        <div className="hidden md:block">
          <StickyScene screens={TAB_META.length}>
            {(progress) => (
              <StickyShowcase
                t={t}
                progress={progress}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            )}
          </StickyScene>
        </div>
      )}
    </section>
  );
}
