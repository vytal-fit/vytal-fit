import { mockLeads, mockCoaches } from "@vytal-fit/shared";
import type { LeadStage } from "@vytal-fit/shared";
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  Calendar,
  Tag,
  MessageSquare,
  Clock,
  UserPlus,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";

const stageConfig: Record<
  LeadStage,
  { label: string; className: string }
> = {
  lead: { label: "Lead", className: "bg-vytal-muted/10 text-vytal-muted" },
  contacted: { label: "Contacted", className: "bg-vytal-amber/10 text-vytal-amber" },
  prospect: { label: "Prospect", className: "bg-vytal-blue/10 text-vytal-blue" },
  trial_booked: { label: "Trial Booked", className: "bg-vytal-blue/10 text-vytal-blue" },
  subscribed: { label: "Subscribed", className: "bg-vytal-green/10 text-vytal-green" },
  lost: { label: "Lost", className: "bg-vytal-red/10 text-vytal-red" },
};

const communicationHistory = [
  { id: 1, type: "email", title: "Welcome email sent", date: "2026-06-01", details: "Sent intro email with box information and trial class details." },
  { id: 2, type: "call", title: "Phone call logged", date: "2026-06-02", details: "Discussed schedule preferences. Interested in morning WODs." },
  { id: 3, type: "booking", title: "Trial class booked", date: "2026-06-03", details: "Booked for WOD class on June 5 at 07:00." },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = mockLeads.find((l) => l.id === id);

  if (!lead) {
    notFound();
  }

  const coach = lead.assignedCoachId
    ? mockCoaches.find((c) => c.id === lead.assignedCoachId)
    : null;

  const stage = stageConfig[lead.stage];
  const initials = lead.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <Link
        href="/crm"
        className="inline-flex items-center gap-1.5 text-sm text-vytal-muted transition-colors hover:text-vytal-text"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to CRM
      </Link>

      {/* Profile Header */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
        <div className="flex items-start gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-vytal-green/10 text-xl font-bold text-vytal-green">
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-vytal-text">{lead.name}</h1>
              <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", stage.className)}>
                {stage.label}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-vytal-muted">
              {lead.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {lead.email}
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {lead.phone}
                </div>
              )}
              {lead.source && (
                <div className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  {lead.source}
                </div>
              )}
              {coach && (
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {coach.name}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Actions */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-vytal-text">Actions</h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Change Stage
              </label>
              <select
                defaultValue={lead.stage}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              >
                {Object.entries(stageConfig).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3">
              <User className="h-4 w-4" />
              Assign Coach
            </button>
            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3">
              <Calendar className="h-4 w-4" />
              Book Trial
            </button>
            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90">
              <UserPlus className="h-4 w-4" />
              Convert to Member
            </button>
            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-vytal-red/30 bg-vytal-red/10 px-4 py-2.5 text-sm font-medium text-vytal-red transition-colors hover:bg-vytal-red/20">
              <XCircle className="h-4 w-4" />
              Mark as Lost
            </button>
          </div>
        </div>

        {/* Communication Timeline */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-vytal-text">Communication History</h2>
          <div className="space-y-4">
            {communicationHistory.map((item) => (
              <div
                key={item.id}
                className="relative border-l-2 border-vytal-green/20 pl-4"
              >
                <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-vytal-green" />
                <div className="flex items-center gap-2">
                  {item.type === "email" && <Mail className="h-3.5 w-3.5 text-vytal-blue" />}
                  {item.type === "call" && <Phone className="h-3.5 w-3.5 text-vytal-amber" />}
                  {item.type === "booking" && <Calendar className="h-3.5 w-3.5 text-vytal-green" />}
                  <span className="text-sm font-semibold text-vytal-text">{item.title}</span>
                </div>
                <p className="mt-1 text-sm text-vytal-muted">{item.details}</p>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-vytal-muted">
                  <Clock className="h-3 w-3" />
                  {formatDate(item.date)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-vytal-text">Notes</h2>
        {lead.notes && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-vytal-bg2 p-3">
            <MessageSquare className="mt-0.5 h-3.5 w-3.5 text-vytal-muted" />
            <p className="text-sm text-vytal-muted">{lead.notes}</p>
          </div>
        )}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Add a note..."
            className="flex-1 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
          />
          <button className="rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90">
            Add Note
          </button>
        </div>
      </div>
    </div>
  );
}
