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
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Save, CheckCircle } from "lucide-react-native";
import { mockExercises, mockPersonalRecords } from "@vytal-fit/shared";

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

const rmLabels = ["1RM", "2RM", "3RM", "4RM", "5RM", "6RM", "7RM", "8RM", "9RM", "10RM"];

// ─── Screen ──────────────────────────────────────────────
export default function PREntryScreen() {
  const router = useRouter();
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();

  const exercise = mockExercises.find((e) => e.id === exerciseId) || mockExercises[0];
  const existingPR = mockPersonalRecords.find((pr) => pr.exerciseId === exercise.id);

  const [rmValues, setRmValues] = useState<string[]>(
    rmLabels.map((_, i) => {
      if (i === 0 && existingPR) return existingPR.value;
      return "";
    })
  );
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  function updateRM(index: number, value: string) {
    const newValues = [...rmValues];
    newValues[index] = value;
    setRmValues(newValues);
  }

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      router.back();
    }, 800);
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
          <Text style={styles.headerTitle}>Registar PR</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Exercise Name */}
          <View style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: getCategoryColor(exercise.category) + "18" },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: getCategoryColor(exercise.category) },
                ]}
              >
                {exercise.category.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Current PR */}
          {existingPR && (
            <View style={styles.currentPR}>
              <Text style={styles.currentPRLabel}>PR Atual</Text>
              <Text style={styles.currentPRValue}>
                {existingPR.value} {existingPR.unit}
              </Text>
              {existingPR.previousValue && (
                <Text style={styles.currentPRPrev}>
                  Anterior: {existingPR.previousValue} {existingPR.unit}
                </Text>
              )}
            </View>
          )}

          {/* RM Grid */}
          <Text style={styles.sectionTitle}>Maximos (kg)</Text>
          <View style={styles.rmGrid}>
            {rmLabels.map((label, i) => (
              <View key={label} style={styles.rmCell}>
                <Text style={styles.rmLabel}>{label}</Text>
                <TextInput
                  style={styles.rmInput}
                  value={rmValues[i]}
                  onChangeText={(val) => updateRM(i, val)}
                  keyboardType="numeric"
                  placeholderTextColor={C.muted + "60"}
                  placeholder="--"
                />
              </View>
            ))}
          </View>

          {/* Notes */}
          <Text style={styles.sectionTitle}>Notas</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Adiciona notas sobre o teu treino..."
            placeholderTextColor={C.muted + "60"}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Save Button */}
          <TouchableOpacity style={[styles.saveButton, saving && styles.saveButtonSaving]} onPress={handleSave} disabled={saving}>
            {saving ? (
              <>
                <CheckCircle size={18} color="#080c0a" strokeWidth={2.5} />
                <Text style={styles.saveButtonText}>GUARDADO!</Text>
              </>
            ) : (
              <>
                <Save size={18} color="#080c0a" strokeWidth={2.5} />
                <Text style={styles.saveButtonText}>GUARDAR</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function getCategoryColor(category: string): string {
  switch (category) {
    case "weightlifting":
      return C.green;
    case "gymnastics":
      return C.purple;
    case "cardio":
      return C.blue;
    case "strength":
      return C.amber;
    default:
      return C.muted;
  }
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

  // Scroll
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },

  // Exercise Card
  exerciseCard: {
    backgroundColor: C.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  exerciseName: {
    fontSize: 22,
    fontWeight: "800",
    color: C.green,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // Current PR
  currentPR: {
    backgroundColor: C.amber + "12",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.amber + "30",
    padding: 16,
  },
  currentPRLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: C.muted,
    marginBottom: 4,
  },
  currentPRValue: {
    fontSize: 24,
    fontWeight: "800",
    color: C.amber,
  },
  currentPRPrev: {
    fontSize: 12,
    color: C.muted,
    marginTop: 4,
  },

  // Section Title
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
    marginTop: 8,
    marginBottom: 4,
  },

  // RM Grid
  rmGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  rmCell: {
    width: "18.5%",
    backgroundColor: C.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 10,
    alignItems: "center",
  },
  rmLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.muted,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  rmInput: {
    fontSize: 16,
    fontWeight: "700",
    color: C.green,
    textAlign: "center",
    width: "100%",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },

  // Notes
  notesInput: {
    backgroundColor: C.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    fontSize: 14,
    color: C.text,
    minHeight: 100,
  },

  // Save
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.green,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
  },
  saveButtonSaving: {
    backgroundColor: C.blue,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#080c0a",
    letterSpacing: 1,
  },
});
