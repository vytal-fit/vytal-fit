import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Zap, ChevronDown } from "lucide-react-native";
import { useTheme } from "./_layout";
import type { Colors } from "@/colors";


// ─── Types ───────────────────────────────────────────────
type WODHistoryEntry = {
  id: string;
  date: string;
  title: string;
  type: "amrap" | "for_time" | "emom" | "strength" | "tabata" | "custom";
  score: string | null;
  isPR: boolean;
  fistbumps: number;
};

// ─── Mock Data ───────────────────────────────────────────
const mockWODHistory: WODHistoryEntry[] = [
  { id: "wh-1", date: "2026-06-02", title: "FRAN", type: "for_time", score: "3:42", isPR: true, fistbumps: 12 },
  { id: "wh-2", date: "2026-06-01", title: "Heavy Day", type: "strength", score: "140 kg", isPR: false, fistbumps: 5 },
  { id: "wh-3", date: "2026-05-30", title: "CINDY", type: "amrap", score: "18+4", isPR: false, fistbumps: 8 },
  { id: "wh-4", date: "2026-05-28", title: "EMOM Chipper", type: "emom", score: "Completed", isPR: false, fistbumps: 3 },
  { id: "wh-5", date: "2026-05-25", title: "MURPH", type: "for_time", score: "38:22", isPR: true, fistbumps: 24 },
  { id: "wh-6", date: "2026-05-22", title: "Tabata Inferno", type: "tabata", score: "312 reps", isPR: false, fistbumps: 6 },
  { id: "wh-7", date: "2026-05-20", title: "DIANE", type: "for_time", score: "5:15", isPR: true, fistbumps: 15 },
  { id: "wh-8", date: "2026-05-18", title: "Strength Complex", type: "strength", score: null, isPR: false, fistbumps: 0 },
];

const SORT_OPTIONS = [
  { key: "recent", label: "Mais recente" },
  { key: "oldest", label: "Mais antigo" },
  { key: "prs", label: "PRs primeiro" },
  { key: "fistbumps", label: "Fist bumps primeiro" },
];

function getTypeBadge(type: string, C: Colors): { label: string; color: string } {
  switch (type) {
    case "amrap":
      return { label: "AMRAP", color: C.green };
    case "emom":
      return { label: "EMOM", color: C.blue };
    case "for_time":
      return { label: "FOR TIME", color: C.red };
    case "tabata":
      return { label: "TABATA", color: C.orange };
    case "strength":
      return { label: "STRENGTH", color: C.amber };
    default:
      return { label: "CUSTOM", color: C.purple };
  }
}

