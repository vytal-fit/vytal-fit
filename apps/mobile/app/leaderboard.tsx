import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { mockLeaderboard } from "@vytal-fit/shared";
import { ArrowLeft, Zap, Heart } from "lucide-react-native";
import { useTheme } from "./_layout";
import type { Colors } from "@/colors";
import { t } from "@/i18n";

const CURRENT_USER_NAME = "Jose Fonte";


function getMedalEmoji(rank: number): string {
  switch (rank) {
    case 1:
      return t("leaderboard.rank1");
    case 2:
      return t("leaderboard.rank2");
    case 3:
      return t("leaderboard.rank3");
    default:
      return t("leaderboard.rankN").replace("{n}", String(rank));
  }
}

function getMedalColor(rank: number, C: Colors): string {
  switch (rank) {
    case 1:
      return C.amber;
    case 2:
      return "#c0c0c0";
    case 3:
      return "#cd7f32";
    default:
      return C.muted;
  }
}

function getScaleLabel(scale: string): string {
  switch (scale) {
    case "rx":
      return "Rx";
    case "scaled":
      return "Scaled";
    case "rx_plus":
      return "Rx+";
    default:
      return scale;
  }
}

function getScaleColor(scale: string, C: Colors): string {
  switch (scale) {
    case "rx":
      return C.green;
    case "scaled":
      return C.blue;
    case "rx_plus":
      return C.purple;
    default:
      return C.muted;
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Screen ──────────────────────────────────────────────
export default function LeaderboardScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();
  const [fistbumpedRanks, setFistbumpedRanks] = useState<Set<number>>(new Set());

  function toggleFistbump(rank: number) {
    setFistbumpedRanks((prev) => {
      const next = new Set(prev);
      if (next.has(rank)) {
        next.delete(rank);
      } else {
        next.add(rank);
      }
      return next;
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ArrowLeft size={24} color={C.text} strokeWidth={1.8} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("leaderboard.title")}</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* WOD Title */}
        <View style={styles.wodSection}>
          <Text style={styles.wodTitle}>FRAN</Text>
          <Text style={styles.wodSubtitle}>For Time - 21-15-9 Thrusters & Pull-Ups</Text>
        </View>

        {/* Top 3 Podium */}
        <View style={styles.podium}>
          {mockLeaderboard.slice(0, 3).map((entry) => {
            const medalColor = getMedalColor(entry.rank, C);
            const isFirst = entry.rank === 1;
            return (
              <View
                key={entry.rank}
                style={[
                  styles.podiumItem,
                  isFirst && styles.podiumItemFirst,
                ]}
              >
                <View
                  style={[
                    styles.podiumAvatar,
                    { borderColor: medalColor },
                    isFirst && styles.podiumAvatarFirst,
                  ]}
                >
                  <Text
                    style={[
                      styles.podiumInitials,
                      { color: medalColor },
                      isFirst && styles.podiumInitialsFirst,
                    ]}
                  >
                    {getInitials(entry.memberName)}
                  </Text>
                </View>
                <View style={[styles.rankBadge, { backgroundColor: medalColor + "25" }]}>
                  <Text style={[styles.rankText, { color: medalColor }]}>
                    {getMedalEmoji(entry.rank)}
                  </Text>
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>
                  {entry.memberName.split(" ")[0]}
                </Text>
                <Text style={[styles.podiumScore, { color: medalColor }]}>
                  {entry.score}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Full Leaderboard */}
        <FlatList
          data={mockLeaderboard}
          keyExtractor={(item) => String(item.rank)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const medalColor = getMedalColor(item.rank, C);
            const scaleColor = getScaleColor(item.scale, C);
            const isCurrentUser = item.memberName === CURRENT_USER_NAME;
            const isBumped = fistbumpedRanks.has(item.rank);
            return (
              <View style={[
                styles.entryCard,
                isCurrentUser && styles.entryCardCurrentUser,
              ]}>
                <View style={styles.entryLeft}>
                  <View style={[styles.positionBadge, { backgroundColor: medalColor + "18" }]}>
                    <Text style={[styles.positionText, { color: medalColor }]}>
                      {item.rank}
                    </Text>
                  </View>
                  <View style={[
                    styles.entryAvatar,
                    isCurrentUser && { borderColor: C.green, borderWidth: 2 },
                  ]}>
                    <Text style={styles.entryInitials}>
                      {getInitials(item.memberName)}
                    </Text>
                  </View>
                  <View style={styles.entryInfo}>
                    <Text style={[styles.entryName, isCurrentUser && { color: C.green }]}>
                      {item.memberName}{isCurrentUser ? ` ${t("leaderboard.you")}` : ""}
                    </Text>
                    <View style={styles.entryMeta}>
                      <View style={[styles.scaleBadge, { backgroundColor: scaleColor + "18" }]}>
                        <Text style={[styles.scaleText, { color: scaleColor }]}>
                          {getScaleLabel(item.scale)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.entryRight}>
                  <Text style={styles.entryScore}>{item.score}</Text>
                  {item.isPR && (
                    <View style={styles.prIcon}>
                      <Zap size={14} color={C.amber} strokeWidth={2} />
                    </View>
                  )}
                  {!isCurrentUser && (
                    <TouchableOpacity
                      style={styles.fistbumpButton}
                      onPress={() => toggleFistbump(item.rank)}
                    >
                      <Heart
                        size={14}
                        color={isBumped ? C.red : C.muted}
                        strokeWidth={2}
                        fill={isBumped ? C.red : "none"}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
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

  // WOD Section
  wodSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    alignItems: "center",
  },
  wodTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: C.green,
    letterSpacing: 1,
  },
  wodSubtitle: {
    fontSize: 13,
    color: C.muted,
    marginTop: 4,
  },

  // Podium
  podium: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  podiumItem: {
    alignItems: "center",
    flex: 1,
  },
  podiumItemFirst: {
    marginBottom: 8,
  },
  podiumAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.surface2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  podiumAvatarFirst: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
  },
  podiumInitials: {
    fontSize: 16,
    fontWeight: "800",
  },
  podiumInitialsFirst: {
    fontSize: 20,
  },
  rankBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 4,
  },
  rankText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  podiumName: {
    fontSize: 13,
    fontWeight: "600",
    color: C.text,
    marginBottom: 2,
  },
  podiumScore: {
    fontSize: 16,
    fontWeight: "800",
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    gap: 8,
  },

  // Entry Card
  entryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
  },
  entryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  positionBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  positionText: {
    fontSize: 15,
    fontWeight: "800",
  },
  entryAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  entryInitials: {
    fontSize: 13,
    fontWeight: "700",
    color: C.green,
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    fontSize: 15,
    fontWeight: "600",
    color: C.text,
    marginBottom: 4,
  },
  entryMeta: {
    flexDirection: "row",
    gap: 6,
  },
  scaleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  scaleText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  entryRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  entryScore: {
    fontSize: 18,
    fontWeight: "800",
    color: C.text,
  },
  prIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.amber + "18",
    alignItems: "center",
    justifyContent: "center",
  },

  // Current user highlight
  entryCardCurrentUser: {
    borderColor: C.green + "40",
    backgroundColor: C.green + "08",
  },

  // Fistbump button
  fistbumpButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
}); }
