"use client";

import { useState, useCallback, useMemo } from "react";
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
  Factory,
  Truck,
  Globe2,
  BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/confirm-dialog";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ProductCategory = "apparel" | "equipment" | "supplements" | "accessories";
type PaymentMethod = "cash" | "card" | "mbway" | "transfer";
type SaleStatus = "completed" | "refunded" | "pending";
type ProductFulfillment = "in_house" | "external";
type SupplierRegion = "china" | "portugal" | "europe";
type SupplierStatus = "active" | "paused";
type OrderStatus = "draft" | "sent" | "confirmed" | "in_production" | "shipped" | "delivered" | "cancelled";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: ProductCategory;
  active: boolean;
  style: string;
  color: string;
  size: string;
  branding: string;
  supplierId: string;
  fulfillment: ProductFulfillment;
  sku: string;
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

interface Supplier {
  id: string;
  name: string;
  region: SupplierRegion;
  country: string;
  dealer: string;
  website: string;
  leadTimeDays: number;
  minOrderQty: number;
  status: SupplierStatus;
  channels: string[];
}

interface MerchOrder {
  id: string;
  date: string;
  productName: string;
  supplierId: string;
  quantity: number;
  total: number;
  status: OrderStatus;
  tracking: string;
  eta: string;
  source: string;
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

const fulfillmentConfig: Record<ProductFulfillment, { color: string }> = {
  in_house: { color: "bg-vytal-blue/10 text-vytal-blue" },
  external: { color: "bg-vytal-amber/10 text-vytal-amber" },
};

const supplierRegionConfig: Record<SupplierRegion, { color: string }> = {
  china: { color: "bg-vytal-red/10 text-vytal-red" },
  portugal: { color: "bg-vytal-green/10 text-vytal-green" },
  europe: { color: "bg-vytal-blue/10 text-vytal-blue" },
};

const orderStatusConfig: Record<OrderStatus, { color: string }> = {
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

const statusConfig: Record<SaleStatus, { label: string; color: string }> = {
  completed: { label: "Completed", color: "bg-vytal-green/10 text-vytal-green" },
  refunded: { label: "Refunded", color: "bg-vytal-red/10 text-vytal-red" },
  pending: { label: "Pending", color: "bg-vytal-amber/10 text-vytal-amber" },
};

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const initialProducts: Product[] = [
  { id: "p1", name: "Aero Tee", price: 25, stock: 48, category: "apparel", active: true, style: "Relaxed fit", color: "Black", size: "S-XXL", branding: "Front chest logo", supplierId: "sup-1", fulfillment: "external", sku: "VT-AERO-TEE-BLK" },
  { id: "p2", name: "Crop Top", price: 22, stock: 35, category: "apparel", active: true, style: "Athletic crop", color: "Sand", size: "XS-L", branding: "Back print", supplierId: "sup-2", fulfillment: "external", sku: "VT-CROP-SND" },
  { id: "p3", name: "Heavy Hoodie", price: 35, stock: 20, category: "apparel", active: true, style: "Oversized hoodie", color: "Graphite", size: "S-XXL", branding: "Sleeve mark", supplierId: "sup-3", fulfillment: "external", sku: "VT-HOOD-GPH" },
  { id: "p4", name: "Training Backpack", price: 45, stock: 12, category: "accessories", active: true, style: "Daily carry", color: "Black", size: "One size", branding: "Debossed logo", supplierId: "sup-3", fulfillment: "external", sku: "VT-BACKPACK-BLK" },
  { id: "p5", name: "Gymnastics Grips", price: 18, stock: 60, category: "equipment", active: true, style: "2-hole", color: "Tan", size: "S-L", branding: "Laser mark", supplierId: "sup-4", fulfillment: "in_house", sku: "VT-GRIPS-2H" },
  { id: "p6", name: "Knee Sleeves", price: 30, stock: 42, category: "equipment", active: true, style: "5mm support", color: "Red", size: "S-XL", branding: "Heat transfer", supplierId: "sup-4", fulfillment: "in_house", sku: "VT-KNEE-5MM" },
  { id: "p7", name: "Wrist Wraps", price: 12, stock: 55, category: "equipment", active: true, style: "Competition", color: "Black", size: "One size", branding: "Printed logo", supplierId: "sup-4", fulfillment: "in_house", sku: "VT-WRIST-COMP" },
  { id: "p8", name: "Jump Rope", price: 20, stock: 30, category: "equipment", active: true, style: "Speed cable", color: "Blue", size: "Adjustable", branding: "Etched handle", supplierId: "sup-4", fulfillment: "in_house", sku: "VT-ROPE-SPD" },
  { id: "p9", name: "Athletic Tape", price: 5, stock: 120, category: "accessories", active: true, style: "Performance", color: "White", size: "Roll", branding: "Wrapped label", supplierId: "sup-3", fulfillment: "external", sku: "VT-TAPE-WHT" },
  { id: "p10", name: "Chalk Bag", price: 8, stock: 75, category: "accessories", active: true, style: "Magnetic clip", color: "Grey", size: "One size", branding: "Woven patch", supplierId: "sup-3", fulfillment: "external", sku: "VT-CHALK-GRY" },
  { id: "p11", name: "Water Bottle", price: 15, stock: 50, category: "accessories", active: true, style: "Insulated", color: "Silver", size: "750ml", branding: "Laser logo", supplierId: "sup-2", fulfillment: "external", sku: "VT-BOTTLE-750" },
  { id: "p12", name: "Protein Shaker", price: 10, stock: 65, category: "accessories", active: false, style: "Twist cap", color: "White", size: "600ml", branding: "Silk screen", supplierId: "sup-2", fulfillment: "external", sku: "VT-SHAKER-600" },
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

const initialSuppliers: Supplier[] = [
  { id: "sup-1", name: "Yiwu Textile Hub", region: "china", country: "China", dealer: "Yiwu Sportswear Co.", website: "https://yiwutextile.example", leadTimeDays: 18, minOrderQty: 50, status: "active", channels: ["Alibaba", "1688"] },
  { id: "sup-2", name: "Shenzhen Apparel Works", region: "china", country: "China", dealer: "Shenzhen Merch Dealer", website: "https://shenzhenapparel.example", leadTimeDays: 15, minOrderQty: 30, status: "active", channels: ["Alibaba", "Taobao"] },
  { id: "sup-3", name: "Porto Merch Lab", region: "portugal", country: "Portugal", dealer: "Porto Print Studio", website: "https://portomerch.example", leadTimeDays: 4, minOrderQty: 10, status: "active", channels: ["Local dealer", "CSV import"] },
  { id: "sup-4", name: "EU Athletic Supply", region: "europe", country: "Spain", dealer: "Barcelona Dealer Network", website: "https://euathletic.example", leadTimeDays: 7, minOrderQty: 20, status: "paused", channels: ["B2B portal", "API feed"] },
];

const initialOrders: MerchOrder[] = [
  { id: "o-1", date: "2026-06-25", productName: "Aero Tee", supplierId: "sup-1", quantity: 120, total: 1440, status: "in_production", tracking: "CN-7819-AV", eta: "2026-07-14", source: "Alibaba" },
  { id: "o-2", date: "2026-06-23", productName: "Crop Top", supplierId: "sup-2", quantity: 60, total: 720, status: "confirmed", tracking: "CN-6621-ZK", eta: "2026-07-09", source: "Taobao" },
  { id: "o-3", date: "2026-06-21", productName: "Training Backpack", supplierId: "sup-3", quantity: 24, total: 624, status: "shipped", tracking: "PT-3348-LX", eta: "2026-06-30", source: "Dealer portal" },
  { id: "o-4", date: "2026-06-19", productName: "Water Bottle", supplierId: "sup-2", quantity: 100, total: 900, status: "delivered", tracking: "CN-5542-QP", eta: "2026-06-27", source: "Alibaba" },
  { id: "o-5", date: "2026-06-18", productName: "Heavy Hoodie", supplierId: "sup-1", quantity: 80, total: 2400, status: "sent", tracking: "CN-9910-DR", eta: "2026-07-18", source: "1688" },
  { id: "o-6", date: "2026-06-17", productName: "Protein Shaker", supplierId: "sup-2", quantity: 70, total: 700, status: "cancelled", tracking: "CN-1188-PX", eta: "2026-07-05", source: "Taobao" },
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
  const [tab, setTab] = useState<"products" | "sales" | "suppliers">("products");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [suppliers] = useState<Supplier[]>(initialSuppliers);
  const [orders] = useState<MerchOrder[]>(initialOrders);
  const [sales] = useState<Sale[]>(initialSales);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formCategory, setFormCategory] = useState<ProductCategory>("apparel");
  const [formStyle, setFormStyle] = useState("");
  const [formColor, setFormColor] = useState("");
  const [formSize, setFormSize] = useState("");
  const [formBranding, setFormBranding] = useState("");
  const [formSupplierId, setFormSupplierId] = useState(initialSuppliers[0]?.id ?? "");
  const [formFulfillment, setFormFulfillment] = useState<ProductFulfillment>("external");

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Sales filters
  const [salesSearch, setSalesSearch] = useState("");
  const [salesStatusFilter, setSalesStatusFilter] = useState<SaleStatus | "all">("all");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const supplierById = useMemo(
    () => new Map(suppliers.map((supplier) => [supplier.id, supplier] as const)),
    [suppliers]
  );
  const fulfillmentLabelMap = {
    in_house: t("store.fulfillmentInHouse"),
    external: t("store.fulfillmentExternal"),
  } satisfies Record<ProductFulfillment, string>;
  const supplierRegionLabelMap = {
    china: t("store.regionChina"),
    portugal: t("store.regionPortugal"),
    europe: t("store.regionEurope"),
  } satisfies Record<SupplierRegion, string>;
  const orderStatusLabelMap = {
    draft: t("store.orderDraft"),
    sent: t("store.orderSent"),
    confirmed: t("store.orderConfirmed"),
    in_production: t("store.orderInProduction"),
    shipped: t("store.orderShipped"),
    delivered: t("store.orderDelivered"),
    cancelled: t("store.orderCancelled"),
  } satisfies Record<OrderStatus, string>;

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
    setFormSupplierId(initialSuppliers[0]?.id ?? "");
    setFormFulfillment("external");
    setShowForm(false);
    setEditingId(null);
  }, []);

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
    if (editingId) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                name: formName.trim(),
                price: parseFloat(formPrice) || 0,
                stock: parseInt(formStock) || 0,
                category: formCategory,
                style: formStyle.trim(),
                color: formColor.trim(),
                size: formSize.trim(),
                branding: formBranding.trim(),
                supplierId: formSupplierId,
                fulfillment: formFulfillment,
                sku: `VT-${formName.trim().replace(/\s+/g, "-").toUpperCase().slice(0, 12)}`,
              }
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
        style: formStyle.trim(),
        color: formColor.trim(),
        size: formSize.trim(),
        branding: formBranding.trim(),
        supplierId: formSupplierId,
        fulfillment: formFulfillment,
        sku: `VT-${formName.trim().replace(/\s+/g, "-").toUpperCase().slice(0, 12)}`,
      };
      setProducts((prev) => [...prev, newProduct]);
      toast(t("store.productAdded"), "success");
    }
    resetForm();
  }, [formName, formPrice, formStock, formCategory, formStyle, formColor, formSize, formBranding, formSupplierId, formFulfillment, editingId, resetForm, toast, t]);

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

  const handleSyncOrders = useCallback(() => {
    toast(t("store.ordersSynced"), "success");
  }, [toast, t]);

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
                    onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                    className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                  >
                    {(Object.keys(categoryConfig) as ProductCategory[]).map((cat) => (
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
                    onChange={(e) => setFormFulfillment(e.target.value as ProductFulfillment)}
                    className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                  >
                    {(Object.keys(fulfillmentConfig) as ProductFulfillment[]).map((mode) => (
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
                    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", supplier.status === "active" ? "bg-vytal-green/10 text-vytal-green" : "bg-vytal-bg3 text-vytal-muted")}>
                      {supplier.status === "active" ? t("store.statusActive") : t("store.statusPaused")}
                    </span>
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
                      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", orderStatusConfig[order.status].color)}>
                        {orderStatusLabelMap[order.status]}
                      </span>
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
