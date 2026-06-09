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
import { ArrowLeft, Send } from "lucide-react-native";

const C = {
  bg: "#080c0a",
  surface: "#0f1610",
  surface2: "#162018",
  green: "#3dff6e",
  blue: "#00d4ff",
  text: "#dceee0",
  muted: "#6b8c72",
  cardBg: "rgba(22,32,24,0.9)",
  border: "rgba(61,255,110,0.1)",
};

const mockComments = [
  { id: "c-1", name: "Pedro Silva", initials: "PS", timeAgo: "10 min", text: "Grande WOD! Os thrusters estavam brutais hoje." },
  { id: "c-2", name: "Ana Santos", initials: "AS", timeAgo: "25 min", text: "Alguem fez unbroken nos pull-ups? Eu parti no set de 15..." },
  { id: "c-3", name: "Miguel Costa", initials: "MC", timeAgo: "1h", text: "Primeira vez sub-5 no Fran! Estou a voar hoje." },
  { id: "c-4", name: "Sofia Mendes", initials: "SM", timeAgo: "2h", text: "Bom treino! O Coach Ricardo deu-me uma dica para os thrusters que fez toda a diferenca." },
  { id: "c-5", name: "Ricardo Ribeiro", initials: "RR", timeAgo: "3h", text: "Parabéns a todos pelos resultados de hoje! Viram-se excelentes execuções." },
];

export default function WodCommentsScreen() {
  const router = useRouter();
  const [newComment, setNewComment] = useState("");

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={C.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comentarios</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* WOD Title */}
        <View style={styles.wodBar}>
          <Text style={styles.wodTitle}>FRAN</Text>
          <Text style={styles.wodSub}>For Time - 21-15-9</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {mockComments.map((comment) => (
            <View key={comment.id} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{comment.initials}</Text>
                </View>
                <View style={styles.commentMeta}>
                  <Text style={styles.commentName}>{comment.name}</Text>
                  <Text style={styles.commentTime}>{comment.timeAgo}</Text>
                </View>
              </View>
              <Text style={styles.commentText}>{comment.text}</Text>
            </View>
          ))}
          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Escrever comentario..."
            placeholderTextColor={C.muted}
            value={newComment}
            onChangeText={setNewComment}
          />
          <TouchableOpacity style={styles.sendButton}>
            <Send size={20} color="#080c0a" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
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
  wodBar: {
    paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1,
    borderBottomColor: C.border, marginBottom: 4,
  },
  wodTitle: { fontSize: 18, fontWeight: "800", color: C.green, letterSpacing: 1 },
  wodSub: { fontSize: 13, color: C.muted, marginTop: 2 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  commentCard: {
    backgroundColor: C.cardBg, borderRadius: 14, borderWidth: 1,
    borderColor: C.border, padding: 14,
  },
  commentHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  avatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: C.green + "18",
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 12, fontWeight: "800", color: C.green },
  commentMeta: { flex: 1 },
  commentName: { fontSize: 14, fontWeight: "700", color: C.text },
  commentTime: { fontSize: 11, color: C.muted },
  commentText: { fontSize: 14, color: C.text, lineHeight: 21 },
  inputBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1,
    borderTopColor: C.border, backgroundColor: C.bg,
  },
  input: {
    flex: 1, backgroundColor: C.surface, borderRadius: 12, borderWidth: 1,
    borderColor: C.border, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: C.text,
  },
  sendButton: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: C.green,
    alignItems: "center", justifyContent: "center",
  },
});
