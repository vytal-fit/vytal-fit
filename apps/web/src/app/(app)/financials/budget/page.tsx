"use client";

import { useState } from "react";
import { Save, Wallet } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";

type BudgetCategory = "Fixed" | "Variable" | "Tax";

interface BudgetLine {
  id: number;
  category: BudgetCategory;
  subcategory: string;
  lastMonthLimit: number;
  lastMonthActual: number;
  thisMonthLimit: number;
}

const initialBudgetLines: BudgetLine[] = [
  { id: 1, category: "Fixed", subcategory: "Rent", lastMonthLimit: 2500, lastMonthActual: 2500, thisMonthLimit: 2500 },
  { id: 2, category: "Fixed", subcategory: "Insurance", lastMonthLimit: 200, lastMonthActual: 180, thisMonthLimit: 200 },
  { id: 3, category: "Fixed", subcategory: "Utilities", lastMonthLimit: 350, lastMonthActual: 310, thisMonthLimit: 350 },
  { id: 4, category: "Fixed", subcategory: "Staff Salaries", lastMonthLimit: 4500, lastMonthActual: 4500, thisMonthLimit: 4500 },
  { id: 5, category: "Variable", subcategory: "Equipment", lastMonthLimit: 500, lastMonthActual: 450, thisMonthLimit: 600 },
  { id: 6, category: "Variable", subcategory: "Cleaning", lastMonthLimit: 150, lastMonthActual: 120, thisMonthLimit: 150 },
  { id: 7, category: "Variable", subcategory: "Marketing", lastMonthLimit: 300, lastMonthActual: 200, thisMonthLimit: 300 },
  { id: 8, category: "Variable", subcategory: "Supplies", lastMonthLimit: 100, lastMonthActual: 85, thisMonthLimit: 100 },
  { id: 9, category: "Tax", subcategory: "IVA (VAT)", lastMonthLimit: 900, lastMonthActual: 890, thisMonthLimit: 900 },
  { id: 10, category: "Tax", subcategory: "Social Security", lastMonthLimit: 700, lastMonthActual: 650, thisMonthLimit: 700 },
];

const categoryOrder: BudgetCategory[] = ["Fixed", "Variable", "Tax"];

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

function formatEur(value: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function MonthlyBudgetPage() {
  const { t } = useI18n();
  const [lines, setLines] = useState(initialBudgetLines);

  function updateLimit(id: number, value: string) {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, thisMonthLimit: Number(value) || 0 } : l))
    );
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
        <button className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90">
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
              <td className="px-4 py-3 text-sm font-bold text-vytal-green" colSpan={2}>Total</td>
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
