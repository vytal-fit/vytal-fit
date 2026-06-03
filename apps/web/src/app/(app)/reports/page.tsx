"use client";

import {
  BarChart3,
  Users,
  DollarSign,
  CalendarDays,
  Download,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

interface ReportCardProps {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  metrics: Array<{ label: string; value: string }>;
  href?: string;
}

function ReportCard({ title, icon, iconBg, metrics, href }: ReportCardProps) {
  return (
    <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 transition-colors hover:border-[rgba(61,255,110,0.22)]">
      <div className="mb-5 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}
        >
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-vytal-text">{title}</h3>
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
          Download PDF
        </button>
        {href && (
          <Link
            href={href}
            className="flex items-center justify-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2 text-sm text-vytal-text transition-colors hover:bg-vytal-bg3"
          >
            <ArrowRight className="h-4 w-4" />
            View
          </Link>
        )}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { t } = useI18n();
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
          title="Attendance Report"
          icon={<BarChart3 className="h-5 w-5 text-vytal-green" />}
          iconBg="bg-vytal-green/10"
          href="/reports/attendance"
          metrics={[
            { label: "Total check-ins this month", value: "1,240" },
            { label: "Average per day", value: "41" },
            { label: "Peak day", value: "Thursday" },
            { label: "Peak time", value: "17:30 - 18:30" },
          ]}
        />

        <ReportCard
          title="Revenue Report"
          icon={<DollarSign className="h-5 w-5 text-vytal-blue" />}
          iconBg="bg-vytal-blue/10"
          metrics={[
            { label: "Monthly revenue", value: "18,450 EUR" },
            { label: "vs Last month", value: "+5.2%" },
            { label: "Active subscriptions", value: "367" },
            { label: "Avg revenue per member", value: "50.27 EUR" },
          ]}
        />

        <ReportCard
          title="Member Report"
          icon={<Users className="h-5 w-5 text-vytal-purple" />}
          iconBg="bg-vytal-purple/10"
          metrics={[
            { label: "New members this month", value: "14" },
            { label: "Churn rate", value: "3.2%" },
            { label: "At-risk members", value: "12" },
            { label: "Retention rate", value: "96.8%" },
          ]}
        />

        <ReportCard
          title="Class Report"
          icon={<CalendarDays className="h-5 w-5 text-vytal-amber" />}
          iconBg="bg-vytal-amber/10"
          metrics={[
            { label: "Total classes this month", value: "180" },
            { label: "Average attendance", value: "14.2" },
            { label: "Most popular", value: "WOD" },
            { label: "Least popular", value: "Mobility" },
          ]}
        />
      </div>
    </div>
  );
}
