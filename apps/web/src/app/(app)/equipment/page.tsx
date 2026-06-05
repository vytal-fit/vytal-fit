"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Wrench,
  Plus,
  AlertTriangle,
  CheckCircle,
  X,
  Calendar,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Condition = "excellent" | "good" | "fair" | "poor";

interface Equipment {
  id: string;
  name: string;
  category: string;
  quantity: number;
  condition: Condition;
  lastMaintenance: string;
  nextMaintenance: string;
}

interface MaintenanceLog {
  id: string;
  date: string;
  equipment: string;
  action: string;
  cost: number;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const initialEquipment: Equipment[] = [
  { id: "eq-1", name: "Olympic Barbells", category: "Weightlifting", quantity: 10, condition: "good", lastMaintenance: "2026-05-01", nextMaintenance: "2026-08-01" },
  { id: "eq-2", name: "Bumper Plates (kg)", category: "Weightlifting", quantity: 200, condition: "good", lastMaintenance: "2026-04-15", nextMaintenance: "2026-10-15" },
  { id: "eq-3", name: "Concept2 Rowers", category: "Cardio", quantity: 6, condition: "excellent", lastMaintenance: "2026-05-20", nextMaintenance: "2026-08-20" },
  { id: "eq-4", name: "Assault Bikes", category: "Cardio", quantity: 4, condition: "fair", lastMaintenance: "2026-03-10", nextMaintenance: "2026-06-10" },
  { id: "eq-5", name: "Plyo Boxes", category: "Gymnastics", quantity: 12, condition: "good", lastMaintenance: "2026-04-01", nextMaintenance: "2026-10-01" },
  { id: "eq-6", name: "Kettlebells", category: "Weightlifting", quantity: 20, condition: "good", lastMaintenance: "2026-05-10", nextMaintenance: "2026-11-10" },
  { id: "eq-7", name: "Pull-Up Bars", category: "Gymnastics", quantity: 8, condition: "excellent", lastMaintenance: "2026-05-15", nextMaintenance: "2026-11-15" },
  { id: "eq-8", name: "Gymnastic Rings", category: "Gymnastics", quantity: 6, condition: "good", lastMaintenance: "2026-04-20", nextMaintenance: "2026-10-20" },
  { id: "eq-9", name: "Climbing Ropes", category: "Gymnastics", quantity: 4, condition: "fair", lastMaintenance: "2026-02-15", nextMaintenance: "2026-06-15" },
  { id: "eq-10", name: "Dumbbells (pairs)", category: "Weightlifting", quantity: 40, condition: "excellent", lastMaintenance: "2026-05-25", nextMaintenance: "2026-11-25" },
  { id: "eq-11", name: "Sleds", category: "Conditioning", quantity: 2, condition: "good", lastMaintenance: "2026-04-05", nextMaintenance: "2026-10-05" },
  { id: "eq-12", name: "Medicine Balls", category: "Conditioning", quantity: 15, condition: "good", lastMaintenance: "2026-03-20", nextMaintenance: "2026-09-20" },
  { id: "eq-13", name: "Foam Rollers", category: "Recovery", quantity: 10, condition: "poor", lastMaintenance: "2025-12-01", nextMaintenance: "2026-06-01" },
  { id: "eq-14", name: "Resistance Bands", category: "Accessories", quantity: 30, condition: "good", lastMaintenance: "2026-05-05", nextMaintenance: "2026-11-05" },
  { id: "eq-15", name: "Jump Ropes", category: "Cardio", quantity: 20, condition: "fair", lastMaintenance: "2026-03-01", nextMaintenance: "2026-06-30" },
];

const maintenanceLogs: MaintenanceLog[] = [
  { id: "ml-1", date: "2026-05-25", equipment: "Dumbbells (pairs)", action: "Deep clean and re-rack organization", cost: 0 },
  { id: "ml-2", date: "2026-05-20", equipment: "Concept2 Rowers", action: "Chain lubrication and monitor calibration", cost: 45 },
  { id: "ml-3", date: "2026-05-15", equipment: "Pull-Up Bars", action: "Bolt tightening and rust treatment", cost: 25 },
  { id: "ml-4", date: "2026-05-10", equipment: "Kettlebells", action: "Handle inspection and chip repair", cost: 30 },
  { id: "ml-5", date: "2026-05-01", equipment: "Olympic Barbells", action: "Bearing lubrication and sleeve cleaning", cost: 60 },
];

const conditionConfig: Record<Condition, { label: string; color: string; bg: string }> = {
  excellent: { label: "Excellent", color: "text-vytal-green", bg: "bg-vytal-green/10" },
  good: { label: "Good", color: "text-vytal-blue", bg: "bg-vytal-blue/10" },
  fair: { label: "Fair", color: "text-vytal-amber", bg: "bg-vytal-amber/10" },
  poor: { label: "Poor", color: "text-vytal-red", bg: "bg-vytal-red/10" },
};

const categories = ["All", "Weightlifting", "Cardio", "Gymnastics", "Conditioning", "Recovery", "Accessories"];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function EquipmentInventoryPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [equipment, setEquipment] = useState<Equipment[]>(initialEquipment);
  const [filterCategory, setFilterCategory] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Weightlifting");
  const [newQuantity, setNewQuantity] = useState("");
  const [newCondition, setNewCondition] = useState<Condition>("good");
  const [newPurchaseDate, setNewPurchaseDate] = useState("");
  const [newNextMaintenance, setNewNextMaintenance] = useState("");

