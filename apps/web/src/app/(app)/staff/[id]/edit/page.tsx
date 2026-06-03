"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, X } from "lucide-react";
import { useDataStore } from "@/stores/data-store";
import { useToast } from "@/components/toast";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";
import Link from "next/link";

export default function EditCoachPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useI18n();
  const coaches = useDataStore((s) => s.coaches);
  const updateCoach = useDataStore((s) => s.updateCoach);

  const coach = coaches.find((c) => c.id === id);

  const [form, setForm] = useState({
    name: coach?.name ?? "",
    email: coach?.email ?? "",
    role: coach?.role ?? "coach",
  });
  const [dirty, setDirty] = useState(false);

  if (!coach) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-vytal-muted">Coach não encontrado</p>
        <Link href="/staff" className="mt-4 text-sm text-vytal-green hover:underline">
          {t("staffDetail.backToStaff")}
        </Link>
      </div>
    );
  }

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  function handleSave() {
    updateCoach(id, {
      name: form.name,
      email: form.email,
      role: form.role as "head_coach" | "coach" | "assistant",
    });
    toast(t("staff.coachUpdated"), "success");
    router.push(`/staff/${id}`);
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Staff", href: "/staff" },
          { label: coach.name, href: `/staff/${id}` },
          { label: t("action.edit") },
        ]}
      />

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("action.edit")} — {coach.name}</h1>
          {dirty && (
            <span className="mt-1 inline-block rounded-full bg-vytal-amber/10 px-2 py-0.5 text-[10px] font-semibold text-vytal-amber">
              {t("memberEdit.unsavedChanges")}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-vytal-muted">
            {t("settings.generalInfo")}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("members.name")}
              </label>
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 text-sm text-vytal-text outline-none focus:border-vytal-green/40"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("members.email")}
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 text-sm text-vytal-text outline-none focus:border-vytal-green/40"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("staff.role")}
              </label>
              <select
                value={form.role}
                onChange={(e) => update("role", e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 text-sm text-vytal-text outline-none focus:border-vytal-green/40"
              >
                <option value="head_coach">{t("staff.headCoach")}</option>
                <option value="coach">{t("staff.coach")}</option>
                <option value="assistant">{t("staff.assistant")}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
          >
            <Save className="h-4 w-4" />
            {t("action.save")}
          </button>
          <button
            onClick={() => router.push(`/staff/${id}`)}
            className="flex items-center gap-2 rounded-lg border border-vytal-border px-6 py-2.5 text-sm font-medium text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
          >
            <X className="h-4 w-4" />
            {t("action.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
