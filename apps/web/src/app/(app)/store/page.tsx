"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { formatCurrency } from "@/stores/data-store";
import {
  ShoppingBag,
  Plus,
  X,
  Pencil,
  Trash2,
  Search,
  Package,
  Receipt,
  Filter,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/confirm-dialog";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ProductCategory = "apparel" | "equipment" | "supplements" | "accessories";
type PaymentMethod = "cash" | "card" | "mbway" | "transfer";
type SaleStatus = "completed" | "refunded" | "pending";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: ProductCategory;
  active: boolean;
}

interface SaleItem {
  productName: string;
  qty: number;
}

interface Sale {
  id: string;
  date: string;
  memberName: string;
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const categoryConfig: Record<ProductCategory, { label: string; color: string }> = {
  apparel: { label: "Apparel", color: "bg-vytal-blue/10 text-vytal-blue" },
  equipment: { label: "Equipment", color: "bg-vytal-green/10 text-vytal-green" },
  supplements: { label: "Supplements", color: "bg-vytal-amber/10 text-vytal-amber" },
  accessories: { label: "Accessories", color: "bg-vytal-purple/10 text-vytal-purple" },
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
  mbway: "MB WAY",
  transfer: "Transfer",
};

const statusConfig: Record<SaleStatus, { label: string; color: string }> = {
  completed: { label: "Completed", color: "bg-vytal-green/10 text-vytal-green" },
  refunded: { label: "Refunded", color: "bg-vytal-red/10 text-vytal-red" },
  pending: { label: "Pending", color: "bg-vytal-amber/10 text-vytal-amber" },
};

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const initialProducts: Product[] = [
  { id: "p1", name: "T-Shirt Box", price: 25, stock: 48, category: "apparel", active: true },
  { id: "p2", name: "Crop Top", price: 22, stock: 35, category: "apparel", active: true },
  { id: "p3", name: "Sweater Vytal", price: 35, stock: 20, category: "apparel", active: true },
  { id: "p4", name: "Backpack", price: 45, stock: 12, category: "accessories", active: true },
  { id: "p5", name: "Gymnastics Grips", price: 18, stock: 60, category: "equipment", active: true },
  { id: "p6", name: "Knee Sleeves", price: 30, stock: 42, category: "equipment", active: true },
  { id: "p7", name: "Wrist Wraps", price: 12, stock: 55, category: "equipment", active: true },
  { id: "p8", name: "Jump Rope", price: 20, stock: 30, category: "equipment", active: true },
  { id: "p9", name: "Athletic Tape", price: 5, stock: 120, category: "accessories", active: true },
  { id: "p10", name: "Chalk Bag", price: 8, stock: 75, category: "accessories", active: true },
  { id: "p11", name: "Water Bottle", price: 15, stock: 50, category: "accessories", active: true },
  { id: "p12", name: "Protein Shaker", price: 10, stock: 65, category: "accessories", active: false },
];

const initialSales: Sale[] = [
  { id: "s1", date: "2026-06-04", memberName: "Ana Silva", items: [{ productName: "T-Shirt Box", qty: 1 }, { productName: "Wrist Wraps", qty: 1 }], total: 37, paymentMethod: "card", status: "completed" },
  { id: "s2", date: "2026-06-03", memberName: "Pedro Almeida", items: [{ productName: "Knee Sleeves", qty: 1 }], total: 30, paymentMethod: "mbway", status: "completed" },
  { id: "s3", date: "2026-06-03", memberName: "Sofia Santos", items: [{ productName: "Jump Rope", qty: 1 }, { productName: "Chalk Bag", qty: 2 }], total: 36, paymentMethod: "cash", status: "completed" },
  { id: "s4", date: "2026-06-02", memberName: "Miguel Costa", items: [{ productName: "Crop Top", qty: 2 }], total: 44, paymentMethod: "card", status: "completed" },
  { id: "s5", date: "2026-06-02", memberName: "Ines Ferreira", items: [{ productName: "Gymnastics Grips", qty: 1 }], total: 18, paymentMethod: "mbway", status: "completed" },
  { id: "s6", date: "2026-06-01", memberName: "Tiago Neves", items: [{ productName: "Sweater Vytal", qty: 1 }], total: 35, paymentMethod: "transfer", status: "refunded" },
  { id: "s7", date: "2026-05-31", memberName: "Maria Oliveira", items: [{ productName: "Backpack", qty: 1 }, { productName: "Water Bottle", qty: 1 }], total: 60, paymentMethod: "card", status: "completed" },
  { id: "s8", date: "2026-05-30", memberName: "Jose Fonte", items: [{ productName: "Athletic Tape", qty: 3 }, { productName: "Protein Shaker", qty: 1 }], total: 25, paymentMethod: "cash", status: "pending" },
];

function generateId(): string {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function StorePage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [tab, setTab] = useState<"products" | "sales">("products");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [sales] = useState<Sale[]>(initialSales);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formCategory, setFormCategory] = useState<ProductCategory>("apparel");

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Sales filters
  const [salesSearch, setSalesSearch] = useState("");
  const [salesStatusFilter, setSalesStatusFilter] = useState<SaleStatus | "all">("all");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSales = sales.filter((s) => {
    const matchesSearch = s.memberName.toLowerCase().includes(salesSearch.toLowerCase());
    const matchesStatus = salesStatusFilter === "all" || s.status === salesStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenueThisMonth = sales
    .filter((s) => s.status === "completed" && s.date >= "2026-06-01")
    .reduce((sum, s) => sum + s.total, 0);

  const resetForm = useCallback(() => {
    setFormName("");
    setFormPrice("");
    setFormStock("");
    setFormCategory("apparel");
    setShowForm(false);
    setEditingId(null);
  }, []);

  const handleEdit = useCallback((product: Product) => {
    setFormName(product.name);
    setFormPrice(product.price.toString());
    setFormStock(product.stock.toString());
    setFormCategory(product.category);
    setEditingId(product.id);
    setShowForm(true);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!formName.trim()) return;
    if (editingId) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? { ...p, name: formName.trim(), price: parseFloat(formPrice) || 0, stock: parseInt(formStock) || 0, category: formCategory }
            : p
        )
      );
      toast(t("store.productUpdated"), "success");
    } else {
      const newProduct: Product = {
        id: `p-${generateId()}`,
        name: formName.trim(),
        price: parseFloat(formPrice) || 0,
        stock: parseInt(formStock) || 0,
        category: formCategory,
        active: true,
      };
      setProducts((prev) => [...prev, newProduct]);
      toast(t("store.productAdded"), "success");
    }
    resetForm();
  }, [formName, formPrice, formStock, formCategory, editingId, resetForm, toast, t]);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    const removed = products.find((p) => p.id === deleteTarget.id);
    setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    toast(t("store.productDeleted"), "success", {
      action: removed
        ? {
            label: t("action.undo"),
            onClick: () => setProducts((prev) => [...prev, removed]),
          }
        : undefined,
    });
    setDeleteTarget(null);
  }, [deleteTarget, products, toast, t]);

  const handleToggleActive = useCallback((id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("nav.store"), href: "/store" }]} />

      <div>
        <h1 className="text-2xl font-bold text-vytal-text">{t("store.title")}</h1>
        <p className="mt-1 text-sm text-vytal-muted">{t("store.subtitle")}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-vytal-border bg-vytal-bg2 p-1">
        <button
          onClick={() => setTab("products")}
          className={cn(
            "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            tab === "products"
              ? "bg-vytal-green/10 text-vytal-green"
              : "text-vytal-muted hover:text-vytal-text"
          )}
        >
          <Package className="h-4 w-4" />
          {t("store.products")}
        </button>
        <button
          onClick={() => setTab("sales")}
          className={cn(
            "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            tab === "sales"
              ? "bg-vytal-green/10 text-vytal-green"
              : "text-vytal-muted hover:text-vytal-text"
          )}
        >
          <Receipt className="h-4 w-4" />
          {t("store.salesHistory")}
        </button>
      </div>

      {/* Products Tab */}
      {tab === "products" && (
        <div className="space-y-4">
          {/* Search + Add */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vytal-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("store.searchProducts")}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 py-2 pl-10 pr-4 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
            >
              <Plus className="h-4 w-4" />
              {t("store.addProduct")}
            </button>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <div className="rounded-xl border border-vytal-green/20 bg-vytal-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-vytal-text">
                  {editingId ? t("store.editProduct") : t("store.addProduct")}
                </h3>
                <button onClick={resetForm} className="text-vytal-muted hover:text-vytal-text">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.productName")}</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.price")}</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.stock")}</label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.category")}</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                    className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                  >
                    {(Object.keys(categoryConfig) as ProductCategory[]).map((cat) => (
                      <option key={cat} value={cat}>{categoryConfig[cat].label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={!formName.trim()}
                  className="rounded-lg bg-vytal-green px-4 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90 disabled:opacity-50"
                >
                  {editingId ? t("action.save") : t("store.addProduct")}
                </button>
              </div>
            </div>
          )}

          {/* Products Table */}
          <div className="overflow-x-auto rounded-xl border border-vytal-border bg-vytal-card">
            <table className="zebra-table w-full">
              <thead>
                <tr className="border-b border-vytal-border bg-vytal-bg2">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.productName")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.price")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.stock")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.category")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("table.status")}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("table.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-vytal-border/50 row-interactive hover:bg-vytal-bg3/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-bg3 text-vytal-muted">
                          <ShoppingBag className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-vytal-text">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-vytal-text">{formatCurrency(product.price)}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "text-sm font-medium",
                        product.stock <= 10 ? "text-vytal-red" : product.stock <= 25 ? "text-vytal-amber" : "text-vytal-text"
                      )}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", categoryConfig[product.category].color)}>
                        {categoryConfig[product.category].label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(product.id)}
                        className={cn(
                          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                          product.active ? "bg-vytal-green" : "bg-vytal-bg3"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                          product.active ? "translate-x-4" : "translate-x-1"
                        )} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(product)}
                          className="rounded-lg p-1.5 text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ id: product.id, name: product.name })}
                          className="rounded-lg p-1.5 text-vytal-muted transition-colors hover:bg-vytal-red/10 hover:text-vytal-red"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sales History Tab */}
      {tab === "sales" && (
        <div className="space-y-4">
          {/* Stats Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-green/10">
                  <TrendingUp className="h-5 w-5 text-vytal-green" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.revenueThisMonth")}</p>
                  <p className="text-xl font-bold text-vytal-text">{formatCurrency(totalRevenueThisMonth)}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-blue/10">
                  <Receipt className="h-5 w-5 text-vytal-blue" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.totalSales")}</p>
                  <p className="text-xl font-bold text-vytal-text">{sales.filter((s) => s.status === "completed").length}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-purple/10">
                  <Package className="h-5 w-5 text-vytal-purple" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.activeProducts")}</p>
                  <p className="text-xl font-bold text-vytal-text">{products.filter((p) => p.active).length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Filter */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vytal-muted" />
              <input
                type="text"
                value={salesSearch}
                onChange={(e) => setSalesSearch(e.target.value)}
                placeholder={t("store.searchSales")}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 py-2 pl-10 pr-4 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown((v) => !v)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                  salesStatusFilter !== "all"
                    ? "border-vytal-green/30 bg-vytal-green/5 text-vytal-green"
                    : "border-vytal-border bg-vytal-card text-vytal-muted hover:text-vytal-text"
                )}
              >
                <Filter className="h-4 w-4" />
                {salesStatusFilter === "all"
                  ? t("action.filter")
                  : t(`store.filter${salesStatusFilter.charAt(0).toUpperCase() + salesStatusFilter.slice(1)}` as Parameters<typeof t>[0])}
              </button>
              {showStatusDropdown && (
                <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-vytal-border bg-vytal-card shadow-lg">
                  {(["all", "completed", "refunded", "pending"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => { setSalesStatusFilter(status); setShowStatusDropdown(false); }}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-vytal-bg3",
                        salesStatusFilter === status ? "text-vytal-green" : "text-vytal-text"
                      )}
                    >
                      {status === "all" ? t("store.filterAll") : t(`store.filter${status.charAt(0).toUpperCase() + status.slice(1)}` as Parameters<typeof t>[0])}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sales Table */}
          <div className="overflow-x-auto rounded-xl border border-vytal-border bg-vytal-card">
            <table className="zebra-table w-full">
              <thead>
                <tr className="border-b border-vytal-border bg-vytal-bg2">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("table.date")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("table.member")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.products")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("table.total")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("table.paymentMethod")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("table.status")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="border-b border-vytal-border/50 row-interactive hover:bg-vytal-bg3/30">
                    <td className="px-4 py-3 text-sm text-vytal-muted">{sale.date}</td>
                    <td className="px-4 py-3 text-sm font-medium text-vytal-text">{sale.memberName}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {sale.items.map((item, i) => (
                          <span key={i} className="inline-flex rounded-full bg-vytal-bg3 px-2 py-0.5 text-[11px] font-medium text-vytal-text">
                            {item.productName}{item.qty > 1 ? ` x${item.qty}` : ""}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-vytal-text">{formatCurrency(sale.total)}</td>
                    <td className="px-4 py-3 text-sm text-vytal-muted">{paymentMethodLabels[sale.paymentMethod]}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", statusConfig[sale.status].color)}>
                        {statusConfig[sale.status].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={t("action.delete")}
        description={`${t("store.confirmDelete")} "${deleteTarget?.name}"?`}
        confirmLabel={t("action.delete")}
        cancelLabel={t("action.cancel")}
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
