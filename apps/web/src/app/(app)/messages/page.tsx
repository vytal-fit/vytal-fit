"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { mockMembers } from "@vytal-fit/shared";
import {
  Search,
  Send,
  Paperclip,
  MessageCircle,
  CheckCheck,
  Check,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Message {
  id: string;
  text: string;
  sender: "member" | "staff";
  timestamp: string;
  read: boolean;
  dateSeparator?: string;
}

interface Conversation {
  id: string;
  memberName: string;
  initials: string;
  status: "active" | "trial" | "inactive";
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
  messages: Message[];
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const statusColors: Record<string, string> = {
  active: "bg-vytal-green",
  trial: "bg-vytal-amber",
  inactive: "bg-vytal-red",
};

const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    memberName: "Ana Silva",
    initials: "AS",
    status: "active",
    lastMessage: "Obrigada pela informacao!",
    lastMessageTime: "2m ago",
    unreadCount: 2,
    online: true,
    messages: [
      { id: "m1-1", text: "Ola, gostaria de saber sobre o plano semestral", sender: "member", timestamp: "10:15", read: true, dateSeparator: "Hoje" },
      { id: "m1-2", text: "Claro! O plano semestral custa 390\u20AC e inclui todas as aulas", sender: "staff", timestamp: "10:18", read: true },
      { id: "m1-3", text: "Posso fazer uma aula experimental primeiro?", sender: "member", timestamp: "10:20", read: true },
      { id: "m1-4", text: "Sim, claro! Pode agendar uma aula experimental gratuita pela app ou diretamente connosco.", sender: "staff", timestamp: "10:22", read: true },
      { id: "m1-5", text: "Optimo! Gostaria de experimentar a aula das 18:00 de quarta-feira", sender: "member", timestamp: "10:25", read: true },
      { id: "m1-6", text: "Perfeito! Fica registada a sua aula experimental para quarta-feira as 18:00. Traga roupa confortavel e uma garrafa de agua.", sender: "staff", timestamp: "10:28", read: true },
      { id: "m1-7", text: "E preciso ter alguma experiencia previa?", sender: "member", timestamp: "10:30", read: true },
      { id: "m1-8", text: "Nao, todas as aulas sao adaptadas ao nivel de cada atleta. O nosso coach vai acompanha-la durante toda a aula.", sender: "staff", timestamp: "10:33", read: true },
      { id: "m1-9", text: "Excelente! Muito obrigada pela ajuda!", sender: "member", timestamp: "10:35", read: false },
      { id: "m1-10", text: "Obrigada pela informacao!", sender: "member", timestamp: "10:36", read: false },
    ],
  },
  {
    id: "conv-2",
    memberName: "Pedro Almeida",
    initials: "PA",
    status: "active",
    lastMessage: "Vou passar amanha de manha",
    lastMessageTime: "15m ago",
    unreadCount: 1,
    online: true,
    messages: [
      { id: "m2-1", text: "Bom dia! Queria saber se amanha ha Open Box de manha", sender: "member", timestamp: "09:00", read: true, dateSeparator: "Hoje" },
      { id: "m2-2", text: "Bom dia Pedro! Sim, temos Open Box amanha das 08:00 as 10:00", sender: "staff", timestamp: "09:05", read: true },
      { id: "m2-3", text: "E preciso reservar lugar?", sender: "member", timestamp: "09:08", read: true },
      { id: "m2-4", text: "Sim, recomendamos que reserve pela app para garantir o seu lugar. A capacidade e limitada.", sender: "staff", timestamp: "09:12", read: true },
      { id: "m2-5", text: "Vou passar amanha de manha", sender: "member", timestamp: "09:15", read: false },
    ],
  },
  {
    id: "conv-3",
    memberName: "Tiago Neves",
    initials: "TN",
    status: "trial",
    lastMessage: "Onde posso ver os horarios?",
    lastMessageTime: "1h ago",
    unreadCount: 0,
    online: false,
    messages: [
      { id: "m3-1", text: "Ola! Fiz a minha aula experimental ontem e gostei muito!", sender: "member", timestamp: "14:00", read: true, dateSeparator: "Ontem" },
      { id: "m3-2", text: "Que otimo, Tiago! Ficamos contentes que tenha gostado. Gostaria de conhecer os nossos planos?", sender: "staff", timestamp: "14:10", read: true },
      { id: "m3-3", text: "Sim! Pode consultar o horario na app.", sender: "staff", timestamp: "14:12", read: true },
      { id: "m3-4", text: "Onde posso ver os horarios?", sender: "member", timestamp: "14:20", read: true },
    ],
  },
  {
    id: "conv-4",
    memberName: "Sofia Santos",
    initials: "SS",
    status: "active",
    lastMessage: "O pagamento foi processado?",
    lastMessageTime: "3h ago",
    unreadCount: 0,
    online: false,
    messages: [
      { id: "m4-1", text: "Boa tarde, o meu pagamento mensal foi processado?", sender: "member", timestamp: "11:00", read: true, dateSeparator: "Hoje" },
      { id: "m4-2", text: "Boa tarde Sofia! Sim, o pagamento foi processado com sucesso. Pode consultar o recibo na app.", sender: "staff", timestamp: "11:15", read: true },
      { id: "m4-3", text: "O pagamento foi processado?", sender: "member", timestamp: "11:00", read: true },
    ],
  },
  {
    id: "conv-5",
    memberName: "Miguel Costa",
    initials: "MC",
    status: "active",
    lastMessage: "Pode contactar-nos pelo telefone",
    lastMessageTime: "5h ago",
    unreadCount: 0,
    online: true,
    messages: [
      { id: "m5-1", text: "Ola, gostaria de cancelar a minha aula de amanha", sender: "member", timestamp: "08:00", read: true, dateSeparator: "Hoje" },
      { id: "m5-2", text: "Bom dia Miguel! Pode cancelar diretamente pela app ate 2 horas antes da aula.", sender: "staff", timestamp: "08:10", read: true },
      { id: "m5-3", text: "Nao consigo pela app, da-me um erro", sender: "member", timestamp: "08:15", read: true },
      { id: "m5-4", text: "Pode contactar-nos pelo telefone tambem. Ja cancelamos a sua aula.", sender: "staff", timestamp: "08:20", read: true },
    ],
  },
  {
    id: "conv-6",
    memberName: "Maria Oliveira",
    initials: "MO",
    status: "inactive",
    lastMessage: "Gostava de voltar ao treino",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
    online: false,
    messages: [
      { id: "m6-1", text: "Ola, estive ausente uns meses. Gostava de voltar ao treino", sender: "member", timestamp: "16:00", read: true, dateSeparator: "Ontem" },
      { id: "m6-2", text: "Ola Maria! Ficamos contentes em sabe-lo. Temos disponibilidade esta semana para uma conversa?", sender: "staff", timestamp: "16:30", read: true },
    ],
  },
  {
    id: "conv-7",
    memberName: "Ines Ferreira",
    initials: "IF",
    status: "active",
    lastMessage: "A minha aula experimental esta confirmada?",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
    online: false,
    messages: [
      { id: "m7-1", text: "Ola! Trouxe uma amiga que quer experimentar. Pode vir amanha?", sender: "member", timestamp: "18:00", read: true, dateSeparator: "Ontem" },
      { id: "m7-2", text: "Claro, Ines! A sua aula experimental esta confirmada! Pode vir as 18:00.", sender: "staff", timestamp: "18:15", read: true },
      { id: "m7-3", text: "A minha aula experimental esta confirmada?", sender: "member", timestamp: "18:20", read: true },
    ],
  },
  {
    id: "conv-8",
    memberName: "Jose Fonte",
    initials: "JF",
    status: "active",
    lastMessage: "Obrigado pela mensagem!",
    lastMessageTime: "2d ago",
    unreadCount: 0,
    online: false,
    messages: [
      { id: "m8-1", text: "Bom dia! Quero mudar para o plano anual. Como faco?", sender: "member", timestamp: "10:00", read: true, dateSeparator: "01 Jun" },
      { id: "m8-2", text: "Bom dia Jose! Pode fazer a mudanca diretamente na app em 'O Meu Plano'. Obrigado pela mensagem!", sender: "staff", timestamp: "10:30", read: true },
      { id: "m8-3", text: "Obrigado pela mensagem!", sender: "member", timestamp: "10:35", read: true },
    ],
  },
];

