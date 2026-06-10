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
import { ArrowLeft } from "lucide-react-native";

import { useTheme } from "./_layout";
import type { Colors } from "@/colors";
import { t } from "@/i18n";

interface NotifCategory {
  titleKey: string;
  items: { key: string; labelKey: string }[];
}

const categories: NotifCategory[] = [
  {
    titleKey: "notifPrefs.catBookings",
    items: [
      { key: "booking_confirm", labelKey: "notifPrefs.bookingConfirm" },
      { key: "booking_cancel", labelKey: "notifPrefs.bookingCancel" },
      { key: "booking_reminder", labelKey: "notifPrefs.bookingReminder" },
      { key: "waitlist_spot", labelKey: "notifPrefs.waitlistSpot" },
    ],
  },
  {
    titleKey: "notifPrefs.catWorkouts",
    items: [
      { key: "wod_published", labelKey: "notifPrefs.wodPublished" },
      { key: "pr_achieved", labelKey: "notifPrefs.prAchieved" },
    ],
  },
  {
    titleKey: "notifPrefs.catSocial",
    items: [
      { key: "fistbumps", labelKey: "notifPrefs.fistbumps" },
      { key: "comments", labelKey: "notifPrefs.comments" },
      { key: "birthdays", labelKey: "notifPrefs.birthdays" },
    ],
  },
  {
    titleKey: "notifPrefs.catPayments",
    items: [
      { key: "payment_success", labelKey: "notifPrefs.paymentSuccess" },
      { key: "payment_failed", labelKey: "notifPrefs.paymentFailed" },
      { key: "receipt", labelKey: "notifPrefs.receipt" },
    ],
  },
  {
    titleKey: "notifPrefs.catChallenges",
    items: [
      { key: "medal_earned", labelKey: "notifPrefs.medalEarned" },
      { key: "ranking_update", labelKey: "notifPrefs.rankingUpdate" },
    ],
  },
];

export default function NotificationPrefsScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const cat of categories) {
      for (const item of cat.items) {
        initial[item.key] = true;
      }
    }
    return initial;
  });

  function toggle(key: string) {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={C.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("screen.notifications")}</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {categories.map((cat) => (
            <View key={cat.titleKey} style={styles.categoryCard}>
              <Text style={styles.categoryTitle}>{t(cat.titleKey)}</Text>
              {cat.items.map((item, idx) => (
                <View
                  key={item.key}
                  style={[
                    styles.itemRow,
                    idx < cat.items.length - 1 && styles.itemBorder,
                  ]}
                >
                  <Text style={styles.itemLabel}>{t(item.labelKey)}</Text>
                  <TouchableOpacity
                    onPress={() => toggle(item.key)}
                    style={[
                      styles.toggleTrack,
                      toggles[item.key] ? styles.toggleOn : styles.toggleOff,
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        toggles[item.key] ? styles.thumbOn : styles.thumbOff,
                      ]}
                    />
                  </TouchableOpacity>
                </View>
              ))}
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
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20, gap: 12 },
  categoryCard: {
    backgroundColor: C.card, borderRadius: 16, borderWidth: 1,
    borderColor: C.border, padding: 16,
  },
  categoryTitle: {
    fontSize: 14, fontWeight: "800", color: C.green, letterSpacing: 0.5,
    textTransform: "uppercase", marginBottom: 14,
  },
  itemRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 12,
  },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  itemLabel: { fontSize: 15, color: C.text, fontWeight: "500", flex: 1 },
  toggleTrack: {
    width: 48, height: 28, borderRadius: 14, justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleOn: { backgroundColor: C.green },
  toggleOff: { backgroundColor: C.surface2 },
  toggleThumb: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: "white",
  },
  thumbOn: { alignSelf: "flex-end" },
  thumbOff: { alignSelf: "flex-start" },
}); }
