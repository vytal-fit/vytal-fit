"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
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
  Menu,
  X as XIcon,
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
  TrendingUp,
  MessageSquare,
  MessageCircle,
  Heart,
  Settings,
  Zap,
  Globe,
  LogOut,
  Sun,
  Moon,
  Search,
  HelpCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Upload,
  Plug,
  Sparkles,
  Brain,
  ShoppingBag,
  History,
  Award,
  CheckSquare,
  Inbox,
  Gift,
  Image,
  Wrench,
  Newspaper,
  Rocket,
  LifeBuoy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToastProvider } from "@/components/toast";
import type { NotificationType } from "@vytal-fit/shared";
import { ROLE_LABELS, ROLE_COLORS, ORGANIZATION_CONFIGS } from "@vytal-fit/shared";
import { useAuthStore } from "@/stores/auth-store";
import { useAppStore } from "@/stores/app-store";
import { useDataStore } from "@/stores/data-store";
import { useI18n, type Language } from "@/lib/i18n";
import { CommandPalette } from "@/components/command-palette";
import { CreateOrgWizard, type CreateOrgData } from "@/components/create-org-wizard";
import { DailyBriefing } from "@/components/daily-briefing";

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresFeature?: keyof import("@vytal-fit/shared").OrganizationFeatures;
  badge?: number;
  children?: NavItem[];
}

interface NavGroup {
  titleKey?: string;
  items: NavItem[];
}

