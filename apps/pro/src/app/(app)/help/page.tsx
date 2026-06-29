"use client";

import { useState, useMemo } from "react";
import {
  HelpCircle,
  ExternalLink,
  Keyboard,
  BookOpen,
  Mail,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Rocket,
  Users,
  CalendarDays,
  Search,
  MessageCircle,
  Play,
  CheckCircle2,
  Sparkles,
  CreditCard,
  Globe,
  Dumbbell,
  Settings,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  Info,
} from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "rounded-xl border border-vytal-border bg-vytal-card transition-all duration-200",
        open
          ? "border-[rgba(34,197,94,0.30)] shadow-sm shadow-[rgba(34,197,94,0.06)]"
          : "hover:border-[rgba(34,197,94,0.22)]"
      )}
    >
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

interface Article {
  title: string;
  summary: string;
}

function ArticleItem({ article }: { article: Article }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "rounded-lg border border-vytal-border bg-vytal-bg2 transition-all duration-150",
        open ? "border-[rgba(34,197,94,0.22)]" : "hover:border-[rgba(34,197,94,0.15)]"
      )}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm text-vytal-text">{article.title}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-vytal-muted transition-transform duration-150",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="border-t border-vytal-border px-4 pb-3 pt-2.5">
          <p className="text-xs text-vytal-muted leading-relaxed">{article.summary}</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function HelpPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // ---- Data definitions (translated) -------------------------------------------------------

  const quickStartSteps = [
    {
      icon: Settings,
      step: 1,
      title: t("help.qs1Title"),
      desc: t("help.qs1Desc"),
      href: "/settings",
      done: true,
    },
    {
      icon: Users,
      step: 2,
      title: t("help.qs2Title"),
      desc: t("help.qs2Desc"),
      href: "/members",
      done: true,
    },
    {
      icon: CalendarDays,
      step: 3,
      title: t("help.qs3Title"),
      desc: t("help.qs3Desc"),
      href: "/classes/create",
      done: false,
    },
    {
      icon: CreditCard,
      step: 4,
      title: t("help.qs4Title"),
      desc: t("help.qs4Desc"),
      href: "/settings/payments",
      done: false,
    },
  ];

  const categories = [
    {
      id: "members",
      icon: UserCheck,
      color: "text-vytal-blue",
      bg: "bg-vytal-blue/10",
      title: t("help.catMembers"),
      count: 5,
      articles: [
        { title: t("help.art.m1t"), summary: t("help.art.m1s") },
        { title: t("help.art.m2t"), summary: t("help.art.m2s") },
        { title: t("help.art.m3t"), summary: t("help.art.m3s") },
        { title: t("help.art.m4t"), summary: t("help.art.m4s") },
        { title: t("help.art.m5t"), summary: t("help.art.m5s") },
      ] as Article[],
    },
    {
      id: "classes",
      icon: CalendarDays,
      color: "text-vytal-green",
      bg: "bg-vytal-green/10",
      title: t("help.catClasses"),
      count: 5,
      articles: [
        { title: t("help.art.c1t"), summary: t("help.art.c1s") },
        { title: t("help.art.c2t"), summary: t("help.art.c2s") },
        { title: t("help.art.c3t"), summary: t("help.art.c3s") },
        { title: t("help.art.c4t"), summary: t("help.art.c4s") },
        { title: t("help.art.c5t"), summary: t("help.art.c5s") },
      ] as Article[],
    },
    {
      id: "finance",
      icon: CreditCard,
      color: "text-vytal-amber",
      bg: "bg-vytal-amber/10",
      title: t("help.catFinance"),
      count: 4,
      articles: [
        { title: t("help.art.f1t"), summary: t("help.art.f1s") },
        { title: t("help.art.f2t"), summary: t("help.art.f2s") },
        { title: t("help.art.f3t"), summary: t("help.art.f3s") },
        { title: t("help.art.f4t"), summary: t("help.art.f4s") },
      ] as Article[],
    },
    {
      id: "website",
      icon: Globe,
      color: "text-vytal-purple",
      bg: "bg-vytal-purple/10",
      title: t("help.catWebsite"),
      count: 4,
      articles: [
        { title: t("help.art.w1t"), summary: t("help.art.w1s") },
        { title: t("help.art.w2t"), summary: t("help.art.w2s") },
        { title: t("help.art.w3t"), summary: t("help.art.w3s") },
        { title: t("help.art.w4t"), summary: t("help.art.w4s") },
      ] as Article[],
    },
    {
      id: "wods",
      icon: Dumbbell,
      color: "text-vytal-red",
      bg: "bg-vytal-red/10",
      title: t("help.catWods"),
      count: 4,
      articles: [
        { title: t("help.art.wo1t"), summary: t("help.art.wo1s") },
        { title: t("help.art.wo2t"), summary: t("help.art.wo2s") },
        { title: t("help.art.wo3t"), summary: t("help.art.wo3s") },
        { title: t("help.art.wo4t"), summary: t("help.art.wo4s") },
      ] as Article[],
    },
    {
      id: "settings",
      icon: Settings,
      color: "text-vytal-muted",
      bg: "bg-vytal-bg3",
      title: t("help.catSettings"),
      count: 4,
      articles: [
        { title: t("help.art.s1t"), summary: t("help.art.s1s") },
        { title: t("help.art.s2t"), summary: t("help.art.s2s") },
        { title: t("help.art.s3t"), summary: t("help.art.s3s") },
        { title: t("help.art.s4t"), summary: t("help.art.s4s") },
      ] as Article[],
    },
  ];

  const videoTutorials = [
    {
      title: t("help.vid1Title"),
      duration: "4:30",
      icon: Rocket,
      label: t("help.vid1Label"),
    },
    {
      title: t("help.vid2Title"),
      duration: "6:15",
      icon: Users,
      label: t("help.vid2Label"),
    },
    {
      title: t("help.vid3Title"),
      duration: "5:45",
      icon: CalendarDays,
      label: t("help.vid3Label"),
    },
    {
      title: t("help.vid4Title"),
      duration: "7:20",
      icon: Globe,
      label: t("help.vid4Label"),
    },
  ];

  const shortcuts = [
    { label: t("help.commandPalette"), keys: "Cmd+K" },
    { label: t("help.shortcutSearch"), keys: "Cmd+/" },
    { label: t("help.toggleTheme"), keys: t("help.viaTopBar") },
    { label: t("help.quickNav"), keys: "Cmd+J" },
    { label: t("help.collapseSidebar"), keys: t("help.viaSidebarToggle") },
    { label: t("help.rightSidebarToggle"), keys: t("help.viaEdgeButton") },
    { label: t("help.shortcutNewMember"), keys: "Cmd+Shift+M" },
    { label: t("help.shortcutNewClass"), keys: "Cmd+Shift+C" },
  ];

  const changelog = [
    { date: "2026-06-03", text: t("help.cl1") },
    { date: "2026-05-20", text: t("help.cl2") },
    { date: "2026-05-10", text: t("help.cl3") },
  ];

  const faqs = [
    { q: t("help.faq1q"), a: t("help.faq1a") },
    { q: t("help.faq2q"), a: t("help.faq2a") },
    { q: t("help.faq3q"), a: t("help.faq3a") },
    { q: t("help.faq4q"), a: t("help.faq4a") },
    { q: t("help.faq5q"), a: t("help.faq5a") },
    { q: t("help.faq6q"), a: t("help.faq6a") },
  ];

  // ---- Search filter -------------------------------------------------------

  const q = query.toLowerCase().trim();

  const filteredCategories = useMemo(() => {
    if (!q) return categories;
    return categories
      .map((cat) => ({
        ...cat,
        articles: cat.articles.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.summary.toLowerCase().includes(q)
        ),
      }))
      .filter(
        (cat) =>
          cat.title.toLowerCase().includes(q) || cat.articles.length > 0
      );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const filteredFaqs = useMemo(() => {
    if (!q) return faqs;
    return faqs.filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const hasResults = filteredCategories.length > 0 || filteredFaqs.length > 0;

  // -------------------------------------------------------------------------

  return (
    <div className="space-y-10">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Vytal", href: "/dashboard" },
          { label: t("nav.help") },
        ]}
      />

      {/* Hero / Search */}
      <div className="relative overflow-hidden rounded-2xl border border-vytal-border bg-vytal-card px-8 py-10">
        {/* Subtle gradient orb */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-vytal-green/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-vytal-blue/5 blur-3xl" />

        <div className="relative">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vytal-green/10">
              <HelpCircle className="h-4 w-4 text-vytal-green" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-vytal-green">
              {t("help.helpCenterBadge")}
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-vytal-text">
            {t("help.heroTitle")}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-vytal-muted">
            {t("help.heroSubtitle")}
          </p>

          {/* Search */}
          <div className="relative mt-6 max-w-lg">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-vytal-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("help.searchPlaceholder")}
              className="w-full rounded-xl border border-vytal-border bg-vytal-bg2 py-3 pl-11 pr-4 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/40 focus:outline-none focus:ring-2 focus:ring-vytal-green/10 transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-0.5 text-[11px] text-vytal-muted hover:text-vytal-text transition-colors"
              >
                {t("help.clearSearch")}
              </button>
            )}
          </div>

          {/* No results message */}
          {q && !hasResults && (
            <p className="mt-3 text-sm text-vytal-muted">{t("help.noResults")}</p>
          )}
        </div>
      </div>

      {/* Only show non-search content when no active query */}
      {!q && (
        <>
          {/* Quick Start Guide */}
          <section>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-vytal-green" />
                <h2 className="text-lg font-semibold text-vytal-text">
                  {t("help.quickStartTitle")}
                </h2>
              </div>
              <span className="rounded-full bg-vytal-green/10 px-2.5 py-0.5 text-[11px] font-semibold text-vytal-green">
                2 / 4 {t("help.stepsCompleted")}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-5 h-1.5 w-full rounded-full bg-vytal-bg3">
              <div className="h-1.5 w-1/2 rounded-full bg-vytal-green transition-all" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quickStartSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <Link
                    key={step.step}
                    href={step.href}
                    className={cn(
                      "group relative rounded-xl border bg-vytal-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10",
                      step.done
                        ? "border-vytal-green/30 bg-vytal-green/[0.02]"
                        : "border-vytal-border hover:border-[rgba(34,197,94,0.3)]"
                    )}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                          step.done
                            ? "bg-vytal-green/15"
                            : "bg-vytal-bg3 group-hover:bg-vytal-green/10"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 transition-colors",
                            step.done
                              ? "text-vytal-green"
                              : "text-vytal-muted group-hover:text-vytal-green"
                          )}
                        />
                      </div>
                      <div
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold",
                          step.done
                            ? "bg-vytal-green text-vytal-bg"
                            : "bg-vytal-bg3 text-vytal-muted"
                        )}
                      >
                        {step.done ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          step.step
                        )}
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-vytal-text">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-xs text-vytal-muted leading-relaxed">
                      {step.desc}
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-vytal-green opacity-0 transition-opacity group-hover:opacity-100">
                      {t("help.goTo")} <ArrowRight className="h-3 w-3" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </>
      )}

      {/* Help Categories */}
      <section>
        <div className="mb-5 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-vytal-blue" />
          <h2 className="text-lg font-semibold text-vytal-text">
            {t("help.categoriesTitle")}
          </h2>
        </div>

        {q && filteredCategories.length === 0 ? (
          <p className="text-sm text-vytal-muted">{t("help.noCategoryResults")}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map((cat) => {
              const Icon = cat.icon;
              const isExpanded = expandedCategory === cat.id || (!!q && cat.articles.length > 0);
              return (
                <div
                  key={cat.id}
                  className={cn(
                    "rounded-xl border bg-vytal-card transition-all duration-200",
                    isExpanded
                      ? "border-[rgba(34,197,94,0.25)] shadow-sm shadow-[rgba(34,197,94,0.05)]"
                      : "border-vytal-border hover:border-[rgba(34,197,94,0.22)] hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/5"
                  )}
                >
                  <button
                    onClick={() =>
                      setExpandedCategory(isExpanded && !q ? null : cat.id)
                    }
                    className="flex w-full items-center gap-3 p-5 text-left"
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        cat.bg
                      )}
                    >
                      <Icon className={cn("h-5 w-5", cat.color)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-vytal-text">
                          {cat.title}
                        </span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 shrink-0 text-vytal-muted transition-transform duration-200",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </div>
                      <p className="mt-0.5 text-xs text-vytal-muted">
                        {cat.count} {t("help.articles")}
                      </p>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-vytal-border px-4 pb-4 pt-3 space-y-2">
                      {cat.articles.map((article, i) => (
                        <ArticleItem key={i} article={article} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Video Tutorials */}
      {!q && (
        <section>
          <div className="mb-5 flex items-center gap-2">
            <Play className="h-5 w-5 text-vytal-purple" />
            <h2 className="text-lg font-semibold text-vytal-text">
              {t("help.videoTutorials")}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {videoTutorials.map((video, i) => {
              const VIcon = video.icon;
              return (
                <button
                  key={i}
                  onClick={() =>
                    toast(
                      t("help.videoPlaying").replace("{title}", video.title),
                      "success"
                    )
                  }
                  className="group rounded-xl border border-vytal-border bg-vytal-card p-0 text-left transition-all duration-200 hover:border-[rgba(34,197,94,0.3)] hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10 overflow-hidden"
                >
                  {/* Thumbnail */}
                  <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-vytal-bg3 to-vytal-bg2">
                    <VIcon className="h-10 w-10 text-vytal-muted/25" />
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/25">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-vytal-green/90 text-vytal-bg opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 group-hover:scale-110">
                        <Play className="h-5 w-5 ml-0.5" />
                      </div>
                    </div>
                    {/* Duration badge */}
                    <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
                      {video.duration}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-vytal-muted">
                      {video.label}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-vytal-text leading-snug">
                      {video.title}
                    </h3>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section>
        <div className="mb-5 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-vytal-amber" />
          <h2 className="text-lg font-semibold text-vytal-text">{t("help.faq")}</h2>
        </div>
        {filteredFaqs.length === 0 ? (
          <p className="text-sm text-vytal-muted">{t("help.noFaqResults")}</p>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq, i) => (
              <FaqItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        )}
      </section>

      {/* Bottom row: Status + What's New */}
      {!q && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* System Status */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-vytal-green" />
                <h3 className="text-sm font-bold text-vytal-text">
                  {t("help.systemStatus")}
                </h3>
              </div>
              <span className="rounded-full bg-vytal-green/10 px-2.5 py-0.5 text-[11px] font-semibold text-vytal-green">
                99.98% uptime
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-vytal-green opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-vytal-green" />
              </span>
              <span className="text-sm font-medium text-vytal-green">
                {t("help.allOperational")}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-vytal-muted">{t("help.statusDesc")}</p>
            <div className="mt-4 space-y-2">
              {[
                t("help.statusApi"),
                t("help.statusApp"),
                t("help.statusPayments"),
              ].map((service) => (
                <div key={service} className="flex items-center justify-between">
                  <span className="text-xs text-vytal-muted">{service}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-vytal-green" />
                    <span className="text-[11px] text-vytal-green">{t("help.operational")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What's New */}
          <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-vytal-amber" />
                <h3 className="text-sm font-bold text-vytal-text">
                  {t("help.whatsNew")}
                </h3>
              </div>
              <Link
                href="/changelog"
                className="text-[11px] font-medium text-vytal-green hover:text-vytal-green/80 transition-colors flex items-center gap-1"
              >
                {t("help.viewChangelog")} <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {changelog.map((entry, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 rounded-md bg-vytal-bg3 px-2 py-0.5 text-[10px] font-mono text-vytal-muted">
                    {entry.date}
                  </span>
                  <p className="text-xs text-vytal-text leading-relaxed">{entry.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts */}
      {!q && (
        <section className="rounded-xl border border-vytal-border bg-vytal-card p-6">
          <div className="mb-1 flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-vytal-amber" />
            <h2 className="text-lg font-semibold text-vytal-text">
              {t("help.keyboardShortcuts")}
            </h2>
          </div>
          <p className="mb-5 text-xs text-vytal-muted">
            {t("help.keyboardShortcutsDesc")}
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {shortcuts.map((shortcut, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-vytal-bg3 px-4 py-3"
              >
                <span className="text-xs text-vytal-text">{shortcut.label}</span>
                <kbd className="rounded-md border border-vytal-border bg-vytal-bg2 px-2 py-1 text-[10px] font-semibold text-vytal-muted font-mono">
                  {shortcut.keys}
                </kbd>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact Support */}
      {!q && (
        <section>
          <div className="mb-5 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-vytal-green" />
            <h2 className="text-lg font-semibold text-vytal-text">
              {t("help.contactSupport")}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Email */}
            <a
              href="mailto:support@vytal.fit"
              className="group rounded-xl border border-vytal-border bg-vytal-card p-6 transition-all duration-200 hover:border-[rgba(34,197,94,0.3)] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 block"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-vytal-blue/10">
                <Mail className="h-5 w-5 text-vytal-blue" />
              </div>
              <h3 className="text-sm font-semibold text-vytal-text">Email</h3>
              <p className="mt-1 text-xs text-vytal-muted">{t("help.contactEmailDesc")}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-vytal-green group-hover:underline">
                support@vytal.fit <ExternalLink className="h-3 w-3" />
              </span>
            </a>

            {/* Chat */}
            <button
              onClick={() => toast(t("help.chatStarted"), "success")}
              className="group rounded-xl border border-vytal-border bg-vytal-card p-6 text-left transition-all duration-200 hover:border-[rgba(34,197,94,0.3)] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-vytal-green/10">
                <MessageCircle className="h-5 w-5 text-vytal-green" />
              </div>
              <h3 className="text-sm font-semibold text-vytal-text">
                {t("help.liveChat")}
              </h3>
              <p className="mt-1 text-xs text-vytal-muted">{t("help.contactChatDesc")}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-vytal-green">
                {t("help.startChat")} <ArrowRight className="h-3 w-3" />
              </span>
            </button>

            {/* Docs */}
            <a
              href="https://docs.vytal.fit"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-vytal-border bg-vytal-card p-6 transition-all duration-200 hover:border-[rgba(34,197,94,0.3)] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 block"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-vytal-amber/10">
                <BookOpen className="h-5 w-5 text-vytal-amber" />
              </div>
              <h3 className="text-sm font-semibold text-vytal-text">
                {t("help.documentation")}
              </h3>
              <p className="mt-1 text-xs text-vytal-muted">{t("help.contactDocsDesc")}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-vytal-green group-hover:underline">
                docs.vytal.fit <ExternalLink className="h-3 w-3" />
              </span>
            </a>
          </div>
        </section>
      )}

      {/* Footer info */}
      {!q && (
        <div className="flex items-center gap-3 rounded-xl border border-vytal-border bg-vytal-card px-5 py-3.5">
          <Info className="h-4 w-4 shrink-0 text-vytal-muted" />
          <span className="text-xs text-vytal-muted">{t("help.appVersion")}</span>
          <span className="text-[10px] text-vytal-muted/40">|</span>
          <span className="text-xs text-vytal-muted">{t("help.buildInfo")}</span>
          <span className="ml-auto text-xs text-vytal-muted">{t("help.footerNote")}</span>
        </div>
      )}
    </div>
  );
}
