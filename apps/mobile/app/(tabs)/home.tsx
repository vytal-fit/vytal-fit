import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ChevronRight,
  Cake,
  Zap,
  Flame,
  CalendarCheck,
  Trophy,
  Users,
  Newspaper,
  MessageSquare,
  Moon,
} from "lucide-react-native";
import { mockCoaches } from "@vytal-fit/shared";
import { colors } from "@/colors";
import { t } from "@/i18n";
import { useAuthStore } from "@/stores/auth-store";

const C = colors;

// ─── Mock data ─────────────────────────────────────────────
const mockNews = [
  {
    id: "news-1",
    title: "Throwdown Interno — Sabado 14 Junho",
    body: "Inscricoes abertas para o throwdown de verao! Equipas de 2 pessoas (misto). Inscreve-te na recepcao ou pela app.",
    date: "1 Jun",
    tag: "Evento",
    tagColor: C.amber,
  },
  {
    id: "news-2",
    title: "Novo Horario de Verao",
    body: "A partir de 15 de Junho, o horario de verao entra em vigor. Consulta os novos horarios na seccao Agenda.",
    date: "30 Mai",
    tag: "Info",
    tagColor: C.blue,
  },
];

const nextClass = {
  name: "CrossFit",
  time: "18:30",
  coach: "Ana Silva",
  enrolled: 14,
  capacity: 20,
};

const todayWODPreview = {
  title: "CrossFit Total",
  type: "AMRAP 15",
  movements: ["Power Cleans", "Box Jumps", "Toes-to-Bar"],
};

// Weekly training data — uses day of week to simulate realistic pattern
// Mon/Tue/Thu/Fri = trained, Wed = active recovery, Sat/Sun = rest
function getWeeklyTrained(): { trained: boolean; label: string }[] {
  const today = new Date().getDay(); // 0=Sun
  return [
    { trained: true, label: "WOD + Strength" },      // Mon
    { trained: true, label: "AMRAP 20min" },           // Tue
    { trained: false, label: "Mobilidade" },           // Wed (rest/recovery)
    { trained: true, label: "For Time" },              // Thu
    { trained: today >= 5, label: "Open Box" },        // Fri (only if past)
    { trained: false, label: "Descanso" },             // Sat
    { trained: false, label: "Descanso" },             // Sun
  ];
}
const WEEKLY_TRAINED = getWeeklyTrained();

// ─── Weekly Stories Header ──────────────────────────────────
const DAY_LETTERS_PT = ["D", "S", "T", "Q", "Q", "S", "S"];

