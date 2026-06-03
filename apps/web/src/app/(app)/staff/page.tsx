"use client";

import { useState } from "react";
import { useDataStore } from "@/stores/data-store";
import type { Coach } from "@vytal-fit/shared";
import { Users, Plus, Calendar, TrendingUp, Trash2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";

const roleBadgeConfig: Record<Coach["role"], { labelKey: string; className: string }> = {
  head_coach: { labelKey: "staff.headCoach", className: "bg-vytal-green/10 text-vytal-green" },
  coach: { labelKey: "staff.coach", className: "bg-vytal-blue/10 text-vytal-blue" },
  assistant: { labelKey: "staff.assistant", className: "bg-vytal-amber/10 text-vytal-amber" },
};

function RoleBadge({ role }: { role: Coach["role"] }) {
  const { t } = useI18n();
  const c = roleBadgeConfig[role];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${c.className}`}>
      {t(c.labelKey)}
    </span>
  );
}

const coachSpecialties: Record<string, string[]> = {
  "coach-1": ["CrossFit L3", "Weightlifting", "Nutrition"],
  "coach-2": ["CrossFit L2", "Gymnastics", "Mobility"],
  "coach-3": ["CrossFit L2", "Endurance", "Kids"],
  "coach-4": ["CrossFit L1", "First Aid"],
};

const coachAvgAttendance: Record<string, number> = {
  "coach-1": 87, "coach-2": 82, "coach-3": 78, "coach-4": 91,
};

function CoachCard({ coach, onDelete }: { coach: Coach; onDelete: (id: string, name: string) => void }) {
  const storeClasses = useDataStore((s) => s.classes);
  const { t } = useI18n();
  const initials = coach.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  const weeklyClasses = storeClasses.filter((c) => c.coachIds.includes(coach.id)).length;
  const avgAttendance = coachAvgAttendance[coach.id] ?? 0;
  const specialties = coachSpecialties[coach.id] ?? [];
  const roleConfig = roleBadgeConfig[coach.role];

  return (
    <div className="group relative rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]">
      {/* Delete button */}
      <button
        onClick={(e) => { e.preventDefault(); onDelete(coach.id, coach.name); }}
        className="absolute right-3 top-3 rounded-lg p-1.5 text-vytal-muted opacity-0 transition-all hover:bg-vytal-red/10 hover:text-vytal-red group-hover:opacity-100"
        title="Delete"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      <Link href={`/staff/${coach.id}`} className="block">
        <div className="flex items-start gap-4">
          <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold", roleConfig.className)}>
            {initials}
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-sm font-semibold text-vytal-text transition-colors group-hover:text-vytal-green">{coach.name}</span>
            <span className="text-xs text-vytal-muted">{coach.email}</span>
            <div className="mt-1"><RoleBadge role={coach.role} /></div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 border-t border-vytal-border pt-3">
          <div className="flex items-center gap-1.5 text-xs text-vytal-muted">
            <Calendar className="h-3 w-3" />
            <span><span className="font-semibold text-vytal-text">{weeklyClasses}</span> {t("staff.classesPerWeek")}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-vytal-muted">
            <TrendingUp className="h-3 w-3" />
            <span>
              <span className={cn("font-semibold", avgAttendance >= 85 ? "text-vytal-green" : avgAttendance >= 70 ? "text-vytal-amber" : "text-vytal-red")}>
                {avgAttendance}%
              </span> {t("staff.avgAttendance")}
            </span>
          </div>
        </div>

        {specialties.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {specialties.map((spec) => (
              <span key={spec} className="rounded-full bg-vytal-bg3 px-2 py-0.5 text-[10px] font-medium text-vytal-muted">{spec}</span>
            ))}
          </div>
        )}
      </Link>
    </div>
  );
}

export default function StaffPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const storeCoaches = useDataStore((s) => s.coaches);
  const addCoach = useDataStore((s) => s.addCoach);
  const deleteCoach = useDataStore((s) => s.deleteCoach);

  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState<Coach["role"]>("coach");

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const headCoaches = storeCoaches.filter((c) => c.role === "head_coach").length;
  const coachCount = storeCoaches.filter((c) => c.role === "coach").length;
  const assistants = storeCoaches.filter((c) => c.role === "assistant").length;

  function handleAdd() {
    if (!addName.trim()) { toast("Name is required", "error"); return; }
    if (!addEmail.trim()) { toast("Email is required", "error"); return; }
    addCoach({
      organizationId: "org-1",
      name: addName.trim(),
      email: addEmail.trim(),
      role: addRole,
    });
    toast("Coach added", "success");
    setAddName(""); setAddEmail(""); setAddRole("coach");
    setShowAddForm(false);
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteCoach(deleteTarget.id);
    toast("Coach deleted", "success");
    setDeleteTarget(null);
  }

  const inputClass =
    "w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("staff.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">{t("staff.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAddForm ? t("action.cancel") : t("staff.addCoach")}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="rounded-xl border border-vytal-green/20 bg-vytal-green/5 p-5">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("staff.addCoach")}</h3>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[180px]">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">Name</label>
              <input type="text" value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Full name" className={inputClass} />
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">Email</label>
              <input type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="coach@gym.com" className={inputClass} />
            </div>
            <div className="w-40">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">Role</label>
              <select value={addRole} onChange={(e) => setAddRole(e.target.value as Coach["role"])} className={inputClass}>
                <option value="head_coach">Head Coach</option>
                <option value="coach">Coach</option>
                <option value="assistant">Assistant</option>
              </select>
            </div>
            <button onClick={handleAdd} className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2 text-sm font-semibold text-vytal-bg hover:bg-vytal-green/90">
              <Check className="h-4 w-4" /> {t("action.save")}
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex items-center gap-3 rounded-lg border border-vytal-border bg-vytal-card px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vytal-blue/10"><Users className="h-4 w-4 text-vytal-blue" /></div>
          <div><p className="text-lg font-bold text-vytal-text">{storeCoaches.length}</p><p className="text-xs text-vytal-muted">{t("staff.totalStaff")}</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-vytal-border bg-vytal-card px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vytal-green/10"><Users className="h-4 w-4 text-vytal-green" /></div>
          <div><p className="text-lg font-bold text-vytal-text">{headCoaches}</p><p className="text-xs text-vytal-muted">{t("staff.headCoaches")}</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-vytal-border bg-vytal-card px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vytal-blue/10"><Users className="h-4 w-4 text-vytal-blue" /></div>
          <div><p className="text-lg font-bold text-vytal-text">{coachCount}</p><p className="text-xs text-vytal-muted">{t("staff.coaches")}</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-vytal-border bg-vytal-card px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vytal-amber/10"><Users className="h-4 w-4 text-vytal-amber" /></div>
          <div><p className="text-lg font-bold text-vytal-text">{assistants}</p><p className="text-xs text-vytal-muted">{t("staff.assistants")}</p></div>
        </div>
      </div>

      {/* Coach Grid */}
      {storeCoaches.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {storeCoaches.map((coach) => (
            <CoachCard key={coach.id} coach={coach} onDelete={(id, name) => setDeleteTarget({ id, name })} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Users} title={t("staff.noStaff")} description={t("staff.noStaffDesc")} />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Coach"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel={t("action.delete")}
        cancelLabel={t("action.cancel")}
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
