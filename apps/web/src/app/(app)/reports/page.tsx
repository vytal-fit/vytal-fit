"use client";

import {
  BarChart3,
  Users,
  DollarSign,
  CalendarDays,
  Download,
  ArrowRight,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";

interface ReportCardProps {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  metrics: Array<{ label: string; value: string }>;
  href?: string;
  lastGenerated: string;
  downloadLabel: string;
  viewLabel: string;
  onClickNoHref?: () => void;
}

function ReportCard({ title, icon, iconBg, metrics, href, lastGenerated, downloadLabel, viewLabel, onClickNoHref }: ReportCardProps) {
  const Wrapper = href ? Link : "div";
  const wrapperProps = href ? { href } : { onClick: onClickNoHref, className: "cursor-pointer" };

  return (
    <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 transition-colors hover:border-[rgba(61,255,110,0.22)]">
      <div className="mb-5 flex items-center gap-3">
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

      <div className="space-y-3">
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

  function handleComingSoon() {
    toast(t("reports.comingSoon"), "info");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-vytal-text">{t("reports.title")}</h1>
        <p className="mt-1 text-sm text-vytal-muted">
          {t("reports.subtitle")}
        </p>
      </div>

      {/* Report Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <ReportCard
          title={t("reports.attendanceReport")}
          icon={<BarChart3 className="h-5 w-5 text-vytal-green" />}
          iconBg="bg-vytal-green/10"
          href="/reports/attendance"
          lastGenerated={t("reports.lastGenerated").replace("{days}", "2")}
          downloadLabel={t("reports.downloadPdf")}
          viewLabel={t("reports.view")}
          metrics={[
            { label: t("reports.totalCheckInsMonth"), value: "1.240" },
            { label: t("reports.avgPerDay"), value: "41" },
            { label: t("reports.peakDay"), value: t("reports.thursday") },
            { label: t("reports.peakTime"), value: "17:30 - 18:30" },
          ]}
        />

        <ReportCard
          title={t("reports.revenueReport")}
          icon={<DollarSign className="h-5 w-5 text-vytal-blue" />}
          iconBg="bg-vytal-blue/10"
          lastGenerated={t("reports.lastGenerated").replace("{days}", "1")}
          downloadLabel={t("reports.downloadPdf")}
          viewLabel={t("reports.view")}
          onClickNoHref={handleComingSoon}
          metrics={[
            { label: t("reports.monthlyRevenueLabel"), value: "18.450 EUR" },
            { label: t("reports.vsLastMonth"), value: "+5,2%" },
            { label: t("reports.activeSubscriptions"), value: "367" },
            { label: t("reports.avgRevenuePerMember"), value: "50,27 EUR" },
          ]}
        />

        <ReportCard
          title={t("reports.memberReport")}
          icon={<Users className="h-5 w-5 text-vytal-purple" />}
          iconBg="bg-vytal-purple/10"
          lastGenerated={t("reports.lastGenerated").replace("{days}", "3")}
          downloadLabel={t("reports.downloadPdf")}
          viewLabel={t("reports.view")}
          onClickNoHref={handleComingSoon}
          metrics={[
            { label: t("reports.newMembersMonth"), value: "14" },
            { label: t("reports.churnRate"), value: "3,2%" },
            { label: t("reports.atRiskMembers"), value: "12" },
            { label: t("reports.retentionRate"), value: "96,8%" },
          ]}
        />

        <ReportCard
          title={t("reports.classReport")}
          icon={<CalendarDays className="h-5 w-5 text-vytal-amber" />}
          iconBg="bg-vytal-amber/10"
          lastGenerated={t("reports.lastGenerated").replace("{days}", "2")}
          downloadLabel={t("reports.downloadPdf")}
          viewLabel={t("reports.view")}
          onClickNoHref={handleComingSoon}
          metrics={[
            { label: t("reports.totalClassesMonth"), value: "180" },
            { label: t("reports.avgAttendance"), value: "14,2" },
            { label: t("reports.mostPopular"), value: "WOD" },
            { label: t("reports.leastPopular"), value: "Mobility" },
          ]}
        />
      </div>
    </div>
  );
}
