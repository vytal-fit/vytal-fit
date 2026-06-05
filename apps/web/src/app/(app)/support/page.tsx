"use client";

import { useState } from "react";
import {
  LifeBuoy,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  X,
  Send,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { useDataStore } from "@/stores/data-store";
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
  createdAt: string;
  assignedTo: string;
  description: string;
  messages: TicketMessage[];
  internalNotes: string;
}

const mockTickets: Ticket[] = [
  {
    id: "tk-1", number: 1001, subject: "Pagamento duplicado no mes de Maio",
    memberName: "Ana Silva", priority: "high", status: "open", createdAt: "2026-06-03T10:30:00",
    assignedTo: "Andre Loureiro", description: "Foi-me cobrado duas vezes o valor do plano mensal em Maio. Preciso de reembolso.",
    messages: [
      { id: "m1", author: "Ana Silva", isStaff: false, content: "Bom dia, verifiquei que fui cobrada duas vezes. Podem verificar?", date: "2026-06-03T10:30:00" },
      { id: "m2", author: "Andre Loureiro", isStaff: true, content: "Bom dia Ana! Vou verificar com o departamento financeiro.", date: "2026-06-03T11:00:00" },
      { id: "m3", author: "Ana Silva", isStaff: false, content: "Obrigada, fico a aguardar.", date: "2026-06-03T11:15:00" },
    ],
    internalNotes: "Verificar com Stripe - possivel duplicacao de webhook.",
  },
  {
    id: "tk-2", number: 1002, subject: "Nao consigo reservar aula de quarta",
    memberName: "Pedro Almeida", priority: "medium", status: "in_progress", createdAt: "2026-06-02T14:00:00",
    assignedTo: "Marine Robba", description: "A app da erro quando tento reservar a aula das 18:00 de quarta-feira.",
    messages: [
      { id: "m1", author: "Pedro Almeida", isStaff: false, content: "A app da-me um erro 500 quando tento reservar.", date: "2026-06-02T14:00:00" },
      { id: "m2", author: "Marine Robba", isStaff: true, content: "Pode enviar-nos um screenshot do erro?", date: "2026-06-02T14:30:00" },
      { id: "m3", author: "Pedro Almeida", isStaff: false, content: "Ja enviei por email.", date: "2026-06-02T15:00:00" },
    ],
    internalNotes: "Bug reportado a equipa de dev. Ticket interno #DEV-234.",
  },
  {
    id: "tk-3", number: 1003, subject: "Rower da zona 2 esta avariado",
    memberName: "Tiago Neves", priority: "medium", status: "open", createdAt: "2026-06-02T09:00:00",
    assignedTo: "Ricardo Ribeiro", description: "O rower numero 4 na zona 2 tem a correia partida.",
    messages: [
      { id: "m1", author: "Tiago Neves", isStaff: false, content: "O rower 4 na zona 2 nao funciona, a correia esta partida.", date: "2026-06-02T09:00:00" },
    ],
    internalNotes: "",
  },
  {
    id: "tk-4", number: 1004, subject: "Quero mudar para plano anual",
    memberName: "Sofia Santos", priority: "low", status: "resolved", createdAt: "2026-06-01T16:00:00",
    assignedTo: "Andre Loureiro", description: "Gostaria de mudar do plano mensal para o plano anual.",
    messages: [
      { id: "m1", author: "Sofia Santos", isStaff: false, content: "Ola, quero mudar para o plano anual. Como faco?", date: "2026-06-01T16:00:00" },
      { id: "m2", author: "Andre Loureiro", isStaff: true, content: "Ja atualizamos o seu plano! A diferenca sera ajustada na proxima fatura.", date: "2026-06-01T17:00:00" },
      { id: "m3", author: "Sofia Santos", isStaff: false, content: "Excelente, obrigada!", date: "2026-06-01T17:15:00" },
    ],
    internalNotes: "Plano atualizado. Diferenca de 180 EUR cobrada.",
  },
  {
    id: "tk-5", number: 1005, subject: "Ac nao funciona na sala 1",
    memberName: "Catarina Reis", priority: "high", status: "in_progress", createdAt: "2026-06-01T11:00:00",
    assignedTo: "Ricardo Ribeiro", description: "O ar condicionado da sala 1 nao esta a funcionar. A temperatura esta insuportavel.",
    messages: [
      { id: "m1", author: "Catarina Reis", isStaff: false, content: "O AC da sala 1 esta avariado. Esta impossivel treinar.", date: "2026-06-01T11:00:00" },
      { id: "m2", author: "Ricardo Ribeiro", isStaff: true, content: "Ja contactamos o tecnico. Deve estar resolvido amanha.", date: "2026-06-01T12:00:00" },
    ],
    internalNotes: "Tecnico agendado para 2/Jun.",
  },
  {
    id: "tk-6", number: 1006, subject: "Perdi o meu cartao de acesso",
    memberName: "Miguel Costa", priority: "low", status: "resolved", createdAt: "2026-05-30T08:00:00",
    assignedTo: "Marine Robba", description: "Perdi o meu cartao RFID de acesso ao box.",
    messages: [
      { id: "m1", author: "Miguel Costa", isStaff: false, content: "Perdi o cartao, como obtenho um novo?", date: "2026-05-30T08:00:00" },
      { id: "m2", author: "Marine Robba", isStaff: true, content: "Pode passar na recepcao para pedir um novo. Custo de 5 EUR.", date: "2026-05-30T09:00:00" },
    ],
    internalNotes: "",
  },
  {
    id: "tk-7", number: 1007, subject: "App crashou durante treino",
    memberName: "Diogo Martins", priority: "medium", status: "open", createdAt: "2026-05-29T19:00:00",
    assignedTo: "Andre Loureiro", description: "A app crashou durante o WOD e perdi os meus tempos.",
    messages: [
      { id: "m1", author: "Diogo Martins", isStaff: false, content: "A app crashou e perdi todos os dados do treino.", date: "2026-05-29T19:00:00" },
    ],
    internalNotes: "Bug conhec. Reportado ao dev.",
  },
  {
    id: "tk-8", number: 1008, subject: "Horario de Open Box errado na app",
    memberName: "Helena Cardoso", priority: "low", status: "resolved", createdAt: "2026-05-28T07:00:00",
    assignedTo: "Marine Robba", description: "O horario de Open Box no sabado esta errado na app. Diz 08:00 mas e 09:00.",
    messages: [
      { id: "m1", author: "Helena Cardoso", isStaff: false, content: "O horario esta errado na app.", date: "2026-05-28T07:00:00" },
      { id: "m2", author: "Marine Robba", isStaff: true, content: "Obrigada pelo aviso! Ja corrigimos.", date: "2026-05-28T08:00:00" },
    ],
    internalNotes: "",
  },
  {
    id: "tk-9", number: 1009, subject: "Desconto de estudante nao aplicado",
    memberName: "Francisca Nunes", priority: "medium", status: "closed", createdAt: "2026-05-27T10:00:00",
    assignedTo: "Andre Loureiro", description: "O desconto de estudante de 15% nao foi aplicado na minha fatura.",
    messages: [
      { id: "m1", author: "Francisca Nunes", isStaff: false, content: "O meu desconto de estudante nao foi aplicado.", date: "2026-05-27T10:00:00" },
      { id: "m2", author: "Andre Loureiro", isStaff: true, content: "Desculpe pelo inconveniente! Ja aplicamos o desconto e emitimos uma nota de credito.", date: "2026-05-27T11:00:00" },
      { id: "m3", author: "Francisca Nunes", isStaff: false, content: "Obrigada pela resolucao rapida!", date: "2026-05-27T11:30:00" },
    ],
    internalNotes: "Nota de credito emitida: NC-2026-089.",
  },
  {
    id: "tk-10", number: 1010, subject: "Solicitar fatura com NIF empresa",
    memberName: "Rui Goncalves", priority: "low", status: "closed", createdAt: "2026-05-26T14:00:00",
    assignedTo: "Marine Robba", description: "Preciso que a fatura seja emitida com o NIF da minha empresa.",
    messages: [
      { id: "m1", author: "Rui Goncalves", isStaff: false, content: "Podem emitir a fatura com NIF da empresa?", date: "2026-05-26T14:00:00" },
      { id: "m2", author: "Marine Robba", isStaff: true, content: "Claro! Pode enviar-nos os dados da empresa por email.", date: "2026-05-26T15:00:00" },
    ],
    internalNotes: "",
  },
];

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
  const coaches = useDataStore((s) => s.coaches);
  const members = useDataStore((s) => s.members);

  const [tickets, setTickets] = useState(mockTickets);
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

  const filteredTickets =
    statusFilter === "all" ? tickets : tickets.filter((tk) => tk.status === statusFilter);

  const openCount = tickets.filter((tk) => tk.status === "open").length;
  const inProgressCount = tickets.filter((tk) => tk.status === "in_progress").length;

  const handleCreateTicket = () => {
    if (!newTicket.subject || !newTicket.memberName) {
      toast(t("support.fillRequired"), "error");
      return;
    }
    const tk: Ticket = {
      id: `tk-${Date.now()}`,
      number: Math.max(...tickets.map((t) => t.number)) + 1,
      subject: newTicket.subject,
      memberName: newTicket.memberName,
      priority: newTicket.priority,
      status: "open",
      createdAt: new Date().toISOString(),
      assignedTo: newTicket.assignedTo || "Unassigned",
      description: newTicket.description,
      messages: [],
      internalNotes: "",
    };
    setTickets([tk, ...tickets]);
    setShowCreate(false);
    setNewTicket({ memberName: "", subject: "", description: "", priority: "medium", assignedTo: "" });
    toast(t("support.ticketCreated"), "success");
  };

  const updateTicketStatus = (id: string, status: TicketStatus) => {
    setTickets((prev) => prev.map((tk) => (tk.id === id ? { ...tk, status } : tk)));
    toast(t("support.statusUpdated"), "success");
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