  // Stats
  const totalItems = useMemo(() => equipment.reduce((sum, e) => sum + e.quantity, 0), [equipment]);
  const needMaintenance = useMemo(() => {
    const now = new Date();
    return equipment.filter((e) => new Date(e.nextMaintenance) <= now).length;
  }, [equipment]);
  const poorCondition = useMemo(() => equipment.filter((e) => e.condition === "poor").length, [equipment]);

  // Filter
  const filteredEquipment = useMemo(() => {
    if (filterCategory === "All") return equipment;
    return equipment.filter((e) => e.category === filterCategory);
  }, [equipment, filterCategory]);

  // Add equipment
  const handleAdd = useCallback(() => {
    if (!newName.trim() || !newQuantity) return;
    const item: Equipment = {
      id: `eq-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      quantity: parseInt(newQuantity) || 1,
      condition: newCondition,
      lastMaintenance: newPurchaseDate || new Date().toISOString().split("T")[0],
      nextMaintenance: newNextMaintenance || "",
    };
    setEquipment((prev) => [...prev, item]);
    setNewName("");
    setNewCategory("Weightlifting");
    setNewQuantity("");
    setNewCondition("good");
    setNewPurchaseDate("");
    setNewNextMaintenance("");
    setShowAddForm(false);
    toast(t("equipment.added"), "success");
  }, [newName, newCategory, newQuantity, newCondition, newPurchaseDate, newNextMaintenance, toast, t]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("equipment.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {equipment.length} {t("equipment.types")}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-medium text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Plus className="h-4 w-4" />
          {t("equipment.addEquipment")}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t("equipment.totalItems"), value: totalItems, color: "text-vytal-text", icon: CheckCircle },
          { label: t("equipment.needMaintenance"), value: needMaintenance, color: "text-vytal-amber", icon: Wrench },
          { label: t("equipment.poorCondition"), value: poorCondition, color: "text-vytal-red", icon: AlertTriangle },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-vytal-border bg-vytal-bg2 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-vytal-muted">{stat.label}</p>
              <stat.icon className={cn("h-4 w-4", stat.color)} />
            </div>
            <p className={cn("mt-1 text-2xl font-bold", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              filterCategory === cat
                ? "bg-vytal-green/10 text-vytal-green border border-vytal-green/30"
                : "bg-vytal-bg2 text-vytal-muted border border-vytal-border hover:text-vytal-text"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="rounded-xl border border-vytal-green/30 bg-vytal-bg2 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-vytal-text">{t("equipment.addEquipment")}</h3>
            <button onClick={() => setShowAddForm(false)} className="text-vytal-muted hover:text-vytal-text">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("equipment.name")}</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                placeholder="e.g. Wall Balls"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("equipment.category")}</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              >
                {categories.filter((c) => c !== "All").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("equipment.quantity")}</label>
              <input
                type="number"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                placeholder="1"
                min="1"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("equipment.condition")}</label>
              <select
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value as Condition)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("equipment.purchaseDate")}</label>
              <input
                type="date"
                value={newPurchaseDate}
                onChange={(e) => setNewPurchaseDate(e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("equipment.nextMaintenance")}</label>
              <input
                type="date"
                value={newNextMaintenance}
                onChange={(e) => setNewNextMaintenance(e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAdd}
              className="rounded-lg bg-vytal-green px-4 py-2 text-sm font-medium text-vytal-bg transition-colors hover:bg-vytal-green/90"
            >
              {t("equipment.save")}
            </button>
          </div>
        </div>
      )}

      {/* Equipment Table */}
      <div className="overflow-hidden rounded-xl border border-vytal-border bg-vytal-bg2">
        <table className="w-full">
          <thead>
            <tr className="border-b border-vytal-border bg-vytal-bg3">
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-vytal-muted">{t("equipment.name")}</th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-vytal-muted">{t("equipment.category")}</th>
              <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-vytal-muted">{t("equipment.qty")}</th>
              <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-vytal-muted">{t("equipment.condition")}</th>
              <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-vytal-muted">{t("equipment.lastMaint")}</th>
              <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-vytal-muted">{t("equipment.nextMaint")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredEquipment.map((eq) => {
              const cond = conditionConfig[eq.condition];
              const isOverdue = new Date(eq.nextMaintenance) <= new Date();
              return (
                <tr key={eq.id} className="border-b border-vytal-border/50 last:border-0 hover:bg-vytal-bg3/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-vytal-text">{eq.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-vytal-muted">{eq.category}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-semibold text-vytal-text">{eq.quantity}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-semibold", cond.bg, cond.color)}>
                      {cond.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs text-vytal-muted">{eq.lastMaintenance}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("text-xs", isOverdue ? "text-vytal-red font-semibold" : "text-vytal-muted")}>
                      {eq.nextMaintenance}
                      {isOverdue && " (overdue)"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Maintenance Log */}
      <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-5">
        <h2 className="mb-4 text-base font-semibold text-vytal-text">{t("equipment.maintenanceLog")}</h2>
        <div className="space-y-3">
          {maintenanceLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-center gap-4 rounded-lg bg-vytal-bg3 p-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-vytal-green/10">
                <Wrench className="h-4 w-4 text-vytal-green" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-vytal-text">{log.equipment}</p>
                <p className="text-xs text-vytal-muted">{log.action}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs text-vytal-muted">
                  <Calendar className="h-3 w-3" />
                  {log.date}
                </div>
                {log.cost > 0 && (
                  <div className="flex items-center gap-1 text-xs text-vytal-amber">
                    <DollarSign className="h-3 w-3" />
                    {log.cost}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
