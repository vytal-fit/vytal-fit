import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { colors } from "@/colors";

const C = { ...colors, cardBg: colors.card };

// ─── Score Type Config ──────────────────────────────────
const scoreTypes = [
  { key: "time", label: "Tempo" },
  { key: "rounds_reps", label: "Rounds+Reps" },
  { key: "weight", label: "Peso" },
  { key: "reps", label: "Reps" },
] as const;

type ScoreType = (typeof scoreTypes)[number]["key"];

const scaleOptions = [
  { key: "rx", label: "Rx", color: C.green },
  { key: "scaled", label: "Scaled", color: C.blue },
  { key: "rx_plus", label: "Rx+", color: C.purple },
] as const;

type ScaleType = (typeof scaleOptions)[number]["key"];

function getRPEColor(rpe: number): string {
  if (rpe <= 3) return C.green;
  if (rpe <= 5) return C.blue;
  if (rpe <= 7) return C.amber;
  if (rpe <= 9) return C.orange;
  return C.red;
}

// ─── Screen ──────────────────────────────────────────────
export default function ScoreEntryScreen() {
  const router = useRouter();
  const [scoreType, setScoreType] = useState<ScoreType>("time");
  const [scale, setScale] = useState<ScaleType>("rx");
  const [rpe, setRpe] = useState(7);
  const [notes, setNotes] = useState("");

  // Time inputs
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");

  // Rounds+Reps inputs
  const [rounds, setRounds] = useState("");
  const [reps, setReps] = useState("");

  // Weight input
  const [weight, setWeight] = useState("");

  // Reps input
  const [totalReps, setTotalReps] = useState("");

  const handleSave = () => {
    Alert.alert("Resultado Guardado", "O teu resultado foi guardado com sucesso!", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ArrowLeft size={24} color={C.text} strokeWidth={1.8} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Resultado</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* WOD Title */}
          <View style={styles.wodSection}>
            <Text style={styles.wodTitle}>FRAN</Text>
            <Text style={styles.wodSubtitle}>For Time - 21-15-9</Text>
          </View>

          {/* Score Type Selector */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>TIPO DE RESULTADO</Text>
            <View style={styles.typeSelector}>
              {scoreTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.typePill,
                    scoreType === type.key && styles.typePillActive,
                  ]}
                  onPress={() => setScoreType(type.key)}
                >
                  <Text
                    style={[
                      styles.typePillText,
                      scoreType === type.key && styles.typePillTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Score Input */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>SCORE</Text>
            {scoreType === "time" && (
              <View style={styles.timeInputRow}>
                <View style={styles.timeInputGroup}>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="00"
                    placeholderTextColor={C.muted}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={minutes}
                    onChangeText={setMinutes}
                  />
                  <Text style={styles.timeLabel}>min</Text>
                </View>
                <Text style={styles.timeSeparator}>:</Text>
                <View style={styles.timeInputGroup}>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="00"
                    placeholderTextColor={C.muted}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={seconds}
                    onChangeText={setSeconds}
                  />
                  <Text style={styles.timeLabel}>seg</Text>
                </View>
              </View>
            )}

            {scoreType === "rounds_reps" && (
              <View style={styles.timeInputRow}>
                <View style={styles.timeInputGroup}>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="0"
                    placeholderTextColor={C.muted}
                    keyboardType="number-pad"
                    value={rounds}
                    onChangeText={setRounds}
                  />
                  <Text style={styles.timeLabel}>rounds</Text>
                </View>
                <Text style={styles.timeSeparator}>+</Text>
                <View style={styles.timeInputGroup}>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="0"
                    placeholderTextColor={C.muted}
                    keyboardType="number-pad"
                    value={reps}
                    onChangeText={setReps}
                  />
                  <Text style={styles.timeLabel}>reps</Text>
                </View>
              </View>
            )}

            {scoreType === "weight" && (
              <View style={styles.singleInputRow}>
                <TextInput
                  style={styles.bigInput}
                  placeholder="0"
                  placeholderTextColor={C.muted}
                  keyboardType="decimal-pad"
                  value={weight}
                  onChangeText={setWeight}
                />
                <Text style={styles.unitLabel}>kg</Text>
              </View>
            )}

            {scoreType === "reps" && (
              <View style={styles.singleInputRow}>
                <TextInput
                  style={styles.bigInput}
                  placeholder="0"
                  placeholderTextColor={C.muted}
                  keyboardType="number-pad"
                  value={totalReps}
                  onChangeText={setTotalReps}
                />
                <Text style={styles.unitLabel}>reps</Text>
              </View>
            )}
          </View>

          {/* Scale Selector */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>ESCALA</Text>
            <View style={styles.scaleRow}>
              {scaleOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.scalePill,
                    scale === opt.key && {
                      backgroundColor: opt.color,
                      borderColor: opt.color,
                    },
                  ]}
                  onPress={() => setScale(opt.key)}
                >
                  <Text
                    style={[
                      styles.scalePillText,
                      scale === opt.key && styles.scalePillTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* RPE Slider */}
          <View style={styles.sectionCard}>
            <View style={styles.rpeHeader}>
              <Text style={styles.sectionLabel}>RPE (ESFORCO PERCEBIDO)</Text>
              <Text style={[styles.rpeValue, { color: getRPEColor(rpe) }]}>
                {rpe}
              </Text>
            </View>
            <View style={styles.rpeSlider}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.rpeDot,
                    {
                      backgroundColor:
                        val <= rpe ? getRPEColor(val) : C.surface2,
                    },
                  ]}
                  onPress={() => setRpe(val)}
                >
                  <Text
                    style={[
                      styles.rpeDotText,
                      {
                        color: val <= rpe ? "#080c0a" : C.muted,
                      },
                    ]}
                  >
                    {val}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.rpeLabels}>
              <Text style={styles.rpeLabelText}>Facil</Text>
              <Text style={styles.rpeLabelText}>Maximo</Text>
            </View>
          </View>

          {/* Notes */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>NOTAS</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Adicionar notas sobre o treino..."
              placeholderTextColor={C.muted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          {/* Spacer for bottom button */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Save Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>GUARDAR</Text>
          </TouchableOpacity>
        </View>
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

  // Scroll
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },

  // WOD Section
  wodSection: {
    alignItems: "center",
    paddingBottom: 8,
  },
  wodTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: C.green,
    letterSpacing: 1,
  },
  wodSubtitle: {
    fontSize: 13,
    color: C.muted,
    marginTop: 4,
  },

  // Section Card
  sectionCard: {
    backgroundColor: C.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: C.muted,
    letterSpacing: 1,
    marginBottom: 12,
  },

  // Type Selector
  typeSelector: {
    flexDirection: "row",
    gap: 8,
  },
  typePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
  },
  typePillActive: {
    backgroundColor: C.green,
    borderColor: C.green,
  },
  typePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.muted,
  },
  typePillTextActive: {
    color: "#080c0a",
  },

  // Time Input
  timeInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  timeInputGroup: {
    alignItems: "center",
  },
  timeInput: {
    width: 80,
    height: 64,
    borderRadius: 14,
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
    textAlign: "center",
    fontSize: 32,
    fontWeight: "800",
    color: C.text,
    fontVariant: ["tabular-nums"],
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: C.muted,
    marginTop: 6,
    textTransform: "uppercase",
  },
  timeSeparator: {
    fontSize: 32,
    fontWeight: "800",
    color: C.muted,
    marginBottom: 20,
  },

  // Single Input
  singleInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  bigInput: {
    width: 120,
    height: 64,
    borderRadius: 14,
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
    textAlign: "center",
    fontSize: 32,
    fontWeight: "800",
    color: C.text,
    fontVariant: ["tabular-nums"],
  },
  unitLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: C.muted,
  },

  // Scale
  scaleRow: {
    flexDirection: "row",
    gap: 10,
  },
  scalePill: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: "center",
  },
  scalePillText: {
    fontSize: 14,
    fontWeight: "800",
    color: C.muted,
    letterSpacing: 0.5,
  },
  scalePillTextActive: {
    color: "#080c0a",
  },

  // RPE
  rpeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rpeValue: {
    fontSize: 28,
    fontWeight: "800",
  },
  rpeSlider: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 4,
  },
  rpeDot: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rpeDotText: {
    fontSize: 13,
    fontWeight: "800",
  },
  rpeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  rpeLabelText: {
    fontSize: 11,
    fontWeight: "600",
    color: C.muted,
  },

  // Notes
  notesInput: {
    minHeight: 100,
    borderRadius: 12,
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    fontSize: 14,
    color: C.text,
    lineHeight: 20,
  },

  // Bottom Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 36,
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: C.green,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#080c0a",
    letterSpacing: 1.5,
  },
});
