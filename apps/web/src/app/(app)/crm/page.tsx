"use client";

import { useMemo, useState, useCallback, useRef } from "react";
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
  BarChart3,
  Activity,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/toast";
import { useI18n } from "@/lib/i18n";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

// ─── CRM View Mode ───────────────────────────────────────
type CRMView = "pipeline" | "statistics" | "activity";

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

// formatRelative is used outside component scope, so it uses a simple approach.
// The i18n-aware version is inlined where `t` is available.
function formatRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
}

// ─── Statistics Data ─────────────────────────────────────

const leadsPerMonthData = [
  { month: "Jan", leads: 12 },
  { month: "Feb", leads: 19 },
  { month: "Mar", leads: 15 },
  { month: "Apr", leads: 22 },
  { month: "May", leads: 28 },
  { month: "Jun", leads: 18 },
];

const leadSourcesData = [
  { name: "Instagram", value: 30, color: "#E1306C" },
  { name: "Facebook", value: 25, color: "#1877F2" },
  { name: "Website", value: 20, color: "#3dd96e" },
  { name: "Walk-in", value: 15, color: "#f59e0b" },
  { name: "Referral", value: 10, color: "#8b5cf6" },
];

const conversionBySourceData = [
  { source: "Instagram", rate: 35 },
  { source: "Facebook", rate: 28 },
  { source: "Website", rate: 42 },
  { source: "Walk-in", rate: 55 },
  { source: "Referral", rate: 65 },
];

// ─── Activity Log Data ───────────────────────────────────

type ActivityType = "lead_created" | "email_sent" | "call_logged" | "trial_booked" | "stage_changed" | "note_added" | "lead_lost" | "lead_converted";

interface ActivityEntry {
  id: string;
  timestamp: string;
  user: string;
  type: ActivityType;
  action: string;
  leadName: string;
}

const activityTypeLabels: Record<ActivityType, string> = {
  lead_created: "Lead Created",
  email_sent: "Email Sent",
  call_logged: "Call Logged",
  trial_booked: "Trial Booked",
  stage_changed: "Stage Changed",
  note_added: "Note Added",
  lead_lost: "Lead Lost",
  lead_converted: "Lead Converted",
};

const mockActivityLog: ActivityEntry[] = [
  { id: "a-1", timestamp: "2026-06-04T14:30:00Z", user: "Andre Loureiro", type: "lead_created", action: "Created new lead", leadName: "Ricardo Alves" },
  { id: "a-2", timestamp: "2026-06-04T13:15:00Z", user: "Marine Robba", type: "email_sent", action: "Sent welcome email to", leadName: "Sofia Mendes" },
  { id: "a-3", timestamp: "2026-06-04T11:45:00Z", user: "Andre Loureiro", type: "call_logged", action: "Logged phone call with", leadName: "Tiago Neves" },
  { id: "a-4", timestamp: "2026-06-04T10:00:00Z", user: "Ricardo Ribeiro", type: "trial_booked", action: "Booked trial class for", leadName: "Helena Cardoso" },
  { id: "a-5", timestamp: "2026-06-03T18:30:00Z", user: "Andre Loureiro", type: "stage_changed", action: "Changed stage from Lead to Contacted for", leadName: "Diogo Martins" },
  { id: "a-6", timestamp: "2026-06-03T16:00:00Z", user: "Marine Robba", type: "note_added", action: "Added note to", leadName: "Catarina Reis" },
  { id: "a-7", timestamp: "2026-06-03T14:20:00Z", user: "Ricardo Ribeiro", type: "email_sent", action: "Sent trial confirmation to", leadName: "Rui Goncalves" },
  { id: "a-8", timestamp: "2026-06-03T11:00:00Z", user: "Andre Loureiro", type: "lead_lost", action: "Marked as lost:", leadName: "Francisca Nunes" },
  { id: "a-9", timestamp: "2026-06-02T17:45:00Z", user: "Marine Robba", type: "lead_converted", action: "Converted to member:", leadName: "Bruno Pereira" },
  { id: "a-10", timestamp: "2026-06-02T09:30:00Z", user: "Ricardo Ribeiro", type: "stage_changed", action: "Changed stage from Prospect to Trial Booked for", leadName: "Mariana Lopes" },
];