const allNavGroups: NavGroup[] = [
  {
    items: [
      { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
      { href: "/members", labelKey: "nav.members", icon: Users, children: [
        { href: "/members", labelKey: "nav.membersOverview", icon: Users },
        { href: "/members/analytics", labelKey: "nav.memberAnalytics", icon: Users },
        { href: "/members/contracts", labelKey: "nav.contracts", icon: Users },
        { href: "/members/groups", labelKey: "nav.groups", icon: Users },
        { href: "/members/referrals", labelKey: "nav.referrals", icon: Users },
        { href: "/members/ltv", labelKey: "nav.ltv", icon: Users },
        { href: "/members/import", labelKey: "nav.import", icon: Users },
        { href: "/members/retention", labelKey: "nav.retention", icon: Users },
      ]},
      { href: "/classes", labelKey: "nav.classes", icon: CalendarDays, requiresFeature: "groupClasses", children: [
        { href: "/classes", labelKey: "nav.classesOverview", icon: CalendarDays },
        { href: "/classes/calendar", labelKey: "nav.calendar", icon: CalendarDays },
        { href: "/classes/create", labelKey: "nav.createClass", icon: CalendarDays },
        { href: "/classes/smart", labelKey: "nav.smartScheduling", icon: Brain },
        { href: "/classes/templates", labelKey: "nav.classTemplates", icon: CalendarDays },
        { href: "/classes/waitlist", labelKey: "nav.waitlist", icon: CalendarDays },
        { href: "/classes/history", labelKey: "nav.classHistory", icon: History },
      ]},
      { href: "/wods", labelKey: "nav.wods", icon: Dumbbell, requiresFeature: "wods", children: [
        { href: "/wods", labelKey: "nav.wods", icon: Dumbbell },
        { href: "/wods/programming", labelKey: "nav.programming", icon: Dumbbell },
      ]},
      { href: "/crm", labelKey: "nav.crm", icon: UserPlus },
    ],
  },
  {
    titleKey: "nav.group.management",
    items: [
      { href: "/staff", labelKey: "nav.staff", icon: UserCog, children: [
        { href: "/staff", labelKey: "nav.staffOverview", icon: UserCog },
        { href: "/staff/payroll", labelKey: "nav.payroll", icon: UserCog },
        { href: "/staff/schedule", labelKey: "nav.schedule", icon: UserCog },
        { href: "/staff/certifications", labelKey: "nav.certifications", icon: UserCog },
        { href: "/staff/revenue", labelKey: "nav.coachRevenue", icon: UserCog },
      ]},
      { href: "/class-types", labelKey: "nav.classTypes", icon: Tag, requiresFeature: "groupClasses" },
      { href: "/locations", labelKey: "nav.locations", icon: MapPin, children: [
        { href: "/locations", labelKey: "nav.locations", icon: MapPin },
        { href: "/locations/dashboard", labelKey: "nav.locationDashboard", icon: MapPin },
      ]},
      { href: "/exercises", labelKey: "nav.exercises", icon: Dumbbell, requiresFeature: "movementLibrary" },
      { href: "/store", labelKey: "nav.store", icon: ShoppingBag, children: [
        { href: "/store", labelKey: "nav.store", icon: ShoppingBag },
        { href: "/store/vouchers", labelKey: "nav.vouchers", icon: Gift },
      ]},
      { href: "/plans", labelKey: "nav.plans", icon: CreditCard },
      { href: "/dropins", labelKey: "nav.dropins", icon: Globe, requiresFeature: "dropins" },
      { href: "/media", labelKey: "nav.media", icon: Image },
      { href: "/equipment", labelKey: "nav.equipment", icon: Wrench },
      { href: "/import", labelKey: "nav.importCenter", icon: Upload },
    ],
  },
  {
    titleKey: "nav.group.operations",
    items: [
      { href: "/financials", labelKey: "nav.financials", icon: DollarSign, children: [
        { href: "/financials", labelKey: "nav.financialsOverview", icon: DollarSign },
        { href: "/financials/revenue", labelKey: "nav.revenue", icon: DollarSign },
        { href: "/financials/dunning", labelKey: "nav.dunning", icon: DollarSign },
        { href: "/financials/sepa", labelKey: "nav.sepa", icon: DollarSign },
        { href: "/financials/invoices", labelKey: "nav.invoices", icon: DollarSign },
        { href: "/financials/expenses", labelKey: "nav.expenses", icon: DollarSign },
        { href: "/financials/budget", labelKey: "nav.budget", icon: DollarSign },
      ]},
      { href: "/analytics", labelKey: "nav.analytics", icon: TrendingUp },
      { href: "/ai", labelKey: "nav.aiInsights", icon: Sparkles },
      { href: "/reports", labelKey: "nav.reports", icon: BarChart3, children: [
        { href: "/reports", labelKey: "nav.reportsOverview", icon: BarChart3 },
        { href: "/reports/attendance", labelKey: "nav.attendanceReport", icon: BarChart3 },
      ]},
      { href: "/community", labelKey: "nav.community", icon: Heart, children: [
        { href: "/community", labelKey: "nav.community", icon: Heart },
        { href: "/community/questionnaires", labelKey: "nav.questionnaires", icon: Heart },
        { href: "/community/events", labelKey: "nav.events", icon: Heart },
        { href: "/community/badges", labelKey: "nav.badges", icon: Award },
      ]},
      { href: "/tasks", labelKey: "nav.tasks", icon: CheckSquare },
      { href: "/inbox", labelKey: "nav.inbox", icon: Inbox },
      { href: "/notifications", labelKey: "nav.notifications", icon: Bell },
      { href: "/messages", labelKey: "nav.messages", icon: MessageCircle, badge: 3 },
      { href: "/communications", labelKey: "nav.communications", icon: MessageSquare, children: [
        { href: "/communications", labelKey: "nav.commsOverview", icon: MessageSquare },
        { href: "/communications/sms", labelKey: "nav.sms", icon: MessageSquare },
        { href: "/communications/templates", labelKey: "nav.templates", icon: MessageSquare },
      ]},
      { href: "/automations", labelKey: "nav.automations", icon: Zap, children: [
        { href: "/automations", labelKey: "nav.automations", icon: Zap },
        { href: "/automations/milestones", labelKey: "nav.milestones", icon: Trophy },
        { href: "/automations/campaigns", labelKey: "nav.campaigns", icon: Zap },
      ]},
      { href: "/screen", labelKey: "nav.tvScreen", icon: Monitor, requiresFeature: "tvDisplay" },
      { href: "/support", labelKey: "nav.support", icon: LifeBuoy },
      { href: "/marketing", labelKey: "nav.marketing", icon: Megaphone },
    ],
  },
  {
    titleKey: "nav.group.settings",
    items: [
      { href: "/settings", labelKey: "nav.settings", icon: Settings, children: [
        { href: "/settings", labelKey: "nav.settingsOverview", icon: Settings },
        { href: "/settings/notifications", labelKey: "nav.notificationRules", icon: Settings },
        { href: "/settings/booking", labelKey: "nav.bookingRules", icon: Settings },
        { href: "/settings/kiosk", labelKey: "nav.kiosk", icon: Settings },
        { href: "/settings/app-config", labelKey: "nav.appConfig", icon: Settings },
        { href: "/settings/audit-log", labelKey: "nav.auditLog", icon: Settings },
        { href: "/settings/permissions", labelKey: "nav.permissions", icon: Settings },
        { href: "/settings/webhooks", labelKey: "nav.webhooks", icon: Settings },
        { href: "/settings/api-keys", labelKey: "nav.apiKeys", icon: Settings },
        { href: "/settings/branding", labelKey: "nav.branding", icon: Settings },
        { href: "/settings/backup", labelKey: "nav.backup", icon: Settings },
      ]},
      { href: "/integrations", labelKey: "nav.integrations", icon: Plug },
      { href: "/changelog", labelKey: "nav.changelog", icon: Newspaper },
      { href: "/help", labelKey: "nav.help", icon: HelpCircle },
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

  if (diffMin < 1) return "Agora";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
}

function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useI18n();
  const notifications = useDataStore((s) => s.notifications);
  const markNotificationRead = useDataStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useDataStore((s) => s.markAllNotificationsRead);
  const unreadCount = notifications.filter((n) => !n.read).length;

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
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <>
                    <span className="rounded-full bg-vytal-green/10 px-2 py-0.5 text-[10px] font-semibold text-vytal-green">
                      {unreadCount} {t("ui.new")}
                    </span>
                    <button
                      onClick={() => markAllNotificationsRead()}
                      className="text-[10px] font-medium text-vytal-muted transition-colors hover:text-vytal-green"
                    >
                      {t("ui.markAllRead")}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => {
                  if (!notification.read) markNotificationRead(notification.id);
                }}
                className={cn(
                  "flex cursor-pointer gap-3 border-b border-vytal-border px-4 py-3 transition-colors last:border-b-0 hover:bg-vytal-bg3",
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
            "lang-pill-transition rounded-md px-2 py-1 text-[11px] font-semibold",
            language === lang.code
              ? "bg-vytal-green text-vytal-bg shadow-sm"
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

function OrgSwitcher({ onCreateOrg, collapsed }: { onCreateOrg?: () => void; collapsed?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);
  const switchOrg = useAuthStore((s) => s.switchOrg);
  const orgSettings = useDataStore((s) => s.orgSettings);
  const applyOrgAccentColor = useAppStore((s) => s.applyOrgAccentColor);
  const setSidebarCollapsed = useAppStore((s) => s.toggleSidebar);
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);

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

  const orgInitial = orgSettings.name.charAt(0) || activeOrg?.organization.name.charAt(0) || "V";

  if (collapsed) {
    return (
      <div className="flex justify-center overflow-hidden">
        <button
          onClick={() => {
            if (sidebarCollapsed) {
              setSidebarCollapsed();
            }
          }}
          title={orgSettings.name || activeOrg?.organization.name || t("ui.selectOrg")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-vytal-green/10 text-sm font-bold text-vytal-green transition-colors hover:bg-vytal-green/20"
        >
          {orgInitial}
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-vytal-bg3"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-green/10 text-sm font-bold text-vytal-green">
          {orgInitial}
        </div>
        <div className="flex flex-1 flex-col min-w-0">
          <span className="text-sm font-semibold text-vytal-text truncate">
            {orgSettings.name || activeOrg?.organization.name || t("ui.selectOrg")}
          </span>
          <span className="text-[10px] text-vytal-muted">
            {activeOrg ? ROLE_LABELS[activeOrg.role] : ""}
            {activeOrg && ` · ${t(`vertical.${activeOrg.organization.type}`)}`}
          </span>
        </div>
        <svg className={cn("h-4 w-4 text-vytal-muted transition-transform", open && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>

      {open && (
        <div className="org-dropdown-shadow absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-vytal-border bg-vytal-bg2">
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
                  applyOrgAccentColor(mem.organizationId);
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
                    color: isActive ? "#22c55e" : "#6b8c72",
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
                      · {t(`vertical.${mem.organization.type}`)}
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
            <button
              onClick={() => {
                setOpen(false);
                if (onCreateOrg) {
                  onCreateOrg();
                } else {
                  router.push("/onboarding");
                }
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
            >
              <span className="text-lg leading-none">+</span>
              {t("ui.createNewOrg")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const floatingQuickReplies = [
  "Obrigado pela mensagem!",
  "A sua aula esta confirmada!",
  "Consulte o horario na app",
  "Vamos verificar e respondemos ja!",
];

function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [msgInput, setMsgInput] = useState("");
  const { t } = useI18n();
  const conversations = useDataStore((s) => s.conversations);
  const sendMessage = useDataStore((s) => s.sendMessage);
  const markAsRead = useDataStore((s) => s.markAsRead);
  const totalUnread = useDataStore((s) => s.totalUnread)();
  const ref = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeChat);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages.length, activeChat]);

  function handleSend() {
    if (!msgInput.trim() || !activeChat) return;
    sendMessage(activeChat, msgInput.trim());
    setMsgInput("");
  }

  function handleSelectChat(convId: string) {
    setActiveChat(convId);
    markAsRead(convId);
  }

  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-50">
      {/* Chat window — positioned absolutely above the bubble */}
      {open && (
        <div className="absolute bottom-16 right-0 flex h-[480px] w-[380px] flex-col overflow-hidden rounded-2xl border border-vytal-border bg-vytal-bg2 shadow-2xl shadow-black/30">
          {!activeChat ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-vytal-border bg-vytal-green/5 px-4 py-3">
                <div>
                  <h3 className="text-sm font-bold text-vytal-text">{t("messages.title")}</h3>
                  <p className="text-[10px] text-vytal-muted">{totalUnread} {t("messages.unread")}</p>
                </div>
                <div className="flex gap-1">
                  <Link href="/messages" className="flex h-7 w-7 items-center justify-center rounded-lg text-vytal-muted hover:bg-vytal-bg3 hover:text-vytal-text" title="Abrir tudo">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </Link>
                  <button onClick={() => setOpen(false)} className="flex h-7 w-7 items-center justify-center rounded-lg text-vytal-muted hover:bg-vytal-bg3 hover:text-vytal-text">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
              {/* Contact list */}
              <div className="flex-1 overflow-y-auto">
                {conversations.map((c) => {
                  const lastMsg = c.messages[c.messages.length - 1];
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleSelectChat(c.id)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-vytal-bg3"
                    >
                      <div className="relative">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-vytal-green/10 text-xs font-bold text-vytal-green">
                          {c.contactInitials}
                        </div>
                        {c.online && <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-vytal-bg2 bg-vytal-green" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-vytal-text">{c.contactName}</span>
                          <span className="text-[10px] text-vytal-muted">{c.lastMessageTime}</span>
                        </div>
                        <p className="truncate text-xs text-vytal-muted">{lastMsg?.text ?? ""}</p>
                      </div>
                      {c.unreadCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-vytal-green text-[10px] font-bold text-vytal-bg">{c.unreadCount}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 border-b border-vytal-border bg-vytal-green/5 px-4 py-3">
                <button onClick={() => setActiveChat(null)} className="flex h-7 w-7 items-center justify-center rounded-lg text-vytal-muted hover:bg-vytal-bg3">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="relative">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-vytal-green/10 text-xs font-bold text-vytal-green">
                    {activeConversation?.contactInitials}
                  </div>
                  {activeConversation?.online && <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-vytal-bg2 bg-vytal-green" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-vytal-text">{activeConversation?.contactName}</p>
                  <p className="text-[10px] text-vytal-muted">{activeConversation?.online ? t("messages.online") : t("messages.offline")}</p>
                </div>
              </div>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {(activeConversation?.messages ?? []).map((msg, i) => (
                  <div key={i} className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${msg.fromMe ? "rounded-br-md bg-vytal-green text-vytal-bg" : "rounded-bl-md bg-vytal-bg3 text-vytal-text"}`}>
                      <p className="text-[13px] leading-relaxed">{msg.text}</p>
                      <p className={`mt-0.5 text-[9px] ${msg.fromMe ? "text-vytal-bg/60" : "text-vytal-muted"}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              {/* Quick replies */}
              <div className="flex gap-1.5 overflow-x-auto px-4 py-2 border-t border-vytal-border">
                {floatingQuickReplies.map((qr, i) => (
                  <button
                    key={i}
                    onClick={() => setMsgInput(qr)}
                    className="shrink-0 rounded-full border border-vytal-border bg-vytal-bg3 px-3 py-1 text-[10px] text-vytal-muted transition-colors hover:border-vytal-green/30 hover:text-vytal-text"
                  >
                    {qr}
                  </button>
                ))}
              </div>
              {/* Input */}
              <div className="flex items-center gap-2 border-t border-vytal-border px-4 py-3">
                <input
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={t("messages.placeholder")}
                  className="flex-1 rounded-full border border-vytal-border bg-vytal-bg3 px-4 py-2 text-sm text-vytal-text placeholder:text-vytal-muted/50 outline-none focus:border-vytal-green/40"
                />
                <button
                  onClick={handleSend}
                  disabled={!msgInput.trim()}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-vytal-green text-vytal-bg transition-all hover:bg-vytal-green/90 disabled:opacity-30"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating bubble — always shows MessageCircle, never changes */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110 active:scale-95",
          "bg-vytal-green shadow-vytal-green/20"
        )}
      >
        <MessageCircle className="h-6 w-6 text-vytal-bg" />
        {totalUnread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-vytal-red text-[10px] font-bold text-white">
            {totalUnread}
          </span>
        )}
      </button>
    </div>
  );
}

function UserMenu({ user, onLogout }: { user: { user: { name: string; email: string } }; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useI18n();
  const activeOrg = useAuthStore((s) => s.user)?.memberships.find(
    (m) => m.organizationId === useAuthStore.getState().user?.activeOrganizationId
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

  const initials = user.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-vytal-bg3"
      >
        <div className="relative">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-vytal-green/10 text-xs font-semibold text-vytal-green">
            {initials}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-vytal-bg2 bg-vytal-green" />
        </div>
        <div className="hidden flex-col items-start md:flex">
          <span className="text-xs font-medium text-vytal-text">{user.user.name}</span>
          <span className="text-[10px] text-vytal-muted">
            {activeOrg ? ROLE_LABELS[activeOrg.role] : ""}
          </span>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-vytal-border bg-vytal-bg2 shadow-2xl">
          <div className="px-3 py-2.5 border-b border-vytal-border">
            <p className="text-sm font-medium text-vytal-text truncate">{user.user.name}</p>
            <p className="text-[10px] text-vytal-muted truncate">{user.user.email}</p>
          </div>
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-vytal-text transition-colors hover:bg-vytal-bg3"
            >
              <Users className="h-4 w-4 text-vytal-muted" />
              {t("ui.myProfile")}
            </Link>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-vytal-text transition-colors hover:bg-vytal-bg3"
            >
              <Settings className="h-4 w-4 text-vytal-muted" />
              {t("ui.settingsLabel")}
            </Link>
          </div>
          <div className="border-t border-vytal-border py-1">
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-vytal-red transition-colors hover:bg-vytal-bg3"
            >
              <LogOut className="h-4 w-4" />
              {t("ui.logoutLabel")}
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const rightSidebarOpen = useAppStore((s) => s.rightSidebarOpen);
  const toggleRightSidebar = useAppStore((s) => s.toggleRightSidebar);
  const setRightSidebarOpen = useAppStore((s) => s.setRightSidebarOpen);
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const [isHovered, setIsHovered] = useState(false);
  const isEffectivelyExpanded = !sidebarCollapsed || isHovered;
  const [showCreateOrgWizard, setShowCreateOrgWizard] = useState(false);
  const [expandedNavItems, setExpandedNavItems] = useState<Set<string>>(new Set());

  // Auto-expand parents whose children match the current pathname
  useEffect(() => {
    setExpandedNavItems((prev) => {
      const next = new Set(prev);
      for (const group of allNavGroups) {
        for (const item of group.items) {
          if (item.children) {
            const childMatch = item.children.some(
              (child) => pathname === child.href || pathname.startsWith(child.href + "/")
            );
            if (childMatch) next.add(item.href);
          }
        }
      }
      return next;
    });
  }, [pathname]);

  const toggleNavExpand = useCallback((href: string) => {
    setExpandedNavItems((prev) => {
      const next = new Set(prev);
      if (next.has(href)) {
        next.delete(href);
      } else {
        next.add(href);
      }
      return next;
    });
  }, []);

  // Get active org type for feature-based nav filtering
  const activeOrg = user?.memberships.find(
    (m) => m.organizationId === user.activeOrganizationId
  );
  const orgType = activeOrg?.organization.type ?? "other";
  const orgConfig = ORGANIZATION_CONFIGS[orgType];
  const notifications = useDataStore((s) => s.notifications);
  const notifUnread = notifications.filter((n) => !n.read).length;
  const navGroups = useMemo(() => {
    const groups = getNavGroups(orgType);
    // Inject dynamic unread badge on Notifications nav item
    return groups.map((group) => ({
      ...group,
      items: group.items.map((item) =>
        item.href === "/notifications" ? { ...item, badge: notifUnread } : item
      ),
    }));
  }, [orgType, notifUnread]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Auto-show right sidebar on xl screens if not manually toggled
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("vytal-right-sidebar-open") : null;
    if (stored === null && typeof window !== "undefined") {
      const mql = window.matchMedia("(min-width: 1280px)");
      setRightSidebarOpen(mql.matches);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isAuthenticated || !user) {
    return null;
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  /** Sidebar inner content — shared between desktop and mobile */
  const sidebarContent = (
    <>
      {/* Org Switcher */}
      <div className="border-b border-vytal-border px-3 py-3">
        <OrgSwitcher onCreateOrg={() => setShowCreateOrgWizard(true)} collapsed={!isEffectivelyExpanded} />
      </div>

      {/* Org type badge */}
      {orgConfig && isEffectivelyExpanded && (
        <div className="border-b border-vytal-border px-4 py-2">
          <span className="text-[9px] font-bold uppercase tracking-widest text-vytal-muted">
            {t(`vertical.${orgType}`)}
          </span>
          <span className="ml-2 text-[9px] text-vytal-muted">
            · {orgConfig.terminology.memberPlural} · {orgConfig.terminology.instructorPlural}
          </span>
        </div>
      )}

      {/* Navigation — filtered by org type features */}
      <nav className="mt-4 flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-6">
        {navGroups.map((group, gi) => (
          <div key={gi} className={gi > 0 ? "mt-4" : ""}>
            {group.titleKey && isEffectivelyExpanded && (
              <span className="mb-1 block px-3 text-[10px] font-semibold uppercase tracking-widest text-vytal-muted">
                {t(group.titleKey)}
              </span>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;

              if (item.children && item.children.length > 0) {
                const isExpanded = expandedNavItems.has(item.href);
                const isParentActive = item.children.some(
                  (child) => pathname === child.href || pathname.startsWith(child.href + "/")
                );

                return (
                  <div key={item.href}>
                    <button
                      onClick={() => {
                        if (!isEffectivelyExpanded) {
                          // When collapsed, navigate to parent route
                          router.push(item.href);
                          return;
                        }
                        toggleNavExpand(item.href);
                      }}
                      title={t(item.labelKey)}
                      className={cn(
                        "nav-item-transition group flex w-full items-center rounded-lg py-2 text-sm font-medium",
                        isEffectivelyExpanded ? "gap-3 px-3" : "justify-center px-0",
                        isParentActive
                          ? "border-l-2 border-vytal-green bg-vytal-green/5 text-vytal-green"
                          : "border-l-2 border-transparent text-vytal-muted hover:bg-vytal-bg3 hover:text-vytal-text hover:border-vytal-green/30"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-[18px] w-[18px] shrink-0",
                          isParentActive
                            ? "text-vytal-green"
                            : "text-vytal-muted group-hover:text-vytal-text"
                        )}
                      />
                      {isEffectivelyExpanded && <span className="flex-1 truncate text-left">{t(item.labelKey)}</span>}
                      {isEffectivelyExpanded && item.badge != null && item.badge > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-vytal-green text-[10px] font-bold text-vytal-bg">
                          {item.badge}
                        </span>
                      )}
                      {isEffectivelyExpanded && (
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 shrink-0 text-vytal-muted/60 transition-transform duration-200",
                            isExpanded ? "rotate-0" : "-rotate-90"
                          )}
                        />
                      )}
                    </button>
                    {isEffectivelyExpanded && (
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-200 ease-in-out",
                        isExpanded ? "max-h-96 opacity-100 mt-0.5" : "max-h-0 opacity-0"
                      )}
                    >
                      <div className="ml-[29px] space-y-0.5 py-1">
                      {item.children.map((child) => {
                        const isChildActive =
                          pathname === child.href || pathname.startsWith(child.href + "/");
                        const isExactChild = child.href === item.href
                          ? pathname === child.href
                          : isChildActive;
                        return (
                          <Link
                            key={child.href + child.labelKey}
                            href={child.href}
                            className={cn(
                              "flex items-center rounded-md py-1.5 px-3 text-[13px] transition-colors duration-150",
                              isExactChild
                                ? "font-semibold text-vytal-text"
                                : "font-normal text-vytal-muted hover:text-vytal-text"
                            )}
                          >
                            {isExactChild && (
                              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-vytal-green" />
                            )}
                            <span className="truncate">{t(child.labelKey)}</span>
                          </Link>
                        );
                      })}
                      </div>
                    </div>
                    )}
                  </div>
                );
              }

              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={t(item.labelKey)}
                  className={cn(
                    "nav-item-transition group flex items-center rounded-lg py-2 text-sm font-medium",
                    isEffectivelyExpanded ? "gap-3 px-3" : "justify-center px-0",
                    isActive
                      ? "border-l-2 border-vytal-green bg-vytal-green/5 text-vytal-green"
                      : "border-l-2 border-transparent text-vytal-muted hover:bg-vytal-bg3 hover:text-vytal-text hover:border-vytal-green/30"
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
                  {isEffectivelyExpanded && <span className="flex-1 truncate">{t(item.labelKey)}</span>}
                  {isEffectivelyExpanded && item.badge != null && item.badge > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-vytal-green text-[10px] font-bold text-vytal-bg">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User area moved to topbar */}
    </>
  );

  return (
    <ToastProvider>
    <div className="flex h-screen overflow-hidden bg-vytal-bg">
      {/* Desktop Sidebar — collapsible to icons */}
      <aside
        className={cn(
          "group hidden flex-col border-r border-vytal-border bg-vytal-bg2 lg:flex transition-all duration-300 ease-in-out relative overflow-hidden",
          sidebarCollapsed && !isHovered ? "w-[72px]" : "w-64",
          sidebarCollapsed && isHovered && "absolute left-0 top-0 bottom-0 z-50 shadow-2xl shadow-black/20"
        )}
        onMouseEnter={() => sidebarCollapsed && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {sidebarContent}
      </aside>
      {/* Collapse toggle — clean circle on sidebar edge, aligned with nav */}
      <button
        onClick={toggleSidebar}
        style={{ left: sidebarCollapsed && !isHovered ? 59 : 245 }}
        className="hidden lg:flex fixed top-[8.5rem] z-[60] h-7 w-7 items-center justify-center rounded-full border border-vytal-border bg-vytal-bg2 text-vytal-muted shadow-md transition-all duration-300 hover:bg-vytal-bg3 hover:text-vytal-green hover:shadow-lg"
        title={sidebarCollapsed ? "Expand" : "Collapse"}
      >
        {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>
      {/* Spacer when sidebar is collapsed + hovered (absolute) */}
      {sidebarCollapsed && <div className="hidden lg:block w-[72px] shrink-0" />}

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-vytal-border bg-vytal-bg2 transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button */}
        <div className="flex items-center justify-end px-3 pt-3">
          <button
            onClick={closeMobile}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* Main + Right Sidebar wrapper */}
      <div className="flex flex-1 overflow-hidden">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar — kloser-style */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-vytal-border bg-vytal-bg2/80 backdrop-blur-xl px-4 md:px-6">
          {/* Left: hamburger (mobile) + search */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search — wide input style */}
            <button
              onClick={() => {
                document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
              }}
              className="hidden items-center gap-3 rounded-lg border border-vytal-border bg-vytal-bg3/50 px-4 py-2 text-sm text-vytal-muted transition-all duration-200 hover:border-vytal-green/20 hover:text-vytal-text sm:flex w-64 lg:w-80"
            >
              <Search className="h-4 w-4" />
              <span>{t("ui.searchPlaceholder")}</span>
              <kbd className="ml-auto flex items-center gap-0.5 rounded border border-vytal-border bg-vytal-bg3 px-1.5 py-0.5 text-[10px] font-mono text-vytal-muted">
                ⌘K
              </kbd>
            </button>

            {/* Search icon — mobile */}
            <button
              onClick={() => {
                document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text sm:hidden"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>

          {/* Right: lang + theme + notifications + user */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              onClick={toggleRightSidebar}
              className={cn(
                "hidden md:flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                rightSidebarOpen
                  ? "bg-vytal-green/10 text-vytal-green"
                  : "text-vytal-muted hover:bg-vytal-bg3 hover:text-vytal-text"
              )}
              title={t("briefing.title")}
            >
              <BarChart3 className="h-[18px] w-[18px]" />
            </button>
            <NotificationsDropdown />

            {/* User — separated with border */}
            <div className="pl-3 border-l border-vytal-border">
              <UserMenu user={user} onLogout={handleLogout} />
            </div>
          </div>
        </header>
        <div className="page-enter p-4 lg:p-8">{children}</div>
      </main>

      </div>

      {/* Right Panel — Daily Briefing (elegant drawer) */}
      {rightSidebarOpen && (
        <div className="fixed inset-0 z-30 hidden md:block" onClick={toggleRightSidebar}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
        </div>
      )}
      <aside
        className={cn(
          "fixed right-0 top-0 bottom-0 z-40 hidden w-80 flex-col border-l border-vytal-border bg-vytal-bg2 shadow-2xl transition-transform duration-300 ease-in-out md:flex",
          rightSidebarOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Panel header */}
        <div className="flex h-16 items-center justify-between border-b border-vytal-border px-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-vytal-green" />
            <span className="text-sm font-semibold text-vytal-text">{t("briefing.title")}</span>
          </div>
          <button
            onClick={toggleRightSidebar}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        {/* Panel content */}
        <div className="flex-1 overflow-y-auto">
          <DailyBriefing />
        </div>
      </aside>

      {/* Floating Messenger-style chat widget */}
      <FloatingChat />

      {/* Command Palette */}
      <CommandPalette />

      {/* Create Org Wizard Modal */}
      {showCreateOrgWizard && (
        <CreateOrgWizard
          isModal
          onComplete={(orgData: CreateOrgData) => {
            setShowCreateOrgWizard(false);
          }}
          onCancel={() => setShowCreateOrgWizard(false)}
        />
      )}
    </div>
    </ToastProvider>
  );
}
