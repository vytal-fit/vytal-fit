"use client";

import { useState, useMemo, useEffect } from "react";
import { mockMembers, mockPlans } from "@vytal-fit/shared";
import type { MemberStatus } from "@vytal-fit/shared";
import { ArrowLeft, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/toast";

const statuses: { value: MemberStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
  { value: "trial", label: "Trial" },
];

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
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
        placeholder={placeholder}
        className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
      />
    </div>
  );
}

export default function MemberEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;
  const member = mockMembers.find((m) => m.id === id);

  const [name, setName] = useState(member?.name ?? "");
  const [email, setEmail] = useState(member?.email ?? "");
  const [phone, setPhone] = useState(member?.phone ?? "");
  const [nif, setNif] = useState(member?.nif ?? "234567890");
  const [dob, setDob] = useState(member?.dateOfBirth ?? "1993-06-15");
  const [gender, setGender] = useState<"male" | "female">(member?.gender ?? "male");
  const [emergencyContact, setEmergencyContact] = useState(member?.emergencyContact ?? "Maria Fonte - 911222333");
  const [address, setAddress] = useState("Rua das Flores, 42, Lisboa 1200-100");
  const [status, setStatus] = useState<MemberStatus>(member?.status ?? "active");
  const [planId, setPlanId] = useState(member?.planId ?? "plan-1");
  const [injuries, setInjuries] = useState("");
  const [parqNotes, setParqNotes] = useState("");
  const [medication, setMedication] = useState("");

  // Track initial values for dirty state
  const initialValues = useMemo(() => ({
    name: member?.name ?? "",
    email: member?.email ?? "",
    phone: member?.phone ?? "",
    nif: member?.nif ?? "234567890",
    dob: member?.dateOfBirth ?? "1993-06-15",
    gender: member?.gender ?? "male",
    emergencyContact: member?.emergencyContact ?? "Maria Fonte - 911222333",
    address: "Rua das Flores, 42, Lisboa 1200-100",
    status: member?.status ?? "active",
    planId: member?.planId ?? "plan-1",
    injuries: "",
    parqNotes: "",
    medication: "",
  }), [member]);

  const isDirty = useMemo(() => {
    return (
      name !== initialValues.name ||
      email !== initialValues.email ||
      phone !== initialValues.phone ||
      nif !== initialValues.nif ||
      dob !== initialValues.dob ||
      gender !== initialValues.gender ||
      emergencyContact !== initialValues.emergencyContact ||
      address !== initialValues.address ||
      status !== initialValues.status ||
      planId !== initialValues.planId ||
      injuries !== initialValues.injuries ||
      parqNotes !== initialValues.parqNotes ||
      medication !== initialValues.medication
    );
  }, [name, email, phone, nif, dob, gender, emergencyContact, address, status, planId, injuries, parqNotes, medication, initialValues]);

  // Warn on navigation with unsaved changes
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  function handleSave() {
    const plan = mockPlans.find((p) => p.id === planId);
    toast(
      `Saved ${name} - Status: ${status}, Plan: ${plan?.name ?? "N/A"}`,
      "success"
    );
  }

  function handleCancel() {
    if (isDirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmed) return;
    }
    router.push(`/members/${id}`);
  }

  if (!member) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-vytal-muted">Member not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/members/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-vytal-muted transition-colors hover:text-vytal-text"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Member
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-vytal-text">Edit Member</h1>
            {isDirty && (
              <span className="rounded-full bg-vytal-amber/10 px-2.5 py-0.5 text-xs font-semibold text-vytal-amber">
                Unsaved changes
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-vytal-muted">
            Update {member.name}&apos;s profile
          </p>
        </div>
        {/* Photo Placeholder */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-vytal-green/10 text-xl font-bold text-vytal-green">
          {member.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h2 className="mb-5 text-lg font-semibold text-vytal-text">
            Personal Information
          </h2>
          <div className="space-y-4">
            <Field label="Full Name" value={name} onChange={setName} />
            <Field label="Email" value={email} onChange={setEmail} type="email" />
            <Field label="Phone" value={phone} onChange={setPhone} />
            <Field label="NIF" value={nif} onChange={setNif} />
            <Field label="Date of Birth" value={dob} onChange={setDob} type="date" />
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Gender
              </label>
              <div className="flex gap-3">
                {(["male", "female"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={cn(
                      "flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                      gender === g
                        ? "border-vytal-green/30 bg-vytal-green/10 text-vytal-green"
                        : "border-vytal-border text-vytal-muted hover:text-vytal-text"
                    )}
                  >
                    {g === "male" ? "Male" : "Female"}
                  </button>
                ))}
              </div>
            </div>
            <Field label="Emergency Contact" value={emergencyContact} onChange={setEmergencyContact} />
            <Field label="Address" value={address} onChange={setAddress} />
          </div>
        </div>

        {/* Plan & Status */}
        <div className="space-y-6">
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <h2 className="mb-5 text-lg font-semibold text-vytal-text">
              Plan & Status
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  Plan
                </label>
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                >
                  {mockPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - {plan.price} {plan.currency}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as MemberStatus)}
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                >
                  {statuses.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Health Section */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <h2 className="mb-5 text-lg font-semibold text-vytal-text">
              Health Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  Injuries / Limitations
                </label>
                <textarea
                  value={injuries}
                  onChange={(e) => setInjuries(e.target.value)}
                  rows={3}
                  placeholder="Any known injuries or physical limitations..."
                  className="w-full resize-none rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  PAR-Q Notes
                </label>
                <textarea
                  value={parqNotes}
                  onChange={(e) => setParqNotes(e.target.value)}
                  rows={3}
                  placeholder="Physical Activity Readiness Questionnaire notes..."
                  className="w-full resize-none rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>
              <Field label="Medication" value={medication} onChange={setMedication} placeholder="Any current medication..." />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-6 py-2.5 text-sm font-medium text-vytal-muted transition-colors hover:text-vytal-text"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Save className="h-4 w-4" />
          Save
        </button>
      </div>
    </div>
  );
}
