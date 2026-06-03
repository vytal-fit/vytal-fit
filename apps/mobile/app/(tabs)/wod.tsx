import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "@/colors";
import { t } from "@/i18n";

const C = colors;

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

function getWODTypeBadge(type: string): { label: string; color: string } {
  switch (type) {
    case "amrap":
      return { label: "AMRAP", color: C.green };
    case "emom":
      return { label: "EMOM", color: C.blue };
    case "for_time":
      return { label: "FOR TIME", color: C.red };
    case "tabata":
      return { label: "TABATA", color: C.orange };
    case "strength":
      return { label: "STRENGTH", color: C.amber };
    default:
      return { label: "CUSTOM", color: C.purple };
  }
}

function formatDateHeader(): string {
  const now = new Date();
  const months = [
    "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  return `${now.getDate()} de ${months[now.getMonth()]} ${now.getFullYear()}`;
}

// ─── Components ──────────────────────────────────────────

function WODPartCard({
  part,
}: {
  part: WODPart;
}) {
  const badge = getWODTypeBadge(part.type);

  return (
    <View style={styles.partCard}>
      <View style={styles.partHeader}>
        <View style={styles.partTitleRow}>
          <View style={[styles.partAccent, { backgroundColor: badge.color }]} />
          <Text style={styles.partName}>{part.name}</Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: badge.color + "20" }]}>
          <Text style={[styles.typeBadgeText, { color: badge.color }]}>
            {badge.label}
          </Text>
        </View>
      </View>

      {part.timeCap && (
        <View style={styles.timeCapRow}>
          <Text style={styles.timeCapIcon}>T</Text>
          <Text style={styles.timeCapText}>{part.timeCap} min</Text>
        </View>
      )}

      <View style={styles.exerciseList}>
        {part.exercises.map((ex, i) => (
          <View key={i} style={styles.exerciseRow}>
            <View style={styles.exerciseBullet} />
            <View style={styles.exerciseInfo}>
              <View style={styles.exerciseMainRow}>
                <Text style={styles.exerciseName}>{ex.name}</Text>
                {ex.reps && (
                  <Text style={styles.exerciseReps}>{ex.reps}</Text>
                )}
              </View>
              {ex.weight && (
                <Text style={styles.exerciseWeight}>{ex.weight}</Text>
              )}
              {ex.notes && (
                <Text style={styles.exerciseNotes}>{ex.notes}</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────
export default function WODScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t("screen.wod")}</Text>
          <Text style={styles.headerDate}>{formatDateHeader()}</Text>
        </View>

        {/* WOD Title */}
        <View style={styles.wodTitleSection}>
          <Text style={styles.wodTitle}>{todayWOD.title}</Text>
          <View style={styles.publishedBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.publishedText}>{t("status.published")}</Text>
          </View>
        </View>

        {/* Parts */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {todayWOD.parts.map((part, i) => (
            <WODPartCard key={i} part={part} />
          ))}

          {/* Spacer for bottom buttons */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Action Buttons */}
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: C.text,
    letterSpacing: -0.5,
  },
  headerDate: {
    fontSize: 14,
    color: C.muted,
    marginTop: 4,
  },

  // WOD Title
  wodTitleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  wodTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: C.green,
  },
  publishedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.green + "15",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.green,
  },
  publishedText: {
    fontSize: 12,
    fontWeight: "600",
    color: C.green,
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },

  // Part Card
  partCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  partHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  partTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  partAccent: {
    width: 3,
    height: 20,
    borderRadius: 2,
  },
  partName: {
    fontSize: 17,
    fontWeight: "700",
    color: C.text,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },

  // Time Cap
  timeCapRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    paddingLeft: 13,
  },
  timeCapIcon: {
    fontSize: 12,
    fontWeight: "800",
    color: C.amber,
    backgroundColor: C.amber + "20",
    width: 20,
    height: 20,
    textAlign: "center",
    lineHeight: 20,
    borderRadius: 4,
    overflow: "hidden",
  },
  timeCapText: {
    fontSize: 13,
    fontWeight: "600",
    color: C.amber,
  },

  // Exercises
  exerciseList: {
    gap: 10,
    paddingLeft: 13,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  exerciseBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.muted,
    marginTop: 7,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseMainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: "600",
    color: C.text,
    flex: 1,
  },
  exerciseReps: {
    fontSize: 14,
    fontWeight: "700",
    color: C.green,
    marginLeft: 8,
  },
  exerciseWeight: {
    fontSize: 13,
    color: C.blue,
    fontWeight: "500",
    marginTop: 2,
  },
  exerciseNotes: {
    fontSize: 12,
    color: C.muted,
    fontStyle: "italic",
    marginTop: 2,
  },

  // Action Bar
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 10,
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
    fontSize: 12,
    fontWeight: "800",
    color: C.muted,
    letterSpacing: 1,
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
});
