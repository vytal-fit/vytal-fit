"use client";

import { useState, useMemo } from "react";
import {
  Megaphone,
  Plus,
  Calendar,
  Camera,
  Globe,
  Briefcase,
  Image,
  Clock,
  Send,
  TrendingUp,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { Breadcrumbs } from "@/components/breadcrumbs";

type Platform = "instagram" | "facebook" | "linkedin";
type PostStatus = "scheduled" | "published" | "draft";

interface ScheduledPost {
  id: string;
  platform: Platform;
  content: string;
  scheduledDate: string;
  scheduledTime: string;
  status: PostStatus;
  imageLabel?: string;
}

const platformConfig: Record<Platform, { label: string; icon: typeof Camera; color: string }> = {
  instagram: { label: "Instagram", icon: Camera, color: "text-pink-500" },
  facebook: { label: "Facebook", icon: Globe, color: "text-blue-500" },
  linkedin: { label: "LinkedIn", icon: Briefcase, color: "text-sky-600" },
};

const mockPosts: ScheduledPost[] = [
  { id: "post-1", platform: "instagram", content: "Novo WOD disponivel! Quem vem destruir hoje? #crossfit #wod #aveiro", scheduledDate: "2026-06-05", scheduledTime: "18:00", status: "scheduled", imageLabel: "WOD Photo" },
  { id: "post-2", platform: "facebook", content: "Parabens a todos os atletas que completaram o desafio de Maio! Resultados incriveis!", scheduledDate: "2026-06-04", scheduledTime: "10:00", status: "scheduled", imageLabel: "Group Photo" },
  { id: "post-3", platform: "instagram", content: "Member Spotlight: Ana Silva bateu o seu PR no Clean & Jerk! 65kg!", scheduledDate: "2026-06-06", scheduledTime: "19:00", status: "scheduled", imageLabel: "Ana PR" },
  { id: "post-4", platform: "linkedin", content: "CrossFit Aveiro esta a contratar! Procuramos coaches certificados para se juntarem a equipa.", scheduledDate: "2026-06-07", scheduledTime: "09:00", status: "draft" },
  { id: "post-5", platform: "instagram", content: "Open Box este sabado das 09:00 as 11:00. Tragam um amigo! #openbox #crossfit", scheduledDate: "2026-06-08", scheduledTime: "18:30", status: "scheduled" },
  { id: "post-6", platform: "facebook", content: "Promocao de Verao! 20% desconto no plano trimestral. Valido ate 30 de Junho.", scheduledDate: "2026-06-09", scheduledTime: "12:00", status: "scheduled", imageLabel: "Promo Banner" },
  { id: "post-7", platform: "instagram", content: "Treino de hoje: 21-15-9 Thrusters & Pull-ups. Quem se atreve? #fran #benchmark", scheduledDate: "2026-06-03", scheduledTime: "07:00", status: "published" },
  { id: "post-8", platform: "facebook", content: "Obrigado a todos que vieram ao evento de aniversario! 3 anos de CrossFit Aveiro!", scheduledDate: "2026-06-01", scheduledTime: "20:00", status: "published", imageLabel: "Anniversary" },
];

const statusBadge: Record<PostStatus, { label: string; className: string }> = {
  scheduled: { label: "Scheduled", className: "bg-vytal-blue/10 text-vytal-blue" },
  published: { label: "Published", className: "bg-vytal-green/10 text-vytal-green" },
  draft: { label: "Draft", className: "bg-vytal-muted/10 text-vytal-muted" },
};

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export default function MarketingPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [posts, setPosts] = useState(mockPosts);
  const [showCreate, setShowCreate] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(5); // June = 5 (0-indexed)
  const [calendarYear, setCalendarYear] = useState(2026);

  const [newPost, setNewPost] = useState({
    platform: "instagram" as Platform,
    content: "",
    scheduledDate: "",
    scheduledTime: "18:00",
  });

  const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
  const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);
  const monthLabel = new Date(calendarYear, calendarMonth).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const postsByDate = useMemo(() => {
    const map: Record<string, ScheduledPost[]> = {};
    posts.forEach((p) => {
      if (!map[p.scheduledDate]) map[p.scheduledDate] = [];
      map[p.scheduledDate].push(p);
    });
    return map;
  }, [posts]);

  const publishedCount = posts.filter((p) => p.status === "published").length;
  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;

  const handleCreate = (publish: boolean) => {
    if (!newPost.content || !newPost.scheduledDate) {
      toast(t("marketing.fillRequired"), "error");
      return;
    }
    const post: ScheduledPost = {
      id: `post-${Date.now()}`,
      platform: newPost.platform,
      content: newPost.content,
      scheduledDate: newPost.scheduledDate,
      scheduledTime: newPost.scheduledTime,
      status: publish ? "published" : "scheduled",
    };
    setPosts([post, ...posts]);
    setShowCreate(false);
    setNewPost({ platform: "instagram", content: "", scheduledDate: "", scheduledTime: "18:00" });
    toast(publish ? t("marketing.published") : t("marketing.scheduled"), "success");
  };

  const prevMonth = () => {
    if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1); }
    else setCalendarMonth(calendarMonth - 1);
  };

  const nextMonth = () => {
    if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1); }
    else setCalendarMonth(calendarMonth + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumbs items={[{ label: t("marketing.title") }]} />
          <p className="mt-1 text-sm text-vytal-muted">{t("marketing.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Plus className="h-4 w-4" />
          {t("marketing.createPost")}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-green/10">
              <Send className="h-4.5 w-4.5 text-vytal-green" />
            </div>
            <span className="text-sm text-vytal-muted">{t("marketing.postsThisMonth")}</span>
          </div>
          <span className="text-3xl font-bold text-vytal-text">{publishedCount + scheduledCount}</span>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-blue/10">
              <TrendingUp className="h-4.5 w-4.5 text-vytal-blue" />
            </div>
            <span className="text-sm text-vytal-muted">{t("marketing.avgEngagement")}</span>
          </div>
          <span className="text-3xl font-bold text-vytal-text">4.2%</span>
        </div>
        <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vytal-amber/10">
              <Eye className="h-4.5 w-4.5 text-vytal-amber" />
            </div>
            <span className="text-sm text-vytal-muted">{t("marketing.bestPost")}</span>
          </div>
          <span className="text-sm font-bold text-vytal-text truncate block">Member Spotlight: Ana Silva</span>
        </div>
      </div>

      {/* AI Suggestion */}
      <div className="rounded-xl border border-vytal-green/20 bg-vytal-green/[0.03] p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-vytal-green shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-vytal-text">{t("marketing.aiSuggestion")}</p>
            <p className="text-sm text-vytal-muted mt-0.5">{t("marketing.aiSuggestionText")}</p>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-vytal-text">{t("marketing.calendar")}</h3>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="rounded-lg p-1.5 text-vytal-muted hover:bg-vytal-bg3 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-vytal-text min-w-[140px] text-center">{monthLabel}</span>
            <button onClick={nextMonth} className="rounded-lg p-1.5 text-vytal-muted hover:bg-vytal-bg3 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-2 text-center text-[10px] font-semibold text-vytal-muted">{d}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-20" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayPosts = postsByDate[dateStr] ?? [];
            const isToday = dateStr === "2026-06-04";

            return (
              <div
                key={day}
                className={cn(
                  "h-20 rounded-lg border p-1.5 transition-colors",
                  isToday ? "border-vytal-green/30 bg-vytal-green/[0.03]" : "border-vytal-border/50 hover:bg-vytal-bg3/50"
                )}
              >
                <span className={cn("text-xs font-medium", isToday ? "text-vytal-green" : "text-vytal-muted")}>{day}</span>
                <div className="mt-0.5 space-y-0.5">
                  {dayPosts.slice(0, 2).map((p) => {
                    const PIcon = platformConfig[p.platform].icon;
                    return (
                      <div key={p.id} className="flex items-center gap-0.5 rounded bg-vytal-bg3/50 px-1 py-0.5">
                        <PIcon className={cn("h-2.5 w-2.5 shrink-0", platformConfig[p.platform].color)} />
                        <span className="text-[8px] text-vytal-muted truncate">{p.content.slice(0, 20)}</span>
                      </div>
                    );
                  })}
                  {dayPosts.length > 2 && (
                    <span className="text-[8px] text-vytal-muted">+{dayPosts.length - 2} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Post list */}
      <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-6">
        <h3 className="text-base font-bold text-vytal-text mb-4">{t("marketing.postList")}</h3>
        <div className="space-y-3">
          {posts.map((post) => {
            const pc = platformConfig[post.platform];
            const PIcon = pc.icon;
            const sb = statusBadge[post.status];

            return (
              <div key={post.id} className="flex items-start gap-4 rounded-lg border border-vytal-border p-4 transition-colors hover:bg-vytal-bg3/30">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-vytal-bg3">
                  <PIcon className={cn("h-5 w-5", pc.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-vytal-muted">{pc.label}</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", sb.className)}>
                      {sb.label}
                    </span>
                  </div>
                  <p className="text-sm text-vytal-text line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-vytal-muted">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.scheduledDate).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-vytal-muted">
                      <Clock className="h-3 w-3" />
                      {post.scheduledTime}
                    </span>
                    {post.imageLabel && (
                      <span className="flex items-center gap-1 text-xs text-vytal-muted">
                        <Image className="h-3 w-3" />
                        {post.imageLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Post Form */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-vytal-border bg-vytal-bg2 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-vytal-text">{t("marketing.newPost")}</h3>
              <button onClick={() => setShowCreate(false)} className="text-vytal-muted hover:text-vytal-text">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-vytal-text mb-1.5">{t("marketing.platform")}</label>
              <div className="flex items-center gap-2">
                {(["instagram", "facebook", "linkedin"] as Platform[]).map((p) => {
                  const config = platformConfig[p];
                  const PIcon = config.icon;
                  return (
                    <button
                      key={p}
                      onClick={() => setNewPost({ ...newPost, platform: p })}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        newPost.platform === p
                          ? "bg-vytal-bg3 ring-1 ring-vytal-green/30 text-vytal-text"
                          : "text-vytal-muted hover:bg-vytal-bg3"
                      )}
                    >
                      <PIcon className={cn("h-4 w-4", config.color)} />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-vytal-text mb-1.5">{t("marketing.content")}</label>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                rows={4}
                placeholder={t("marketing.contentPlaceholder")}
                className="w-full rounded-lg border border-vytal-border bg-vytal-bg px-3 py-2 text-sm text-vytal-text outline-none focus:ring-2 focus:ring-vytal-green/30 resize-none"
              />
            </div>

            <div className="rounded-lg border border-dashed border-vytal-border p-4 text-center">
              <Image className="h-8 w-8 text-vytal-muted mx-auto mb-2" />
              <p className="text-xs text-vytal-muted">{t("marketing.uploadImage")}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-vytal-text mb-1.5">{t("marketing.date")}</label>
                <input
                  type="date"
                  value={newPost.scheduledDate}
                  onChange={(e) => setNewPost({ ...newPost, scheduledDate: e.target.value })}
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg px-3 py-2 text-sm text-vytal-text outline-none focus:ring-2 focus:ring-vytal-green/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-vytal-text mb-1.5">{t("marketing.time")}</label>
                <input
                  type="time"
                  value={newPost.scheduledTime}
                  onChange={(e) => setNewPost({ ...newPost, scheduledTime: e.target.value })}
                  className="w-full rounded-lg border border-vytal-border bg-vytal-bg px-3 py-2 text-sm text-vytal-text outline-none focus:ring-2 focus:ring-vytal-green/30"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => handleCreate(true)}
                className="rounded-lg border border-vytal-border px-4 py-2 text-sm font-medium text-vytal-muted hover:text-vytal-text transition-colors"
              >
                {t("marketing.publishNow")}
              </button>
              <button
                onClick={() => handleCreate(false)}
                className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
              >
                <Clock className="h-4 w-4" />
                {t("marketing.schedule")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
