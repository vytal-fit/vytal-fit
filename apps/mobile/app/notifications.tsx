import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { mockNotifications } from "@vytal-fit/shared";
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

// ─── Colors ──────────────────────────────────────────────
const C = {
  bg: "#080c0a",
  surface: "#0f1610",
  surface2: "#162018",
  green: "#3dff6e",
  blue: "#00d4ff",
  amber: "#ffb300",
  red: "#ff4757",
  purple: "#c084fc",
  orange: "#ff8c42",
  text: "#dceee0",
  muted: "#6b8c72",
  cardBg: "rgba(22,32,24,0.9)",
  border: "rgba(61,255,110,0.1)",
};

function getNotificationIcon(type: string): { icon: React.ReactNode; color: string } {
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

  if (diffMins < 1) return "agora";
  if (diffMins < 60) return `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return `${Math.floor(diffDays / 7)}sem`;
}

// ─── Screen ──────────────────────────────────────────────
export default function NotificationsScreen() {
  const router = useRouter();
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    mockNotifications.forEach((n) => {
      if (n.read) initial.add(n.id);
    });
    return initial;
  });

  function markAsRead(id: string) {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  function markAllAsRead() {
    setReadIds(new Set(mockNotifications.map((n) => n.id)));
  }

  const unreadCount = mockNotifications.filter((n) => !readIds.has(n.id)).length;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={C.text} strokeWidth={1.8} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Notificacoes</Text>
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
        <FlatList
          data={mockNotifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const { icon, color } = getNotificationIcon(item.type);
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
                    <Text style={styles.notifTime}>{timeAgo(item.createdAt)}</Text>
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
              <Text style={styles.emptyText}>Sem notificacoes</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
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
    backgroundColor: C.cardBg,
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
});
