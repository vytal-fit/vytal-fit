import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Send } from "lucide-react-native";

// ─── Colors ──────────────────────────────────────────────
const C = {
  bg: "#080c0a",
  surface: "#0f1610",
  surface2: "#162018",
  green: "#3dff6e",
  blue: "#00d4ff",
  amber: "#ffb300",
  red: "#ff4757",
  text: "#dceee0",
  muted: "#6b8c72",
  cardBg: "rgba(22,32,24,0.9)",
  border: "rgba(61,255,110,0.1)",
};

// ─── Types ───────────────────────────────────────────────
type ChatMessage = {
  id: string;
  text: string;
  sender: "box" | "me";
  timestamp: string;
  dateSeparator?: string;
};

// ─── Mock Data ───────────────────────────────────────────
const initialMessages: ChatMessage[] = [
  {
    id: "c1",
    text: "Bem-vindo ao Vytal CrossFit! Como podemos ajudar?",
    sender: "box",
    timestamp: "09:00",
    dateSeparator: "Hoje",
  },
  {
    id: "c2",
    text: "Ola! Queria saber se amanha ha WOD as 07:00",
    sender: "me",
    timestamp: "09:05",
  },
  {
    id: "c3",
    text: "Sim, temos WOD todos os dias as 07:00! Pode reservar pela app.",
    sender: "box",
    timestamp: "09:08",
  },
  {
    id: "c4",
    text: "Otimo, ja reservei. Obrigado!",
    sender: "me",
    timestamp: "09:12",
  },
  {
    id: "c5",
    text: "Perfeito! Bom treino amanha!",
    sender: "box",
    timestamp: "09:15",
  },
  {
    id: "c6",
    text: "Uma pergunta, o Open Box de sabado e das 08 as 10?",
    sender: "me",
    timestamp: "14:30",
    dateSeparator: "Ontem",
  },
  {
    id: "c7",
    text: "Sim, exatamente! Sábado das 08:00 às 10:00. Não precisa reservar para Open Box.",
    sender: "box",
    timestamp: "14:45",
  },
  {
    id: "c8",
    text: "Obrigado pela informação!",
    sender: "me",
    timestamp: "14:50",
  },
];

// ─── Screen ──────────────────────────────────────────────
export default function ChatScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState("");

  function handleSend() {
    if (!inputText.trim()) return;

    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      text: inputText.trim(),
      sender: "me",
      timestamp,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={22} color={C.text} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>V</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Vytal CrossFit</Text>
            <Text style={styles.headerSubtitle}>Online</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: false })
          }
        >
          {messages.map((msg) => (
            <View key={msg.id}>
              {msg.dateSeparator && (
                <View style={styles.dateSeparator}>
                  <View style={styles.dateSeparatorLine} />
                  <Text style={styles.dateSeparatorText}>
                    {msg.dateSeparator}
                  </Text>
                  <View style={styles.dateSeparatorLine} />
                </View>
              )}
              <View
                style={[
                  styles.messageBubbleRow,
                  msg.sender === "me"
                    ? styles.messageBubbleRowRight
                    : styles.messageBubbleRowLeft,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    msg.sender === "me"
                      ? styles.messageBubbleMe
                      : styles.messageBubbleBox,
                  ]}
                >
                  <Text style={styles.messageText}>{msg.text}</Text>
                  <Text style={styles.messageTime}>{msg.timestamp}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Escrever mensagem..."
            placeholderTextColor={C.muted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={handleSend}
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            disabled={!inputText.trim()}
          >
            <Send
              size={18}
              color={inputText.trim() ? C.bg : C.muted}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  flex1: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.surface,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.green + "18",
    borderWidth: 2,
    borderColor: C.green,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarText: {
    fontSize: 16,
    fontWeight: "800",
    color: C.green,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: C.green,
    fontWeight: "600",
  },

  // Messages
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // Date separator
  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    gap: 10,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  dateSeparatorText: {
    fontSize: 10,
    fontWeight: "700",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // Message bubbles
  messageBubbleRow: {
    marginBottom: 8,
  },
  messageBubbleRowLeft: {
    alignItems: "flex-start",
  },
  messageBubbleRowRight: {
    alignItems: "flex-end",
  },
  messageBubble: {
    maxWidth: "75%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  messageBubbleBox: {
    backgroundColor: C.surface2,
    borderBottomLeftRadius: 4,
  },
  messageBubbleMe: {
    backgroundColor: C.green + "22",
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: C.text,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    color: C.muted,
    marginTop: 4,
    alignSelf: "flex-end",
  },

  // Input bar
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.surface,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: C.surface2,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: C.text,
    borderWidth: 1,
    borderColor: C.border,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.green,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: C.surface2,
  },
});
