"use client";

import { useState } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { trpc } from "@/lib/trpc";
import {
  Clock,
  Users,
  MapPin,
  UserCog,
  Plus,
  Copy,
  Pencil,
  Trash2,
  Play,
  X,
  Check,
} from "lucide-react";

interface ClassTemplate {
  id: string;
  name: string;
  classType: string;
  time: string;
  duration: string;
  coach: string;
  capacity: number;
  location: string;
  days: string;
}

export default function ClassTemplatesPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const utils = trpc.useUtils();
  const templatesQuery = trpc.classTemplates.list.useQuery();
  const templates: ClassTemplate[] = templatesQuery.data ?? [];

  const onError = (error: { data?: { code?: string } | null }) =>
    toast(error.data?.code === "FORBIDDEN" ? t("settings.adminOnly") : t("ui.error"), "error");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newClassType, setNewClassType] = useState("WOD");
  const [newTime, setNewTime] = useState("07:00");
  const [newDuration, setNewDuration] = useState("60 min");
  const [newCoach, setNewCoach] = useState("");
  const [newCapacity, setNewCapacity] = useState(20);
  const [newLocation, setNewLocation] = useState("Main Box");
  const [newDays, setNewDays] = useState("");
  const [editingTemplate, setEditingTemplate] = useState<ClassTemplate | null>(null);
  const [editName, setEditName] = useState("");
  const [editClassType, setEditClassType] = useState("WOD");
  const [editTime, setEditTime] = useState("07:00");
  const [editDuration, setEditDuration] = useState("60 min");
  const [editCoach, setEditCoach] = useState("");
  const [editCapacity, setEditCapacity] = useState(20);
  const [editLocation, setEditLocation] = useState("Main Box");
  const [editDays, setEditDays] = useState("");

  const createTemplate = trpc.classTemplates.create.useMutation({
    onSuccess: () => {
      void utils.classTemplates.list.invalidate();
      setNewName("");
      setNewClassType("WOD");
      setNewTime("07:00");
      setNewDuration("60 min");
      setNewCoach("");
      setNewCapacity(20);
      setNewLocation("Main Box");
      setNewDays("");
      setShowCreateForm(false);
      toast(t("classTemplates.created"), "success");
    },
    onError,
  });

  const updateTemplate = trpc.classTemplates.update.useMutation({
    onSuccess: () => {
      void utils.classTemplates.list.invalidate();
      setEditingTemplate(null);
      toast(t("classTemplates.updated"), "success");
    },
    onError,
  });

  const deleteTemplate = trpc.classTemplates.delete.useMutation({
    onSuccess: () => {
      void utils.classTemplates.list.invalidate();
      toast(t("classTemplates.deleted"), "success");
    },
    onError,
  });

  function handleCreate() {
    if (!newName.trim()) {
      toast(t("classTemplates.nameRequired"), "error");
      return;
    }
    createTemplate.mutate({
      name: newName.trim(),
      classType: newClassType,
      time: newTime,
      duration: newDuration,
      coach: newCoach || "TBD",
      capacity: newCapacity,
      location: newLocation,
      days: newDays || "Mon-Fri",
    });
  }

  function handleStartEdit(tpl: ClassTemplate) {
    setEditingTemplate(tpl);
    setEditName(tpl.name);
    setEditClassType(tpl.classType);
    setEditTime(tpl.time);
    setEditDuration(tpl.duration);
    setEditCoach(tpl.coach);
    setEditCapacity(tpl.capacity);
    setEditLocation(tpl.location);
    setEditDays(tpl.days);
    setShowCreateForm(false);
  }

  function handleSaveEdit() {
    if (!editingTemplate) return;
    if (!editName.trim()) {
      toast(t("classTemplates.nameRequired"), "error");
      return;
    }
    updateTemplate.mutate({
      id: editingTemplate.id,
      name: editName.trim(),
      classType: editClassType,
      time: editTime,
      duration: editDuration,
      coach: editCoach || "TBD",
      capacity: editCapacity,
      location: editLocation,
      days: editDays || "Mon-Fri",
    });
  }

  function handleCancelEdit() {
    setEditingTemplate(null);
  }

  function handleDelete(id: string) {
    deleteTemplate.mutate({ id });
  }

  const inputClass =
    "w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20";

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t("nav.classes"), href: "/classes" },
          { label: t("classTemplates.title") },
        ]}
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">
            {t("classTemplates.title")}
          </h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("classTemplates.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => toast(t("classTemplates.copyLastWeekToast"), "success")}
            className="flex items-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 text-sm font-semibold text-vytal-text transition-colors hover:bg-vytal-bg3 hover:text-vytal-green"
          >
            <Copy className="h-4 w-4" />
            {t("classTemplates.copyLastWeek")}
          </button>
          <button
            onClick={() => setShowCreateForm((v) => !v)}
            className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
          >
            {showCreateForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showCreateForm ? t("action.cancel") : t("classTemplates.createTemplate")}
          </button>
        </div>
      </div>

      {/* Create Template Form */}
      {showCreateForm && (
        <div className="rounded-xl border border-vytal-green/20 bg-vytal-green/5 p-5">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">
            {t("classTemplates.createTemplate")}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("classTemplates.templateName")}
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Morning WOD"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("classTemplates.classType")}
              </label>
              <select
                value={newClassType}
                onChange={(e) => setNewClassType(e.target.value)}
                className={inputClass}
              >
                <option value="WOD">WOD</option>
                <option value="Strength">Strength</option>
                <option value="Open Box">Open Box</option>
                <option value="Mobility">Mobility</option>
                <option value="Endurance">Endurance</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("classTemplates.time")}
              </label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("classTemplates.duration")}
              </label>
              <input
                type="text"
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                placeholder="60 min"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("classTemplates.coach")}
              </label>
              <input
                type="text"
                value={newCoach}
                onChange={(e) => setNewCoach(e.target.value)}
                placeholder={t("classTemplates.coachPlaceholder")}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("classTemplates.capacity")}
              </label>
              <input
                type="number"
                value={newCapacity}
                onChange={(e) => setNewCapacity(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("classTemplates.location")}
              </label>
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("classTemplates.days")}
              </label>
              <input
                type="text"
                value={newDays}
                onChange={(e) => setNewDays(e.target.value)}
                placeholder="Mon-Fri"
                className={inputClass}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2 text-sm font-semibold text-vytal-bg hover:bg-vytal-green/90"
            >
              <Check className="h-4 w-4" />
              {t("action.create")}
            </button>
          </div>
        </div>
      )}

      {/* Edit Template Form */}
      {editingTemplate && (
        <div className="rounded-xl border border-vytal-blue/20 bg-vytal-blue/5 p-5">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">
            {t("classTemplates.editTemplateTitle")}: <span className="text-vytal-muted">{editingTemplate.name}</span>
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("classTemplates.templateName")}
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className={inputClass}
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("classTemplates.classType")}
              </label>
              <select
                value={editClassType}
                onChange={(e) => setEditClassType(e.target.value)}
                className={inputClass}
              >
                <option value="WOD">WOD</option>
                <option value="Strength">Strength</option>
                <option value="Open Box">Open Box</option>
                <option value="Mobility">Mobility</option>
                <option value="Endurance">Endurance</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("classTemplates.time")}
              </label>
              <input
                type="time"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("classTemplates.duration")}
              </label>
              <input
                type="text"
                value={editDuration}
                onChange={(e) => setEditDuration(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("classTemplates.coach")}
              </label>
              <input
                type="text"
                value={editCoach}
                onChange={(e) => setEditCoach(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("classTemplates.capacity")}
              </label>
              <input
                type="number"
                value={editCapacity}
                onChange={(e) => setEditCapacity(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("classTemplates.location")}
              </label>
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("classTemplates.days")}
              </label>
              <input
                type="text"
                value={editDays}
                onChange={(e) => setEditDays(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
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
      )}

      {/* Template Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-vytal-text">{tpl.name}</p>
                <span className="mt-1 inline-flex items-center rounded-full bg-vytal-blue/10 px-2 py-0.5 text-[10px] font-medium text-vytal-blue">
                  {tpl.classType}
                </span>
              </div>
              <span className="rounded-full bg-vytal-bg3 px-2 py-0.5 text-[10px] font-medium text-vytal-muted">
                {tpl.days}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-xs text-vytal-muted">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {tpl.time} ({tpl.duration})
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-vytal-muted">
                <UserCog className="h-3.5 w-3.5" />
                <span>{tpl.coach}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-vytal-muted">
                <Users className="h-3.5 w-3.5" />
                <span>
                  {t("classTemplates.capacityLabel")}: {tpl.capacity}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-vytal-muted">
                <MapPin className="h-3.5 w-3.5" />
                <span>{tpl.location}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-vytal-border pt-3">
              <button
                onClick={() => toast(t("classTemplates.appliedToWeek"), "success")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-vytal-green/10 px-3 py-1.5 text-xs font-medium text-vytal-green transition-colors hover:bg-vytal-green/20"
              >
                <Play className="h-3 w-3" />
                {t("classTemplates.applyToWeek")}
              </button>
              <button
                onClick={() => handleStartEdit(tpl)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
              >
                <Pencil className="h-3 w-3" />
                {t("action.edit")}
              </button>
              <button
                onClick={() => handleDelete(tpl.id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs font-medium text-vytal-muted transition-colors hover:bg-vytal-red/10 hover:text-vytal-red"
              >
                <Trash2 className="h-3 w-3" />
                {t("action.delete")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
