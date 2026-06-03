"use client";

import { useState } from "react";
import { Save } from "lucide-react";

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

export default function MonthlyBudgetPage() {
  const [lines, setLines] = useState(initialBudgetLines);

  function updateLimit(id: number, value: string) {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, thisMonthLimit: Number(value) || 0 } : l))
    );
  }

  const totalLastLimit = lines.reduce((s, l) => s + l.lastMonthLimit, 0);
  const totalLastActual = lines.reduce((s, l) => s + l.lastMonthActual, 0);
  const totalThisLimit = lines.reduce((s, l) => s + l.thisMonthLimit, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">Monthly Budget</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            Set monthly spending limits by category
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90">
          <Save className="h-4 w-4" />
          Set Budget
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-vytal-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-vytal-border bg-vytal-bg2">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">Subcategory</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">Last Month Limit</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">Last Month Actual</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">This Month Limit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vytal-border">
            {categoryOrder.map((cat) => {
              const catLines = lines.filter((l) => l.category === cat);
              return catLines.map((line, idx) => (
                <tr key={line.id} className="bg-vytal-card transition-colors hover:bg-vytal-bg3">
                  <td className="px-4 py-3">
                    {idx === 0 && (
                      <span className={`text-sm font-semibold ${categoryColors[cat]}`}>{cat}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-vytal-text">{line.subcategory}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-vytal-muted">{line.lastMonthLimit.toLocaleString()} EUR</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-mono text-sm ${line.lastMonthActual > line.lastMonthLimit ? "text-vytal-red" : "text-vytal-text"}`}>
                      {line.lastMonthActual.toLocaleString()} EUR
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      value={line.thisMonthLimit}
                      onChange={(e) => updateLimit(line.id, e.target.value)}
                      className="w-28 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-right font-mono text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                    />
                  </td>
                </tr>
              ));
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-vytal-green/30 bg-vytal-bg2">
              <td className="px-4 py-3 text-sm font-bold text-vytal-green" colSpan={2}>Total</td>
              <td className="px-4 py-3 text-right font-mono text-sm font-bold text-vytal-muted">{totalLastLimit.toLocaleString()} EUR</td>
              <td className="px-4 py-3 text-right font-mono text-sm font-bold text-vytal-text">{totalLastActual.toLocaleString()} EUR</td>
              <td className="px-4 py-3 text-right font-mono text-sm font-bold text-vytal-green">{totalThisLimit.toLocaleString()} EUR</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
