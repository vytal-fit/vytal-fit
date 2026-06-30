"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle,
  Trophy,
  Megaphone,
  CalendarCheck,
  AlertCircle,
  Clock,
  Flame,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";
import type { NotificationType } from "@vytal-fit/shared";

type FilterTab = "all" | "unread" | "read";

const notificationIcon: Record<NotificationType, React.ReactNode> = {
  pr_achieved: <Trophy className="h-4 w-4 text-vytal-green" />,
  wod_published: <Megaphone className="h-4 w-4 text-vytal-blue" />,
  booking_confirmed: <CalendarCheck className="h-4 w-4 text-vytal-green" />,
  booking_cancelled: <AlertCircle className="h-4 w-4 text-vytal-red" />,
  class_reminder: <Clock className="h-4 w-4 text-vytal-amber" />,
  streak_milestone: <Flame className="h-4 w-4 text-vytal-green" />,
  payment_success: <CheckCircle className="h-4 w-4 text-vytal-green" />,
  payment_failed: <AlertCircle className="h-4 w-4 text-vytal-red" />,
};

const notificationBgColor: Record<NotificationType, string> = {
  pr_achieved: "bg-vytal-green/10",
  wod_published: "bg-vytal-blue/10",
  booking_confirmed: "bg-vytal-green/10",
  booking_cancelled: "bg-vytal-red/10",
  class_reminder: "bg-vytal-amber/10",
  streak_milestone: "bg-vytal-green/10",
  payment_success: "bg-vytal-green/10",
  payment_failed: "bg-vytal-red/10",
};

function formatTimeAgo(dateStr: string | Date): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
}

export default function NotificationsPage() {
  const { t } = useI18n();
  const utils = trpc.useUtils();
  const notificationsQuery = trpc.notifications.list.useQuery({ limit: 100 });
  const notifications = useMemo(
    () => notificationsQuery.data?.items ?? [],
    [notificationsQuery.data]
  );
  const markReadMutation = trpc.notifications.markRead.useMutation({
    onSuccess: () => utils.notifications.list.invalidate(),
  });
  const markAllReadMutation = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => utils.notifications.list.invalidate(),
  });
  const markNotificationRead = (id: string) => markReadMutation.mutate({ id });
  const markAllNotificationsRead = () => markAllReadMutation.mutate({});

  const [filter, setFilter] = useState<FilterTab>("all");

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const filtered = useMemo(() => {
    switch (filter) {
      case "unread": return notifications.filter((n) => !n.read);
      case "read": return notifications.filter((n) => n.read);
      default: return notifications;
    }
  }, [notifications, filter]);

  const filterTabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: "all", label: t("notifications.all") || "All", count: notifications.length },
    { key: "unread", label: t("notifications.unread") || "Unread", count: unreadCount },
    { key: "read", label: t("notifications.read") || "Read", count: notifications.length - unreadCount },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: t("nav.notifications") || "Notifications" }]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("notifications.title") || "Notifications"}</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {unreadCount > 0
              ? (t("notifications.unreadCount") || "{count} unread notifications").replace("{count}", String(unreadCount))
              : (t("notifications.allRead") || "All caught up!")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllNotificationsRead()}
              className="flex items-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
            >
              <CheckCircle className="h-4 w-4" /> {t("notifications.markAllRead") || "Mark All as Read"}
            </button>
          )}
          <Link
            href="/settings"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
            title={t("notifications.preferences") || "Notification preferences"}
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 rounded-lg bg-vytal-bg2 p-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              filter === tab.key
                ? "bg-vytal-card text-vytal-text shadow-sm"
                : "text-vytal-muted hover:text-vytal-text"
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                filter === tab.key ? "bg-vytal-green/10 text-vytal-green" : "bg-vytal-bg3 text-vytal-muted"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Bell className="h-8 w-8 text-vytal-muted" />
            <p className="mt-3 text-sm font-medium text-vytal-text">{t("notifications.noResults") || "No notifications"}</p>
            <p className="mt-1 text-xs text-vytal-muted">
              {filter === "unread"
                ? (t("notifications.noUnread") || "You're all caught up!")
                : (t("notifications.empty") || "No notifications to display")}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-vytal-border">
            {filtered.map((notification) => (
              <div
                key={notification.id}
                onClick={() => {
                  if (!notification.read) markNotificationRead(notification.id);
                }}
                className={cn(
                  "flex cursor-pointer items-start gap-4 px-6 py-4 row-interactive transition-colors hover:bg-vytal-bg3",
                  !notification.read && "bg-vytal-green/[0.03]"
                )}
              >
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  notificationBgColor[notification.type]
                )}>
                  {notificationIcon[notification.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={cn(
                        "text-sm font-semibold",
                        notification.read ? "text-vytal-muted" : "text-vytal-text"
                      )}>
                        {notification.title}
                      </p>
                      <p className="mt-0.5 text-sm text-vytal-muted">{notification.body}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-xs text-vytal-muted">{formatTimeAgo(notification.createdAt)}</span>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-vytal-green" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preferences Link */}
      <div className="rounded-xl border border-vytal-border bg-vytal-card p-6 text-center">
        <p className="text-sm text-vytal-muted">
          {t("notifications.preferencesHint") || "Want to customize your notifications?"}{" "}
          <Link href="/settings" className="font-medium text-vytal-green hover:underline">
            {t("notifications.goToPreferences") || "Go to notification preferences"}
          </Link>
        </p>
      </div>
    </div>
  );
}
