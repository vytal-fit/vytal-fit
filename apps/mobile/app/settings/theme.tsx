import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Sun, Moon, Check } from "lucide-react-native";
import { colors } from "@/colors";
import { useAppStore } from "@/stores/app-store";
import { t } from "@/i18n";

const C = colors;

const accentColors = [
  { name: "color.green", color: "#22c55e" },
  { name: "color.blue", color: "#00d4ff" },
  { name: "color.red", color: "#ff4757" },
  { name: "color.purple", color: "#c084fc" },
  { name: "color.orange", color: "#ff8c42" },
  { name: "color.amber", color: "#ffb300" },
];

// ─── Screen ──────────────────────────────────────────────
export default function ThemeScreen() {
  const router = useRouter();
  const { theme: mode, accentColor: accent, setTheme, setAccentColor } = useAppStore();

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
          <Text style={styles.headerTitle}>{t("screen.theme")}</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Background Mode */}
          <Text style={styles.sectionTitle}>{t("theme.background")}</Text>
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeCard, mode === "dark" && styles.modeCardActive]}
              onPress={() => setTheme("dark")}
            >
              <View
                style={[
                  styles.modePreview,
                  { backgroundColor: "#080c0a" },
                ]}
              >
                <Moon
                  size={28}
                  color={mode === "dark" ? accent : C.muted}
                  strokeWidth={1.8}
                />
              </View>
              <Text
                style={[
                  styles.modeLabel,
                  mode === "dark" && { color: accent },
                ]}
              >
                {t("theme.dark")}
              </Text>
              {mode === "dark" && (
                <View style={[styles.modeCheck, { backgroundColor: accent }]}>
                  <Check size={14} color="#080c0a" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeCard,
                mode === "light" && styles.modeCardActive,
              ]}
              onPress={() => setTheme("light")}
            >
              <View
                style={[
                  styles.modePreview,
                  { backgroundColor: "#e8f0ea" },
                ]}
              >
                <Sun
                  size={28}
                  color={mode === "light" ? accent : "#6b8c72"}
                  strokeWidth={1.8}
                />
              </View>
              <Text
                style={[
                  styles.modeLabel,
                  mode === "light" && { color: accent },
                ]}
              >
                {t("theme.light")}
              </Text>
              {mode === "light" && (
                <View style={[styles.modeCheck, { backgroundColor: accent }]}>
                  <Check size={14} color="#080c0a" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Accent Color */}
          <Text style={styles.sectionTitle}>{t("theme.accentColor")}</Text>
          <View style={styles.colorRow}>
            {accentColors.map((c) => (
              <TouchableOpacity
                key={c.color}
                style={styles.colorOption}
                onPress={() => setAccentColor(c.color)}
              >
                <View
                  style={[
                    styles.colorCircle,
                    { backgroundColor: c.color },
                    accent === c.color && styles.colorCircleActive,
                  ]}
                >
                  {accent === c.color && (
                    <Check size={18} color="#080c0a" strokeWidth={3} />
                  )}
                </View>
                <Text
                  style={[
                    styles.colorName,
                    accent === c.color && { color: c.color },
                  ]}
                >
                  {t(c.name)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Preview */}
          <Text style={styles.sectionTitle}>{t("theme.preview")}</Text>
          <View
            style={[
              styles.previewCard,
              mode === "light" && {
                backgroundColor: "#f0f5f1",
                borderColor: accent + "30",
              },
            ]}
          >
            <View style={styles.previewHeader}>
              <View
                style={[styles.previewDot, { backgroundColor: accent }]}
              />
              <Text
                style={[
                  styles.previewTitle,
                  mode === "light" && { color: "#1a2b1e" },
                ]}
              >
                Back Squat
              </Text>
            </View>
            <Text style={[styles.previewValue, { color: accent }]}>140 kg</Text>
            <View
              style={[
                styles.previewButton,
                { backgroundColor: accent },
              ]}
            >
              <Text style={styles.previewButtonText}>{t("btn.save")}</Text>
            </View>

            <View style={styles.previewNav}>
              {[t("tab.classes"), t("tab.wod"), t("tab.records"), t("tab.mybox"), t("tab.profile")].map(
                (tab, i) => (
                  <Text
                    key={tab}
                    style={[
                      styles.previewTab,
                      i === 2 && { color: accent },
                      mode === "light" && i !== 2 && { color: "#6b8c72" },
                    ]}
                  >
                    {tab}
                  </Text>
                )
              )}
            </View>
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
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

  // Section Title
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
    marginTop: 8,
    marginBottom: 4,
  },

  // Mode Row
  modeRow: {
    flexDirection: "row",
    gap: 12,
  },
  modeCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 16,
    alignItems: "center",
  },
  modeCardActive: {
    borderColor: C.green + "50",
  },
  modePreview: {
    width: "100%",
    height: 80,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  modeLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: C.muted,
  },
  modeCheck: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  // Colors
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "center",
    paddingVertical: 8,
  },
  colorOption: {
    alignItems: "center",
    width: 52,
  },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  colorCircleActive: {
    borderWidth: 3,
    borderColor: "#ffffff40",
  },
  colorName: {
    fontSize: 11,
    fontWeight: "600",
    color: C.muted,
    textAlign: "center",
  },

  // Preview
  previewCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  previewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
  },
  previewValue: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 14,
  },
  previewButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  previewButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#080c0a",
    letterSpacing: 1,
  },
  previewNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 12,
  },
  previewTab: {
    fontSize: 11,
    fontWeight: "600",
    color: C.muted,
  },
});
