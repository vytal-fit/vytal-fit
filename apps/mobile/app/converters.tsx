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
import { ArrowLeft, ArrowLeftRight } from "lucide-react-native";

const C = {
  bg: "#080c0a",
  surface: "#0f1610",
  surface2: "#162018",
  green: "#3dff6e",
  blue: "#00d4ff",
  amber: "#ffb300",
  text: "#dceee0",
  muted: "#6b8c72",
  cardBg: "rgba(22,32,24,0.9)",
  border: "rgba(61,255,110,0.1)",
};

function ConverterSection({
  title,
  unitA,
  unitB,
  aToB,
  bToA,
}: {
  title: string;
  unitA: string;
  unitB: string;
  aToB: (v: number) => number;
  bToA: (v: number) => number;
}) {
  const [valA, setValA] = useState("");
  const [valB, setValB] = useState("");

  function handleA(text: string) {
    setValA(text);
    const num = parseFloat(text);
    if (!isNaN(num)) {
      setValB(aToB(num).toFixed(2));
    } else {
      setValB("");
    }
  }

  function handleB(text: string) {
    setValB(text);
    const num = parseFloat(text);
    if (!isNaN(num)) {
      setValA(bToA(num).toFixed(2));
    } else {
      setValA("");
    }
  }

  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.converterRow}>
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={C.muted}
            keyboardType="decimal-pad"
            value={valA}
            onChangeText={handleA}
          />
          <Text style={styles.unitLabel}>{unitA}</Text>
        </View>
        <ArrowLeftRight size={20} color={C.green} strokeWidth={2} />
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={C.muted}
            keyboardType="decimal-pad"
            value={valB}
            onChangeText={handleB}
          />
          <Text style={styles.unitLabel}>{unitB}</Text>
        </View>
      </View>
    </View>
  );
}

export default function ConvertersScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={C.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Conversores</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <ConverterSection
            title="Distancia"
            unitA="Miles"
            unitB="Km"
            aToB={(v) => v * 1.60934}
            bToA={(v) => v / 1.60934}
          />
          <ConverterSection
            title="Peso"
            unitA="Pounds"
            unitB="Kg"
            aToB={(v) => v * 0.453592}
            bToA={(v) => v / 0.453592}
          />
          <ConverterSection
            title="Comprimento"
            unitA="Inches"
            unitB="Cm"
            aToB={(v) => v * 2.54}
            bToA={(v) => v / 2.54}
          />
          <ConverterSection
            title="Temperatura"
            unitA="°F"
            unitB="°C"
            aToB={(v) => (v - 32) * (5 / 9)}
            bToA={(v) => v * (9 / 5) + 32}
          />

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backButton: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: C.text },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20, gap: 12 },
  sectionCard: {
    backgroundColor: C.cardBg, borderRadius: 14, borderWidth: 1,
    borderColor: C.border, padding: 16,
  },
  sectionTitle: {
    fontSize: 13, fontWeight: "800", color: C.muted, letterSpacing: 1,
    textTransform: "uppercase", marginBottom: 14,
  },
  converterRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12,
  },
  inputGroup: { flex: 1, alignItems: "center" },
  input: {
    width: "100%", height: 56, borderRadius: 12, backgroundColor: C.surface2,
    borderWidth: 1, borderColor: C.border, textAlign: "center",
    fontSize: 22, fontWeight: "800", color: C.text,
  },
  unitLabel: {
    fontSize: 12, fontWeight: "700", color: C.muted, marginTop: 6,
    textTransform: "uppercase",
  },
});
