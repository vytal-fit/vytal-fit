"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Dumbbell, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useAppStore } from "@/stores/app-store";

const NAV_TABS = [
  { href: "/console", label: "Início", icon: Home, exact: true },
  { href: "/console/schedule", label: "Horário", icon: Calendar, exact: false },
  { href: "/console/wod", label: "WOD", icon: Dumbbell, exact: false },
  { href: "/console/records", label: "Records", icon: Trophy, exact: false },
  { href: "/console/profile", label: "Perfil", icon: User, exact: false },
];

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, hydrate } = useAuthStore();
  const { hydrate: hydrateApp } = useAppStore();

  useEffect(() => {
    hydrate();
    hydrateApp();
  }, [hydrate, hydrateApp]);

  const initials = user?.user?.name
    ? user.user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "AT";

  const orgName =
    user?.memberships?.find((m) => m.organizationId === user.activeOrganizationId)
      ?.organization?.name ?? "Vytal";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-vytal-bg)" }}>
      {/* Top bar */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b"
        style={{
          background: "var(--color-vytal-bg2)",
          borderColor: "var(--color-vytal-border)",
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "var(--color-vytal-green)" }}
          >
            vytal
          </span>
          <span
            className="text-xs"
            style={{ color: "var(--color-vytal-muted)" }}
          >
            /
          </span>
          <span
            className="text-xs font-medium truncate max-w-[160px]"
            style={{ color: "var(--color-vytal-text)" }}
          >
            {orgName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: "var(--color-vytal-green)",
              color: "#080c0a",
            }}
          >
            {initials}
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t"
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
                isActive
                  ? ""
                  : "opacity-50 hover:opacity-75"
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
  );
}
