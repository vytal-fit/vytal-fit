"use client";

import { useState } from "react";
import {
  HelpCircle,
  ExternalLink,
  Bug,
  Keyboard,
  Info,
  BookOpen,
  Mail,
  Send,
  ChevronDown,
  ChevronUp,
  Rocket,
  Users,
  Upload,
  CalendarDays,
  Building2,
  Search,
  MessageCircle,
  Play,
  CheckCircle2,
  Sparkles,
  PanelLeft,
  PanelRight,
  Sun,
  Command,
} from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-vytal-border bg-vytal-card transition-colors hover:border-[rgba(34,197,94,0.22)]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-sm font-medium text-vytal-text">{question}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-vytal-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-vytal-muted" />
        )}
      </button>
      {open && (
        <div className="border-t border-vytal-border px-5 py-4">
          <p className="text-sm text-vytal-muted leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function HelpPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [supportEmail, setSupportEmail] = useState("");
  const [supportMessage, setSupportMessage] = useState("");

  const handleSendSupport = () => {
    if (!supportEmail.trim() || !supportMessage.trim()) return;
    toast(t("help.messageSent"), "success");
    setSupportEmail("");
    setSupportMessage("");
  };

  const shortcuts = [
    { label: t("help.commandPalette"), keys: "Cmd+K" },
    { label: t("action.search"), keys: "Cmd+/" },
    { label: t("help.toggleTheme"), keys: t("help.viaTopBar") },
    { label: t("help.quickNav"), keys: "Cmd+J" },
    { label: t("help.collapseSidebar"), keys: t("help.viaSidebarToggle") },
    { label: t("help.rightSidebarToggle"), keys: t("help.viaEdgeButton") },
  ];

  const videoTutorials = [
    { title: t("help.videoGettingStarted"), duration: "4:30", icon: Rocket },
    { title: t("help.videoManagingMembers"), duration: "6:15", icon: Users },
    { title: t("help.videoCreatingWods"), duration: "5:45", icon: CalendarDays },
    { title: t("help.videoFinancialReports"), duration: "7:20", icon: Search },
  ];

  const steps = [
    { icon: Building2, title: t("help.step1Title"), desc: t("help.step1Desc") },
    { icon: Users, title: t("help.step2Title"), desc: t("help.step2Desc") },
    { icon: Upload, title: t("help.step3Title"), desc: t("help.step3Desc") },
    { icon: CalendarDays, title: t("help.step4Title"), desc: t("help.step4Desc") },
  ];

  const faqs = [
    { q: t("help.faq1q"), a: t("help.faq1a") },
    { q: t("help.faq2q"), a: t("help.faq2a") },
    { q: t("help.faq3q"), a: t("help.faq3a") },
    { q: t("help.faq4q"), a: t("help.faq4a") },
    { q: t("help.faq5q"), a: t("help.faq5a") },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-vytal-text">
          {t("nav.help")}
        </h1>
        <p className="mt-1 text-sm text-vytal-muted">
          {t("help.subtitle")}
        </p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Help Center */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 transition-colors hover:border-[rgba(34,197,94,0.22)]">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-blue/10">
            <HelpCircle className="h-5 w-5 text-vytal-blue" />
          </div>
          <h3 className="text-sm font-bold text-vytal-text">{t("help.helpCenter")}</h3>
          <p className="mt-1 text-xs text-vytal-muted">
            {t("help.helpCenterDesc")}
          </p>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); toast(t("toast.featureComingSoon"), "info"); }}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-vytal-green transition-colors hover:text-vytal-green/80"
          >
            {t("help.open")} <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Report Problem */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 transition-colors hover:border-[rgba(34,197,94,0.22)]">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-red/10">
            <Bug className="h-5 w-5 text-vytal-red" />
          </div>
          <h3 className="text-sm font-bold text-vytal-text">{t("help.reportProblem")}</h3>
          <p className="mt-1 text-xs text-vytal-muted">
            {t("help.reportProblemDesc")}
          </p>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); toast(t("toast.featureComingSoon"), "info"); }}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-vytal-green transition-colors hover:text-vytal-green/80"
          >
            {t("help.report")} <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Documentation */}
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 transition-colors hover:border-[rgba(34,197,94,0.22)]">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-green/10">
            <BookOpen className="h-5 w-5 text-vytal-green" />
          </div>
          <h3 className="text-sm font-bold text-vytal-text">{t("help.documentation")}</h3>
          <p className="mt-1 text-xs text-vytal-muted">
            {t("help.documentationDesc")}
          </p>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); toast(t("toast.featureComingSoon"), "info"); }}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-vytal-green transition-colors hover:text-vytal-green/80"
          >
            {t("help.browseDocumentation")} <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Getting Started */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Rocket className="h-5 w-5 text-vytal-green" />
          <h2 className="text-lg font-semibold text-vytal-text">{t("help.gettingStarted")}</h2>
        </div>
        <p className="mb-4 text-sm text-vytal-muted">{t("help.gettingStartedDesc")}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="rounded-xl border border-vytal-border bg-vytal-card p-5 transition-colors hover:border-[rgba(34,197,94,0.22)]"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vytal-green/10">
                    <Icon className="h-4 w-4 text-vytal-green" />
                  </div>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-vytal-bg3 text-[10px] font-bold text-vytal-muted">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-vytal-text">{step.title}</h3>
                <p className="mt-1 text-xs text-vytal-muted leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Video Tutorials */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Play className="h-5 w-5 text-vytal-blue" />
          <h2 className="text-lg font-semibold text-vytal-text">{t("help.videoTutorials")}</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {videoTutorials.map((video, i) => {
            const VIcon = video.icon;
            return (
              <button
                key={i}
                onClick={() => toast(t("toast.featureComingSoon"), "info")}
                className="group rounded-xl border border-vytal-border bg-vytal-card p-5 text-left transition-all hover:border-[rgba(34,197,94,0.22)] hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10"
              >
                <div className="relative mb-4 flex h-24 items-center justify-center rounded-lg bg-vytal-bg3">
                  <VIcon className="h-8 w-8 text-vytal-muted/40" />
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition-colors group-hover:bg-black/20">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-vytal-green/90 text-vytal-bg opacity-0 transition-opacity group-hover:opacity-100">
                      <Play className="h-4 w-4 ml-0.5" />
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-vytal-text">{video.title}</h3>
                <p className="mt-1 text-xs text-vytal-muted">{video.duration}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* System Status + What's New */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 transition-colors hover:border-[rgba(34,197,94,0.22)]">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-vytal-green" />
            <h3 className="text-sm font-bold text-vytal-text">{t("help.systemStatus")}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-vytal-green opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-vytal-green" />
            </span>
            <span className="text-sm text-vytal-green font-medium">{t("help.allOperational")}</span>
          </div>
          <p className="mt-2 text-[11px] text-vytal-muted">{t("help.statusDesc")}</p>
        </div>

        <Link
          href="/changelog"
          className="rounded-xl border border-vytal-border bg-vytal-card p-6 transition-all hover:border-[rgba(34,197,94,0.22)] hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10"
        >
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-vytal-amber" />
            <h3 className="text-sm font-bold text-vytal-text">{t("help.whatsNew")}</h3>
          </div>
          <p className="text-xs text-vytal-muted">{t("help.whatsNewDesc")}</p>
          <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-vytal-green">
            {t("help.viewChangelog")} <ExternalLink className="h-3 w-3" />
          </span>
        </Link>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 transition-colors hover:border-[rgba(34,197,94,0.22)]">
        <div className="mb-4 flex items-center gap-2">
          <Keyboard className="h-5 w-5 text-vytal-amber" />
          <h2 className="text-lg font-semibold text-vytal-text">{t("help.keyboardShortcuts")}</h2>
        </div>
        <p className="mb-4 text-xs text-vytal-muted">{t("help.keyboardShortcutsDesc")}</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map((shortcut, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-vytal-bg3 px-4 py-3">
              <span className="text-sm text-vytal-text">{shortcut.label}</span>
              <kbd className="rounded border border-vytal-border bg-vytal-bg2 px-2 py-1 text-[11px] font-semibold text-vytal-muted">
                {shortcut.keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-vytal-text">{t("help.faq")}</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FaqItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-vytal-green" />
          <h2 className="text-lg font-semibold text-vytal-text">{t("help.contactSupport")}</h2>
        </div>
        <p className="mb-4 text-sm text-vytal-muted">{t("help.contactSupportDesc")}</p>
        <div className="space-y-3 max-w-lg">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vytal-muted" />
            <input
              type="email"
              placeholder={t("help.emailPlaceholder")}
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 py-2.5 pl-10 pr-4 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
            />
          </div>
          <textarea
            placeholder={t("help.messagePlaceholder")}
            value={supportMessage}
            onChange={(e) => setSupportMessage(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
          />
          <button
            onClick={handleSendSupport}
            disabled={!supportEmail.trim() || !supportMessage.trim()}
            className="flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
            {t("help.sendMessage")}
          </button>
        </div>
      </div>

      {/* App Version & Build */}
      <div className="flex items-center gap-3 rounded-lg border border-vytal-border bg-vytal-card px-4 py-3">
        <Info className="h-4 w-4 text-vytal-muted" />
        <span className="text-xs text-vytal-muted">{t("help.appVersion")}</span>
        <span className="text-[10px] text-vytal-muted">|</span>
        <span className="text-xs text-vytal-muted">{t("help.buildInfo")}</span>
      </div>
    </div>
  );
}
