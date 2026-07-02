import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Heart, MessageCircle, Send } from "lucide-react-native";

// ─── Colors ──────────────────────────────────────────────
import { useTheme } from "./_layout";
import type { Colors } from "@/colors";
import { t } from "@/i18n";
import {
  addCommunityComment,
  getCommunityFeed,
  reactToPost,
  type CommunityFeedItem,
} from "@/lib/auth-api";

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
function getPostTypeBadge(type: PostType, C: Colors): { label: string; color: string } {
  switch (type) {
    case "pr":
      return { label: "PR", color: C.amber };
    case "result":
      return { label: t("socialFeed.result"), color: C.green };
    case "checkin":
      return { label: "Check-in", color: C.blue };
    case "photo":
      return { label: t("socialFeed.photo"), color: C.purple };
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

/** Map a stored community-post `kind` to the feed post badge/type. */
function kindToPostType(kind: string): PostType {
  switch (kind) {
    case "auto_pr":
      return "pr";
    case "auto_wod":
      return "result";
    case "announcement":
    case "auto_milestone":
      return "checkin";
    default:
      return "checkin";
  }
}

function timeAgoFrom(iso: string | Date): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const mins = Math.max(0, Math.floor(diffMs / 60000));
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function toSocialPost(item: CommunityFeedItem): SocialPost {
  return {
    id: item.id,
    authorName: item.authorName,
    authorInitials: getInitials(item.authorName),
    timeAgo: timeAgoFrom(item.createdAt),
    postType: kindToPostType(item.kind),
    content: item.content,
    fistbumps: item.fistbumps,
    comments: item.commentCount,
  };
}

// ─── Screen ──────────────────────────────────────────────
export default function SocialFeedScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [fistbumpedIds, setFistbumpedIds] = useState<Set<string>>(new Set());
  const [commentingId, setCommentingId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const bounceAnims = useRef<Record<string, Animated.Value>>({}).current;

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(false);

    void getCommunityFeed()
      .then((feed) => {
        if (cancelled) return;
        // Base fistbump count excludes the viewer's own reaction; the card
        // re-adds +1 while `fistbumpedIds` holds the id.
        setPosts(
          feed.map((item) => {
            const post = toSocialPost(item);
            return {
              ...post,
              fistbumps: Math.max(0, item.fistbumps - (item.hasReacted ? 1 : 0)),
            };
          }),
        );
        setFistbumpedIds(new Set(feed.filter((f) => f.hasReacted).map((f) => f.id)));
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

    const wasBumped = fistbumpedIds.has(id);
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== id) return post;
        return {
          ...post,
          fistbumps: wasBumped ? post.fistbumps - 1 : post.fistbumps + 1,
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

    void reactToPost(id).catch(() => {
      // Revert optimistic update on failure.
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== id) return post;
          return {
            ...post,
            fistbumps: wasBumped ? post.fistbumps + 1 : post.fistbumps - 1,
          };
        })
      );
      setFistbumpedIds((prev) => {
        const next = new Set(prev);
        if (wasBumped) next.add(id);
        else next.delete(id);
        return next;
      });
    });
  }

  function submitComment(postId: string) {
    const text = commentText.trim();
    if (!text) return;
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, comments: post.comments + 1 } : post
      )
    );
    setCommentText("");
    setCommentingId(null);
    void addCommunityComment(postId, text).catch(() => {
      // Revert optimistic comment count on failure.
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, comments: Math.max(0, post.comments - 1) } : post
        )
      );
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={C.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("screen.community")}</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Feed */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {isLoading ? (
            <View style={styles.feedStateBox}>
              <ActivityIndicator color={C.green} />
            </View>
          ) : loadError ? (
            <View style={styles.feedStateBox}>
              <Text style={styles.feedStateText}>{t("alert.error")}</Text>
            </View>
          ) : posts.length === 0 ? (
            <View style={styles.feedStateBox}>
              <Text style={styles.feedStateText}>{t("community.feedEmpty")}</Text>
            </View>
          ) : (
            posts.map((post) => {
            const badge = getPostTypeBadge(post.postType, C);
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
                    <Text style={styles.photoPlaceholderText}>{t("socialFeed.photo")}</Text>
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
                      placeholder={t("socialFeed.commentPlaceholder")}
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
          })
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
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

  // Scroll
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },

  // Feed loading / empty / error state
  feedStateBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  feedStateText: {
    fontSize: 14,
    color: C.muted,
    textAlign: "center",
  },

  // Post Card
  postCard: {
    backgroundColor: C.card,
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
}); }
