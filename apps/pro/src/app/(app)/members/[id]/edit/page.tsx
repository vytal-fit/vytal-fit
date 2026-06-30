"use client";

import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { rowToMember } from "@/lib/member-mapper";
import type { MemberStatus } from "@vytal-fit/shared";
import { ArrowLeft, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/toast";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";

const statuses: { value: MemberStatus; labelKey: string }[] = [
  { value: "active", labelKey: "members.active" },
  { value: "inactive", labelKey: "members.inactive" },
  { value: "suspended", labelKey: "members.suspended" },
  { value: "trial", labelKey: "members.trial" },
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
  const { t } = useI18n();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const id = params.id as string;
  const memberQuery = trpc.members.byId.useQuery({ id });
  const member = memberQuery.data ? rowToMember(memberQuery.data) : undefined;
  const plansQuery = trpc.subscriptions.plans.list.useQuery();
  const storePlans = plansQuery.data ?? [];
  const updateMutation = trpc.members.update.useMutation({
    onSuccess: (row) => {
      utils.members.byId.setData({ id }, row);
      void utils.members.list.invalidate();
    },
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nif, setNif] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<MemberStatus>("active");
  const [planId, setPlanId] = useState("");
  const [injuries, setInjuries] = useState("");
  const [parqNotes, setParqNotes] = useState("");
  const [medication, setMedication] = useState("");

  // Hydrate the form once the member arrives from the API (and never clobber
  // the user's in-progress edits afterwards).
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (!member || hydrated) return;
    setName(member.name);
    setEmail(member.email);
    setPhone(member.phone ?? "");
    setNif(member.nif ?? "");
    setDob(member.dateOfBirth ?? "");
    setGender(member.gender ?? "male");
    setEmergencyContact(member.emergencyContact ?? "");
    setStatus(member.status);
    setPlanId(member.planId ?? "");
    setHydrated(true);
  }, [member, hydrated]);

  // Track initial values for dirty state
  const initialValues = useMemo(() => ({
    name: member?.name ?? "",
    email: member?.email ?? "",
    phone: member?.phone ?? "",
    nif: member?.nif ?? "",
    dob: member?.dateOfBirth ?? "",
    gender: member?.gender ?? "male",
    emergencyContact: member?.emergencyContact ?? "",
    address: "",
    status: member?.status ?? "active",
    planId: member?.planId ?? "",
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
    updateMutation.mutate(
      {
        id,
        data: {
          name,
          email,
          phone: phone || undefined,
          nif: nif || undefined,
          dateOfBirth: dob || undefined,
          gender,
          emergencyContact: emergencyContact || undefined,
          status,
          planId: planId || undefined,
        },
      },
      {
        onSuccess: () => {
          const plan = storePlans.find((p) => p.id === planId);
          toast(
            `Saved ${name} - Status: ${status}, Plan: ${plan?.name ?? "N/A"}`,
            "success",
          );
          router.push(`/members/${id}`);
        },
        onError: () => toast(t("ui.error"), "error"),
      },
    );
  }

  function handleCancel() {
    if (isDirty) {
      const confirmed = window.confirm(
        t("memberEdit.unsavedConfirm")
      );
      if (!confirmed) return;
    }
    router.push(`/members/${id}`);
  }

  if (memberQuery.isPending) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-vytal-muted">{t("ui.loading")}</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-vytal-muted">{t("memberEdit.memberNotFound")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("members.title"), href: "/members" }, { label: t("memberEdit.title") }]} />

      {/* Back link */}
      <Link
        href={`/members/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-vytal-muted transition-colors hover:text-vytal-text"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("memberEdit.backToMember")}
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-vytal-text">{t("memberEdit.title")}</h1>
            {isDirty && (
              <span className="rounded-full bg-vytal-amber/10 px-2.5 py-0.5 text-xs font-semibold text-vytal-amber">
                {t("memberEdit.unsavedChanges")}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("memberEdit.update")} {member.name}&apos;s profile
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
            {t("memberEdit.personalInfo")}
          </h2>
          <div className="space-y-4">
            <Field label={t("memberEdit.fullName")} value={name} onChange={setName} />
            <Field label={t("settings.email")} value={email} onChange={setEmail} type="email" />
            <Field label={t("settings.phone")} value={phone} onChange={setPhone} />
            <Field label={t("memberEdit.nif")} value={nif} onChange={setNif} />
            <Field label={t("memberEdit.dateOfBirth")} value={dob} onChange={setDob} type="date" />
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("memberEdit.gender")}
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
                    {g === "male" ? t("memberEdit.male") : t("memberEdit.female")}
                  </button>
                ))}
              </div>
            </div>
            <Field label={t("memberEdit.emergencyContact")} value={emergencyContact} onChange={setEmergencyContact} />
            <Field label={t("memberEdit.address")} value={address} onChange={setAddress} />
          </div>
        </div>

        {/* Plan & Status */}
        <div className="space-y-6">
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <h2 className="mb-5 text-lg font-semibold text-vytal-text">
              {t("memberEdit.planStatus")}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("memberEdit.plan")}
                </label>
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                >
                  {storePlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - {plan.price} {plan.currency}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("members.status")}
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as MemberStatus)}
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                >
                  {statuses.map((s) => (
                    <option key={s.value} value={s.value}>
                      {t(s.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Health Section */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <h2 className="mb-5 text-lg font-semibold text-vytal-text">
              {t("memberEdit.healthInfo")}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("memberEdit.injuries")}
                </label>
                <textarea
                  value={injuries}
                  onChange={(e) => setInjuries(e.target.value)}
                  rows={3}
                  placeholder={t("memberEdit.injuriesPlaceholder")}
                  className="w-full resize-none rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("memberEdit.parqNotes")}
                </label>
                <textarea
                  value={parqNotes}
                  onChange={(e) => setParqNotes(e.target.value)}
                  rows={3}
                  placeholder={t("memberEdit.parqNotesPlaceholder")}
                  className="w-full resize-none rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
              </div>
              <Field label={t("memberEdit.medication")} value={medication} onChange={setMedication} placeholder={t("memberEdit.medicationPlaceholder")} />
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
          {t("action.cancel")}
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Save className="h-4 w-4" />
          {t("action.save")}
        </button>
      </div>
    </div>
  );
}
