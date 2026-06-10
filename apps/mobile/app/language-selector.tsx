import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Check } from "lucide-react-native";

import { useTheme } from "./_layout";
import type { Colors } from "@/colors";
import { t } from "@/i18n";

const languages = [
  { code: "pt", labelKey: "language.pt", flag: "PT" },
  { code: "en", labelKey: "language.en", flag: "EN" },
  { code: "es", labelKey: "language.es", flag: "ES" },
];

export default function LanguageSelectorScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();
  const [selected, setSelected] = useState("pt");

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={C.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("screen.language")}</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.content}>
          {languages.map((lang) => {
            const isSelected = selected === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langCard, isSelected && styles.langCardActive]}
                onPress={() => setSelected(lang.code)}
              >
                <View style={[styles.flagBadge, isSelected && styles.flagBadgeActive]}>
                  <Text style={[styles.flagText, isSelected && styles.flagTextActive]}>
                    {lang.flag}
                  </Text>
                </View>
                <Text style={[styles.langLabel, isSelected && styles.langLabelActive]}>
                  {t(lang.labelKey)}
                </Text>
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Check size={18} color="#080c0a" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
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
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  langCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: C.card, borderRadius: 16, borderWidth: 1.5,
    borderColor: C.border, padding: 18,
  },
  langCardActive: { borderColor: C.green + "50", backgroundColor: C.green + "08" },
  flagBadge: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: C.surface2,
    alignItems: "center", justifyContent: "center",
  },
  flagBadgeActive: { backgroundColor: C.green + "20" },
  flagText: { fontSize: 18, fontWeight: "800", color: C.muted },
  flagTextActive: { color: C.green },
  langLabel: { flex: 1, fontSize: 17, fontWeight: "700", color: C.text },
  langLabelActive: { color: C.green },
  checkBadge: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: C.green,
    alignItems: "center", justifyContent: "center",
  },
}); }
