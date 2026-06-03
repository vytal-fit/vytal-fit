"use client";

import { useState } from "react";
import { useDataStore } from "@/stores/data-store";
import { ArrowLeft, Save, X, CheckCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";

const planTypes = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "semester", label: "Semester" },
  { value: "annual", label: "Annual" },
  { value: "session_pack", label: "Session Pack" },
  { value: "day_pass", label: "Day Pass" },
  { value: "trial", label: "Trial" },
];

export default function PlanCreatePage() {
  const { t } = useI18n();
  const router = useRouter();
  const { toast } = useToast();
  const storeClassTypes = useDataStore((s) => s.classTypes);
  const storeAddPlan = useDataStore((s) => s.addPlan);
  const [name, setName] = useState("");
  const [type, setType] = useState("monthly");
  const [price, setPrice] = useState("");
  const [hasSessionLimit, setHasSessionLimit] = useState(false);
  const [maxSessions, setMaxSessions] = useState("13");
  const [selectedClassTypes, setSelectedClassTypes] = useState<Set<string>>(new Set());
  const [active, setActive] = useState(true);
  const [success, setSuccess] = useState(false);

  function toggleClassType(id: string) {
    setSelectedClassTypes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handlePriceBlur() {
    if (price) {
      const num = parseFloat(price);
      if (!isNaN(num)) {
        setPrice(num.toFixed(2));
      }
    }
  }

  function handleCreate() {
    if (!name.trim()) {
      toast("Plan name is required", "error");
      return;
    }
    if (!price) {
      toast("Price is required", "error");
      return;
    }
    storeAddPlan({
      organizationId: "org-1",
      name: name.trim(),
      type: type as import("@vytal-fit/shared").SubscriptionPlan["type"],
      price: parseFloat(price) || 0,
      currency: "EUR",
      maxSessions: hasSessionLimit ? parseInt(maxSessions) || undefined : undefined,
      allowedClassTypes: Array.from(selectedClassTypes),
      active,
    });
    setSuccess(true);
    toast("Plan created successfully!", "success");
  }

  function handleReset() {
    setName("");
    setType("monthly");
    setPrice("");
    setHasSessionLimit(false);
    setMaxSessions("13");
    setSelectedClassTypes(new Set());
    setActive(true);
    setSuccess(false);
  }

  if (success) {
    const selectedCTs = storeClassTypes.filter((ct) => selectedClassTypes.has(ct.id));
    return (
      <div className="space-y-6">
        <Link
          href="/plans"
          className="inline-flex items-center gap-1.5 text-sm text-vytal-muted transition-colors hover:text-vytal-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Plans
        </Link>

        <div className="mx-auto max-w-lg rounded-xl border border-vytal-green/20 bg-vytal-green/5 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-vytal-green/10">
            <CheckCircle className="h-8 w-8 text-vytal-green" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-vytal-text">
            Plan Created Successfully!
          </h2>
          <div className="mb-6 space-y-1 text-sm text-vytal-muted">
            <p>
              <span className="font-medium text-vytal-text">{name}</span> -{" "}
              <span className="font-medium text-vytal-text">{price} EUR</span>
            </p>
            <p>Type: {planTypes.find((pt) => pt.value === type)?.label}</p>
            {hasSessionLimit && <p>Max sessions: {maxSessions}</p>}
            <p>Status: {active ? "Active" : "Inactive"}</p>
            {selectedCTs.length > 0 && (
              <p>Class types: {selectedCTs.map((ct) => ct.name).join(", ")}</p>
            )}
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
            >
              <Plus className="h-4 w-4" />
              Create Another
            </button>
            <Link
              href="/plans"
              className="rounded-lg border border-vytal-border px-6 py-2.5 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
            >
              Back to Plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("plans.title"), href: "/plans" }, { label: t("planCreate.title") }]} />

      <div>
        <h1 className="text-2xl font-bold text-vytal-text">{t("planCreate.title")}</h1>
        <p className="mt-1 text-sm text-vytal-muted">
          {t("planCreate.subtitle")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Info */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h2 className="mb-5 text-lg font-semibold text-vytal-text">{t("planCreate.basicInfo")}</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Plan Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Livre, 13 Treinos/Mes..."
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              >
                {planTypes.map((pt) => (
                  <option key={pt.value} value={pt.value}>{pt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Price (EUR)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onBlur={handlePriceBlur}
                placeholder="0.00"
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-vytal-text">{t("planCreate.sessionLimit")}</span>
              <button
                type="button"
                onClick={() => setHasSessionLimit(!hasSessionLimit)}
                className={cn(
                  "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                  hasSessionLimit ? "bg-vytal-green" : "bg-vytal-bg3"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                    hasSessionLimit ? "left-[22px]" : "left-0.5"
                  )}
                />
              </button>
            </div>
            {hasSessionLimit && (
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  Max Sessions
                </label>
                <input
                  type="number"
                  value={maxSessions}
                  onChange={(e) => setMaxSessions(e.target.value)}
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-vytal-text">{t("planCreate.active")}</span>
              <button
                type="button"
                onClick={() => setActive(!active)}
                className={cn(
                  "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                  active ? "bg-vytal-green" : "bg-vytal-bg3"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                    active ? "left-[22px]" : "left-0.5"
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Allowed Class Types */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h2 className="mb-5 text-lg font-semibold text-vytal-text">Allowed Class Types</h2>
          <div className="space-y-2">
            {storeClassTypes.filter((ct) => ct.active).map((ct) => (
              <label
                key={ct.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
                  selectedClassTypes.has(ct.id)
                    ? "border-vytal-green/30 bg-vytal-green/10"
                    : "border-vytal-border"
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedClassTypes.has(ct.id)}
                  onChange={() => toggleClassType(ct.id)}
                  className="sr-only"
                />
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: ct.color }}
                />
                <span className="flex-1 text-sm font-medium text-vytal-text">
                  {ct.name}
                </span>
                <span className="text-xs text-vytal-muted">{ct.abbreviation}</span>
                {selectedClassTypes.has(ct.id) && (
                  <div className="h-2 w-2 rounded-full bg-vytal-green" />
                )}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => router.push("/plans")}
          className="flex items-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-6 py-2.5 text-sm font-medium text-vytal-muted transition-colors hover:text-vytal-text"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Save className="h-4 w-4" />
          Create
        </button>
      </div>
    </div>
  );
}
