"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Rocket,
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronRight,
  Clock,
  ArrowRight,
  Users,
  MapPin,
  Tag,
  CalendarDays,
  UserPlus,
  CreditCard,
  Smartphone,
  Dumbbell,
  UserCog,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";

interface ChecklistItem {
  id: string;
  titleKey: string;
  descriptionKey: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  estimatedMinutes: number;
  defaultCompleted: boolean;
}

const STORAGE_KEY = "vytal-setup-checklist";

const checklistItems: ChecklistItem[] = [
  {
    id: "create-org",
    titleKey: "setup.step.createOrg",
    descriptionKey: "setup.step.createOrgDesc",
    href: "/settings",
    icon: Rocket,
    estimatedMinutes: 2,
    defaultCompleted: true,
  },
  {
    id: "complete-profile",
    titleKey: "setup.step.completeProfile",
    descriptionKey: "setup.step.completeProfileDesc",
    href: "/settings",
    icon: UserCog,
    estimatedMinutes: 3,
    defaultCompleted: true,
  },
  {
    id: "add-team",
    titleKey: "setup.step.addTeam",
    descriptionKey: "setup.step.addTeamDesc",
    href: "/staff",
    icon: Users,
    estimatedMinutes: 5,
    defaultCompleted: false,
  },
  {
    id: "setup-locations",
    titleKey: "setup.step.setupLocations",
    descriptionKey: "setup.step.setupLocationsDesc",
    href: "/locations",
    icon: MapPin,
    estimatedMinutes: 3,
    defaultCompleted: false,
  },
  {
    id: "create-class-types",
    titleKey: "setup.step.createClassTypes",
    descriptionKey: "setup.step.createClassTypesDesc",
    href: "/class-types",
    icon: Tag,
    estimatedMinutes: 5,
    defaultCompleted: false,
  },
  {
    id: "build-schedule",
    titleKey: "setup.step.buildSchedule",
    descriptionKey: "setup.step.buildScheduleDesc",
    href: "/classes/create",
    icon: CalendarDays,
    estimatedMinutes: 10,
    defaultCompleted: false,
  },
  {
    id: "add-members",
    titleKey: "setup.step.addMembers",
    descriptionKey: "setup.step.addMembersDesc",
    href: "/members",
    icon: UserPlus,
    estimatedMinutes: 5,
    defaultCompleted: false,
  },
  {
    id: "setup-billing",
    titleKey: "setup.step.setupBilling",
    descriptionKey: "setup.step.setupBillingDesc",
    href: "/settings",
    icon: CreditCard,
    estimatedMinutes: 10,
    defaultCompleted: false,
  },
  {
    id: "configure-app",
    titleKey: "setup.step.configureApp",
    descriptionKey: "setup.step.configureAppDesc",
    href: "/settings/app-config",
    icon: Smartphone,
    estimatedMinutes: 5,
    defaultCompleted: false,
  },
  {
    id: "publish-wod",
    titleKey: "setup.step.publishWod",
    descriptionKey: "setup.step.publishWodDesc",
    href: "/wods/builder",
    icon: Dumbbell,
    estimatedMinutes: 5,
    defaultCompleted: false,
  },
];

function loadChecked(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function persistChecked(checked: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
}

export default function SetupPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = loadChecked();
    const merged: Record<string, boolean> = {};
    for (const item of checklistItems) {
      merged[item.id] = stored[item.id] ?? item.defaultCompleted;
    }
    setChecked(merged);
    setMounted(true);
  }, []);

  const toggleCheck = (id: string) => {
    const updated = { ...checked, [id]: !checked[id] };
    setChecked(updated);
    persistChecked(updated);
  };

  const completedCount = Object.values(checked).filter(Boolean).length;
  const totalCount = checklistItems.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (!mounted) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-vytal-border border-t-vytal-green" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumbs items={[{ label: t("setup.title") }]} />
          <p className="mt-1 text-sm text-vytal-muted">{t("setup.subtitle")}</p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 rounded-lg border border-vytal-border px-4 py-2 text-sm font-medium text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
        >
          <X className="h-4 w-4" />
          {t("setup.skip")}
        </button>
      </div>

      {/* Progress bar */}
      <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vytal-green/10">
              <Rocket className="h-5 w-5 text-vytal-green" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-vytal-text">{t("setup.progress")}</h2>
              <p className="text-sm text-vytal-muted">
                {completedCount}/{totalCount} {t("setup.stepsCompleted")}
              </p>
            </div>
          </div>
          <span className="text-2xl font-bold text-vytal-green">{progressPercent}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-vytal-bg3">
          <div
            className="h-full rounded-full bg-gradient-to-r from-vytal-green to-emerald-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {completedCount === totalCount && (
          <div className="mt-4 rounded-lg bg-vytal-green/10 p-3 text-center">
            <p className="text-sm font-semibold text-vytal-green">{t("setup.allComplete")}</p>
          </div>
        )}
      </div>

      {/* Checklist items */}
      <div className="space-y-3">
        {checklistItems.map((item, index) => {
          const isCompleted = checked[item.id] ?? false;
          const isExpanded = expandedId === item.id;
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className={cn(
                "rounded-xl border transition-all",
                isCompleted
                  ? "border-vytal-green/20 bg-vytal-green/[0.03]"
                  : "border-vytal-border bg-vytal-bg2"
              )}
            >
              <div
                className="flex items-center gap-4 p-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCheck(item.id);
                  }}
                  className="shrink-0"
                >
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6 text-vytal-green" />
                  ) : (
                    <Circle className="h-6 w-6 text-vytal-muted/40" />
                  )}
                </button>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-vytal-bg3">
                  <Icon className="h-4.5 w-4.5 text-vytal-muted" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-vytal-muted">
                      {index + 1}/{totalCount}
                    </span>
                    <h3
                      className={cn(
                        "text-sm font-semibold",
                        isCompleted ? "text-vytal-muted line-through" : "text-vytal-text"
                      )}
                    >
                      {t(item.titleKey)}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-vytal-muted">
                    <Clock className="h-3 w-3" />
                    ~{item.estimatedMinutes} min
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-vytal-muted" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-vytal-muted" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-vytal-border px-4 pb-4 pt-3">
                  <p className="text-sm text-vytal-muted mb-4">{t(item.descriptionKey)}</p>
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
                  >
                    {isCompleted ? t("setup.reviewStep") : t("setup.startStep")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
