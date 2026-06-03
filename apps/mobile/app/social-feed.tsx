import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Heart, MessageCircle, Send } from "lucide-react-native";

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

// ─── Types ───────────────────────────────────────────────
type PostType = "pr" | "result" | "checkin" | "photo";

type SocialPost = {
  id: string;
  authorName: string;
  authorInitials: string;
  timeAgo: string;
  postType: PostType;
  content: string;
  fistbumps: number;
  comments: number;
};

// ─── Helpers ─────────────────────────────────────────────
function getPostTypeBadge(type: PostType): { label: string; color: string } {
  switch (type) {
    case "pr":
      return { label: "PR", color: C.amber };
    case "result":
      return { label: "Resultado", color: C.green };
    case "checkin":
      return { label: "Check-in", color: C.blue };
    case "photo":
      return { label: "Foto", color: C.purple };
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

// ─── Mock Data ───────────────────────────────────────────
const initialPosts: SocialPost[] = [
  {
    id: "sp-1",
    authorName: "Pedro Silva",
    authorInitials: "PS",
    timeAgo: "2h",
    postType: "pr",
    content: "New PR! Back Squat 140kg (+5kg). Finalmente passei os 3 digitos no squat! Proximo objetivo: 150kg.",
    fistbumps: 18,
    comments: 6,
  },
  {
    id: "sp-2",
    authorName: "Ana Santos",
    authorInitials: "AS",
    timeAgo: "4h",
    postType: "result",
    content: "FRAN 3:52 Rx! Melhor tempo de sempre. O segredo foi manter os thrusters unbroken ate ao set de 15.",
    fistbumps: 12,
    comments: 4,
  },
  {
    id: "sp-3",
    authorName: "Miguel Costa",
    authorInitials: "MC",
    timeAgo: "5h",
    postType: "checkin",
    content: "Dia de treino feito! 5a feira consecutiva sem faltar. A consistencia paga.",
    fistbumps: 8,
    comments: 2,
  },
  {
    id: "sp-4",
    authorName: "Sofia Mendes",
    authorInitials: "SM",
    timeAgo: "8h",
    postType: "photo",
    content: "Team WOD com a malta! Nada como um bom treino de equipa para comecar o dia.",
    fistbumps: 24,
    comments: 7,
  },
  {
    id: "sp-5",
    authorName: "Ricardo Ribeiro",
    authorInitials: "RR",
    timeAgo: "1d",
    postType: "pr",
    content: "Clean & Jerk 120kg! Depois de meses a trabalhar a tecnica, finalmente subi. Obrigado Coach Andre!",
    fistbumps: 32,
    comments: 11,
  },
  {
    id: "sp-6",
    authorName: "Marine Robba",
    authorInitials: "MR",
    timeAgo: "1d",
    postType: "result",
    content: "MURPH 38:15 com colete. Primeira vez sub-40. Esta equipa puxa por nos!",
    fistbumps: 28,
    comments: 9,
  },
  {
    id: "sp-7",
    authorName: "Jose Fonte",
    authorInitials: "JF",
    timeAgo: "2d",
    postType: "checkin",
    content: "100 check-ins na box! Marco atingido. Vamos para os 200!",
    fistbumps: 42,
    comments: 15,
  },
  {
    id: "sp-8",
    authorName: "Andre Loureiro",
    authorInitials: "AL",
    timeAgo: "2d",
    postType: "photo",
    content: "Nova area de weightlifting pronta! 4 plataformas novas com bumper plates Eleiko. Venham testar!",
    fistbumps: 36,
    comments: 8,
  },
];

// ─── Screen ──────────────────────────────────────────────
export default function SocialFeedScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [fistbumpedIds, setFistbumpedIds] = useState<Set<string>>(new Set());
  const [commentingId, setCommentingId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
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
      Animated.timing(anim, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.spring(anim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== id) return post;
        const isBumped = fistbumpedIds.has(id);
        return {
          ...post,
          fistbumps: isBumped ? post.fistbumps - 1 : post.fistbumps + 1,
        };
      })
    );
    setFistbumpedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function submitComment(postId: string) {
    if (!commentText.trim()) return;
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, comments: post.comments + 1 } : post
      )
    );
    setCommentText("");
    setCommentingId(null);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={C.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comunidade</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Feed */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {posts.map((post) => {
            const badge = getPostTypeBadge(post.postType);
            const isBumped = fistbumpedIds.has(post.id);
            return (
              <View key={post.id} style={styles.postCard}>
                {/* Author Row */}
                <View style={styles.authorRow}>
                  <View style={styles.authorAvatar}>
                    <Text style={styles.authorInitials}>{post.authorInitials}</Text>
                  </View>
                  <View style={styles.authorInfo}>
                    <Text style={styles.authorName}>{post.authorName}</Text>
                    <Text style={styles.timeAgo}>{post.timeAgo}</Text>
                  </View>
                  <View style={[styles.postTypeBadge, { backgroundColor: badge.color + "18" }]}>
                    <Text style={[styles.postTypeBadgeText, { color: badge.color }]}>
                      {badge.label}
                    </Text>
                  </View>
                </View>

                {/* Content */}
                <Text style={styles.postContent}>{post.content}</Text>

                {/* Photo placeholder for photo posts */}
                {post.postType === "photo" && (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoPlaceholderText}>Foto</Text>
                  </View>
                )}

                {/* Actions */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => toggleFistbump(post.id)}
                  >
                    <Animated.View style={{ transform: [{ scale: getBounceAnim(post.id) }] }}>
                      <Heart
                        size={18}
                        color={isBumped ? C.red : C.muted}
                        strokeWidth={2}
                        fill={isBumped ? C.red : "none"}
                      />
                    </Animated.View>
                    <Text style={[styles.actionCount, isBumped && { color: C.red }]}>
                      {post.fistbumps}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setCommentingId(commentingId === post.id ? null : post.id)}
                  >
                    <MessageCircle size={18} color={commentingId === post.id ? C.green : C.muted} strokeWidth={2} />
                    <Text style={[styles.actionCount, commentingId === post.id && { color: C.green }]}>
                      {post.comments}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Inline Comment Input */}
                {commentingId === post.id && (
                  <View style={styles.commentInputRow}>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="Escreve um comentario..."
                      placeholderTextColor={C.muted}
                      value={commentText}
                      onChangeText={setCommentText}
                      autoFocus
                    />
                    <TouchableOpacity
                      style={styles.commentSendButton}
                      onPress={() => submitComment(post.id)}
                    >
                      <Send size={16} color={commentText.trim() ? C.green : C.muted} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}

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
    gap: 12,
  },

  // Post Card
  postCard: {
    backgroundColor: C.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },

  // Author
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.green + "18",
    alignItems: "center",
    justifyContent: "center",
  },
  authorInitials: {
    fontSize: 14,
    fontWeight: "800",
    color: C.green,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
  },
  timeAgo: {
    fontSize: 12,
    color: C.muted,
    marginTop: 1,
  },
  postTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  postTypeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Content
  postContent: {
    fontSize: 15,
    color: C.text,
    lineHeight: 22,
    marginBottom: 12,
  },

  // Photo
  photoPlaceholder: {
    height: 140,
    borderRadius: 12,
    backgroundColor: C.surface2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: C.muted,
    fontWeight: "500",
  },

  // Actions
  actionsRow: {
    flexDirection: "row",
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 36,
  },
  actionCount: {
    fontSize: 13,
    fontWeight: "600",
    color: C.muted,
  },

  // Comment Input
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  commentInput: {
    flex: 1,
    backgroundColor: C.surface2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: C.text,
  },
  commentSendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
});
