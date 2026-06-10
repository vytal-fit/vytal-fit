import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Check, MapPin, Clock, User } from "lucide-react-native";
import { useTheme } from "./_layout";
import type { Colors } from "@/colors";


// ─── Screen ──────────────────────────────────────────────
export default function BookingConfirmScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (confirmed) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        router.back();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [confirmed]);

  if (confirmed) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.successContainer}>
          <Animated.View style={[styles.checkCircle, { transform: [{ scale: scaleAnim }] }]}>
            <Check size={48} color="#080c0a" strokeWidth={3} />
          </Animated.View>
          <Text style={styles.successTitle}>Reserva Confirmada!</Text>
          <View style={styles.successDetails}>
            <Text style={styles.successDetail}>WOD - 07:00 - 08:00</Text>
            <Text style={styles.successDetail}>Coach Andre Loureiro</Text>
            <Text style={styles.successDetail}>Main Box</Text>
          </View>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => router.back()}
          >
            <Text style={styles.doneButtonText}>FECHAR</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={C.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reserva</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.content}>
          {/* Class Summary */}
          <View style={styles.classCard}>
            <Text style={styles.classType}>WOD</Text>
            <View style={styles.classDetailRow}>
              <Clock size={16} color={C.muted} strokeWidth={2} />
              <Text style={styles.classDetailText}>07:00 - 08:00 | Quinta-feira, 5 Jun</Text>
            </View>
            <View style={styles.classDetailRow}>
              <User size={16} color={C.muted} strokeWidth={2} />
              <Text style={styles.classDetailText}>Coach Andre Loureiro</Text>
            </View>
            <View style={styles.classDetailRow}>
              <MapPin size={16} color={C.muted} strokeWidth={2} />
              <Text style={styles.classDetailText}>Main Box</Text>
            </View>
          </View>

          <Text style={styles.confirmHeading}>Confirmar Reserva?</Text>

          {/* Buttons */}
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => setConfirmed(true)}
          >
            <Text style={styles.confirmButtonText}>CONFIRMAR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>CANCELAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(C: Colors) { return StyleSheet.create({
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
  content: { flex: 1, paddingHorizontal: 16, justifyContent: "center" },
  classCard: {
    backgroundColor: C.card, borderRadius: 16, borderWidth: 1,
    borderColor: C.border, padding: 20, marginBottom: 30,
  },
  classType: {
    fontSize: 24, fontWeight: "800", color: C.green, letterSpacing: 1, marginBottom: 16,
  },
  classDetailRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  classDetailText: { fontSize: 15, color: C.muted, fontWeight: "500" },
  confirmHeading: {
    fontSize: 20, fontWeight: "700", color: C.text, textAlign: "center", marginBottom: 24,
  },
  confirmButton: {
    paddingVertical: 16, borderRadius: 14, backgroundColor: C.green,
    alignItems: "center", marginBottom: 12,
  },
  confirmButtonText: { fontSize: 15, fontWeight: "800", color: "#080c0a", letterSpacing: 1.5 },
  cancelButton: {
    paddingVertical: 16, borderRadius: 14, borderWidth: 1.5,
    borderColor: C.border, alignItems: "center",
  },
  cancelButtonText: { fontSize: 15, fontWeight: "700", color: C.muted, letterSpacing: 1 },
  // Success State
  successContainer: {
    flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24,
  },
  checkCircle: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: C.green,
    alignItems: "center", justifyContent: "center", marginBottom: 24,
  },
  successTitle: { fontSize: 24, fontWeight: "800", color: C.green, marginBottom: 16 },
  successDetails: { alignItems: "center", marginBottom: 32 },
  successDetail: { fontSize: 15, color: C.muted, fontWeight: "500", marginBottom: 4 },
  doneButton: {
    paddingVertical: 16, paddingHorizontal: 48, borderRadius: 14,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
  },
  doneButtonText: { fontSize: 15, fontWeight: "700", color: C.text, letterSpacing: 1 },
}); }
