"use client";

import { useState } from "react";
import { mockClassTypes } from "@vytal-fit/shared";
import { ArrowLeft, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState("monthly");
  const [price, setPrice] = useState("");
  const [hasSessionLimit, setHasSessionLimit] = useState(false);
  const [maxSessions, setMaxSessions] = useState("13");
  const [selectedClassTypes, setSelectedClassTypes] = useState<Set<string>>(new Set());
  const [active, setActive] = useState(true);

  function toggleClassType(id: string) {
    setSelectedClassTypes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <Link
        href="/plans"
        className="inline-flex items-center gap-1.5 text-sm text-vytal-muted transition-colors hover:text-vytal-text"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Plans
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-vytal-text">Create Plan</h1>
        <p className="mt-1 text-sm text-vytal-muted">
          Define a new subscription plan
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Info */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h2 className="mb-5 text-lg font-semibold text-vytal-text">Basic Information</h2>
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
                placeholder="0.00"
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-vytal-text">Session Limit</span>
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
              <span className="text-sm text-vytal-text">Active</span>
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
            {mockClassTypes.filter((ct) => ct.active).map((ct) => (
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
        <button className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90">
          <Save className="h-4 w-4" />
          Create
        </button>
      </div>
    </div>
  );
}
