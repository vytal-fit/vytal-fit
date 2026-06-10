import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { mockExercises } from "@vytal-fit/shared";
import { ArrowLeft, Search } from "lucide-react-native";
import { useTheme } from "./_layout";
import type { Colors } from "@/colors";
import { t } from "@/i18n";


function getCategoryColor(category: string, C: Colors): string {
  switch (category) {
    case "weightlifting":
      return C.green;
    case "gymnastics":
      return C.purple;
    case "cardio":
      return C.blue;
    case "strength":
      return C.amber;
    case "other":
      return C.orange;
    default:
      return C.muted;
  }
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case "weightlifting":
      return t("cat.weightliftingFull");
    case "gymnastics":
      return t("cat.gymnasticsFull");
    case "cardio":
      return t("cat.cardioFull");
    case "strength":
      return t("cat.strengthFull");
    case "other":
      return t("cat.otherFull");
    default:
      return category.toUpperCase();
  }
}

// ─── Screen ──────────────────────────────────────────────
export default function ExerciseLibraryScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredExercises = useMemo(() => {
    if (!search.trim()) return mockExercises;
    const q = search.toLowerCase();
    return mockExercises.filter(
      (ex) =>
        ex.name.toLowerCase().includes(q) ||
        ex.category.toLowerCase().includes(q) ||
        (ex.equipment && ex.equipment.some((e) => e.toLowerCase().includes(q)))
    );
  }, [search]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={C.text} strokeWidth={1.8} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("screen.exercises")}</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color={C.muted} strokeWidth={1.8} />
          <TextInput
            style={styles.searchInput}
            placeholder={t("exercises.searchPlaceholder")}
            placeholderTextColor={C.muted}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Count */}
        <Text style={styles.resultCount}>
          {filteredExercises.length === 1
            ? t("exercises.one")
            : t("exercises.count").replace("{n}", String(filteredExercises.length))}
        </Text>

        {/* Exercise List */}
        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const catColor = getCategoryColor(item.category, C);
            return (
              <View style={styles.exerciseCard}>
                <View style={styles.exerciseLeft}>
                  <View style={[styles.categoryAccent, { backgroundColor: catColor }]} />
                  <View style={styles.exerciseInfo}>
                    <View style={styles.exerciseHeader}>
                      <Text style={styles.exerciseName}>{item.name}</Text>
                      <View style={[styles.categoryBadge, { backgroundColor: catColor + "18" }]}>
                        <Text style={[styles.categoryText, { color: catColor }]}>
                          {getCategoryLabel(item.category)}
                        </Text>
                      </View>
                    </View>
                    {item.equipment && item.equipment.length > 0 && (
                      <View style={styles.equipmentRow}>
                        {item.equipment.map((eq, i) => (
                          <View key={i} style={styles.equipmentTag}>
                            <Text style={styles.equipmentText}>{eq}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    {item.muscleGroups && item.muscleGroups.length > 0 && (
                      <Text style={styles.muscleText} numberOfLines={1}>
                        {item.muscleGroups.join(" / ")}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t("exercises.empty")}</Text>
            </View>
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

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: C.text,
  },

  // Count
  resultCount: {
    fontSize: 12,
    fontWeight: "600",
    color: C.muted,
    paddingHorizontal: 20,
    marginBottom: 8,
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    gap: 8,
  },

  // Exercise Card
  exerciseCard: {
    flexDirection: "row",
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
  },
  exerciseLeft: {
    flexDirection: "row",
    flex: 1,
    gap: 12,
  },
  categoryAccent: {
    width: 3,
    borderRadius: 2,
    minHeight: 40,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
    flexWrap: "wrap",
  },
  exerciseName: {
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
  equipmentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 4,
  },
  equipmentTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
  },
  equipmentText: {
    fontSize: 11,
    fontWeight: "600",
    color: C.muted,
  },
  muscleText: {
    fontSize: 12,
    color: C.muted,
    fontStyle: "italic",
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
