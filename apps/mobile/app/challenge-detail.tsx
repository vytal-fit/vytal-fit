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
import { ArrowLeft, Trophy, ChevronDown, ChevronUp } from "lucide-react-native";

import { useTheme } from "./_layout";
import type { Colors } from "@/colors";

const leaderboard = [
  { id: "l-1", rank: 1, name: "Pedro Almeida", score: "4:22 Rx", isYou: false },
  { id: "l-2", rank: 2, name: "Ana Silva", score: "4:35 Rx", isYou: false },
  { id: "l-3", rank: 3, name: "Miguel Costa", score: "4:48 Rx", isYou: false },
  { id: "l-4", rank: 4, name: "Jose Fonte", score: "5:01 Rx", isYou: true },
  { id: "l-5", rank: 5, name: "Sofia Santos", score: "5:15 Scaled", isYou: false },
  { id: "l-6", rank: 6, name: "Ines Ferreira", score: "5:30 Rx", isYou: false },
  { id: "l-7", rank: 7, name: "Tiago Neves", score: "6:02 Scaled", isYou: false },
  { id: "l-8", rank: 8, name: "Maria Oliveira", score: "6:18 Scaled", isYou: false },
];

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getMedalColor(rank: number, C: Colors): string | undefined {
  if (rank === 1) return C.amber;
  if (rank === 2) return C.muted;
  if (rank === 3) return "#cd7f32";
  return undefined;
}

export default function ChallengeDetailScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();
  const [rulesExpanded, setRulesExpanded] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={C.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Challenge</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Challenge Info */}
          <View style={styles.infoCard}>
            <View style={styles.trophyBox}>
              <Trophy size={28} color={C.amber} strokeWidth={2} />
            </View>
            <Text style={styles.challengeTitle}>Summer Shred Challenge</Text>
            <Text style={styles.challengeDesc}>
              6 semanas de WODs intensos. Completa todos os workouts e acumula pontos. Os 3 primeiros ganham premios!
            </Text>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>1 Jun - 12 Jul 2026</Text>
            </View>
          </View>

          {/* Leaderboard */}
          <Text style={styles.sectionTitle}>Classificacao</Text>
          {leaderboard.map((entry) => {
            const medal = getMedalColor(entry.rank, C);
            return (
              <View
                key={entry.id}
                style={[styles.leaderRow, entry.isYou && styles.leaderRowYou]}
              >
                <Text style={[styles.rank, medal ? { color: medal } : {}]}>
                  #{entry.rank}
                </Text>
                <View style={[styles.avatar, medal ? { borderColor: medal } : {}]}>
                  <Text style={[styles.avatarText, medal ? { color: medal } : {}]}>
                    {getInitials(entry.name)}
                  </Text>
                </View>
                <View style={styles.nameCol}>
                  <Text style={styles.entryName}>
                    {entry.name}{entry.isYou ? " (Tu)" : ""}
                  </Text>
                </View>
                <Text style={styles.entryScore}>{entry.score}</Text>
              </View>
            );
          })}

          {/* Register Button */}
          <TouchableOpacity style={styles.registerButton}>
            <Text style={styles.registerText}>REGISTAR RESULTADO</Text>
          </TouchableOpacity>

          {/* Rules */}
          <TouchableOpacity
            style={styles.rulesHeader}
            onPress={() => setRulesExpanded(!rulesExpanded)}
          >
            <Text style={styles.rulesTitle}>Regras</Text>
            {rulesExpanded
              ? <ChevronUp size={18} color={C.muted} strokeWidth={2} />
              : <ChevronDown size={18} color={C.muted} strokeWidth={2} />
            }
          </TouchableOpacity>
          {rulesExpanded && (
            <View style={styles.rulesBody}>
              <Text style={styles.ruleText}>1. Completa o WOD designado para cada semana.</Text>
              <Text style={styles.ruleText}>2. Submete o teu resultado ate domingo as 23:59.</Text>
              <Text style={styles.ruleText}>3. Resultados Rx recebem bonus de 10%.</Text>
              <Text style={styles.ruleText}>4. Faltar uma semana resulta em 0 pontos.</Text>
              <Text style={styles.ruleText}>5. Empates resolvidos por melhor resultado individual.</Text>
            </View>
          )}

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
  infoCard: {
    backgroundColor: C.card, borderRadius: 16, borderWidth: 1,
    borderColor: C.border, padding: 20, alignItems: "center",
  },
  trophyBox: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: C.amber + "18",
    alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  challengeTitle: { fontSize: 20, fontWeight: "800", color: C.text, marginBottom: 8 },
  challengeDesc: { fontSize: 14, color: C.muted, lineHeight: 21, textAlign: "center", marginBottom: 12 },
  dateRow: {
    backgroundColor: C.blue + "15", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
  },
  dateLabel: { fontSize: 12, fontWeight: "700", color: C.blue },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: C.text, marginTop: 8 },
  leaderRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: C.card, borderRadius: 14, borderWidth: 1,
    borderColor: C.border, padding: 14,
  },
  leaderRowYou: { borderColor: C.green + "40", backgroundColor: C.green + "08" },
  rank: { fontSize: 14, fontWeight: "800", color: C.muted, width: 30 },
  avatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface2,
    borderWidth: 2, borderColor: C.green, alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 12, fontWeight: "800", color: C.green },
  nameCol: { flex: 1 },
  entryName: { fontSize: 14, fontWeight: "600", color: C.text },
  entryScore: { fontSize: 13, fontWeight: "700", color: C.green },
  registerButton: {
    paddingVertical: 16, borderRadius: 14, backgroundColor: C.green,
    alignItems: "center", marginTop: 8,
  },
  registerText: { fontSize: 15, fontWeight: "800", color: "#080c0a", letterSpacing: 1.5 },
  rulesHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: C.card, borderRadius: 14, borderWidth: 1,
    borderColor: C.border, padding: 16,
  },
  rulesTitle: { fontSize: 15, fontWeight: "700", color: C.text },
  rulesBody: {
    backgroundColor: C.card, borderRadius: 14, borderWidth: 1,
    borderColor: C.border, padding: 16, gap: 8,
  },
  ruleText: { fontSize: 13, color: C.muted, lineHeight: 20 },
}); }
