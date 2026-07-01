"use client";

import { useState, useCallback } from "react";
import { MessageSquare, Mail, Smartphone, Heart, Send, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/toast";
import { useI18n } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";

type Tab = "news" | "email" | "sms";

interface NewsItem {
  id: number;
  title: string;
  body: string;
  date: string;
  author: string;
  likes: number;
}

const initialNews: NewsItem[] = [
  {
    id: 1,
    title: "Summer Challenge 2026 Starts Next Week!",
    body: "Get ready for 6 weeks of intense programming, team workouts, and prizes. Sign up at the front desk or through the app. Early bird registration closes Friday.",
    date: "2026-06-01",
    author: "Andre Loureiro",
    likes: 24,
  },
  {
    id: 2,
    title: "New Open Box Schedule",
    body: "Starting June, we are adding two extra Open Box slots on Saturday mornings (08:00 and 09:00). Perfect for those who want to work on skills or make up missed WODs.",
    date: "2026-05-28",
    author: "Marine Robba",
    likes: 18,
  },
  {
    id: 3,
    title: "Box Closed for Maintenance - June 15",
    body: "The box will be closed on Sunday, June 15 for equipment maintenance and deep cleaning. We will install new rigs and replace worn out ropes. Back to normal on Monday!",
    date: "2026-05-25",
    author: "Andre Loureiro",
    likes: 8,
  },
];

export default function CommunicationsPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<Tab>("news");
  const { toast } = useToast();

  // News state
  const [newsItems, setNewsItems] = useState<NewsItem[]>(initialNews);
  const [showComposeNews, setShowComposeNews] = useState(false);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsBody, setNewsBody] = useState("");

  // Email state
  const [emailAudience, setEmailAudience] = useState("all_active");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const groupsQuery = trpc.memberGroups.list.useQuery();
  const sendCampaign = trpc.campaigns.send.useMutation();
  const createCampaign = trpc.campaigns.create.useMutation();

  // SMS state
  const [smsTo, setSmsTo] = useState("");
  const [smsMessage, setSmsMessage] = useState("");

  const handlePublishNews = useCallback(() => {
    if (!newsTitle.trim() || !newsBody.trim()) {
      toast(t("communications.titleRequired"), "error");
      return;
    }
    const newItem: NewsItem = {
      id: Date.now(),
      title: newsTitle.trim(),
      body: newsBody.trim(),
      date: new Date().toISOString().split("T")[0],
      author: "You",
      likes: 0,
    };
    setNewsItems((prev) => [newItem, ...prev]);
    setNewsTitle("");
    setNewsBody("");
    setShowComposeNews(false);
    toast(t("communications.newsPublished"), "success");
  }, [newsTitle, newsBody, toast, t]);

  const handleLike = useCallback((id: number) => {
    setNewsItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, likes: item.likes + 1 } : item
      )
    );
  }, []);

  const handleSendEmail = useCallback(async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast(t("communications.recipientRequired"), "error");
      return;
    }
    try {
      const campaign = await createCampaign.mutateAsync({
        name: emailSubject.trim(),
        subject: emailSubject.trim(),
        body: `<p>${emailBody.trim().replace(/\n/g, "<br/>")}</p>`,
        audience: emailAudience,
      });
      const res = await sendCampaign.mutateAsync({ id: campaign.id });
      toast(
        t("communications.emailBroadcastSent")
          .replace("{sent}", String(res.sent))
          .replace("{skipped}", String(res.skipped)),
        "success",
      );
      setEmailSubject("");
      setEmailBody("");
    } catch (e) {
      const code = (e as { data?: { code?: string } })?.data?.code;
      toast(code === "FORBIDDEN" ? t("settings.adminOnly") : t("ui.error"), "error");
    }
  }, [emailSubject, emailBody, emailAudience, createCampaign, sendCampaign, toast, t]);

  const handleSendSMS = useCallback(() => {
    if (!smsTo.trim()) {
      toast(t("communications.recipientRequired"), "error");
      return;
    }
    toast(`${t("communications.smsSentTo")} ${smsTo}`, "success");
    setSmsTo("");
    setSmsMessage("");
  }, [smsTo, toast, t]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "news", label: t("communications.tabNews"), icon: <MessageSquare className="h-4 w-4" /> },
    { key: "email", label: t("communications.tabEmail"), icon: <Mail className="h-4 w-4" /> },
    { key: "sms", label: t("communications.tabSms"), icon: <Smartphone className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-vytal-text">{t("communications.title")}</h1>
        <p className="mt-1 text-sm text-vytal-muted">
          {t("communications.subtitle")}
        </p>
      </div>

      {/* Tab Pills */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-vytal-green/10 text-vytal-green"
                : "bg-vytal-bg2 text-vytal-muted hover:text-vytal-text"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* News Tab */}
      {activeTab === "news" && (
        <div className="space-y-4">
          {/* Compose button / form */}
          {!showComposeNews ? (
            <button
              onClick={() => setShowComposeNews(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-vytal-border py-4 text-sm text-vytal-muted transition-colors hover:border-vytal-green/30 hover:text-vytal-green"
            >
              <Plus className="h-4 w-4" />
              {t("communications.composeNews")}
            </button>
          ) : (
            <div className="rounded-xl border border-vytal-green/20 bg-vytal-green/5 p-5">
              <h3 className="mb-4 text-sm font-semibold text-vytal-green">
                {t("communications.newPost")}
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder={t("communications.titlePlaceholder")}
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
                <textarea
                  placeholder={t("communications.bodyPlaceholder")}
                  value={newsBody}
                  onChange={(e) => setNewsBody(e.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowComposeNews(false);
                      setNewsTitle("");
                      setNewsBody("");
                    }}
                    className="rounded-lg border border-vytal-border px-4 py-2 text-sm text-vytal-text transition-colors hover:bg-vytal-bg3"
                  >
                    {t("action.cancel")}
                  </button>
                  <button
                    onClick={handlePublishNews}
                    className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
                  >
                    <Send className="h-4 w-4" />
                    {t("action.publish")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {newsItems.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-vytal-border bg-vytal-card p-5 card-interactive transition-colors hover:border-[rgba(61,255,110,0.22)]"
            >
              <div className="mb-2 flex items-start justify-between">
                <h3 className="text-sm font-semibold text-vytal-text">
                  {item.title}
                </h3>
                <span className="shrink-0 text-xs text-vytal-muted">
                  {item.date}
                </span>
              </div>
              <p className="mb-3 text-sm leading-relaxed text-vytal-muted">
                {item.body}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-vytal-muted">
                  {t("communications.byAuthor")} {item.author}
                </span>
                <button
                  onClick={() => handleLike(item.id)}
                  className="flex items-center gap-1 text-xs text-vytal-muted transition-colors hover:text-vytal-red"
                >
                  <Heart className="h-3.5 w-3.5" />
                  {item.likes}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Email Tab */}
      {activeTab === "email" && (
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h3 className="mb-5 text-lg font-semibold text-vytal-text">
            {t("communications.composeEmail")}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("communications.labelAudience")}
              </label>
              <select
                value={emailAudience}
                onChange={(e) => setEmailAudience(e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              >
                <option value="all_active">{t("communications.audienceAllActive")}</option>
                {(groupsQuery.data ?? []).map((g) => (
                  <option key={g.id} value={`group:${g.id}`}>{g.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("communications.labelSubject")}
              </label>
              <input
                type="text"
                placeholder={t("communications.emailSubjectPlaceholder")}
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("communications.labelBody")}
              </label>
              <textarea
                placeholder={t("communications.emailBodyPlaceholder")}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={8}
                className="w-full resize-none rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => void handleSendEmail()}
                disabled={createCampaign.isPending || sendCampaign.isPending}
                className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90 disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {t("communications.sendEmail")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMS Tab */}
      {activeTab === "sms" && (
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h3 className="mb-5 text-lg font-semibold text-vytal-text">
            {t("communications.composeSms")}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("communications.labelTo")}
              </label>
              <input
                type="text"
                placeholder={t("communications.smsToPlaceholder")}
                value={smsTo}
                onChange={(e) => setSmsTo(e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                {t("communications.labelMessage")}
              </label>
              <textarea
                placeholder={t("communications.smsMessagePlaceholder")}
                value={smsMessage}
                onChange={(e) => {
                  if (e.target.value.length <= 160) {
                    setSmsMessage(e.target.value);
                  }
                }}
                rows={4}
                className="w-full resize-none rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
              <div className="mt-1 flex justify-end">
                <span
                  className={cn(
                    "text-xs",
                    smsMessage.length > 140
                      ? "text-vytal-red"
                      : "text-vytal-muted"
                  )}
                >
                  {smsMessage.length}/160
                </span>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSendSMS}
                className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
              >
                <Send className="h-4 w-4" />
                {t("communications.sendSms")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
