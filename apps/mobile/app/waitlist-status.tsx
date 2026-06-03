import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Clock, Users, Info } from "lucide-react-native";

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

export default function WaitlistStatusScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={C.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lista de Espera</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.content}>
          {/* Class Info */}
          <View style={styles.classCard}>
            <Text style={styles.classType}>WOD</Text>
            <View style={styles.row}>
              <Clock size={14} color={C.muted} strokeWidth={2} />
              <Text style={styles.detail}>07:00 - 08:00 | Quinta, 5 Jun</Text>
            </View>
            <View style={styles.row}>
              <Users size={14} color={C.muted} strokeWidth={2} />
              <Text style={styles.detail}>20/20 inscritos</Text>
            </View>
          </View>

          {/* Position */}
          <View style={styles.positionCard}>
            <Text style={styles.positionLabel}>Posicao na lista de espera</Text>
            <Text style={styles.positionNumber}>#3</Text>
            <Text style={styles.estimatedTime}>Tempo estimado: ~15 min</Text>
          </View>

          {/* Info */}
          <View style={styles.infoCard}>
            <Info size={18} color={C.blue} strokeWidth={2} />
            <Text style={styles.infoText}>
              Seras automaticamente promovido quando um lugar ficar disponivel. Recebes uma notificacao quando isso acontecer.
            </Text>
          </View>

          {/* Cancel */}
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>CANCELAR ESPERA</Text>
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
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 20, gap: 16 },
  classCard: {
    backgroundColor: C.cardBg, borderRadius: 14, borderWidth: 1,
    borderColor: C.border, padding: 16,
  },
  classType: { fontSize: 20, fontWeight: "800", color: C.green, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  detail: { fontSize: 14, color: C.muted, fontWeight: "500" },
  positionCard: {
    backgroundColor: C.amber + "12", borderRadius: 16, borderWidth: 1,
    borderColor: C.amber + "30", padding: 24, alignItems: "center",
  },
  positionLabel: { fontSize: 14, color: C.muted, fontWeight: "600", marginBottom: 8 },
  positionNumber: { fontSize: 64, fontWeight: "800", color: C.amber },
  estimatedTime: { fontSize: 13, color: C.muted, fontWeight: "500", marginTop: 8 },
  infoCard: {
    backgroundColor: C.blue + "12", borderRadius: 14, borderWidth: 1,
    borderColor: C.blue + "25", padding: 16, flexDirection: "row", gap: 12,
  },
  infoText: { fontSize: 13, color: C.muted, lineHeight: 20, flex: 1 },
  cancelButton: {
    paddingVertical: 16, borderRadius: 14, borderWidth: 1.5,
    borderColor: C.red + "40", backgroundColor: C.red + "10",
    alignItems: "center", marginTop: 8,
  },
  cancelButtonText: { fontSize: 15, fontWeight: "800", color: C.red, letterSpacing: 1 },
});
