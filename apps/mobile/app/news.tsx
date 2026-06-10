import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Heart, MessageCircle, Image } from "lucide-react-native";

// ─── Colors ──────────────────────────────────────────────
import { useTheme } from "./_layout";
import type { Colors } from "@/colors";

// ─── Mock News ───────────────────────────────────────────
const initialNews = [
  {
    id: "news-1",
    title: "Throwdown Interno — Sábado 14 Junho",
    body: "Inscrições abertas para o throwdown de verão! Equipas de 2 pessoas (misto). Inscreve-te na receção ou pela app. Prémios para os 3 primeiros classificados. Vamos ter food trucks e música ao vivo!",
    author: "Andre Loureiro",
    date: "2026-06-01",
    tag: "Evento",
    tagColor: "amber" as keyof Colors,
    likes: 24,
    comments: 8,
    hasPhoto: true,
  },
  {
    id: "news-2",
    title: "Novo Horário de Verão",
    body: "A partir de 15 de Junho, o horário de verão entra em vigor. A aula das 21:00 passa para as 20:30. Nova aula de Open Gym aos sábados das 11:00-13:00. Consulta os novos horários na secção de Aulas.",
    author: "Marine Robba",
    date: "2026-05-30",
    tag: "Info",
    tagColor: "blue" as keyof Colors,
    likes: 15,
    comments: 3,
    hasPhoto: false,
  },
  {
    id: "news-3",
    title: "Manutenção do Rower #4",
    body: "O Concept2 rower #4 está em manutenção até quarta-feira. Usem os restantes equipamentos. Obrigado pela compreensão.",
    author: "Ricardo Ribeiro",
    date: "2026-05-28",
    tag: "Aviso",
    tagColor: "red" as keyof Colors,
    likes: 3,
    comments: 1,
    hasPhoto: false,
  },
  {
    id: "news-4",
    title: "Parabéns aos atletas do Regional!",
    body: "A nossa equipa ficou em 5.º lugar no CrossFit Regional! Pedro, Ana e Miguel representaram a box com imenso orgulho. Obrigado pelo apoio de todos!",
    author: "Andre Loureiro",
    date: "2026-05-25",
    tag: "Destaque",
    tagColor: "green" as keyof Colors,
    likes: 42,
    comments: 12,
    hasPhoto: true,
  },
  {
    id: "news-5",
    title: "Workshop de Olímpicos — 21 Junho",
    body: "Workshop de técnica de movimentos olímpicos com o Coach Ricardo. Snatch e Clean & Jerk. Vagas limitadas a 12 pessoas. Custo: 25 EUR membros / 40 EUR não-membros.",
    author: "Ricardo Ribeiro",
    date: "2026-05-22",
    tag: "Workshop",
    tagColor: "purple" as keyof Colors,
    likes: 18,
    comments: 5,
    hasPhoto: false,
  },
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
export default function NewsScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();
  const [news, setNews] = useState(initialNews);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  function toggleLike(id: string) {
    setNews((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const isLiked = likedIds.has(id);
        return {
          ...item,
          likes: isLiked ? item.likes - 1 : item.likes + 1,
        };
      })
    );
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

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
          <Text style={styles.headerTitle}>Noticias</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {news.map((item) => {
            const isLiked = likedIds.has(item.id);
            return (
              <View key={item.id} style={styles.newsCard}>
                {/* Tag + Date */}
                <View style={styles.newsHeader}>
                  <View
                    style={[
                      styles.newsTag,
                      { backgroundColor: C[item.tagColor] + "18" },
                    ]}
                  >
                    <Text
                      style={[styles.newsTagText, { color: C[item.tagColor] }]}
                    >
                      {item.tag}
                    </Text>
                  </View>
                  <Text style={styles.newsDate}>{item.date}</Text>
                </View>

                {/* Title */}
                <Text style={styles.newsTitle}>{item.title}</Text>

                {/* Photo Placeholder */}
                {item.hasPhoto && (
                  <View style={styles.photoPlaceholder}>
                    <Image size={28} color={C.muted} strokeWidth={1.5} />
                    <Text style={styles.photoText}>Foto</Text>
                  </View>
                )}

                {/* Body */}
                <Text style={styles.newsBody}>{item.body}</Text>

                {/* Author */}
                <View style={styles.authorRow}>
                  <View style={styles.authorAvatar}>
                    <Text style={styles.authorInitials}>
                      {getInitials(item.author)}
                    </Text>
                  </View>
                  <Text style={styles.authorName}>{item.author}</Text>
                </View>

                {/* Actions */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => toggleLike(item.id)}
                  >
                    <Heart
                      size={18}
                      color={isLiked ? C.red : C.muted}
                      strokeWidth={2}
                      fill={isLiked ? C.red : "none"}
                    />
                    <Text
                      style={[
                        styles.actionCount,
                        isLiked && { color: C.red },
                      ]}
                    >
                      {item.likes}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <MessageCircle
                      size={18}
                      color={C.muted}
                      strokeWidth={2}
                    />
                    <Text style={styles.actionCount}>{item.comments}</Text>
                  </TouchableOpacity>
                </View>
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

  // News Card
  newsCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  newsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  newsTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  newsTagText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  newsDate: {
    fontSize: 12,
    color: C.muted,
  },
  newsTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: C.text,
    marginBottom: 10,
  },

  // Photo
  photoPlaceholder: {
    height: 160,
    borderRadius: 12,
    backgroundColor: C.surface2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    gap: 6,
  },
  photoText: {
    fontSize: 12,
    color: C.muted,
    fontWeight: "500",
  },

  // Body
  newsBody: {
    fontSize: 14,
    color: C.muted,
    lineHeight: 21,
    marginBottom: 12,
  },

  // Author
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  authorAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.green + "18",
    alignItems: "center",
    justifyContent: "center",
  },
  authorInitials: {
    fontSize: 11,
    fontWeight: "800",
    color: C.green,
  },
  authorName: {
    fontSize: 13,
    fontWeight: "600",
    color: C.text,
  },

  // Actions
  actionsRow: {
    flexDirection: "row",
    gap: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 44,
  },
  actionCount: {
    fontSize: 13,
    fontWeight: "600",
    color: C.muted,
  },
}); }
