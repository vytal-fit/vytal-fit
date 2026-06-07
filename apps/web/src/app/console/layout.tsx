"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Calendar, Dumbbell, Trophy, User, Bell, Zap } from "lucide-react";
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

  useEffect(() => {
    if (pathname === "/console/login") return;
    if (!isAuthenticated) {
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

  if (pathname === "/console/login") {
    return <>{children}</>;
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--color-vytal-bg)" }}
    >
      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden md:flex md:flex-col md:w-60 md:shrink-0 md:fixed md:inset-y-0 md:z-40"
        style={{
          background: "linear-gradient(180deg, var(--color-vytal-bg2) 0%, #0b1a0d 100%)",
          borderRight: "1px solid var(--color-vytal-border)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center h-16 px-6 shrink-0"
          style={{ borderBottom: "1px solid var(--color-vytal-border)" }}
        >
          <Link href="/console" className="flex items-center gap-1.5 group">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ background: "var(--color-vytal-green)" }}
            >
              <Zap size={14} style={{ color: "#080c0a" }} strokeWidth={2.5} />
            </div>
            <div className="flex items-baseline gap-0">
              <span
                className="text-xs font-semibold tracking-tight"
                style={{ color: "var(--color-vytal-muted)" }}
              >
                my
              </span>
              <span
                className="text-base font-black tracking-tight"
                style={{ color: "var(--color-vytal-green)" }}
              >
                VYTAL
              </span>
            </div>
          </Link>
        </div>

        {/* Org badge */}
        <div className="px-4 pt-4 pb-2">
          <div
            className="rounded-xl px-3 py-2.5 flex items-center gap-2"
            style={{
              background: "rgba(34,197,94,0.06)",
              border: "1px solid var(--color-vytal-border)",
            }}
          >
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0"
              style={{ background: "var(--color-vytal-green)", color: "#080c0a" }}
            >
              {orgName.charAt(0).toUpperCase()}
            </div>
            <span
              className="text-xs font-semibold truncate"
              style={{ color: "var(--color-vytal-text)" }}
            >
              {orgName}
            </span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive ? "" : "hover:bg-[rgba(34,197,94,0.06)]"
                )}
                style={{
                  background: isActive
                    ? "rgba(34,197,94,0.15)"
                    : "transparent",
                  color: isActive ? "var(--color-vytal-green)" : "var(--color-vytal-muted)",
                  border: isActive ? "1px solid rgba(34,197,94,0.25)" : "1px solid transparent",
                }}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
                    isActive ? "" : "group-hover:bg-[rgba(34,197,94,0.1)]"
                  )}
                  style={{
                    background: isActive ? "var(--color-vytal-green)" : "transparent",
                  }}
                >
                  <Icon
                    size={15}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    style={{ color: isActive ? "#080c0a" : "var(--color-vytal-muted)" }}
                  />
                </div>
                <span
                  className="font-medium"
                  style={{ color: isActive ? "var(--color-vytal-text)" : "var(--color-vytal-muted)" }}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <div
                    className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: "var(--color-vytal-green)" }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div
          className="px-3 py-4 shrink-0"
          style={{ borderTop: "1px solid var(--color-vytal-border)" }}
        >
          <Link
            href="/console/profile"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 group"
            style={{
              background: "rgba(34,197,94,0.04)",
              border: "1px solid transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--color-vytal-border)";
              e.currentTarget.style.background = "rgba(34,197,94,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.background = "rgba(34,197,94,0.04)";
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ring-2"
              style={{
                background: "var(--color-vytal-green)",
                color: "#080c0a",
                boxShadow: "0 0 0 2px rgba(34,197,94,0.3)",
              }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate" style={{ color: "var(--color-vytal-text)" }}>
                {userName}
              </p>
              <p className="text-[10px] font-medium" style={{ color: "var(--color-vytal-green)" }}>
                Membro Pro
              </p>
            </div>
          </Link>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-col flex-1 min-w-0 md:ml-60">

        {/* ── Top bar ── */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-4 h-16 shrink-0"
          style={{
            background: "rgba(8,12,10,0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--color-vytal-border)",
          }}
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 md:hidden">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "var(--color-vytal-green)" }}
            >
              <Zap size={14} style={{ color: "#080c0a" }} strokeWidth={2.5} />
            </div>
            <div className="flex items-baseline gap-0">
              <span className="text-xs font-semibold" style={{ color: "var(--color-vytal-muted)" }}>my</span>
              <span className="text-sm font-black" style={{ color: "var(--color-vytal-green)" }}>VYTAL</span>
            </div>
          </div>

          {/* Desktop: breadcrumb */}
          <div className="hidden md:flex items-center gap-2">
            <span
              className="text-xs font-bold tracking-widest uppercase"
              style={{ color: "var(--color-vytal-green)", opacity: 0.7 }}
            >
              myVYTAL
            </span>
            <span className="text-xs" style={{ color: "var(--color-vytal-border)" }}>/</span>
            <span className="text-xs font-medium" style={{ color: "var(--color-vytal-muted)" }}>
              {orgName}
            </span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button
              className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:scale-105"
              style={{
                background: "rgba(34,197,94,0.08)",
                border: "1px solid var(--color-vytal-border)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(34,197,94,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(34,197,94,0.08)";
              }}
            >
              <Bell size={15} style={{ color: "var(--color-vytal-muted)" }} />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2"
                style={{
                  background: "var(--color-vytal-green)",
                  borderColor: "var(--color-vytal-bg)",
                }}
              />
            </button>

            {/* Mobile avatar */}
            <Link href="/console/profile" className="md:hidden">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: "var(--color-vytal-green)",
                  color: "#080c0a",
                  boxShadow: "0 0 0 2px rgba(34,197,94,0.3)",
                }}
              >
                {initials}
              </div>
            </Link>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
          {children}
        </main>

        {/* ── Bottom tab bar (mobile only) ── */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch"
          style={{
            background: "rgba(8,12,10,0.92)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderTop: "1px solid var(--color-vytal-border)",
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
                className="flex-1 flex flex-col items-center justify-center gap-1 py-3 relative transition-all duration-200"
              >
                {isActive && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full"
                    style={{ background: "var(--color-vytal-green)" }}
                  />
                )}
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200",
                    isActive ? "scale-110" : "scale-100 opacity-50"
                  )}
                  style={{
                    background: isActive ? "rgba(34,197,94,0.15)" : "transparent",
                  }}
                >
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    style={{ color: isActive ? "var(--color-vytal-green)" : "var(--color-vytal-muted)" }}
                  />
                </div>
                <span
                  className="text-[9px] font-semibold tracking-wide uppercase"
                  style={{ color: isActive ? "var(--color-vytal-green)" : "var(--color-vytal-muted)", opacity: isActive ? 1 : 0.6 }}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
