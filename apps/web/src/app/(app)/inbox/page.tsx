"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Inbox,
  Search,
  Send,
  Mail,
  MessageSquare,
  Bell,
  Smartphone,
  Archive,
  Star,
  Paperclip,
  X,
  ChevronRight,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MessageType = "email" | "sms" | "chat" | "system";
type FolderType = "inbox" | "sent" | "sms" | "email" | "notifications" | "archive";

interface InboxMessage {
  id: string;
  type: MessageType;
  folder: FolderType;
  from: string;
  fromInitials: string;
  to: string;
  subject: string;
  preview: string;
  body: string;
  timestamp: string;
  timeLabel: string;
  read: boolean;
  starred: boolean;
}

// ---------------------------------------------------------------------------
// Mock messages
// ---------------------------------------------------------------------------

const initialMessages: InboxMessage[] = [
  {
    id: "msg-1",
    type: "email",
    folder: "inbox",
    from: "Ana Silva",
    fromInitials: "AS",
    to: "CrossFit Aveiro",
    subject: "Inquiry about membership plans",
    preview: "Hi, I would like to know more about your membership options...",
    body: "Hi,\n\nI would like to know more about your membership options. I am interested in the 3-month plan. Could you send me the details including pricing and what is included?\n\nI am also interested in personal training sessions. Do you offer packages?\n\nThank you,\nAna Silva",
    timestamp: "2026-06-04T09:30:00",
    timeLabel: "9:30 AM",
    read: false,
    starred: false,
  },
  {
    id: "msg-2",
    type: "sms",
    folder: "inbox",
    from: "Pedro Almeida",
    fromInitials: "PA",
    to: "CrossFit Aveiro",
    subject: "SMS from Pedro Almeida",
    preview: "Can I reschedule my PT session to Thursday?",
    body: "Can I reschedule my PT session to Thursday? The 6pm slot would work best for me.",
    timestamp: "2026-06-04T09:15:00",
    timeLabel: "9:15 AM",
    read: false,
    starred: false,
  },
  {
    id: "msg-3",
    type: "system",
    folder: "notifications",
    from: "System",
    fromInitials: "SY",
    to: "CrossFit Aveiro",
    subject: "Payment failed - Miguel Costa",
    preview: "Monthly payment of EUR 75.00 failed for member Miguel Costa...",
    body: "Monthly payment of EUR 75.00 failed for member Miguel Costa.\n\nReason: Insufficient funds\nCard ending: 4521\n\nPlease contact the member to update their payment method.",
    timestamp: "2026-06-04T08:45:00",
    timeLabel: "8:45 AM",
    read: false,
    starred: true,
  },
  {
    id: "msg-4",
    type: "chat",
    folder: "inbox",
    from: "Tiago Neves",
    fromInitials: "TN",
    to: "CrossFit Aveiro",
    subject: "Question about WOD",
    preview: "Hey! What is the scaling option for today's WOD?",
    body: "Hey! What is the scaling option for today's WOD? I have a shoulder injury and cannot do overhead movements. Is there an alternative?",
    timestamp: "2026-06-04T08:20:00",
    timeLabel: "8:20 AM",
    read: false,
    starred: false,
  },
  {
    id: "msg-5",
    type: "system",
    folder: "notifications",
    from: "System",
    fromInitials: "SY",
    to: "CrossFit Aveiro",
    subject: "New booking confirmed",
    preview: "Sofia Santos booked CrossFit WOD at 18:00 on June 5th",
    body: "New booking confirmed:\n\nMember: Sofia Santos\nClass: CrossFit WOD\nDate: June 5, 2026\nTime: 18:00\nCoach: Andre Figueiredo",
    timestamp: "2026-06-04T07:55:00",
    timeLabel: "7:55 AM",
    read: true,
    starred: false,
  },
  {
    id: "msg-6",
    type: "email",
    folder: "inbox",
    from: "Ines Ferreira",
    fromInitials: "IF",
    to: "CrossFit Aveiro",
    subject: "Referral - friend wants to join",
    preview: "My friend Maria would like to try a class. Can she come Saturday?",
    body: "Hi!\n\nMy friend Maria would like to try a class this Saturday. She has no CrossFit experience but is very athletic (runs and swims regularly).\n\nCan she join the 10:00 class? What should she bring?\n\nThanks,\nInes",
    timestamp: "2026-06-03T18:30:00",
    timeLabel: "Yesterday",
    read: true,
    starred: true,
  },
  {
    id: "msg-7",
    type: "sms",
    folder: "sent",
    from: "CrossFit Aveiro",
    fromInitials: "CA",
    to: "Jose Fonte",
    subject: "SMS to Jose Fonte",
    preview: "Your plan upgrade has been confirmed. Welcome to the annual plan!",
    body: "Hi Jose! Your plan upgrade has been confirmed. Welcome to the annual plan! You now have access to all classes and open box sessions. Enjoy!",
    timestamp: "2026-06-03T17:00:00",
    timeLabel: "Yesterday",
    read: true,
    starred: false,
  },
  {
    id: "msg-8",
    type: "email",
    folder: "sent",
    from: "CrossFit Aveiro",
    fromInitials: "CA",
    to: "All Members",
    subject: "June Newsletter - Summer Schedule",
    preview: "Check out our new summer schedule starting July 1st...",
    body: "Dear Members,\n\nWe are excited to share our summer schedule starting July 1st!\n\nNew additions:\n- Early bird classes at 6:30 AM\n- Outdoor WODs on Saturdays\n- Yoga sessions on Sundays\n\nSee you at the box!\nCrossFit Aveiro Team",
    timestamp: "2026-06-03T14:00:00",
    timeLabel: "Yesterday",
    read: true,
    starred: false,
  },
  {
    id: "msg-9",
    type: "system",
    folder: "notifications",
    from: "System",
    fromInitials: "SY",
    to: "CrossFit Aveiro",
    subject: "New member registered",
    preview: "Ricardo Mendes has registered for a trial class on June 6th",
    body: "New member registration:\n\nName: Ricardo Mendes\nEmail: ricardo.mendes@email.com\nPhone: +351 934 567 890\nTrial class: June 6, 2026 at 18:00\nSource: Website",
    timestamp: "2026-06-03T11:00:00",
    timeLabel: "Yesterday",
    read: true,
    starred: false,
  },
  {
    id: "msg-10",
    type: "chat",
    folder: "inbox",
    from: "Maria Oliveira",
    fromInitials: "MO",
    to: "CrossFit Aveiro",
    subject: "Returning member",
    preview: "I was away for 3 months. What do I need to do to reactivate?",
    body: "Hi! I was away for 3 months due to work travel. What do I need to do to reactivate my membership? Do I need to pay the enrollment fee again?",
    timestamp: "2026-06-03T10:30:00",
    timeLabel: "Yesterday",
    read: true,
    starred: false,
  },
  {
    id: "msg-11",
    type: "sms",
    folder: "inbox",
    from: "Miguel Costa",
    fromInitials: "MC",
    to: "CrossFit Aveiro",
    subject: "SMS from Miguel Costa",
    preview: "My card was declined. I will update payment details today.",
    body: "My card was declined. I will update payment details today. Sorry for the inconvenience.",
    timestamp: "2026-06-03T09:00:00",
    timeLabel: "Yesterday",
    read: true,
    starred: false,
  },
  {
    id: "msg-12",
    type: "system",
    folder: "notifications",
    from: "System",
    fromInitials: "SY",
    to: "CrossFit Aveiro",
    subject: "Class at capacity",
    preview: "CrossFit WOD 18:00 on June 4th has reached maximum capacity (20/20)",
    body: "Class at capacity alert:\n\nClass: CrossFit WOD\nDate: June 4, 2026\nTime: 18:00\nCapacity: 20/20\n\n3 members are on the waitlist.",
    timestamp: "2026-06-02T20:00:00",
    timeLabel: "2 days ago",
    read: true,
    starred: false,
  },
  {
    id: "msg-13",
    type: "email",
    folder: "inbox",
    from: "Supplier - Rogue Fitness",
    fromInitials: "RF",
    to: "CrossFit Aveiro",
    subject: "Order #4521 shipped",
    preview: "Your order of 20 speed ropes has been shipped. ETA: June 8th",
    body: "Dear CrossFit Aveiro,\n\nYour order #4521 has been shipped.\n\nItems:\n- 20x Speed Rope 2.0 (Black)\n- 10x Weighted Rope (1kg)\n\nEstimated delivery: June 8, 2026\nTracking: PT-2026-45218\n\nThank you for your order.\nRogue Fitness Europe",
    timestamp: "2026-06-02T16:00:00",
    timeLabel: "2 days ago",
    read: true,
    starred: false,
  },
  {
    id: "msg-14",
    type: "email",
    folder: "sent",
    from: "CrossFit Aveiro",
    fromInitials: "CA",
    to: "Supplier - Rogue Fitness",
    subject: "Re: Equipment order quote",
    preview: "We would like to proceed with the order. Please confirm availability.",
    body: "Hi,\n\nWe would like to proceed with the order as quoted. Please confirm availability and expected delivery date for Portugal.\n\nBest regards,\nCrossFit Aveiro",
    timestamp: "2026-06-02T10:00:00",
    timeLabel: "2 days ago",
    read: true,
    starred: false,
  },
  {
    id: "msg-15",
    type: "sms",
    folder: "sent",
    from: "CrossFit Aveiro",
    fromInitials: "CA",
    to: "Ana Silva",
    subject: "SMS to Ana Silva",
    preview: "Your trial class is confirmed for Wednesday at 18:00. See you there!",
    body: "Hi Ana! Your trial class is confirmed for Wednesday at 18:00. Please bring comfortable clothes and a water bottle. See you there!",
    timestamp: "2026-06-02T09:00:00",
    timeLabel: "2 days ago",
    read: true,
    starred: false,
  },
  {
    id: "msg-16",
    type: "system",
    folder: "notifications",
    from: "System",
    fromInitials: "SY",
    to: "CrossFit Aveiro",
    subject: "Subscription expiring soon",
    preview: "3 member subscriptions expire in the next 7 days",
    body: "Subscriptions expiring soon:\n\n1. Tiago Neves - expires June 8, 2026\n2. Filipa Rodrigues - expires June 10, 2026\n3. Bruno Martins - expires June 11, 2026\n\nConsider reaching out to encourage renewals.",
    timestamp: "2026-06-01T08:00:00",
    timeLabel: "3 days ago",
    read: true,
    starred: false,
  },
  {
    id: "msg-17",
    type: "chat",
    folder: "inbox",
    from: "Filipa Rodrigues",
    fromInitials: "FR",
    to: "CrossFit Aveiro",
    subject: "Nutrition question",
    preview: "Do you offer any nutrition coaching or meal plans?",
    body: "Hey! Do you offer any nutrition coaching or meal plans? I have been training for 3 months and want to optimize my diet for better results.",
    timestamp: "2026-06-01T15:00:00",
    timeLabel: "3 days ago",
    read: true,
    starred: false,
  },
  {
    id: "msg-18",
    type: "email",
    folder: "inbox",
    from: "Bruno Martins",
    fromInitials: "BM",
    to: "CrossFit Aveiro",
    subject: "Freeze membership request",
    preview: "I need to freeze my membership for July due to vacation...",
    body: "Hi,\n\nI need to freeze my membership for the month of July as I will be on vacation. Is this possible? What is the process?\n\nThanks,\nBruno",
    timestamp: "2026-06-01T12:00:00",
    timeLabel: "3 days ago",
    read: true,
    starred: false,
  },
  {
    id: "msg-19",
    type: "system",
    folder: "notifications",
    from: "System",
    fromInitials: "SY",
    to: "CrossFit Aveiro",
    subject: "Monthly report ready",
    preview: "Your May 2026 performance report is ready to view",
    body: "Your monthly performance report for May 2026 is ready.\n\nHighlights:\n- Total check-ins: 1,245\n- New members: 14\n- Revenue: EUR 12,450\n- Avg. class attendance: 82%\n\nView the full report in Analytics.",
    timestamp: "2026-06-01T07:00:00",
    timeLabel: "3 days ago",
    read: true,
    starred: false,
  },
  {
    id: "msg-20",
    type: "sms",
    folder: "inbox",
    from: "Carolina Dias",
    fromInitials: "CD",
    to: "CrossFit Aveiro",
    subject: "SMS from Carolina Dias",
    preview: "Running 10 min late for the 7am class. Please save my spot!",
    body: "Running 10 min late for the 7am class. Please save my spot!",
    timestamp: "2026-05-31T06:50:00",
    timeLabel: "4 days ago",
    read: true,
    starred: false,
  },
];