const quickReplies = [
  "Obrigado pela mensagem! Vamos responder em breve.",
  "A sua aula experimental esta confirmada!",
  "O pagamento foi processado com sucesso.",
  "Pode consultar o horario na app.",
  "Temos disponibilidade esta semana.",
  "Pode contactar-nos pelo telefone tambem.",
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  const selectedConv = conversations.find((c) => c.id === selectedConvId) ?? null;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConv?.messages.length]);

  // Filter conversations
  const filteredConversations = conversations.filter((c) =>
    c.memberName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Send message
  const handleSend = useCallback(() => {
    if (!inputText.trim() || !selectedConvId) return;

    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      text: inputText.trim(),
      sender: "staff",
      timestamp,
      read: false,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConvId
          ? {
              ...c,
              messages: [...c.messages, newMessage],
              lastMessage: newMessage.text,
              lastMessageTime: "Just now",
            }
          : c
      )
    );
    setInputText("");
  }, [inputText, selectedConvId]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleSelectConversation = useCallback((convId: string) => {
    setSelectedConvId(convId);
    // Mark as read
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              unreadCount: 0,
              messages: c.messages.map((m) => ({ ...m, read: true })),
            }
          : c
      )
    );
  }, []);

  const handleQuickReply = useCallback((text: string) => {
    setInputText(text);
    setShowQuickReplies(false);
  }, []);

  return (
    <div className="flex h-[calc(100vh-7rem)] overflow-hidden rounded-xl border border-vytal-border">
      {/* Left Panel — Conversation List */}
      <div className="flex w-80 shrink-0 flex-col border-r border-vytal-border bg-vytal-bg2">
        {/* Header */}
        <div className="border-b border-vytal-border p-4">
          <h2 className="text-lg font-bold text-vytal-text">{t("messages.title")}</h2>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vytal-muted" />
            <input
              type="text"
              placeholder={t("messages.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg3 py-2 pl-9 pr-3 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => handleSelectConversation(conv.id)}
              className={cn(
                "flex w-full items-start gap-3 border-b border-vytal-border px-4 py-3 text-left transition-colors hover:bg-vytal-bg3",
                selectedConvId === conv.id && "bg-vytal-green/5"
              )}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold",
                    conv.status === "active"
                      ? "bg-vytal-green/10 text-vytal-green"
                      : conv.status === "trial"
                        ? "bg-vytal-amber/10 text-vytal-amber"
                        : "bg-vytal-red/10 text-vytal-red"
                  )}
                >
                  {conv.initials}
                </div>
                {conv.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-vytal-bg2 bg-vytal-green" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-vytal-text truncate">
                    {conv.memberName}
                  </span>
                  <span className="shrink-0 text-[10px] text-vytal-muted">
                    {conv.lastMessageTime}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="mt-0.5 text-xs text-vytal-muted truncate">
                    {conv.lastMessage}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-vytal-green text-[10px] font-bold text-vytal-bg">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel — Chat Area */}
      <div className="flex flex-1 flex-col bg-vytal-bg">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-vytal-border bg-vytal-bg2/50 px-6 py-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold",
                    selectedConv.status === "active"
                      ? "bg-vytal-green/10 text-vytal-green"
                      : selectedConv.status === "trial"
                        ? "bg-vytal-amber/10 text-vytal-amber"
                        : "bg-vytal-red/10 text-vytal-red"
                  )}
                >
                  {selectedConv.initials}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-vytal-text">
                    {selectedConv.memberName}
                  </h3>
                  <span
                    className={cn(
                      "text-[10px] font-semibold capitalize",
                      selectedConv.status === "active"
                        ? "text-vytal-green"
                        : selectedConv.status === "trial"
                          ? "text-vytal-amber"
                          : "text-vytal-red"
                    )}
                  >
                    {selectedConv.status}
                    {selectedConv.online && " \u00B7 Online"}
                  </span>
                </div>
              </div>
              <button className="flex items-center gap-1 text-xs text-vytal-muted transition-colors hover:text-vytal-text">
                <User className="h-3.5 w-3.5" />
                {t("messages.viewProfile")}
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-3">
                {selectedConv.messages.map((msg) => (
                  <div key={msg.id}>
                    {msg.dateSeparator && (
                      <div className="my-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-vytal-border" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-vytal-muted">
                          {msg.dateSeparator}
                        </span>
                        <div className="h-px flex-1 bg-vytal-border" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "flex",
                        msg.sender === "staff" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-2xl px-4 py-2.5",
                          msg.sender === "staff"
                            ? "rounded-br-md bg-vytal-green/15 text-vytal-text"
                            : "rounded-bl-md bg-vytal-bg3 text-vytal-text"
                        )}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <div
                          className={cn(
                            "mt-1 flex items-center gap-1",
                            msg.sender === "staff" ? "justify-end" : "justify-start"
                          )}
                        >
                          <span className="text-[10px] text-vytal-muted">
                            {msg.timestamp}
                          </span>
                          {msg.sender === "staff" && (
                            msg.read ? (
                              <CheckCheck className="h-3 w-3 text-vytal-green" />
                            ) : (
                              <Check className="h-3 w-3 text-vytal-muted" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Quick Replies */}
            {showQuickReplies && (
              <div className="border-t border-vytal-border bg-vytal-bg2/50 px-6 py-3">
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickReply(reply)}
                      className="rounded-full border border-vytal-border bg-vytal-bg3 px-3 py-1.5 text-xs text-vytal-muted transition-colors hover:border-vytal-green/30 hover:text-vytal-text"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-vytal-border bg-vytal-bg2/50 px-6 py-4">
              <div className="flex items-end gap-3">
                <button
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
                  title="Attach file"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowQuickReplies((v) => !v)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
                  title="Quick replies"
                >
                  {showQuickReplies ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                </button>
                <input
                  type="text"
                  placeholder={t("messages.placeholder")}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 rounded-lg border border-vytal-border bg-vytal-bg3 px-4 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                    inputText.trim()
                      ? "bg-vytal-green text-vytal-bg hover:bg-vytal-green/90"
                      : "bg-vytal-bg3 text-vytal-muted"
                  )}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-vytal-bg3">
              <MessageCircle className="h-10 w-10 text-vytal-muted" />
            </div>
            <p className="mt-4 text-lg font-semibold text-vytal-text">
              {t("messages.selectConversation")}
            </p>
            <p className="mt-1 text-sm text-vytal-muted">
              {t("messages.selectConversationSub")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
