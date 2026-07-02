"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sun, Moon } from "lucide-react";
import { STORAGE_KEYS } from "@vytal-fit/shared";
import { useLandingLang } from "@/lib/hooks";
import { Footer } from "@/components/sections/footer";
import type { Lang } from "@/lib/copy";

// ── Shared chrome for landing sub-pages ──────────────────────────────────────
// A minimal sticky bar (wordmark → "/", language switcher, theme toggle) over
// the page content, closed off with the shared <Footer />. Theme + language are
// driven by the same STORAGE_KEYS preferences the rest of the site uses.
// `children` is a render function so the page body shares the shell's language
// state · switching PT/EN/ES in the bar re-renders the content in step.
export function PageShell({
  children,
}: {
  children: (ctx: { lang: Lang; t: (k: string) => string }) => React.ReactNode;
}) {
  const { lang, setLang, t } = useLandingLang();
  const [lightMode, setLightMode] = useState(false);

  // Mirror the navbar: restore the saved theme on mount and apply it to <html>.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.landingTheme);
    const isLight = stored ? stored === "light" : window.matchMedia("(prefers-color-scheme: light)").matches;
    setLightMode(isLight);
    document.documentElement.classList.toggle("light", isLight);
  }, []);

  function toggleTheme() {
    const next = !lightMode;
    setLightMode(next);
    document.documentElement.classList.toggle("light", next);
    localStorage.setItem(STORAGE_KEYS.landingTheme, next ? "light" : "dark");
  }

  return (
    <div className="min-h-screen bg-vytal-bg text-vytal-text flex flex-col">
      <header className="sticky top-0 z-50 bg-vytal-bg/95 backdrop-blur-md border-b border-[rgba(34,197,94,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-0.5 shrink-0">
              <span className="text-xl font-bold text-vytal-green tracking-tight">Vytal</span>
              <span className="text-xl font-bold text-vytal-muted tracking-tight">.fit</span>
            </Link>

            <div className="flex items-center gap-3">
              {/* Language switcher */}
              <div className="flex items-center gap-1">
                {(["pt", "en", "es"] as Lang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`text-xs font-semibold px-2 py-1 rounded transition-all duration-150 ${
                      lang === l
                        ? "bg-[rgba(34,197,94,0.15)] text-vytal-green"
                        : "text-vytal-muted hover:text-vytal-text"
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                aria-label={lightMode ? "Switch to dark mode" : "Switch to light mode"}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[rgba(34,197,94,0.2)] text-vytal-muted hover:text-vytal-green hover:border-[rgba(34,197,94,0.4)] transition-all duration-150"
              >
                {lightMode ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children({ lang, t })}</main>

      <Footer t={t} />
    </div>
  );
}
