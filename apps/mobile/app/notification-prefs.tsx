import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

const C = {
  bg: "#080c0a",
  surface: "#0f1610",
  surface2: "#162018",
  green: "#3dff6e",
  text: "#dceee0",
  muted: "#6b8c72",
  cardBg: "rgba(22,32,24,0.9)",
  border: "rgba(61,255,110,0.1)",
};

interface NotifCategory {
  title: string;
  items: { key: string; label: string }[];
}

const categories: NotifCategory[] = [
  {
    title: "Reservas",
    items: [
      { key: "booking_confirm", label: "Confirmacao de reserva" },
      { key: "booking_cancel", label: "Cancelamento de reserva" },
      { key: "booking_reminder", label: "Lembrete (1h antes)" },
      { key: "waitlist_spot", label: "Lugar disponivel na lista de espera" },
    ],
  },
  {
    title: "Treinos",
    items: [
      { key: "wod_published", label: "WOD publicado" },
      { key: "pr_achieved", label: "PR alcancado" },
    ],
  },
  {
    title: "Social",
    items: [
      { key: "fistbumps", label: "Fistbumps" },
      { key: "comments", label: "Comentarios" },
      { key: "birthdays", label: "Aniversarios" },
    ],
  },
  {
    title: "Pagamentos",
    items: [
      { key: "payment_success", label: "Pagamento bem sucedido" },
      { key: "payment_failed", label: "Pagamento falhado" },
      { key: "receipt", label: "Recibo disponivel" },
    ],
  },
  {
    title: "Desafios",
    items: [
      { key: "medal_earned", label: "Medalha conquistada" },
      { key: "ranking_update", label: "Atualizacao de ranking" },
    ],
  },
];

export default function NotificationPrefsScreen() {
  const router = useRouter();
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const cat of categories) {
      for (const item of cat.items) {
        initial[item.key] = true;
      }
    }
    return initial;
  });

  function toggle(key: string) {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={C.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notificações</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {categories.map((cat) => (
            <View key={cat.title} style={styles.categoryCard}>
              <Text style={styles.categoryTitle}>{cat.title}</Text>
              {cat.items.map((item, idx) => (
                <View
                  key={item.key}
                  style={[
                    styles.itemRow,
                    idx < cat.items.length - 1 && styles.itemBorder,
                  ]}
                >
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <TouchableOpacity
                    onPress={() => toggle(item.key)}
                    style={[
                      styles.toggleTrack,
                      toggles[item.key] ? styles.toggleOn : styles.toggleOff,
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        toggles[item.key] ? styles.thumbOn : styles.thumbOff,
                      ]}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))}

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
  categoryCard: {
    backgroundColor: C.cardBg, borderRadius: 16, borderWidth: 1,
    borderColor: C.border, padding: 16,
  },
  categoryTitle: {
    fontSize: 14, fontWeight: "800", color: C.green, letterSpacing: 0.5,
    textTransform: "uppercase", marginBottom: 14,
  },
  itemRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 12,
  },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  itemLabel: { fontSize: 15, color: C.text, fontWeight: "500", flex: 1 },
  toggleTrack: {
    width: 48, height: 28, borderRadius: 14, justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleOn: { backgroundColor: C.green },
  toggleOff: { backgroundColor: C.surface2 },
  toggleThumb: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: "white",
  },
  thumbOn: { alignSelf: "flex-end" },
  thumbOff: { alignSelf: "flex-start" },
});
