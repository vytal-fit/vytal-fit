import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Clock, ChevronDown, ChevronUp, Play, Pause, RotateCcw, Zap, Timer } from "lucide-react-native";
import { useTheme } from "../_layout";
import type { Colors } from "@/colors";
import { t } from "@/i18n";

// ─── Types ───────────────────────────────────────────────
type WODExercise = {
  name: string;
  reps?: string;
  weight?: string;
  notes?: string;
};

type WODPart = {
  name: string;
  type: "amrap" | "emom" | "for_time" | "tabata" | "strength" | "custom";
  timeCap?: number;
  exercises: WODExercise[];
};

// ─── Mock WOD Data ───────────────────────────────────────
const todayWOD: { id: string; title: string; date: string; parts: WODPart[] } = {
  id: "wod-1",
  title: "CrossFit Total",
  date: new Date().toISOString().split("T")[0],
  parts: [
    {
      name: "Warm Up",
      type: "custom" as const,
      exercises: [
        { name: "Row", reps: "500m", notes: "Easy pace" },
        { name: "PVC Pass-Throughs", reps: "10" },
        { name: "Air Squats", reps: "15" },
        { name: "Inchworms", reps: "10" },
        { name: "Scap Pull-Ups", reps: "10" },
      ],
    },
    {
      name: "Strength",
      type: "strength" as const,
      exercises: [
        { name: "Back Squat", reps: "5-5-3-3-1-1", weight: "Build to heavy", notes: "Rest 2-3 min between sets" },
        { name: "Strict Press", reps: "5-5-3-3-1-1", weight: "Build to heavy", notes: "Rest 2 min between sets" },
      ],
    },
    {
      name: "WOD",
      type: "amrap" as const,
      timeCap: 15,
      exercises: [
        { name: "Power Cleans", reps: "10", weight: "60/42.5 kg" },
        { name: "Box Jumps", reps: "15", weight: "24/20 in" },
        { name: "Toes-to-Bar", reps: "12" },
        { name: "Calories Assault Bike", reps: "10" },
      ],
    },
    {
      name: "Cool Down",
      type: "custom" as const,
      exercises: [
        { name: "Foam Roll Quads", reps: "2 min" },
        { name: "Pigeon Stretch", reps: "1 min/side" },
        { name: "Banded Shoulder Stretch", reps: "1 min/side" },
      ],
    },
  ],
};

function getWODTypeBadge(type: string, C: Colors): { label: string; color: string } {
  switch (type) {
    case "amrap": return { label: "AMRAP", color: C.green };
    case "emom": return { label: "EMOM", color: C.blue };
    case "for_time": return { label: "FOR TIME", color: C.red };
    case "tabata": return { label: "TABATA", color: C.orange };
    case "strength": return { label: "STRENGTH", color: C.amber };
    default: return { label: "CUSTOM", color: C.purple };
  }
}

