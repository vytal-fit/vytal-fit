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
const C = {
  bg: "#080c0a",
  surface: "#0f1610",
  surface2: "#162018",
  green: "#3dff6e",
  blue: "#00d4ff",
  amber: "#ffb300",
  red: "#ff4757",
  purple: "#c084fc",
  text: "#dceee0",
  muted: "#6b8c72",
  cardBg: "rgba(22,32,24,0.9)",
  border: "rgba(61,255,110,0.1)",
};

type PrivacyLevel = "everyone" | "my_box" | "only_me";

const privacyOptions: { value: PrivacyLevel; label: string }[] = [
  { value: "everyone", label: "Todos" },
  { value: "my_box", label: "A minha box" },
  { value: "only_me", label: "So eu" },
];

const limitedOptions: { value: PrivacyLevel; label: string }[] = [
  { value: "everyone", label: "Todos" },
  { value: "my_box", label: "A minha box" },
];

const leaderboardOptions: { value: PrivacyLevel; label: string }[] = [
  { value: "my_box", label: "A minha box" },
  { value: "only_me", label: "So eu" },
];

type PrivacySetting = {
  id: string;
  title: string;
  description: string;
  options: { value: PrivacyLevel; label: string }[];
};

const privacySettings: PrivacySetting[] = [
  {
    id: "prs",
    title: "Quem pode ver os meus PRs",
    description:
      "Controla quem pode ver os teus Personal Records e historico de PRs.",
    options: privacyOptions,
  },
  {
    id: "results",
    title: "Quem pode ver os meus resultados",
    description:
      "Controla quem pode ver os teus resultados de atividades e WODs.",
    options: privacyOptions,
  },
  {
    id: "enrollments",
    title: "Quem pode ver o meu nome nas inscricoes",
    description:
      "Controla se o teu nome aparece na lista de inscritos de cada aula.",
    options: limitedOptions,
  },
  {
    id: "leaderboard",
    title: "Quem pode ver os meus resultados no leaderboard",
    description:
      "Controla a visibilidade dos teus resultados nos rankings e tabelas.",
    options: leaderboardOptions,
  },
];

// ─── Screen ──────────────────────────────────────────────
export default function PrivacyScreen() {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, PrivacyLevel>>({
    prs: "my_box",
    results: "my_box",
    enrollments: "everyone",
    leaderboard: "my_box",
  });

  function cycleOption(
    settingId: string,
    options: { value: PrivacyLevel; label: string }[]
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
    options: { value: PrivacyLevel; label: string }[]
  ): string {
    const option = options.find((o) => o.value === values[settingId]);
    return option?.label || "A minha box";
  }

  function handleSave() {
    Alert.alert(
      "Guardado",
      "Definicoes de privacidade atualizadas com sucesso!"
    );
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
          <Text style={styles.headerTitle}>Privacidade</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoText}>
              Controla quem pode ver as tuas informacoes na plataforma. As
              definicoes aplicam-se tanto na app como na web.
            </Text>
          </View>

          {/* Privacy Settings */}
          {privacySettings.map((setting) => (
            <View key={setting.id} style={styles.settingCard}>
              <Text style={styles.settingTitle}>{setting.title}</Text>
              <Text style={styles.settingDescription}>
                {setting.description}
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
            <Text style={styles.saveButtonText}>GUARDAR</Text>
          </TouchableOpacity>

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
    backgroundColor: C.cardBg,
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
});
