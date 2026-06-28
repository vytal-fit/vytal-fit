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
import { mockExercises } from "@vytal-fit/shared";
import { useTheme } from "./_layout";
import type { Colors } from "@/colors";
import { t } from "@/i18n";
import { createPersonalRecord, listPersonalRecords } from "@/lib/auth-api";
import { useAuthStore } from "@/stores/auth-store";


const rmLabels = ["1RM", "2RM", "3RM", "4RM", "5RM", "6RM", "7RM", "8RM", "9RM", "10RM"];

// ─── Screen ──────────────────────────────────────────────
export default function PREntryScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const { user, activeOrgId } = useAuthStore();
  const memberId = user?.memberships.find((m) => m.organizationId === activeOrgId)?.id ?? user?.memberships[0]?.id ?? "";

  const exercise = mockExercises.find((e) => e.id === exerciseId) || mockExercises[0];
  const [existingPR, setExistingPR] = useState<{ value: string; unit: string; previousValue?: string } | null>(null);

  const [rmValues, setRmValues] = useState<string[]>(
    rmLabels.map((_, i) => {
      if (i === 0 && existingPR) return existingPR.value;
      return "";
    })
  );
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (!memberId) return;
    void (async () => {
      const records = await listPersonalRecords(memberId, exercise.id);
      const current = records[0];
      if (current) {
        setExistingPR({
          value: current.value,
          unit: current.unit,
          previousValue: current.previousValue ?? undefined,
        });
        setRmValues((prev) => {
          const next = [...prev];
          next[0] = current.value;
          return next;
        });
      }
    })();
  }, [exercise.id, memberId]);

  function updateRM(index: number, value: string) {
    const newValues = [...rmValues];
    newValues[index] = value;
    setRmValues(newValues);
  }

  function handleSave() {
    if (!memberId) return;
    setSaving(true);
    void (async () => {
      try {
        await createPersonalRecord({
          memberId,
          exerciseId: exercise.id,
          value: rmValues[0] || "",
          unit: "kg",
          achievedAt: new Date().toISOString(),
          previousValue: existingPR?.value ?? null,
          notes: notes || null,
        });
        router.back();
      } finally {
        setSaving(false);
      }
    })();
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
          <Text style={styles.headerTitle}>{t("prEntry.title")}</Text>
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
                { backgroundColor: getCategoryColor(exercise.category, C) + "18" },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: getCategoryColor(exercise.category, C) },
                ]}
              >
                {getCategoryLabel(exercise.category)}
              </Text>
            </View>
          </View>

          {/* Current PR */}
          {existingPR && (
            <View style={styles.currentPR}>
              <Text style={styles.currentPRLabel}>{t("prEntry.currentPR")}</Text>
              <Text style={styles.currentPRValue}>
                {existingPR.value} {existingPR.unit}
              </Text>
              {existingPR.previousValue && (
                <Text style={styles.currentPRPrev}>
                  {t("prEntry.previous")} {existingPR.previousValue} {existingPR.unit}
                </Text>
              )}
            </View>
          )}

          {/* RM Grid */}
          <Text style={styles.sectionTitle}>{t("prEntry.maxes")}</Text>
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
          <Text style={styles.sectionTitle}>{t("prEntry.notes")}</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder={t("prEntry.notesPlaceholder")}
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
                <Text style={styles.saveButtonText}>{t("btn.savedExcl")}</Text>
              </>
            ) : (
              <>
                <Save size={18} color="#080c0a" strokeWidth={2.5} />
                <Text style={styles.saveButtonText}>{t("btn.save")}</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
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
    default:
      return category.toUpperCase();
  }
}

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
    default:
      return C.muted;
  }
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

  // Scroll
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },

  // Exercise Card
  exerciseCard: {
    backgroundColor: C.card,
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
    backgroundColor: C.card,
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
    backgroundColor: C.card,
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
}); }
