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
import { useTheme } from "./_layout";
import type { Colors } from "@/colors";
import { t } from "@/i18n";


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
  const C = useTheme();
  const styles = makeStyles(C);
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
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={C.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("converters.title")}</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <ConverterSection
            title={t("converters.distance")}
            unitA={t("converters.miles")}
            unitB="Km"
            aToB={(v) => v * 1.60934}
            bToA={(v) => v / 1.60934}
          />
          <ConverterSection
            title={t("converters.weight")}
            unitA={t("converters.pounds")}
            unitB="Kg"
            aToB={(v) => v * 0.453592}
            bToA={(v) => v / 0.453592}
          />
          <ConverterSection
            title={t("converters.length")}
            unitA={t("converters.inches")}
            unitB="Cm"
            aToB={(v) => v * 2.54}
            bToA={(v) => v / 2.54}
          />
          <ConverterSection
            title={t("converters.temperature")}
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

function makeStyles(C: Colors) { return StyleSheet.create({
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
    backgroundColor: C.card, borderRadius: 14, borderWidth: 1,
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
}); }
