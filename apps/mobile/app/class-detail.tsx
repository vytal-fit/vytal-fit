import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { mockClasses, mockMembers } from "@vytal-fit/shared";
import { ArrowLeft, MapPin, Clock, Users } from "lucide-react-native";

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
  text: "#dceee0",
  muted: "#6b8c72",
  cardBg: "rgba(22,32,24,0.9)",
  border: "rgba(61,255,110,0.1)",
};

// Mock enrolled members (first 5 members)
const enrolledMembers = mockMembers.slice(0, 5);

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Screen ──────────────────────────────────────────────
export default function ClassDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isBooked, setIsBooked] = useState(false);

  const cls = mockClasses.find((c) => c.id === id);

  if (!cls) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={C.text} strokeWidth={1.8} />
          </TouchableOpacity>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aula nao encontrada</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const isFull = cls.enrolledCount >= cls.maxCapacity;
  const occupancy = cls.enrolledCount / cls.maxCapacity;
  const coachName = cls.coaches.length > 0 ? cls.coaches[0].name : "TBD";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={C.text} strokeWidth={1.8} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes da Aula</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Class Type Banner */}
          <View style={[styles.banner, { borderLeftColor: cls.classType.color }]}>
            <View style={styles.bannerTop}>
              <View style={styles.classTypeRow}>
                <View style={[styles.colorDot, { backgroundColor: cls.classType.color }]} />
                <Text style={styles.classTypeName}>{cls.classType.name}</Text>
                <View style={[styles.abbrevBadge, { backgroundColor: cls.classType.color + "20" }]}>
                  <Text style={[styles.abbrevText, { color: cls.classType.color }]}>
                    {cls.classType.abbreviation}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Info Cards */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Clock size={18} color={C.green} strokeWidth={1.8} />
              <Text style={styles.infoCardLabel}>Horario</Text>
              <Text style={styles.infoCardValue}>{cls.startTime} - {cls.endTime}</Text>
            </View>
            <View style={styles.infoCard}>
              <MapPin size={18} color={C.blue} strokeWidth={1.8} />
              <Text style={styles.infoCardLabel}>Local</Text>
              <Text style={styles.infoCardValue}>{cls.location.name}</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Users size={18} color={C.amber} strokeWidth={1.8} />
              <Text style={styles.infoCardLabel}>Coach</Text>
              <Text style={styles.infoCardValue}>{coachName}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={[styles.infoCardLabel, { marginTop: 0 }]}>Data</Text>
              <Text style={styles.infoCardValue}>{cls.date}</Text>
            </View>
          </View>

          {/* Capacity Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Capacidade</Text>
              <Text style={[styles.sectionBadge, { color: isFull ? C.amber : C.green }]}>
                {cls.enrolledCount}/{cls.maxCapacity}
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(occupancy * 100, 100)}%`,
                    backgroundColor: isFull ? C.amber : occupancy > 0.8 ? C.amber : C.green,
                  },
                ]}
              />
            </View>
            {cls.waitlistCount > 0 && (
              <Text style={styles.waitlistText}>
                +{cls.waitlistCount} em lista de espera
              </Text>
            )}
          </View>

          {/* Enrolled Members */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Inscritos</Text>
            <View style={styles.memberList}>
              {enrolledMembers.map((member) => (
                <View key={member.id} style={styles.memberRow}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberInitials}>{getInitials(member.name)}</Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberStatus}>
                      {member.status === "active" ? "Ativo" : "Trial"}
                    </Text>
                  </View>
                  <View style={styles.checkedBadge}>
                    <Text style={styles.checkedText}>Inscrito</Text>
                  </View>
                </View>
              ))}
              {cls.enrolledCount > 5 && (
                <Text style={styles.moreMembers}>
                  +{cls.enrolledCount - 5} mais inscritos
                </Text>
              )}
            </View>
          </View>

          {/* Spacer for bottom button */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom Action */}
        <View style={styles.bottomBar}>
          {isBooked ? (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsBooked(false)}
            >
              <Text style={styles.cancelButtonText}>CANCELAR RESERVA</Text>
            </TouchableOpacity>
          ) : isFull ? (
            <TouchableOpacity style={styles.waitlistButton}>
              <Text style={styles.waitlistButtonText}>ENTRAR NA LISTA DE ESPERA</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => setIsBooked(true)}
            >
              <Text style={styles.bookButtonText}>RESERVAR</Text>
            </TouchableOpacity>
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

  // Scroll
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },

  // Banner
  banner: {
    backgroundColor: C.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    borderLeftWidth: 4,
    padding: 20,
  },
  bannerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  classTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  classTypeName: {
    fontSize: 22,
    fontWeight: "800",
    color: C.text,
  },
  abbrevBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  abbrevText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // Info Grid
  infoGrid: {
    flexDirection: "row",
    gap: 10,
  },
  infoCard: {
    flex: 1,
    backgroundColor: C.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    alignItems: "center",
    gap: 6,
  },
  infoCardLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  infoCardValue: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
    textAlign: "center",
  },

  // Section Card
  sectionCard: {
    backgroundColor: C.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
    marginBottom: 12,
  },
  sectionBadge: {
    fontSize: 18,
    fontWeight: "800",
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: C.surface2,
    marginBottom: 8,
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  waitlistText: {
    fontSize: 13,
    color: C.amber,
    fontWeight: "600",
  },

  // Members
  memberList: {
    gap: 10,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface2,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  memberInitials: {
    fontSize: 14,
    fontWeight: "700",
    color: C.green,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: "600",
    color: C.text,
  },
  memberStatus: {
    fontSize: 12,
    color: C.muted,
    marginTop: 1,
  },
  checkedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: C.green + "15",
  },
  checkedText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.green,
  },
  moreMembers: {
    fontSize: 13,
    color: C.muted,
    textAlign: "center",
    marginTop: 8,
  },

  // Bottom Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 36,
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  bookButton: {
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: C.green,
    alignItems: "center",
  },
  bookButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#080c0a",
    letterSpacing: 1.5,
  },
  cancelButton: {
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.red,
    backgroundColor: C.red + "10",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: C.red,
    letterSpacing: 1.5,
  },
  waitlistButton: {
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.amber,
    alignItems: "center",
  },
  waitlistButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: C.amber,
    letterSpacing: 1.5,
  },

  // Empty
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: C.muted,
  },
});
