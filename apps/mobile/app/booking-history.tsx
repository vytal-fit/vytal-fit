import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useTheme } from "./_layout";
import type { Colors } from "@/colors";
import { t } from "@/i18n";
import { listMemberBookings } from "@/lib/auth-api";
import { useAuthStore } from "@/stores/auth-store";


// ─── Helpers ─────────────────────────────────────────────
const MONTH_KEYS = [
  "month.jan", "month.feb", "month.mar", "month.apr", "month.may", "month.jun",
  "month.jul", "month.aug", "month.sep", "month.oct", "month.nov", "month.dec",
];

function getMonths(): { key: string; label: string; year: number; month: number }[] {
  const months: ReturnType<typeof getMonths> = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: t(MONTH_KEYS[d.getMonth()]),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return months;
}

type BookingHistoryEntry = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  classType: string;
  classTypeColor: keyof Colors;
  location: string;
  coach: string;
  status: "confirmed" | "checked_in" | "waitlisted" | "cancelled" | "no_show";
};

function getStatusBadge(status: BookingHistoryEntry["status"], C: Colors): { label: string; color: string; bg: string } {
  switch (status) {
    case "checked_in":
      return { label: t("bookingHistory.present"), color: C.green, bg: C.green + "18" };
    case "confirmed":
      return { label: t("bookingHistory.confirmed"), color: C.blue, bg: C.blue + "18" };
    case "waitlisted":
      return { label: t("bookingHistory.waitlisted"), color: C.amber, bg: C.amber + "18" };
    case "no_show":
      return { label: t("bookingHistory.absent"), color: C.red, bg: C.red + "18" };
    case "cancelled":
      return { label: t("bookingHistory.cancelled"), color: C.muted, bg: C.muted + "18" };
  }
}

function formatDate(dateStr: string): string {
  const parts = dateStr.split("-");
  return `${parts[2]}/${parts[1]}`;
}

// ─── Screen ──────────────────────────────────────────────
function fromBookingStatus(status: string): BookingHistoryEntry["status"] {
  if (status === "checked_in" || status === "confirmed" || status === "waitlisted" || status === "cancelled" || status === "no_show") {
    return status;
  }
  return "confirmed";
}

function getClassTypeColor(name: string): keyof Colors {
  const lower = name.toLowerCase();
  if (lower.includes("yoga")) return "purple";
  if (lower.includes("lift") || lower.includes("weight")) return "amber";
  if (lower.includes("open")) return "blue";
  return "green";
}

function deriveStreak(entries: BookingHistoryEntry[]): number {
  const completed = entries
    .filter((entry) => entry.status === "checked_in" || entry.status === "no_show")
    .map((entry) => entry.date)
    .sort((a, b) => b.localeCompare(a));

  let streak = 0;
  let lastDate: Date | null = null;
  for (const dateStr of completed) {
    const current = new Date(`${dateStr}T00:00:00`);
    if (!lastDate) {
      streak = 1;
      lastDate = current;
      continue;
    }
    const diffDays = Math.round((lastDate.getTime() - current.getTime()) / 86400000);
    if (diffDays <= 7) {
      streak += 1;
      lastDate = current;
      continue;
    }
    break;
  }
  return streak;
}

