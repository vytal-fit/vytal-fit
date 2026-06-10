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
import { ArrowLeft, Award, Star } from "lucide-react-native";

import { useTheme } from "./_layout";
import type { Colors } from "@/colors";
import { t } from "@/i18n";

const nominees = [
  { id: "n-1", name: "Pedro Almeida", votes: 24 },
  { id: "n-2", name: "Ana Silva", votes: 19 },
  { id: "n-3", name: "Miguel Costa", votes: 15 },
  { id: "n-4", name: "Sofia Santos", votes: 12 },
  { id: "n-5", name: "Ines Ferreira", votes: 9 },
  { id: "n-6", name: "Tiago Neves", votes: 6 },
];

const previousWinners = [
  { id: "pw-1", name: "Marine Robba", month: "Maio 2026" },
  { id: "pw-2", name: "Ricardo Ribeiro", month: "Abril 2026" },
];

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function AthleteOfMonthScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();
  const [votedId, setVotedId] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={C.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("label.athleteOfMonth")}</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.monthBanner}>
            <Award size={24} color={C.amber} strokeWidth={2} />
            <Text style={styles.monthText}>Junho 2026</Text>
          </View>

          {/* Nominees Grid */}
          <View style={styles.grid}>
            {nominees.map((nominee) => {
              const isVoted = votedId === nominee.id;
              return (
                <View key={nominee.id} style={styles.nomineeCard}>
                  <View style={styles.nomineeAvatar}>
                    <Text style={styles.nomineeInitials}>{getInitials(nominee.name)}</Text>
                  </View>
                  <Text style={styles.nomineeName}>{nominee.name}</Text>
                  <View style={styles.voteRow}>
                    <Star size={12} color={C.amber} strokeWidth={2} fill={C.amber} />
                    <Text style={styles.voteCount}>
                      {isVoted ? nominee.votes + 1 : nominee.votes}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.voteButton, isVoted && styles.voteButtonActive]}
                    onPress={() => setVotedId(isVoted ? null : nominee.id)}
                  >
                    <Text style={[styles.voteButtonText, isVoted && styles.voteButtonTextActive]}>
                      {isVoted ? t("athleteMonth.voted") : t("athleteMonth.vote")}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          {/* Previous Winners */}
          <Text style={styles.sectionTitle}>{t("athleteMonth.previousWinners")}</Text>
          {previousWinners.map((winner) => (
            <View key={winner.id} style={styles.winnerCard}>
              <View style={styles.winnerAvatar}>
                <Text style={styles.winnerInitials}>{getInitials(winner.name)}</Text>
              </View>
              <View style={styles.winnerInfo}>
                <Text style={styles.winnerName}>{winner.name}</Text>
                <Text style={styles.winnerMonth}>{winner.month}</Text>
              </View>
              <Award size={20} color={C.amber} strokeWidth={2} />
            </View>
          ))}

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(C: Colors) { return StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backButton: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: C.text },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20, gap: 10 },
  monthBanner: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: C.amber + "15", borderRadius: 14,
    borderWidth: 1, borderColor: C.amber + "30", padding: 14,
  },
  monthText: { fontSize: 18, fontWeight: "800", color: C.amber },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  nomineeCard: {
    width: "48%", backgroundColor: C.card, borderRadius: 14,
    borderWidth: 1, borderColor: C.border, padding: 14, alignItems: "center",
  },
  nomineeAvatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: C.green + "18",
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  nomineeInitials: { fontSize: 18, fontWeight: "800", color: C.green },
  nomineeName: { fontSize: 14, fontWeight: "700", color: C.text, textAlign: "center", marginBottom: 6 },
  voteRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 10 },
  voteCount: { fontSize: 14, fontWeight: "700", color: C.amber },
  voteButton: {
    paddingVertical: 8, paddingHorizontal: 20, borderRadius: 10,
    borderWidth: 1.5, borderColor: C.green, alignItems: "center",
  },
  voteButtonActive: { backgroundColor: C.green, borderColor: C.green },
  voteButtonText: { fontSize: 12, fontWeight: "800", color: C.green, letterSpacing: 0.5 },
  voteButtonTextActive: { color: "#080c0a" },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: C.text, marginTop: 12 },
  winnerCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: C.card, borderRadius: 14, borderWidth: 1,
    borderColor: C.border, padding: 14,
  },
  winnerAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: C.amber + "18",
    alignItems: "center", justifyContent: "center",
  },
  winnerInitials: { fontSize: 14, fontWeight: "800", color: C.amber },
  winnerInfo: { flex: 1 },
  winnerName: { fontSize: 15, fontWeight: "700", color: C.text },
  winnerMonth: { fontSize: 12, color: C.muted },
}); }
