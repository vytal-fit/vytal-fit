import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Clock, Trophy, Calendar } from "lucide-react-native";
import { useTheme } from "./_layout";
import type { Colors } from "@/colors";
import { t } from "@/i18n";
import {
  getWod,
  listWods,
  listExercises,
  listWodResults,
  type WodItem,
  type WodResultItem,
} from "@/lib/auth-api";
import { useAuthStore } from "@/stores/auth-store";

function todayYmd(): string {
  return new Date().toISOString().split("T")[0];
}

function getWODTypeBadge(type: string, C: Colors): { label: string; color: string } {
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
      return { label: t("cat.strengthFull"), color: C.amber };
    default:
      return { label: t("wod.typeCustom"), color: C.purple };
  }
}

const MONTH_KEYS = [
  "month.jan", "month.feb", "month.mar", "month.apr", "month.may", "month.jun",
  "month.jul", "month.aug", "month.sep", "month.oct", "month.nov", "month.dec",
];

function formatDate(dateStr: string): string {
  const parts = dateStr.split("-");
  const month = t(MONTH_KEYS[parseInt(parts[1], 10) - 1]);
  return t("wodDetail.dateFormat")
    .replace("{d}", parts[2])
    .replace("{m}", month)
    .replace("{y}", parts[0]);
}