const activityTypeColors: Record<ActivityType, string> = {
  lead_created: "bg-vytal-green",
  email_sent: "bg-vytal-blue",
  call_logged: "bg-vytal-amber",
  trial_booked: "bg-vytal-blue",
  stage_changed: "bg-vytal-purple",
  note_added: "bg-vytal-muted",
  lead_lost: "bg-vytal-red",
  lead_converted: "bg-vytal-green",
};

const activityTypeIcons: Record<ActivityType, React.ReactNode> = {
  lead_created: <Plus className="h-3 w-3" />,
  email_sent: <Mail className="h-3 w-3" />,
  call_logged: <Phone className="h-3 w-3" />,
  trial_booked: <Calendar className="h-3 w-3" />,
  stage_changed: <TrendingUp className="h-3 w-3" />,
  note_added: <MessageSquare className="h-3 w-3" />,
  lead_lost: <X className="h-3 w-3" />,
  lead_converted: <User className="h-3 w-3" />,
};

// ─── Statistics View ─────────────────────────────────────

function StatisticsView() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 card-interactive">
          <p className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("crm.stats.avgDaysToConvert")}</p>
          <p className="mt-2 text-2xl font-bold text-vytal-text">12.4</p>
          <p className="mt-1 text-xs text-vytal-green">-2.1 {t("crm.stats.vsLastMonth")}</p>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 card-interactive">
          <p className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("crm.stats.bestSource")}</p>
          <p className="mt-2 text-2xl font-bold text-vytal-text">{t("crm.sourceReferral")}</p>
          <p className="mt-1 text-xs text-vytal-green">65% {t("crm.stats.conversion")}</p>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 card-interactive">
          <p className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("crm.stats.convertedThisMonth")}</p>
          <p className="mt-2 text-2xl font-bold text-vytal-green">8</p>
          <p className="mt-1 text-xs text-vytal-green">+3 {t("crm.stats.vsLastMonth")}</p>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-5 card-interactive">
          <p className="text-xs font-medium uppercase tracking-wider text-vytal-muted">{t("crm.stats.pipelineValueLabel")}</p>
          <p className="mt-2 text-2xl font-bold text-vytal-text">1,125 EUR</p>
          <p className="mt-1 text-xs text-vytal-amber">15 {t("crm.stats.activeLeads")}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leads per Month Line Chart */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("crm.stats.leadsPerMonth")}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={leadsPerMonthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1a1f2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  labelStyle={{ color: "#e5e7eb" }}
                  itemStyle={{ color: "#3dd96e" }}
                />
                <Line type="monotone" dataKey="leads" stroke="#3dd96e" strokeWidth={2} dot={{ fill: "#3dd96e", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Sources Donut */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("crm.stats.leadSourcesBreakdown")}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadSourcesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}%`}
                >
                  {leadSourcesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1a1f2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  itemStyle={{ color: "#e5e7eb" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion by Source Bar Chart */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("crm.stats.conversionRateBySource")}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionBySourceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="source" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1a1f2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  labelStyle={{ color: "#e5e7eb" }}
                  itemStyle={{ color: "#3dd96e" }}
                  formatter={(value) => [`${value}%`, "Conversion Rate"]}
                />
                <Legend />
                <Bar dataKey="rate" fill="#3dd96e" radius={[4, 4, 0, 0]} name="Conversion Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Activity Log View ───────────────────────────────────

function ActivityLogView() {
  const [typeFilter, setTypeFilter] = useState<ActivityType | "all">("all");
  const [userFilter, setUserFilter] = useState<string>("all");

  const uniqueUsers = useMemo(() => {
    const users = new Set(mockActivityLog.map((a) => a.user));
    return Array.from(users);
  }, []);

  const activityTypes: ActivityType[] = ["lead_created", "email_sent", "call_logged", "trial_booked", "stage_changed", "note_added", "lead_lost", "lead_converted"];

  const filteredLog = useMemo(() => {
    return mockActivityLog.filter((entry) => {
      if (typeFilter !== "all" && entry.type !== typeFilter) return false;
      if (userFilter !== "all" && entry.user !== userFilter) return false;
      return true;
    });
  }, [typeFilter, userFilter]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-vytal-border bg-vytal-card p-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-vytal-muted" />
          <span className="text-xs font-medium text-vytal-muted">Filters:</span>
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ActivityType | "all")}
          className="rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs text-vytal-text focus:border-vytal-green/30 focus:outline-none"
        >
          <option value="all">All Actions</option>
          {activityTypes.map((t) => (
            <option key={t} value={t}>{activityTypeLabels[t]}</option>
          ))}
        </select>
        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs text-vytal-text focus:border-vytal-green/30 focus:outline-none"
        >
          <option value="all">All Users</option>
          {uniqueUsers.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>

      {/* Activity Entries */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
        <div className="space-y-4">
          {filteredLog.map((entry) => (
            <div key={entry.id} className="relative border-l-2 border-vytal-green/20 pl-6">
              <div className={cn(
                "absolute -left-2 top-1 flex h-4 w-4 items-center justify-center rounded-full text-white",
                activityTypeColors[entry.type]
              )}>
                {activityTypeIcons[entry.type]}
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-vytal-text">
                    <span className="font-semibold">{entry.action}</span>{" "}
                    <span className="text-vytal-green">{entry.leadName}</span>
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-[10px] text-vytal-muted">
                    <span className="flex items-center gap-1">
                      <User className="h-2.5 w-2.5" />
                      {entry.user}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {new Date(entry.timestamp).toLocaleString("pt-PT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
                <span className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                  entry.type === "lead_created" ? "bg-vytal-green/10 text-vytal-green" :
                  entry.type === "email_sent" ? "bg-vytal-blue/10 text-vytal-blue" :
                  entry.type === "call_logged" ? "bg-vytal-amber/10 text-vytal-amber" :
                  entry.type === "trial_booked" ? "bg-vytal-blue/10 text-vytal-blue" :
                  entry.type === "stage_changed" ? "bg-vytal-purple/10 text-vytal-purple" :
                  entry.type === "lead_lost" ? "bg-vytal-red/10 text-vytal-red" :
                  entry.type === "lead_converted" ? "bg-vytal-green/10 text-vytal-green" :
                  "bg-vytal-muted/10 text-vytal-muted"
                )}>
                  {activityTypeLabels[entry.type]}
                </span>
              </div>
            </div>
          ))}
          {filteredLog.length === 0 && (
            <p className="text-center text-sm text-vytal-muted">No activity found with the selected filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Lead Card ───────────────────────────────────────────

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
  const { t } = useI18n();
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
        "group cursor-grab rounded-lg border border-vytal-border bg-vytal-card p-3 card-interactive transition-all hover:border-[rgba(61,255,110,0.22)]",
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
          {t("crm.created")} {formatRelative(lead.createdAt)}
          {lead.lastContactAt && (
            <>
              {" "}
              · {t("crm.lastContact")}{" "}
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
          {t("crm.newLead")}
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
          placeholder={t("crm.namePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border border-vytal-border bg-vytal-bg2 px-2 py-1.5 text-xs text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none"
        />
        <input
          type="text"
          placeholder={t("crm.phonePlaceholder")}
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
          {t("crm.addLeadBtn")}
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
            <p className="text-xs text-vytal-muted">{t("crm.noLeads")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CRMPage() {
  const { t } = useI18n();
  const [showAddForm, setShowAddForm] = useState(false);
  const [view, setView] = useState<CRMView>("pipeline");
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
    [leads, toast, storeMoveLead, t]
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
      toast(t("crm.leadAdded").replace("{name}", name), "success");
    },
    [toast, storeAddLead, t]
  );

  const handleCall = useCallback(
    (lead: Lead) => {
      toast(t("crm.calling").replace("{name}", lead.name), "info");
    },
    [toast, t]
  );

  const handleEmail = useCallback(
    (lead: Lead) => {
      toast(t("crm.emailSentTo").replace("{name}", lead.name), "success");
    },
    [toast, t]
  );

  const handleBookTrial = useCallback(
    (lead: Lead) => {
      storeMoveLead(lead.id, "trial_booked");
      toast(t("crm.movedTo").replace("{name}", lead.name).replace("{stage}", t("crm.stage.trial_booked")), "success");
    },
    [toast, storeMoveLead, t]
  );

  const importInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const lines = text.trim().split("\n").filter(Boolean);
        // Skip header row, parse name from first column
        const dataLines = lines.slice(1);
        let added = 0;
        for (const line of dataLines) {
          const cols = line.split(",");
          const name = cols[0]?.replace(/"/g, "").trim();
          const phone = cols[1]?.replace(/"/g, "").trim() || undefined;
          const source = cols[2]?.replace(/"/g, "").trim() || undefined;
          if (name) {
            storeAddLead({ organizationId: "org-1", name, phone, stage: "lead", source });
            added++;
          }
        }
        toast(t("crm.importStarted").replace("{count}", String(added)), "success");
      };
      reader.readAsText(file);
      // Reset so same file can be re-imported
      e.target.value = "";
    },
    [toast, storeAddLead, t]
  );

  return (
    <div
      className="space-y-6"
      onDragEnd={() => {
        setDraggingId(null);
        setDropTarget(null);
      }}
    >
      {/* Hidden CSV import input */}
      <input
        ref={importInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleImportFile}
      />

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

      {/* View Toggle: Pipeline | Statistics | Activity */}
      <div className="flex items-center gap-1 rounded-lg border border-vytal-border bg-vytal-card p-1">
        <button
          onClick={() => setView("pipeline")}
          className={cn(
            "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            view === "pipeline"
              ? "bg-vytal-green/10 text-vytal-green"
              : "text-vytal-muted hover:text-vytal-text"
          )}
        >
          <Users className="h-4 w-4" />
          Pipeline
        </button>
        <button
          onClick={() => setView("statistics")}
          className={cn(
            "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            view === "statistics"
              ? "bg-vytal-green/10 text-vytal-green"
              : "text-vytal-muted hover:text-vytal-text"
          )}
        >
          <BarChart3 className="h-4 w-4" />
          Statistics
        </button>
        <button
          onClick={() => setView("activity")}
          className={cn(
            "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            view === "activity"
              ? "bg-vytal-green/10 text-vytal-green"
              : "text-vytal-muted hover:text-vytal-text"
          )}
        >
          <Activity className="h-4 w-4" />
          Activity
        </button>
      </div>

      {/* Quick Actions Bar - only in pipeline */}
      {view === "pipeline" && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setShowAddForm(true)} className="inline-flex items-center gap-1.5 rounded-full border border-vytal-green/20 bg-vytal-green/5 px-3.5 py-1.5 text-xs font-semibold text-vytal-green transition-colors hover:bg-vytal-green/10">
              <Plus className="h-3.5 w-3.5" />
              {t("quickAction.newLead")}
            </button>
            <button onClick={() => importInputRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-full border border-vytal-border bg-vytal-card px-3.5 py-1.5 text-xs font-semibold text-vytal-text transition-colors hover:bg-vytal-bg3">
              <FileText className="h-3.5 w-3.5" />
              {t("quickAction.import")}
            </button>
            <button onClick={() => setView("statistics")} className="inline-flex items-center gap-1.5 rounded-full border border-vytal-border bg-vytal-card px-3.5 py-1.5 text-xs font-semibold text-vytal-text transition-colors hover:bg-vytal-bg3">
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
        </>
      )}

      {/* Statistics View */}
      {view === "statistics" && <StatisticsView />}

      {/* Activity View */}
      {view === "activity" && <ActivityLogView />}
    </div>
  );
}
