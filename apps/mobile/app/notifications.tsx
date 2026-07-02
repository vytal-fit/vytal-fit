import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Trophy,
  Dumbbell,
  CalendarCheck,
  Flame,
  Bell,
  CreditCard,
  CheckCheck,
} from "lucide-react-native";

import { useTheme } from "./_layout";
import type { Colors } from "@/colors";
import { t } from "@/i18n";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/lib/auth-api";
import { useAuthStore } from "@/stores/auth-store";

function getNotificationIcon(type: string, C: Colors): { icon: React.ReactNode; color: string } {
  switch (type) {
    case "pr_achieved":
      return { icon: <Trophy size={20} color={C.amber} strokeWidth={1.8} />, color: C.amber };
    case "wod_published":
      return { icon: <Dumbbell size={20} color={C.green} strokeWidth={1.8} />, color: C.green };
    case "booking_confirmed":
      return { icon: <CalendarCheck size={20} color={C.blue} strokeWidth={1.8} />, color: C.blue };
    case "streak_milestone":
      return { icon: <Flame size={20} color={C.orange} strokeWidth={1.8} />, color: C.orange };
    case "class_reminder":
      return { icon: <Bell size={20} color={C.purple} strokeWidth={1.8} />, color: C.purple };
    case "payment_success":
      return { icon: <CreditCard size={20} color={C.green} strokeWidth={1.8} />, color: C.green };
    case "payment_failed":
      return { icon: <CreditCard size={20} color={C.red} strokeWidth={1.8} />, color: C.red };
    default:
      return { icon: <Bell size={20} color={C.muted} strokeWidth={1.8} />, color: C.muted };
  }
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t("notifications.now");
  if (diffMins < 60) return `${diffMins}${t("notifications.minShort")}`;
  if (diffHours < 24) return `${diffHours}${t("notifications.hourShort")}`;
  if (diffDays < 7) return `${diffDays}${t("notifications.dayShort")}`;
  return `${Math.floor(diffDays / 7)}${t("notifications.weekShort")}`;
}

// ─── Screen ──────────────────────────────────────────────
export default function NotificationsScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();
  const { user, activeOrgId } = useAuthStore();
  const memberId = useMemo(
    () => user?.memberships.find((m) => m.organizationId === activeOrgId)?.id ?? user?.memberships[0]?.id ?? "",
    [activeOrgId, user],
  );

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!memberId) return;

    let cancelled = false;
    setIsLoading(true);
    setLoadError(false);

    void listNotifications({ memberId })
      .then((rows) => {
        if (cancelled) return;
        setNotifications(rows);
        setReadIds(new Set(rows.filter((n) => n.read).map((n) => n.id)));
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [memberId]);

  function markAsRead(id: string) {
    if (readIds.has(id)) return;
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    void markNotificationRead(id).catch(() => {
      // Revert on failure.
      setReadIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    });
  }

  function markAllAsRead() {
    const previous = readIds;
    setReadIds(new Set(notifications.map((n) => n.id)));
    void markAllNotificationsRead().catch(() => {
      setReadIds(previous);
    });
  }

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ArrowLeft size={24} color={C.text} strokeWidth={1.8} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t("screen.notifications")}</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadgeHeader}>
                <Text style={styles.unreadBadgeHeaderText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          {unreadCount > 0 ? (
            <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
              <CheckCheck size={18} color={C.green} strokeWidth={2} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 44 }} />
          )}
        </View>

        {/* Notification List */}
        {isLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color={C.green} />
          </View>
        ) : loadError ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t("alert.error")}</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const { icon, color } = getNotificationIcon(item.type, C);
              const isRead = readIds.has(item.id);
              return (
                <TouchableOpacity
                  style={[
                    styles.notifCard,
                    !isRead && styles.notifCardUnread,
                  ]}
                  onPress={() => markAsRead(item.id)}
                >
                  <View style={[styles.notifIconBox, { backgroundColor: color + "15" }]}>
                    {icon}
                  </View>
                  <View style={styles.notifContent}>
                    <View style={styles.notifHeader}>
                      <Text style={[styles.notifTitle, !isRead && styles.notifTitleUnread]}>
                        {item.title}
                      </Text>
                      <Text style={styles.notifTime}>{timeAgo(String(item.createdAt))}</Text>
                    </View>
                    <Text style={styles.notifBody} numberOfLines={2}>
                      {item.body}
                    </Text>
                  </View>
                  {!isRead && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>{t("label.noNotifications")}</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────
function makeStyles(C: Colors) { return StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
  },
  unreadBadgeHeader: {
    backgroundColor: C.red,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadBadgeHeaderText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#fff",
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    gap: 8,
  },

  // Notification Card
  notifCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 12,
  },
  notifCardUnread: {
    borderColor: C.green + "30",
    backgroundColor: C.green + "05",
  },
  notifIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  notifContent: {
    flex: 1,
  },
  notifHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: C.text,
    flex: 1,
  },
  notifTitleUnread: {
    fontWeight: "700",
    color: C.text,
  },
  notifTime: {
    fontSize: 12,
    color: C.muted,
    marginLeft: 8,
  },
  notifBody: {
    fontSize: 13,
    color: C.muted,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.green,
    marginLeft: 4,
  },

  // Mark All
  markAllButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.green + "15",
    borderWidth: 1,
    borderColor: C.green + "30",
    alignItems: "center",
    justifyContent: "center",
  },

  // Empty
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: C.muted,
  },
}); }
