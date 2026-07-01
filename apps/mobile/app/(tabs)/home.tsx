import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
  Bell,
} from "lucide-react-native";
import { useTheme } from "../_layout";
import { t } from "@/i18n";
import { useAuthStore } from "@/stores/auth-store";
import type { Colors } from "@/colors";
import {
  listClassSchedule,
  listWods,
  listExercises,
  listCoaches,
  getMyMember,
  listPersonalRecords,
  type ClassScheduleItem,
  type WodItem,
  type CoachItem,
} from "@/lib/auth-api";

// ─── Mock data ─────────────────────────────────────────────
const mockNewsRaw = [
  {
    id: "news-1",
    title: "Throwdown Interno — Sábado 14 Junho",
    body: "Inscrições abertas para o throwdown de verão! Equipas de 2 pessoas (misto). Inscreve-te na receção ou pela app.",
    date: "1 Jun",
    tag: "Evento",
    tagKey: "amber" as const,
  },
  {
    id: "news-2",
    title: "Novo Horário de Verão",
    body: "A partir de 15 de Junho, o horário de verão entra em vigor. Consulta os novos horários na secção Agenda.",
    date: "30 Mai",
    tag: "Info",
    tagKey: "blue" as const,
  },
];

// NOTE: `mockNewsRaw` above is retained: the gateway exposes no member-facing
// news/announcements endpoint, so this section stays on placeholder data.

type NextClassView = {
  id: string;
  name: string;
  time: string;
  coach: string;
  enrolled: number;
  capacity: number;
};

type WodPreviewView = {
  title: string;
  type: string;
  movements: string[];
};

/** Pick the next upcoming (non-cancelled) class from the schedule. */
function pickNextClass(schedule: ClassScheduleItem[]): NextClassView | null {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const upcoming = schedule
    .filter((c) => !c.cancelledAt)
    .filter((c) => {
      if (c.date > todayStr) return true;
      if (c.date < todayStr) return false;
      const [h, m] = c.startTime.split(":").map(Number);
      return h * 60 + (m || 0) >= nowMinutes;
    })
    .sort((a, b) => (a.date === b.date ? a.startTime.localeCompare(b.startTime) : a.date.localeCompare(b.date)));
  const next = upcoming[0];
  if (!next) return null;
  return {
    id: next.id,
    name: next.classType?.name ?? t("label.class"),
    time: next.startTime,
    coach: next.coaches[0]?.name ?? "TBD",
    enrolled: next.enrolledCount,
    capacity: next.maxCapacity,
  };
}

/** Build a compact WOD preview (title, first timed part type, movement names). */
function buildWodPreview(wod: WodItem, exerciseNames: Map<string, string>): WodPreviewView | null {
  const parts = wod.parts ?? [];
  const mainPart =
    parts.find((p) => ["amrap", "emom", "for_time", "tabata"].includes(p.type)) ?? parts[0];
  const movements = (mainPart?.exercises ?? [])
    .map((ex) => exerciseNames.get(ex.exerciseId) ?? ex.exerciseId)
    .slice(0, 4);
  const typeLabel = mainPart?.type
    ? mainPart.type.replace(/_/g, " ").toUpperCase() + (mainPart.timeCap ? ` ${mainPart.timeCap}` : "")
    : "";
  return {
    title: wod.title ?? t("screen.wod"),
    type: typeLabel,
    movements,
  };
}

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

