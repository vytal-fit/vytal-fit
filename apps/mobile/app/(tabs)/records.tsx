import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronRight, Building2, Plus, SortAsc, SortDesc, Zap, TrendingUp } from "lucide-react-native";
import { colors } from "@/colors";
import { t } from "@/i18n";

const C = colors;

// ─── Mock PR Data ────────────────────────────────────────
const initialPRs = [
  { id: "pr-1", exercise: "Back Squat", value: "140 kg", previousValue: "135 kg", unit: "kg" as const, achievedAt: "2026-06-02", category: "weightlifting" },
  { id: "pr-2", exercise: "Clean & Jerk", value: "110 kg", previousValue: "107.5 kg", unit: "kg" as const, achievedAt: "2026-05-28", category: "weightlifting" },
  { id: "pr-3", exercise: "Fran", value: "3:42", previousValue: "4:05", unit: "time" as const, achievedAt: "2026-05-25", category: "benchmark" },
  { id: "pr-4", exercise: "Deadlift", value: "180 kg", previousValue: "175 kg", unit: "kg" as const, achievedAt: "2026-05-20", category: "weightlifting" },
  { id: "pr-5", exercise: "Snatch", value: "85 kg", previousValue: "82.5 kg", unit: "kg" as const, achievedAt: "2026-05-15", category: "weightlifting" },
  { id: "pr-6", exercise: "500m Row", value: "1:28", previousValue: "1:32", unit: "time" as const, achievedAt: "2026-05-10", category: "cardio" },
  { id: "pr-7", exercise: "Strict Pull-Ups", value: "22 reps", previousValue: "18 reps", unit: "reps" as const, achievedAt: "2026-05-05", category: "gymnastics" },
  { id: "pr-8", exercise: "Front Squat", value: "120 kg", previousValue: "115 kg", unit: "kg" as const, achievedAt: "2026-04-28", category: "weightlifting" },
];

const CATEGORIES = ["Todos", "weightlifting", "benchmark", "cardio", "gymnastics"] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_LABELS: Record<string, string> = {
  "Todos": "TODOS",
  "weightlifting": "HALTER.",
  "benchmark": "BENCH.",
  "cardio": "CARDIO",
  "gymnastics": "GIN.",
};

function getCategoryColor(category: string): string {
  switch (category) {
    case "weightlifting": return C.green;
    case "benchmark": return C.amber;
    case "cardio": return C.blue;
    case "gymnastics": return C.purple;
    default: return C.muted;
  }
}

function getCategoryLabelFull(category: string): string {
  switch (category) {
    case "weightlifting": return "HALTEROFILIA";
    case "benchmark": return "BENCHMARK";
    case "cardio": return "CARDIO";
    case "gymnastics": return "GINASTICA";
    default: return category.toUpperCase();
  }
}

function formatDate(dateStr: string): string {
  const parts = dateStr.split("-");
  return `${parts[2]}/${parts[1]}/${parts[0].slice(2)}`;
}

const exerciseNameToId: Record<string, string> = {
  "Back Squat": "ex-1", "Front Squat": "ex-2", "Deadlift": "ex-3",
  "Clean & Jerk": "ex-4", "Snatch": "ex-5", "Bench Press": "ex-6",
  "Overhead Press": "ex-7", "Thruster": "ex-9", "Pull-Up": "ex-10", "Strict Pull-Ups": "ex-10",
};

