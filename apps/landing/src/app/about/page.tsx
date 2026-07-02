"use client";

import Link from "next/link";
import { Heart, Sparkles, MapPin, ShieldCheck, ArrowRight } from "lucide-react";
import { APP_LINKS } from "@/lib/constants";
import { PageShell } from "@/components/page-shell";

const ACCENT_FONT = { fontFamily: "var(--font-accent), serif" } as const;

const VALUES = [
  { icon: Heart, titleKey: "aboutValue1Title", descKey: "aboutValue1Desc" },
  { icon: Sparkles, titleKey: "aboutValue2Title", descKey: "aboutValue2Desc" },
  { icon: MapPin, titleKey: "aboutValue3Title", descKey: "aboutValue3Desc" },
  { icon: ShieldCheck, titleKey: "aboutValue4Title", descKey: "aboutValue4Desc" },
] as const;

const STATS: { value: string; labelKey: string; isFlag?: boolean }[] = [
  { value: "20+", labelKey: "aboutStat1" },
  { value: "3", labelKey: "aboutStat2" },
  { value: "100%", labelKey: "aboutStat3" },
  { value: "PT", labelKey: "aboutStat4", isFlag: true },
];

function AboutBody({ t }: { t: (k: string) => string }) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Heading */}
      <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-vytal-green mb-4">
        {t("aboutEyebrow")}
      </p>
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05] max-w-3xl">
        {t("aboutHeadline")}{" "}
        <span
          className="italic bg-gradient-to-r from-vytal-green to-[#86efac] bg-clip-text text-transparent"
          style={ACCENT_FONT}
        >
          {t("aboutHeadlineAccent")}
        </span>
      </h1>
      <p className="mt-5 text-lg text-vytal-muted max-w-2xl leading-relaxed">{t("aboutIntro")}</p>

      {/* Mission + story */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
        <div className="rounded-2xl border border-[rgba(34,197,94,0.15)] bg-vytal-bg2 p-7">
          <h2 className="text-xl font-semibold text-vytal-text">{t("aboutMissionTitle")}</h2>
          <p className="mt-3 text-sm text-vytal-muted leading-relaxed">{t("aboutMissionBody")}</p>
        </div>
        <div className="rounded-2xl border border-[rgba(34,197,94,0.15)] bg-vytal-bg2 p-7">
          <h2 className="text-xl font-semibold text-vytal-text">{t("aboutStoryTitle")}</h2>
          <p className="mt-3 text-sm text-vytal-muted leading-relaxed">{t("aboutStoryBody")}</p>
        </div>
      </div>

      {/* Values */}
      <h2 className="text-2xl font-bold text-vytal-text mt-20 mb-6 tracking-tight">{t("aboutValuesTitle")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {VALUES.map((v) => (
          <div
            key={v.titleKey}
            className="rounded-2xl border border-[rgba(34,197,94,0.15)] bg-vytal-bg2 p-6"
          >
            <span className="w-10 h-10 rounded-xl bg-[rgba(34,197,94,0.12)] flex items-center justify-center text-vytal-green mb-4">
              <v.icon size={18} />
            </span>
            <h3 className="text-base font-semibold text-vytal-text">{t(v.titleKey)}</h3>
            <p className="text-sm text-vytal-muted mt-1.5 leading-relaxed">{t(v.descKey)}</p>
          </div>
        ))}
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
        {STATS.map((s) => (
          <div
            key={s.labelKey}
            className="rounded-2xl border border-[rgba(34,197,94,0.15)] bg-vytal-bg2 p-6 text-center"
          >
            <div className={`font-extrabold tracking-tight ${s.isFlag ? "text-4xl" : "text-4xl text-vytal-green"}`}>
              {s.value}
            </div>
            <div className="text-xs text-vytal-muted mt-2 uppercase tracking-wider">{t(s.labelKey)}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-20 rounded-3xl border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)] p-8 sm:p-12 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-vytal-text tracking-tight">{t("aboutCtaTitle")}</h2>
        <p className="mt-3 text-vytal-muted max-w-xl mx-auto leading-relaxed">{t("aboutCtaBody")}</p>
        <div className="mt-7 flex flex-wrap gap-3 justify-center">
          <Link
            href={APP_LINKS.getStarted}
            className="inline-flex items-center gap-2 text-sm px-5 py-2.5 rounded-lg bg-vytal-green text-vytal-bg font-semibold hover:bg-[#16a34a] transition-colors duration-150"
          >
            {t("aboutCtaStart")}
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/contact"
            className="text-sm px-5 py-2.5 rounded-lg border border-[rgba(34,197,94,0.25)] text-vytal-text hover:border-[rgba(34,197,94,0.5)] hover:bg-[rgba(34,197,94,0.05)] transition-all duration-150"
          >
            {t("aboutCtaContact")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return <PageShell>{({ t }) => <AboutBody t={t} />}</PageShell>;
}
