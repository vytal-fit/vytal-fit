"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { trpc } from "@/lib/trpc";

import { Breadcrumbs } from "@/components/breadcrumbs";

type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
type TicketPriority = "high" | "medium" | "low";

interface TicketMessage {
  id: string;
  author: string;
  isStaff: boolean;
  content: string;
  date: string;
}

interface Ticket {
  id: string;
  number: number;
  subject: string;
  memberName: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string | Date;
  assignedTo: string;
  description: string;
  messages: TicketMessage[];
  internalNotes: string;
}
const statusConfig: Record<TicketStatus, { label: string; className: string; icon: typeof CheckCircle }> = {
  open: { label: "Open", className: "bg-vytal-red/10 text-vytal-red", icon: AlertCircle },
  in_progress: { label: "In Progress", className: "bg-vytal-amber/10 text-vytal-amber", icon: Loader2 },
  resolved: { label: "Resolved", className: "bg-vytal-green/10 text-vytal-green", icon: CheckCircle },
  closed: { label: "Closed", className: "bg-vytal-muted/10 text-vytal-muted", icon: CheckCircle },
};

const priorityConfig: Record<TicketPriority, { label: string; className: string }> = {
  high: { label: "High", className: "bg-vytal-red/10 text-vytal-red" },
  medium: { label: "Medium", className: "bg-vytal-amber/10 text-vytal-amber" },
  low: { label: "Low", className: "bg-vytal-muted/10 text-vytal-muted" },
};

