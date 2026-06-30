"use client";

import { useState, useMemo } from "react";
import { Save, Wallet } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useOrgFormat } from "@/lib/org-format";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/components/toast";

type BudgetCategory = "Fixed" | "Variable" | "Tax";

interface BudgetLine {
  id: number;
  category: BudgetCategory;
  subcategory: string;
  lastMonthLimit: number;
  lastMonthActual: number;
  thisMonthLimit: number;
}

const categoryOrder: BudgetCategory[] = ["Fixed", "Variable", "Tax"];

const lineKey = (c: BudgetCategory, s: string) => `${c}|${s}`;

const categoryColors: Record<BudgetCategory, string> = {
  Fixed: "text-vytal-blue",
  Variable: "text-vytal-amber",
  Tax: "text-vytal-red",
};

const categoryBg: Record<BudgetCategory, string> = {
  Fixed: "bg-vytal-blue/10",
  Variable: "bg-vytal-amber/10",
  Tax: "bg-vytal-red/10",
};

export default function MonthlyBudgetPage() {
  const { t } = useI18n();
  const { money: formatCurrency } = useOrgFormat();
  const formatEur = formatCurrency;
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const settingsQuery = trpc.orgSettings.get.useQuery();
  const expensesQuery = trpc.expenses.list.useQuery({});
  const updateSettings = trpc.orgSettings.update.useMutation({
    onSuccess: () => {
      void utils.orgSettings.get.invalidate();
      toast(t("budget.setBudget"), "success");
    },
    onError: () => toast(t("ui.error"), "error"),
  });

  // Local edits to this-month limits, keyed by category|subcategory.
  const [limitOverrides, setLimitOverrides] = useState<Record<string, number>>({});

  // Real spend for the previous calendar month, grouped by category|subcategory.
  const actualByKey = useMemo(() => {
    const now = new Date();
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const map: Record<string, number> = {};
    for (const e of expensesQuery.data ?? []) {
      const d = new Date(e.date);
      if (d >= from && d < to) {
        const k = lineKey(e.category, e.subcategory);
        map[k] = (map[k] ?? 0) + Number(e.amount);
      }
    }
    return map;
  }, [expensesQuery.data]);

  const lines: BudgetLine[] = (settingsQuery.data?.budget.lines ?? []).map((l, i) => {
    const k = lineKey(l.category, l.subcategory);
    return {
      id: i,
      category: l.category,
      subcategory: l.subcategory,
      lastMonthLimit: l.limit,
      lastMonthActual: actualByKey[k] ?? 0,
      thisMonthLimit: limitOverrides[k] ?? l.limit,
    };
  });

  function updateLimit(id: number, value: string) {
    const line = lines[id];
    if (!line) return;
    setLimitOverrides((prev) => ({
      ...prev,
      [lineKey(line.category, line.subcategory)]: Number(value) || 0,
    }));
  }

  function handleSave() {
    updateSettings.mutate({
      budget: {
        lines: lines.map((l) => ({
          category: l.category,
          subcategory: l.subcategory,
          limit: l.thisMonthLimit,
        })),
      },
    });
  }

  const totalLastLimit = lines.reduce((s, l) => s + l.lastMonthLimit, 0);
  const totalLastActual = lines.reduce((s, l) => s + l.lastMonthActual, 0);
  const totalThisLimit = lines.reduce((s, l) => s + l.thisMonthLimit, 0);

  // Category subtotals
  const categoryTotals = categoryOrder.map((cat) => {
    const catLines = lines.filter((l) => l.category === cat);
    return {
      category: cat,
      limit: catLines.reduce((s, l) => s + l.thisMonthLimit, 0),
      actual: catLines.reduce((s, l) => s + l.lastMonthActual, 0),
    };
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: t("nav.financials"), href: "/financials" },
          { label: t("budget.title") },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("budget.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("budget.subtitle")}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90 disabled:opacity-40"
        >
          <Save className="h-4 w-4" />
          {t("budget.setBudget")}
        </button>
      </div>

      {/* Category Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {categoryTotals.map((ct) => (
          <div
            key={ct.category}
            className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-all duration-200 hover:border-[rgba(61,255,110,0.22)]"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${categoryBg[ct.category]}`}>
                <Wallet className={`h-5 w-5 ${categoryColors[ct.category]}`} />
              </div>
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t(`budget.${ct.category.toLowerCase()}`)}
                </span>
                <p className="font-mono text-lg font-bold text-vytal-text">
                  {formatEur(ct.limit)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Budget Table */}
      <div className="overflow-hidden rounded-xl border border-vytal-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-vytal-border bg-vytal-bg2">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("budget.category")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("budget.subcategory")}</th>
              <th className="hidden px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted sm:table-cell">{t("budget.lastMonthLimit")}</th>
              <th className="hidden px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted sm:table-cell">{t("budget.lastMonthActual")}</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("budget.thisMonthLimit")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vytal-border">
            {categoryOrder.map((cat) => {
              const catLines = lines.filter((l) => l.category === cat);
              return catLines.map((line, idx) => {
                const overBudget = line.lastMonthActual > line.lastMonthLimit;
                return (
                  <tr key={line.id} className="bg-vytal-card transition-colors hover:bg-vytal-bg3">
                    <td className="px-4 py-3">
                      {idx === 0 && (
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryBg[cat]} ${categoryColors[cat]}`}>
                          {t(`budget.${cat.toLowerCase()}`)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-vytal-text">{line.subcategory}</td>
                    <td className="hidden px-4 py-3 text-right font-mono text-sm text-vytal-muted sm:table-cell">
                      {formatEur(line.lastMonthLimit)}
                    </td>
                    <td className="hidden px-4 py-3 text-right sm:table-cell">
                      <span className={`font-mono text-sm ${overBudget ? "font-semibold text-vytal-red" : "text-vytal-text"}`}>
                        {formatEur(line.lastMonthActual)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number"
                        value={line.thisMonthLimit}
                        onChange={(e) => updateLimit(line.id, e.target.value)}
                        className="w-28 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-right font-mono text-sm text-vytal-text transition-colors focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                      />
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-vytal-green/30 bg-vytal-bg2">
              <td className="px-4 py-3 text-sm font-bold text-vytal-green" colSpan={2}>{t("expenses.total")}</td>
              <td className="hidden px-4 py-3 text-right font-mono text-sm font-bold text-vytal-muted sm:table-cell">{formatEur(totalLastLimit)}</td>
              <td className="hidden px-4 py-3 text-right font-mono text-sm font-bold text-vytal-text sm:table-cell">{formatEur(totalLastActual)}</td>
              <td className="px-4 py-3 text-right font-mono text-sm font-bold text-vytal-green">{formatEur(totalThisLimit)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