function WeeklyStories({ C }: { C: Colors }) {
  const router = useRouter();
  const today = new Date();

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

  const ss = storyStyles(C);

  return (
    <View style={ss.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={ss.scroll}
      >
        {days.map((day, i) => {
          const trained = day.trained && (day.isPast || day.isToday);
          return (
            <TouchableOpacity
              key={i}
              style={ss.dayCol}
              onPress={() => {
                if (day.isFuture) return;
                if (trained) {
                  router.push("/booking-history");
                } else {
                  router.push("/(tabs)/schedule");
                }
              }}
            >
              <Text style={[ss.dayLetter, day.isToday && ss.dayLetterToday]}>
                {day.letter}
              </Text>
              <View
                style={[
                  ss.ring,
                  trained && ss.ringTrained,
                  day.isToday && ss.ringToday,
                  day.isFuture && ss.ringFuture,
                ]}
              >
                <View
                  style={[
                    ss.circle,
                    day.isToday && ss.circleToday,
                  ]}
                >
                  {day.isRestDay ? (
                    <Moon size={12} color={C.blue} strokeWidth={2} />
                  ) : trained ? (
                    <Flame size={day.isToday ? 16 : 13} color={day.isToday ? C.green : C.amber} strokeWidth={2} fill={day.isToday ? C.green + "60" : C.amber + "40"} />
                  ) : (
                    <View style={[ss.emptyDot, day.isFuture && ss.emptyDotFuture]} />
                  )}
                </View>
              </View>
              {day.isToday && <View style={ss.todayPip} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function storyStyles(C: Colors) {
  return StyleSheet.create({
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
}

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
    default: return role.charAt(0).toUpperCase() + role.slice(1);
  }
}

function getRoleColor(role: string, C: Colors): string {
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
  const C = useTheme();
  const { user, activeOrgId } = useAuthStore();
  const userName = user?.user.name?.split(" ")[0] ?? "Atleta";
  const greeting = getGreeting();

  const memberId = useMemo(
    () => user?.memberships.find((m) => m.organizationId === activeOrgId)?.id ?? user?.memberships[0]?.id ?? "",
    [activeOrgId, user],
  );

  const [nextClass, setNextClass] = useState<NextClassView | null>(null);
  const [wodPreview, setWodPreview] = useState<WodPreviewView | null>(null);
  const [coaches, setCoaches] = useState<CoachItem[]>([]);
  const [streakWeeks, setStreakWeeks] = useState(0);
  const [totalCheckIns, setTotalCheckIns] = useState(0);
  const [prCount, setPrCount] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const weekAhead = new Date(Date.now() + 7 * 86_400_000).toISOString().split("T")[0];
    let cancelled = false;

    void listClassSchedule(today, weekAhead)
      .then((schedule) => {
        if (!cancelled) setNextClass(pickNextClass(schedule));
      })
      .catch(() => {
        if (!cancelled) setNextClass(null);
      });

    void Promise.all([listWods(today, today), listExercises()])
      .then(([wods, exercises]) => {
        if (cancelled) return;
        const names = new Map(exercises.map((e) => [e.id, e.name]));
        const published = wods.filter((w) => w.publishedAt);
        const wod = published[0] ?? wods[0];
        setWodPreview(wod ? buildWodPreview(wod, names) : null);
      })
      .catch(() => {
        if (!cancelled) setWodPreview(null);
      });

    void listCoaches()
      .then((rows) => {
        if (!cancelled) setCoaches(rows);
      })
      .catch(() => {
        if (!cancelled) setCoaches([]);
      });

    void getMyMember()
      .then((member) => {
        if (cancelled || !member) return;
        setStreakWeeks(member.streakWeeks);
        setTotalCheckIns(member.totalCheckIns);
      })
      .catch(() => {});

    if (memberId) {
      void listPersonalRecords(memberId)
        .then((rows) => {
          if (!cancelled) setPrCount(rows.length);
        })
        .catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, [memberId]);

  const nextOccupancy = nextClass && nextClass.capacity > 0 ? nextClass.enrolled / nextClass.capacity : 0;
  const mockNews = mockNewsRaw.map((item) => ({
    ...item,
    tagColor: item.tagKey === "amber" ? C.amber : C.blue,
  }));
  const styles = makeStyles(C);

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
            <Bell size={22} color={C.text} strokeWidth={1.8} />
          </TouchableOpacity>
        </View>

        {/* ── Greeting ── */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingLine}>{greeting},</Text>
          <Text style={styles.greetingName}>{userName}</Text>
          <Text style={styles.orgName}>Vytal CrossFit · Lisboa</Text>
        </View>

        {/* ── Weekly Training Stories ── */}
        <WeeklyStories C={C} />

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
            <Text style={[styles.statValue, { color: C.amber }]}>{streakWeeks}</Text>
            <Text style={styles.statLabel}>{t("label.weeks")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statItem, { borderRightWidth: 1, borderRightColor: C.border }]}
            onPress={() => router.push("/booking-history")}
            activeOpacity={0.7}
          >
            <View style={[styles.statIconBox, { backgroundColor: C.blue + "20" }]}>
              <CalendarCheck size={16} color={C.blue} strokeWidth={2} />
            </View>
            <Text style={[styles.statValue, { color: C.blue }]}>{totalCheckIns}</Text>
            <Text style={styles.statLabel}>{t("label.checkIns")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => router.push("/(tabs)/records")}
            activeOpacity={0.7}
          >
            <View style={[styles.statIconBox, { backgroundColor: C.green + "20" }]}>
              <Trophy size={16} color={C.green} strokeWidth={2} />
            </View>
            <Text style={[styles.statValue, { color: C.green }]}>{prCount}</Text>
            <Text style={styles.statLabel}>{t("label.prs")}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Next class card ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>{t("home.nextClass")}</Text>
        </View>
        {nextClass ? (
          <TouchableOpacity
            style={styles.nextClassCard}
            onPress={() => router.push(`/class-detail?id=${nextClass.id}`)}
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
                {nextClass.enrolled}/{nextClass.capacity} {t("status.enrolled")}
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
              onPress={() => router.push(`/booking-confirm?classId=${nextClass.id}`)}
            >
              <Text style={styles.reserveBtnText}>{t("btn.book")}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyCardText}>{t("label.noClasses")}</Text>
          </View>
        )}

        {/* ── WOD preview ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>{t("home.todayWOD")}</Text>
          <TouchableOpacity onPress={() => router.push("/wod-detail")}>
            <Text style={styles.seeAll}>{t("btn.details")}</Text>
          </TouchableOpacity>
        </View>
        {wodPreview ? (
          <TouchableOpacity
            style={styles.wodPreviewCard}
            onPress={() => router.push("/wod-detail")}
            activeOpacity={0.85}
          >
            <View style={styles.wodPreviewHeader}>
              <Text style={styles.wodPreviewTitle}>{wodPreview.title}</Text>
              {wodPreview.type ? (
                <View style={styles.wodTypeBadge}>
                  <Text style={styles.wodTypeText}>{wodPreview.type}</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.wodMovements}>
              {wodPreview.movements.map((m, i) => (
                <View key={i} style={styles.movementPill}>
                  <View style={styles.movementDot} />
                  <Text style={styles.movementText}>{m}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyCardText}>{t("wod.empty")}</Text>
          </View>
        )}

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
            <Text style={styles.actionLabel}>{t("misc.checkinQR")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/timer")}
          >
            <View style={[styles.actionIcon, { backgroundColor: C.orange + "20" }]}>
              <Flame size={22} color={C.orange} strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>{t("misc.timerAmrap")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(tabs)/community")}
          >
            <View style={[styles.actionIcon, { backgroundColor: C.blue + "20" }]}>
              <Users size={22} color={C.blue} strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>{t("misc.community")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/chat")}
          >
            <View style={[styles.actionIcon, { backgroundColor: C.purple + "20" }]}>
              <MessageSquare size={22} color={C.purple} strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>{t("misc.messages")}</Text>
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
          {coaches.map((coach) => {
            const rc = getRoleColor(coach.role, C);
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
            <Text style={styles.seeAll}>{t("label.viewAll")}</Text>
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
            <Text style={styles.quickLinkText}>{t("misc.anniversaries")}</Text>
            <ChevronRight size={14} color={C.muted} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickLinkCard}
            onPress={() => router.push("/box-records")}
          >
            <Newspaper size={18} color={C.blue} strokeWidth={2} />
            <Text style={styles.quickLinkText}>{t("misc.boxRecordsFull")}</Text>
            <ChevronRight size={14} color={C.muted} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────
function makeStyles(C: Colors) { return StyleSheet.create({
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
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.red,
    zIndex: 1,
  },

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

  // Empty card (no next class / no WOD)
  emptyCard: {
    marginHorizontal: 16,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  emptyCardText: { fontSize: 14, color: C.muted, textAlign: "center" },

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
}); }