export default function SupportPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const ticketsQuery = trpc.supportTickets.list.useQuery({ limit: 100 });
  const createTicketMutation = trpc.supportTickets.create.useMutation({
    onSuccess: async () => {
      await utils.supportTickets.list.invalidate();
      toast(t("support.ticketCreated"), "success");
      setShowCreate(false);
      setNewTicket({ memberName: "", subject: "", description: "", priority: "medium", assignedTo: "" });
    },
    onError: () => toast(t("ui.error"), "error"),
  });
  const updateStatusMutation = trpc.supportTickets.updateStatus.useMutation({
    onSuccess: async () => {
      await utils.supportTickets.list.invalidate();
      toast(t("support.statusUpdated"), "success");
    },
    onError: () => toast(t("ui.error"), "error"),
  });

  const [statusFilter, setStatusFilter] = useState<"all" | TicketStatus>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTicket, setNewTicket] = useState({
    memberName: "",
    subject: "",
    description: "",
    priority: "medium" as TicketPriority,
    assignedTo: "",
  });

  const tickets = useMemo(() => (ticketsQuery.data ?? []) as Ticket[], [ticketsQuery.data]);
  const filteredTickets = useMemo(
    () => (statusFilter === "all" ? tickets : tickets.filter((tk) => tk.status === statusFilter)),
    [statusFilter, tickets],
  );

  const openCount = tickets.filter((tk) => tk.status === "open").length;
  const inProgressCount = tickets.filter((tk) => tk.status === "in_progress").length;

  const handleCreateTicket = () => {
    if (!newTicket.subject || !newTicket.memberName) {
      toast(t("support.fillRequired"), "error");
      return;
    }
    createTicketMutation.mutate({
      memberName: newTicket.memberName,
      subject: newTicket.subject,
      description: newTicket.description,
      priority: newTicket.priority,
      assignedTo: newTicket.assignedTo || "Unassigned",
    });
  };

  const updateTicketStatus = (id: string, status: TicketStatus) => {
    updateStatusMutation.mutate({ id, status });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumbs items={[{ label: t("support.title") }]} />
          <p className="mt-1 text-sm text-vytal-muted">{t("support.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Plus className="h-4 w-4" />
          {t("support.createTicket")}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-red/10">
              <AlertCircle className="h-4.5 w-4.5 text-vytal-red" />
            </div>
            <span className="text-sm text-vytal-muted">{t("support.open")}</span>
          </div>
          <span className="text-3xl font-bold text-vytal-text">{openCount}</span>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-amber/10">
              <Loader2 className="h-4.5 w-4.5 text-vytal-amber" />
            </div>
            <span className="text-sm text-vytal-muted">{t("support.inProgress")}</span>
          </div>
          <span className="text-3xl font-bold text-vytal-text">{inProgressCount}</span>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-green/10">
              <Clock className="h-4.5 w-4.5 text-vytal-green" />
            </div>
            <span className="text-sm text-vytal-muted">{t("support.avgResolution")}</span>
          </div>
          <span className="text-3xl font-bold text-vytal-text">4h</span>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        {(["all", "open", "in_progress", "resolved", "closed"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
              statusFilter === status
                ? "bg-vytal-green/10 text-vytal-green ring-1 ring-vytal-green/30"
                : "bg-vytal-bg3 text-vytal-muted hover:text-vytal-text"
            )}
          >
            {status === "all" ? t("support.all") : statusConfig[status].label}
          </button>
        ))}
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="rounded-xl border border-vytal-green/30 bg-vytal-bg2 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-vytal-text">{t("support.newTicket")}</h3>
            <button onClick={() => setShowCreate(false)} className="text-vytal-muted hover:text-vytal-text">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-vytal-text mb-1.5">{t("support.member")}</label>
              <input
                type="text"
                value={newTicket.memberName}
                onChange={(e) => setNewTicket({ ...newTicket, memberName: e.target.value })}
                placeholder={t("support.memberPlaceholder")}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg px-3 py-2 text-sm text-vytal-text outline-none focus:ring-2 focus:ring-vytal-green/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-vytal-text mb-1.5">{t("support.priority")}</label>
              <select
                value={newTicket.priority}
                onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as TicketPriority })}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg px-3 py-2 text-sm text-vytal-text outline-none focus:ring-2 focus:ring-vytal-green/30"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-vytal-text mb-1.5">{t("support.subject")}</label>
            <input
              type="text"
              value={newTicket.subject}
              onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg px-3 py-2 text-sm text-vytal-text outline-none focus:ring-2 focus:ring-vytal-green/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-vytal-text mb-1.5">{t("support.description")}</label>
            <textarea
              value={newTicket.description}
              onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg px-3 py-2 text-sm text-vytal-text outline-none focus:ring-2 focus:ring-vytal-green/30 resize-none"
            />
          </div>
          <div className="flex justify-end">
            <button onClick={handleCreateTicket} className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90">
              <Plus className="h-4 w-4" />
              {t("support.create")}
            </button>
          </div>
        </div>
      )}

      {/* Ticket list */}
      <div className="rounded-xl border border-vytal-border bg-vytal-bg2 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="zebra-table w-full text-sm">
            <thead>
              <tr className="border-b border-vytal-border bg-vytal-bg2 text-left">
                <th className="px-5 py-3 font-semibold text-vytal-muted">#</th>
                <th className="px-5 py-3 font-semibold text-vytal-muted">{t("support.subject")}</th>
                <th className="px-5 py-3 font-semibold text-vytal-muted">{t("support.member")}</th>
                <th className="px-5 py-3 font-semibold text-vytal-muted">{t("support.priority")}</th>
                <th className="px-5 py-3 font-semibold text-vytal-muted">{t("support.status")}</th>
                <th className="px-5 py-3 font-semibold text-vytal-muted">{t("support.assigned")}</th>
                <th className="px-5 py-3 font-semibold text-vytal-muted">{t("support.created")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((tk) => {
                const isExpanded = expandedId === tk.id;
                const sc = statusConfig[tk.status];
                const pc = priorityConfig[tk.priority];
                const StatusIcon = sc.icon;

                return (
                  <>
                    <tr
                      key={tk.id}
                      onClick={() => setExpandedId(isExpanded ? null : tk.id)}
                      className="border-b border-vytal-border last:border-b-0 cursor-pointer hover:bg-vytal-bg3/30 transition-colors"
                    >
                      <td className="px-5 py-3 text-vytal-muted">{tk.number}</td>
                      <td className="px-5 py-3 font-medium text-vytal-text">{tk.subject}</td>
                      <td className="px-5 py-3 text-vytal-muted">{tk.memberName}</td>
                      <td className="px-5 py-3">
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", pc.className)}>{pc.label}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", sc.className)}>
                          <StatusIcon className="h-3 w-3" />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-vytal-muted">{tk.assignedTo}</td>
                      <td className="px-5 py-3 text-vytal-muted">
                        {new Date(tk.createdAt).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${tk.id}-detail`}>
                        <td colSpan={7} className="bg-vytal-bg3/20 px-5 py-4">
                          <div className="space-y-4">
                            <p className="text-sm text-vytal-muted">{tk.description}</p>

                            {/* Conversation */}
                            {tk.messages.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-vytal-text">{t("support.conversation")}</h4>
                                {tk.messages.map((msg) => (
                                  <div
                                    key={msg.id}
                                    className={cn(
                                      "rounded-lg p-3 text-sm",
                                      msg.isStaff ? "bg-vytal-green/[0.05] border border-vytal-green/10" : "bg-vytal-bg border border-vytal-border"
                                    )}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className={cn("text-xs font-semibold", msg.isStaff ? "text-vytal-green" : "text-vytal-text")}>
                                        {msg.author} {msg.isStaff && "(Staff)"}
                                      </span>
                                      <span className="text-[10px] text-vytal-muted">
                                        {new Date(msg.date).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                                      </span>
                                    </div>
                                    <p className="text-vytal-muted">{msg.content}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Internal notes */}
                            {tk.internalNotes && (
                              <div className="rounded-lg border border-vytal-amber/20 bg-vytal-amber/[0.03] p-3">
                                <h4 className="text-xs font-semibold text-vytal-amber mb-1">{t("support.internalNotes")}</h4>
                                <p className="text-xs text-vytal-muted">{tk.internalNotes}</p>
                              </div>
                            )}

                            {/* Status actions */}
                            <div className="flex items-center gap-2">
                              {tk.status !== "resolved" && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); updateTicketStatus(tk.id, "resolved"); }}
                                  className="rounded-lg bg-vytal-green/10 px-3 py-1.5 text-xs font-semibold text-vytal-green hover:bg-vytal-green/20 transition-colors"
                                >
                                  {t("support.markResolved")}
                                </button>
                              )}
                              {tk.status !== "in_progress" && tk.status !== "resolved" && tk.status !== "closed" && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); updateTicketStatus(tk.id, "in_progress"); }}
                                  className="rounded-lg bg-vytal-amber/10 px-3 py-1.5 text-xs font-semibold text-vytal-amber hover:bg-vytal-amber/20 transition-colors"
                                >
                                  {t("support.markInProgress")}
                                </button>
                              )}
                              {tk.status === "resolved" && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); updateTicketStatus(tk.id, "closed"); }}
                                  className="rounded-lg bg-vytal-muted/10 px-3 py-1.5 text-xs font-semibold text-vytal-muted hover:bg-vytal-muted/20 transition-colors"
                                >
                                  {t("support.close")}
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
