import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

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

// ─── Helpers ─────────────────────────────────────────────
function getMonths(): { key: string; label: string; year: number; month: number }[] {
  const months: ReturnType<typeof getMonths> = [];
  const monthNames = [
    "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  for (let i = 0; i < 3; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: monthNames[d.getMonth()],
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
  classTypeColor: string;
  location: string;
  coach: string;
  status: "presente" | "falta" | "cancelada";
};

// ─── Mock Data ───────────────────────────────────────────
const mockBookingHistory: BookingHistoryEntry[] = [
  { id: "bh-1", date: "2026-06-02", startTime: "07:00", endTime: "08:00", classType: "CrossFit", classTypeColor: "#3dff6e", location: "Sala Principal", coach: "Andre Loureiro", status: "presente" },
  { id: "bh-2", date: "2026-06-01", startTime: "09:00", endTime: "10:00", classType: "CrossFit", classTypeColor: "#3dff6e", location: "Sala Principal", coach: "Marine Robba", status: "presente" },
  { id: "bh-3", date: "2026-05-30", startTime: "17:30", endTime: "18:30", classType: "CrossFit", classTypeColor: "#3dff6e", location: "Sala Principal", coach: "Andre Loureiro", status: "falta" },
  { id: "bh-4", date: "2026-05-28", startTime: "12:00", endTime: "13:00", classType: "Halterofilismo", classTypeColor: "#ffb300", location: "Sala Olimpica", coach: "Ricardo Ribeiro", status: "presente" },
  { id: "bh-5", date: "2026-05-26", startTime: "07:00", endTime: "08:00", classType: "CrossFit", classTypeColor: "#3dff6e", location: "Sala Principal", coach: "Andre Loureiro", status: "presente" },
  { id: "bh-6", date: "2026-05-24", startTime: "10:00", endTime: "11:30", classType: "Yoga", classTypeColor: "#c084fc", location: "Sala Zen", coach: "Sofia Mendes", status: "cancelada" },
  { id: "bh-7", date: "2026-05-22", startTime: "18:30", endTime: "19:30", classType: "CrossFit", classTypeColor: "#3dff6e", location: "Sala Principal", coach: "Marine Robba", status: "presente" },
  { id: "bh-8", date: "2026-05-20", startTime: "09:00", endTime: "10:00", classType: "CrossFit", classTypeColor: "#3dff6e", location: "Sala Principal", coach: "Andre Loureiro", status: "presente" },
  { id: "bh-9", date: "2026-05-18", startTime: "17:30", endTime: "18:30", classType: "Open Gym", classTypeColor: "#00d4ff", location: "Area Outdoor", coach: "Pedro Santos", status: "presente" },
  { id: "bh-10", date: "2026-05-15", startTime: "07:00", endTime: "08:00", classType: "CrossFit", classTypeColor: "#3dff6e", location: "Sala Principal", coach: "Andre Loureiro", status: "falta" },
];

function getStatusBadge(status: BookingHistoryEntry["status"]): { label: string; color: string; bg: string } {
  switch (status) {
    case "presente":
      return { label: "Presente", color: C.green, bg: C.green + "18" };
    case "falta":
      return { label: "Falta", color: C.red, bg: C.red + "18" };
    case "cancelada":
      return { label: "Cancelada", color: C.amber, bg: C.amber + "18" };
  }
}

function formatDate(dateStr: string): string {
  const parts = dateStr.split("-");
  return `${parts[2]}/${parts[1]}`;
}

// ─── Screen ──────────────────────────────────────────────
export default function BookingHistoryScreen() {
  const router = useRouter();
  const months = getMonths();
  const [selectedMonth, setSelectedMonth] = useState(months[0].key);

  const selectedMonthData = months.find((m) => m.key === selectedMonth)!;
  const filteredEntries = mockBookingHistory.filter((entry) => {
    const d = new Date(entry.date);
    return d.getMonth() === selectedMonthData.month && d.getFullYear() === selectedMonthData.year;
  });

  const totalThisMonth = filteredEntries.length;
  const presentCount = filteredEntries.filter((e) => e.status === "presente").length;
  const attendanceRate = totalThisMonth > 0 ? Math.round((presentCount / totalThisMonth) * 100) : 0;
  const streak = 4;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={C.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Historico de Aulas</Text>
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

        {/* Stats Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalThisMonth}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: C.green }]}>{attendanceRate}%</Text>
            <Text style={styles.statLabel}>Presenca</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: C.amber }]}>{streak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>

        {/* Booking List */}
        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const badge = getStatusBadge(item.status);
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
                    <View style={[styles.colorDot, { backgroundColor: item.classTypeColor }]} />
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
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>{"( )"}</Text>
              <Text style={styles.emptyText}>Sem registos neste mes</Text>
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
    backgroundColor: C.cardBg,
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

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 10,
  },

  // Card
  card: {
    backgroundColor: C.cardBg,
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
});
