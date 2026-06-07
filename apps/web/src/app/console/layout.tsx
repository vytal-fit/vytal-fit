"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Calendar, Dumbbell, Trophy, User, Bell, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useAppStore } from "@/stores/app-store";

const NAV_TABS = [
  { href: "/console", label: "Inicio", icon: Home, exact: true },
  { href: "/console/schedule", label: "Horario", icon: Calendar, exact: false },
  { href: "/console/wod", label: "WOD", icon: Dumbbell, exact: false },
  { href: "/console/records", label: "Recordes", icon: Trophy, exact: false },
  { href: "/console/profile", label: "Perfil", icon: User, exact: false },
];

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, hydrate } = useAuthStore();
  const { hydrate: hydrateApp } = useAppStore();

  useEffect(() => {
    hydrate();
    hydrateApp();
  }, [hydrate, hydrateApp]);

  // Auth guard: redirect to login if not authenticated
  // Skip guard on the login page itself
  useEffect(() => {
    if (pathname === "/console/login") return;
    if (!isAuthenticated) {
      // Check localStorage directly to avoid flash on first render
      const raw = typeof window !== "undefined" ? localStorage.getItem("vytal-auth") : null;
      if (!raw) {
        router.replace("/console/login");
      }
    }
  }, [isAuthenticated, pathname, router]);

  const initials = user?.user?.name
    ? user.user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "AT";

  const userName = user?.user?.name ?? "Atleta";

  const orgName =
    user?.memberships?.find((m) => m.organizationId === user.activeOrganizationId)
      ?.organization?.name ?? "Vytal";

  // On the login page, render only children (no shell)
  if (pathname === "/console/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--color-vytal-bg)" }}>

      {/* ── Desktop sidebar (md+) ── */}
      <aside
        className="hidden md:flex md:flex-col md:w-56 md:shrink-0 md:fixed md:inset-y-0 md:z-40 md:border-r"
        style={{
          background: "var(--color-vytal-bg2)",
          borderColor: "var(--color-vytal-border)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center h-14 px-5 border-b shrink-0"
          style={{ borderColor: "var(--color-vytal-border)" }}
        >
          <Link href="/console" className="flex items-baseline gap-0">
            <span className="text-xs font-medium tracking-tight" style={{ color: "var(--color-vytal-muted)", opacity: 0.5 }}>
              my
            </span>
            <span className="text-lg font-bold tracking-tight" style={{ color: "var(--color-vytal-green)" }}>
              VYTAL
            </span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_TABS.map((tab) => {
            const isActive = tab.exact
              ? pathname === tab.href
              : pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "text-[#080c0a]"
                    : "hover:opacity-80"
                )}
                style={{
                  background: isActive ? "var(--color-vytal-green)" : "transparent",
                  color: isActive ? "#080c0a" : "var(--color-vytal-text)",
                }}
              >
                <Icon
                  size={17}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  style={{ color: isActive ? "#080c0a" : "var(--color-vytal-muted)" }}
                />
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* User avatar at bottom */}
        <div
          className="px-4 py-4 border-t shrink-0"
          style={{ borderColor: "var(--color-vytal-border)" }}
        >
          <Link
            href="/console/profile"
            className="flex items-center gap-3 rounded-xl px-2 py-2 transition-all hover:opacity-80"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: "var(--color-vytal-green)", color: "#080c0a" }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p
                className="text-sm font-medium truncate"
                style={{ color: "var(--color-vytal-text)" }}
              >
                {userName}
              </p>
              <p
                className="text-[10px] truncate"
                style={{ color: "var(--color-vytal-muted)" }}
              >
                Atleta
              </p>
            </div>
          </Link>
        </div>
      </aside>

      {/* ── Main area (offset by sidebar on desktop) ── */}
      <div className="flex flex-col flex-1 min-w-0 md:ml-56">

        {/* ── Top bar (always visible) ── */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-4 h-14 border-b shrink-0"
          style={{
            background: "var(--color-vytal-bg2)",
            borderColor: "var(--color-vytal-border)",
          }}
        >
          {/* Mobile: logo. Desktop: org name */}
          <div className="flex items-center gap-2">
            {/* Mobile logo */}
            <div className="flex items-center md:hidden">
              <span
                className="text-sm font-bold tracking-tight"
                style={{ color: "var(--color-vytal-muted)" }}
              >
                my
              </span>
              <span
                className="text-sm font-bold tracking-tight"
                style={{ color: "var(--color-vytal-green)" }}
              >
                VYTAL
              </span>
            </div>
            {/* Desktop: org name */}
            <div className="hidden md:flex items-center gap-2">
              <span
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color: "var(--color-vytal-green)" }}
              >
                vytal
              </span>
              <span className="text-xs" style={{ color: "var(--color-vytal-muted)" }}>
                /
              </span>
              <span
                className="text-xs font-medium truncate max-w-[200px]"
                style={{ color: "var(--color-vytal-text)" }}
              >
                {orgName}
              </span>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Search (desktop only) */}
            <button
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors"
              style={{
                background: "var(--color-vytal-bg3)",
                color: "var(--color-vytal-muted)",
                border: "1px solid var(--color-vytal-border)",
              }}
              onClick={() => {}}
            >
              <Search size={12} />
              <span>Pesquisar...</span>
            </button>

            {/* Notifications */}
            <button
              className="relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:opacity-80"
              style={{
                background: "var(--color-vytal-bg3)",
                color: "var(--color-vytal-muted)",
              }}
            >
              <Bell size={15} />
              <span
                className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--color-vytal-green)" }}
              />
            </button>

            {/* Mobile avatar */}
            <Link
              href="/console/profile"
              className="md:hidden flex items-center"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "var(--color-vytal-green)", color: "#080c0a" }}
              >
                {initials}
              </div>
            </Link>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>

        {/* ── Bottom tab bar (mobile only) ── */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t"
          style={{
            background: "var(--color-vytal-bg2)",
            borderColor: "var(--color-vytal-border)",
          }}
        >
          {NAV_TABS.map((tab) => {
            const isActive = tab.exact
              ? pathname === tab.href
              : pathname.startsWith(tab.href);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors",
                  isActive ? "" : "opacity-50 hover:opacity-75"
                )}
                style={{
                  color: isActive ? "var(--color-vytal-green)" : "var(--color-vytal-text)",
                }}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
