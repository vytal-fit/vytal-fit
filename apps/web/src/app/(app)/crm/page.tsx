"use client";

import { useMemo, useState, useCallback } from "react";
import { useDataStore } from "@/stores/data-store";
import type { Lead, LeadStage } from "@vytal-fit/shared";
import {
  Phone,
  User,
  Calendar,
  Tag,
  MessageSquare,
  GripVertical,
  Mail,
  Camera,
  ThumbsUp,
  Globe,
  Footprints,
  Users,
  FileText,
  Plus,
  TrendingUp,
  Clock,
  Target,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/toast";
import { useI18n } from "@/lib/i18n";

const stageConfig: Record<
  LeadStage,
  { labelKey: string; color: string; bgColor: string; borderColor: string }
> = {
  lead: {
    labelKey: "crm.stage.lead",
    color: "text-vytal-muted",
    bgColor: "bg-vytal-muted/10",
    borderColor: "border-vytal-muted/20",
  },
  contacted: {
    labelKey: "crm.stage.contacted",
    color: "text-vytal-amber",
    bgColor: "bg-vytal-amber/10",
    borderColor: "border-vytal-amber/20",
  },
  prospect: {
    labelKey: "crm.stage.prospect",
    color: "text-vytal-blue",
    bgColor: "bg-vytal-blue/10",
    borderColor: "border-vytal-blue/20",
  },
  trial_booked: {
    labelKey: "crm.stage.trial_booked",
    color: "text-vytal-blue",
    bgColor: "bg-vytal-blue/10",
    borderColor: "border-vytal-blue/20",
  },
  subscribed: {
    labelKey: "crm.stage.subscribed",
    color: "text-vytal-green",
    bgColor: "bg-vytal-green/10",
    borderColor: "border-vytal-green/20",
  },
  lost: {
    labelKey: "crm.stage.lost",
    color: "text-vytal-red",
    bgColor: "bg-vytal-red/10",
    borderColor: "border-vytal-red/20",
  },
};

const stages: LeadStage[] = [
  "lead",
  "contacted",
  "prospect",
  "trial_booked",
  "subscribed",
  "lost",
];

const sourceIcons: Record<string, React.ReactNode> = {
  Instagram: <Camera className="h-2.5 w-2.5" />,
  Facebook: <ThumbsUp className="h-2.5 w-2.5" />,
  Website: <Globe className="h-2.5 w-2.5" />,
  "Walk-in": <Footprints className="h-2.5 w-2.5" />,
  Referral: <Users className="h-2.5 w-2.5" />,
  Flyers: <FileText className="h-2.5 w-2.5" />,
};

function formatRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
}

