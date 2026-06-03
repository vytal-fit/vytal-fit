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
import { ArrowLeft, Send, ChevronDown } from "lucide-react-native";
import { mockCoaches } from "@vytal-fit/shared";

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
  orange: "#ff8c42",
  text: "#dceee0",
  muted: "#6b8c72",
  cardBg: "rgba(22,32,24,0.9)",
  border: "rgba(61,255,110,0.1)",
};

type Tab = "box" | "vytal";
const feedbackTypes = ["Questao", "Sugestao", "Bug"];

// ─── Screen ──────────────────────────────────────────────
export default function FeedbackScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("box");

  // Box form
  const [selectedCoach, setSelectedCoach] = useState(0);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Vytal form
  const [feedbackType, setFeedbackType] = useState(0);
  const [description, setDescription] = useState("");

  function cycleCoach() {
    setSelectedCoach((prev) => (prev + 1) % mockCoaches.length);
  }

  function cycleFeedbackType() {
    setFeedbackType((prev) => (prev + 1) % feedbackTypes.length);
  }

  function handleSendBox() {
    Alert.alert("Enviado", "Mensagem enviada para a tua box!");
    setSubject("");
    setMessage("");
  }

  function handleSendVytal() {
    Alert.alert("Enviado", "Feedback enviado para a equipa Vytal!");
    setDescription("");
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
          <Text style={styles.headerTitle}>Feedback</Text>
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
              A minha box
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
              {/* To (Coach Selector) */}
              <Text style={styles.fieldLabel}>Para</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={cycleCoach}
              >
                <Text style={styles.selectorText}>
                  {mockCoaches[selectedCoach].name}
                </Text>
                <ChevronDown size={16} color={C.green} strokeWidth={2.5} />
              </TouchableOpacity>

              {/* Subject */}
              <Text style={styles.fieldLabel}>Assunto</Text>
              <TextInput
                style={styles.fieldInput}
                value={subject}
                onChangeText={setSubject}
                placeholder="Assunto da mensagem..."
                placeholderTextColor={C.muted + "60"}
              />

              {/* Message */}
              <Text style={styles.fieldLabel}>Mensagem</Text>
              <TextInput
                style={styles.textArea}
                value={message}
                onChangeText={setMessage}
                placeholder="Escreve a tua mensagem..."
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
                <Text style={styles.sendButtonText}>ENVIAR</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Feedback Type */}
              <Text style={styles.fieldLabel}>Tipo</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={cycleFeedbackType}
              >
                <Text style={styles.selectorText}>
                  {feedbackTypes[feedbackType]}
                </Text>
                <ChevronDown size={16} color={C.green} strokeWidth={2.5} />
              </TouchableOpacity>

              {/* Description */}
              <Text style={styles.fieldLabel}>Descricao</Text>
              <TextInput
                style={styles.textArea}
                value={description}
                onChangeText={setDescription}
                placeholder="Descreve em detalhe..."
                placeholderTextColor={C.muted + "60"}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />

              {/* Info */}
              <View style={styles.infoBanner}>
                <Text style={styles.infoText}>
                  O teu feedback ajuda-nos a melhorar a app. Respondemos em ate
                  48 horas uteis.
                </Text>
              </View>

              {/* Send */}
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendVytal}
              >
                <Send size={18} color="#080c0a" strokeWidth={2.5} />
                <Text style={styles.sendButtonText}>ENVIAR</Text>
              </TouchableOpacity>
            </>
          )}

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
    backgroundColor: C.cardBg,
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
    backgroundColor: C.cardBg,
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
    backgroundColor: C.cardBg,
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
});
