"use client";

import Link from "next/link";
import {
  CalendarDays,
  Users,
  CreditCard,
  UserPlus,
  Cake,
  MessageCircle,
  CheckSquare,
  DollarSign,
  TrendingUp,
  Trophy,
  UserCheck,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatCurrency } from "@/stores/data-store";

function formatDateLocale(lang: string): string {
  const now = new Date();
  const locale = lang === "pt" ? "pt-PT" : lang === "es" ? "es-ES" : "en-US";
  return now.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function DailyBriefing() {
  const { t, language } = useI18n();

  const dateLabel = formatDateLocale(language);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Section 1: Today */}
      <div className="border-b border-vytal-border px-4 py-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-vytal-muted mb-1">
          {t("briefing.today")}
        </h3>
        <p className="text-sm font-semibold text-vytal-text capitalize mb-3">
          {dateLabel}
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <CalendarDays className="h-3.5 w-3.5 text-vytal-blue" />
            <span className="text-xs text-vytal-text">
              8 {t("briefing.classesToday")}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Users className="h-3.5 w-3.5 text-vytal-green" />
            <span className="text-xs text-vytal-text">
              106/137 {t("briefing.enrolled")} (77%)
            </span>
            <div className="ml-auto h-1.5 w-16 rounded-full bg-vytal-bg3 overflow-hidden">
              <div
                className="h-full rounded-full bg-vytal-green"
                style={{ width: "77%" }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <CreditCard className="h-3.5 w-3.5 text-vytal-amber" />
            <span className="text-xs text-vytal-amber font-medium">
              3 {t("briefing.pendingPayments")}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <UserPlus className="h-3.5 w-3.5 text-vytal-green" />
            <span className="text-xs text-vytal-green font-medium">
              2 {t("briefing.newLeads")}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Cake className="h-3.5 w-3.5 text-vytal-purple" />
            <span className="text-xs text-vytal-text">
              1 {t("briefing.birthday")}: Ana Silva
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: Next Class */}
      <div className="border-b border-vytal-border px-4 py-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-vytal-muted mb-3">
          {t("briefing.nextClass")}
        </h3>
        <div className="rounded-lg border border-vytal-border bg-vytal-bg3/50 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-vytal-text">
              WOD 17:30
            </span>
            <span className="text-[10px] text-vytal-muted">Main Box</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-3 w-3 text-vytal-muted" />
            <span className="text-xs text-vytal-text">
              18/20 {t("briefing.enrolledCount")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="h-3 w-3 text-vytal-muted" />
            <span className="text-xs text-vytal-text">
              {t("briefing.coach")}: Andre Loureiro
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-vytal-green/10 px-2 py-0.5 text-[10px] font-semibold text-vytal-green">
              {t("briefing.in")} 2h 30m
            </span>
            <Link
              href="/classes"
              className="text-[11px] font-medium text-vytal-green hover:text-vytal-green/80 transition-colors"
            >
              {t("briefing.viewDetails")}
            </Link>
          </div>
        </div>
      </div>

      {/* Section 3: Quick Actions */}
      <div className="border-b border-vytal-border px-4 py-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-vytal-muted mb-3">
          {t("briefing.quickActions")}
        </h3>
        <div className="space-y-1.5">
          <Link
            href="/messages"
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-vytal-bg3"
          >
            <div className="relative">
              <MessageCircle className="h-4 w-4 text-vytal-blue" />
              <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-vytal-red text-[8px] font-bold text-white">
                3
              </span>
            </div>
            <span className="text-xs text-vytal-text">
              3 {t("briefing.messages")}
            </span>
          </Link>
          <Link
            href="/tasks"
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-vytal-bg3"
          >
            <CheckSquare className="h-4 w-4 text-vytal-amber" />
            <span className="text-xs text-vytal-amber font-medium">
              2 {t("briefing.overdueTasks")}
            </span>
          </Link>
          <Link
            href="/financials"
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-vytal-bg3"
          >
            <DollarSign className="h-4 w-4 text-vytal-red" />
            <span className="text-xs text-vytal-red font-medium">
              {formatCurrency(375)} {t("briefing.overduePayments")}
            </span>
          </Link>
        </div>
      </div>

      {/* Section 4: KPIs do Dia */}
      <div className="px-4 py-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-vytal-muted mb-3">
          {t("briefing.dailyKpis")}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              label: t("briefing.checkIns"),
              value: "86",
              icon: Users,
              color: "text-vytal-green",
            },
            {
              label: t("briefing.revenue"),
              value: formatCurrency(450),
              icon: TrendingUp,
              color: "text-vytal-blue",
            },
            {
              label: t("briefing.prs"),
              value: "3",
              icon: Trophy,
              color: "text-vytal-amber",
            },
            {
              label: t("briefing.newMembers"),
              value: "1",
              icon: UserPlus,
              color: "text-vytal-purple",
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-lg border border-vytal-border bg-vytal-bg3/50 p-2.5"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <kpi.icon className={`h-3 w-3 ${kpi.color}`} />
                <span className="text-[10px] text-vytal-muted">
                  {kpi.label}
                </span>
              </div>
              <p className="text-lg font-bold text-vytal-text">{kpi.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
