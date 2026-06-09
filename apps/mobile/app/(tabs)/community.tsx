import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Zap,
  Trophy,
  Star,
  Heart,
  MessageCircle,
  ChevronRight,
  TrendingUp,
  Users,
  Award,
  Flame,
  CalendarCheck,
} from "lucide-react-native";
import { colors } from "@/colors";
import { t } from "@/i18n";

const C = colors;

// ─── Types ───────────────────────────────────────────────
type FeedEventType = "pr" | "checkin" | "wod" | "milestone";

type FeedEvent = {
  id: string;
  authorName: string;
  authorInitials: string;
  eventType: FeedEventType;
  content: string;
  timeAgo: string;
  fistbumps: number;
  comments: number;
};

// ─── Mock Data ───────────────────────────────────────────
const communityStats = {
  activeMembers: 142,
  totalFistbumps: 1840,
  wodsDone: 387,
};

const feedEvents: FeedEvent[] = [
  {
    id: "fe-1",
    authorName: "Pedro Silva",
    authorInitials: "PS",
    eventType: "pr",
    content: "Novo PR! Back Squat 140kg (+5kg). Finalmente passei os 3 digitos!",
    timeAgo: "2h",
    fistbumps: 18,
    comments: 6,
  },
  {
    id: "fe-2",
    authorName: "Ana Santos",
    authorInitials: "AS",
    eventType: "wod",
    content: "WOD publicado: CrossFit Total — AMRAP 15. Vemo-nos na box!",
    timeAgo: "3h",
    fistbumps: 12,
    comments: 3,
  },
  {
    id: "fe-3",
    authorName: "Miguel Costa",
    authorInitials: "MC",
    eventType: "checkin",
    content: "Check-in #100! Marco historico atingido. Vamos para os 200!",
    timeAgo: "5h",
    fistbumps: 42,
    comments: 15,
  },
  {
    id: "fe-4",
    authorName: "Sofia Mendes",
    authorInitials: "SM",
    eventType: "pr",
    content: "FRAN 3:52 Rx! Melhor tempo de sempre. O segredo foi manter os thrusters unbroken.",
    timeAgo: "8h",
    fistbumps: 24,
    comments: 7,
  },
  {
    id: "fe-5",
    authorName: "Ricardo Ribeiro",
    authorInitials: "RR",
    eventType: "milestone",
    content: "12 semanas consecutivas sem falhar um treino. Consistencia e tudo!",
    timeAgo: "1d",
    fistbumps: 36,
    comments: 9,
  },
  {
    id: "fe-6",
    authorName: "Ines Ferreira",
    authorInitials: "IF",
    eventType: "wod",
    content: "Resultado: Deadlift 5x5 @ 120kg. Dia de forca bem passado.",
    timeAgo: "1d",
    fistbumps: 14,
    comments: 4,
  },
];

const athleteOfMonth = {
  name: "Jose Fonte",
  initials: "JF",
  checkIns: 22,
  prs: 4,
  highlight: "Melhor streak do mes",
};

// ─── Helpers ─────────────────────────────────────────────
function getEventIcon(type: FeedEventType): React.ReactNode {
  switch (type) {
    case "pr":
      return <Trophy size={14} color={C.amber} strokeWidth={2} />;
    case "checkin":
      return <CalendarCheck size={14} color={C.green} strokeWidth={2} />;
    case "wod":
      return <Flame size={14} color={C.orange} strokeWidth={2} />;
    case "milestone":
      return <Star size={14} color={C.purple} strokeWidth={2} />;
  }
}

function getEventBadge(type: FeedEventType): { label: string; color: string } {
  switch (type) {
    case "pr": return { label: "PR", color: C.amber };
    case "checkin": return { label: "Check-in", color: C.green };
    case "wod": return { label: "WOD", color: C.orange };
    case "milestone": return { label: "Marco", color: C.purple };
  }
}