function LeadCard({
  lead,
  onCall,
  onEmail,
  onBookTrial,
  onDragStart,
  draggingId,
}: {
  lead: Lead;
  onCall: () => void;
  onEmail: () => void;
  onBookTrial: () => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  draggingId: string | null;
}) {
  const coaches = useDataStore((s) => s.coaches);
  const coach = lead.assignedCoachId
    ? coaches.find((c) => c.id === lead.assignedCoachId)
    : null;

  const isDragging = draggingId === lead.id;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      className={cn(
        "group cursor-grab rounded-lg border border-vytal-border bg-vytal-card p-3 transition-all hover:border-[rgba(61,255,110,0.22)]",
        isDragging && "opacity-40"
      )}
    >
      {/* Drag handle + Name and source */}
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-start gap-1.5">
          <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-grab text-vytal-muted/50 opacity-0 transition-opacity group-hover:opacity-100" />
          <h4 className="text-sm font-semibold text-vytal-text">{lead.name}</h4>
        </div>
        {lead.source && (
          <span className="flex items-center gap-1 rounded bg-vytal-bg3 px-1.5 py-0.5 text-[10px] text-vytal-muted">
            {sourceIcons[lead.source] ?? <Tag className="h-2.5 w-2.5" />}
            {lead.source}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="space-y-1.5">
        {lead.phone && (
          <div className="flex items-center gap-1.5 text-xs text-vytal-muted">
            <Phone className="h-3 w-3" />
            {lead.phone}
          </div>
        )}
        {coach && (
          <div className="flex items-center gap-1.5 text-xs text-vytal-muted">
            <User className="h-3 w-3" />
            {coach.name.split(" ")[0]}
          </div>
        )}
        {lead.trialDate && (
          <div className="flex items-center gap-1.5 text-xs text-vytal-blue">
            <Calendar className="h-3 w-3" />
            Trial: {lead.trialDate}
          </div>
        )}
        {lead.notes && (
          <div className="flex items-center gap-1.5 text-xs text-vytal-muted">
            <MessageSquare className="h-3 w-3" />
            {lead.notes}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={onCall}
          className="flex h-6 w-6 items-center justify-center rounded bg-vytal-bg3 text-vytal-muted transition-colors hover:bg-vytal-green/10 hover:text-vytal-green"
          title="Call"
        >
          <Phone className="h-3 w-3" />
        </button>
        <button
          onClick={onEmail}
          className="flex h-6 w-6 items-center justify-center rounded bg-vytal-bg3 text-vytal-muted transition-colors hover:bg-vytal-blue/10 hover:text-vytal-blue"
          title="Email"
        >
          <Mail className="h-3 w-3" />
        </button>
        <button
          onClick={onBookTrial}
          className="flex h-6 w-6 items-center justify-center rounded bg-vytal-bg3 text-vytal-muted transition-colors hover:bg-vytal-amber/10 hover:text-vytal-amber"
          title="Book Trial"
        >
          <Calendar className="h-3 w-3" />
        </button>
      </div>

      {/* Footer */}
      <div className="mt-2 border-t border-vytal-border pt-2">
        <span className="text-[10px] text-vytal-muted">
          Created {formatRelative(lead.createdAt)}
          {lead.lastContactAt && (
            <>
              {" "}
              · Last contact{" "}
              <span className="text-vytal-text">
                {formatRelative(lead.lastContactAt)}
              </span>
            </>
          )}
        </span>
      </div>
    </div>
  );
}

function InlineAddLeadForm({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (name: string, phone: string, source: string) => void;
}) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("");

  function handleAdd() {
    if (!name.trim()) return;
    onAdd(name.trim(), phone.trim(), source);
    setName("");
    setPhone("");
    setSource("");
    onClose();
  }

  return (
    <div className="rounded-lg border border-vytal-green/20 bg-vytal-green/5 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-vytal-green">
          New Lead
        </span>
        <button
          onClick={onClose}
          className="text-vytal-muted transition-colors hover:text-vytal-text"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border border-vytal-border bg-vytal-bg2 px-2 py-1.5 text-xs text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded border border-vytal-border bg-vytal-bg2 px-2 py-1.5 text-xs text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none"
        />
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full rounded border border-vytal-border bg-vytal-bg2 px-2 py-1.5 text-xs text-vytal-text focus:border-vytal-green/30 focus:outline-none"
        >
          <option value="">{t("crm.source")}...</option>
          <option value="Instagram">Instagram</option>
          <option value="Facebook">Facebook</option>
          <option value="Website">{t("crm.sourceWebsite")}</option>
          <option value="Walk-in">{t("crm.sourceWalkIn")}</option>
          <option value="Referral">{t("crm.sourceReferral")}</option>
          <option value="Flyers">{t("crm.sourceFlyers")}</option>
        </select>
        <button
          onClick={handleAdd}
          className="w-full rounded bg-vytal-green px-3 py-1.5 text-xs font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          Add Lead
        </button>
      </div>
    </div>
  );
}

function PipelineColumn({
  stage,
  leads,
  showAddForm,
  onToggleAdd,
  onAddLead,
  onDragStart,
  onDragOver,
  onDrop,
  draggingId,
  dropTarget,
  onCall,
  onEmail,
  onBookTrial,
}: {
  stage: LeadStage;
  leads: Lead[];
  showAddForm: boolean;
  onToggleAdd: () => void;
  onAddLead: (name: string, phone: string, source: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent, stage: LeadStage) => void;
  onDrop: (e: React.DragEvent, stage: LeadStage) => void;
  draggingId: string | null;
  dropTarget: LeadStage | null;
  onCall: (lead: Lead) => void;
  onEmail: (lead: Lead) => void;
  onBookTrial: (lead: Lead) => void;
}) {
  const { t } = useI18n();
  const config = stageConfig[stage];
  const isDropTarget = dropTarget === stage;

  return (
    <div
      className={cn(
        "flex min-w-[260px] flex-col rounded-lg transition-all",
        isDropTarget && "ring-2 ring-vytal-green/50"
      )}
      onDragOver={(e) => onDragOver(e, stage)}
      onDrop={(e) => onDrop(e, stage)}
      onDragLeave={(e) => {
        // Only clear if leaving the column itself
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          // handled at parent level
        }
      }}
    >
      {/* Column Header */}
      <div
        className={cn(
          "mb-3 flex items-center justify-between rounded-lg border px-3 py-2",
          config.borderColor,
          config.bgColor
        )}
      >
        <span className={cn("text-sm font-semibold", config.color)}>
          {t(config.labelKey)}
        </span>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
              config.bgColor,
              config.color
            )}
          >
            {leads.length}
          </span>
          {stage === "lead" && (
            <button
              onClick={onToggleAdd}
              className="flex h-5 w-5 items-center justify-center rounded text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
              title="Add Lead"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Inline Add Form */}
      {showAddForm && stage === "lead" && (
        <div className="mb-2">
          <InlineAddLeadForm onClose={onToggleAdd} onAdd={onAddLead} />
        </div>
      )}

      {/* Cards */}
      <div className="flex flex-1 flex-col gap-2">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onCall={() => onCall(lead)}
            onEmail={() => onEmail(lead)}
            onBookTrial={() => onBookTrial(lead)}
            onDragStart={onDragStart}
            draggingId={draggingId}
          />
        ))}
        {leads.length === 0 && (
          <div className="rounded-lg border border-dashed border-vytal-border p-4 text-center">
            <p className="text-xs text-vytal-muted">No leads</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CRMPage() {
  const { t } = useI18n();
  const [showAddForm, setShowAddForm] = useState(false);
  const leads = useDataStore((s) => s.leads);
  const storeAddLead = useDataStore((s) => s.addLead);
  const storeMoveLead = useDataStore((s) => s.moveLead);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<LeadStage | null>(null);
  const { toast } = useToast();

  const grouped = useMemo(() => {
    const map: Record<LeadStage, Lead[]> = {
      lead: [],
      contacted: [],
      prospect: [],
      trial_booked: [],
      subscribed: [],
      lost: [],
    };
    for (const lead of leads) {
      map[lead.stage].push(lead);
    }
    return map;
  }, [leads]);

  const totalLeads = leads.length;
  const activeLeads = leads.filter(
    (l) => l.stage !== "subscribed" && l.stage !== "lost"
  ).length;
  const subscribedCount = grouped.subscribed.length;
  const conversionRate =
    totalLeads > 0 ? ((subscribedCount / totalLeads) * 100).toFixed(1) : "0";
  const avgTimeInStage = 8.3;
  const totalPipelineValue = activeLeads * 75;

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, stage: LeadStage) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDropTarget(stage);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, targetStage: LeadStage) => {
      e.preventDefault();
      const leadId = e.dataTransfer.getData("text/plain");
      if (leadId) {
        storeMoveLead(leadId, targetStage);
        const lead = leads.find((l) => l.id === leadId);
        if (lead) {
          toast(
            t("crm.movedTo").replace("{name}", lead.name).replace("{stage}", t(stageConfig[targetStage].labelKey)),
            "success"
          );
        }
      }
      setDraggingId(null);
      setDropTarget(null);
    },
    [leads, toast, storeMoveLead]
  );

  const handleAddLead = useCallback(
    (name: string, phone: string, source: string) => {
      storeAddLead({
        organizationId: "org-1",
        name,
        phone: phone || undefined,
        stage: "lead",
        source: source || undefined,
      });
      toast(`Added lead: ${name}`, "success");
    },
    [toast, storeAddLead]
  );

  const handleCall = useCallback(
    (lead: Lead) => {
      toast(`Calling ${lead.name}...`, "info");
    },
    [toast]
  );

  const handleEmail = useCallback(
    (lead: Lead) => {
      toast(`Email sent to ${lead.name}`, "success");
    },
    [toast]
  );

  const handleBookTrial = useCallback(
    (lead: Lead) => {
      storeMoveLead(lead.id, "trial_booked");
      toast(`${lead.name} moved to Trial Booked`, "success");
    },
    [toast, storeMoveLead]
  );

  return (
    <div
      className="space-y-6"
      onDragEnd={() => {
        setDraggingId(null);
        setDropTarget(null);
      }}
    >
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("crm.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("crm.subtitle")}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Plus className="h-4 w-4" />
          {t("crm.addLead")}
        </button>
      </div>

      {/* Quick Actions Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setShowAddForm(true)} className="inline-flex items-center gap-1.5 rounded-full border border-vytal-green/20 bg-vytal-green/5 px-3.5 py-1.5 text-xs font-semibold text-vytal-green transition-colors hover:bg-vytal-green/10">
          <Plus className="h-3.5 w-3.5" />
          {t("quickAction.newLead")}
        </button>
        <button onClick={() => toast(t("quickAction.comingSoon"), "info")} className="inline-flex items-center gap-1.5 rounded-full border border-vytal-border bg-vytal-card px-3.5 py-1.5 text-xs font-semibold text-vytal-text transition-colors hover:bg-vytal-bg3">
          <FileText className="h-3.5 w-3.5" />
          {t("quickAction.import")}
        </button>
        <button onClick={() => toast(t("quickAction.comingSoon"), "info")} className="inline-flex items-center gap-1.5 rounded-full border border-vytal-border bg-vytal-card px-3.5 py-1.5 text-xs font-semibold text-vytal-text transition-colors hover:bg-vytal-bg3">
          <TrendingUp className="h-3.5 w-3.5" />
          {t("quickAction.statistics")}
        </button>
      </div>

      {/* Pipeline Stats Bar */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <div className="flex items-center gap-3 rounded-lg border border-vytal-border bg-vytal-card px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vytal-blue/10">
            <Users className="h-4 w-4 text-vytal-blue" />
          </div>
          <div>
            <p className="text-lg font-bold text-vytal-text">{totalLeads}</p>
            <p className="text-xs text-vytal-muted">{t("crm.totalLeads")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-vytal-border bg-vytal-card px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vytal-green/10">
            <TrendingUp className="h-4 w-4 text-vytal-green" />
          </div>
          <div>
            <p className="text-lg font-bold text-vytal-text">{activeLeads}</p>
            <p className="text-xs text-vytal-muted">{t("crm.activePipeline")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-vytal-border bg-vytal-card px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vytal-green/10">
            <Target className="h-4 w-4 text-vytal-green" />
          </div>
          <div>
            <p className="text-lg font-bold text-vytal-green">
              {conversionRate}%
            </p>
            <p className="text-xs text-vytal-muted">{t("crm.conversionRate")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-vytal-border bg-vytal-card px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vytal-amber/10">
            <Clock className="h-4 w-4 text-vytal-amber" />
          </div>
          <div>
            <p className="text-lg font-bold text-vytal-text">
              {avgTimeInStage}d
            </p>
            <p className="text-xs text-vytal-muted">{t("crm.avgTimeInStage")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-vytal-border bg-vytal-card px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vytal-purple/10">
            <Tag className="h-4 w-4 text-vytal-purple" />
          </div>
          <div>
            <p className="text-lg font-bold text-vytal-text">
              {totalPipelineValue} EUR
            </p>
            <p className="text-xs text-vytal-muted">{t("crm.pipelineValue")}</p>
          </div>
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4" style={{ minWidth: "fit-content" }}>
          {stages.map((stage) => (
            <PipelineColumn
              key={stage}
              stage={stage}
              leads={grouped[stage]}
              showAddForm={showAddForm && stage === "lead"}
              onToggleAdd={() => setShowAddForm((v) => !v)}
              onAddLead={handleAddLead}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              draggingId={draggingId}
              dropTarget={dropTarget}
              onCall={handleCall}
              onEmail={handleEmail}
              onBookTrial={handleBookTrial}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