// ─── Screen ──────────────────────────────────────────────
export default function RecordsScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<Category>("Todos");
  const [sortDesc, setSortDesc] = useState(true);

  const filtered = initialPRs
    .filter((pr) => activeCategory === "Todos" || pr.category === activeCategory)
    .sort((a, b) => sortDesc
      ? b.achievedAt.localeCompare(a.achievedAt)
      : a.achievedAt.localeCompare(b.achievedAt)
    );

  const stats = {
    totalPRs: initialPRs.length,
    thisMonth: initialPRs.filter((pr) => pr.achievedAt >= "2026-06-01").length,
    bestStreak: 4,
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <View style={styles.headerBrandRow}>
                <Zap size={14} color={C.green} strokeWidth={2.5} fill={C.green} />
                <Text style={styles.headerBrand}>RECORDES</Text>
              </View>
              <Text style={styles.headerTitle}>{t("screen.records")}</Text>
              <Text style={styles.headerSubtitle}>{t("screen.records.subtitle")}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push("/box-records")}
              >
                <Building2 size={18} color={C.green} strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: C.green }]}
                onPress={() => router.push("/pr-entry")}
              >
                <Plus size={18} color="#080c0a" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <TrendingUp size={16} color={C.green} strokeWidth={2} style={{ marginBottom: 4 }} />
            <Text style={[styles.statValue, { color: C.green }]}>{stats.totalPRs}</Text>
            <Text style={styles.statLabel}>{t("label.totalPRs")}</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={16} color={C.blue} strokeWidth={2} style={{ marginBottom: 4 }} />
            <Text style={[styles.statValue, { color: C.blue }]}>{stats.thisMonth}</Text>
            <Text style={styles.statLabel}>{t("label.thisMonth")}</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={16} color={C.amber} strokeWidth={2} style={{ marginBottom: 4 }} />
            <Text style={[styles.statValue, { color: C.amber }]}>{stats.bestStreak}</Text>
            <Text style={styles.statLabel}>{t("label.bestStreak")}</Text>
          </View>
        </View>

        {/* Filter + Sort bar */}
        <View style={styles.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.filterPill, activeCategory === cat && styles.filterPillActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.filterPillText, activeCategory === cat && styles.filterPillTextActive]}>
                  {CATEGORY_LABELS[cat]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setSortDesc((v) => !v)}
          >
            {sortDesc
              ? <SortDesc size={18} color={C.muted} strokeWidth={2} />
              : <SortAsc size={18} color={C.muted} strokeWidth={2} />
            }
          </TouchableOpacity>
        </View>

        {/* PR List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {filtered.map((pr) => {
            const catColor = getCategoryColor(pr.category);
            const exerciseId = exerciseNameToId[pr.exercise];
            return (
              <TouchableOpacity
                key={pr.id}
                style={styles.prCard}
                onPress={() => exerciseId && router.push(`/pr-entry?exerciseId=${exerciseId}`)}
                activeOpacity={0.8}
              >
                <View style={[styles.prAccent, { backgroundColor: catColor }]} />
                <View style={styles.prInfo}>
                  <View style={styles.prTitleRow}>
                    <Text style={styles.prExercise}>{pr.exercise}</Text>
                    <View style={[styles.categoryBadge, { backgroundColor: catColor + "18" }]}>
                      <Text style={[styles.categoryText, { color: catColor }]}>
                        {getCategoryLabelFull(pr.category)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.prValueRow}>
                    <Text style={[styles.prValue, { color: catColor }]}>{pr.value}</Text>
                    {pr.previousValue && (
                      <Text style={styles.prPrevious}>
                        {t("label.previous")}: {pr.previousValue}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.prDate}>{formatDate(pr.achievedAt)}</Text>
                </View>
                <View style={styles.prRight}>
                  <View style={[styles.prBadge, { backgroundColor: catColor + "18" }]}>
                    <Text style={[styles.prBadgeIcon, { color: catColor }]}>PR</Text>
                  </View>
                  {exerciseId && <ChevronRight size={14} color={C.muted} strokeWidth={2} />}
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Add PR CTA */}
          <TouchableOpacity
            style={styles.addPRCard}
            onPress={() => router.push("/pr-entry")}
          >
            <Plus size={20} color={C.green} strokeWidth={2.5} />
            <Text style={styles.addPRText}>Adicionar novo PR</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1 },

  // Header
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerBrandRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  headerBrand: { fontSize: 10, fontWeight: "800", color: C.green, letterSpacing: 2 },
  headerTitle: { fontSize: 28, fontWeight: "800", color: C.text, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: C.muted, marginTop: 3 },
  headerActions: { flexDirection: "row", gap: 8, alignItems: "center", paddingTop: 20 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
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
    paddingVertical: 14,
    alignItems: "center",
  },
  statValue: { fontSize: 24, fontWeight: "800" },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: C.muted,
    marginTop: 3,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Filter bar
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16,
    marginBottom: 14,
  },
  filterScroll: { paddingHorizontal: 16, gap: 8 },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  filterPillActive: {
    backgroundColor: C.green,
    borderColor: C.green,
  },
  filterPillText: { fontSize: 10, fontWeight: "700", color: C.muted, letterSpacing: 0.5 },
  filterPillTextActive: { color: "#080c0a" },
  sortButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  // Scroll
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },

  // PR Card
  prCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  prAccent: { width: 4, alignSelf: "stretch" },
  prInfo: { flex: 1, padding: 14 },
  prTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  prExercise: { fontSize: 16, fontWeight: "700", color: C.text, flex: 1 },
  categoryBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  categoryText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  prValueRow: { flexDirection: "row", alignItems: "baseline", gap: 10, marginBottom: 2 },
  prValue: { fontSize: 22, fontWeight: "800" },
  prPrevious: { fontSize: 12, color: C.muted },
  prDate: { fontSize: 11, color: C.muted },
  prRight: { alignItems: "center", gap: 6, paddingRight: 14, paddingLeft: 8 },
  prBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  prBadgeIcon: { fontSize: 11, fontWeight: "900", letterSpacing: 0.5 },

  // Add PR card
  addPRCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.green + "30",
    borderStyle: "dashed",
    paddingVertical: 16,
  },
  addPRText: { fontSize: 14, fontWeight: "700", color: C.green },
});
