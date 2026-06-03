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
import { mockMembers, mockNotifications } from "@vytal-fit/shared";
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
} from "lucide-react-native";

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

// Current user (first member in mock data)
const currentUser = mockMembers[0];

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

// ─── Screen ──────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  const menuItems: MenuItemConfig[] = [
    {
      icon: <UserIcon size={20} color={C.blue} strokeWidth={1.8} />,
      label: "Dados Pessoais",
      sublabel: "Nome, email, contacto",
      color: C.blue,
      onPress: () => router.push("/settings/personal-data"),
    },
    {
      icon: <CreditCard size={20} color={C.green} strokeWidth={1.8} />,
      label: "O Meu Plano",
      sublabel: "Mensal Ilimitado",
      color: C.green,
      onPress: () => router.push("/plan-detail"),
    },
    {
      icon: <Bell size={20} color={C.amber} strokeWidth={1.8} />,
      label: "Notificacoes",
      sublabel: "Aulas, WODs, PRs",
      color: C.amber,
      onPress: () => router.push("/notifications"),
      badge: unreadCount,
    },
    {
      icon: <Timer size={20} color={C.orange} strokeWidth={1.8} />,
      label: "Timer",
      sublabel: "AMRAP, EMOM, Tabata",
      color: C.orange,
      onPress: () => router.push("/timer"),
    },
    {
      icon: <Calculator size={20} color={C.red} strokeWidth={1.8} />,
      label: "Calculadora RM",
      sublabel: "Percentagens e estimativas",
      color: C.red,
      onPress: () => router.push("/calculator"),
    },
    {
      icon: <BookOpen size={20} color={C.purple} strokeWidth={1.8} />,
      label: "Exercicios",
      sublabel: "Biblioteca de movimentos",
      color: C.purple,
      onPress: () => router.push("/exercises"),
    },
    {
      icon: <Heart size={20} color={C.red} strokeWidth={1.8} />,
      label: "Fistbumps",
      sublabel: "Reacoes e comentarios",
      color: C.red,
      onPress: () => router.push("/fistbumps"),
    },
    {
      icon: <QrCode size={20} color={C.green} strokeWidth={1.8} />,
      label: "QR Check-in",
      sublabel: "Check-in por QR code",
      color: C.green,
      onPress: () => router.push("/checkin"),
    },
    {
      icon: <MessageSquare size={20} color={C.amber} strokeWidth={1.8} />,
      label: "Feedback",
      sublabel: "Envia-nos a tua opiniao",
      color: C.amber,
      onPress: () => router.push("/feedback"),
    },
    {
      icon: <Shield size={20} color={C.purple} strokeWidth={1.8} />,
      label: "Privacidade",
      sublabel: "Visibilidade do perfil",
      color: C.purple,
      onPress: () => router.push("/settings/privacy"),
    },
    {
      icon: <Palette size={20} color={C.green} strokeWidth={1.8} />,
      label: "Tema",
      sublabel: "Escuro",
      color: C.green,
      onPress: () => router.push("/settings/theme"),
    },
    {
      icon: <Globe size={20} color={C.blue} strokeWidth={1.8} />,
      label: "Idioma",
      sublabel: "Portugues",
      color: C.blue,
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
          <Text style={styles.headerTitle}>Perfil</Text>
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {getInitials(currentUser.name)}
            </Text>
          </View>
          <Text style={styles.userName}>{currentUser.name}</Text>
          <Text style={styles.userEmail}>{currentUser.email}</Text>
          <View style={styles.memberBadge}>
            <Text style={styles.memberBadgeText}>
              Membro #{currentUser.memberNumber}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardLeft]}>
            <Text style={styles.statValue}>{currentUser.totalCheckIns}</Text>
            <Text style={styles.statLabel}>Check-ins</Text>
          </View>
          <View style={[styles.statCard, styles.statCardCenter]}>
            <Text style={[styles.statValue, { color: C.amber }]}>
              {currentUser.streakWeeks}
            </Text>
            <Text style={styles.statLabel}>Semanas</Text>
          </View>
          <View style={[styles.statCard, styles.statCardRight]}>
            <Text style={[styles.statValue, { color: C.green }]}>8</Text>
            <Text style={styles.statLabel}>PRs</Text>
          </View>
        </View>

        {/* Member Since */}
        <View style={styles.memberSince}>
          <Text style={styles.memberSinceLabel}>Membro desde</Text>
          <Text style={styles.memberSinceValue}>
            {new Date(currentUser.joinedAt).toLocaleDateString("pt-PT", {
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
          onPress={() =>
            Alert.alert("Terminar Sessao", "Tens a certeza?", [
              { text: "Cancelar", style: "cancel" },
              { text: "Sair", style: "destructive" },
            ])
          }
        >
          <LogOut size={20} color={C.red} strokeWidth={1.8} />
          <Text style={styles.logoutText}>Terminar Sessao</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.version}>Vytal v0.1.0</Text>
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
    backgroundColor: C.cardBg,
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
    backgroundColor: C.cardBg,
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
    backgroundColor: C.cardBg,
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