// ─── Feed Card ───────────────────────────────────────────
function FeedCard({
  event,
  fistbumped,
  onFistbump,
  onPress,
  bounceAnim,
}: {
  event: FeedEvent;
  fistbumped: boolean;
  onFistbump: () => void;
  onPress: () => void;
  bounceAnim: Animated.Value;
}) {
  const badge = getEventBadge(event.eventType);

  return (
    <TouchableOpacity style={styles.feedCard} onPress={onPress} activeOpacity={0.8}>
      {/* Author row */}
      <View style={styles.feedAuthorRow}>
        <View style={styles.feedAvatar}>
          <Text style={styles.feedAvatarText}>{event.authorInitials}</Text>
        </View>
        <View style={styles.feedAuthorInfo}>
          <Text style={styles.feedAuthorName}>{event.authorName}</Text>
          <View style={styles.feedMetaRow}>
            {getEventIcon(event.eventType)}
            <Text style={styles.feedTimeAgo}>{event.timeAgo}</Text>
          </View>
        </View>
        <View style={[styles.feedBadge, { backgroundColor: badge.color + "18" }]}>
          <Text style={[styles.feedBadgeText, { color: badge.color }]}>{badge.label}</Text>
        </View>
      </View>

      {/* Content */}
      <Text style={styles.feedContent} numberOfLines={2}>{event.content}</Text>

      {/* Actions */}
      <View style={styles.feedActions}>
        <TouchableOpacity
          style={styles.feedActionBtn}
          onPress={(e) => {
            e.stopPropagation?.();
            onFistbump();
          }}
        >
          <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
            <Heart
              size={16}
              color={fistbumped ? C.red : C.muted}
              strokeWidth={2}
              fill={fistbumped ? C.red : "none"}
            />
          </Animated.View>
          <Text style={[styles.feedActionCount, fistbumped && { color: C.red }]}>
            {event.fistbumps + (fistbumped ? 1 : 0)}
          </Text>
        </TouchableOpacity>
        <View style={styles.feedActionBtn}>
          <MessageCircle size={16} color={C.muted} strokeWidth={2} />
          <Text style={styles.feedActionCount}>{event.comments}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ──────────────────────────────────────────────
export default function CommunityScreen() {
  const router = useRouter();
  const [fistbumpedIds, setFistbumpedIds] = useState<Set<string>>(new Set());
  const bounceAnims = useRef<Record<string, Animated.Value>>({}).current;

  function getBounceAnim(id: string): Animated.Value {
    if (!bounceAnims[id]) {
      bounceAnims[id] = new Animated.Value(1);
    }
    return bounceAnims[id];
  }

  function toggleFistbump(id: string) {
    const anim = getBounceAnim(id);
    Animated.sequence([
      Animated.timing(anim, { toValue: 1.35, duration: 100, useNativeDriver: true }),
      Animated.spring(anim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
    setFistbumpedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerBrandRow}>
            <View style={styles.zapCircle}>
              <Zap size={14} color={C.green} strokeWidth={2.5} fill={C.green} />
            </View>
            <Text style={styles.brandName}>myVYTAL</Text>
          </View>
          <Text style={styles.headerTitle}>{t("screen.community")}</Text>
          <Text style={styles.headerSubtitle}>{t("screen.community.subtitle")}</Text>
        </View>

        {/* Stats Strip */}
        <View style={styles.statsStrip}>
          <View style={[styles.statItem, { borderRightWidth: 1, borderRightColor: C.border }]}>
            <View style={[styles.statIconBox, { backgroundColor: C.green + "20" }]}>
              <Users size={16} color={C.green} strokeWidth={2} />
            </View>
            <Text style={[styles.statValue, { color: C.green }]}>{communityStats.activeMembers}</Text>
            <Text style={styles.statLabel}>{t("label.activeMembers")}</Text>
          </View>
          <View style={[styles.statItem, { borderRightWidth: 1, borderRightColor: C.border }]}>
            <View style={[styles.statIconBox, { backgroundColor: C.red + "20" }]}>
              <Heart size={16} color={C.red} strokeWidth={2} />
            </View>
            <Text style={[styles.statValue, { color: C.red }]}>{communityStats.totalFistbumps}</Text>
            <Text style={styles.statLabel}>{t("label.totalFistbumps")}</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIconBox, { backgroundColor: C.orange + "20" }]}>
              <Flame size={16} color={C.orange} strokeWidth={2} />
            </View>
            <Text style={[styles.statValue, { color: C.orange }]}>{communityStats.wodsDone}</Text>
            <Text style={styles.statLabel}>{t("label.wodsDone")}</Text>
          </View>
        </View>

        {/* Athlete of the Month */}
        <TouchableOpacity
          style={styles.atomCard}
          onPress={() => router.push("/athlete-of-month")}
          activeOpacity={0.85}
        >
          <View style={styles.atomLeft}>
            <View style={styles.atomCrown}>
              <Award size={18} color={C.amber} strokeWidth={2} fill={C.amber + "40"} />
            </View>
            <View style={styles.atomAvatar}>
              <Text style={styles.atomAvatarText}>{athleteOfMonth.initials}</Text>
            </View>
            <View>
              <Text style={styles.atomTitle}>{t("label.athleteOfMonth")}</Text>
              <Text style={styles.atomName}>{athleteOfMonth.name}</Text>
              <Text style={styles.atomHighlight}>{athleteOfMonth.highlight}</Text>
            </View>
          </View>
          <ChevronRight size={18} color={C.muted} strokeWidth={2} />
        </TouchableOpacity>

        {/* Explore Links */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>{t("label.communityLinks")}</Text>
        </View>
        <View style={styles.linksRow}>
          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => router.push("/leaderboard")}
          >
            <View style={[styles.linkIcon, { backgroundColor: C.amber + "20" }]}>
              <Trophy size={20} color={C.amber} strokeWidth={2} />
            </View>
            <Text style={styles.linkLabel}>{t("label.leaderboard")}</Text>
            <ChevronRight size={14} color={C.muted} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => router.push("/fistbumps")}
          >
            <View style={[styles.linkIcon, { backgroundColor: C.red + "20" }]}>
              <Heart size={20} color={C.red} strokeWidth={2} />
            </View>
            <Text style={styles.linkLabel}>{t("label.fistbump")}</Text>
            <ChevronRight size={14} color={C.muted} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.linkCard, styles.linkCardFull]}
          onPress={() => router.push("/social-feed")}
        >
          <View style={[styles.linkIcon, { backgroundColor: C.blue + "20" }]}>
            <TrendingUp size={20} color={C.blue} strokeWidth={2} />
          </View>
          <Text style={styles.linkLabel}>Feed Social Completo</Text>
          <ChevronRight size={14} color={C.muted} strokeWidth={2} />
        </TouchableOpacity>

        {/* Activity Feed */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>{t("label.activityFeed")}</Text>
          <TouchableOpacity onPress={() => router.push("/social-feed")}>
            <Text style={styles.seeAll}>{t("label.viewAll")}</Text>
          </TouchableOpacity>
        </View>

        {feedEvents.map((event) => (
          <FeedCard
            key={event.id}
            event={event}
            fistbumped={fistbumpedIds.has(event.id)}
            onFistbump={() => toggleFistbump(event.id)}
            onPress={() => router.push(`/fistbump-detail?id=${event.id}`)}
            bounceAnim={getBounceAnim(event.id)}
          />
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 36 },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  zapCircle: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: C.green + "18",
    borderWidth: 1,
    borderColor: C.green + "40",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 13,
    fontWeight: "900",
    color: C.green,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: C.text,
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  headerSubtitle: {
    fontSize: 13,
    color: C.muted,
    marginTop: 4,
    fontWeight: "500",
  },

  // Stats strip
  statsStrip: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 16,
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
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 9, fontWeight: "600", color: C.muted, letterSpacing: 0.3, textAlign: "center" },

  // Athlete of Month
  atomCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.amber + "30",
    padding: 16,
  },
  atomLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  atomCrown: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: C.amber + "18",
    alignItems: "center",
    justifyContent: "center",
  },
  atomAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.amber + "18",
    borderWidth: 2,
    borderColor: C.amber + "60",
    alignItems: "center",
    justifyContent: "center",
  },
  atomAvatarText: {
    fontSize: 15,
    fontWeight: "800",
    color: C.amber,
  },
  atomTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: C.amber,
    letterSpacing: 1,
    marginBottom: 2,
  },
  atomName: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
  },
  atomHighlight: {
    fontSize: 12,
    color: C.muted,
    marginTop: 1,
  },

  // Section header
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

  // Links
  linksRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 10,
  },
  linkCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  linkCardFull: {
    flex: 0,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  linkIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  linkLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: C.text,
  },

  // Feed Card
  feedCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
  },
  feedAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  feedAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.green + "18",
    alignItems: "center",
    justifyContent: "center",
  },
  feedAvatarText: {
    fontSize: 13,
    fontWeight: "800",
    color: C.green,
  },
  feedAuthorInfo: { flex: 1 },
  feedAuthorName: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
  },
  feedMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  feedTimeAgo: {
    fontSize: 11,
    color: C.muted,
  },
  feedBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 7,
  },
  feedBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  feedContent: {
    fontSize: 14,
    color: C.text,
    lineHeight: 20,
    marginBottom: 10,
  },
  feedActions: {
    flexDirection: "row",
    gap: 18,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
  },
  feedActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    minHeight: 32,
  },
  feedActionCount: {
    fontSize: 12,
    fontWeight: "600",
    color: C.muted,
  },
});
