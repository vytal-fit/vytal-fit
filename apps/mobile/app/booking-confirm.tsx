import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Check, MapPin, Clock, User } from "lucide-react-native";
import { useTheme } from "./_layout";
import type { Colors } from "@/colors";
import { t } from "@/i18n";
import { bookClass, getClass, type ClassScheduleItem } from "@/lib/auth-api";
import { useAuthStore } from "@/stores/auth-store";


// ─── Screen ──────────────────────────────────────────────
export default function BookingConfirmScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();
  const params = useLocalSearchParams<{
    classId?: string;
    className?: string;
    startTime?: string;
    coach?: string;
    location?: string;
  }>();
  const { user, activeOrgId } = useAuthStore();
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [cls, setCls] = useState<ClassScheduleItem | null>(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const classId = params.classId ?? "";
  const memberId = user?.memberships.find((m) => m.organizationId === activeOrgId)?.id ?? user?.memberships[0]?.id ?? "";

  useEffect(() => {
    if (!classId) return;

    let cancelled = false;
    void getClass(classId)
      .then((row) => {
        if (!cancelled) setCls(row);
      })
      .catch(() => {
        // Display falls back to route params if the class fetch fails.
      });

    return () => {
      cancelled = true;
    };
  }, [classId]);

  const className = params.className ?? cls?.classType?.name ?? "";
  const startTime = params.startTime ?? (cls ? `${cls.startTime} - ${cls.endTime}` : "");
  const coach = params.coach ?? (cls && cls.coaches.length > 0 ? cls.coaches[0].name : "");
  const location = params.location ?? cls?.location?.name ?? "";
  const dateLabel = cls?.date ?? "";

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
  }, [confirmed, scaleAnim, router]);

  async function handleConfirm() {
    if (!classId || !memberId) {
      setError(t("auth.loginFailed"));
      return;
    }
    setSaving(true);
    setError("");
    try {
      await bookClass(classId, memberId);
      setConfirmed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("auth.loginFailed"));
    } finally {
      setSaving(false);
    }
  }

  if (confirmed) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.successContainer}>
          <Animated.View style={[styles.checkCircle, { transform: [{ scale: scaleAnim }] }]}>
            <Check size={48} color="#080c0a" strokeWidth={3} />
          </Animated.View>
          <Text style={styles.successTitle}>{t("bookingConfirm.confirmedTitle")}</Text>
          <View style={styles.successDetails}>
            <Text style={styles.successDetail}>{className} - {startTime}</Text>
            <Text style={styles.successDetail}>{coach}</Text>
            <Text style={styles.successDetail}>{location}</Text>
          </View>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => router.back()}
          >
            <Text style={styles.doneButtonText}>{t("passwordChange.close")}</Text>
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
          <Text style={styles.headerTitle}>{t("bookingConfirm.title")}</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.content}>
          {/* Class Summary */}
          <View style={styles.classCard}>
            <Text style={styles.classType}>{className}</Text>
            <View style={styles.classDetailRow}>
              <Clock size={16} color={C.muted} strokeWidth={2} />
              <Text style={styles.classDetailText}>
                {[startTime, dateLabel].filter(Boolean).join(" | ")}
              </Text>
            </View>
            {coach ? (
              <View style={styles.classDetailRow}>
                <User size={16} color={C.muted} strokeWidth={2} />
                <Text style={styles.classDetailText}>{coach}</Text>
              </View>
            ) : null}
            {location ? (
              <View style={styles.classDetailRow}>
                <MapPin size={16} color={C.muted} strokeWidth={2} />
                <Text style={styles.classDetailText}>{location}</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.confirmHeading}>{t("bookingConfirm.question")}</Text>

          {/* Buttons */}
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
            disabled={saving}
          >
            <Text style={styles.confirmButtonText}>
              {saving ? t("btn.loggingIn") : t("bookingConfirm.confirm")}
            </Text>
          </TouchableOpacity>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>{t("bookingConfirm.cancel")}</Text>
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
  errorText: { fontSize: 12, color: C.red, textAlign: "center", marginTop: 12 },
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