function formatDateHeader(): string {
  const now = new Date();
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  return `${now.getDate()} de ${months[now.getMonth()]} ${now.getFullYear()}`;
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ─── Collapsible Part Card ────────────────────────────────
function WODPartCard({ part, defaultOpen, C, styles }: { part: WODPart; defaultOpen?: boolean; C: Colors; styles: ReturnType<typeof makeStyles> }) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  const badge = getWODTypeBadge(part.type, C);

  return (
    <View style={styles.partCard}>
      <TouchableOpacity
        style={styles.partHeader}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.7}
      >
        <View style={styles.partTitleRow}>
          <View style={[styles.partAccent, { backgroundColor: badge.color }]} />
          <Text style={styles.partName}>{part.name}</Text>
          {part.timeCap && (
            <View style={styles.timeCapInline}>
              <Timer size={10} color={C.amber} strokeWidth={2} />
              <Text style={styles.timeCapInlineText}>{part.timeCap} min</Text>
            </View>
          )}
        </View>
        <View style={styles.partHeaderRight}>
          <View style={[styles.typeBadge, { backgroundColor: badge.color + "20" }]}>
            <Text style={[styles.typeBadgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>
          {open
            ? <ChevronUp size={16} color={C.muted} strokeWidth={2} />
            : <ChevronDown size={16} color={C.muted} strokeWidth={2} />
          }
        </View>
      </TouchableOpacity>

      {open && (
        <View style={styles.exerciseList}>
          {part.exercises.map((ex, i) => (
            <View key={i} style={styles.exerciseRow}>
              <View style={[styles.exerciseBullet, { backgroundColor: badge.color + "80" }]} />
              <View style={styles.exerciseInfo}>
                <View style={styles.exerciseMainRow}>
                  <Text style={styles.exerciseName}>{ex.name}</Text>
                  {ex.reps && <Text style={[styles.exerciseReps, { color: badge.color }]}>{ex.reps}</Text>}
                </View>
                {ex.weight && <Text style={styles.exerciseWeight}>{ex.weight}</Text>}
                {ex.notes && <Text style={styles.exerciseNotes}>{ex.notes}</Text>}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Inline Timer ────────────────────────────────────────
function InlineTimer({ C, styles }: { C: Colors; styles: ReturnType<typeof makeStyles> }) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  function reset() {
    setRunning(false);
    setSeconds(0);
  }

  return (
    <View style={styles.timerCard}>
      <View style={styles.timerHeader}>
        <View style={styles.timerHeaderLeft}>
          <Clock size={16} color={C.green} strokeWidth={2} />
          <Text style={styles.timerTitle}>{t("wod.timer")}</Text>
        </View>
        <TouchableOpacity onPress={reset} style={styles.timerResetBtn}>
          <RotateCcw size={16} color={C.muted} strokeWidth={2} />
        </TouchableOpacity>
      </View>
      <Animated.Text style={[styles.timerDisplay, { transform: [{ scale: pulseAnim }], color: running ? C.green : C.text }]}>
        {formatTime(seconds)}
      </Animated.Text>
      <TouchableOpacity
        style={[styles.timerPlayBtn, { backgroundColor: running ? C.red + "18" : C.green }]}
        onPress={() => setRunning((v) => !v)}
      >
        {running
          ? <Pause size={22} color={C.red} strokeWidth={2.5} />
          : <Play size={22} color="#080c0a" strokeWidth={2.5} fill="#080c0a" />
        }
        <Text style={[styles.timerPlayText, { color: running ? C.red : "#080c0a" }]}>
          {running ? t("wod.pause") : t("wod.start")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────
export default function WODScreen() {
  const router = useRouter();
  const C = useTheme();
  const styles = makeStyles(C);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.headerBrandRow}>
              <Zap size={14} color={C.green} strokeWidth={2.5} fill={C.green} />
              <Text style={styles.headerBrand}>WOD</Text>
            </View>
            <Text style={styles.headerTitle}>{t("screen.wod")}</Text>
            <Text style={styles.headerDate}>{formatDateHeader()}</Text>
          </View>
          <TouchableOpacity
            style={styles.headerAction}
            onPress={() => router.push("/timer")}
          >
            <Clock size={20} color={C.text} strokeWidth={1.8} />
          </TouchableOpacity>
        </View>

        {/* WOD Title bar */}
        <View style={styles.wodTitleSection}>
          <Text style={styles.wodTitle}>{todayWOD.title}</Text>
          <View style={styles.publishedBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.publishedText}>{t("status.published")}</Text>
          </View>
        </View>

        {/* Scrollable content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {todayWOD.parts.map((part, i) => (
            <WODPartCard key={i} part={part} defaultOpen={i === 2} C={C} styles={styles} />
          ))}

          {/* Inline Timer */}
          <InlineTimer C={C} styles={styles} />

          {/* Log result section */}
          <View style={styles.logSection}>
            <Text style={styles.logSectionTitle}>{t("wod.logResult")}</Text>
            <TouchableOpacity
              style={styles.logButton}
              onPress={() => router.push("/score-entry")}
            >
              <Text style={styles.logButtonText}>{t("btn.result")}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* Action Bar */}
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.actionSecondary}
            onPress={() => router.push(`/wod-detail?id=${todayWOD.id}`)}
          >
            <Text style={styles.actionSecondaryText}>{t("btn.details")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionPrimary}
            onPress={() => router.push("/score-entry")}
          >
            <Text style={styles.actionPrimaryText}>{t("btn.result")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionSecondary}
            onPress={() => router.push("/leaderboard")}
          >
            <Text style={styles.actionSecondaryText}>{t("btn.leaderboard")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionSecondary}
            onPress={() => router.push("/wod-history")}
          >
            <Text style={styles.actionSecondaryText}>{t("btn.history")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────
function makeStyles(C: Colors) { return StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  headerBrand: {
    fontSize: 10,
    fontWeight: "800",
    color: C.green,
    letterSpacing: 2,
  },
  headerAction: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: C.text,
    letterSpacing: -0.5,
  },
  headerDate: { fontSize: 13, color: C.muted, marginTop: 3 },

  // WOD Title
  wodTitleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  wodTitle: { fontSize: 22, fontWeight: "700", color: C.green },
  publishedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.green + "15",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
  publishedText: { fontSize: 12, fontWeight: "600", color: C.green },

  // Scroll
  scrollContent: { paddingHorizontal: 16, gap: 12 },

  // Part Card
  partCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  partHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  partTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  partAccent: { width: 3, height: 20, borderRadius: 2 },
  partName: { fontSize: 17, fontWeight: "700", color: C.text },
  timeCapInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: C.amber + "15",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  timeCapInlineText: { fontSize: 10, fontWeight: "700", color: C.amber },
  partHeaderRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  typeBadgeText: { fontSize: 11, fontWeight: "800", letterSpacing: 1 },

  // Exercises
  exerciseList: { gap: 10, paddingHorizontal: 16, paddingBottom: 16 },
  exerciseRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  exerciseBullet: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  exerciseInfo: { flex: 1 },
  exerciseMainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exerciseName: { fontSize: 15, fontWeight: "600", color: C.text, flex: 1 },
  exerciseReps: { fontSize: 14, fontWeight: "700", marginLeft: 8 },
  exerciseWeight: { fontSize: 13, color: C.blue, fontWeight: "500", marginTop: 2 },
  exerciseNotes: { fontSize: 12, color: C.muted, fontStyle: "italic", marginTop: 2 },

  // Timer
  timerCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    alignItems: "center",
  },
  timerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 12,
  },
  timerHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  timerTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: C.green,
    letterSpacing: 2,
  },
  timerResetBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: C.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  timerDisplay: {
    fontSize: 56,
    fontWeight: "800",
    letterSpacing: -2,
    marginBottom: 16,
  },
  timerPlayBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  timerPlayText: { fontSize: 14, fontWeight: "800", letterSpacing: 1 },

  // Log section
  logSection: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  logSectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: C.muted,
    letterSpacing: 1.5,
    marginBottom: 12,
    textAlign: "center",
  },
  logButton: {
    backgroundColor: C.green + "18",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.green + "40",
    paddingVertical: 14,
    alignItems: "center",
  },
  logButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: C.green,
    letterSpacing: 1,
  },

  // Action Bar
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  actionSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: "center",
  },
  actionSecondaryText: {
    fontSize: 11,
    fontWeight: "800",
    color: C.muted,
    letterSpacing: 0.8,
  },
  actionPrimary: {
    flex: 1.3,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: C.green,
    alignItems: "center",
  },
  actionPrimaryText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#080c0a",
    letterSpacing: 1,
  },
}); }
