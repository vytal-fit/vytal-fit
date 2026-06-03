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
import { ArrowLeft, Camera, Plus } from "lucide-react-native";

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

const mockPhotos = [
  { id: "p-1", date: "2026-06-01" },
  { id: "p-2", date: "2026-05-15" },
  { id: "p-3", date: "2026-05-01" },
  { id: "p-4", date: "2026-04-15" },
  { id: "p-5", date: "2026-04-01" },
  { id: "p-6", date: "2026-03-15" },
];

export default function PhotoGalleryScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={C.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Fotos de Progresso</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.grid}>
            {mockPhotos.map((photo) => (
              <View key={photo.id} style={styles.photoCard}>
                <View style={styles.photoPlaceholder}>
                  <Camera size={28} color={C.muted} strokeWidth={1.5} />
                </View>
                <Text style={styles.photoDate}>{photo.date}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.addButton}>
            <Plus size={20} color="#080c0a" strokeWidth={2.5} />
            <Text style={styles.addButtonText}>Adicionar Foto</Text>
          </TouchableOpacity>

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
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },
  grid: {
    flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20,
  },
  photoCard: {
    width: "48%",
  },
  photoPlaceholder: {
    aspectRatio: 1, borderRadius: 14, backgroundColor: C.surface2,
    borderWidth: 1, borderColor: C.border, alignItems: "center",
    justifyContent: "center",
  },
  photoDate: {
    fontSize: 11, color: C.muted, fontWeight: "600", marginTop: 6,
    textAlign: "center",
  },
  addButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: C.green, borderRadius: 14, paddingVertical: 16,
  },
  addButtonText: {
    fontSize: 15, fontWeight: "800", color: "#080c0a", letterSpacing: 1,
  },
});
