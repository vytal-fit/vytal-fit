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
import { ArrowLeft, Mail, Check } from "lucide-react-native";

// ─── Colors ──────────────────────────────────────────────
import { useTheme } from "./_layout";
import type { Colors } from "@/colors";

// ─── Mock Birthdays ─────────────────────────────────────
const todayBirthdays = [
  { id: "b-1", name: "Ana Silva", age: 29 },
  { id: "b-2", name: "Pedro Almeida", age: 33 },
];

const upcomingBirthdays = [
  { id: "b-3", name: "Miguel Costa", age: 27, daysUntil: 2 },
  { id: "b-4", name: "Sofia Santos", age: 25, daysUntil: 4 },
  { id: "b-5", name: "Ines Ferreira", age: 31, daysUntil: 6 },
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
export default function BirthdaysScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();
  const [sentIds, setSentIds] = useState<string[]>([]);

  function handleSendMessage(id: string) {
    setSentIds((prev) => [...prev, id]);
    setTimeout(() => {
      setSentIds((prev) => prev.filter((sid) => sid !== id));
    }, 2000);
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
          <Text style={styles.headerTitle}>Aniversarios</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Today's Birthdays */}
          <View style={styles.todaySection}>
            <View style={styles.todayHeader}>
              <Text style={styles.partyEmoji}>
                {String.fromCodePoint(0x1f389)}
              </Text>
              <Text style={styles.todaySectionTitle}>Hoje</Text>
            </View>

            {todayBirthdays.map((person) => (
              <View key={person.id} style={styles.birthdayCard}>
                <View style={styles.birthdayLeft}>
                  <View style={styles.todayAvatar}>
                    <Text style={styles.todayAvatarText}>
                      {getInitials(person.name)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.birthdayName}>{person.name}</Text>
                    <Text style={styles.birthdayAge}>
                      Faz {person.age} anos hoje!{" "}
                      {String.fromCodePoint(0x1f382)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.sendButton, sentIds.includes(person.id) && styles.sendButtonSent]}
                  onPress={() => handleSendMessage(person.id)}
                  disabled={sentIds.includes(person.id)}
                >
                  {sentIds.includes(person.id) ? (
                    <>
                      <Check size={16} color="#080c0a" strokeWidth={2.5} />
                      <Text style={styles.sendButtonText}>Enviado</Text>
                    </>
                  ) : (
                    <>
                      <Mail size={16} color="#080c0a" strokeWidth={2.5} />
                      <Text style={styles.sendButtonText}>Enviar</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Upcoming */}
          <Text style={styles.sectionTitle}>Esta semana</Text>
          {upcomingBirthdays.map((person) => (
            <View key={person.id} style={styles.upcomingCard}>
              <View style={styles.birthdayLeft}>
                <View style={styles.upcomingAvatar}>
                  <Text style={styles.upcomingAvatarText}>
                    {getInitials(person.name)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.birthdayName}>{person.name}</Text>
                  <Text style={styles.upcomingDays}>
                    Daqui a {person.daysUntil} dias - Faz {person.age} anos
                  </Text>
                </View>
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
    gap: 10,
  },

  // Today Section
  todaySection: {
    backgroundColor: C.green + "08",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.green + "25",
    padding: 16,
    gap: 12,
  },
  todayHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  partyEmoji: {
    fontSize: 22,
  },
  todaySectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: C.green,
  },

  // Birthday Card
  birthdayCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.green + "20",
    padding: 14,
  },
  birthdayLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  todayAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.green + "18",
    borderWidth: 2,
    borderColor: C.green,
    alignItems: "center",
    justifyContent: "center",
  },
  todayAvatarText: {
    fontSize: 16,
    fontWeight: "800",
    color: C.green,
  },
  birthdayName: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
    marginBottom: 2,
  },
  birthdayAge: {
    fontSize: 13,
    color: C.green,
    fontWeight: "500",
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.green,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sendButtonSent: {
    backgroundColor: C.blue,
  },
  sendButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#080c0a",
  },

  // Section
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 4,
  },

  // Upcoming
  upcomingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
  },
  upcomingAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.surface2,
    borderWidth: 1.5,
    borderColor: C.muted + "40",
    alignItems: "center",
    justifyContent: "center",
  },
  upcomingAvatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: C.muted,
  },
  upcomingDays: {
    fontSize: 12,
    color: C.muted,
    fontWeight: "500",
  },
}); }
