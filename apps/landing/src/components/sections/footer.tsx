"use client";

import { RevealGroup, RevealItem, STAGGER } from "@vytal-fit/brand/motion";

// ── Footer ─────────────────────────────────────────────────────────────────────
const FOOTER_COL_META = [
  {
    titleKey: "footerProduct",
    links: [
      { labelKey: "fpFeat",    href: "#funcionalidades" },
      { labelKey: "fpPricing", href: "#precos" },
      { labelKey: "fpNews",    href: "#" },
      { labelKey: "fpRoadmap", href: "#" },
      { labelKey: "fpApi",     href: "#" },
    ],
  },
  {
    titleKey: "footerResources",
    links: [
      { labelKey: "frHelp",   href: "#" },
      { labelKey: "frBlog",   href: "#" },
      { labelKey: "frVideos", href: "#" },
      { labelKey: "frBrand",  href: "/brand" },
      { labelKey: "frStatus", href: "#" },
    ],
  },
  {
    titleKey: "footerCompany",
    links: [
      { labelKey: "fcAbout",    href: "#" },
      { labelKey: "fcCareers",  href: "#" },
      { labelKey: "fcPartners", href: "#" },
      { labelKey: "fcPress",    href: "#" },
      { labelKey: "fcContact",  href: "#" },
    ],
  },
  {
    titleKey: "footerLegal",
    links: [
      { labelKey: "flTerms",   href: "#" },
      { labelKey: "flPrivacy", href: "#" },
      { labelKey: "flRgpd",    href: "#" },
      { labelKey: "flCookies", href: "#" },
      { labelKey: "flDpa",     href: "#" },
    ],
  },
];

export function Footer({ t }: { t: (k: string) => string }) {
  return (
    <footer className="border-t border-[rgba(34,197,94,0.08)] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealGroup className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12" stagger={STAGGER.tight} amount={0.2}>
          {/* Brand col */}
          <RevealItem className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center gap-0.5 mb-4">
              <span className="text-xl font-bold text-vytal-green">Vytal</span>
              <span className="text-xl font-bold text-vytal-muted">.fit</span>
            </a>
            <p className="text-xs text-vytal-muted leading-relaxed mb-4">
              {t("footerTagline")}
            </p>
            {/* Social links */}
            <div className="flex gap-2">
              {[
                { label: "Instagram", icon: "IG" },
                { label: "LinkedIn", icon: "LI" },
                { label: "Twitter/X", icon: "X" },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg border border-[rgba(34,197,94,0.15)] flex items-center justify-center text-[10px] font-bold text-vytal-muted hover:border-[rgba(34,197,94,0.4)] hover:text-vytal-green transition-all duration-150"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </RevealItem>

          {/* Link cols */}
          {FOOTER_COL_META.map((col) => (
            <RevealItem key={col.titleKey}>
              <h4 className="text-xs font-semibold text-vytal-text uppercase tracking-wider mb-4">
                {t(col.titleKey)}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.labelKey}>
                    <a
                      href={link.href}
                      className="text-xs text-vytal-muted hover:text-vytal-text transition-colors duration-150"
                    >
                      {t(link.labelKey)}
                    </a>
                  </li>
                ))}
              </ul>
            </RevealItem>
          ))}
        </RevealGroup>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-[rgba(34,197,94,0.08)] gap-4">
          <p className="text-xs text-vytal-muted">
            © 2026 Vytal. {t("footerRights")} <span className="text-vytal-green">♥</span> {t("footerInPortugal")}
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-vytal-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-vytal-green" />
              {t("footerAllSystems")}
            </span>
            <span className="text-xs text-vytal-muted">PT · EN · ES</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