export default function BookingHistoryScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();
  const { user, activeOrgId } = useAuthStore();
  const memberId = useMemo(
    () => user?.memberships.find((m) => m.organizationId === activeOrgId)?.id ?? user?.memberships[0]?.id ?? "",
    [activeOrgId, user],
  );
  const [entries, setEntries] = useState<BookingHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const months = getMonths();
  const [selectedMonth, setSelectedMonth] = useState(months[0].key);
  const selectedMonthData = months.find((m) => m.key === selectedMonth) ?? months[0];

  useEffect(() => {
    if (!memberId) return;

    let cancelled = false;
    setIsLoading(true);
    setLoadError(false);

    void listMemberBookings(memberId)
      .then((rows) => {
        if (cancelled) return;
        const hydrated = rows
          .map<BookingHistoryEntry | null>((booking) => {
            const klass = booking.class;
            if (!klass) return null;
              return {
              id: booking.id,
              date: klass.date,
              startTime: klass.startTime,
              endTime: klass.endTime,
              classType: klass.classType?.name ?? t("label.unknown"),
              classTypeColor: getClassTypeColor(klass.classType?.name ?? ""),
              location: klass.location?.name ?? t("label.unknown"),
              coach:
                klass.coaches.find(
                  (coach): coach is NonNullable<typeof coach> => Boolean(coach),
                )?.name ?? t("label.unknown"),
              status: fromBookingStatus(booking.status),
            };
          })
          .filter((row): row is BookingHistoryEntry => Boolean(row))
          .sort((a, b) => b.date.localeCompare(a.date));
        setEntries(hydrated);
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

  const filteredEntries = entries.filter((entry) => {
    const d = new Date(entry.date);
    return d.getMonth() === selectedMonthData.month && d.getFullYear() === selectedMonthData.year;
  });

  const totalThisMonth = filteredEntries.length;
  const attendedCount = filteredEntries.filter((e) => e.status === "checked_in").length;
  const attendanceBase = filteredEntries.filter((e) => e.status === "checked_in" || e.status === "no_show").length;
  const attendanceRate = attendanceBase > 0 ? Math.round((attendedCount / attendanceBase) * 100) : 0;
  const streak = deriveStreak(entries);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={C.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("screen.bookingHistory")}</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Month Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthSelectorContent}
          style={styles.monthSelector}
        >
          {months.map((month) => {
            const isSelected = month.key === selectedMonth;
            return (
              <TouchableOpacity
                key={month.key}
                onPress={() => setSelectedMonth(month.key)}
                style={[styles.monthPill, isSelected && styles.monthPillActive]}
              >
                <Text style={[styles.monthPillText, isSelected && styles.monthPillTextActive]}>
                  {month.label}
                </Text>
                <Text style={[styles.monthPillYear, isSelected && styles.monthPillYearActive]}>
                  {month.year}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loadError && (
          <View style={styles.errorState}>
            <Text style={styles.errorText}>{t("alert.error")}</Text>
          </View>
        )}

        {/* Stats Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalThisMonth}</Text>
            <Text style={styles.statLabel}>{t("bookingHistory.total")}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: C.green }]}>{attendanceRate}%</Text>
            <Text style={styles.statLabel}>{t("bookingHistory.attendance")}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: C.amber }]}>{streak}</Text>
            <Text style={styles.statLabel}>{t("bookingHistory.streak")}</Text>
          </View>
        </View>

        {/* Booking List */}
        <FlatList
          data={isLoading ? [] : filteredEntries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const badge = getStatusBadge(item.status, C);
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.cardDateCol}>
                    <Text style={styles.cardDate}>{formatDate(item.date)}</Text>
                    <Text style={styles.cardTime}>{item.startTime} - {item.endTime}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.statusText, { color: badge.color }]}>{badge.label}</Text>
                  </View>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.classTypeRow}>
                    <View style={[styles.colorDot, { backgroundColor: C[item.classTypeColor] }]} />
                    <Text style={styles.classTypeName}>{item.classType}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>{"@"}</Text>
                    <Text style={styles.infoText}>{item.location}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>{"///"}</Text>
                    <Text style={styles.infoText}>{item.coach}</Text>
                  </View>
                </View>
              </View>
            );
          }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            isLoading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator color={C.green} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            isLoading ? null : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>{"( )"}</Text>
                <Text style={styles.emptyText}>{t("bookingHistory.empty")}</Text>
              </View>
            )
          }
        />
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
  },

  // Month Selector
  monthSelector: {
    maxHeight: 60,
    marginBottom: 12,
  },
  monthSelectorContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  monthPill: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  monthPillActive: {
    backgroundColor: C.green,
    borderColor: C.green,
  },
  monthPillText: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
  },
  monthPillTextActive: {
    color: "#080c0a",
  },
  monthPillYear: {
    fontSize: 11,
    fontWeight: "500",
    color: C.muted,
    marginTop: 2,
  },
  monthPillYearActive: {
    color: "#080c0a",
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    color: C.text,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: C.muted,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  errorState: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: C.red + "12",
    borderWidth: 1,
    borderColor: C.red + "30",
  },
  errorText: {
    fontSize: 13,
    fontWeight: "600",
    color: C.red,
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 10,
  },
  loadingState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },

  // Card
  card: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardDateCol: {
    gap: 2,
  },
  cardDate: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
  },
  cardTime: {
    fontSize: 13,
    fontWeight: "600",
    color: C.green,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  cardBody: {
    gap: 6,
  },
  classTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  classTypeName: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoIcon: {
    fontSize: 12,
    color: C.muted,
    width: 20,
    textAlign: "center",
    fontWeight: "700",
  },
  infoText: {
    fontSize: 14,
    color: C.muted,
  },

  // Empty
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 40,
    color: C.muted,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: C.muted,
  },
}); }
