"use client";

import { useState } from "react";
import { MessageSquare, Mail, Smartphone, Heart, Send } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "news" | "email" | "sms";

const mockNews = [
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
  const [activeTab, setActiveTab] = useState<Tab>("news");
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [smsTo, setSmsTo] = useState("");
  const [smsMessage, setSmsMessage] = useState("");

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "news", label: "News", icon: <MessageSquare className="h-4 w-4" /> },
    { key: "email", label: "Email", icon: <Mail className="h-4 w-4" /> },
    { key: "sms", label: "SMS", icon: <Smartphone className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-vytal-text">Communications</h1>
        <p className="mt-1 text-sm text-vytal-muted">
          News, email, and SMS messaging
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
          {mockNews.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(61,255,110,0.22)]"
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
                  By {item.author}
                </span>
                <div className="flex items-center gap-1 text-xs text-vytal-muted">
                  <Heart className="h-3.5 w-3.5" />
                  {item.likes}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Email Tab */}
      {activeTab === "email" && (
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h3 className="mb-5 text-lg font-semibold text-vytal-text">
            Compose Email
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                To
              </label>
              <input
                type="text"
                placeholder="Select member or enter email..."
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Subject
              </label>
              <input
                type="text"
                placeholder="Email subject..."
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Body
              </label>
              <textarea
                placeholder="Write your email..."
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={8}
                className="w-full resize-none rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>
            <div className="flex justify-end">
              <button className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90">
                <Send className="h-4 w-4" />
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMS Tab */}
      {activeTab === "sms" && (
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <h3 className="mb-5 text-lg font-semibold text-vytal-text">
            Compose SMS
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                To
              </label>
              <input
                type="text"
                placeholder="Select member or enter phone number..."
                value={smsTo}
                onChange={(e) => setSmsTo(e.target.value)}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Message
              </label>
              <textarea
                placeholder="Write your SMS..."
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
              <button className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90">
                <Send className="h-4 w-4" />
                Send SMS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
