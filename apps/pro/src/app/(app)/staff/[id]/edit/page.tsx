"use client";

import { useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { Save, X, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { rowToCoach } from "@/lib/reference-mappers";
import { useToast } from "@/components/toast";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/skeleton";
import type { Coach } from "@vytal-fit/shared";

export default function EditCoachPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();

  // ── tRPC: coach record ──
  const coachQuery = trpc.coaches.byId.useQuery({ id });
  const coach = coachQuery.data ? rowToCoach(coachQuery.data) : undefined;

  if (coachQuery.isError) {
    if (coachQuery.error.data?.code === "NOT_FOUND") notFound();
    return (
      <EmptyState
        icon={AlertTriangle}
        title={t("ui.error")}
        description={t("staff.loadError")}
        action={{ label: t("billing.retry"), onClick: () => void coachQuery.refetch() }}
      />
    );
  }

  if (coachQuery.isPending || !coach) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-8 w-72" />
        <div className="max-w-2xl space-y-6">
          <Skeleton className="h-[280px] rounded-xl" />
          <Skeleton className="h-10 w-56 rounded-lg" />
        </div>
      </div>
    );
  }

  return <EditCoachForm coach={coach} />;
}

function EditCoachForm({ coach }: { coach: Coach }) {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useI18n();

  const utils = trpc.useUtils();
  const updateCoach = trpc.coaches.update.useMutation();

  const [form, setForm] = useState({
    name: coach.name,
    email: coach.email,
    role: coach.role,
  });
  const [dirty, setDirty] = useState(false);

  function update(key: "name" | "email" | "role", value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  function handleSave() {
    updateCoach.mutate(
      {
        id: coach.id,
        data: {
          name: form.name,
          email: form.email,
          role: form.role as Coach["role"],
        },
      },
      {
        onSuccess: () => {
          void utils.coaches.list.invalidate();
          void utils.coaches.byId.invalidate({ id: coach.id });
          toast(t("staff.coachUpdated"), "success");
          router.push(`/staff/${coach.id}`);
        },
        onError: () => toast(t("ui.error"), "error"),
      },
    );
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: t("staff.title"), href: "/staff" },
          { label: coach.name, href: `/staff/${coach.id}` },
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
            disabled={updateCoach.isPending}
            className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {t("action.save")}
          </button>
          <button
            onClick={() => router.push(`/staff/${coach.id}`)}
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