function WeeklyStories() {
  const today = new Date();
  const todayIndex = today.getDay(); // 0 = Sun

  // Build Mon-Sun starting from current week Monday
  const days = useMemo(() => {
    const monday = new Date(today);
    const diff = (today.getDay() + 6) % 7; // days since Monday
    monday.setDate(today.getDate() - diff);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const isToday = d.toDateString() === today.toDateString();
      const isPast = d < today && !isToday;
      const dayOfWeek = d.getDay();
      const letter = DAY_LETTERS_PT[dayOfWeek];
      const info = WEEKLY_TRAINED[i];
      const trained = info.trained;
      const isRestDay = !trained && isPast;
      return { d, isToday, isPast, isFuture: !isPast && !isToday, letter, trained, isRestDay, label: info.label };
    });
  }, []);

  return (
    <View style={storyStyles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={storyStyles.scroll}
      >
        {days.map((day, i) => {
          const trained = day.trained && (day.isPast || day.isToday);
          return (
            <TouchableOpacity
              key={i}
              style={storyStyles.dayCol}
              onPress={() => {
                if (day.isFuture) return;
                const dateStr = day.d.toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "short" });
                Alert.alert(
                  trained ? "✅ Treino" : day.isRestDay ? "😴 Descanso" : "📅 Hoje",
                  trained ? `${dateStr}\n${day.label}` : `${dateStr}\n${day.label || "Sem treino"}`,
                );
              }}
            >
              <Text style={[storyStyles.dayLetter, day.isToday && storyStyles.dayLetterToday]}>
                {day.letter}
              </Text>
              <View
                style={[
                  storyStyles.ring,
                  trained && storyStyles.ringTrained,
                  day.isToday && storyStyles.ringToday,
                  day.isFuture && storyStyles.ringFuture,
                ]}
              >
                <View
                  style={[
                    storyStyles.circle,
                    day.isToday && storyStyles.circleToday,
                  ]}
                >
                  {day.isRestDay ? (
                    <Moon size={12} color={C.blue} strokeWidth={2} />
                  ) : trained ? (
                    <Flame size={day.isToday ? 16 : 13} color={day.isToday ? C.green : C.amber} strokeWidth={2} fill={day.isToday ? C.green + "60" : C.amber + "40"} />
                  ) : (
                    <View style={[storyStyles.emptyDot, day.isFuture && storyStyles.emptyDotFuture]} />
                  )}
                </View>
              </View>
              {day.isToday && <View style={storyStyles.todayPip} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const storyStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  scroll: {
    gap: 8,
    paddingVertical: 4,
  },
  dayCol: {
    alignItems: "center",
    width: 42,
    gap: 4,
  },
  dayLetter: {
    fontSize: 10,
    fontWeight: "700",
    color: C.muted,
    letterSpacing: 0.5,
  },
  dayLetterToday: {
    color: C.green,
  },
  ring: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  ringTrained: {
    borderColor: C.amber,
  },
  ringToday: {
    borderColor: C.green,
    shadowColor: C.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  ringFuture: {
    borderColor: C.border,
  },
  circle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  circleToday: {
    backgroundColor: C.green + "15",
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  emptyDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.muted,
    opacity: 0.4,
  },
  emptyDotFuture: {
    opacity: 0.15,
  },
  todayPip: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.green,
  },
});

// ─── Helpers ───────────────────────────────────────────────
function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function getRoleLabel(role: string): string {
  switch (role) {
    case "head_coach": return "Head Coach";
    case "coach": return "Coach";
    case "assistant": return "Assistente";
    default: return role;
  }
}

function getRoleColor(role: string): string {
  switch (role) {
    case "head_coach": return C.green;
    case "coach": return C.blue;
    case "assistant": return C.purple;
    default: return C.muted;
  }
}

// ─── Screen ────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const userName = user?.user.name?.split(" ")[0] ?? "Atleta";
  const greeting = getGreeting();
  const nextOccupancy = nextClass.enrolled / nextClass.capacity;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.zapCircle}>
              <Zap size={18} color={C.green} strokeWidth={2.5} fill={C.green} />
            </View>
            <Text style={styles.brandName}>myVYTAL</Text>
          </View>
          <TouchableOpacity
            style={styles.notifButton}
            onPress={() => router.push("/notifications")}
          >
            <View style={styles.notifDot} />
            <Text style={styles.notifBell}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* ── Greeting ── */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingLine}>{greeting},</Text>
          <Text style={styles.greetingName}>{userName}</Text>
          <Text style={styles.orgName}>Vytal CrossFit · Lisboa</Text>
        </View>

        {/* ── Weekly Training Stories ── */}
        <WeeklyStories />

        {/* ── Stats strip (all tappable) ── */}
        <View style={styles.statsStrip}>
          <TouchableOpacity
            style={[styles.statItem, { borderRightWidth: 1, borderRightColor: C.border }]}
            onPress={() => router.push("/booking-history")}
            activeOpacity={0.7}
          >
            <View style={[styles.statIconBox, { backgroundColor: C.amber + "20" }]}>
              <Flame size={16} color={C.amber} strokeWidth={2} />
            </View>
            <Text style={[styles.statValue, { color: C.amber }]}>12</Text>
            <Text style={styles.statLabel}>Semanas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statItem, { borderRightWidth: 1, borderRightColor: C.border }]}
            onPress={() => router.push("/booking-history")}
            activeOpacity={0.7}
          >
            <View style={[styles.statIconBox, { backgroundColor: C.blue + "20" }]}>
              <CalendarCheck size={16} color={C.blue} strokeWidth={2} />
            </View>
            <Text style={[styles.statValue, { color: C.blue }]}>47</Text>
            <Text style={styles.statLabel}>Check-ins</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => router.push("/(tabs)/records")}
            activeOpacity={0.7}
          >
            <View style={[styles.statIconBox, { backgroundColor: C.green + "20" }]}>
              <Trophy size={16} color={C.green} strokeWidth={2} />
            </View>
            <Text style={[styles.statValue, { color: C.green }]}>8</Text>
            <Text style={styles.statLabel}>PRs</Text>
          </TouchableOpacity>
        </View>

        {/* ── Next class card ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>{t("home.nextClass")}</Text>
        </View>
        <TouchableOpacity
          style={styles.nextClassCard}
          onPress={() => router.push("/class-detail")}
          activeOpacity={0.85}
        >
          <View style={styles.nextClassTop}>
            <View>
              <Text style={styles.nextClassName}>{nextClass.name}</Text>
              <Text style={styles.nextClassCoach}>{nextClass.coach}</Text>
            </View>
            <View style={styles.nextClassTimeBadge}>
              <Text style={styles.nextClassTime}>{nextClass.time}</Text>
            </View>
          </View>
          <View style={styles.capacityRow}>
            <Text style={styles.capacityText}>
              {nextClass.enrolled}/{nextClass.capacity} inscritos
            </Text>
            <Text style={[styles.capacityPct, {
              color: nextOccupancy > 0.8 ? C.amber : C.green,
            }]}>
              {Math.round(nextOccupancy * 100)}%
            </Text>
          </View>
          <View style={styles.capacityBarBg}>
            <View
              style={[
                styles.capacityBarFill,
                {
                  width: `${nextOccupancy * 100}%` as `${number}%`,
                  backgroundColor: nextOccupancy > 0.8 ? C.amber : C.green,
                },
              ]}
            />
          </View>
          <TouchableOpacity
            style={styles.reserveBtn}
            onPress={() => router.push("/booking-confirm")}
          >
            <Text style={styles.reserveBtnText}>RESERVAR</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* ── WOD preview ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>{t("home.todayWOD")}</Text>
          <TouchableOpacity onPress={() => router.push("/wod-detail")}>
            <Text style={styles.seeAll}>Ver completo</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.wodPreviewCard}
          onPress={() => router.push("/wod-detail")}
          activeOpacity={0.85}
        >
          <View style={styles.wodPreviewHeader}>
            <Text style={styles.wodPreviewTitle}>{todayWODPreview.title}</Text>
            <View style={styles.wodTypeBadge}>
              <Text style={styles.wodTypeText}>{todayWODPreview.type}</Text>
            </View>
          </View>
          <View style={styles.wodMovements}>
            {todayWODPreview.movements.map((m, i) => (
              <View key={i} style={styles.movementPill}>
                <View style={styles.movementDot} />
                <Text style={styles.movementText}>{m}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>

        {/* ── Quick actions ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>{t("home.quickActions")}</Text>
        </View>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/checkin")}
          >
            <View style={[styles.actionIcon, { backgroundColor: C.green + "20" }]}>
              <CalendarCheck size={22} color={C.green} strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>Check-in{"\n"}QR</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/timer")}
          >
            <View style={[styles.actionIcon, { backgroundColor: C.orange + "20" }]}>
              <Flame size={22} color={C.orange} strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>Timer{"\n"}AMRAP</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(tabs)/community")}
          >
            <View style={[styles.actionIcon, { backgroundColor: C.blue + "20" }]}>
              <Users size={22} color={C.blue} strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>Comuni{"\n"}dade</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/chat")}
          >
            <View style={[styles.actionIcon, { backgroundColor: C.purple + "20" }]}>
              <MessageSquare size={22} color={C.purple} strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>Mensa{"\n"}gens</Text>
          </TouchableOpacity>
        </View>

        {/* ── Coaches ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>{t("home.coaches")}</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.coachScroll}
          style={styles.coachScrollWrapper}
        >
          {mockCoaches.map((coach) => {
            const rc = getRoleColor(coach.role);
            return (
              <TouchableOpacity
                key={coach.id}
                style={styles.coachCard}
                onPress={() => router.push(`/coach-profile?id=${coach.id}`)}
              >
                <View style={[styles.coachAvatar, { borderColor: rc }]}>
                  <Text style={[styles.coachInitials, { color: rc }]}>
                    {getInitials(coach.name)}
                  </Text>
                </View>
                <Text style={styles.coachName} numberOfLines={1}>
                  {coach.name.split(" ")[0]}
                </Text>
                <View style={[styles.roleBadge, { backgroundColor: rc + "18" }]}>
                  <Text style={[styles.roleText, { color: rc }]}>
                    {getRoleLabel(coach.role)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── News ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>{t("home.news")}</Text>
          <TouchableOpacity onPress={() => router.push("/news")}>
            <Text style={styles.seeAll}>Ver todas</Text>
          </TouchableOpacity>
        </View>
        {mockNews.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.newsCard}
            onPress={() => router.push("/news")}
            activeOpacity={0.8}
          >
            <View style={[styles.newsAccent, { backgroundColor: item.tagColor }]} />
            <View style={styles.newsBody2}>
              <View style={styles.newsHeaderRow}>
                <View style={[styles.newsTag, { backgroundColor: item.tagColor + "18" }]}>
                  <Text style={[styles.newsTagText, { color: item.tagColor }]}>{item.tag}</Text>
                </View>
                <Text style={styles.newsDate}>{item.date}</Text>
              </View>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsBodyText} numberOfLines={2}>{item.body}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* ── Quick links row ── */}
        <View style={styles.quickLinksRow}>
          <TouchableOpacity
            style={styles.quickLinkCard}
            onPress={() => router.push("/birthdays")}
          >
            <Cake size={18} color={C.amber} strokeWidth={2} />
            <Text style={styles.quickLinkText}>Aniversarios</Text>
            <ChevronRight size={14} color={C.muted} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickLinkCard}
            onPress={() => router.push("/box-records")}
          >
            <Newspaper size={18} color={C.blue} strokeWidth={2} />
            <Text style={styles.quickLinkText}>Box Records</Text>
            <ChevronRight size={14} color={C.muted} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 36 },

  // Top bar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  zapCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: C.green + "18",
    borderWidth: 1,
    borderColor: C.green + "40",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 18,
    fontWeight: "900",
    color: C.text,
    letterSpacing: -0.5,
  },
  notifButton: { position: "relative", padding: 4 },
  notifDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.red,
    zIndex: 1,
  },
  notifBell: { fontSize: 20 },

  // Greeting
  greetingSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  greetingLine: { fontSize: 16, color: C.muted, fontWeight: "500" },
  greetingName: {
    fontSize: 30,
    fontWeight: "900",
    color: C.text,
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  orgName: {
    fontSize: 13,
    color: C.green,
    fontWeight: "600",
    marginTop: 4,
    opacity: 0.85,
  },

  // Stats strip
  statsStrip: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 24,
    overflow: "hidden",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    gap: 4,
  },
  statIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 10, fontWeight: "600", color: C.muted, letterSpacing: 0.3 },

  // Section header row
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: C.muted,
    letterSpacing: 1.5,
  },
  seeAll: { fontSize: 12, fontWeight: "700", color: C.green },

  // Next class card
  nextClassCard: {
    marginHorizontal: 16,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 24,
  },
  nextClassTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  nextClassName: { fontSize: 20, fontWeight: "800", color: C.text },
  nextClassCoach: { fontSize: 13, color: C.muted, marginTop: 2 },
  nextClassTimeBadge: {
    backgroundColor: C.green + "18",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  nextClassTime: { fontSize: 18, fontWeight: "800", color: C.green },
  capacityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  capacityText: { fontSize: 12, color: C.muted },
  capacityPct: { fontSize: 12, fontWeight: "700" },
  capacityBarBg: {
    height: 5,
    borderRadius: 3,
    backgroundColor: C.surface2,
    marginBottom: 14,
  },
  capacityBarFill: { height: 5, borderRadius: 3 },
  reserveBtn: {
    backgroundColor: C.green,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  reserveBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#080c0a",
    letterSpacing: 1,
  },

  // WOD preview
  wodPreviewCard: {
    marginHorizontal: 16,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 24,
  },
  wodPreviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  wodPreviewTitle: { fontSize: 18, fontWeight: "700", color: C.text },
  wodTypeBadge: {
    backgroundColor: C.green + "18",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  wodTypeText: { fontSize: 11, fontWeight: "800", color: C.green, letterSpacing: 0.5 },
  wodMovements: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  movementPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.surface2,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  movementDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.green },
  movementText: { fontSize: 12, fontWeight: "600", color: C.text },

  // Actions grid
  actionsGrid: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 14,
    alignItems: "center",
    gap: 6,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: C.muted,
    textAlign: "center",
    lineHeight: 14,
  },

  // Coaches
  coachScrollWrapper: { marginBottom: 24 },
  coachScroll: { paddingHorizontal: 16, gap: 12 },
  coachCard: { alignItems: "center", width: 76 },
  coachAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.surface2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },
  coachInitials: { fontSize: 17, fontWeight: "800" },
  coachName: { fontSize: 12, fontWeight: "600", color: C.text, marginBottom: 3, textAlign: "center" },
  roleBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  roleText: { fontSize: 8, fontWeight: "700", letterSpacing: 0.3 },

  // News
  newsCard: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 10,
    overflow: "hidden",
  },
  newsAccent: { width: 4 },
  newsBody2: { flex: 1, padding: 14 },
  newsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  newsTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
  newsTagText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  newsDate: { fontSize: 11, color: C.muted },
  newsTitle: { fontSize: 15, fontWeight: "700", color: C.text, marginBottom: 4 },
  newsBodyText: { fontSize: 13, color: C.muted, lineHeight: 18 },

  // Quick links
  quickLinksRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginTop: 4,
  },
  quickLinkCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  quickLinkText: { flex: 1, fontSize: 13, fontWeight: "600", color: C.text },
});
