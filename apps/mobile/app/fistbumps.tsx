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
import { ArrowLeft, Heart, MessageCircle, TrendingUp, Award } from "lucide-react-native";

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
  orange: "#ff8c42",
  text: "#dceee0",
  muted: "#6b8c72",
  cardBg: "rgba(22,32,24,0.9)",
  border: "rgba(61,255,110,0.1)",
};

// ─── Mock Stats ──────────────────────────────────────────
const fistbumpStats = {
  received: 87,
  sent: 64,
  commentsReceived: 23,
  commentsSent: 31,
};

const topFans = [
  { id: "f-1", name: "Pedro Almeida", reactions: 18 },
  { id: "f-2", name: "Ana Silva", reactions: 15 },
  { id: "f-3", name: "Miguel Costa", reactions: 12 },
  { id: "f-4", name: "Ines Ferreira", reactions: 9 },
  { id: "f-5", name: "Sofia Santos", reactions: 7 },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Screen ──────────────────────────────────────────────
export default function FistbumpsScreen() {
  const router = useRouter();

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
          <Text style={styles.headerTitle}>Fistbumps & Comentarios</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View
                style={[styles.statIconBox, { backgroundColor: C.green + "15" }]}
              >
                <Heart size={20} color={C.green} strokeWidth={2} />
              </View>
              <Text style={styles.statValue}>{fistbumpStats.received}</Text>
              <Text style={styles.statLabel}>Fistbumps{"\n"}recebidos</Text>
            </View>
            <View style={styles.statCard}>
              <View
                style={[styles.statIconBox, { backgroundColor: C.blue + "15" }]}
              >
                <TrendingUp size={20} color={C.blue} strokeWidth={2} />
              </View>
              <Text style={[styles.statValue, { color: C.blue }]}>
                {fistbumpStats.sent}
              </Text>
              <Text style={styles.statLabel}>Fistbumps{"\n"}enviados</Text>
            </View>
            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconBox,
                  { backgroundColor: C.amber + "15" },
                ]}
              >
                <MessageCircle size={20} color={C.amber} strokeWidth={2} />
              </View>
              <Text style={[styles.statValue, { color: C.amber }]}>
                {fistbumpStats.commentsReceived}
              </Text>
              <Text style={styles.statLabel}>Comentarios{"\n"}recebidos</Text>
            </View>
            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconBox,
                  { backgroundColor: C.purple + "15" },
                ]}
              >
                <MessageCircle size={20} color={C.purple} strokeWidth={2} />
              </View>
              <Text style={[styles.statValue, { color: C.purple }]}>
                {fistbumpStats.commentsSent}
              </Text>
              <Text style={styles.statLabel}>Comentarios{"\n"}enviados</Text>
            </View>
          </View>

          {/* Top Fans */}
          <Text style={styles.sectionTitle}>Os teus fas</Text>
          <Text style={styles.sectionSubtitle}>
            Quem te deu mais reacoes
          </Text>
          {topFans.map((fan, index) => (
            <View key={fan.id} style={styles.fanCard}>
              <View style={styles.fanLeft}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <View
                  style={[
                    styles.fanAvatar,
                    index === 0 && { borderColor: C.amber },
                    index === 1 && { borderColor: C.muted },
                    index === 2 && { borderColor: C.orange },
                  ]}
                >
                  <Text
                    style={[
                      styles.fanInitials,
                      index === 0 && { color: C.amber },
                      index === 1 && { color: C.muted },
                      index === 2 && { color: C.orange },
                    ]}
                  >
                    {getInitials(fan.name)}
                  </Text>
                </View>
                <Text style={styles.fanName}>{fan.name}</Text>
              </View>
              <View style={styles.fanReactions}>
                <Heart
                  size={14}
                  color={C.green}
                  strokeWidth={2}
                  fill={C.green}
                />
                <Text style={styles.fanCount}>{fan.reactions}</Text>
              </View>
            </View>
          ))}

          <View style={{ height: 30 }} />
        </ScrollView>
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
    gap: 10,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  statCard: {
    width: "48%",
    backgroundColor: C.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    alignItems: "center",
  },
  statIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    color: C.green,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: C.muted,
    textAlign: "center",
    lineHeight: 15,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  // Section
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
    marginTop: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: C.muted,
    marginBottom: 6,
  },

  // Fan Card
  fanCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
  },
  fanLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  rankBadge: {
    width: 28,
    alignItems: "center",
  },
  rankText: {
    fontSize: 13,
    fontWeight: "800",
    color: C.muted,
  },
  fanAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface2,
    borderWidth: 2,
    borderColor: C.green,
    alignItems: "center",
    justifyContent: "center",
  },
  fanInitials: {
    fontSize: 14,
    fontWeight: "800",
    color: C.green,
  },
  fanName: {
    fontSize: 15,
    fontWeight: "600",
    color: C.text,
  },
  fanReactions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.green + "12",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  fanCount: {
    fontSize: 14,
    fontWeight: "700",
    color: C.green,
  },
});
