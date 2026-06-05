"use client";

import { useState } from "react";
import { useDataStore } from "@/stores/data-store";
import { Plus, Dumbbell, Pencil, Trash2, X, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";

const defaultColors = [
  "#22c55e", "#3b82f6", "#eab308", "#ef4444", "#8b5cf6",
  "#f97316", "#06b6d4", "#ec4899", "#14b8a6", "#6366f1",
];

export default function ClassTypesPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const classTypes = useDataStore((s) => s.classTypes);
  const addClassType = useDataStore((s) => s.addClassType);
  const updateClassType = useDataStore((s) => s.updateClassType);
  const deleteClassType = useDataStore((s) => s.deleteClassType);

  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState("");
  const [addAbbr, setAddAbbr] = useState("");
  const [addColor, setAddColor] = useState(defaultColors[0]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editAbbr, setEditAbbr] = useState("");
  const [editColor, setEditColor] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  function handleAdd() {
    if (!addName.trim()) {
      toast(t("classTypes.nameRequired"), "error");
      return;
    }
    addClassType({
      organizationId: "org-1",
      name: addName.trim(),
      abbreviation: addAbbr.trim() || addName.trim().slice(0, 3).toUpperCase(),
      color: addColor,
      active: true,
    });
    toast(t("classTypes.classTypeAdded"), "success");
    setAddName("");
    setAddAbbr("");
    setAddColor(defaultColors[0]);
    setShowAddForm(false);
  }

  function startEdit(ct: { id: string; name: string; abbreviation: string; color: string }) {
    setEditingId(ct.id);
    setEditName(ct.name);
    setEditAbbr(ct.abbreviation);
    setEditColor(ct.color);
  }

  function handleSaveEdit() {
    if (!editingId || !editName.trim()) return;
    updateClassType(editingId, {
      name: editName.trim(),
      abbreviation: editAbbr.trim(),
      color: editColor,
    });
    toast(t("classTypes.classTypeUpdated"), "success");
    setEditingId(null);
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    const removed = classTypes.find((ct) => ct.id === deleteTarget.id);
    deleteClassType(deleteTarget.id);
    toast(t("classTypes.classTypeDeleted"), "success", {
      action: removed
        ? {
            label: t("action.undo"),
            onClick: () => addClassType({ organizationId: removed.organizationId, name: removed.name, abbreviation: removed.abbreviation, color: removed.color, active: removed.active }),
          }
        : undefined,
    });
    setDeleteTarget(null);
  }

  const inputClass =
    "w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("classTypes.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("classTypes.subtitle")}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAddForm ? t("action.cancel") : t("classTypes.addClassType")}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="rounded-xl border border-vytal-green/20 bg-vytal-green/5 p-5">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("classTypes.addClassType")}</h3>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[180px]">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("classTypes.name")}</label>
              <input type="text" value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="e.g. CrossFit" className={inputClass} onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
            </div>
            <div className="w-28">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("classTypes.abbreviation")}</label>
              <input type="text" value={addAbbr} onChange={(e) => setAddAbbr(e.target.value)} placeholder="CF" className={inputClass} onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
            </div>
            <div className="w-auto">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("classTypes.color")}</label>
              <div className="flex items-center gap-1.5">
                {defaultColors.map((c) => (
                  <button key={c} type="button" onClick={() => setAddColor(c)} className={`h-7 w-7 rounded-full border-2 transition-all ${addColor === c ? "border-white scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <button onClick={handleAdd} className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90">
              <Check className="h-4 w-4" />
              {t("action.save")}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {classTypes.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title={t("classTypes.noClassTypes")}
          description={t("classTypes.noClassTypesDesc")}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-vytal-border">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-vytal-border bg-vytal-bg2">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("table.color")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("table.name")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("table.abbreviation")}</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted sm:table-cell">{t("table.icon")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("table.status")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vytal-border">
              {classTypes.map((ct) => (
                <tr key={ct.id} className="bg-vytal-card transition-colors hover:bg-vytal-bg3">
                  {editingId === ct.id ? (
                    <>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {defaultColors.map((c) => (
                            <button key={c} type="button" onClick={() => setEditColor(c)} className={`h-5 w-5 rounded-full border-2 transition-all ${editColor === c ? "border-white scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} autoFocus onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()} />
                      </td>
                      <td className="px-4 py-3">
                        <input type="text" value={editAbbr} onChange={(e) => setEditAbbr(e.target.value)} className={inputClass} onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()} />
                      </td>
                      <td className="hidden sm:table-cell" />
                      <td />
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={handleSaveEdit} className="inline-flex items-center gap-1.5 rounded-lg bg-vytal-green px-3 py-1.5 text-xs font-semibold text-vytal-bg hover:bg-vytal-green/90">
                            <Check className="h-3 w-3" /> {t("action.save")}
                          </button>
                          <button onClick={() => setEditingId(null)} className="inline-flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs text-vytal-text hover:bg-vytal-bg3">
                            <X className="h-3 w-3" /> {t("action.cancel")}
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">
                        <div className="h-4 w-4 rounded-full border border-vytal-border" style={{ backgroundColor: ct.color }} />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-vytal-text">{ct.name}</td>
                      <td className="px-4 py-3 font-mono text-sm text-vytal-muted">{ct.abbreviation}</td>
                      <td className="hidden px-4 py-3 text-sm text-vytal-muted sm:table-cell">{ct.icon || "--"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            onClick={() => {
                              updateClassType(ct.id, { active: !ct.active });
                              toast(ct.active ? t("classTypes.classTypeDeactivated") : t("classTypes.classTypeActivated"), "success");
                            }}
                            className={`relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors ${ct.active ? "bg-vytal-green" : "bg-vytal-bg3"}`}
                          >
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${ct.active ? "translate-x-4" : "translate-x-0.5"}`} />
                          </div>
                          <span className={`text-xs ${ct.active ? "text-vytal-green" : "text-vytal-muted"}`}>
                            {ct.active ? t("status.active") : t("status.inactive")}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => startEdit(ct)} className="inline-flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs text-vytal-text hover:bg-vytal-bg3">
                            <Pencil className="h-3 w-3" /> {t("action.edit")}
                          </button>
                          <button onClick={() => setDeleteTarget({ id: ct.id, name: ct.name })} className="inline-flex items-center gap-1.5 rounded-lg border border-vytal-red/20 bg-vytal-red/5 px-3 py-1.5 text-xs text-vytal-red hover:bg-vytal-red/10">
                            <Trash2 className="h-3 w-3" /> {t("action.delete")}
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={t("action.delete")}
        description={t("classTypes.confirmDelete").replace("{name}", deleteTarget?.name ?? "")}
        confirmLabel={t("action.delete")}
        cancelLabel={t("action.cancel")}
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
