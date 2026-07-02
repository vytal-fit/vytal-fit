import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Send, ChevronDown, CheckCircle } from "lucide-react-native";

// ─── Colors ──────────────────────────────────────────────
import { useTheme } from "./_layout";
import type { Colors } from "@/colors";
import { t } from "@/i18n";
import { listCoaches, type CoachItem } from "@/lib/auth-api";

type Tab = "box" | "vytal";
const feedbackTypeKeys = [
  "feedback.typeQuestion",
  "feedback.typeSuggestion",
  "feedback.typeBug",
];

// ─── Screen ──────────────────────────────────────────────
export default function FeedbackScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("box");

  // Coaches (live)
  const [coaches, setCoaches] = useState<CoachItem[]>([]);
  const [coachesLoading, setCoachesLoading] = useState(false);
  const [coachesError, setCoachesError] = useState(false);

  // Box form
  const [selectedCoach, setSelectedCoach] = useState(0);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    setCoachesLoading(true);
    setCoachesError(false);

    void listCoaches()
      .then((rows) => {
        if (cancelled) return;
        setCoaches(rows);
        setSelectedCoach(0);
      })
      .catch(() => {
        if (!cancelled) setCoachesError(true);
      })
      .finally(() => {
        if (!cancelled) setCoachesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Vytal form
  const [feedbackType, setFeedbackType] = useState(0);
  const [description, setDescription] = useState("");

  // Success states
  const [boxSent, setBoxSent] = useState(false);
  const [vytalSent, setVytalSent] = useState(false);

  function cycleCoach() {
    if (coaches.length === 0) return;
    setSelectedCoach((prev) => (prev + 1) % coaches.length);
  }

  function cycleFeedbackType() {
    setFeedbackType((prev) => (prev + 1) % feedbackTypeKeys.length);
  }

  function handleSendBox() {
    setBoxSent(true);
    setTimeout(() => {
      setBoxSent(false);
      setSubject("");
      setMessage("");
    }, 2500);
  }

  function handleSendVytal() {
    setVytalSent(true);
    setTimeout(() => {
      setVytalSent(false);
      setDescription("");
    }, 2500);
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
          <Text style={styles.headerTitle}>{t("screen.feedback")}</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "box" && styles.tabActive]}
            onPress={() => setActiveTab("box")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "box" && styles.tabTextActive,
              ]}
            >
              {t("feedback.tabBox")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "vytal" && styles.tabActive]}
            onPress={() => setActiveTab("vytal")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "vytal" && styles.tabTextActive,
              ]}
            >
              Vytal Team
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {activeTab === "box" ? (
            <>
              {boxSent ? (
                <View style={styles.successCard}>
                  <CheckCircle size={40} color={C.green} strokeWidth={2} />
                  <Text style={styles.successTitle}>{t("feedback.boxSentTitle")}</Text>
                  <Text style={styles.successSubtitle}>{t("feedback.boxSentSubtitle")}</Text>
                </View>
              ) : (
                <>
                  {/* To (Coach Selector) */}
                  <Text style={styles.fieldLabel}>{t("feedback.to")}</Text>
                  <TouchableOpacity
                    style={styles.selector}
                    onPress={cycleCoach}
                    disabled={coaches.length === 0}
                  >
                    {coachesLoading ? (
                      <ActivityIndicator color={C.green} />
                    ) : (
                      <Text style={styles.selectorText}>
                        {coachesError
                          ? t("alert.error")
                          : coaches.length > 0
                            ? coaches[selectedCoach]?.name ?? t("common.empty")
                            : t("common.empty")}
                      </Text>
                    )}
                    <ChevronDown size={16} color={C.green} strokeWidth={2.5} />
                  </TouchableOpacity>

                  {/* Subject */}
                  <Text style={styles.fieldLabel}>{t("feedback.subject")}</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={subject}
                    onChangeText={setSubject}
                    placeholder={t("feedback.subjectPlaceholder")}
                    placeholderTextColor={C.muted + "60"}
                  />

                  {/* Message */}
                  <Text style={styles.fieldLabel}>{t("feedback.message")}</Text>
                  <TextInput
                    style={styles.textArea}
                    value={message}
                    onChangeText={setMessage}
                    placeholder={t("feedback.messagePlaceholder")}
                    placeholderTextColor={C.muted + "60"}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                  />

                  {/* Send */}
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSendBox}
                  >
                    <Send size={18} color="#080c0a" strokeWidth={2.5} />
                    <Text style={styles.sendButtonText}>{t("feedback.send")}</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          ) : (
            <>
              {vytalSent ? (
                <View style={styles.successCard}>
                  <CheckCircle size={40} color={C.green} strokeWidth={2} />
                  <Text style={styles.successTitle}>{t("feedback.vytalSentTitle")}</Text>
                  <Text style={styles.successSubtitle}>{t("feedback.vytalSentSubtitle")}</Text>
                </View>
              ) : (
                <>
                  {/* Feedback Type */}
                  <Text style={styles.fieldLabel}>{t("feedback.type")}</Text>
                  <TouchableOpacity
                    style={styles.selector}
                    onPress={cycleFeedbackType}
                  >
                    <Text style={styles.selectorText}>
                      {t(feedbackTypeKeys[feedbackType])}
                    </Text>
                    <ChevronDown size={16} color={C.green} strokeWidth={2.5} />
                  </TouchableOpacity>

                  {/* Description */}
                  <Text style={styles.fieldLabel}>{t("feedback.description")}</Text>
                  <TextInput
                    style={styles.textArea}
                    value={description}
                    onChangeText={setDescription}
                    placeholder={t("feedback.descriptionPlaceholder")}
                    placeholderTextColor={C.muted + "60"}
                    multiline
                    numberOfLines={8}
                    textAlignVertical="top"
                  />

                  {/* Info */}
                  <View style={styles.infoBanner}>
                    <Text style={styles.infoText}>{t("feedback.info")}</Text>
                  </View>

                  {/* Send */}
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSendVytal}
                  >
                    <Send size={18} color="#080c0a" strokeWidth={2.5} />
                    <Text style={styles.sendButtonText}>{t("feedback.send")}</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}

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

  // Tabs
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 3,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: C.green,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
    color: C.muted,
  },
  tabTextActive: {
    color: "#080c0a",
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },

  // Field
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: -4,
  },
  fieldInput: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: C.text,
    fontWeight: "500",
  },

  // Selector
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.green + "30",
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  selectorText: {
    fontSize: 15,
    fontWeight: "700",
    color: C.green,
  },

  // Text Area
  textArea: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    fontSize: 14,
    color: C.text,
    minHeight: 140,
  },

  // Info
  infoBanner: {
    backgroundColor: C.blue + "12",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.blue + "25",
    padding: 14,
  },
  infoText: {
    fontSize: 13,
    color: C.muted,
    lineHeight: 19,
  },

  // Send
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.green,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 4,
  },
  sendButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#080c0a",
    letterSpacing: 1,
  },

  // Success Card
  successCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 12,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: C.text,
  },
  successSubtitle: {
    fontSize: 14,
    color: C.muted,
    textAlign: "center",
    lineHeight: 20,
  },
}); }
