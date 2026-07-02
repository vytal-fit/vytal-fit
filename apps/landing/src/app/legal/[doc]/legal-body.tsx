"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { LEGAL_CONTENT, type LegalSlug } from "@/lib/legal-content";

const ACCENT_FONT = { fontFamily: "var(--font-accent), serif" } as const;

// Renders the chosen legal document in the active language. Both are resolved
// client-side (theme + language live in localStorage), so this is a client
// component nested under the server route.
export function LegalBody({ slug }: { slug: LegalSlug }) {
  return (
    <PageShell>
      {({ lang, t }) => {
        const doc = LEGAL_CONTENT[lang][slug];
        return (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-vytal-green mb-4">
              {t("legalMetaTitle")}
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.1]">
              <span
                className="italic bg-gradient-to-r from-vytal-green to-[#86efac] bg-clip-text text-transparent"
                style={ACCENT_FONT}
              >
                {doc.title}
              </span>
            </h1>
            <p className="mt-3 text-sm text-vytal-muted">
              {t("legalUpdated")}: {t("legalDate")}
            </p>
            <p className="mt-6 text-base text-vytal-muted leading-relaxed">{doc.intro}</p>

            {/* Table of contents */}
            <nav className="mt-8 rounded-2xl border border-[rgba(34,197,94,0.15)] bg-vytal-bg2 p-5">
              <p className="text-xs font-semibold text-vytal-muted uppercase tracking-wider mb-3">
                {t("legalTocTitle")}
              </p>
              <ul className="space-y-1.5">
                {doc.sections.map((s, i) => (
                  <li key={i}>
                    <a
                      href={`#sec-${i}`}
                      className="text-sm text-vytal-muted hover:text-vytal-green transition-colors"
                    >
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Sections */}
            <div className="mt-10 space-y-10">
              {doc.sections.map((s, i) => (
                <section key={i} id={`sec-${i}`} className="scroll-mt-24">
                  <h2 className="text-lg font-semibold text-vytal-text tracking-tight">{s.heading}</h2>
                  <div className="mt-3 space-y-3">
                    {s.body.map((p, j) => (
                      <p key={j} className="text-sm text-vytal-muted leading-relaxed">
                        {p}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* Cross-links to the other legal docs */}
            <div className="mt-16 pt-8 border-t border-[rgba(34,197,94,0.1)]">
              <p className="text-xs font-semibold text-vytal-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText size={14} className="text-vytal-green" />
                {t("legalBackToLegal")}
              </p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { s: "terms", k: "flTerms" },
                    { s: "privacy", k: "flPrivacy" },
                    { s: "gdpr", k: "flRgpd" },
                    { s: "cookies", k: "flCookies" },
                    { s: "dpa", k: "flDpa" },
                  ] as { s: LegalSlug; k: string }[]
                ).map((d) => (
                  <Link
                    key={d.s}
                    href={`/legal/${d.s}`}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 ${
                      d.s === slug
                        ? "border-vytal-green/50 bg-[rgba(34,197,94,0.1)] text-vytal-green"
                        : "border-[rgba(34,197,94,0.2)] text-vytal-muted hover:text-vytal-text hover:border-[rgba(34,197,94,0.4)]"
                    }`}
                  >
                    {t(d.k)}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        );
      }}
    </PageShell>
  );
}
