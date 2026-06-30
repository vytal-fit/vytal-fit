"use client";

import { useState, useMemo } from "react";
import {
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useOrgFormat } from "@/lib/org-format";
import { trpc } from "@/lib/trpc";
import { rowsToCoaches } from "@/lib/reference-mappers";
import { Breadcrumbs } from "@/components/breadcrumbs";

interface CoachRevenue {
  coachId: string;
  coachName: string;
  classesTaught: number;
  avgAttendance: number;
  totalRevenue: number;
  revenuePerClass: number;
}

const AVG_PLAN_PRICE = 41.40;

const monthlyData: Record<string, Record<string, { classes: number; avgAttendance: number }>> = {
  "Jan": { "coach-1": { classes: 22, avgAttendance: 14 }, "coach-2": { classes: 20, avgAttendance: 12 }, "coach-3": { classes: 24, avgAttendance: 10 }, "coach-4": { classes: 16, avgAttendance: 8 } },
  "Feb": { "coach-1": { classes: 20, avgAttendance: 15 }, "coach-2": { classes: 24, avgAttendance: 13 }, "coach-3": { classes: 18, avgAttendance: 11 }, "coach-4": { classes: 14, avgAttendance: 9 } },
  "Mar": { "coach-1": { classes: 24, avgAttendance: 16 }, "coach-2": { classes: 22, avgAttendance: 14 }, "coach-3": { classes: 26, avgAttendance: 12 }, "coach-4": { classes: 18, avgAttendance: 10 } },
  "Apr": { "coach-1": { classes: 26, avgAttendance: 15 }, "coach-2": { classes: 28, avgAttendance: 13 }, "coach-3": { classes: 20, avgAttendance: 11 }, "coach-4": { classes: 16, avgAttendance: 9 } },
  "May": { "coach-1": { classes: 30, avgAttendance: 16 }, "coach-2": { classes: 24, avgAttendance: 14 }, "coach-3": { classes: 22, avgAttendance: 12 }, "coach-4": { classes: 20, avgAttendance: 10 } },
  "Jun": { "coach-1": { classes: 28, avgAttendance: 17 }, "coach-2": { classes: 26, avgAttendance: 15 }, "coach-3": { classes: 24, avgAttendance: 13 }, "coach-4": { classes: 18, avgAttendance: 11 } },
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

export default function CoachRevenuePage() {
  const { money: formatCurrency } = useOrgFormat();
  const { t } = useI18n();
  // ── tRPC: coach roster (revenue figures themselves are still mock data) ──
  const coachesQuery = trpc.coaches.list.useQuery();
  const coaches = useMemo(
    () => rowsToCoaches(coachesQuery.data ?? []),
    [coachesQuery.data],
  );
  const [selectedMonth, setSelectedMonth] = useState("Jun");

  const revenueData: CoachRevenue[] = useMemo(() => {
    const monthData = monthlyData[selectedMonth] ?? {};
    return coaches.map((coach) => {
      const data = monthData[coach.id] ?? { classes: 0, avgAttendance: 0 };
      const totalRevenue = data.classes * data.avgAttendance * (AVG_PLAN_PRICE / 20); // per-session value
      return {
        coachId: coach.id,
        coachName: coach.name,
        classesTaught: data.classes,
        avgAttendance: data.avgAttendance,
        totalRevenue: Math.round(totalRevenue),
        revenuePerClass: data.classes > 0 ? Math.round(totalRevenue / data.classes) : 0,
      };
    });
  }, [coaches, selectedMonth]);

  const topPerformer = revenueData.reduce((best, curr) =>
    curr.totalRevenue > best.totalRevenue ? curr : best,
    revenueData[0]
  );

  const maxRevenue = Math.max(...revenueData.map((r) => r.totalRevenue));

  // Monthly trend data
  const trendData = useMemo(() => {
    return months.map((month) => {
      const data = monthlyData[month] ?? {};
      const coachRevenues: Record<string, number> = {};
      coaches.forEach((coach) => {
        const d = data[coach.id] ?? { classes: 0, avgAttendance: 0 };
        coachRevenues[coach.id] = Math.round(d.classes * d.avgAttendance * (AVG_PLAN_PRICE / 20));
      });
      return { month, ...coachRevenues };
    });
  }, [coaches]);

  const coachColors = ["bg-vytal-green", "bg-vytal-blue", "bg-vytal-amber", "bg-vytal-red"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumbs
            items={[
              { label: t("nav.staff"), href: "/staff" },
              { label: t("coachRevenue.title") },
            ]}
          />
          <p className="mt-1 text-sm text-vytal-muted">{t("coachRevenue.subtitle")}</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-vytal-bg3 p-1">
          {months.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                selectedMonth === m
                  ? "bg-vytal-bg text-vytal-text shadow-sm"
                  : "text-vytal-muted hover:text-vytal-text"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Top performer */}
      {topPerformer && (
        <div className="rounded-xl border border-vytal-green/20 bg-vytal-green/[0.03] p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-vytal-green/10">
              <Award className="h-6 w-6 text-vytal-green" />
            </div>
            <div>
              <p className="text-xs text-vytal-muted">{t("coachRevenue.topPerformer")}</p>
              <h3 className="text-lg font-bold text-vytal-text">{topPerformer.coachName}</h3>
              <p className="text-sm text-vytal-muted">
                {formatCurrency(topPerformer.totalRevenue)} {t("coachRevenue.thisMonth")} &middot; {topPerformer.classesTaught} {t("coachRevenue.classes")} &middot; {topPerformer.avgAttendance} {t("coachRevenue.avgAtt")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Revenue comparison bar chart */}
      <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-6">
        <h3 className="text-base font-bold text-vytal-text mb-4">{t("coachRevenue.comparison")}</h3>
        <div className="space-y-3">
          {revenueData.map((coach, idx) => (
            <div key={coach.coachId} className="flex items-center gap-4">
              <span className="w-32 text-sm font-medium text-vytal-text truncate">{coach.coachName}</span>
              <div className="flex-1 h-8 rounded-lg bg-vytal-bg3 overflow-hidden">
                <div
                  className={cn("h-full rounded-lg transition-all flex items-center justify-end pr-3", coachColors[idx % coachColors.length])}
                  style={{ width: maxRevenue > 0 ? `${(coach.totalRevenue / maxRevenue) * 100}%` : "0%" }}
                >
                  <span className="text-xs font-bold text-vytal-bg">{formatCurrency(coach.totalRevenue)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue table */}
      <div className="rounded-xl border border-vytal-border bg-vytal-bg2 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-vytal-border bg-vytal-bg3/50 text-left">
                <th className="px-5 py-3 font-semibold text-vytal-muted">{t("coachRevenue.coach")}</th>
                <th className="px-5 py-3 font-semibold text-vytal-muted text-right">{t("coachRevenue.classesTaught")}</th>
                <th className="px-5 py-3 font-semibold text-vytal-muted text-right">{t("coachRevenue.avgAttendance")}</th>
                <th className="px-5 py-3 font-semibold text-vytal-muted text-right">{t("coachRevenue.totalRevenue")}</th>
                <th className="px-5 py-3 font-semibold text-vytal-muted text-right">{t("coachRevenue.revenuePerClass")}</th>
              </tr>
            </thead>
            <tbody>
              {revenueData.map((coach) => (
                <tr key={coach.coachId} className="border-b border-vytal-border last:border-b-0 hover:bg-vytal-bg3/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-vytal-text">{coach.coachName}</td>
                  <td className="px-5 py-3 text-right text-vytal-text">{coach.classesTaught}</td>
                  <td className="px-5 py-3 text-right text-vytal-text">{coach.avgAttendance}</td>
                  <td className="px-5 py-3 text-right font-semibold text-vytal-green">{formatCurrency(coach.totalRevenue)}</td>
                  <td className="px-5 py-3 text-right text-vytal-muted">{formatCurrency(coach.revenuePerClass)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trend chart (simplified bar groups) */}
      <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-6">
        <h3 className="text-base font-bold text-vytal-text mb-4">{t("coachRevenue.trend")}</h3>
        <div className="flex items-end gap-3 h-48">
          {trendData.map((entry) => {
            return (
              <div key={entry.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex items-end gap-0.5 h-40 w-full">
                  {coaches.map((coach, idx) => {
                    const val = (entry as unknown as Record<string, number>)[coach.id] ?? 0;
                    const maxAll = 1000;
                    const height = Math.max((val / maxAll) * 100, 2);
                    return (
                      <div
                        key={coach.id}
                        className={cn("flex-1 rounded-t transition-all", coachColors[idx % coachColors.length])}
                        style={{ height: `${height}%` }}
                        title={`${coach.name}: ${formatCurrency(val)}`}
                      />
                    );
                  })}
                </div>
                <span className="text-[10px] text-vytal-muted">{entry.month}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4">
          {coaches.map((coach, idx) => (
            <div key={coach.id} className="flex items-center gap-1.5">
              <div className={cn("h-3 w-3 rounded-sm", coachColors[idx % coachColors.length])} />
              <span className="text-xs text-vytal-muted">{coach.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
