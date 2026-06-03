"use client";

import { useState } from "react";
import { mockLocations, mockClassTypes, mockCoaches } from "@vytal-fit/shared";
import { ArrowLeft, Save, X, CheckCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";

function Field({
  label,
  value,
  onChange,
  type = "text",
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full rounded-lg border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20",
          error ? "border-vytal-red" : "border-vytal-border"
        )}
      />
      {error && (
        <p className="mt-1 text-xs text-vytal-red">This field is required</p>
      )}
    </div>
  );
}

type WaitlistMode = "none" | "unlimited" | "max";
type RegistrationRule = "before" | "after" | "custom";

export default function ClassCreatePage() {
  const { t } = useI18n();
  const router = useRouter();
  const { toast } = useToast();
  const [date, setDate] = useState("2026-06-05");
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("08:00");
  const [locationId, setLocationId] = useState(mockLocations[0].id);
  const [classTypeId, setClassTypeId] = useState(mockClassTypes[0].id);
  const [hasCapacity, setHasCapacity] = useState(true);
  const [maxCapacity, setMaxCapacity] = useState("20");
  const [selectedCoaches, setSelectedCoaches] = useState<Set<string>>(new Set(["coach-1"]));
  const [registrationRule, setRegistrationRule] = useState<RegistrationRule>("before");
  const [customMinutes, setCustomMinutes] = useState("60");
  const [waitlistMode, setWaitlistMode] = useState<WaitlistMode>("unlimited");
  const [waitlistMax, setWaitlistMax] = useState("5");
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [success, setSuccess] = useState(false);

  function toggleCoach(id: string) {
    setSelectedCoaches((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleCreate() {
    const newErrors: Record<string, boolean> = {};
    if (!date) newErrors.date = true;
    if (!startTime) newErrors.startTime = true;
    if (!endTime) newErrors.endTime = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast("Please fill in all required fields", "error");
      return;
    }

    setErrors({});
    setSuccess(true);
    toast("Class created successfully!", "success");
  }

  function handleReset() {
    setDate("2026-06-05");
    setStartTime("07:00");
    setEndTime("08:00");
    setLocationId(mockLocations[0].id);
    setClassTypeId(mockClassTypes[0].id);
    setHasCapacity(true);
    setMaxCapacity("20");
    setSelectedCoaches(new Set(["coach-1"]));
    setRegistrationRule("before");
    setCustomMinutes("60");
    setWaitlistMode("unlimited");
    setWaitlistMax("5");
    setErrors({});
    setSuccess(false);
  }

  if (success) {
    const ct = mockClassTypes.find((c) => c.id === classTypeId);
    const loc = mockLocations.find((l) => l.id === locationId);
    const coaches = mockCoaches.filter((c) => selectedCoaches.has(c.id));

    return (
      <div className="space-y-6">
        <Link
          href="/classes"
          className="inline-flex items-center gap-1.5 text-sm text-vytal-muted transition-colors hover:text-vytal-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Classes
        </Link>

        <div className="mx-auto max-w-lg rounded-xl border border-vytal-green/20 bg-vytal-green/5 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-vytal-green/10">
            <CheckCircle className="h-8 w-8 text-vytal-green" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-vytal-text">
            Class Created Successfully!
          </h2>
          <div className="mb-6 space-y-1 text-sm text-vytal-muted">
            <p>
              <span className="font-medium text-vytal-text">{ct?.name}</span> on{" "}
              <span className="font-medium text-vytal-text">{date}</span>
            </p>
            <p>
              {startTime} - {endTime} at {loc?.name}
            </p>
            {coaches.length > 0 && (
              <p>Coaches: {coaches.map((c) => c.name).join(", ")}</p>
            )}
            <p>
              Capacity: {hasCapacity ? maxCapacity : "Unlimited"}
            </p>
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
              href="/classes"
              className="rounded-lg border border-vytal-border px-6 py-2.5 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
            >
              Back to Classes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("classes.title"), href: "/classes" }, { label: t("classCreate.title") }]} />

      <div>
        <h1 className="text-2xl font-bold text-vytal-text">{t("classCreate.title")}</h1>
        <p className="mt-1 text-sm text-vytal-muted">
          {t("classCreate.subtitle")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Schedule */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h2 className="mb-5 text-lg font-semibold text-vytal-text">Schedule</h2>
          <div className="space-y-4">
            <Field label="Date" value={date} onChange={setDate} type="date" error={errors.date} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Start Time" value={startTime} onChange={setStartTime} type="time" error={errors.startTime} />
              <Field label="End Time" value={endTime} onChange={setEndTime} type="time" error={errors.endTime} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Location
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              >
                {mockLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.capacity ? `(cap. ${loc.capacity})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Class Type
              </label>
              <select
                value={classTypeId}
                onChange={(e) => setClassTypeId(e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              >
                {mockClassTypes.filter((ct) => ct.active).map((ct) => (
                  <option key={ct.id} value={ct.id}>
                    {ct.name} ({ct.abbreviation})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Capacity & Coaches */}
        <div className="space-y-6">
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <h2 className="mb-5 text-lg font-semibold text-vytal-text">Capacity</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-vytal-text">Limit capacity</span>
                <button
                  type="button"
                  onClick={() => setHasCapacity(!hasCapacity)}
                  className={cn(
                    "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                    hasCapacity ? "bg-vytal-green" : "bg-vytal-bg3"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                      hasCapacity ? "left-[22px]" : "left-0.5"
                    )}
                  />
                </button>
              </div>
              {hasCapacity && (
                <Field label="Max Capacity" value={maxCapacity} onChange={setMaxCapacity} type="number" />
              )}
            </div>
          </div>

          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <h2 className="mb-5 text-lg font-semibold text-vytal-text">Coaches</h2>
            <div className="space-y-2">
              {mockCoaches.map((coach) => (
                <label
                  key={coach.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
                    selectedCoaches.has(coach.id)
                      ? "border-vytal-green/30 bg-vytal-green/10"
                      : "border-vytal-border"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedCoaches.has(coach.id)}
                    onChange={() => toggleCoach(coach.id)}
                    className="sr-only"
                  />
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-vytal-green/10 text-xs font-bold text-vytal-green">
                    {coach.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-vytal-text">{coach.name}</p>
                    <p className="text-[10px] uppercase text-vytal-muted">{coach.role.replace("_", " ")}</p>
                  </div>
                  {selectedCoaches.has(coach.id) && (
                    <div className="h-2 w-2 rounded-full bg-vytal-green" />
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Registration Rules */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h2 className="mb-5 text-lg font-semibold text-vytal-text">Registration Rules</h2>
          <div className="space-y-4">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
              Registration Opens
            </label>
            <div className="flex gap-2">
              {([
                { value: "before", label: "Before class" },
                { value: "after", label: "After previous" },
                { value: "custom", label: "Custom time" },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRegistrationRule(opt.value)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                    registrationRule === opt.value
                      ? "border-vytal-green/30 bg-vytal-green/10 text-vytal-green"
                      : "border-vytal-border text-vytal-muted hover:text-vytal-text"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {registrationRule === "custom" && (
              <Field label="Minutes before class" value={customMinutes} onChange={setCustomMinutes} type="number" />
            )}
          </div>
        </div>

        {/* Waiting List */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h2 className="mb-5 text-lg font-semibold text-vytal-text">Waiting List</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              {([
                { value: "none", label: "None" },
                { value: "unlimited", label: "Unlimited" },
                { value: "max", label: "Max N" },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setWaitlistMode(opt.value)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                    waitlistMode === opt.value
                      ? "border-vytal-green/30 bg-vytal-green/10 text-vytal-green"
                      : "border-vytal-border text-vytal-muted hover:text-vytal-text"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {waitlistMode === "max" && (
              <Field label="Max waitlist size" value={waitlistMax} onChange={setWaitlistMax} type="number" />
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => router.push("/classes")}
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
