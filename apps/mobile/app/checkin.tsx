import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, CheckCircle } from "lucide-react-native";

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

// ─── Screen ──────────────────────────────────────────────
export default function CheckInScreen() {
  const router = useRouter();
  const [validated, setValidated] = useState(false);

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
          <Text style={styles.headerTitle}>QR Check-in</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.content}>
          {!validated ? (
            <>
              {/* QR Code Placeholder */}
              <View style={styles.qrContainer}>
                <View style={styles.qrCode}>
                  {/* Corner decorations */}
                  <View style={[styles.qrCorner, styles.qrCornerTL]} />
                  <View style={[styles.qrCorner, styles.qrCornerTR]} />
                  <View style={[styles.qrCorner, styles.qrCornerBL]} />
                  <View style={[styles.qrCorner, styles.qrCornerBR]} />

                  {/* QR pattern simulation */}
                  <View style={styles.qrPattern}>
                    <View style={styles.qrRow}>
                      <View style={styles.qrBlock} />
                      <View style={styles.qrBlockEmpty} />
                      <View style={styles.qrBlock} />
                      <View style={styles.qrBlock} />
                      <View style={styles.qrBlockEmpty} />
                    </View>
                    <View style={styles.qrRow}>
                      <View style={styles.qrBlockEmpty} />
                      <View style={styles.qrBlock} />
                      <View style={styles.qrBlockEmpty} />
                      <View style={styles.qrBlock} />
                      <View style={styles.qrBlock} />
                    </View>
                    <View style={styles.qrRow}>
                      <View style={styles.qrBlock} />
                      <View style={styles.qrBlock} />
                      <View style={styles.qrBlock} />
                      <View style={styles.qrBlockEmpty} />
                      <View style={styles.qrBlock} />
                    </View>
                    <View style={styles.qrRow}>
                      <View style={styles.qrBlock} />
                      <View style={styles.qrBlockEmpty} />
                      <View style={styles.qrBlockEmpty} />
                      <View style={styles.qrBlock} />
                      <View style={styles.qrBlockEmpty} />
                    </View>
                    <View style={styles.qrRow}>
                      <View style={styles.qrBlockEmpty} />
                      <View style={styles.qrBlock} />
                      <View style={styles.qrBlock} />
                      <View style={styles.qrBlockEmpty} />
                      <View style={styles.qrBlock} />
                    </View>
                  </View>

                  {/* Vytal logo overlay */}
                  <View style={styles.qrLogoOverlay}>
                    <Text style={styles.qrLogoText}>V</Text>
                  </View>
                </View>
              </View>

              {/* Class Info */}
              <View style={styles.classInfoCard}>
                <View style={styles.classInfoRow}>
                  <Text style={styles.classInfoLabel}>Aula</Text>
                  <Text style={styles.classInfoValue}>CrossFit WOD</Text>
                </View>
                <View style={styles.classInfoRow}>
                  <Text style={styles.classInfoLabel}>Horário</Text>
                  <Text style={styles.classInfoValue}>09:00 - 10:00</Text>
                </View>
                <View style={styles.classInfoRow}>
                  <Text style={styles.classInfoLabel}>Local</Text>
                  <Text style={styles.classInfoValue}>Main Box</Text>
                </View>
              </View>

              {/* Info Text */}
              <Text style={styles.infoText}>
                Mostra este QR code no quiosque para fazer check-in
              </Text>

              {/* Simulate validation */}
              <TouchableOpacity
                style={styles.simulateButton}
                onPress={() => setValidated(true)}
              >
                <Text style={styles.simulateButtonText}>SIMULAR CHECK-IN</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Success State */}
              <View style={styles.successContainer}>
                <View style={styles.successCircle}>
                  <CheckCircle size={64} color={C.green} strokeWidth={1.5} />
                </View>
                <Text style={styles.successTitle}>Check-in validado!</Text>
                <Text style={styles.successSubtitle}>
                  Bom treino, Jose!
                </Text>
              </View>

              {/* Class Info */}
              <View style={styles.classInfoCard}>
                <View style={styles.classInfoRow}>
                  <Text style={styles.classInfoLabel}>Aula</Text>
                  <Text style={styles.classInfoValue}>CrossFit WOD</Text>
                </View>
                <View style={styles.classInfoRow}>
                  <Text style={styles.classInfoLabel}>Horário</Text>
                  <Text style={styles.classInfoValue}>09:00 - 10:00</Text>
                </View>
                <View style={styles.classInfoRow}>
                  <Text style={styles.classInfoLabel}>Check-in</Text>
                  <Text style={[styles.classInfoValue, { color: C.green }]}>
                    08:52
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.backToClassesButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backToClassesText}>VOLTAR</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
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

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 16,
    alignItems: "center",
  },

  // QR Container
  qrContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  qrCode: {
    width: 220,
    height: 220,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  qrCorner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: C.green,
  },
  qrCornerTL: {
    top: -4,
    left: -4,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  qrCornerTR: {
    top: -4,
    right: -4,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  qrCornerBL: {
    bottom: -4,
    left: -4,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  qrCornerBR: {
    bottom: -4,
    right: -4,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  qrPattern: {
    gap: 4,
  },
  qrRow: {
    flexDirection: "row",
    gap: 4,
  },
  qrBlock: {
    width: 24,
    height: 24,
    backgroundColor: "#1a2b1e",
    borderRadius: 3,
  },
  qrBlockEmpty: {
    width: 24,
    height: 24,
    backgroundColor: "#e0e8e2",
    borderRadius: 3,
  },
  qrLogoOverlay: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: C.green,
    alignItems: "center",
    justifyContent: "center",
  },
  qrLogoText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#080c0a",
  },

  // Class Info
  classInfoCard: {
    width: "100%",
    backgroundColor: C.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 16,
  },
  classInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  classInfoLabel: {
    fontSize: 14,
    color: C.muted,
    fontWeight: "500",
  },
  classInfoValue: {
    fontSize: 14,
    color: C.text,
    fontWeight: "700",
  },

  // Info Text
  infoText: {
    fontSize: 14,
    color: C.muted,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },

  // Simulate
  simulateButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.green,
    alignItems: "center",
  },
  simulateButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: C.green,
    letterSpacing: 1,
  },

  // Success
  successContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: C.green + "12",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: C.green,
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 16,
    color: C.muted,
    fontWeight: "500",
  },

  // Back
  backToClassesButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: C.green,
    alignItems: "center",
  },
  backToClassesText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#080c0a",
    letterSpacing: 1,
  },
});
