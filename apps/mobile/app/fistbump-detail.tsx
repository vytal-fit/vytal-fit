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
import { ArrowLeft, Heart } from "lucide-react-native";

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

const mockReactors = [
  { id: "r-1", name: "Pedro Almeida", timeAgo: "2 min" },
  { id: "r-2", name: "Ana Silva", timeAgo: "5 min" },
  { id: "r-3", name: "Miguel Costa", timeAgo: "12 min" },
  { id: "r-4", name: "Sofia Santos", timeAgo: "30 min" },
  { id: "r-5", name: "Ines Ferreira", timeAgo: "1h" },
  { id: "r-6", name: "Marine Robba", timeAgo: "2h" },
  { id: "r-7", name: "Ricardo Ribeiro", timeAgo: "3h" },
  { id: "r-8", name: "Andre Loureiro", timeAgo: "5h" },
];

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function FistbumpDetailScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={C.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Fistbumps</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.heading}>Quem reagiu ao teu resultado</Text>

          {/* WOD + Score */}
          <View style={styles.wodCard}>
            <Text style={styles.wodTitle}>FRAN</Text>
            <Text style={styles.wodScore}>3:52 Rx</Text>
          </View>

          {/* Reactor List */}
          {mockReactors.map((reactor) => (
            <View key={reactor.id} style={styles.reactorCard}>
              <View style={styles.reactorLeft}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials(reactor.name)}</Text>
                </View>
                <Text style={styles.reactorName}>{reactor.name}</Text>
              </View>
              <View style={styles.reactorRight}>
                <Heart size={14} color={C.red} strokeWidth={2} fill={C.red} />
                <Text style={styles.reactorTime}>{reactor.timeAgo}</Text>
              </View>
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
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20, gap: 10 },
  heading: { fontSize: 16, fontWeight: "700", color: C.text, marginTop: 8, marginBottom: 4 },
  wodCard: {
    backgroundColor: C.green + "12", borderRadius: 14, borderWidth: 1,
    borderColor: C.green + "30", padding: 16, flexDirection: "row",
    alignItems: "center", justifyContent: "space-between",
  },
  wodTitle: { fontSize: 18, fontWeight: "800", color: C.green, letterSpacing: 1 },
  wodScore: { fontSize: 18, fontWeight: "800", color: C.text },
  reactorCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: C.cardBg, borderRadius: 14, borderWidth: 1,
    borderColor: C.border, padding: 14,
  },
  reactorLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: C.green + "18",
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 13, fontWeight: "800", color: C.green },
  reactorName: { fontSize: 15, fontWeight: "600", color: C.text },
  reactorRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  reactorTime: { fontSize: 12, color: C.muted, fontWeight: "500" },
});
