import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronRight, Building2 } from "lucide-react-native";

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

// ─── Mock PR Data ────────────────────────────────────────
const mockPRs = [
  {
    id: "pr-1",
    exercise: "Back Squat",
    value: "140 kg",
    previousValue: "135 kg",
    unit: "kg" as const,
    achievedAt: "2026-06-02",
    category: "weightlifting",
  },
  {
    id: "pr-2",
    exercise: "Clean & Jerk",
    value: "110 kg",
    previousValue: "107.5 kg",
    unit: "kg" as const,
    achievedAt: "2026-05-28",
    category: "weightlifting",
  },
  {
    id: "pr-3",
    exercise: "Fran",
    value: "3:42",
    previousValue: "4:05",
    unit: "time" as const,
    achievedAt: "2026-05-25",
    category: "benchmark",
  },
  {
    id: "pr-4",
    exercise: "Deadlift",
    value: "180 kg",
    previousValue: "175 kg",
    unit: "kg" as const,
    achievedAt: "2026-05-20",
    category: "weightlifting",
  },
  {
    id: "pr-5",
    exercise: "Snatch",
    value: "85 kg",
    previousValue: "82.5 kg",
    unit: "kg" as const,
    achievedAt: "2026-05-15",
    category: "weightlifting",
  },
  {
    id: "pr-6",
    exercise: "500m Row",
    value: "1:28",
    previousValue: "1:32",
    unit: "time" as const,
    achievedAt: "2026-05-10",
    category: "cardio",
  },
  {
    id: "pr-7",
    exercise: "Strict Pull-Ups",
    value: "22 reps",
    previousValue: "18 reps",
    unit: "reps" as const,
    achievedAt: "2026-05-05",
    category: "gymnastics",
  },
  {
    id: "pr-8",
    exercise: "Front Squat",
    value: "120 kg",
    previousValue: "115 kg",
    unit: "kg" as const,
    achievedAt: "2026-04-28",
    category: "weightlifting",
  },
];

const stats = {
  totalPRs: mockPRs.length,
  thisMonth: mockPRs.filter((pr) => pr.achievedAt >= "2026-06-01").length,
  bestStreak: 4,
};

function getCategoryColor(category: string): string {
  switch (category) {
    case "weightlifting":
      return C.green;
    case "benchmark":
      return C.amber;
    case "cardio":
      return C.blue;
    case "gymnastics":
      return C.purple;
    default:
      return C.muted;
  }
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case "weightlifting":
      return "HALTEROFILIA";
    case "benchmark":
      return "BENCHMARK";
    case "cardio":
      return "CARDIO";
    case "gymnastics":
      return "GINASTICA";
    default:
      return category.toUpperCase();
  }
}

function formatDate(dateStr: string): string {
  const parts = dateStr.split("-");
  return `${parts[2]}/${parts[1]}`;
}

// Map exercise names to IDs for navigation
const exerciseNameToId: Record<string, string> = {
  "Back Squat": "ex-1",
  "Front Squat": "ex-2",
  "Deadlift": "ex-3",
  "Clean & Jerk": "ex-4",
  "Snatch": "ex-5",
  "Bench Press": "ex-6",
  "Overhead Press": "ex-7",
  "Thruster": "ex-9",
  "Pull-Up": "ex-10",
  "Strict Pull-Ups": "ex-10",
};

// ─── Screen ──────────────────────────────────────────────
export default function RecordsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Recordes</Text>
              <Text style={styles.headerSubtitle}>Os teus Personal Records</Text>
            </View>
            <TouchableOpacity
              style={styles.boxRecordsButton}
              onPress={() => router.push("/box-records")}
            >
              <Building2 size={16} color={C.green} strokeWidth={2} />
              <Text style={styles.boxRecordsText}>Box</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalPRs}</Text>
            <Text style={styles.statLabel}>Total PRs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: C.green }]}>
              {stats.thisMonth}
            </Text>
            <Text style={styles.statLabel}>Este Mes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: C.amber }]}>
              {stats.bestStreak}
            </Text>
            <Text style={styles.statLabel}>Melhor Streak</Text>
          </View>
        </View>

        {/* PR List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {mockPRs.map((pr) => {
            const catColor = getCategoryColor(pr.category);
            const exerciseId = exerciseNameToId[pr.exercise];
            return (
              <TouchableOpacity
                key={pr.id}
                style={styles.prCard}
                onPress={() => {
                  if (exerciseId) {
                    router.push(`/pr-entry?exerciseId=${exerciseId}`);
                  }
                }}
              >
                <View style={styles.prLeft}>
                  <View style={[styles.prAccent, { backgroundColor: catColor }]} />
                  <View style={styles.prInfo}>
                    <View style={styles.prTitleRow}>
                      <Text style={styles.prExercise}>{pr.exercise}</Text>
                      <View
                        style={[
                          styles.categoryBadge,
                          { backgroundColor: catColor + "18" },
                        ]}
                      >
                        <Text
                          style={[styles.categoryText, { color: catColor }]}
                        >
                          {getCategoryLabel(pr.category)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.prValueRow}>
                      <Text style={styles.prValue}>{pr.value}</Text>
                      {pr.previousValue && (
                        <Text style={styles.prPrevious}>
                          anterior: {pr.previousValue}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.prDate}>
                      {formatDate(pr.achievedAt)}
                    </Text>
                  </View>
                </View>
                <View style={styles.prRight}>
                  <View style={styles.prBadge}>
                    <Text style={styles.prBadgeIcon}>PR</Text>
                  </View>
                  {exerciseId && (
                    <ChevronRight size={14} color={C.muted} strokeWidth={2} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: C.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: C.muted,
    marginTop: 4,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
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

  // Scroll
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 10,
  },

  // PR Card
  prCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
  },
  prLeft: {
    flexDirection: "row",
    alignItems: "stretch",
    flex: 1,
    gap: 12,
  },
  prAccent: {
    width: 3,
    borderRadius: 2,
    minHeight: 40,
  },
  prInfo: {
    flex: 1,
  },
  prTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  prExercise: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
  },
  categoryBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  prValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
    marginBottom: 2,
  },
  prValue: {
    fontSize: 20,
    fontWeight: "800",
    color: C.green,
  },
  prPrevious: {
    fontSize: 12,
    color: C.muted,
  },
  prDate: {
    fontSize: 12,
    color: C.muted,
  },

  // Header Row
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  boxRecordsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.green + "40",
    backgroundColor: C.green + "10",
  },
  boxRecordsText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.green,
  },

  // PR Right
  prRight: {
    alignItems: "center",
    gap: 6,
    marginLeft: 12,
  },

  // PR Badge
  prBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.green + "18",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  prBadgeIcon: {
    fontSize: 13,
    fontWeight: "900",
    color: C.green,
    letterSpacing: 0.5,
  },
});
