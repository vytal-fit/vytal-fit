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
import { ArrowLeft, Search } from "lucide-react-native";
import { mockExercises } from "@vytal-fit/shared";
import { useTheme } from "./_layout";
import type { Colors } from "@/colors";


// ─── Mock Box Records ────────────────────────────────────
type BoxRecord = {
  exerciseId: string;
  exerciseName: string;
  maleRecord: { holder: string; value: string } | null;
  femaleRecord: { holder: string; value: string } | null;
};

const mockBoxRecords: BoxRecord[] = [
  { exerciseId: "ex-1", exerciseName: "Back Squat", maleRecord: { holder: "Pedro Almeida", value: "175 kg" }, femaleRecord: { holder: "Ana Silva", value: "110 kg" } },
  { exerciseId: "ex-3", exerciseName: "Deadlift", maleRecord: { holder: "Jose Fonte", value: "200 kg" }, femaleRecord: { holder: "Ines Ferreira", value: "130 kg" } },
  { exerciseId: "ex-4", exerciseName: "Clean & Jerk", maleRecord: { holder: "Pedro Almeida", value: "125 kg" }, femaleRecord: { holder: "Ana Silva", value: "80 kg" } },
  { exerciseId: "ex-5", exerciseName: "Snatch", maleRecord: { holder: "Jose Fonte", value: "95 kg" }, femaleRecord: { holder: "Ines Ferreira", value: "60 kg" } },
  { exerciseId: "ex-6", exerciseName: "Bench Press", maleRecord: { holder: "Miguel Costa", value: "120 kg" }, femaleRecord: { holder: "Sofia Santos", value: "55 kg" } },
  { exerciseId: "ex-7", exerciseName: "Overhead Press", maleRecord: { holder: "Pedro Almeida", value: "82.5 kg" }, femaleRecord: { holder: "Ana Silva", value: "47.5 kg" } },
  { exerciseId: "ex-9", exerciseName: "Thruster", maleRecord: { holder: "Miguel Costa", value: "95 kg" }, femaleRecord: { holder: "Ines Ferreira", value: "57.5 kg" } },
  { exerciseId: "ex-2", exerciseName: "Front Squat", maleRecord: { holder: "Jose Fonte", value: "145 kg" }, femaleRecord: { holder: "Ana Silva", value: "95 kg" } },
  { exerciseId: "ex-10", exerciseName: "Pull-Up", maleRecord: { holder: "Pedro Almeida", value: "42 reps" }, femaleRecord: { holder: "Ines Ferreira", value: "25 reps" } },
  { exerciseId: "ex-11", exerciseName: "Muscle-Up", maleRecord: { holder: "Pedro Almeida", value: "12 reps" }, femaleRecord: { holder: "Ana Silva", value: "4 reps" } },
  { exerciseId: "ex-17", exerciseName: "Double Under", maleRecord: { holder: "Miguel Costa", value: "185 reps" }, femaleRecord: { holder: "Ines Ferreira", value: "150 reps" } },
  { exerciseId: "ex-24", exerciseName: "Rope Climb", maleRecord: { holder: "Pedro Almeida", value: "4.2s" }, femaleRecord: { holder: "Ana Silva", value: "6.8s" } },
];

type GenderFilter = "all" | "M" | "F";
type ScaleFilter = "rx" | "scaled";

// ─── Screen ──────────────────────────────────────────────
export default function BoxRecordsScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();
  const [gender, setGender] = useState<GenderFilter>("all");
  const [scale, setScale] = useState<ScaleFilter>("rx");
  const [search, setSearch] = useState("");

  const filteredRecords = useMemo(() => {
    let records = mockBoxRecords;
    if (search.trim()) {
      records = records.filter((r) =>
        r.exerciseName.toLowerCase().includes(search.toLowerCase())
      );
    }
    return records;
  }, [search]);

  function getRecordDisplay(record: BoxRecord) {
    if (gender === "M") return record.maleRecord;
    if (gender === "F") return record.femaleRecord;
    return record.maleRecord;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={22} color={C.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recordes da Box</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Filters */}
        <View style={styles.filtersRow}>
          {/* Gender Filter */}
          <View style={styles.filterGroup}>
            {(["all", "M", "F"] as GenderFilter[]).map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.filterPill, gender === g && styles.filterPillActive]}
                onPress={() => setGender(g)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    gender === g && styles.filterPillTextActive,
                  ]}
                >
                  {g === "all" ? "Todos" : g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Scale Filter */}
          <View style={styles.filterGroup}>
            {(["rx", "scaled"] as ScaleFilter[]).map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.filterPill, scale === s && styles.filterPillActive]}
                onPress={() => setScale(s)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    scale === s && styles.filterPillTextActive,
                  ]}
                >
                  {s === "rx" ? "Rx" : "Scaled"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={18} color={C.muted} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Pesquisar movimento..."
            placeholderTextColor={C.muted + "60"}
          />
        </View>

        {/* Records List */}
        <FlatList
          data={filteredRecords}
          keyExtractor={(item) => item.exerciseId}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const record = getRecordDisplay(item);
            return (
              <View style={styles.recordCard}>
                <View style={styles.recordLeft}>
                  <Text style={styles.recordExercise}>{item.exerciseName}</Text>
                  {record && (
                    <Text style={styles.recordHolder}>{record.holder}</Text>
                  )}
                </View>
                {record ? (
                  <Text style={styles.recordValue}>{record.value}</Text>
                ) : (
                  <Text style={styles.recordNA}>--</Text>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nenhum resultado encontrado</Text>
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

  // Filters
  filtersRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  filterGroup: {
    flexDirection: "row",
    backgroundColor: C.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    padding: 3,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterPillActive: {
    backgroundColor: C.green,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.muted,
  },
  filterPillTextActive: {
    color: "#080c0a",
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.text,
    paddingVertical: 12,
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 8,
  },

  // Record Card
  recordCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  recordLeft: {
    flex: 1,
  },
  recordExercise: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
    marginBottom: 4,
  },
  recordHolder: {
    fontSize: 13,
    color: C.muted,
    fontWeight: "500",
  },
  recordValue: {
    fontSize: 18,
    fontWeight: "800",
    color: C.green,
    marginLeft: 12,
  },
  recordNA: {
    fontSize: 18,
    fontWeight: "800",
    color: C.muted,
    marginLeft: 12,
  },

  // Empty
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: C.muted,
  },
}); }
