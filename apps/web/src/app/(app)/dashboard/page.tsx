"use client";

import { useState, useEffect, useCallback } from "react";
import type { Class, DashboardStats } from "@vytal-fit/shared";
import { useDataStore, formatCurrency, formatCurrencyCompact } from "@/stores/data-store";
import { useAuthStore } from "@/stores/auth-store";
import {
  Users,
  UserCheck,
  CalendarDays,
  TrendingUp,
  DollarSign,
  TrendingDown,
  AlertTriangle,
  Trophy,
  ScanLine,
  UserPlus,
  Dumbbell,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  SlidersHorizontal,
  Eye,
  EyeOff,
  RotateCcw,
  GripVertical,
  Activity,
  Calendar,
  CreditCard,
  Target,
  Sparkles,
  Rocket,
  CheckCircle,
  Circle,
  ArrowRight,
  X as XIcon,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: "green" | "red" | "amber" | "blue" | "purple";
  subtitle?: string;
  trend?: { value: string; up: boolean };
}

function StatCard({ label, value, icon, color, subtitle, trend }: StatCardProps) {
  const colorMap = {
    green: "text-vytal-green",
    red: "text-vytal-red",
    amber: "text-vytal-amber",
    blue: "text-vytal-blue",
    purple: "text-vytal-purple",
  };

  const bgMap = {
    green: "bg-vytal-green/10",
    red: "bg-vytal-red/10",
    amber: "bg-vytal-amber/10",
    blue: "bg-vytal-blue/10",
    purple: "bg-vytal-purple/10",
  };

  return (
    <div className="stat-card-hover min-h-[120px] rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
            {label}
          </span>
          <span className="text-2xl font-bold text-vytal-text">{value}</span>
          <div className="flex items-center gap-2">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-xs font-medium",
                  trend.up ? "text-vytal-green" : "text-vytal-red"
                )}
              >
                {trend.up ? "\u2191" : "\u2193"} {trend.value}
              </span>
            )}
            {subtitle && (
              <span className={`text-xs ${colorMap[color]}`}>{subtitle}</span>
            )}
          </div>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${bgMap[color]}`}
        >
          <div className={colorMap[color]}>{icon}</div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick Action Card
// ---------------------------------------------------------------------------

function QuickActionCard({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 rounded-xl border border-vytal-border bg-vytal-card p-4 transition-all duration-200 hover:border-vytal-green/30 hover:bg-vytal-green/5 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-green/10 text-vytal-green">
        {icon}
      </div>
      <span className="text-xs font-medium text-vytal-text">{label}</span>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Time-of-day greeting
// ---------------------------------------------------------------------------

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 19) return "Boa tarde";
  return "Boa noite";
}

// ---------------------------------------------------------------------------
// Chart Card wrapper
// ---------------------------------------------------------------------------

function ChartCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-vytal-border bg-vytal-card/80 p-6 backdrop-blur-sm",
        className
      )}
    >
      <h3 className="mb-4 text-sm font-semibold text-vytal-text">{title}</h3>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Recharts shared tooltip style
// ---------------------------------------------------------------------------

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#0f1610",
    border: "1px solid rgba(34,197,94,0.2)",
    borderRadius: "8px",
    fontSize: 12,
    color: "#dceee0",
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
    padding: "10px 14px",
  },
  itemStyle: { color: "#dceee0" },
  labelStyle: { color: "#6b8c72", marginBottom: 6, fontWeight: 600 as const },
};

// ---------------------------------------------------------------------------
// Mock chart data
// ---------------------------------------------------------------------------

const memberGrowthData = [
  { month: "Jan", total: 280, active: 220 },
  { month: "Feb", total: 295, active: 238 },
  { month: "Mar", total: 310, active: 255 },
  { month: "Apr", total: 328, active: 272 },
  { month: "May", total: 345, active: 290 },
  { month: "Jun", total: 358, active: 305 },
  { month: "Jul", total: 370, active: 318 },
  { month: "Aug", total: 382, active: 325 },
  { month: "Sep", total: 395, active: 338 },
  { month: "Oct", total: 405, active: 348 },
  { month: "Nov", total: 418, active: 358 },
  { month: "Dec", total: 428, active: 367 },
];

const revenueData = [
  { month: "Jan", revenue: 14200 },
  { month: "Feb", revenue: 15100 },
  { month: "Mar", revenue: 15800 },
  { month: "Apr", revenue: 16500 },
  { month: "May", revenue: 17200 },
  { month: "Jun", revenue: 18400 },
];

const occupancyByDayData = [
  { day: "Mon", occupancy: 82 },
  { day: "Tue", occupancy: 78 },
  { day: "Wed", occupancy: 85 },
  { day: "Thu", occupancy: 91 },
  { day: "Fri", occupancy: 75 },
  { day: "Sat", occupancy: 45 },
  { day: "Sun", occupancy: 22 },
];

function getOccupancyColor(pct: number): string {
  if (pct > 90) return "#ff4757";
  if (pct >= 80) return "#ffb300";
  return "#22c55e";
}

const defaultDistributionColors = ["#3dff6e", "#00d4ff", "#ffb300", "#ff4757", "#c084fc", "#ff8c42"];

function buildClassDistributionData(classTypes: { name: string; color: string }[]) {
  const names = ["WOD", "Open Box", "Strength", "Hyrox", "Gymnastics", "Mobility"];
  const values = [45, 15, 12, 10, 8, 5];
  const items = names.map((name, i) => ({
    name,
    value: values[i],
    color: classTypes[i]?.color ?? defaultDistributionColors[i] ?? "#6b8c72",
  }));
  items.push({ name: "Other", value: 5, color: "#6b8c72" });
  return items;
}

// Attendance heatmap data: 7 days x 13 hours (06:00-18:00)
const HEATMAP_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HEATMAP_HOURS = Array.from({ length: 13 }, (_, i) => `${String(i + 6).padStart(2, "0")}:00`);
const HEATMAP_DATA: number[][] = [
  [4, 16, 12, 8, 5, 3, 10, 4, 3, 5, 6, 18, 20],
  [3, 15, 11, 7, 4, 2, 9, 3, 2, 4, 5, 17, 19],
  [5, 17, 13, 9, 6, 4, 11, 5, 4, 6, 7, 19, 20],
  [6, 18, 14, 10, 7, 5, 12, 6, 5, 7, 8, 20, 22],
  [3, 14, 10, 6, 3, 2, 8, 3, 2, 3, 4, 14, 16],
  [0, 0, 8, 10, 6, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 4, 3, 0, 0, 0, 0, 0, 0, 0, 0],
];

function heatmapMax(): number {
  let max = 0;
  for (const row of HEATMAP_DATA) {
    for (const v of row) {
      if (v > max) max = v;
    }
  }
  return max;
}

function heatmapCellColor(value: number, max: number): string {
  if (value === 0) return "rgba(22,32,24,0.9)";
  const intensity = value / max;
  if (intensity <= 0.2) return "rgba(34,197,94,0.1)";
  if (intensity <= 0.4) return "rgba(34,197,94,0.2)";
  if (intensity <= 0.6) return "rgba(34,197,94,0.4)";
  if (intensity <= 0.8) return "rgba(34,197,94,0.6)";
  return "rgba(34,197,94,0.8)";
}

// ---------------------------------------------------------------------------
// Today's schedule row
// ---------------------------------------------------------------------------

function getEnrollmentColor(enrolled: number, capacity: number): string {
  const pct = (enrolled / capacity) * 100;
  if (pct >= 100) return "bg-vytal-red";
  if (pct >= 80) return "bg-vytal-amber";
  return "bg-vytal-green";
}

function ClassScheduleRow({ cls }: { cls: Class }) {
  const { t } = useI18n();
  const pct = Math.min((cls.enrolledCount / cls.maxCapacity) * 100, 100);
  const barColor = getEnrollmentColor(cls.enrolledCount, cls.maxCapacity);
  const isFull = cls.enrolledCount >= cls.maxCapacity;

  return (
    <div className="schedule-row-hover flex items-center gap-4 rounded-lg border border-vytal-border bg-vytal-card px-4 py-3 hover:border-[rgba(61,255,110,0.22)] hover:bg-vytal-bg3/50">
      <div className="w-24 shrink-0">
        <span className="font-mono text-sm font-semibold text-vytal-text">
          {cls.startTime}
        </span>
        <span className="ml-1 font-mono text-xs text-vytal-muted">
          - {cls.endTime}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: cls.classType.color }}
        />
        <span className="text-sm font-medium text-vytal-text">
          {cls.classType.name}
        </span>
      </div>
      <span className="hidden text-xs text-vytal-muted lg:block">
        {cls.location.name}
      </span>
      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-vytal-muted">
          {cls.coaches.map((c) => c.name.split(" ")[0]).join(", ") || "Open Box"}
        </span>
      </div>
      <div className="flex w-32 items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-vytal-bg3">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span
          className={`font-mono text-xs ${isFull ? "font-semibold text-vytal-red" : "text-vytal-muted"}`}
        >
          {cls.enrolledCount}/{cls.maxCapacity}
        </span>
      </div>
      {cls.waitlistCount > 0 && (
        <span className="rounded-full bg-vytal-amber/10 px-2 py-0.5 text-[10px] font-medium text-vytal-amber">
          +{cls.waitlistCount} {t("classes.waitlist")}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Custom tooltip for revenue chart
// ---------------------------------------------------------------------------

interface RevenueTooltipPayloadEntry {
  value: number;
  dataKey: string;
  color: string;
}

interface RevenueTooltipProps {
  active?: boolean;
  payload?: RevenueTooltipPayloadEntry[];
  label?: string;
}

function RevenueTooltip({ active, payload, label }: RevenueTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        backgroundColor: "#0f1610",
        border: "1px solid rgba(34,197,94,0.2)",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      <p style={{ color: "#6b8c72", marginBottom: 6, fontWeight: 600 }}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: "#dceee0", fontWeight: 700, fontSize: 14 }}>
          {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard Widget Customization
// ---------------------------------------------------------------------------

type WidgetKey = "kpi" | "quickActions" | "charts" | "schedule" | "activity" | "events";

interface DashboardLayout {
  hidden: WidgetKey[];
}

const LAYOUT_STORAGE_KEY = "vytal-dashboard-layout";

const widgetLabels: Record<WidgetKey, string> = {
  kpi: "KPI Cards",
  quickActions: "Quick Actions",
  charts: "Charts & Analytics",
  schedule: "Today's Schedule",
  activity: "Recent Activity",
  events: "Upcoming Events",
};

const defaultLayout: DashboardLayout = { hidden: [] };

function loadLayout(): DashboardLayout {
  if (typeof window === "undefined") return defaultLayout;
  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (!raw) return defaultLayout;
    return JSON.parse(raw) as DashboardLayout;
  } catch {
    return defaultLayout;
  }
}

function saveLayout(layout: DashboardLayout) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
}

// ---------------------------------------------------------------------------
// Mock Recent Activity data
// ---------------------------------------------------------------------------

const MOCK_ACTIVITY = [
  { icon: ScanLine, text: "Ana Silva checked in to WOD 17:30", time: "5m ago", iconColor: "text-vytal-green", bgColor: "bg-vytal-green/10" },
  { icon: Trophy, text: "Pedro Almeida achieved PR: Back Squat 140kg", time: "1h ago", iconColor: "text-vytal-amber", bgColor: "bg-vytal-amber/10" },
  { icon: UserPlus, text: "New lead: Carlos Mendes (Instagram)", time: "2h ago", iconColor: "text-vytal-blue", bgColor: "bg-vytal-blue/10" },
  { icon: CreditCard, text: `Payment processed: Sofia Santos ${formatCurrency(75)}`, time: "3h ago", iconColor: "text-vytal-green", bgColor: "bg-vytal-green/10" },
  { icon: CalendarDays, text: "Joana Ribeiro booked WOD 18:30", time: "3h ago", iconColor: "text-vytal-blue", bgColor: "bg-vytal-blue/10" },
  { icon: Dumbbell, text: "WOD published: Fran + Accessory Work", time: "4h ago", iconColor: "text-vytal-green", bgColor: "bg-vytal-green/10" },
  { icon: TrendingDown, text: "Miguel Costa cancelled membership", time: "5h ago", iconColor: "text-vytal-red", bgColor: "bg-vytal-red/10" },
  { icon: Trophy, text: "Rita Ferreira achieved PR: Clean & Jerk 75kg", time: "6h ago", iconColor: "text-vytal-amber", bgColor: "bg-vytal-amber/10" },
  { icon: UserPlus, text: "New member: Tiago Martins (Referral)", time: "8h ago", iconColor: "text-vytal-green", bgColor: "bg-vytal-green/10" },
  { icon: MessageCircle, text: "Diogo Lopes sent a message", time: "10h ago", iconColor: "text-vytal-blue", bgColor: "bg-vytal-blue/10" },
];

// ---------------------------------------------------------------------------
// Mock Upcoming Events data
// ---------------------------------------------------------------------------

const MOCK_EVENTS = [
  { title: "Friday Night Lights", date: "Fri, Jun 6 - 19:00", participants: "24 registered", badge: "Competition", badgeClass: "bg-vytal-amber/10 text-vytal-amber" },
  { title: "Nutrition Workshop", date: "Sat, Jun 7 - 10:00", participants: "12 registered", badge: "Workshop", badgeClass: "bg-vytal-blue/10 text-vytal-blue" },
  { title: "Summer Challenge Kick-off", date: "Mon, Jun 9 - 07:00", participants: "48 registered", badge: "Event", badgeClass: "bg-vytal-green/10 text-vytal-green" },
];

// ---------------------------------------------------------------------------
// Setup Banner — dismissable, shows progress + next steps
// ---------------------------------------------------------------------------

const SETUP_STORAGE_KEY = "vytal-setup-checklist";
const SETUP_DISMISSED_KEY = "vytal-setup-dismissed";

interface SetupStep {
  id: string;
  label: string;
  href: string;
  defaultCompleted: boolean;
}

const setupSteps: SetupStep[] = [
  { id: "create-org", label: "Criar organizacao", href: "/settings", defaultCompleted: true },
  { id: "complete-profile", label: "Completar perfil", href: "/settings", defaultCompleted: true },
  { id: "add-team", label: "Adicionar equipa", href: "/staff", defaultCompleted: false },
  { id: "setup-locations", label: "Configurar espacos", href: "/locations", defaultCompleted: false },
  { id: "create-class-types", label: "Criar tipos de aula", href: "/class-types", defaultCompleted: false },
  { id: "build-schedule", label: "Construir horario", href: "/classes/create", defaultCompleted: false },
  { id: "add-members", label: "Adicionar membros", href: "/members", defaultCompleted: false },
  { id: "setup-billing", label: "Configurar pagamentos", href: "/settings", defaultCompleted: false },
  { id: "configure-app", label: "Configurar app", href: "/settings/app-config", defaultCompleted: false },
  { id: "publish-wod", label: "Publicar primeiro WOD", href: "/wods/builder", defaultCompleted: false },
];

function loadSetupChecked(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SETUP_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function isSetupDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SETUP_DISMISSED_KEY) === "true";
}

function SetupBanner() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [dismissed, setDismissed] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = loadSetupChecked();
    const merged: Record<string, boolean> = {};
    for (const step of setupSteps) {
      merged[step.id] = stored[step.id] ?? step.defaultCompleted;
    }
    setChecked(merged);
    setDismissed(isSetupDismissed());
    setMounted(true);
  }, []);

  if (!mounted || dismissed) return null;

  const completedCount = Object.values(checked).filter(Boolean).length;
  const totalCount = setupSteps.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  if (completedCount >= totalCount) return null;

  const nextSteps = setupSteps.filter((s) => !checked[s.id]).slice(0, 4);

  function handleDismiss() {
    localStorage.setItem(SETUP_DISMISSED_KEY, "true");
    setDismissed(true);
  }

  const progressColor =
    progressPercent >= 70
      ? "from-vytal-green to-emerald-400"
      : progressPercent >= 40
        ? "from-vytal-amber to-yellow-400"
        : "from-vytal-blue to-cyan-400";

  return (
    <div
      className={cn(
        "rounded-xl border border-vytal-green/20 bg-vytal-card overflow-hidden transition-all duration-300 ease-in-out",
        collapsed ? "max-h-[72px]" : "max-h-[500px]"
      )}
    >
      {/* Header — always visible */}
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vytal-green/10">
          <Rocket className="h-5 w-5 text-vytal-green" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-vytal-text">
              Configure o seu espaco
            </h3>
            <span className="text-xs font-semibold text-vytal-muted">
              {completedCount}/{totalCount} passos completos
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full max-w-xs overflow-hidden rounded-full bg-vytal-bg3">
            <div
              className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-500", progressColor)}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="text-xs font-medium text-vytal-muted hover:text-vytal-text transition-colors"
          >
            {collapsed ? "Expandir" : "Minimizar"}
          </button>
          <button
            onClick={handleDismiss}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
            title="Dismiss"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Steps — collapsible */}
      {!collapsed && (
        <div className="border-t border-vytal-border px-5 py-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {nextSteps.map((step) => (
              <Link
                key={step.id}
                href={step.href}
                className="flex items-center gap-3 rounded-lg border border-vytal-border px-3 py-2.5 transition-colors hover:border-vytal-green/30 hover:bg-vytal-green/[0.03]"
              >
                <Circle className="h-4 w-4 text-vytal-muted/40 shrink-0" />
                <span className="text-sm text-vytal-text flex-1">{step.label}</span>
                <ArrowRight className="h-3.5 w-3.5 text-vytal-muted shrink-0" />
              </Link>
            ))}
          </div>
          <div className="mt-3 flex justify-center">
            <Link
              href="/setup"
              className="text-xs font-semibold text-vytal-green transition-colors hover:text-vytal-green/80"
            >
              Ver todos os passos
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);
  const orgSettings = useDataStore((s) => s.orgSettings);
  const storeClasses = useDataStore((s) => s.classes);
  const storeClassTypes = useDataStore((s) => s.classTypes);
  const storeMembers = useDataStore((s) => s.members);
  const storeLeads = useDataStore((s) => s.leads);
  const storeSubscriptions = useDataStore((s) => s.subscriptions);
  const storePersonalRecords = useDataStore((s) => s.personalRecords);
  const classDistributionData = buildClassDistributionData(storeClassTypes);
  const today = new Date().toISOString().split("T")[0];
  const todayClasses = storeClasses
    .filter((c) => c.date === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Compute real KPI stats from the data store
  const totalMembers = storeMembers.length;
  const activeMembers = storeMembers.filter((m) => m.status === "active").length;
  const inactiveMembers = storeMembers.filter((m) => m.status === "inactive").length;
  const todayClassesCount = todayClasses.length;

  // Occupancy: average enrollment percentage across today's classes
  const occupancyPercent = todayClasses.length > 0
    ? Math.round(todayClasses.reduce((sum, c) => sum + (c.enrolledCount / c.maxCapacity) * 100, 0) / todayClasses.length)
    : 0;

  // Monthly revenue: sum of active subscription plan prices
  const monthlyRevenue = storeSubscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + (s.plan?.price ?? 0), 0);

  // Churn rate: inactive / total * 100
  const churnRate = totalMembers > 0 ? Math.round((inactiveMembers / totalMembers) * 100 * 10) / 10 : 0;

  // At risk: active members with streak <= 1 who have checked in before
  const atRiskMembers = storeMembers.filter(
    (m) => m.status === "active" && m.streakWeeks <= 1 && m.lastCheckIn !== undefined
  ).length;

  // Pending payments: subscriptions that are expired or about to expire
  const pendingPayments = storeSubscriptions.filter(
    (s) => s.status === "expired" || (s.nextBillingDate && s.nextBillingDate <= today)
  ).length;

  // New members this month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const newMembersThisMonth = storeMembers.filter(
    (m) => new Date(m.joinedAt) >= monthStart
  ).length;

  // Check-ins today: members whose lastCheckIn is today
  const checkInsToday = storeMembers.filter((m) => m.lastCheckIn?.startsWith(today)).length;

  // PRs today
  const prsToday = storePersonalRecords.filter((pr) => pr.achievedAt?.startsWith(today)).length;

  const stats: DashboardStats = {
    totalMembers,
    activeMembers,
    inactiveMembers,
    todayClasses: todayClassesCount,
    occupancyPercent,
    monthlyRevenue,
    churnRate,
    atRiskMembers,
    pendingPayments,
    newMembersThisMonth,
    checkInsToday,
    prsToday,
  };

  const hMax = heatmapMax();
  const [chartsOpen, setChartsOpen] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [layout, setLayout] = useState<DashboardLayout>(defaultLayout);

  useEffect(() => {
    setLayout(loadLayout());
  }, []);

  const toggleWidget = useCallback((key: WidgetKey) => {
    setLayout((prev) => {
      const hidden = prev.hidden.includes(key)
        ? prev.hidden.filter((k) => k !== key)
        : [...prev.hidden, key];
      const next = { ...prev, hidden };
      saveLayout(next);
      return next;
    });
  }, []);

  const resetLayout = useCallback(() => {
    setLayout(defaultLayout);
    saveLayout(defaultLayout);
  }, []);

  const isVisible = useCallback((key: WidgetKey) => !layout.hidden.includes(key), [layout]);

  const firstName = user?.user.name.split(" ")[0] ?? "";

  return (
    <div className="space-y-8">
      {/* Setup Banner */}
      <SetupBanner />

      {/* Welcome Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">
            {getGreeting()}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {orgSettings.name} &mdash;{" "}
            {new Date().toLocaleDateString("pt-PT", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className="mt-0.5 text-xs text-vytal-muted/60">
            {t("dashboard.lastLogin").replace("{hours}", "2")}
          </p>
        </div>
        <button
          onClick={() => setEditMode((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
            editMode
              ? "border-vytal-green/40 bg-vytal-green/10 text-vytal-green"
              : "border-vytal-border bg-vytal-card text-vytal-muted hover:text-vytal-text"
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {t("dashboard.customize")}
        </button>
      </div>

      {/* Edit Mode Panel */}
      {editMode && (
        <div className="rounded-xl border border-vytal-green/20 bg-vytal-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-vytal-text">{t("dashboard.customizeWidgets")}</p>
            <button
              onClick={resetLayout}
              className="flex items-center gap-1 text-xs font-medium text-vytal-muted transition-colors hover:text-vytal-text"
            >
              <RotateCcw className="h-3 w-3" />
              {t("dashboard.resetDefault")}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(["kpi", "quickActions", "charts", "schedule", "activity", "events"] as WidgetKey[]).map((key) => (
              <button
                key={key}
                onClick={() => toggleWidget(key)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                  isVisible(key)
                    ? "border-vytal-green/20 bg-vytal-green/5 text-vytal-green"
                    : "border-vytal-border bg-vytal-bg2 text-vytal-muted"
                )}
              >
                <GripVertical className="h-3 w-3 opacity-40" />
                {isVisible(key) ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {widgetLabels[key]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions Bar */}
      {isVisible("quickActions") && (
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/members" className="inline-flex items-center gap-1.5 rounded-full border border-vytal-green/20 bg-vytal-green/5 px-3.5 py-1.5 text-xs font-semibold text-vytal-green transition-colors hover:bg-vytal-green/10">
          <UserPlus className="h-3.5 w-3.5" />
          {t("quickAction.createMember")}
        </Link>
        <Link href="/classes/create" className="inline-flex items-center gap-1.5 rounded-full border border-vytal-green/20 bg-vytal-green/5 px-3.5 py-1.5 text-xs font-semibold text-vytal-green transition-colors hover:bg-vytal-green/10">
          <CalendarDays className="h-3.5 w-3.5" />
          {t("quickAction.createClass")}
        </Link>
        <Link href="/wods/builder" className="inline-flex items-center gap-1.5 rounded-full border border-vytal-green/20 bg-vytal-green/5 px-3.5 py-1.5 text-xs font-semibold text-vytal-green transition-colors hover:bg-vytal-green/10">
          <Dumbbell className="h-3.5 w-3.5" />
          {t("quickAction.newWod")}
        </Link>
        <Link href="/crm" className="inline-flex items-center gap-1.5 rounded-full border border-vytal-border bg-vytal-card px-3.5 py-1.5 text-xs font-semibold text-vytal-text transition-colors hover:bg-vytal-bg3">
          <MessageCircle className="h-3.5 w-3.5" />
          {t("quickAction.newLead")}
        </Link>
      </div>
      )}

      {/* KPI Cards */}
      {isVisible("kpi") && (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        <StatCard
          label={t("dashboard.totalMembers")}
          value={stats.totalMembers}
          icon={<Users className="h-5 w-5" />}
          color="blue"
          trend={{ value: "+3.2%", up: true }}
        />
        <StatCard
          label={t("dashboard.activeMembers")}
          value={stats.activeMembers}
          icon={<UserCheck className="h-5 w-5" />}
          color="green"
          subtitle={`${Math.round((stats.activeMembers / stats.totalMembers) * 100)}% ${t("dashboard.ofTotal")}`}
          trend={{ value: "+2.8%", up: true }}
        />
        <StatCard
          label={t("dashboard.todaysClasses")}
          value={stats.todayClasses}
          icon={<CalendarDays className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          label={t("dashboard.occupancy")}
          value={`${stats.occupancyPercent}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          color={stats.occupancyPercent >= 80 ? "green" : "amber"}
          subtitle={stats.occupancyPercent >= 80 ? t("dashboard.aboveTarget") : t("dashboard.belowTarget")}
          trend={{ value: "+5.1%", up: true }}
        />
        <StatCard
          label={t("dashboard.monthlyRevenue")}
          value={formatCurrency(stats.monthlyRevenue)}
          icon={<DollarSign className="h-5 w-5" />}
          color="green"
          trend={{ value: "+5.8%", up: true }}
        />
        <StatCard
          label={t("dashboard.churnRate")}
          value={`${stats.churnRate}%`}
          icon={<TrendingDown className="h-5 w-5" />}
          color={stats.churnRate > 5 ? "red" : stats.churnRate > 3 ? "amber" : "green"}
          subtitle={stats.churnRate <= 3 ? t("dashboard.healthy") : t("dashboard.needsAttention")}
          trend={{ value: "-0.4%", up: true }}
        />
        <StatCard
          label={t("dashboard.atRiskMembers")}
          value={stats.atRiskMembers}
          icon={<AlertTriangle className="h-5 w-5" />}
          color={stats.atRiskMembers > 10 ? "red" : "amber"}
          subtitle={t("dashboard.noTraining7Days")}
          trend={{ value: "+2", up: false }}
        />
        <StatCard
          label={t("dashboard.prsToday")}
          value={stats.prsToday}
          icon={<Trophy className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          label={t("dashboard.checkInsToday")}
          value={stats.checkInsToday}
          icon={<ScanLine className="h-5 w-5" />}
          color="green"
          trend={{ value: "+12%", up: true }}
        />
      </div>
      )}

      {/* Charts Section — Collapsible */}
      {isVisible("charts") && (
      <div>
        <button
          onClick={() => setChartsOpen((v) => !v)}
          className="mb-4 flex items-center gap-2 text-sm font-semibold text-vytal-text transition-colors hover:text-vytal-green"
        >
          {chartsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {t("dashboard.chartsSection")}
        </button>
      </div>
      )}

      {isVisible("charts") && chartsOpen && (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 1: Member Growth */}
        <ChartCard title={t("dashboard.memberGrowth")}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={memberGrowthData}>
                <CartesianGrid stroke="rgba(34,197,94,0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} domain={[200, 450]} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={2} dot={false} name={t("dashboard.totalMembers")} />
                <Line type="monotone" dataKey="active" stroke="#00d4ff" strokeWidth={2} dot={false} name={t("dashboard.activeMembers")} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 2: Revenue Overview */}
        <ChartCard title={t("dashboard.revenueOverview")}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid stroke="rgba(34,197,94,0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: "#6b8c72", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => formatCurrencyCompact(v)}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Bar dataKey="revenue" fill="#22c55e" radius={[6, 6, 0, 0]} name={t("dashboard.monthlyRevenue")} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 3: Class Occupancy by Day */}
        <ChartCard title={t("dashboard.occupancyByDay")}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyByDayData}>
                <CartesianGrid stroke="rgba(34,197,94,0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b8c72", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
                <Tooltip {...tooltipStyle} formatter={(value) => [`${value}%`, t("dashboard.occupancy")]} />
                {occupancyByDayData.map((entry, index) => (
                  <Bar key={index} dataKey="occupancy" fill={getOccupancyColor(entry.occupancy)} radius={[6, 6, 0, 0]} />
                ))}
                <Bar dataKey="occupancy" radius={[6, 6, 0, 0]}>
                  {occupancyByDayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getOccupancyColor(entry.occupancy)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 4: Class Type Distribution */}
        <ChartCard title={t("dashboard.classDistribution")}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={classDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {classDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span style={{ color: "#dceee0", fontSize: 12 }}>{value}</span>
                  )}
                />
                <Tooltip {...tooltipStyle} formatter={(value) => [`${value}%`, ""]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      )}

      {/* Chart 5: Attendance Heatmap */}
      {isVisible("charts") && chartsOpen && (
      <ChartCard title={t("dashboard.attendanceHeatmap")} className="col-span-full">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr>
                <th className="w-12 px-1 py-1 text-left text-[10px] font-medium uppercase tracking-wider text-vytal-muted" />
                {HEATMAP_HOURS.map((h) => (
                  <th key={h} className="px-0.5 py-1 text-center text-[10px] font-medium text-vytal-muted">
                    {h.slice(0, 2)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HEATMAP_DAYS.map((day, di) => (
                <tr key={day}>
                  <td className="px-1 py-0.5 text-xs font-medium text-vytal-muted">{day}</td>
                  {HEATMAP_DATA[di].map((value, ti) => (
                    <td key={ti} className="px-0.5 py-0.5">
                      <div
                        className="flex h-8 items-center justify-center rounded"
                        style={{ backgroundColor: heatmapCellColor(value, hMax) }}
                        title={`${day} ${HEATMAP_HOURS[ti]}: ${value} check-ins`}
                      >
                        <span
                          className="font-mono text-[10px] font-semibold"
                          style={{ color: value === 0 ? "rgba(107,140,114,0.3)" : value / hMax > 0.4 ? "#080c0a" : "#6b8c72" }}
                        >
                          {value > 0 ? value : ""}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Legend */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-[10px] font-medium uppercase tracking-wider text-vytal-muted">{t("dashboard.less")}</span>
          <div className="flex gap-1">
            {[0, 0.1, 0.2, 0.4, 0.6, 0.8].map((opacity) => (
              <div
                key={opacity}
                className="h-3 w-6 rounded"
                style={{
                  backgroundColor: opacity === 0 ? "rgba(22,32,24,0.9)" : `rgba(34,197,94,${opacity})`,
                }}
              />
            ))}
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-vytal-muted">{t("dashboard.more")}</span>
        </div>
      </ChartCard>
      )}

      {/* Today's Schedule */}
      {isVisible("schedule") && (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-vytal-text">
            {t("dashboard.todaysSchedule")}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-xs text-vytal-muted">
              {new Date().toLocaleDateString("pt-PT", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <Link
              href="/classes"
              className="flex items-center gap-1 text-xs font-medium text-vytal-green transition-colors hover:text-vytal-green/80"
            >
              {t("dashboard.viewAll")}
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
        <div className="space-y-2">
          {todayClasses.length > 0 ? (
            todayClasses.map((cls) => (
              <ClassScheduleRow key={cls.id} cls={cls} />
            ))
          ) : (
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-8 text-center">
              <p className="text-sm text-vytal-muted">
                {t("dashboard.noClassesToday")}
              </p>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Recent Activity + Upcoming Events */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity Feed */}
        {isVisible("activity") && (
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-vytal-green" />
            <h2 className="text-lg font-semibold text-vytal-text">{t("dashboard.recentActivity")}</h2>
          </div>
          <div className="rounded-xl border border-vytal-border bg-vytal-card/80 backdrop-blur-sm">
            {MOCK_ACTIVITY.map((activity, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-vytal-bg3/50",
                  i < MOCK_ACTIVITY.length - 1 && "border-b border-vytal-border"
                )}
              >
                <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", activity.bgColor)}>
                  <activity.icon className={cn("h-4 w-4", activity.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-vytal-text">{activity.text}</p>
                  <p className="mt-0.5 text-[11px] text-vytal-muted">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Upcoming Events */}
        {isVisible("events") && (
        <div className="lg:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-vytal-blue" />
            <h2 className="text-lg font-semibold text-vytal-text">{t("dashboard.upcomingEvents")}</h2>
          </div>
          <div className="space-y-3">
            {MOCK_EVENTS.length > 0 ? (
              MOCK_EVENTS.map((event, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-vytal-border bg-vytal-card/80 p-4 backdrop-blur-sm transition-colors hover:border-[rgba(61,255,110,0.22)]"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-vytal-text">{event.title}</h3>
                    <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", event.badgeClass)}>
                      {event.badge}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-vytal-muted">
                    <Calendar className="h-3 w-3" />
                    <span>{event.date}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-vytal-muted">
                    <Users className="h-3 w-3" />
                    <span>{event.participants}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-vytal-border bg-vytal-card p-8 text-center">
                <Calendar className="mx-auto mb-2 h-8 w-8 text-vytal-muted/30" />
                <p className="text-sm text-vytal-muted">{t("dashboard.noUpcomingEvents")}</p>
              </div>
            )}
            <Link
              href="/community/events"
              className="flex items-center justify-center gap-1 text-xs font-medium text-vytal-green transition-colors hover:text-vytal-green/80"
            >
              {t("dashboard.viewAll")}
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