// ---------------------------------------------------------------------------
// Folder config
// ---------------------------------------------------------------------------

const folders: { key: FolderType; labelKey: string; icon: typeof Inbox }[] = [
  { key: "inbox", labelKey: "inbox.folderInbox", icon: Inbox },
  { key: "sent", labelKey: "inbox.folderSent", icon: Send },
  { key: "sms", labelKey: "inbox.folderSms", icon: Smartphone },
  { key: "email", labelKey: "inbox.folderEmail", icon: Mail },
  { key: "notifications", labelKey: "inbox.folderNotifications", icon: Bell },
  { key: "archive", labelKey: "inbox.folderArchive", icon: Archive },
];

const typeBadgeConfig: Record<MessageType, { label: string; color: string; bg: string }> = {
  email: { label: "Email", color: "text-vytal-blue", bg: "bg-vytal-blue/10" },
  sms: { label: "SMS", color: "text-vytal-green", bg: "bg-vytal-green/10" },
  chat: { label: "Chat", color: "text-vytal-amber", bg: "bg-vytal-amber/10" },
  system: { label: "System", color: "text-vytal-muted", bg: "bg-vytal-bg3" },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function InboxPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [messages, setMessages] = useState<InboxMessage[]>(initialMessages);
  const [selectedFolder, setSelectedFolder] = useState<FolderType>("inbox");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompose, setShowCompose] = useState(false);

  // Compose state
  const [composeChannel, setComposeChannel] = useState<"email" | "sms" | "push">("email");
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");

  // Filtered messages
  const filteredMessages = useMemo(() => {
    let filtered = messages;

    // Folder filter
    if (selectedFolder === "inbox") {
      filtered = filtered.filter((m) => m.folder === "inbox");
    } else if (selectedFolder === "sent") {
      filtered = filtered.filter((m) => m.folder === "sent");
    } else if (selectedFolder === "sms") {
      filtered = filtered.filter((m) => m.type === "sms");
    } else if (selectedFolder === "email") {
      filtered = filtered.filter((m) => m.type === "email");
    } else if (selectedFolder === "notifications") {
      filtered = filtered.filter((m) => m.folder === "notifications");
    } else if (selectedFolder === "archive") {
      filtered = filtered.filter((m) => m.folder === "archive");
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.from.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.preview.toLowerCase().includes(q)
      );
    }

    return filtered.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [messages, selectedFolder, searchQuery]);

  const selectedMessage = messages.find((m) => m.id === selectedMessageId) ?? null;

  // Unread counts per folder
  const unreadCounts = useMemo(() => {
    const counts: Record<FolderType, number> = {
      inbox: 0,
      sent: 0,
      sms: 0,
      email: 0,
      notifications: 0,
      archive: 0,
    };
    messages.forEach((m) => {
      if (!m.read) {
        counts[m.folder]++;
        if (m.type === "sms") counts.sms++;
        if (m.type === "email") counts.email++;
      }
    });
    return counts;
  }, [messages]);

  // Select message
  const handleSelectMessage = useCallback(
    (id: string) => {
      setSelectedMessageId(id);
      setShowCompose(false);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, read: true } : m))
      );
    },
    []
  );

  // Toggle star
  const handleToggleStar = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, starred: !m.starred } : m))
    );
  }, []);

  // Send compose
  const handleSend = useCallback(() => {
    if (!composeTo.trim() || !composeBody.trim()) return;
    const newMsg: InboxMessage = {
      id: `msg-${Date.now()}`,
      type: composeChannel === "push" ? "system" : composeChannel,
      folder: "sent",
      from: "CrossFit Aveiro",
      fromInitials: "CA",
      to: composeTo,
      subject: composeSubject || `${composeChannel.toUpperCase()} to ${composeTo}`,
      preview: composeBody.slice(0, 80),
      body: composeBody,
      timestamp: new Date().toISOString(),
      timeLabel: "Just now",
      read: true,
      starred: false,
    };
    setMessages((prev) => [newMsg, ...prev]);
    setComposeTo("");
    setComposeSubject("");
    setComposeBody("");
    setShowCompose(false);
    toast(t("inbox.messageSent"), "success");
  }, [composeTo, composeSubject, composeBody, composeChannel, toast, t]);

  return (
    <div className="flex h-[calc(100vh-7rem)] overflow-hidden rounded-xl border border-vytal-border">
      {/* Left - Folders */}
      <div className="flex w-56 shrink-0 flex-col border-r border-vytal-border bg-vytal-bg2">
        <div className="border-b border-vytal-border p-4">
          <button
            onClick={() => {
              setShowCompose(true);
              setSelectedMessageId(null);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-medium text-vytal-bg transition-colors hover:bg-vytal-green/90"
          >
            <Plus className="h-4 w-4" />
            {t("inbox.newMessage")}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {folders.map((folder) => {
            const FolderIcon = folder.icon;
            const count = unreadCounts[folder.key];
            return (
              <button
                key={folder.key}
                onClick={() => {
                  setSelectedFolder(folder.key);
                  setSelectedMessageId(null);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                  selectedFolder === folder.key
                    ? "bg-vytal-green/10 text-vytal-green"
                    : "text-vytal-muted hover:bg-vytal-bg3 hover:text-vytal-text"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <FolderIcon className="h-4 w-4" />
                  <span>{t(folder.labelKey)}</span>
                </div>
                {count > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-vytal-green text-[10px] font-bold text-vytal-bg">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Center - Message list */}
      <div className="flex w-96 shrink-0 flex-col border-r border-vytal-border bg-vytal-bg">
        {/* Search */}
        <div className="border-b border-vytal-border p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vytal-muted" />
            <input
              type="text"
              placeholder={t("inbox.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 py-2 pl-9 pr-3 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none"
            />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Inbox className="h-10 w-10 text-vytal-muted/50" />
              <p className="mt-3 text-sm text-vytal-muted">{t("inbox.noMessages")}</p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const badge = typeBadgeConfig[msg.type];
              return (
                <button
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg.id)}
                  className={cn(
                    "flex w-full flex-col gap-1 border-b border-vytal-border px-4 py-3 text-left transition-colors hover:bg-vytal-bg2",
                    selectedMessageId === msg.id && "bg-vytal-green/5",
                    !msg.read && "bg-vytal-bg2/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                          msg.type === "system"
                            ? "bg-vytal-muted/10 text-vytal-muted"
                            : "bg-vytal-green/10 text-vytal-green"
                        )}
                      >
                        {msg.fromInitials}
                      </div>
                      <span
                        className={cn(
                          "text-sm truncate",
                          !msg.read ? "font-semibold text-vytal-text" : "text-vytal-text"
                        )}
                      >
                        {msg.from}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-semibold", badge.bg, badge.color)}>
                        {badge.label}
                      </span>
                      <span className="text-[10px] text-vytal-muted">{msg.timeLabel}</span>
                    </div>
                  </div>
                  <p
                    className={cn(
                      "text-xs truncate",
                      !msg.read ? "font-medium text-vytal-text" : "text-vytal-muted"
                    )}
                  >
                    {msg.subject}
                  </p>
                  <p className="text-[11px] text-vytal-muted truncate">{msg.preview}</p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right - Detail / Compose */}
      <div className="flex flex-1 flex-col bg-vytal-bg">
        {showCompose ? (
          // Compose
          <div className="flex flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-vytal-border px-6 py-3">
              <h3 className="text-sm font-semibold text-vytal-text">{t("inbox.newMessage")}</h3>
              <button onClick={() => setShowCompose(false)} className="text-vytal-muted hover:text-vytal-text">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              <div>
                <label className="mb-1 block text-xs font-medium text-vytal-muted">{t("inbox.channel")}</label>
                <select
                  value={composeChannel}
                  onChange={(e) => setComposeChannel(e.target.value as "email" | "sms" | "push")}
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="push">Push Notification</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-vytal-muted">{t("inbox.to")}</label>
                <input
                  type="text"
                  placeholder={t("inbox.recipientPlaceholder")}
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none"
                />
              </div>
              {composeChannel === "email" && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-vytal-muted">{t("inbox.subject")}</label>
                  <input
                    type="text"
                    placeholder={t("inbox.subjectPlaceholder")}
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none"
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-medium text-vytal-muted">{t("inbox.body")}</label>
                <textarea
                  placeholder={t("inbox.bodyPlaceholder")}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  rows={8}
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none"
                />
              </div>
            </div>
            <div className="border-t border-vytal-border px-6 py-4">
              <button
                onClick={handleSend}
                disabled={!composeTo.trim() || !composeBody.trim()}
                className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2.5 text-sm font-medium text-vytal-bg transition-colors hover:bg-vytal-green/90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {t("inbox.send")}
              </button>
            </div>
          </div>
        ) : selectedMessage ? (
          // Message detail
          <div className="flex flex-1 flex-col">
            <div className="border-b border-vytal-border px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-vytal-text">{selectedMessage.subject}</h2>
                <button
                  onClick={() => handleToggleStar(selectedMessage.id)}
                  className={cn(
                    "transition-colors",
                    selectedMessage.starred ? "text-vytal-amber" : "text-vytal-muted hover:text-vytal-amber"
                  )}
                >
                  <Star className={cn("h-5 w-5", selectedMessage.starred && "fill-current")} />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold",
                    selectedMessage.type === "system"
                      ? "bg-vytal-muted/10 text-vytal-muted"
                      : "bg-vytal-green/10 text-vytal-green"
                  )}
                >
                  {selectedMessage.fromInitials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-vytal-text">{selectedMessage.from}</p>
                  <p className="text-xs text-vytal-muted">
                    {t("inbox.to")}: {selectedMessage.to} &middot; {selectedMessage.timeLabel}
                  </p>
                </div>
                <span
                  className={cn(
                    "ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    typeBadgeConfig[selectedMessage.type].bg,
                    typeBadgeConfig[selectedMessage.type].color
                  )}
                >
                  {typeBadgeConfig[selectedMessage.type].label}
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-vytal-text">
                {selectedMessage.body}
              </div>
            </div>
            <div className="border-t border-vytal-border px-6 py-3">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-xs text-vytal-text transition-colors hover:border-vytal-green/30">
                  <ChevronRight className="h-3.5 w-3.5" />
                  {t("inbox.reply")}
                </button>
                <button className="flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-xs text-vytal-text transition-colors hover:border-vytal-green/30">
                  <Archive className="h-3.5 w-3.5" />
                  {t("inbox.archive")}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Empty state
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-vytal-bg3">
              <Mail className="h-10 w-10 text-vytal-muted" />
            </div>
            <p className="mt-4 text-lg font-semibold text-vytal-text">{t("inbox.selectMessage")}</p>
            <p className="mt-1 text-sm text-vytal-muted">{t("inbox.selectMessageSub")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
