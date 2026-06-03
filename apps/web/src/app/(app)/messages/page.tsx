"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Search,
  Send,
  Paperclip,
  MessageCircle,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useDataStore } from "@/stores/data-store";

// ---------------------------------------------------------------------------
// Quick replies
// ---------------------------------------------------------------------------

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
  const conversations = useDataStore((s) => s.conversations);
  const storeSendMessage = useDataStore((s) => s.sendMessage);
  const storeMarkAsRead = useDataStore((s) => s.markAsRead);

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
    c.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Send message
  const handleSend = useCallback(() => {
    if (!inputText.trim() || !selectedConvId) return;
    storeSendMessage(selectedConvId, inputText.trim());
    setInputText("");
  }, [inputText, selectedConvId, storeSendMessage]);

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
    storeMarkAsRead(convId);
  }, [storeMarkAsRead]);

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
          {filteredConversations.map((conv) => {
            const lastMsg = conv.messages[conv.messages.length - 1];
            return (
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
                      conv.contactStatus === "active"
                        ? "bg-vytal-green/10 text-vytal-green"
                        : conv.contactStatus === "trial"
                          ? "bg-vytal-amber/10 text-vytal-amber"
                          : "bg-vytal-red/10 text-vytal-red"
                    )}
                  >
                    {conv.contactInitials}
                  </div>
                  {conv.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-vytal-bg2 bg-vytal-green" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-vytal-text truncate">
                      {conv.contactName}
                    </span>
                    <span className="shrink-0 text-[10px] text-vytal-muted">
                      {conv.lastMessageTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="mt-0.5 text-xs text-vytal-muted truncate">
                      {lastMsg?.text ?? ""}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-vytal-green text-[10px] font-bold text-vytal-bg">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
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
                    selectedConv.contactStatus === "active"
                      ? "bg-vytal-green/10 text-vytal-green"
                      : selectedConv.contactStatus === "trial"
                        ? "bg-vytal-amber/10 text-vytal-amber"
                        : "bg-vytal-red/10 text-vytal-red"
                  )}
                >
                  {selectedConv.contactInitials}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-vytal-text">
                    {selectedConv.contactName}
                  </h3>
                  <span
                    className={cn(
                      "text-[10px] font-semibold capitalize",
                      selectedConv.contactStatus === "active"
                        ? "text-vytal-green"
                        : selectedConv.contactStatus === "trial"
                          ? "text-vytal-amber"
                          : "text-vytal-red"
                    )}
                  >
                    {selectedConv.contactStatus}
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
                {selectedConv.messages.map((msg, idx) => (
                  <div key={idx}>
                    <div
                      className={cn(
                        "flex",
                        msg.fromMe ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-2xl px-4 py-2.5",
                          msg.fromMe
                            ? "rounded-br-md bg-vytal-green/15 text-vytal-text"
                            : "rounded-bl-md bg-vytal-bg3 text-vytal-text"
                        )}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <div
                          className={cn(
                            "mt-1 flex items-center gap-1",
                            msg.fromMe ? "justify-end" : "justify-start"
                          )}
                        >
                          <span className="text-[10px] text-vytal-muted">
                            {msg.time}
                          </span>
                          {msg.fromMe && (
                            <CheckCheck className="h-3 w-3 text-vytal-green" />
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
