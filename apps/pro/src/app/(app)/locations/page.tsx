"use client";

import { useState } from "react";
import { Plus, MapPin, Pencil, Trash2, X, Check, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { rowsToLocations } from "@/lib/reference-mappers";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/skeleton";

export default function LocationsPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  // ── tRPC: locations (small reference data, no pagination) ──
  const utils = trpc.useUtils();
  const listQuery = trpc.locations.list.useQuery();
  const locations = rowsToLocations(listQuery.data ?? []);
  const createLocation = trpc.locations.create.useMutation();
  const updateLocation = trpc.locations.update.useMutation();
  const deleteLocation = trpc.locations.delete.useMutation();

  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState("");
  const [addCapacity, setAddCapacity] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCapacity, setEditCapacity] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  function handleAdd() {
    if (!addName.trim()) {
      toast(t("locations.nameRequired"), "error");
      return;
    }
    createLocation.mutate(
      {
        name: addName.trim(),
        capacity: addCapacity ? parseInt(addCapacity) : undefined,
      },
      {
        onSuccess: () => {
          void utils.locations.list.invalidate();
          toast(t("locations.locationAdded"), "success");
          setAddName("");
          setAddCapacity("");
          setShowAddForm(false);
        },
        onError: () => toast(t("ui.error"), "error"),
      },
    );
  }

  function startEdit(loc: { id: string; name: string; capacity?: number }) {
    setEditingId(loc.id);
    setEditName(loc.name);
    setEditCapacity(loc.capacity?.toString() ?? "");
  }

  function handleSaveEdit() {
    if (!editingId || !editName.trim()) return;
    updateLocation.mutate(
      {
        id: editingId,
        data: {
          name: editName.trim(),
          capacity: editCapacity ? parseInt(editCapacity) : undefined,
        },
      },
      {
        onSuccess: () => {
          void utils.locations.list.invalidate();
          toast(t("locations.locationUpdated"), "success");
          setEditingId(null);
        },
        onError: () => toast(t("ui.error"), "error"),
      },
    );
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    const removed = locations.find((l) => l.id === deleteTarget.id);
    deleteLocation.mutate(
      { id: deleteTarget.id },
      {
        onSuccess: () => {
          void utils.locations.list.invalidate();
          toast(t("locations.locationDeleted"), "success", {
            action: removed
              ? {
                  label: t("action.undo"),
                  onClick: () =>
                    createLocation.mutate(
                      { name: removed.name, capacity: removed.capacity },
                      { onSuccess: () => void utils.locations.list.invalidate() },
                    ),
                }
              : undefined,
          });
        },
        onError: (err) =>
          toast(
            err.data?.code === "CONFLICT" ? t("locations.deleteInUse") : t("ui.error"),
            "error",
          ),
      },
    );
    setDeleteTarget(null);
  }

  const inputClass =
    "w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("locations.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("locations.subtitle")}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAddForm ? t("action.cancel") : t("locations.addLocation")}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="rounded-xl border border-vytal-green/20 bg-vytal-green/5 p-5">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("locations.addLocation")}</h3>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("locations.name")}
              </label>
              <input
                type="text"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="e.g. Main Box"
                className={inputClass}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <div className="w-32">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("locations.capacity")}
              </label>
              <input
                type="number"
                value={addCapacity}
                onChange={(e) => setAddCapacity(e.target.value)}
                placeholder="e.g. 20"
                className={inputClass}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={createLocation.isPending}
              className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {t("action.save")}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {listQuery.isError ? (
        <EmptyState
          icon={AlertTriangle}
          title={t("ui.error")}
          description={t("locations.loadError")}
          action={{ label: t("billing.retry"), onClick: () => void listQuery.refetch() }}
        />
      ) : listQuery.isPending ? (
        <>
          <Skeleton className="h-[58px] rounded-lg" />
          <div className="space-y-2 rounded-xl border border-vytal-border bg-vytal-card p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Stats */}
          <div className="flex items-center gap-3 rounded-lg border border-vytal-border bg-vytal-card px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vytal-blue/10">
              <MapPin className="h-4 w-4 text-vytal-blue" />
            </div>
            <div>
              <p className="text-lg font-bold text-vytal-text">
                {locations.length}
              </p>
              <p className="text-xs text-vytal-muted">{t("locations.totalLocations")}</p>
            </div>
          </div>

          {locations.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title={t("locations.noLocations")}
              description={t("locations.noLocationsDesc")}
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-vytal-border">
              <table className="w-full min-w-[400px]">
                <thead>
                  <tr className="border-b border-vytal-border bg-vytal-bg2">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                      {t("locations.name")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                      {t("locations.capacity")}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">
                      {t("locations.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vytal-border">
                  {locations.map((loc) => (
                    <tr
                      key={loc.id}
                      className="bg-vytal-card row-interactive transition-colors hover:bg-vytal-bg3"
                    >
                      {editingId === loc.id ? (
                        <>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className={inputClass}
                              onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                              autoFocus
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={editCapacity}
                              onChange={(e) => setEditCapacity(e.target.value)}
                              className={inputClass}
                              onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={handleSaveEdit}
                                disabled={updateLocation.isPending}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-vytal-green px-3 py-1.5 text-xs font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Check className="h-3 w-3" />
                                {t("action.save")}
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs text-vytal-text transition-colors hover:bg-vytal-bg3"
                              >
                                <X className="h-3 w-3" />
                                {t("action.cancel")}
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-vytal-green" />
                              <span className="text-sm font-medium text-vytal-text">
                                {loc.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm text-vytal-muted">
                              {loc.capacity ?? "--"} pax
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => startEdit(loc)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs text-vytal-text transition-colors hover:bg-vytal-bg3"
                              >
                                <Pencil className="h-3 w-3" />
                                {t("action.edit")}
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ id: loc.id, name: loc.name })}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-vytal-red/20 bg-vytal-red/5 px-3 py-1.5 text-xs text-vytal-red transition-colors hover:bg-vytal-red/10"
                              >
                                <Trash2 className="h-3 w-3" />
                                {t("action.delete")}
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
        </>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={t("action.delete")}
        description={`${t("locations.confirmDelete")} "${deleteTarget?.name}"?`}
        confirmLabel={t("action.delete")}
        cancelLabel={t("action.cancel")}
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
