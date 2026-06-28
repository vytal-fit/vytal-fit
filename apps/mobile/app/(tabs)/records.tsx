import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronRight, Building2, Plus, SortAsc, SortDesc, Zap, TrendingUp } from "lucide-react-native";
import { useTheme } from "../_layout";
import type { Colors } from "@/colors";
import { t } from "@/i18n";
import { listPersonalRecords } from "@/lib/auth-api";
import { useAuthStore } from "@/stores/auth-store";

type LivePR = {
  id: string;
  exerciseId: string;
  exercise: string;
  value: string;
  previousValue?: string | null;
  unit: "kg" | "lbs" | "time" | "reps" | "meters" | "calories";
  achievedAt: string;
  category: string;
};

const CATEGORIES = ["Todos", "weightlifting", "benchmark", "cardio", "gymnastics"] as const;
type Category = typeof CATEGORIES[number];

function getCategoryPillLabel(cat: string): string {
  switch (cat) {
    case "Todos": return t("cat.all");
    case "weightlifting": return t("cat.weightlifting");
    case "benchmark": return t("cat.benchmark");
    case "cardio": return t("cat.cardio");
    case "gymnastics": return t("cat.gymnastics");
    default: return cat.toUpperCase();
  }
}

function getCategoryColor(category: string, C: Colors): string {
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
    case "weightlifting": return t("cat.weightliftingFull");
    case "benchmark": return t("cat.benchmarkFull");
    case "cardio": return t("cat.cardioFull");
    case "gymnastics": return t("cat.gymnasticsFull");
    default: return category.toUpperCase();
  }
}

function formatDate(dateStr: string): string {
  const parts = dateStr.split("-");
  return `${parts[2]}/${parts[1]}/${parts[0].slice(2)}`;
}

function computeMonthStreak(records: LivePR[]): number {
  const months = [...new Set(records.map((record) => record.achievedAt.slice(0, 7)))].sort().reverse();
  let streak = 0;
  let expected: string | null = null;

  for (const month of months) {
    if (!expected) {
      streak = 1;
      const [year, monthIndex] = month.split("-").map(Number) as [number, number];
      const prev = new Date(year, monthIndex - 1, 1);
      prev.setMonth(prev.getMonth() - 1);
      expected = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;
      continue;
    }

    if (month === expected) {
      streak += 1;
      const [year, monthIndex] = month.split("-").map(Number) as [number, number];
      const prev = new Date(year, monthIndex - 1, 1);
      prev.setMonth(prev.getMonth() - 1);
      expected = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;
      continue;
    }
    break;
  }

  return streak;
}

// ─── Screen ──────────────────────────────────────────────
export default function RecordsScreen() {
  const router = useRouter();
  const C = useTheme();
  const styles = makeStyles(C);
  const { user, activeOrgId } = useAuthStore();
  const memberId = useMemo(
    () => user?.memberships.find((m) => m.organizationId === activeOrgId)?.id ?? user?.memberships[0]?.id ?? "",
    [activeOrgId, user],
  );
  const [records, setRecords] = useState<LivePR[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>("Todos");
  const [sortDesc, setSortDesc] = useState(true);

  useEffect(() => {
    if (!memberId) return;

    let cancelled = false;
    setIsLoading(true);
    setLoadError(false);

    void listPersonalRecords(memberId)
      .then((rows) => {
        if (cancelled) return;
        const hydrated = rows
          .map<LivePR | null>((row) => {
            const exercise = row.exercise;
            if (!exercise) return null;
            return {
              id: row.id,
              exerciseId: row.exerciseId,
              exercise: exercise.name,
              value: row.unit === "time" ? row.value : `${row.value} ${row.unit}`,
              previousValue: row.previousValue ? (row.unit === "time" ? row.previousValue : `${row.previousValue} ${row.unit}`) : undefined,
              unit: row.unit as LivePR["unit"],
              achievedAt:
                typeof row.achievedAt === "string"
                  ? row.achievedAt
                  : row.achievedAt instanceof Date
                    ? row.achievedAt.toISOString().slice(0, 10)
                    : "",
              category: exercise.category,
            };
          })
          .filter((row): row is LivePR => Boolean(row))
          .sort((a, b) => b.achievedAt.localeCompare(a.achievedAt));
        setRecords(hydrated);
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

  const filtered = records
    .filter((pr) => activeCategory === "Todos" || pr.category === activeCategory)
    .sort((a, b) => sortDesc
      ? b.achievedAt.localeCompare(a.achievedAt)
      : a.achievedAt.localeCompare(b.achievedAt)
    );

  const stats = {
    totalPRs: records.length,
    thisMonth: records.filter((pr) => pr.achievedAt >= new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)).length,
    bestStreak: computeMonthStreak(records),
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
                <Text style={styles.headerBrand}>{t("records.headerBrand")}</Text>
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

        {loadError && (
          <View style={styles.errorState}>
            <Text style={styles.errorText}>{t("alert.error")}</Text>
          </View>
        )}

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
                  {getCategoryPillLabel(cat)}
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
          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color={C.green} />
            </View>
          ) : (
            <>
              {filtered.map((pr) => {
                const catColor = getCategoryColor(pr.category, C);
                return (
                  <TouchableOpacity
                    key={pr.id}
                    style={styles.prCard}
                    onPress={() => router.push(`/pr-entry?exerciseId=${pr.exerciseId}`)}
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
                      <ChevronRight size={14} color={C.muted} strokeWidth={2} />
                    </View>
                  </TouchableOpacity>
                );
              })}
              {filtered.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>{"( )"}</Text>
                  <Text style={styles.emptyText}>{t("records.empty")}</Text>
                </View>
              )}
            </>
          )}

          {/* Add PR CTA */}
          <TouchableOpacity
            style={styles.addPRCard}
            onPress={() => router.push("/pr-entry")}
          >
            <Plus size={20} color={C.green} strokeWidth={2.5} />
            <Text style={styles.addPRText}>{t("records.addPR")}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────
function makeStyles(C: Colors) { return StyleSheet.create({
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

  // Scroll
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  loadingState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },

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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 36,
    color: C.muted,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 15,
    color: C.muted,
  },
}); }
