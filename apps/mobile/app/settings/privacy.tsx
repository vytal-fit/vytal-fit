import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Save, ChevronDown } from "lucide-react-native";

// ─── Colors ──────────────────────────────────────────────
import { useTheme } from "../_layout";
import type { Colors } from "@/colors";
import { t } from "@/i18n";

type PrivacyLevel = "everyone" | "my_box" | "only_me";

const privacyOptions: { value: PrivacyLevel; labelKey: string }[] = [
  { value: "everyone", labelKey: "privacy.everyone" },
  { value: "my_box", labelKey: "privacy.myBox" },
  { value: "only_me", labelKey: "privacy.onlyMe" },
];

const limitedOptions: { value: PrivacyLevel; labelKey: string }[] = [
  { value: "everyone", labelKey: "privacy.everyone" },
  { value: "my_box", labelKey: "privacy.myBox" },
];

const leaderboardOptions: { value: PrivacyLevel; labelKey: string }[] = [
  { value: "my_box", labelKey: "privacy.myBox" },
  { value: "only_me", labelKey: "privacy.onlyMe" },
];

type PrivacySetting = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  options: { value: PrivacyLevel; labelKey: string }[];
};

const privacySettings: PrivacySetting[] = [
  {
    id: "prs",
    titleKey: "privacy.prsTitle",
    descriptionKey: "privacy.prsDesc",
    options: privacyOptions,
  },
  {
    id: "results",
    titleKey: "privacy.resultsTitle",
    descriptionKey: "privacy.resultsDesc",
    options: privacyOptions,
  },
  {
    id: "enrollments",
    titleKey: "privacy.enrollmentsTitle",
    descriptionKey: "privacy.enrollmentsDesc",
    options: limitedOptions,
  },
  {
    id: "leaderboard",
    titleKey: "privacy.leaderboardTitle",
    descriptionKey: "privacy.leaderboardDesc",
    options: leaderboardOptions,
  },
];

// ─── Screen ──────────────────────────────────────────────
export default function PrivacyScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();
  const [values, setValues] = useState<Record<string, PrivacyLevel>>({
    prs: "my_box",
    results: "my_box",
    enrollments: "everyone",
    leaderboard: "my_box",
  });

  function cycleOption(
    settingId: string,
    options: { value: PrivacyLevel; labelKey: string }[]
  ) {
    const current = values[settingId];
    const currentIndex = options.findIndex((o) => o.value === current);
    const nextIndex = (currentIndex + 1) % options.length;
    setValues((prev) => ({
      ...prev,
      [settingId]: options[nextIndex].value,
    }));
  }

  function getLabel(
    settingId: string,
    options: { value: PrivacyLevel; labelKey: string }[]
  ): string {
    const option = options.find((o) => o.value === values[settingId]);
    return t(option?.labelKey || "privacy.myBox");
  }

  function handleSave() {
    Alert.alert(t("alert.saved"), t("privacy.savedMsg"));
    router.back();
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
          <Text style={styles.headerTitle}>{t("screen.privacy")}</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoText}>
              {t("privacy.info")}
            </Text>
          </View>

          {/* Privacy Settings */}
          {privacySettings.map((setting) => (
            <View key={setting.id} style={styles.settingCard}>
              <Text style={styles.settingTitle}>{t(setting.titleKey)}</Text>
              <Text style={styles.settingDescription}>
                {t(setting.descriptionKey)}
              </Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => cycleOption(setting.id, setting.options)}
              >
                <Text style={styles.selectorText}>
                  {getLabel(setting.id, setting.options)}
                </Text>
                <ChevronDown size={16} color={C.green} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Save size={18} color="#080c0a" strokeWidth={2.5} />
            <Text style={styles.saveButtonText}>{t("btn.save")}</Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
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
    paddingBottom: 20,
    gap: 12,
  },

  // Info Banner
  infoBanner: {
    backgroundColor: C.purple + "12",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.purple + "25",
    padding: 16,
  },
  infoText: {
    fontSize: 13,
    color: C.muted,
    lineHeight: 20,
  },

  // Setting Card
  settingCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
    marginBottom: 6,
  },
  settingDescription: {
    fontSize: 13,
    color: C.muted,
    lineHeight: 19,
    marginBottom: 14,
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.green + "30",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectorText: {
    fontSize: 14,
    fontWeight: "700",
    color: C.green,
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
  saveButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#080c0a",
    letterSpacing: 1,
  },
}); }
