"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Zap,
  Globe,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockNotifications } from "@vytal-fit/shared";
import type { NotificationType } from "@vytal-fit/shared";
import { ROLE_LABELS, ROLE_COLORS, ORGANIZATION_CONFIGS } from "@vytal-fit/shared";
import { useAuthStore } from "@/stores/auth-store";
import { useAppStore } from "@/stores/app-store";
import { useI18n, type Language } from "@/lib/i18n";

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Feature flag required — item hidden if feature is disabled for this org type */
  requiresFeature?: keyof import("@vytal-fit/shared").OrganizationFeatures;
}

interface NavGroup {
  titleKey?: string;
  items: NavItem[];
}

const allNavGroups: NavGroup[] = [
  {
    items: [
      { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
      { href: "/members", labelKey: "nav.members", icon: Users },
      { href: "/classes", labelKey: "nav.classes", icon: CalendarDays, requiresFeature: "groupClasses" },
      { href: "/wods", labelKey: "nav.wods", icon: Dumbbell, requiresFeature: "wods" },
      { href: "/crm", labelKey: "nav.crm", icon: UserPlus },
    ],
  },
  {
    titleKey: "nav.group.management",
    items: [
      { href: "/staff", labelKey: "nav.staff", icon: UserCog },
      { href: "/class-types", labelKey: "nav.classTypes", icon: Tag, requiresFeature: "groupClasses" },
      { href: "/locations", labelKey: "nav.locations", icon: MapPin },
      { href: "/exercises", labelKey: "nav.exercises", icon: Dumbbell, requiresFeature: "movementLibrary" },
      { href: "/plans", labelKey: "nav.plans", icon: CreditCard },
      { href: "/dropins", labelKey: "nav.dropins", icon: Globe, requiresFeature: "dropins" },
    ],
  },
  {
    titleKey: "nav.group.operations",
    items: [
      { href: "/financials", labelKey: "nav.financials", icon: DollarSign },
      { href: "/reports", labelKey: "nav.reports", icon: BarChart3 },
      { href: "/communications", labelKey: "nav.communications", icon: MessageSquare },
      { href: "/automations", labelKey: "nav.automations", icon: Zap },
    ],
  },
  {
    titleKey: "nav.group.settings",
    items: [
      { href: "/settings", labelKey: "nav.settings", icon: Settings },
    ],
  },
];

/** Filter nav items based on the active org's feature flags */
function getNavGroups(orgType: string): NavGroup[] {
  const config = ORGANIZATION_CONFIGS[orgType];
  if (!config) return allNavGroups;

  return allNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.requiresFeature) return true;
        return config.features[item.requiresFeature];
      }),
    }))
    .filter((group) => group.items.length > 0);
}

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
  const { t } = useI18n();
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
                {t("ui.notifications")}
              </h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-vytal-green/10 px-2 py-0.5 text-[10px] font-semibold text-vytal-green">
                  {unreadCount} {t("ui.new")}
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

function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();
  const languages: { code: Language; label: string }[] = [
    { code: "pt", label: "PT" },
    { code: "en", label: "EN" },
    { code: "es", label: "ES" },
  ];

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-vytal-bg3 p-0.5">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={cn(
            "rounded-md px-2 py-1 text-[11px] font-semibold transition-colors",
            language === lang.code
              ? "bg-vytal-green text-vytal-bg"
              : "text-vytal-muted hover:text-vytal-text"
          )}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useAppStore();

  return (
    <button
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <Sun className="h-[18px] w-[18px]" />
      ) : (
        <Moon className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}

function OrgSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);
  const switchOrg = useAuthStore((s) => s.switchOrg);

  const memberships = user?.memberships ?? [];
  const activeOrgId = user?.activeOrganizationId ?? "";

  const activeOrg = memberships.find(
    (m) => m.organizationId === activeOrgId
  );

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
            {activeOrg?.organization.name ?? t("ui.selectOrg")}
          </span>
          <span className="text-[10px] text-vytal-muted">
            {activeOrg ? ROLE_LABELS[activeOrg.role] : ""}
            {activeOrg && ` · ${ORGANIZATION_CONFIGS[activeOrg.organization.type]?.label ?? activeOrg.organization.type}`}
          </span>
        </div>
        <svg className={cn("h-4 w-4 text-vytal-muted transition-transform", open && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-vytal-border bg-vytal-bg2 shadow-2xl">
          <div className="border-b border-vytal-border px-3 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-vytal-muted">
              {t("ui.yourOrganizations")}
            </span>
          </div>
          {memberships.map((mem) => {
            const isActive = mem.organizationId === activeOrgId;
            const config = ORGANIZATION_CONFIGS[mem.organization.type];
            return (
              <button
                key={mem.id}
                onClick={() => {
                  switchOrg(mem.organizationId);
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
              {t("ui.createNewOrg")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  // Get active org type for feature-based nav filtering
  const activeOrg = user?.memberships.find(
    (m) => m.organizationId === user.activeOrganizationId
  );
  const orgType = activeOrg?.organization.type ?? "other";
  const orgConfig = ORGANIZATION_CONFIGS[orgType];
  const navGroups = getNavGroups(orgType);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-vytal-bg">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-vytal-border bg-vytal-bg2">
        {/* Org Switcher */}
        <div className="border-b border-vytal-border px-3 py-3">
          <OrgSwitcher />
        </div>

        {/* Org type badge */}
        {orgConfig && (
          <div className="border-b border-vytal-border px-4 py-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-vytal-muted">
              {orgConfig.label}
            </span>
            <span className="ml-2 text-[9px] text-vytal-muted">
              · {orgConfig.terminology.memberPlural} · {orgConfig.terminology.instructorPlural}
            </span>
          </div>
        )}

        {/* Navigation — filtered by org type features */}
        <nav className="mt-4 flex flex-1 flex-col gap-1 overflow-y-auto px-3">
          {navGroups.map((group, gi) => (
            <div key={gi} className={gi > 0 ? "mt-4" : ""}>
              {group.titleKey && (
                <span className="mb-1 block px-3 text-[10px] font-semibold uppercase tracking-widest text-vytal-muted">
                  {t(group.titleKey)}
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
                    {t(item.labelKey)}
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
              {user.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex flex-1 flex-col min-w-0">
              <span className="text-sm font-medium text-vytal-text truncate">
                {user.user.name}
              </span>
              <span className="text-xs text-vytal-muted truncate">{user.user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-red"
              title={t("action.logout")}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="flex h-14 items-center justify-end gap-3 border-b border-vytal-border bg-vytal-bg2/50 px-8">
          <LanguageSwitcher />
          <ThemeToggle />
          <NotificationsDropdown />
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
