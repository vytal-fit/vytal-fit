"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Dumbbell,
  UserPlus,
  CreditCard,
  Bell,
  Trophy,
  Megaphone,
  CalendarCheck,
  Flame,
  Clock,
  CheckCircle,
  AlertCircle,
  UserCog,
  Tag,
  MapPin,
  DollarSign,
  BarChart3,
  MessageSquare,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockNotifications, mockCurrentUser } from "@vytal-fit/shared";
import type { NotificationType } from "@vytal-fit/shared";
import { ROLE_LABELS, ROLE_COLORS, ORGANIZATION_CONFIGS } from "@vytal-fit/shared";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/members", label: "Members", icon: Users },
      { href: "/classes", label: "Classes", icon: CalendarDays },
      { href: "/wods", label: "WODs", icon: Dumbbell },
      { href: "/crm", label: "CRM", icon: UserPlus },
    ],
  },
  {
    title: "Management",
    items: [
      { href: "/staff", label: "Staff", icon: UserCog },
      { href: "/class-types", label: "Class Types", icon: Tag },
      { href: "/locations", label: "Locations", icon: MapPin },
      { href: "/exercises", label: "Exercises", icon: Dumbbell },
      { href: "/plans", label: "Plans", icon: CreditCard },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/financials", label: "Financials", icon: DollarSign },
      { href: "/reports", label: "Reports", icon: BarChart3 },
      { href: "/communications", label: "Communications", icon: MessageSquare },
    ],
  },
  {
    title: "Settings",
    items: [
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

const notificationIcon: Record<NotificationType, React.ReactNode> = {
  pr_achieved: <Trophy className="h-3.5 w-3.5 text-vytal-green" />,
  wod_published: <Megaphone className="h-3.5 w-3.5 text-vytal-blue" />,
  booking_confirmed: <CalendarCheck className="h-3.5 w-3.5 text-vytal-green" />,
  booking_cancelled: <AlertCircle className="h-3.5 w-3.5 text-vytal-red" />,
  class_reminder: <Clock className="h-3.5 w-3.5 text-vytal-amber" />,
  streak_milestone: <Flame className="h-3.5 w-3.5 text-vytal-green" />,
  payment_success: <CheckCircle className="h-3.5 w-3.5 text-vytal-green" />,
  payment_failed: <AlertCircle className="h-3.5 w-3.5 text-vytal-red" />,
};

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
}

function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-vytal-green text-[9px] font-bold text-vytal-bg">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-vytal-border bg-vytal-bg2 shadow-2xl">
          <div className="border-b border-vytal-border px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-vytal-text">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-vytal-green/10 px-2 py-0.5 text-[10px] font-semibold text-vytal-green">
                  {unreadCount} new
                </span>
              )}
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {mockNotifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "flex gap-3 border-b border-vytal-border px-4 py-3 transition-colors last:border-b-0 hover:bg-vytal-bg3",
                  !notification.read && "bg-vytal-green/[0.03]"
                )}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-vytal-bg3">
                  {notificationIcon[notification.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        "text-xs font-semibold",
                        notification.read
                          ? "text-vytal-muted"
                          : "text-vytal-text"
                      )}
                    >
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-vytal-green" />
                    )}
                  </div>
                  <p className="text-[11px] text-vytal-muted truncate">
                    {notification.body}
                  </p>
                  <p className="mt-0.5 text-[10px] text-vytal-muted">
                    {formatTimeAgo(notification.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OrgSwitcher() {
  const [open, setOpen] = useState(false);
  const [activeOrgId, setActiveOrgId] = useState(mockCurrentUser.activeOrganizationId);
  const ref = useRef<HTMLDivElement>(null);

  const activeOrg = mockCurrentUser.memberships.find(
    (m) => m.organizationId === activeOrgId
  );
  const activeMembership = activeOrg;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-vytal-bg3"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-green/10 text-sm font-bold text-vytal-green">
          {activeOrg?.organization.name.charAt(0) ?? "V"}
        </div>
        <div className="flex flex-1 flex-col min-w-0">
          <span className="text-sm font-semibold text-vytal-text truncate">
            {activeOrg?.organization.name ?? "Select org"}
          </span>
          <span className="text-[10px] text-vytal-muted">
            {activeMembership ? ROLE_LABELS[activeMembership.role] : ""}
            {activeOrg && ` · ${ORGANIZATION_CONFIGS[activeOrg.organization.type]?.label ?? activeOrg.organization.type}`}
          </span>
        </div>
        <svg className={cn("h-4 w-4 text-vytal-muted transition-transform", open && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-vytal-border bg-vytal-bg2 shadow-2xl">
          <div className="border-b border-vytal-border px-3 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-vytal-muted">
              Your organizations
            </span>
          </div>
          {mockCurrentUser.memberships.map((mem) => {
            const isActive = mem.organizationId === activeOrgId;
            const config = ORGANIZATION_CONFIGS[mem.organization.type];
            return (
              <button
                key={mem.id}
                onClick={() => {
                  setActiveOrgId(mem.organizationId);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-vytal-bg3",
                  isActive && "bg-vytal-green/5"
                )}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold"
                  style={{
                    backgroundColor: isActive ? "rgba(61,255,110,0.1)" : "rgba(107,140,114,0.1)",
                    color: isActive ? "#3dff6e" : "#6b8c72",
                  }}
                >
                  {mem.organization.name.charAt(0)}
                </div>
                <div className="flex flex-1 flex-col min-w-0">
                  <span className={cn("text-xs font-medium truncate", isActive ? "text-vytal-text" : "text-vytal-muted")}>
                    {mem.organization.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[9px] font-semibold"
                      style={{ color: ROLE_COLORS[mem.role] }}
                    >
                      {ROLE_LABELS[mem.role]}
                    </span>
                    <span className="text-[9px] text-vytal-muted">
                      · {config?.label}
                    </span>
                  </div>
                </div>
                {isActive && (
                  <div className="h-1.5 w-1.5 rounded-full bg-vytal-green" />
                )}
              </button>
            );
          })}
          <div className="border-t border-vytal-border px-3 py-2">
            <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text">
              <span className="text-lg leading-none">+</span>
              Create new organization
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-vytal-bg">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-vytal-border bg-vytal-bg2">
        {/* Org Switcher */}
        <div className="border-b border-vytal-border px-3 py-3">
          <OrgSwitcher />
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex flex-1 flex-col gap-1 overflow-y-auto px-3">
          {navGroups.map((group, gi) => (
            <div key={gi} className={gi > 0 ? "mt-4" : ""}>
              {group.title && (
                <span className="mb-1 block px-3 text-[10px] font-semibold uppercase tracking-widest text-vytal-muted">
                  {group.title}
                </span>
              )}
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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
            </div>
          ))}
        </nav>

        {/* User Area */}
        <div className="border-t border-vytal-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-vytal-green/10 text-sm font-semibold text-vytal-green">
              {mockCurrentUser.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-vytal-text">
                {mockCurrentUser.user.name}
              </span>
              <span className="text-xs text-vytal-muted">{mockCurrentUser.user.email}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar with notifications */}
        <div className="flex h-14 items-center justify-end border-b border-vytal-border bg-vytal-bg2/50 px-8">
          <NotificationsDropdown />
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
