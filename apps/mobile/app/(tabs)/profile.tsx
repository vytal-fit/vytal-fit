import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { mockNotifications } from "@vytal-fit/shared";
import {
  User as UserIcon,
  CreditCard,
  Bell,
  Shield,
  Palette,
  Globe,
  ChevronRight,
  LogOut,
  Timer,
  Calculator,
  BookOpen,
  Heart,
  MessageSquare,
  QrCode,
  History,
  MapPin,
  Mail,
} from "lucide-react-native";
import { colors } from "@/colors";
import { useAuthStore } from "@/stores/auth-store";
import { useAppStore } from "@/stores/app-store";
import { t, setLanguage } from "@/i18n";

const C = colors;

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Menu Items ──────────────────────────────────────────
type MenuItemConfig = {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  color?: string;
  onPress?: () => void;
  badge?: number;
};

function MenuItem({ item }: { item: MenuItemConfig }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={item.onPress}>
      <View style={styles.menuLeft}>
        <View style={[styles.menuIconBox, { backgroundColor: (item.color || C.muted) + "15" }]}>
          {item.icon}
          {item.badge != null && item.badge > 0 && (
            <View style={styles.menuBadge}>
              <Text style={styles.menuBadgeText}>{item.badge}</Text>
            </View>
          )}
        </View>
        <View>
          <Text style={styles.menuLabel}>{item.label}</Text>
          {item.sublabel && (
            <Text style={styles.menuSublabel}>{item.sublabel}</Text>
          )}
        </View>
      </View>
      <ChevronRight size={18} color={C.muted} strokeWidth={2} />
    </TouchableOpacity>
  );
}

// Language labels for sublabel display
const LANGUAGE_LABELS: Record<string, string> = {
  pt: "Portugues",
  en: "English",
  es: "Espanol",
};

// Theme labels for sublabel display
const THEME_LABELS: Record<string, string> = {
  dark: "Escuro",
  light: "Claro",
};