function formatDate(dateStr: string): string {
  const parts = dateStr.split("-");
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// ─── Screen ──────────────────────────────────────────────
export default function WODHistoryScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  let filtered = [...mockWODHistory];

  if (fromDate) {
    filtered = filtered.filter((e) => e.date >= fromDate);
  }
  if (toDate) {
    filtered = filtered.filter((e) => e.date <= toDate);
  }

  switch (sortBy) {
    case "oldest":
      filtered.sort((a, b) => a.date.localeCompare(b.date));
      break;
    case "prs":
      filtered.sort((a, b) => (b.isPR ? 1 : 0) - (a.isPR ? 1 : 0));
      break;
    case "fistbumps":
      filtered.sort((a, b) => b.fistbumps - a.fistbumps);
      break;
    default:
      filtered.sort((a, b) => b.date.localeCompare(a.date));
  }

  const currentSortLabel = SORT_OPTIONS.find((o) => o.key === sortBy)?.label || "Mais recente";

  function handleSearch() {
    setShowSortDropdown(false);
  }

  function handleCancel() {
    setFromDate("");
    setToDate("");
    setSortBy("recent");
    setShowSortDropdown(false);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={C.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Histórico de Treinos</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Filters */}
        <View style={styles.filtersSection}>
          <View style={styles.dateFiltersRow}>
            <View style={styles.dateInputGroup}>
              <Text style={styles.dateLabel}>DE</Text>
              <TextInput
                style={styles.dateInput}
                value={fromDate}
                onChangeText={setFromDate}
                placeholder="AAAA-MM-DD"
                placeholderTextColor={C.muted + "60"}
                autoCapitalize="none"
              />
            </View>
            <View style={styles.dateInputGroup}>
              <Text style={styles.dateLabel}>ATE</Text>
              <TextInput
                style={styles.dateInput}
                value={toDate}
                onChangeText={setToDate}
                placeholder="AAAA-MM-DD"
                placeholderTextColor={C.muted + "60"}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Sort Dropdown */}
          <View style={styles.sortSection}>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => setShowSortDropdown(!showSortDropdown)}
            >
              <Text style={styles.sortButtonText}>{currentSortLabel}</Text>
              <ChevronDown size={16} color={C.muted} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          {showSortDropdown && (
            <View style={styles.sortDropdown}>
              {SORT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.sortOption, sortBy === opt.key && styles.sortOptionActive]}
                  onPress={() => { setSortBy(opt.key); setShowSortDropdown(false); }}
                >
                  <Text style={[styles.sortOptionText, sortBy === opt.key && styles.sortOptionTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.filterActions}>
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>PESQUISAR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelFilterButton} onPress={handleCancel}>
              <Text style={styles.cancelFilterText}>LIMPAR</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* WOD History List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {filtered.map((entry) => {
            const badge = getTypeBadge(entry.type, C);
            return (
              <View key={entry.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardDateRow}>
                    <Text style={styles.cardDate}>{formatDate(entry.date)}</Text>
                    <View style={[styles.typeBadge, { backgroundColor: badge.color + "20" }]}>
                      <Text style={[styles.typeBadgeText, { color: badge.color }]}>
                        {badge.label}
                      </Text>
                    </View>
                  </View>
                  {entry.isPR && (
                    <View style={styles.prIndicator}>
                      <Zap size={14} color={C.amber} strokeWidth={2} fill={C.amber} />
                      <Text style={styles.prText}>PR</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.wodTitle}>{entry.title}</Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.scoreText}>
                    {entry.score || "Sem resultado"}
                  </Text>
                  {entry.fistbumps > 0 && (
                    <View style={styles.fistbumpRow}>
                      <Text style={styles.fistbumpIcon}>{"F"}</Text>
                      <Text style={styles.fistbumpCount}>{entry.fistbumps}</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}

          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>{"( )"}</Text>
              <Text style={styles.emptyText}>Sem treinos encontrados</Text>
            </View>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
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

  // Filters
  filtersSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  dateFiltersRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  dateInputGroup: {
    flex: 1,
    gap: 4,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: C.muted,
    letterSpacing: 1,
  },
  dateInput: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: C.text,
  },
  sortSection: {
    marginBottom: 10,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: C.text,
  },
  sortDropdown: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
  },
  sortOption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  sortOptionActive: {
    backgroundColor: C.green + "15",
  },
  sortOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: C.muted,
  },
  sortOptionTextActive: {
    color: C.green,
    fontWeight: "700",
  },
  filterActions: {
    flexDirection: "row",
    gap: 10,
  },
  searchButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: C.green,
    alignItems: "center",
  },
  searchButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#080c0a",
    letterSpacing: 1,
  },
  cancelFilterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: "center",
  },
  cancelFilterText: {
    fontSize: 13,
    fontWeight: "800",
    color: C.muted,
    letterSpacing: 1,
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 10,
  },

  // Card
  card: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardDate: {
    fontSize: 13,
    fontWeight: "600",
    color: C.muted,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  prIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.amber + "18",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  prText: {
    fontSize: 11,
    fontWeight: "800",
    color: C.amber,
    letterSpacing: 0.5,
  },
  wodTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "800",
    color: C.green,
  },
  fistbumpRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  fistbumpIcon: {
    fontSize: 12,
    fontWeight: "800",
    color: C.red,
    backgroundColor: C.red + "18",
    width: 22,
    height: 22,
    textAlign: "center",
    lineHeight: 22,
    borderRadius: 6,
    overflow: "hidden",
  },
  fistbumpCount: {
    fontSize: 13,
    fontWeight: "700",
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
