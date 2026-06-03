"use client";

import { useState, useMemo } from "react";
import { Receipt, Plus, Filter, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { formatCurrency } from "@/stores/data-store";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";

type ExpenseCategory = "Fixed" | "Variable" | "Tax";
const categories: ExpenseCategory[] = ["Fixed", "Variable", "Tax"];
const paymentMethods = ["Transfer", "Card", "Cash", "Direct Debit"];

interface Expense {
  id: number;
  date: string;
  category: ExpenseCategory;
  subcategory: string;
  amount: number;
  method: string;
  description: string;
  hasReceipt: boolean;
}

const initialExpenses: Expense[] = [
  { id: 1, date: "2026-06-01", category: "Fixed", subcategory: "Rent", amount: 2500, method: "Transfer", description: "Monthly rent", hasReceipt: true },
  { id: 2, date: "2026-06-01", category: "Fixed", subcategory: "Insurance", amount: 180, method: "Direct Debit", description: "Box insurance premium", hasReceipt: true },
  { id: 3, date: "2026-05-30", category: "Variable", subcategory: "Equipment", amount: 450, method: "Card", description: "Replacement ropes and bands", hasReceipt: true },
  { id: 4, date: "2026-05-28", category: "Variable", subcategory: "Cleaning", amount: 120, method: "Transfer", description: "Monthly cleaning service", hasReceipt: false },
  { id: 5, date: "2026-05-25", category: "Tax", subcategory: "IVA", amount: 890, method: "Transfer", description: "Q2 VAT payment", hasReceipt: true },
  { id: 6, date: "2026-05-22", category: "Variable", subcategory: "Marketing", amount: 200, method: "Card", description: "Instagram ads campaign", hasReceipt: true },
  { id: 7, date: "2026-05-20", category: "Fixed", subcategory: "Utilities", amount: 310, method: "Direct Debit", description: "Electricity bill", hasReceipt: true },
  { id: 8, date: "2026-05-18", category: "Tax", subcategory: "Social Security", amount: 650, method: "Transfer", description: "Employee contributions", hasReceipt: false },
];

const categoryColors: Record<ExpenseCategory, string> = {
  Fixed: "bg-vytal-blue/10 text-vytal-blue",
  Variable: "bg-vytal-amber/10 text-vytal-amber",
  Tax: "bg-vytal-red/10 text-vytal-red",
};

function formatEur(value: number): string {
  return formatCurrency(value);
}

export default function ExpenseTrackingPage() {
  const { t } = useI18n();
  const [expenses] = useState(initialExpenses);
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | "all">("all");
  const [newDate, setNewDate] = useState("2026-06-03");
  const [newCategory, setNewCategory] = useState<ExpenseCategory>("Fixed");
  const [newSubcategory, setNewSubcategory] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newMethod, setNewMethod] = useState("Transfer");
  const [newDescription, setNewDescription] = useState("");
  const [newReceipt, setNewReceipt] = useState(false);

  const filtered = useMemo(() => {
    if (filterCategory === "all") return expenses;
    return expenses.filter((e) => e.category === filterCategory);
  }, [expenses, filterCategory]);

  const totals = useMemo(() => {
    const map: Record<ExpenseCategory, number> = { Fixed: 0, Variable: 0, Tax: 0 };
    for (const e of expenses) map[e.category] += e.amount;
    return map;
  }, [expenses]);

  const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: t("nav.financials"), href: "/financials" },
          { label: t("expenses.title") },
        ]}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-vytal-text">{t("expenses.title")}</h1>
        <p className="mt-1 text-sm text-vytal-muted">
          {t("expenses.subtitle")}
        </p>
      </div>

      {/* Category Totals */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {categories.map((cat) => (
          <div key={cat} className="rounded-xl border border-vytal-border bg-vytal-card p-4 transition-all duration-200 hover:border-[rgba(61,255,110,0.22)]">
            <span className="text-xs font-medium uppercase tracking-wider text-vytal-muted">
              {t(`budget.${cat.toLowerCase()}`)}
            </span>
            <p className="mt-1 font-mono text-xl font-bold text-vytal-text">
              {formatEur(totals[cat])}
            </p>
          </div>
        ))}
        <div className="rounded-xl border border-vytal-green/20 bg-vytal-green/5 p-4">
          <span className="text-xs font-medium uppercase tracking-wider text-vytal-green">
            Total
          </span>
          <p className="mt-1 font-mono text-xl font-bold text-vytal-green">
            {formatEur(grandTotal)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Add Expense Form */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 transition-all duration-200 hover:border-[rgba(61,255,110,0.22)]">
          <div className="mb-5 flex items-center gap-2">
            <Plus className="h-5 w-5 text-vytal-green" />
            <h2 className="text-lg font-semibold text-vytal-text">{t("expenses.addExpense")}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">Date</label>
              <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text transition-colors focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("budget.category")}</label>
              <select value={newCategory} onChange={(e) => setNewCategory(e.target.value as ExpenseCategory)} className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text transition-colors focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20">
                {categories.map((c) => (<option key={c} value={c}>{t(`budget.${c.toLowerCase()}`)}</option>))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("budget.subcategory")}</label>
              <input type="text" value={newSubcategory} onChange={(e) => setNewSubcategory(e.target.value)} placeholder="e.g. Rent, Equipment..." className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted transition-colors focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">Amount (EUR)</label>
              <input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="0.00" className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted transition-colors focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">Payment Method</label>
              <select value={newMethod} onChange={(e) => setNewMethod(e.target.value)} className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text transition-colors focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20">
                {paymentMethods.map((m) => (<option key={m} value={m}>{m}</option>))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">Description</label>
              <input type="text" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Brief description..." className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted transition-colors focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20" />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-vytal-bg2 px-3 py-2.5">
              <span className="text-sm text-vytal-text">{t("expenses.hasReceipt")}</span>
              <button type="button" onClick={() => setNewReceipt(!newReceipt)} className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200", newReceipt ? "bg-vytal-green" : "bg-vytal-bg3")}>
                <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200", newReceipt ? "left-[22px]" : "left-0.5")} />
              </button>
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90">
              <Plus className="h-4 w-4" />
              {t("expenses.addExpense")}
            </button>
          </div>
        </div>

        {/* Expense Table */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <Filter className="h-4 w-4 text-vytal-muted" />
            <div className="flex gap-2">
              <button onClick={() => setFilterCategory("all")} className={cn("rounded-full px-3 py-1 text-xs font-medium transition-colors", filterCategory === "all" ? "bg-vytal-green/10 text-vytal-green" : "text-vytal-muted hover:text-vytal-text")}>{t("expenses.all")}</button>
              {categories.map((c) => (
                <button key={c} onClick={() => setFilterCategory(c)} className={cn("rounded-full px-3 py-1 text-xs font-medium transition-colors", filterCategory === c ? "bg-vytal-green/10 text-vytal-green" : "text-vytal-muted hover:text-vytal-text")}>{t(`budget.${c.toLowerCase()}`)}</button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Sem despesas"
              description="Nenhuma despesa encontrada para esta categoria."
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-vytal-border">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-vytal-border bg-vytal-bg2">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("budget.category")}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">Amount</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted sm:table-cell">Method</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted sm:table-cell">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vytal-border">
                  {filtered.map((e) => (
                    <tr key={e.id} className="bg-vytal-card transition-colors hover:bg-vytal-bg3">
                      <td className="px-4 py-3 font-mono text-sm text-vytal-muted">{e.date}</td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", categoryColors[e.category])}>
                          {t(`budget.${e.category.toLowerCase()}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-vytal-text">{e.description}</p>
                        <p className="text-[10px] text-vytal-muted">{e.subcategory}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm font-medium text-vytal-text">{formatEur(e.amount)}</td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <span className="inline-flex items-center rounded bg-vytal-bg3 px-2 py-0.5 text-xs text-vytal-muted">{e.method}</span>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        {e.hasReceipt ? (
                          <Receipt className="h-4 w-4 text-vytal-green" />
                        ) : (
                          <span className="text-xs text-vytal-muted">--</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
