"use client";

import { useState } from "react";
import {
  BarChart3,
  Users,
  DollarSign,
  CalendarDays,
  Download,
  ArrowRight,
  ArrowUpRight,
  Clock,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// Sparkline data for each card
const attendanceSparkline = [
  { v: 35 }, { v: 38 }, { v: 40 }, { v: 37 }, { v: 42 }, { v: 39 },
  { v: 44 }, { v: 41 }, { v: 43 }, { v: 40 }, { v: 45 }, { v: 41 },
];
const revenueSparkline = [
  { v: 14200 }, { v: 15100 }, { v: 15800 }, { v: 16500 },
  { v: 17200 }, { v: 17500 }, { v: 17800 }, { v: 18450 },
];
const memberSparkline = [
  { v: 3.8 }, { v: 3.7 }, { v: 3.5 }, { v: 3.4 },
  { v: 3.3 }, { v: 3.2 }, { v: 3.2 }, { v: 3.1 },
];
const classSparkline = [
  { v: 12.1 }, { v: 12.8 }, { v: 13.0 }, { v: 13.5 },
  { v: 13.7 }, { v: 14.0 }, { v: 14.1 }, { v: 14.2 },
];

type DateRange = "thisMonth" | "lastMonth" | "thisQuarter" | "thisYear";

interface ReportCardProps {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  highlight: string;
  highlightSub?: string;
  trendUp?: boolean;
  sparklineData: { v: number }[];
  sparklineColor: string;
  metrics: Array<{ label: string; value: string }>;
  href?: string;
  lastGenerated: string;
  downloadLabel: string;
  viewLabel: string;
  onClickNoHref?: () => void;
}

function ReportCard({
  title,
  icon,
  iconBg,
  highlight,
  highlightSub,
  trendUp,
  sparklineData,
  sparklineColor,
  metrics,
  href,
  lastGenerated,
  downloadLabel,
  viewLabel,
  onClickNoHref,
}: ReportCardProps) {
  return (
    <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 transition-all duration-200 hover:border-[rgba(61,255,110,0.22)] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-vytal-text">{title}</h3>
          <div className="flex items-center gap-1 text-[10px] text-vytal-muted">
            <Clock className="h-2.5 w-2.5" />
            {lastGenerated}
          </div>
        </div>
      </div>

      {/* Highlight + Sparkline */}
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-vytal-text">{highlight}</span>
            {trendUp !== undefined && (
              <span className={cn(
                "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                trendUp ? "bg-vytal-green/10 text-vytal-green" : "bg-vytal-red/10 text-vytal-red"
              )}>
                {trendUp ? <TrendingUp className="h-2.5 w-2.5" /> : <ArrowRight className="h-2.5 w-2.5" />}
                {highlightSub}
              </span>
            )}
          </div>
        </div>
        <div className="h-10 w-24 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={sparklineColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={sparklineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={sparklineColor}
                strokeWidth={1.5}
                fill={`url(#grad-${title})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-2.5">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-center justify-between">
            <span className="text-sm text-vytal-muted">{m.label}</span>
            <span className="font-mono text-sm font-semibold text-vytal-text">
              {m.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-2 border-t border-vytal-border pt-4">
        <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2 text-sm text-vytal-text transition-colors hover:bg-vytal-bg3">
          <Download className="h-4 w-4" />
          {downloadLabel}
        </button>
        {href ? (
          <Link
            href={href}
            className="flex items-center justify-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2 text-sm text-vytal-text transition-colors hover:bg-vytal-bg3"
          >
            <ArrowRight className="h-4 w-4" />
            {viewLabel}
          </Link>
        ) : (
          <button
            onClick={onClickNoHref}
            className="flex items-center justify-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2 text-sm text-vytal-text transition-colors hover:bg-vytal-bg3"
          >
            <ArrowRight className="h-4 w-4" />
            {viewLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange>("thisMonth");

  const dateRangeOptions: { value: DateRange; labelKey: string }[] = [
    { value: "thisMonth", labelKey: "reports.dateRange.thisMonth" },
    { value: "lastMonth", labelKey: "reports.dateRange.lastMonth" },
    { value: "thisQuarter", labelKey: "reports.dateRange.thisQuarter" },
    { value: "thisYear", labelKey: "reports.dateRange.thisYear" },
  ];

  function handleComingSoon() {
    toast(t("reports.comingSoon"), "info");
  }

  function handleExportAll() {
    toast(t("reports.comingSoon"), "info");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("reports.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("reports.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex rounded-lg border border-vytal-border">
            {dateRangeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDateRange(opt.value)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors first:rounded-l-lg last:rounded-r-lg",
                  dateRange === opt.value
                    ? "bg-vytal-green/10 text-vytal-green"
                    : "text-vytal-muted hover:text-vytal-text"
                )}
              >
                {t(opt.labelKey)}
              </button>
            ))}
          </div>
          {/* Export All */}
          <button
            onClick={handleExportAll}
            className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2 text-sm font-semibold text-vytal-bg transition-all hover:bg-vytal-green/90"
          >
            <Download className="h-4 w-4" />
            {t("reports.exportAll")}
          </button>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <ReportCard
          title={t("reports.attendanceReport")}
          icon={<BarChart3 className="h-5 w-5 text-vytal-green" />}
          iconBg="bg-vytal-green/10"
          href="/reports/attendance"
          highlight="1.240"
          highlightSub="+8,3%"
          trendUp={true}
          sparklineData={attendanceSparkline}
          sparklineColor="#22c55e"
          lastGenerated={t("reports.lastGenerated").replace("{days}", "2")}
          downloadLabel={t("reports.downloadPdf")}
          viewLabel={t("reports.view")}
          metrics={[
            { label: t("reports.avgPerDay"), value: "41" },
            { label: t("reports.peakDay"), value: t("reports.thursday") },
            { label: t("reports.peakTime"), value: "17:30 - 18:30" },
          ]}
        />

        <ReportCard
          title={t("reports.revenueReport")}
          icon={<DollarSign className="h-5 w-5 text-vytal-blue" />}
          iconBg="bg-vytal-blue/10"
          highlight="18.450 EUR"
          highlightSub="+5,2%"
          trendUp={true}
          sparklineData={revenueSparkline}
          sparklineColor="#00d4ff"
          lastGenerated={t("reports.lastGenerated").replace("{days}", "1")}
          downloadLabel={t("reports.downloadPdf")}
          viewLabel={t("reports.view")}
          onClickNoHref={handleComingSoon}
          metrics={[
            { label: t("reports.vsLastMonth"), value: "+5,2%" },
            { label: t("reports.activeSubscriptions"), value: "367" },
            { label: t("reports.avgRevenuePerMember"), value: "50,27 EUR" },
          ]}
        />

        <ReportCard
          title={t("reports.memberReport")}
          icon={<Users className="h-5 w-5 text-vytal-purple" />}
          iconBg="bg-vytal-purple/10"
          highlight="14"
          highlightSub="3,2% churn"
          trendUp={false}
          sparklineData={memberSparkline}
          sparklineColor="#c084fc"
          lastGenerated={t("reports.lastGenerated").replace("{days}", "3")}
          downloadLabel={t("reports.downloadPdf")}
          viewLabel={t("reports.view")}
          onClickNoHref={handleComingSoon}
          metrics={[
            { label: t("reports.churnRate"), value: "3,2%" },
            { label: t("reports.atRiskMembers"), value: "12" },
            { label: t("reports.retentionRate"), value: "96,8%" },
          ]}
        />

        <ReportCard
          title={t("reports.classReport")}
          icon={<CalendarDays className="h-5 w-5 text-vytal-amber" />}
          iconBg="bg-vytal-amber/10"
          highlight="180"
          highlightSub="14,2 avg"
          trendUp={true}
          sparklineData={classSparkline}
          sparklineColor="#ffb300"
          lastGenerated={t("reports.lastGenerated").replace("{days}", "2")}
          downloadLabel={t("reports.downloadPdf")}
          viewLabel={t("reports.view")}
          onClickNoHref={handleComingSoon}
          metrics={[
            { label: t("reports.avgAttendance"), value: "14,2" },
            { label: t("reports.mostPopular"), value: "WOD" },
            { label: t("reports.leastPopular"), value: "Mobility" },
          ]}
        />
      </div>
    </div>
  );
}
