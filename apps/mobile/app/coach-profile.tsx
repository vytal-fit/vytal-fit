import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Mail } from "lucide-react-native";

// ─── Colors ──────────────────────────────────────────────
import { useTheme } from "./_layout";
import type { Colors } from "@/colors";
import { t } from "@/i18n";
import {
  getCoach,
  listClassSchedule,
  type CoachItem,
  type ClassScheduleItem,
} from "@/lib/auth-api";

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

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

type WeeklyClass = { day: string; time: string; type: string };

// ─── Screen ──────────────────────────────────────────────
export default function CoachProfileScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [coach, setCoach] = useState<CoachItem | null>(null);
  const [weeklyClasses, setWeeklyClasses] = useState<WeeklyClass[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setIsLoading(true);
    setLoadError(false);

    const today = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 6);
    const from = today.toISOString().slice(0, 10);
    const toYmd = to.toISOString().slice(0, 10);

    Promise.all([getCoach(id), listClassSchedule(from, toYmd)])
      .then(([coachRow, schedule]) => {
        if (cancelled) return;
        setCoach(coachRow);
        const forCoach = schedule
          .filter((c) => !c.cancelledAt && c.coaches.some((co) => co.id === id))
          .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
          .map<WeeklyClass>((c) => ({
            day: WEEKDAYS[new Date(c.date).getDay()] ?? c.date,
            time: c.startTime,
            type: c.classType?.name ?? "",
          }));
        setWeeklyClasses(forCoach);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const roleColor = useMemo(() => getRoleColor(coach?.role ?? "", C), [coach, C]);
  const bio = t("coachProfile.noBio");

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft size={22} color={C.text} strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t("coachProfile.title")}</Text>
            <View style={{ width: 44 }} />
          </View>
          <View style={styles.emptyState}>
            <ActivityIndicator color={C.green} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (loadError || !coach) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft size={22} color={C.text} strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t("coachProfile.title")}</Text>
            <View style={{ width: 44 }} />
          </View>
          <View style={styles.emptyState}>
            <Text style={styles.bioText}>{loadError ? t("common.error") : t("common.empty")}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
          {coach.email && (
            <View style={styles.contactCard}>
              <View style={styles.contactRow}>
                <Mail size={16} color={C.blue} strokeWidth={2} />
                <Text style={styles.contactText}>{coach.email}</Text>
              </View>
            </View>
          )}

          {/* Bio */}
          <View style={styles.bioCard}>
            <Text style={styles.bioTitle}>{t("coachProfile.about")}</Text>
            <Text style={styles.bioText}>{bio}</Text>
          </View>

          {/* Weekly Classes */}
          <View style={styles.classesCard}>
            <Text style={styles.classesTitle}>{t("coachProfile.weeklyClasses")}</Text>
            {weeklyClasses.length === 0 ? (
              <Text style={styles.bioText}>{t("common.empty")}</Text>
            ) : (
              weeklyClasses.map((cls, i) => (
                <View key={i} style={styles.classRow}>
                  <View style={styles.classLeft}>
                    <View style={styles.classDot} />
                    <Text style={styles.classDay}>{cls.day}</Text>
                  </View>
                  <Text style={styles.classTime}>{cls.time}</Text>
                  {cls.type ? (
                    <View style={styles.classTypeBadge}>
                      <Text style={styles.classTypeText}>{cls.type}</Text>
                    </View>
                  ) : null}
                </View>
              ))
            )}
          </View>

          {/* Send Email Button */}
          {coach.email ? (
            <TouchableOpacity
              style={styles.emailButton}
              onPress={() => Linking.openURL(`mailto:${coach.email}`)}
            >
              <Mail size={18} color="#080c0a" strokeWidth={2.5} />
              <Text style={styles.emailButtonText}>{t("coachProfile.sendEmail")}</Text>
            </TouchableOpacity>
          ) : null}

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
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
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
