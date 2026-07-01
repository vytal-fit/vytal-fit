"use client";

import { useState } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { trpc } from "@/lib/trpc";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  Check,
} from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface GroupMember {
  id: string;
  name: string;
  email: string;
}

interface MemberGroup {
  id: string;
  name: string;
  description: string;
  color: string;
  members: GroupMember[];
}

const colorOptions = [
  "#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#ef4444", "#14b8a6", "#6b7280",
];

export default function GroupsPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const utils = trpc.useUtils();
  const groupsQuery = trpc.memberGroups.list.useQuery();
  const groups: MemberGroup[] = groupsQuery.data ?? [];

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newColor, setNewColor] = useState(colorOptions[0]);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [editingGroup, setEditingGroup] = useState<MemberGroup | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editColor, setEditColor] = useState(colorOptions[0]);

  const onError = (error: { data?: { code?: string } | null }) =>
    toast(error.data?.code === "FORBIDDEN" ? t("settings.adminOnly") : t("ui.error"), "error");

  const createGroup = trpc.memberGroups.create.useMutation({
    onSuccess: () => {
      void utils.memberGroups.list.invalidate();
      setNewName("");
      setNewDescription("");
      setNewColor(colorOptions[0]);
      setShowCreateForm(false);
      toast(t("groups.created"), "success");
    },
    onError,
  });

  const updateGroup = trpc.memberGroups.update.useMutation({
    onSuccess: () => {
      void utils.memberGroups.list.invalidate();
      setEditingGroup(null);
      toast(t("groups.updated"), "success");
    },
    onError,
  });

  const deleteGroup = trpc.memberGroups.delete.useMutation({
    onSuccess: () => {
      void utils.memberGroups.list.invalidate();
      toast(t("groups.deleted"), "success");
      setDeleteTarget(null);
    },
    onError,
  });

  function handleCreateGroup() {
    if (!newName.trim()) {
      toast(t("groups.nameRequired"), "error");
      return;
    }
    createGroup.mutate({
      name: newName.trim(),
      description: newDescription.trim() || undefined,
      color: newColor,
    });
  }

  function handleStartEdit(group: MemberGroup) {
    setEditingGroup(group);
    setEditName(group.name);
    setEditDescription(group.description);
    setEditColor(group.color);
    setShowCreateForm(false);
  }

  function handleSaveEdit() {
    if (!editingGroup) return;
    if (!editName.trim()) {
      toast(t("groups.nameRequired"), "error");
      return;
    }
    updateGroup.mutate({
      id: editingGroup.id,
      name: editName.trim(),
      description: editDescription.trim(),
      color: editColor,
    });
  }

  function handleCancelEdit() {
    setEditingGroup(null);
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteGroup.mutate({ id: deleteTarget.id });
  }

  const inputClass =
    "w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20";

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t("nav.members"), href: "/members" },
          { label: t("groups.title") },
        ]}
      />

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("groups.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">{t("groups.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowCreateForm((v) => !v)}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          {showCreateForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showCreateForm ? t("action.cancel") : t("groups.createGroup")}
        </button>
      </div>

      {/* Edit Form */}
      {editingGroup && (
        <div className="rounded-xl border border-vytal-blue/20 bg-vytal-blue/5 p-5">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">
            {t("groups.editGroupTitle")}: <span className="text-vytal-muted">{editingGroup.name}</span>
          </h3>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("groups.groupName")}
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder={t("groups.groupNamePlaceholder")}
                  className={inputClass}
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("groups.description")}
                </label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder={t("groups.descriptionPlaceholder")}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("groups.color")}
              </label>
              <div className="flex gap-2">
                {colorOptions.map((c) => (
                  <button
                    key={c}
                    onClick={() => setEditColor(c)}
                    className={`h-8 w-8 rounded-full border-2 transition-all ${
                      editColor === c ? "border-vytal-text scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2 text-sm font-medium text-vytal-text hover:bg-vytal-bg3"
              >
                <X className="h-4 w-4" />
                {t("action.cancel")}
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2 text-sm font-semibold text-vytal-bg hover:bg-vytal-green/90"
              >
                <Check className="h-4 w-4" />
                {t("action.save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="rounded-xl border border-vytal-green/20 bg-vytal-green/5 p-5">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">
            {t("groups.createGroup")}
          </h3>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("groups.groupName")}
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t("groups.groupNamePlaceholder")}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                  {t("groups.description")}
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder={t("groups.descriptionPlaceholder")}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("groups.color")}
              </label>
              <div className="flex gap-2">
                {colorOptions.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className={`h-8 w-8 rounded-full border-2 transition-all ${
                      newColor === c ? "border-vytal-text scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleCreateGroup}
                className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2 text-sm font-semibold text-vytal-bg hover:bg-vytal-green/90"
              >
                <Check className="h-4 w-4" />
                {t("action.create")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Groups Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => {
          const isExpanded = expandedId === group.id;
          return (
            <div
              key={group.id}
              className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(34,197,94,0.22)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className="mt-0.5 h-4 w-4 shrink-0 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-vytal-text">{group.name}</p>
                    <p className="mt-0.5 text-xs text-vytal-muted">{group.description}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-vytal-bg3 px-2 py-0.5 text-xs font-medium text-vytal-muted">
                  <Users className="h-3 w-3" />
                  {group.members.length}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : group.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                  {t("groups.viewMembers")}
                </button>
                <button
                  onClick={() => handleStartEdit(group)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
                >
                  <Pencil className="h-3 w-3" />
                  {t("action.edit")}
                </button>
                <button
                  onClick={() => setDeleteTarget({ id: group.id, name: group.name })}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs font-medium text-vytal-muted transition-colors hover:bg-vytal-red/10 hover:text-vytal-red"
                >
                  <Trash2 className="h-3 w-3" />
                  {t("action.delete")}
                </button>
              </div>

              {/* Inline member list */}
              {isExpanded && (
                <div className="mt-4 space-y-2 border-t border-vytal-border pt-3">
                  {group.members.length === 0 ? (
                    <p className="text-xs text-vytal-muted">{t("groups.noMembers")}</p>
                  ) : (
                    group.members.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between rounded-lg bg-vytal-bg2 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm text-vytal-text">{m.name}</p>
                          <p className="text-[10px] text-vytal-muted">{m.email}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title={t("action.delete")}
        description={`${t("groups.confirmDelete")} "${deleteTarget?.name}"?`}
        confirmLabel={t("action.delete")}
        cancelLabel={t("action.cancel")}
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
