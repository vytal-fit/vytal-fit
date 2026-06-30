"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Sun, Moon, FileJson } from "lucide-react";
import type { NavGroup } from "@/lib/nav";
import type { TocItem } from "@/lib/toc";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 1.5a10.5 10.5 0 0 0-3.32 20.46c.53.1.72-.23.72-.5v-1.76c-2.92.64-3.54-1.4-3.54-1.4-.48-1.22-1.17-1.54-1.17-1.54-.96-.65.07-.64.07-.64 1.06.08 1.62 1.09 1.62 1.09.94 1.62 2.47 1.15 3.07.88.1-.68.37-1.15.67-1.41-2.33-.27-4.78-1.17-4.78-5.2 0-1.15.41-2.09 1.09-2.83-.11-.27-.47-1.34.1-2.8 0 0 .89-.28 2.91 1.08a10.1 10.1 0 0 1 5.3 0c2.02-1.36 2.9-1.08 2.9-1.08.58 1.46.22 2.53.11 2.8.68.74 1.09 1.68 1.09 2.83 0 4.04-2.46 4.93-4.8 5.19.38.33.71.97.71 1.96v2.9c0 .28.19.61.73.5A10.5 10.5 0 0 0 12 1.5Z" />
    </svg>
  );
}

function Mark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect x="2" y="2" width="60" height="60" rx="16" fill="#22c55e" />
      <path
        d="M11 35 L23 35 L27 25 L32 45 L37 16 L41 35 L53 35"
        fill="none"
        stroke="#08120c"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Sidebar({ nav, current, onNavigate }: { nav: NavGroup[]; current: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-7">
      {nav.map((group) => (
        <div key={group.label}>
          <div className="mb-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-vytal-muted">
            {group.label}
          </div>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = item.slug === current;
              return (
                <li key={item.slug}>
                  <Link
                    href={`/${item.slug}`}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-md px-2.5 py-1.5 text-[13.5px] transition ${
                      active
                        ? "bg-vytal-green/10 font-medium text-vytal-text"
                        : "text-vytal-muted hover:text-vytal-text"
                    }`}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function DocsShell({
  nav,
  toc,
  current,
  children,
}: {
  nav: NavGroup[];
  toc: TocItem[];
  current: string;
  children: React.ReactNode;
}) {
  const [light, setLight] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [activeId, setActiveId] = useState<string>("");

  function toggleTheme() {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    document.documentElement.classList.toggle("dark", !next);
  }

  // Scrollspy for the "On this page" rail.
  useEffect(() => {
    if (!toc.length) return;
    const headings = toc
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-88px 0px -70% 0px", threshold: [0, 1] }
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [toc]);

  return (
    <div className="min-h-screen bg-vytal-bg text-vytal-text">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-vytal-border bg-vytal-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1240px] items-center gap-4 px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Mark />
            <span className="text-[19px] font-extrabold tracking-[-0.04em]">
              vytal<span className="text-vytal-green">.</span>
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-vytal-muted">docs</span>
          </Link>

          <div className="ml-auto flex items-center gap-1.5">
            <Link
              href="https://api.vytal.fit/openapi.json"
              className="hidden items-center gap-2 rounded-lg border border-vytal-border px-3 py-1.5 text-[13px] text-vytal-muted transition hover:text-vytal-text sm:inline-flex"
            >
              <FileJson className="h-3.5 w-3.5" />
              OpenAPI
            </Link>
            <Link
              href="https://github.com/vytal-fit/vytal-fit"
              aria-label="GitHub"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-vytal-border text-vytal-muted transition hover:text-vytal-text"
            >
              <GithubIcon className="h-4 w-4" />
            </Link>
            <button
              onClick={toggleTheme}
              aria-label={light ? "Dark mode" : "Light mode"}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-vytal-border text-vytal-muted transition hover:text-vytal-green"
            >
              {light ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setMobileNav((v) => !v)}
              aria-label="Menu"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-vytal-border text-vytal-muted transition hover:text-vytal-text lg:hidden"
            >
              {mobileNav ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1240px] gap-8 px-5 lg:px-8">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 overflow-y-auto py-9 lg:block">
          <Sidebar nav={nav} current={current} />
        </aside>

        {/* Sidebar (mobile drawer) */}
        {mobileNav ? (
          <div className="fixed inset-0 top-14 z-20 bg-vytal-bg/95 px-5 py-7 backdrop-blur-md lg:hidden">
            <Sidebar nav={nav} current={current} onNavigate={() => setMobileNav(false)} />
          </div>
        ) : null}

        {/* Main */}
        <main className="min-w-0 flex-1 py-10">{children}</main>

        {/* On this page */}
        {toc.length ? (
          <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-52 shrink-0 overflow-y-auto py-10 xl:block">
            <div className="mb-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-vytal-muted">
              On this page
            </div>
            <ul className="flex flex-col gap-1.5 border-l border-vytal-border">
              {toc.map((item) => (
                <li key={item.id} style={{ paddingLeft: item.depth === 3 ? 22 : 12 }}>
                  <a
                    href={`#${item.id}`}
                    className={`-ml-px block border-l py-0.5 text-[12.5px] leading-snug transition ${
                      activeId === item.id
                        ? "border-vytal-green text-vytal-green"
                        : "border-transparent text-vytal-muted hover:text-vytal-text"
                    }`}
                    style={{ paddingLeft: item.depth === 3 ? 12 : 12 }}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