// ─── Screen ──────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { theme, language, setLanguage: setAppLanguage } = useAppStore();
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  // Get user info from auth store, fallback to defaults
  const userName = user?.user.name ?? "Utilizador";
  const userEmail = user?.user.email ?? "";
  const memberNumber = user?.memberships[0]?.memberNumber ?? 0;
  const totalCheckIns = 47; // POC static
  const streakWeeks = 12;   // POC static
  const joinedAt = user?.memberships[0]?.joinedAt ?? "2024-01-15";

  function handleLanguageCycle() {
    const langs: Array<"pt" | "en" | "es"> = ["pt", "en", "es"];
    const currentIdx = langs.indexOf(language);
    const nextLang = langs[(currentIdx + 1) % langs.length];
    setAppLanguage(nextLang);
    setLanguage(nextLang);
  }

  function handleLogout() {
    Alert.alert(t("alert.logout"), t("alert.logoutConfirm"), [
      { text: t("btn.cancel"), style: "cancel" },
      {
        text: t("btn.logout"),
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/login");
        },
      },
    ]);
  }

  const menuItems: MenuItemConfig[] = [
    {
      icon: <UserIcon size={20} color={C.blue} strokeWidth={1.8} />,
      label: t("menu.personalData"),
      sublabel: t("menu.personalData.sub"),
      color: C.blue,
      onPress: () => router.push("/settings/personal-data"),
    },
    {
      icon: <CreditCard size={20} color={C.green} strokeWidth={1.8} />,
      label: t("menu.plan"),
      sublabel: t("menu.plan.sub"),
      color: C.green,
      onPress: () => router.push("/plan-detail"),
    },
    {
      icon: <History size={20} color={C.orange} strokeWidth={1.8} />,
      label: t("menu.classHistory"),
      sublabel: t("menu.classHistory.sub"),
      color: C.orange,
      onPress: () => router.push("/booking-history"),
    },
    {
      icon: <MapPin size={20} color={C.blue} strokeWidth={1.8} />,
      label: t("menu.dropin"),
      sublabel: t("menu.dropin.sub"),
      color: C.blue,
      onPress: () => router.push("/dropin"),
    },
    {
      icon: <Bell size={20} color={C.amber} strokeWidth={1.8} />,
      label: t("menu.notifications"),
      sublabel: t("menu.notifications.sub"),
      color: C.amber,
      onPress: () => router.push("/notifications"),
      badge: unreadCount,
    },
    {
      icon: <Timer size={20} color={C.orange} strokeWidth={1.8} />,
      label: t("menu.timer"),
      sublabel: t("menu.timer.sub"),
      color: C.orange,
      onPress: () => router.push("/timer"),
    },
    {
      icon: <Calculator size={20} color={C.red} strokeWidth={1.8} />,
      label: t("menu.calculator"),
      sublabel: t("menu.calculator.sub"),
      color: C.red,
      onPress: () => router.push("/calculator"),
    },
    {
      icon: <BookOpen size={20} color={C.purple} strokeWidth={1.8} />,
      label: t("menu.exercises"),
      sublabel: t("menu.exercises.sub"),
      color: C.purple,
      onPress: () => router.push("/exercises"),
    },
    {
      icon: <Heart size={20} color={C.red} strokeWidth={1.8} />,
      label: t("menu.fistbumps"),
      sublabel: t("menu.fistbumps.sub"),
      color: C.red,
      onPress: () => router.push("/fistbumps"),
    },
    {
      icon: <QrCode size={20} color={C.green} strokeWidth={1.8} />,
      label: t("menu.qrCheckin"),
      sublabel: t("menu.qrCheckin.sub"),
      color: C.green,
      onPress: () => router.push("/checkin"),
    },
    {
      icon: <Mail size={20} color={C.blue} strokeWidth={1.8} />,
      label: t("menu.messages"),
      sublabel: t("menu.messages.sub"),
      color: C.blue,
      onPress: () => router.push("/chat"),
    },
    {
      icon: <MessageSquare size={20} color={C.amber} strokeWidth={1.8} />,
      label: t("menu.feedback"),
      sublabel: t("menu.feedback.sub"),
      color: C.amber,
      onPress: () => router.push("/feedback"),
    },
    {
      icon: <Shield size={20} color={C.purple} strokeWidth={1.8} />,
      label: t("menu.privacy"),
      sublabel: t("menu.privacy.sub"),
      color: C.purple,
      onPress: () => router.push("/settings/privacy"),
    },
    {
      icon: <Palette size={20} color={C.green} strokeWidth={1.8} />,
      label: t("menu.theme"),
      sublabel: THEME_LABELS[theme] || theme,
      color: C.green,
      onPress: () => router.push("/settings/theme"),
    },
    {
      icon: <Globe size={20} color={C.blue} strokeWidth={1.8} />,
      label: t("menu.language"),
      sublabel: LANGUAGE_LABELS[language] || language,
      color: C.blue,
      onPress: handleLanguageCycle,
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t("screen.profile")}</Text>
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {getInitials(userName)}
            </Text>
          </View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
          <TouchableOpacity
            style={styles.memberBadge}
            onPress={() => router.push("/org-switcher")}
          >
            <Text style={styles.memberBadgeText}>
              {t("label.memberNumber")}{memberNumber} {">"} {t("label.switchSpace")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardLeft]}>
            <Text style={styles.statValue}>{totalCheckIns}</Text>
            <Text style={styles.statLabel}>{t("label.checkIns")}</Text>
          </View>
          <View style={[styles.statCard, styles.statCardCenter]}>
            <Text style={[styles.statValue, { color: C.amber }]}>
              {streakWeeks}
            </Text>
            <Text style={styles.statLabel}>{t("label.weeks")}</Text>
          </View>
          <View style={[styles.statCard, styles.statCardRight]}>
            <Text style={[styles.statValue, { color: C.green }]}>8</Text>
            <Text style={styles.statLabel}>{t("label.prs")}</Text>
          </View>
        </View>

        {/* Member Since */}
        <View style={styles.memberSince}>
          <Text style={styles.memberSinceLabel}>{t("label.memberSince")}</Text>
          <Text style={styles.memberSinceValue}>
            {new Date(joinedAt).toLocaleDateString("pt-PT", {
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, i) => (
            <MenuItem key={i} item={item} />
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LogOut size={20} color={C.red} strokeWidth={1.8} />
          <Text style={styles.logoutText}>{t("btn.logout")}</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.version}>{t("misc.version")}</Text>
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
    paddingBottom: 40,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: C.text,
    letterSpacing: -0.5,
  },

  // Avatar
  avatarSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: C.green + "18",
    borderWidth: 3,
    borderColor: C.green,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "800",
    color: C.green,
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: C.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: C.muted,
    marginBottom: 10,
  },
  memberBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: C.green + "15",
  },
  memberBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.green,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 18,
    alignItems: "center",
  },
  statCardLeft: {
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    borderRightWidth: 0,
  },
  statCardCenter: {
    borderRadius: 0,
  },
  statCardRight: {
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    borderLeftWidth: 0,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: C.blue,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: C.muted,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Member Since
  memberSince: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  memberSinceLabel: {
    fontSize: 14,
    color: C.muted,
    fontWeight: "500",
  },
  memberSinceValue: {
    fontSize: 14,
    color: C.text,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  // Menu
  menuSection: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  menuBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: C.red,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  menuBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#fff",
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: C.text,
  },
  menuSublabel: {
    fontSize: 12,
    color: C.muted,
    marginTop: 1,
  },

  // Logout
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.red + "40",
    backgroundColor: C.red + "08",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "700",
    color: C.red,
  },

  // Version
  version: {
    textAlign: "center",
    fontSize: 12,
    color: C.muted,
    marginTop: 20,
    opacity: 0.6,
  },
});
