"use client";

import { useMemo } from "react";
import { mockLeads, mockCoaches } from "@vytal-fit/shared";
import type { Lead, LeadStage } from "@vytal-fit/shared";
import { Phone, User, Calendar, Tag, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const stageConfig: Record<
  LeadStage,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  lead: {
    label: "Lead",
    color: "text-vytal-muted",
    bgColor: "bg-vytal-muted/10",
    borderColor: "border-vytal-muted/20",
  },
  contacted: {
    label: "Contacted",
    color: "text-vytal-amber",
    bgColor: "bg-vytal-amber/10",
    borderColor: "border-vytal-amber/20",
  },
  prospect: {
    label: "Prospect",
    color: "text-vytal-blue",
    bgColor: "bg-vytal-blue/10",
    borderColor: "border-vytal-blue/20",
  },
  trial_booked: {
    label: "Trial Booked",
    color: "text-vytal-blue",
    bgColor: "bg-vytal-blue/10",
    borderColor: "border-vytal-blue/20",
  },
  subscribed: {
    label: "Subscribed",
    color: "text-vytal-green",
    bgColor: "bg-vytal-green/10",
    borderColor: "border-vytal-green/20",
  },
  lost: {
    label: "Lost",
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

function LeadCard({ lead }: { lead: Lead }) {
  const coach = lead.assignedCoachId
    ? mockCoaches.find((c) => c.id === lead.assignedCoachId)
    : null;

  return (
    <div className="rounded-lg border border-vytal-border bg-vytal-card p-3 transition-colors hover:border-[rgba(61,255,110,0.22)]">
      {/* Name and source */}
      <div className="mb-2 flex items-start justify-between">
        <h4 className="text-sm font-semibold text-vytal-text">{lead.name}</h4>
        {lead.source && (
          <span className="flex items-center gap-1 rounded bg-vytal-bg3 px-1.5 py-0.5 text-[10px] text-vytal-muted">
            <Tag className="h-2.5 w-2.5" />
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

      {/* Footer */}
      <div className="mt-2 border-t border-vytal-border pt-2">
        <span className="text-[10px] text-vytal-muted">
          Created {formatRelative(lead.createdAt)}
          {lead.lastContactAt &&
            ` · Last contact ${formatRelative(lead.lastContactAt)}`}
        </span>
      </div>
    </div>
  );
}

function PipelineColumn({
  stage,
  leads,
}: {
  stage: LeadStage;
  leads: Lead[];
}) {
  const config = stageConfig[stage];

  return (
    <div className="flex min-w-[260px] flex-col">
      {/* Column Header */}
      <div
        className={cn(
          "mb-3 flex items-center justify-between rounded-lg border px-3 py-2",
          config.borderColor,
          config.bgColor
        )}
      >
        <span className={cn("text-sm font-semibold", config.color)}>
          {config.label}
        </span>
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
            config.bgColor,
            config.color
          )}
        >
          {leads.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-1 flex-col gap-2">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
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
  const grouped = useMemo(() => {
    const map: Record<LeadStage, Lead[]> = {
      lead: [],
      contacted: [],
      prospect: [],
      trial_booked: [],
      subscribed: [],
      lost: [],
    };
    for (const lead of mockLeads) {
      map[lead.stage].push(lead);
    }
    return map;
  }, []);

  const totalLeads = mockLeads.length;
  const activeLeads = mockLeads.filter(
    (l) => l.stage !== "subscribed" && l.stage !== "lost"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">CRM Pipeline</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            Track leads from first contact to subscription
          </p>
        </div>
        <div className="hidden items-center gap-4 sm:flex">
          <div className="text-right">
            <p className="text-xs text-vytal-muted">Total Leads</p>
            <p className="font-mono text-sm font-semibold text-vytal-text">
              {totalLeads}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-vytal-muted">Active Pipeline</p>
            <p className="font-mono text-sm font-semibold text-vytal-green">
              {activeLeads}
            </p>
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
            />
          ))}
        </div>
      </div>
    </div>
  );
}