// ─── Screen ──────────────────────────────────────────────
export default function WODDetailScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, activeOrgId } = useAuthStore();
  const memberId = useMemo(
    () => user?.memberships.find((m) => m.organizationId === activeOrgId)?.id ?? user?.memberships[0]?.id ?? "",
    [activeOrgId, user],
  );

  const [wod, setWod] = useState<WodItem | null>(null);
  const [exerciseNames, setExerciseNames] = useState<Map<string, string>>(new Map());
  const [history, setHistory] = useState<WodResultItem[]>([]);
  const [personalBest, setPersonalBest] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(false);

    void (async () => {
      try {
        const today = todayYmd();
        const [loadedWod, exercises] = await Promise.all([
          id ? getWod(id) : listWods(today, today).then((rows) => rows[0] ?? null),
          listExercises(),
        ]);
        if (cancelled) return;
        setExerciseNames(new Map(exercises.map((e) => [e.id, e.name])));
        setWod(loadedWod);

        if (loadedWod && memberId) {
          const results = await listWodResults(memberId, loadedWod.id);
          if (cancelled) return;
          setHistory(results);
          const pr = results.find((r) => r.isPR);
          setPersonalBest(pr?.score ?? null);
        } else {
          setHistory([]);
          setPersonalBest(null);
        }
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, memberId]);

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
          <Text style={styles.headerTitle}>{t("wodDetail.title")}</Text>
          <View style={{ width: 44 }} />
        </View>

        {isLoading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color={C.green} />
          </View>
        ) : loadError ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>{t("common.error")}</Text>
          </View>
        ) : !wod ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>{t("common.empty")}</Text>
          </View>
        ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* WOD Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.wodTitle}>{wod.title || "WOD"}</Text>
            <View style={styles.dateRow}>
              <Calendar size={14} color={C.muted} strokeWidth={2} />
              <Text style={styles.dateText}>{formatDate(wod.date)}</Text>
            </View>
            {wod.description && (
              <Text style={styles.description}>{wod.description}</Text>
            )}
          </View>

          {/* Personal Best */}
          {personalBest && (
            <View style={styles.pbCard}>
              <View style={styles.pbLeft}>
                <Trophy size={20} color={C.amber} strokeWidth={2} />
                <View>
                  <Text style={styles.pbLabel}>{t("wodDetail.pbLabel")}</Text>
                  <Text style={styles.pbValue}>{personalBest}</Text>
                </View>
              </View>
              <View style={styles.pbBadge}>
                <Text style={styles.pbBadgeText}>PB</Text>
              </View>
            </View>
          )}

          {/* Workout Breakdown */}
          <Text style={styles.sectionTitle}>{t("wodDetail.workoutDetails")}</Text>
          {wod.parts.map((part, i) => {
            const badge = getWODTypeBadge(part.type, C);
            return (
              <View key={i} style={styles.partCard}>
                <View style={styles.partHeader}>
                  <View style={styles.partTitleRow}>
                    <View
                      style={[styles.partAccent, { backgroundColor: badge.color }]}
                    />
                    <Text style={styles.partName}>{part.name}</Text>
                  </View>
                  <View
                    style={[
                      styles.typeBadge,
                      { backgroundColor: badge.color + "20" },
                    ]}
                  >
                    <Text style={[styles.typeBadgeText, { color: badge.color }]}>
                      {badge.label}
                    </Text>
                  </View>
                </View>

                {part.timeCap && (
                  <View style={styles.timeCapRow}>
                    <Clock size={14} color={C.amber} strokeWidth={2} />
                    <Text style={styles.timeCapText}>{part.timeCap} min</Text>
                  </View>
                )}

                {part.rounds && (
                  <View style={styles.timeCapRow}>
                    <Text style={styles.roundsIcon}>R</Text>
                    <Text style={styles.timeCapText}>
                      {part.rounds} rounds
                      {part.intervalSeconds
                        ? ` ${t("wodDetail.interval").replace("{s}", String(part.intervalSeconds))}`
                        : ""}
                    </Text>
                  </View>
                )}

                <View style={styles.exerciseList}>
                  {part.exercises.map((ex, j) => (
                    <View key={j} style={styles.exerciseRow}>
                      <View style={styles.exerciseBullet} />
                      <View style={styles.exerciseInfo}>
                        <View style={styles.exerciseMainRow}>
                          <Text style={styles.exerciseName}>
                            {exerciseNames.get(ex.exerciseId) || ex.exerciseId}
                          </Text>
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
          })}

          {/* History */}
          <Text style={styles.sectionTitle}>{t("wodDetail.history")}</Text>
          {history.length === 0 ? (
            <View style={styles.historyEmpty}>
              <Text style={styles.stateText}>{t("common.empty")}</Text>
            </View>
          ) : (
            history.map((entry) => {
              const isRx = entry.scale === "rx" || entry.scale === "rx_plus";
              const scaleLabel =
                entry.scale === "rx_plus" ? "Rx+" : entry.scale === "rx" ? "Rx" : "Scaled";
              return (
                <View key={entry.id} style={styles.historyCard}>
                  <View style={styles.historyLeft}>
                    <Text style={styles.historyDate}>
                      {(entry.wod?.date ?? wod.date).split("-").reverse().slice(0, 2).join("/")}
                    </Text>
                    <View
                      style={[
                        styles.scaleBadge,
                        {
                          backgroundColor: isRx ? C.green + "18" : C.amber + "18",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.scaleText,
                          {
                            color: isRx ? C.green : C.amber,
                          },
                        ]}
                      >
                        {scaleLabel}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.historyScore}>{entry.score}</Text>
                </View>
              );
            })
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
        )}
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

  // States
  stateBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 16,
  },
  stateText: {
    fontSize: 15,
    color: C.muted,
    textAlign: "center",
  },
  historyEmpty: {
    paddingVertical: 20,
    alignItems: "center",
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },

  // Title Section
  titleSection: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
  },
  wodTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: C.green,
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 14,
    color: C.muted,
    fontWeight: "500",
  },
  description: {
    fontSize: 15,
    color: C.text,
    lineHeight: 22,
    opacity: 0.85,
  },

  // Personal Best
  pbCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.amber + "12",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.amber + "30",
    padding: 16,
  },
  pbLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pbLabel: {
    fontSize: 12,
    color: C.muted,
    fontWeight: "600",
  },
  pbValue: {
    fontSize: 22,
    fontWeight: "800",
    color: C.amber,
    marginTop: 2,
  },
  pbBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.amber + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  pbBadgeText: {
    fontSize: 13,
    fontWeight: "900",
    color: C.amber,
  },

  // Section Title
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 4,
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
  timeCapText: {
    fontSize: 13,
    fontWeight: "600",
    color: C.amber,
  },
  roundsIcon: {
    fontSize: 12,
    fontWeight: "800",
    color: C.blue,
    backgroundColor: C.blue + "20",
    width: 20,
    height: 20,
    textAlign: "center",
    lineHeight: 20,
    borderRadius: 4,
    overflow: "hidden",
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

  // History
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  historyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: "600",
    color: C.muted,
  },
  scaleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  scaleText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  historyScore: {
    fontSize: 20,
    fontWeight: "800",
    color: C.green,
  },
}); }
