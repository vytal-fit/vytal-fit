import React, { useState, useMemo } from "react";
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
import { ArrowLeft } from "lucide-react-native";
import { useTheme } from "./_layout";
import type { Colors } from "@/colors";


// ─── Brzycki Formula ────────────────────────────────────
// 1RM = weight / (1.0278 - 0.0278 * reps)
// For given weight at given reps, estimate 1RM
// Then calculate percentages from that 1RM
function calculate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return weight / (1.0278 - 0.0278 * reps);
}

const percentages = [
  100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5,
];

const rmOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function getPercentColor(pct: number, C: Colors): string {
  if (pct >= 90) return C.red;
  if (pct >= 80) return C.orange;
  if (pct >= 70) return C.amber;
  if (pct >= 50) return C.green;
  return C.blue;
}

// ─── Screen ──────────────────────────────────────────────
export default function CalculatorScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();
  const [weight, setWeight] = useState("");
  const [selectedRM, setSelectedRM] = useState(1);
  const [showRMPicker, setShowRMPicker] = useState(false);

  const weightNum = parseFloat(weight) || 0;
  const estimated1RM = useMemo(
    () => calculate1RM(weightNum, selectedRM),
    [weightNum, selectedRM]
  );

  const percentageTable = useMemo(() => {
    if (estimated1RM <= 0) return [];
    return percentages.map((pct) => ({
      percent: pct,
      weight: Math.round((estimated1RM * pct) / 100 * 2) / 2, // round to 0.5
    }));
  }, [estimated1RM]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={C.text} strokeWidth={1.8} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Calculadora RM</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* RM Selector */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>REPETITION MAXIMUM</Text>
            <TouchableOpacity
              style={styles.rmSelector}
              onPress={() => setShowRMPicker(!showRMPicker)}
            >
              <Text style={styles.rmSelectorText}>{selectedRM}RM</Text>
              <Text style={styles.rmSelectorArrow}>{showRMPicker ? "^" : "v"}</Text>
            </TouchableOpacity>

            {showRMPicker && (
              <View style={styles.rmPicker}>
                {rmOptions.map((rm) => (
                  <TouchableOpacity
                    key={rm}
                    style={[
                      styles.rmOption,
                      selectedRM === rm && styles.rmOptionActive,
                    ]}
                    onPress={() => {
                      setSelectedRM(rm);
                      setShowRMPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.rmOptionText,
                        selectedRM === rm && styles.rmOptionTextActive,
                      ]}
                    >
                      {rm}RM
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Weight Input */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>PESO (KG)</Text>
            <View style={styles.weightInputRow}>
              <TouchableOpacity
                style={styles.weightBtn}
                onPress={() => setWeight(String(Math.max(0, weightNum - 2.5)))}
              >
                <Text style={styles.weightBtnText}>-</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.weightInput}
                placeholder="0"
                placeholderTextColor={C.muted}
                keyboardType="decimal-pad"
                value={weight}
                onChangeText={setWeight}
              />
              <TouchableOpacity
                style={styles.weightBtn}
                onPress={() => setWeight(String(weightNum + 2.5))}
              >
                <Text style={styles.weightBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Estimated 1RM */}
          {estimated1RM > 0 && (
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>1RM ESTIMADO</Text>
              <Text style={styles.resultValue}>
                {Math.round(estimated1RM * 2) / 2} kg
              </Text>
              <Text style={styles.resultNote}>Baseado na formula de Brzycki</Text>
            </View>
          )}

          {/* Percentage Table */}
          {percentageTable.length > 0 && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>TABELA DE PERCENTAGENS</Text>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>%</Text>
                <Text style={styles.tableHeaderText}>Peso</Text>
              </View>
              {percentageTable.map((row) => {
                const pctColor = getPercentColor(row.percent, C);
                return (
                  <View key={row.percent} style={styles.tableRow}>
                    <View style={styles.tablePercentRow}>
                      <View style={[styles.tablePercentBar, { backgroundColor: pctColor, width: `${row.percent}%` }]} />
                      <Text style={[styles.tablePercentText, { color: pctColor }]}>
                        {row.percent}%
                      </Text>
                    </View>
                    <Text style={styles.tableWeight}>{row.weight} kg</Text>
                  </View>
                );
              })}
            </View>
          )}
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

  // Scroll
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 12,
  },

  // Section Card
  sectionCard: {
    backgroundColor: C.card,
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

  // RM Selector
  rmSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.surface2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
  },
  rmSelectorText: {
    fontSize: 18,
    fontWeight: "800",
    color: C.green,
  },
  rmSelectorArrow: {
    fontSize: 14,
    color: C.muted,
    fontWeight: "700",
  },
  rmPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  rmOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface2,
  },
  rmOptionActive: {
    backgroundColor: C.green,
    borderColor: C.green,
  },
  rmOptionText: {
    fontSize: 14,
    fontWeight: "700",
    color: C.muted,
  },
  rmOptionTextActive: {
    color: "#080c0a",
  },

  // Weight Input
  weightInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  weightBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  weightBtnText: {
    fontSize: 24,
    fontWeight: "700",
    color: C.green,
  },
  weightInput: {
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

  // Result Card
  resultCard: {
    backgroundColor: C.green + "12",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.green + "30",
    padding: 20,
    alignItems: "center",
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: C.muted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 40,
    fontWeight: "800",
    color: C.green,
    fontVariant: ["tabular-nums"],
  },
  resultNote: {
    fontSize: 12,
    color: C.muted,
    marginTop: 8,
    fontStyle: "italic",
  },

  // Percentage Table
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginBottom: 6,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: "800",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border + "50",
  },
  tablePercentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  tablePercentBar: {
    height: 4,
    borderRadius: 2,
    maxWidth: 100,
  },
  tablePercentText: {
    fontSize: 14,
    fontWeight: "700",
    width: 44,
  },
  tableWeight: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
    fontVariant: ["tabular-nums"],
  },
}); }
