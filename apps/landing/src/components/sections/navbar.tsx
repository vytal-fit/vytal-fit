"use client";

import { APP_LINKS } from "@/lib/constants";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Sun, Moon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { STORAGE_KEYS } from "@vytal-fit/shared";
import type { Lang } from "@/lib/copy";

// ── Nav ─────────────────────────────────────────────────────────────────────
export function Navbar({ t, lang, setLang }: { t: (k: string) => string; lang: Lang; setLang: (l: Lang) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lightMode, setLightMode] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const reduced = useReducedMotion();

  // Restore the saved theme on mount and apply it to <html>.
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

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Track which section is in view to highlight the matching nav link.
  useEffect(() => {
    const ids = ["funcionalidades", "early-bird", "testemunhos", "faq"];
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveSection(visible[visible.length - 1].target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const navLinks = [
    { label: t("features"), href: "#funcionalidades", id: "funcionalidades" },
    { label: t("earlyAccess"), href: "#early-bird", id: "early-bird" },
    { label: t("testimonials"), href: "#testemunhos", id: "testemunhos" },
    { label: t("faq"), href: "#faq", id: "faq" },
  ];

  // At the top of the page the nav floats over the dark hero video, so its
  // idle text must stay light regardless of theme.
  const overHero = !scrolled && !mobileOpen;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        overHero
          ? "bg-transparent"
          : "bg-vytal-bg/95 backdrop-blur-md border-b border-[rgba(34,197,94,0.1)] shadow-lg shadow-black/10"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-0.5 shrink-0">
            <span className="text-xl font-bold text-vytal-green tracking-tight">Vytal</span>
            <span className={`text-xl font-bold tracking-tight ${overHero ? "text-white/60" : "text-vytal-muted"}`}>.fit</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`relative text-sm transition-colors duration-150 ${
                  activeSection === l.id
                    ? "text-vytal-green"
                    : overHero
                    ? "text-white/70 hover:text-white"
                    : "text-vytal-muted hover:text-vytal-text"
                }`}
              >
                {l.label}
                {activeSection === l.id &&
                  (reduced ? (
                    <span className="absolute -bottom-1.5 left-0 right-0 h-[2px] rounded-full bg-vytal-green" />
                  ) : (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1.5 left-0 right-0 h-[2px] rounded-full bg-vytal-green"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  ))}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language switcher */}
            <div className="flex items-center gap-1">
              {(["pt", "en", "es"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`text-xs font-semibold px-2 py-1 rounded transition-all duration-150 ${
                    lang === l
                      ? "bg-[rgba(34,197,94,0.15)] text-vytal-green"
                      : overHero
                      ? "text-white/60 hover:text-white"
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
              className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all duration-150 ${
                overHero
                  ? "border-white/25 text-white/70 hover:text-vytal-green hover:border-vytal-green/50"
                  : "border-[rgba(34,197,94,0.2)] text-vytal-muted hover:text-vytal-green hover:border-[rgba(34,197,94,0.4)]"
              }`}
            >
              {lightMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <Link
              href={APP_LINKS.signIn}
              className={`text-sm px-4 py-2 rounded-lg border transition-all duration-150 ${
                overHero
                  ? "border-white/30 text-white hover:border-vytal-green/60 hover:bg-white/10"
                  : "border-[rgba(34,197,94,0.25)] text-vytal-text hover:border-[rgba(34,197,94,0.5)] hover:bg-[rgba(34,197,94,0.05)]"
              }`}
            >
              {t("signIn")}
            </Link>
            <Link
              href="#early-bird"
              className="text-sm px-4 py-2 rounded-lg bg-vytal-green text-vytal-bg font-semibold hover:bg-[#16a34a] transition-colors duration-150"
            >
              {t("ctaStart")}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
            className={`md:hidden p-2 rounded-lg transition-colors hover:bg-[rgba(34,197,94,0.06)] ${
              overHero ? "text-white/80 hover:text-white" : "text-vytal-muted hover:text-vytal-text"
            }`}
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-[rgba(34,197,94,0.1)] mt-1">
            <div className="flex flex-col gap-1 pt-3">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm text-vytal-muted hover:text-vytal-text hover:bg-[rgba(34,197,94,0.04)] rounded-lg transition-colors"
                >
                  {l.label}
                </a>
              ))}
              {/* Mobile lang switcher */}
              <div className="flex items-center gap-1 mt-2 px-1">
                {(["pt", "en", "es"] as Lang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLang(l); setMobileOpen(false); }}
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded transition-all duration-150 ${
                      lang === l
                        ? "bg-[rgba(34,197,94,0.15)] text-vytal-green"
                        : "text-vytal-muted hover:text-vytal-text"
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
                {/* Mobile theme toggle (was desktop-only) */}
                <button
                  onClick={toggleTheme}
                  aria-label={lightMode ? "Switch to dark mode" : "Switch to light mode"}
                  className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg border border-[rgba(34,197,94,0.2)] text-vytal-muted hover:text-vytal-green hover:border-[rgba(34,197,94,0.4)] transition-all duration-150"
                >
                  {lightMode ? <Sun size={14} /> : <Moon size={14} />}
                </button>
              </div>
              <div className="flex gap-2 mt-2 px-1">
                <Link
                  href={APP_LINKS.signIn}
                  className="flex-1 text-center text-sm px-4 py-2.5 rounded-lg border border-[rgba(34,197,94,0.25)] text-vytal-text"
                >
                  {t("signIn")}
                </Link>
                <Link
                  href="#early-bird"
                  className="flex-1 text-center text-sm px-4 py-2.5 rounded-lg bg-vytal-green text-vytal-bg font-semibold"
                >
                  {t("ctaStart")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
