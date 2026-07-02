import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Zap, Heart } from "lucide-react-native";
import { useTheme } from "./_layout";
import type { Colors } from "@/colors";
import { t } from "@/i18n";
import { getCommunityStats } from "@/lib/auth-api";

type LiveEntry = {
  rank: number;
  name: string;
  initials: string;
  checkIns: number;
};


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

// ─── Screen ──────────────────────────────────────────────
export default function LeaderboardScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();
  const [entries, setEntries] = useState<LiveEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [fistbumpedRanks, setFistbumpedRanks] = useState<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(false);

    void getCommunityStats()
      .then((stats) => {
        if (cancelled) return;
        const hydrated = stats.leaderboard.map<LiveEntry>((row, index) => ({
          rank: index + 1,
          name: row.name,
          initials: row.initials,
          checkIns: row.checkIns,
        }));
        setEntries(hydrated);
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
  }, []);

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

        {isLoading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color={C.green} />
          </View>
        ) : loadError ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>{t("common.error")}</Text>
          </View>
        ) : entries.length === 0 ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>{t("common.empty")}</Text>
          </View>
        ) : (
          <>
            {/* Top 3 Podium */}
            <View style={styles.podium}>
              {entries.slice(0, 3).map((entry) => {
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
                        {entry.initials}
                      </Text>
                    </View>
                    <View style={[styles.rankBadge, { backgroundColor: medalColor + "25" }]}>
                      <Text style={[styles.rankText, { color: medalColor }]}>
                        {getMedalEmoji(entry.rank)}
                      </Text>
                    </View>
                    <Text style={styles.podiumName} numberOfLines={1}>
                      {entry.name.split(" ")[0]}
                    </Text>
                    <Text style={[styles.podiumScore, { color: medalColor }]}>
                      {entry.checkIns}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Full Leaderboard */}
            <FlatList
              data={entries}
              keyExtractor={(item) => String(item.rank)}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const medalColor = getMedalColor(item.rank, C);
                const isBumped = fistbumpedRanks.has(item.rank);
                return (
                  <View style={styles.entryCard}>
                    <View style={styles.entryLeft}>
                      <View style={[styles.positionBadge, { backgroundColor: medalColor + "18" }]}>
                        <Text style={[styles.positionText, { color: medalColor }]}>
                          {item.rank}
                        </Text>
                      </View>
                      <View style={styles.entryAvatar}>
                        <Text style={styles.entryInitials}>
                          {item.initials}
                        </Text>
                      </View>
                      <View style={styles.entryInfo}>
                        <Text style={styles.entryName}>
                          {item.name}
                        </Text>
                        <View style={styles.entryMeta}>
                          <Text style={styles.entryMetaText}>
                            {item.checkIns} {t("label.checkIns")}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.entryRight}>
                      <Text style={styles.entryScore}>{item.checkIns}</Text>
                      <View style={styles.prIcon}>
                        <Zap size={14} color={C.amber} strokeWidth={2} />
                      </View>
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
                    </View>
                  </View>
                );
              }}
            />
          </>
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

  // Loading / empty / error state
  stateBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  stateText: {
    fontSize: 14,
    color: C.muted,
    textAlign: "center",
  },

  // Podium
  podium: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 8,
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
  entryMetaText: {
    fontSize: 12,
    color: C.muted,
    fontWeight: "600",
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
