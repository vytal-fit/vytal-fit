import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { mockCoaches, mockDashboardStats } from "@vytal-fit/shared";

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

// ─── Mock News ───────────────────────────────────────────
const mockNews = [
  {
    id: "news-1",
    title: "Throwdown Interno - Sabado 14 Junho",
    body: "Inscricoes abertas para o throwdown de verao! Equipas de 2 pessoas (misto). Inscreve-te na recepcao ou pela app.",
    date: "2026-06-01",
    tag: "Evento",
    tagColor: C.amber,
  },
  {
    id: "news-2",
    title: "Novo Horario de Verao",
    body: "A partir de 15 de Junho, o horario de verao entra em vigor. Consulta os novos horarios na seccao de Aulas.",
    date: "2026-05-30",
    tag: "Info",
    tagColor: C.blue,
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

function getRoleLabel(role: string): string {
  switch (role) {
    case "head_coach":
      return "Head Coach";
    case "coach":
      return "Coach";
    case "assistant":
      return "Assistente";
    default:
      return role;
  }
}

function getRoleColor(role: string): string {
  switch (role) {
    case "head_coach":
      return C.green;
    case "coach":
      return C.blue;
    case "assistant":
      return C.purple;
    default:
      return C.muted;
  }
}

// ─── Screen ──────────────────────────────────────────────
export default function MyBoxScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Box Header */}
        <View style={styles.boxHeader}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>V</Text>
          </View>
          <View style={styles.boxInfo}>
            <Text style={styles.boxName}>Vytal CrossFit</Text>
            <Text style={styles.boxLocation}>Lisboa, Portugal</Text>
          </View>
        </View>

        {/* Quick Info Cards */}
        <View style={styles.quickInfoRow}>
          <View style={styles.quickCard}>
            <Text style={styles.quickValue}>
              {mockDashboardStats.activeMembers}
            </Text>
            <Text style={styles.quickLabel}>Membros{"\n"}Ativos</Text>
          </View>
          <View style={styles.quickCard}>
            <Text style={[styles.quickValue, { color: C.blue }]}>
              {mockDashboardStats.todayClasses}
            </Text>
            <Text style={styles.quickLabel}>Aulas{"\n"}Hoje</Text>
          </View>
          <View style={styles.quickCard}>
            <Text style={[styles.quickValue, { color: C.amber }]}>
              2h 15m
            </Text>
            <Text style={styles.quickLabel}>Proxima{"\n"}Aula</Text>
          </View>
        </View>

        {/* Occupancy */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ocupacao Hoje</Text>
            <Text style={styles.sectionBadge}>
              {mockDashboardStats.occupancyPercent}%
            </Text>
          </View>
          <View style={styles.occupancyBarBg}>
            <View
              style={[
                styles.occupancyBarFill,
                { width: `${mockDashboardStats.occupancyPercent}%` },
              ]}
            />
          </View>
          <Text style={styles.occupancyLabel}>
            {mockDashboardStats.checkInsToday} check-ins realizados hoje
          </Text>
        </View>

        {/* Coaches */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionTitleStandalone}>Equipa Tecnica</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.coachScroll}
          >
            {mockCoaches.map((coach) => {
              const roleColor = getRoleColor(coach.role);
              return (
                <View key={coach.id} style={styles.coachCard}>
                  <View
                    style={[
                      styles.coachAvatar,
                      { borderColor: roleColor },
                    ]}
                  >
                    <Text style={[styles.coachInitials, { color: roleColor }]}>
                      {getInitials(coach.name)}
                    </Text>
                  </View>
                  <Text style={styles.coachName} numberOfLines={1}>
                    {coach.name.split(" ")[0]}
                  </Text>
                  <View
                    style={[
                      styles.roleBadge,
                      { backgroundColor: roleColor + "18" },
                    ]}
                  >
                    <Text style={[styles.roleText, { color: roleColor }]}>
                      {getRoleLabel(coach.role)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* News / Announcements */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionTitleStandalone}>Noticias</Text>
          {mockNews.map((item) => (
            <TouchableOpacity key={item.id} style={styles.newsCard}>
              <View style={styles.newsHeader}>
                <View
                  style={[
                    styles.newsTag,
                    { backgroundColor: item.tagColor + "18" },
                  ]}
                >
                  <Text
                    style={[styles.newsTagText, { color: item.tagColor }]}
                  >
                    {item.tag}
                  </Text>
                </View>
                <Text style={styles.newsDate}>{item.date}</Text>
              </View>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsBody} numberOfLines={3}>
                {item.body}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollContent: {
    paddingBottom: 30,
  },

  // Box Header
  boxHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 16,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.green + "18",
    borderWidth: 2,
    borderColor: C.green,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 24,
    fontWeight: "900",
    color: C.green,
  },
  boxInfo: {
    flex: 1,
  },
  boxName: {
    fontSize: 24,
    fontWeight: "800",
    color: C.text,
    letterSpacing: -0.5,
  },
  boxLocation: {
    fontSize: 14,
    color: C.muted,
    marginTop: 2,
  },

  // Quick Info
  quickInfoRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  quickCard: {
    flex: 1,
    backgroundColor: C.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  quickValue: {
    fontSize: 24,
    fontWeight: "800",
    color: C.green,
    marginBottom: 4,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: C.muted,
    textAlign: "center",
    lineHeight: 15,
  },

  // Occupancy Section
  sectionCard: {
    marginHorizontal: 16,
    backgroundColor: C.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
  },
  sectionBadge: {
    fontSize: 16,
    fontWeight: "800",
    color: C.green,
  },
  occupancyBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: C.surface2,
    marginBottom: 8,
  },
  occupancyBarFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: C.green,
  },
  occupancyLabel: {
    fontSize: 12,
    color: C.muted,
  },

  // Coaches
  sectionWrapper: {
    marginBottom: 20,
  },
  sectionTitleStandalone: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  coachScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  coachCard: {
    alignItems: "center",
    width: 80,
  },
  coachAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.surface2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  coachInitials: {
    fontSize: 18,
    fontWeight: "800",
  },
  coachName: {
    fontSize: 13,
    fontWeight: "600",
    color: C.text,
    marginBottom: 4,
    textAlign: "center",
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // News
  newsCard: {
    marginHorizontal: 16,
    backgroundColor: C.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 10,
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
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
    marginBottom: 6,
  },
  newsBody: {
    fontSize: 14,
    color: C.muted,
    lineHeight: 20,
  },
});
