"use client";

import { useState, useCallback, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  type StoreProduct,
  type StoreProductCategory,
  type StoreProductFulfillment,
  type StoreSale,
  type StoreSaleStatus,
  type StoreSupplier,
  type StoreSupplierRegion,
  type StoreOrder,
  type StoreOrderStatus,
} from "@/stores/data-store";
import { useOrgFormat } from "@/lib/org-format";
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
  Factory,
  Truck,
  Globe2,
  BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/confirm-dialog";

// ---------------------------------------------------------------------------
type PaymentMethod = "cash" | "card" | "mbway" | "transfer";
type Product = StoreProduct;

type Sale = StoreSale;

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const categoryConfig: Record<StoreProductCategory, { label: string; color: string }> = {
  apparel: { label: "Apparel", color: "bg-vytal-blue/10 text-vytal-blue" },
  equipment: { label: "Equipment", color: "bg-vytal-green/10 text-vytal-green" },
  supplements: { label: "Supplements", color: "bg-vytal-amber/10 text-vytal-amber" },
  accessories: { label: "Accessories", color: "bg-vytal-purple/10 text-vytal-purple" },
};

const fulfillmentConfig: Record<StoreProductFulfillment, { color: string }> = {
  in_house: { color: "bg-vytal-blue/10 text-vytal-blue" },
  external: { color: "bg-vytal-amber/10 text-vytal-amber" },
};

const supplierRegionConfig: Record<StoreSupplierRegion, { color: string }> = {
  china: { color: "bg-vytal-red/10 text-vytal-red" },
  portugal: { color: "bg-vytal-green/10 text-vytal-green" },
  europe: { color: "bg-vytal-blue/10 text-vytal-blue" },
};

const orderStatusConfig: Record<StoreOrderStatus, { color: string }> = {
  draft: { color: "bg-vytal-bg3 text-vytal-muted" },
  sent: { color: "bg-vytal-blue/10 text-vytal-blue" },
  confirmed: { color: "bg-vytal-green/10 text-vytal-green" },
  in_production: { color: "bg-vytal-amber/10 text-vytal-amber" },
  shipped: { color: "bg-vytal-purple/10 text-vytal-purple" },
  delivered: { color: "bg-vytal-green/10 text-vytal-green" },
  cancelled: { color: "bg-vytal-red/10 text-vytal-red" },
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
  mbway: "MB WAY",
  transfer: "Transfer",
};

