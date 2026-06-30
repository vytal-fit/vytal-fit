"use client";

import { useState } from "react";
import { useOrgFormat } from "@/lib/org-format";
import { trpc } from "@/lib/trpc";
import { rowsToCoaches } from "@/lib/reference-mappers";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import {
  DollarSign,
  CalendarDays,
  TrendingUp,
  Users,
  Download,
  CheckCircle,
  Clock,
} from "lucide-react";

interface PayrollEntry {
  coachId: string;
  coachName: string;
  role: "head_coach" | "coach" | "assistant";
  classesThisMonth: number;
  ratePerClass: number;
  totalEarned: number;
  status: "paid" | "pending";
}

const rateByRole: Record<string, number> = {
  head_coach: 35,
  coach: 30,
  assistant: 25,
};

const classesPerCoachByMonth: Record<string, Record<string, number>> = {
  "2026-06": { "coach-1": 28, "coach-2": 26, "coach-3": 24, "coach-4": 18 },
  "2026-05": { "coach-1": 30, "coach-2": 24, "coach-3": 22, "coach-4": 20 },
  "2026-04": { "coach-1": 26, "coach-2": 28, "coach-3": 20, "coach-4": 16 },
  "2026-03": { "coach-1": 24, "coach-2": 22, "coach-3": 26, "coach-4": 18 },
  "2026-02": { "coach-1": 20, "coach-2": 24, "coach-3": 18, "coach-4": 14 },
  "2026-01": { "coach-1": 22, "coach-2": 20, "coach-3": 24, "coach-4": 16 },
};

const months = [
  { value: "2026-06", label: "June 2026" },
  { value: "2026-05", label: "May 2026" },
  { value: "2026-04", label: "April 2026" },
  { value: "2026-03", label: "March 2026" },
  { value: "2026-02", label: "February 2026" },
  { value: "2026-01", label: "January 2026" },
];

export default function StaffPayrollPage() {
  const { money: formatCurrency } = useOrgFormat();
  const { t } = useI18n();
  const { toast } = useToast();
  // ── tRPC: coach roster (payroll figures themselves are still mock data) ──
  const coachesQuery = trpc.coaches.list.useQuery();
  const coaches = rowsToCoaches(coachesQuery.data ?? []);

  const [selectedMonth, setSelectedMonth] = useState("2026-06");
  const [paidCoaches, setPaidCoaches] = useState<Set<string>>(new Set());

  const monthClasses = classesPerCoachByMonth[selectedMonth] ?? {};

  const payrollData: PayrollEntry[] = coaches.map((coach) => {
    const classes = monthClasses[coach.id] ?? 0;
    const rate = rateByRole[coach.role] ?? 25;
    return {
      coachId: coach.id,
      coachName: coach.name,
      role: coach.role,
      classesThisMonth: classes,
      ratePerClass: rate,
      totalEarned: classes * rate,
      status: paidCoaches.has(`${selectedMonth}-${coach.id}`) ? "paid" : "pending",
    };
  });

  const totalPayroll = payrollData.reduce((s, e) => s + e.totalEarned, 0);
  const totalClasses = payrollData.reduce((s, e) => s + e.classesThisMonth, 0);
  const avgPerClass = totalClasses > 0 ? totalPayroll / totalClasses : 0;
  const activeCoaches = payrollData.filter((e) => e.classesThisMonth > 0).length;

  function handleMarkPaid(coachId: string, coachName: string) {
    const key = `${selectedMonth}-${coachId}`;
    setPaidCoaches((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
    const isPaid = paidCoaches.has(key);
    toast(
      isPaid
        ? t("payroll.markedPending").replace("{name}", coachName)
        : t("payroll.markedPaid").replace("{name}", coachName),
      "success"
    );
  }

  const roleLabelMap: Record<string, string> = {
    head_coach: t("staff.headCoach"),
    coach: t("staff.coach"),
    assistant: t("staff.assistant"),
  };

  const inputClass =
    "rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20";

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t("nav.staff"), href: "/staff" },
          { label: t("payroll.title") },
        ]}
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("payroll.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">{t("payroll.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className={inputClass}
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => toast(t("payroll.exportStarted"), "info")}
            className="flex items-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
          >
            <Download className="h-4 w-4" />
            {t("payroll.export")}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("payroll.totalPayroll")}
              </span>
              <p className="mt-1 text-2xl font-bold text-vytal-text">
                {formatCurrency(totalPayroll)}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-green/10">
              <DollarSign className="h-5 w-5 text-vytal-green" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("payroll.classesTaught")}
              </span>
              <p className="mt-1 text-2xl font-bold text-vytal-text">{totalClasses}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-blue/10">
              <CalendarDays className="h-5 w-5 text-vytal-blue" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("payroll.avgPerClass")}
              </span>
              <p className="mt-1 text-2xl font-bold text-vytal-text">
                {formatCurrency(avgPerClass)}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-amber/10">
              <TrendingUp className="h-5 w-5 text-vytal-amber" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("payroll.coachesActive")}
              </span>
              <p className="mt-1 text-2xl font-bold text-vytal-text">{activeCoaches}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-purple/10">
              <Users className="h-5 w-5 text-vytal-purple" />
            </div>
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="overflow-x-auto rounded-xl border border-vytal-border">
        <table className="zebra-table sticky-thead w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-vytal-border bg-vytal-bg2">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("payroll.coachName")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("staff.role")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("payroll.classesCol")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("payroll.ratePerClass")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("payroll.totalEarned")}
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("financials.status")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("table.action")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vytal-border">
            {payrollData.map((entry) => (
              <tr
                key={entry.coachId}
                className="bg-vytal-card transition-colors hover:bg-vytal-bg3"
              >
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-vytal-text">
                    {entry.coachName}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      entry.role === "head_coach"
                        ? "bg-vytal-green/10 text-vytal-green"
                        : entry.role === "coach"
                          ? "bg-vytal-blue/10 text-vytal-blue"
                          : "bg-vytal-amber/10 text-vytal-amber"
                    }`}
                  >
                    {roleLabelMap[entry.role]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-sm text-vytal-text">
                  {entry.classesThisMonth}
                </td>
                <td className="px-4 py-3 text-right font-mono text-sm text-vytal-muted">
                  {formatCurrency(entry.ratePerClass)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-vytal-text">
                  {formatCurrency(entry.totalEarned)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      entry.status === "paid"
                        ? "bg-vytal-green/10 text-vytal-green"
                        : "bg-vytal-amber/10 text-vytal-amber"
                    }`}
                  >
                    {entry.status === "paid" ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {entry.status === "paid"
                      ? t("payroll.statusPaid")
                      : t("payroll.statusPending")}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleMarkPaid(entry.coachId, entry.coachName)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      entry.status === "paid"
                        ? "border border-vytal-border bg-vytal-bg2 text-vytal-muted hover:bg-vytal-bg3"
                        : "bg-vytal-green px-3 py-1.5 text-vytal-bg hover:bg-vytal-green/90"
                    }`}
                  >
                    {entry.status === "paid"
                      ? t("payroll.markPending")
                      : t("payroll.markPaid")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-vytal-border bg-vytal-bg2">
              <td className="px-4 py-3 text-sm font-bold text-vytal-text" colSpan={2}>
                {t("payroll.totalRow")}
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm font-bold text-vytal-text">
                {totalClasses}
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm text-vytal-muted">
                {t("payroll.avgLabel")}
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm font-bold text-vytal-green">
                {formatCurrency(totalPayroll)}
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
