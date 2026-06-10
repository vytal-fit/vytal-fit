import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Mail, Phone } from "lucide-react-native";
import { mockCoaches } from "@vytal-fit/shared";

// ─── Colors ──────────────────────────────────────────────
import { useTheme } from "./_layout";
import type { Colors } from "@/colors";
import { t } from "@/i18n";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getRoleLabel(role: string): string {
  switch (role) {
    case "head_coach":
      return "Head Coach";
    case "coach":
      return "Coach";
    case "assistant":
      return t("coachProfile.assistant");
    default:
      return role;
  }
}

function getRoleColor(role: string, C: Colors): string {
  switch (role) {
    case "head_coach":
      return C.green;
    case "coach":
      return C.blue;
    case "assistant":
      return C.purple;
    default:
      return C.muted;
  }
}

// ─── Mock Coach Data ─────────────────────────────────────
const mockCoachBios: Record<string, string> = {
  "coach-1":
    "CrossFit Level 3 Trainer com mais de 10 anos de experiencia. Especialista em halterofilia e programacao de treino. Competiu em varios regionais e formou dezenas de atletas.",
  "coach-2":
    "CrossFit Level 2 Trainer. Background em ginástica artística e movimentos de peso corporal. Apaixonada por ensinar fundamentos e ajudar atletas a superar os seus limites.",
  "coach-3":
    "CrossFit Level 2 Trainer e Halterofilia Nível 2. Especialista em movimentos olímpicos, snatch e clean & jerk. Organizador de workshops técnicos mensais.",
  "coach-4":
    "CrossFit Level 1 Trainer. Focada em mobilidade, aquecimento e prevenção de lesões. Formação em fisioterapia desportiva.",
};

const mockCoachPhones: Record<string, string> = {
  "coach-1": "+351 912 345 001",
  "coach-2": "+351 912 345 002",
  "coach-3": "+351 912 345 003",
  "coach-4": "+351 912 345 004",
};

const mockWeeklyClasses = [
  { day: "Segunda", time: "07:00", type: "CrossFit" },
  { day: "Segunda", time: "18:30", type: "CrossFit" },
  { day: "Quarta", time: "07:00", type: "CrossFit" },
  { day: "Sexta", time: "09:00", type: "Halterofilia" },
];

// ─── Screen ──────────────────────────────────────────────
export default function CoachProfileScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const coach = mockCoaches.find((c) => c.id === id) || mockCoaches[0];
  const roleColor = getRoleColor(coach.role, C);
  const bio = mockCoachBios[coach.id] || t("coachProfile.noBio");
  const phone = mockCoachPhones[coach.id] || "";

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
          <Text style={styles.headerTitle}>{t("coachProfile.title")}</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Avatar & Name */}
          <View style={styles.profileSection}>
            <View style={[styles.avatar, { borderColor: roleColor }]}>
              <Text style={[styles.avatarText, { color: roleColor }]}>
                {getInitials(coach.name)}
              </Text>
            </View>
            <Text style={styles.coachName}>{coach.name}</Text>
            <View
              style={[styles.roleBadge, { backgroundColor: roleColor + "18" }]}
            >
              <Text style={[styles.roleText, { color: roleColor }]}>
                {getRoleLabel(coach.role)}
              </Text>
            </View>
          </View>

          {/* Contact Info */}
          <View style={styles.contactCard}>
            <View style={styles.contactRow}>
              <Mail size={16} color={C.blue} strokeWidth={2} />
              <Text style={styles.contactText}>{coach.email}</Text>
            </View>
            {phone && (
              <View style={styles.contactRow}>
                <Phone size={16} color={C.green} strokeWidth={2} />
                <Text style={styles.contactText}>{phone}</Text>
              </View>
            )}
          </View>

          {/* Bio */}
          <View style={styles.bioCard}>
            <Text style={styles.bioTitle}>{t("coachProfile.about")}</Text>
            <Text style={styles.bioText}>{bio}</Text>
          </View>

          {/* Weekly Classes */}
          <View style={styles.classesCard}>
            <Text style={styles.classesTitle}>{t("coachProfile.weeklyClasses")}</Text>
            {mockWeeklyClasses.map((cls, i) => (
              <View key={i} style={styles.classRow}>
                <View style={styles.classLeft}>
                  <View style={styles.classDot} />
                  <Text style={styles.classDay}>{cls.day}</Text>
                </View>
                <Text style={styles.classTime}>{cls.time}</Text>
                <View style={styles.classTypeBadge}>
                  <Text style={styles.classTypeText}>{cls.type}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Send Email Button */}
          <TouchableOpacity
            style={styles.emailButton}
            onPress={() => Linking.openURL(`mailto:${coach.email}`)}
          >
            <Mail size={18} color="#080c0a" strokeWidth={2.5} />
            <Text style={styles.emailButtonText}>{t("coachProfile.sendEmail")}</Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────
function makeStyles(C: Colors) { return StyleSheet.create({
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
    gap: 14,
  },

  // Profile Section
  profileSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: C.surface2,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 34,
    fontWeight: "800",
  },
  coachName: {
    fontSize: 24,
    fontWeight: "800",
    color: C.text,
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 10,
  },
  roleText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Contact
  contactCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    gap: 12,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    color: C.text,
    fontWeight: "500",
  },

  // Bio
  bioCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  bioTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
    marginBottom: 10,
  },
  bioText: {
    fontSize: 14,
    color: C.muted,
    lineHeight: 22,
  },

  // Classes
  classesCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  classesTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
    marginBottom: 14,
  },
  classRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  classLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  classDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.green,
  },
  classDay: {
    fontSize: 14,
    fontWeight: "600",
    color: C.text,
  },
  classTime: {
    fontSize: 14,
    fontWeight: "700",
    color: C.green,
    marginRight: 12,
  },
  classTypeBadge: {
    backgroundColor: C.green + "15",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  classTypeText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.green,
  },

  // Email Button
  emailButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.green,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 4,
  },
  emailButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#080c0a",
    letterSpacing: 1,
  },
}); }