const statusConfig: Record<StoreSaleStatus, { label: string; color: string }> = {
  completed: { label: "Completed", color: "bg-vytal-green/10 text-vytal-green" },
  refunded: { label: "Refunded", color: "bg-vytal-red/10 text-vytal-red" },
  pending: { label: "Pending", color: "bg-vytal-amber/10 text-vytal-amber" },
};

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function StorePage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { money: formatCurrency } = useOrgFormat();
  const utils = trpc.useUtils();
  const productsQuery = trpc.shop.products.list.useQuery();
  const salesQuery = trpc.shop.sales.list.useQuery();
  const suppliersQuery = trpc.shop.suppliers.list.useQuery();
  const ordersQuery = trpc.shop.orders.list.useQuery();

  // Adapt the API rows to the storefront display types (keeps the JSX intact).
  const products: Product[] = (productsQuery.data?.items ?? []).map((p) => ({
    id: p.id, name: p.name, price: Number(p.price), stock: p.stock, category: p.category,
    active: p.active, style: p.style ?? "", color: p.color ?? "", size: p.size ?? "",
    branding: p.branding ?? "", supplierId: p.supplierId ?? "", fulfillment: p.fulfillment, sku: p.sku ?? "",
  }));
  const suppliers: StoreSupplier[] = (suppliersQuery.data?.items ?? []).map((s) => ({
    id: s.id, name: s.name, region: s.region, country: "", dealer: s.contact ?? "",
    website: "", leadTimeDays: s.leadTimeDays ?? 0, minOrderQty: 0, status: s.status, channels: [],
  }));
  const productNameById = new Map(products.map((p) => [p.id, p.name] as const));
  const orders: StoreOrder[] = (ordersQuery.data?.items ?? []).map((o) => ({
    id: o.id, date: new Date(o.placedAt).toISOString().slice(0, 10),
    productName: o.productId ? productNameById.get(o.productId) ?? "" : "",
    supplierId: o.supplierId ?? "", quantity: o.quantity, total: Number(o.total),
    status: o.status === "placed" ? "confirmed" : o.status,
    tracking: o.trackingCode ?? "", eta: "", source: "",
  }));
  const sales: Sale[] = (salesQuery.data?.items ?? []).map((s) => ({
    id: s.id, date: new Date(s.soldAt).toISOString().slice(0, 10), memberName: s.customerName,
    items: s.items.map((i) => ({ productName: i.productName, qty: i.qty })),
    total: Number(s.total), paymentMethod: s.paymentMethod, status: s.status,
  }));

  const createProduct = trpc.shop.products.create.useMutation({ onSuccess: () => utils.shop.products.list.invalidate() });
  const updateProductM = trpc.shop.products.update.useMutation({ onSuccess: () => utils.shop.products.list.invalidate() });
  const deleteProductM = trpc.shop.products.delete.useMutation({ onSuccess: () => utils.shop.products.list.invalidate() });
  const updateSupplierM = trpc.shop.suppliers.update.useMutation({ onSuccess: () => utils.shop.suppliers.list.invalidate() });
  const updateOrderM = trpc.shop.orders.updateStatus.useMutation({ onSuccess: () => utils.shop.orders.list.invalidate() });

  const [tab, setTab] = useState<"products" | "sales" | "suppliers">("products");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formCategory, setFormCategory] = useState<StoreProductCategory>("apparel");
  const [formStyle, setFormStyle] = useState("");
  const [formColor, setFormColor] = useState("");
  const [formSize, setFormSize] = useState("");
  const [formBranding, setFormBranding] = useState("");
  const [formSupplierId, setFormSupplierId] = useState(suppliers[0]?.id ?? "");
  const [formFulfillment, setFormFulfillment] = useState<StoreProductFulfillment>("external");

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Sales filters
  const [salesSearch, setSalesSearch] = useState("");
  const [salesStatusFilter, setSalesStatusFilter] = useState<StoreSaleStatus | "all">("all");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const supplierById = useMemo(
    () => new Map(suppliers.map((supplier) => [supplier.id, supplier] as const)),
    [suppliers]
  );
  const fulfillmentLabelMap = {
    in_house: t("store.fulfillmentInHouse"),
    external: t("store.fulfillmentExternal"),
  } satisfies Record<StoreProductFulfillment, string>;
  const supplierRegionLabelMap = {
    china: t("store.regionChina"),
    portugal: t("store.regionPortugal"),
    europe: t("store.regionEurope"),
  } satisfies Record<StoreSupplierRegion, string>;
  const orderStatusLabelMap = {
    draft: t("store.orderDraft"),
    sent: t("store.orderSent"),
    confirmed: t("store.orderConfirmed"),
    in_production: t("store.orderInProduction"),
    shipped: t("store.orderShipped"),
    delivered: t("store.orderDelivered"),
    cancelled: t("store.orderCancelled"),
  } satisfies Record<StoreOrderStatus, string>;

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
  const openOrders = orders.filter((order) => !["delivered", "cancelled"].includes(order.status));
  const chineseOrders = orders.filter((order) => supplierById.get(order.supplierId)?.region === "china");
  const externalProducts = products.filter((product) => product.fulfillment === "external");
  const activeSuppliers = suppliers.filter((supplier) => supplier.status === "active");

  const resetForm = useCallback(() => {
    setFormName("");
    setFormPrice("");
    setFormStock("");
    setFormCategory("apparel");
    setFormStyle("");
    setFormColor("");
    setFormSize("");
    setFormBranding("");
    setFormSupplierId(suppliers[0]?.id ?? "");
    setFormFulfillment("external");
    setShowForm(false);
    setEditingId(null);
  }, [suppliers]);

  const handleEdit = useCallback((product: Product) => {
    setFormName(product.name);
    setFormPrice(product.price.toString());
    setFormStock(product.stock.toString());
    setFormCategory(product.category);
    setFormStyle(product.style);
    setFormColor(product.color);
    setFormSize(product.size);
    setFormBranding(product.branding);
    setFormSupplierId(product.supplierId);
    setFormFulfillment(product.fulfillment);
    setEditingId(product.id);
    setShowForm(true);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!formName.trim()) return;
    const data = {
      name: formName.trim(),
      price: parseFloat(formPrice) || 0,
      stock: parseInt(formStock) || 0,
      category: formCategory,
      style: formStyle.trim() || undefined,
      color: formColor.trim() || undefined,
      size: formSize.trim() || undefined,
      branding: formBranding.trim() || undefined,
      supplierId: formSupplierId || undefined,
      fulfillment: formFulfillment,
      sku: `VT-${formName.trim().replace(/\s+/g, "-").toUpperCase().slice(0, 12)}`,
    };
    if (editingId) {
      updateProductM.mutate({ id: editingId, data });
      toast(t("store.productUpdated"), "success");
    } else {
      createProduct.mutate(data);
      toast(t("store.productAdded"), "success");
    }
    resetForm();
  }, [formName, formPrice, formStock, formCategory, formStyle, formColor, formSize, formBranding, formSupplierId, formFulfillment, editingId, resetForm, toast, t, createProduct, updateProductM]);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteProductM.mutate({ id: deleteTarget.id });
    toast(t("store.productDeleted"), "success");
    setDeleteTarget(null);
  }, [deleteTarget, toast, t, deleteProductM]);

  const handleToggleActive = useCallback((id: string) => {
    const current = products.find((p) => p.id === id);
    updateProductM.mutate({ id, data: { active: !(current?.active ?? true) } });
  }, [products, updateProductM]);

  const handleSyncOrders = useCallback(() => {
    toast(t("store.ordersSynced"), "success");
  }, [toast, t]);

  const handleToggleSupplierStatus = useCallback((id: string, nextStatus: StoreSupplier["status"]) => {
    updateSupplierM.mutate({ id, data: { status: nextStatus } });
  }, [updateSupplierM]);

  // Advance through the real (API) order lifecycle.
  const handleAdvanceOrderStatus = useCallback(
    (id: string) => {
      const flow = ["draft", "placed", "in_production", "shipped", "delivered"] as const;
      const current = (ordersQuery.data?.items ?? []).find((o) => o.id === id)?.status;
      if (!current || current === "cancelled" || current === "delivered") return;
      const idx = flow.indexOf(current as (typeof flow)[number]);
      const next = flow[Math.min(idx + 1, flow.length - 1)];
      updateOrderM.mutate({ id, status: next });
    },
    [ordersQuery.data, updateOrderM],
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("nav.store"), href: "/store" }]} />

      <div>
        <h1 className="text-2xl font-bold text-vytal-text">{t("store.title")}</h1>
        <p className="mt-1 text-sm text-vytal-muted">{t("store.subtitle")}</p>
      </div>

      <div className="rounded-xl border border-vytal-border bg-vytal-card p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-green/10">
            <Factory className="h-5 w-5 text-vytal-green" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-vytal-text">{t("store.routingTitle")}</p>
            <p className="mt-1 text-sm text-vytal-muted">{t("store.routingSubtitle")}</p>
          </div>
        </div>
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
        <button
          onClick={() => setTab("suppliers")}
          className={cn(
            "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            tab === "suppliers"
              ? "bg-vytal-green/10 text-vytal-green"
              : "text-vytal-muted hover:text-vytal-text"
          )}
        >
          <Truck className="h-4 w-4" />
          {t("store.suppliers")}
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
                    onChange={(e) => setFormCategory(e.target.value as StoreProductCategory)}
                    className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                  >
                    {(Object.keys(categoryConfig) as StoreProductCategory[]).map((cat) => (
                      <option key={cat} value={cat}>{categoryConfig[cat].label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.style")}</label>
                  <input
                    type="text"
                    value={formStyle}
                    onChange={(e) => setFormStyle(e.target.value)}
                    className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.color")}</label>
                  <input
                    type="text"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.size")}</label>
                  <input
                    type="text"
                    value={formSize}
                    onChange={(e) => setFormSize(e.target.value)}
                    className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.branding")}</label>
                  <input
                    type="text"
                    value={formBranding}
                    onChange={(e) => setFormBranding(e.target.value)}
                    className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                  />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.supplier")}</label>
                  <select
                    value={formSupplierId}
                    onChange={(e) => setFormSupplierId(e.target.value)}
                    className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                  >
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.fulfillment")}</label>
                  <select
                    value={formFulfillment}
                    onChange={(e) => setFormFulfillment(e.target.value as StoreProductFulfillment)}
                    className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                  >
                    {(Object.keys(fulfillmentConfig) as StoreProductFulfillment[]).map((mode) => (
                      <option key={mode} value={mode}>
                        {fulfillmentLabelMap[mode]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.sku")}</label>
                  <input
                    type="text"
                    value={`VT-${formName.trim().replace(/\s+/g, "-").toUpperCase().slice(0, 12)}`}
                    readOnly
                    className="w-full rounded-lg border border-vytal-border bg-vytal-bg3 px-3 py-2 text-sm text-vytal-muted"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.externalRouting")}</label>
                  <div className="flex h-10 items-center rounded-lg border border-vytal-border bg-vytal-bg3 px-3 text-sm text-vytal-muted">
                    {formFulfillment === "external" ? t("store.externalRoutingOn") : t("store.externalRoutingOff")}
                  </div>
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
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.supplier")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.fulfillment")}</th>
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
                        <div>
                          <div className="text-sm font-medium text-vytal-text">{product.name}</div>
                          <div className="text-xs text-vytal-muted">{product.style}</div>
                        </div>
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
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-vytal-text">{supplierById.get(product.supplierId)?.name ?? t("store.unknownSupplier")}</span>
                        <span className="text-xs text-vytal-muted">{product.sku}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", fulfillmentConfig[product.fulfillment].color)}>
                        {fulfillmentLabelMap[product.fulfillment]}
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-amber/10">
                  <Truck className="h-5 w-5 text-vytal-amber" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.openOrders")}</p>
                  <p className="text-xl font-bold text-vytal-text">{openOrders.length}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-red/10">
                  <Globe2 className="h-5 w-5 text-vytal-red" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.chinaOrders")}</p>
                  <p className="text-xl font-bold text-vytal-text">{chineseOrders.length}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-green/10">
                  <BadgeCheck className="h-5 w-5 text-vytal-green" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.externalProducts")}</p>
                  <p className="text-xl font-bold text-vytal-text">{externalProducts.length}</p>
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

      {tab === "suppliers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-vytal-text">{t("store.suppliersTitle")}</h2>
              <p className="text-sm text-vytal-muted">{t("store.suppliersSubtitle")}</p>
            </div>
            <button
              onClick={handleSyncOrders}
              className="flex items-center gap-2 rounded-lg bg-vytal-green px-3 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
            >
              <Truck className="h-4 w-4" />
              {t("store.syncOrders")}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.activeSuppliers")}</p>
              <p className="mt-2 text-2xl font-bold text-vytal-text">{activeSuppliers.length}</p>
            </div>
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.openOrders")}</p>
              <p className="mt-2 text-2xl font-bold text-vytal-text">{openOrders.length}</p>
            </div>
            <div className="rounded-xl border border-vytal-border bg-vytal-card p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.chinaOrders")}</p>
              <p className="mt-2 text-2xl font-bold text-vytal-text">{chineseOrders.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {suppliers.map((supplier) => {
              const supplierProducts = products.filter((product) => product.supplierId === supplier.id);
              const supplierOrders = orders.filter((order) => order.supplierId === supplier.id);
              return (
                <div key={supplier.id} className="rounded-xl border border-vytal-border bg-vytal-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-vytal-text">{supplier.name}</h3>
                        <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", supplierRegionConfig[supplier.region].color)}>
                          {supplierRegionLabelMap[supplier.region]}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-vytal-muted">{supplier.dealer}</p>
                    </div>
                    <button
                      onClick={() =>
                        handleToggleSupplierStatus(
                          supplier.id,
                          supplier.status === "active" ? "paused" : "active"
                        )
                      }
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
                        supplier.status === "active"
                          ? "bg-vytal-green/10 text-vytal-green hover:bg-vytal-green/20"
                          : "bg-vytal-bg3 text-vytal-muted hover:bg-vytal-bg2"
                      )}
                    >
                      {supplier.status === "active" ? t("store.statusActive") : t("store.statusPaused")}
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-vytal-bg2 p-3">
                      <p className="text-xs uppercase tracking-wider text-vytal-muted">{t("store.leadTime")}</p>
                      <p className="mt-1 font-semibold text-vytal-text">{supplier.leadTimeDays} {t("store.days")}</p>
                    </div>
                    <div className="rounded-lg bg-vytal-bg2 p-3">
                      <p className="text-xs uppercase tracking-wider text-vytal-muted">{t("store.minQty")}</p>
                      <p className="mt-1 font-semibold text-vytal-text">{supplier.minOrderQty}</p>
                    </div>
                    <div className="rounded-lg bg-vytal-bg2 p-3">
                      <p className="text-xs uppercase tracking-wider text-vytal-muted">{t("store.products")}</p>
                      <p className="mt-1 font-semibold text-vytal-text">{supplierProducts.length}</p>
                    </div>
                    <div className="rounded-lg bg-vytal-bg2 p-3">
                      <p className="text-xs uppercase tracking-wider text-vytal-muted">{t("store.orders")}</p>
                      <p className="mt-1 font-semibold text-vytal-text">{supplierOrders.length}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {supplier.channels.map((channel) => (
                      <span key={channel} className="inline-flex rounded-full bg-vytal-bg3 px-2 py-0.5 text-xs font-medium text-vytal-text">
                        {channel}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-vytal-muted">{supplier.website}</p>
                </div>
              );
            })}
          </div>

          <div className="overflow-x-auto rounded-xl border border-vytal-border bg-vytal-card">
            <table className="zebra-table w-full">
              <thead>
                <tr className="border-b border-vytal-border bg-vytal-bg2">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.order")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.supplier")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("table.total")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.tracking")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("table.status")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("store.eta")}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-vytal-border/50 row-interactive hover:bg-vytal-bg3/30">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-vytal-text">{order.productName}</div>
                      <div className="text-xs text-vytal-muted">{order.source} · {order.quantity}x</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-vytal-text">{supplierById.get(order.supplierId)?.name ?? t("store.unknownSupplier")}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-vytal-text">{formatCurrency(order.total)}</td>
                    <td className="px-4 py-3 text-sm text-vytal-muted">{order.tracking}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleAdvanceOrderStatus(order.id)}
                        disabled={order.status === "delivered" || order.status === "cancelled"}
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                          orderStatusConfig[order.status].color
                        )}
                      >
                        {orderStatusLabelMap[order.status]}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-vytal-muted">{order.eta}</td>
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
