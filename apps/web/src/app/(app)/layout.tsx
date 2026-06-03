"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Dumbbell,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/members", label: "Members", icon: Users },
  { href: "/classes", label: "Classes", icon: CalendarDays },
  { href: "/wods", label: "WODs", icon: Dumbbell },
  { href: "/crm", label: "CRM", icon: UserPlus },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-vytal-bg">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-vytal-border bg-vytal-bg2">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vytal-green/10">
            <span className="text-sm font-bold text-vytal-green">V</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-vytal-text">
            Vytal
          </span>
          <span className="ml-1 rounded bg-vytal-green/10 px-1.5 py-0.5 text-[10px] font-medium text-vytal-green">
            ADMIN
          </span>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-l-2 border-vytal-green bg-vytal-green/5 text-vytal-green"
                    : "border-l-2 border-transparent text-vytal-muted hover:bg-vytal-bg3 hover:text-vytal-text"
                )}
              >
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0",
                    isActive
                      ? "text-vytal-green"
                      : "text-vytal-muted group-hover:text-vytal-text"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Area */}
        <div className="border-t border-vytal-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-vytal-green/10 text-sm font-semibold text-vytal-green">
              JF
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-vytal-text">
                Jose Fonte
              </span>
              <span className="text-xs text-vytal-muted">Owner</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
