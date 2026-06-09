import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Plus, Check } from "lucide-react-native";
import { ROLE_LABELS, ROLE_COLORS } from "@vytal-fit/shared";
import { colors } from "@/colors";
import { useAuthStore } from "@/stores/auth-store";
import { t } from "@/i18n";

const C = colors;

// ─── Helpers ─────────────────────────────────────────────
function getOrgTypeLabel(type: string): string {
  switch (type) {
    case "crossfit_box":
      return "CrossFit Box";
    case "yoga_studio":
      return "Yoga Studio";
    case "weightlifting_club":
      return "Weightlifting Club";
    default:
      return type;
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

function formatJoinedAt(dateStr: string): string {
  const d = new Date(dateStr);
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

// ─── Screen ──────────────────────────────────────────────
export default function OrgSwitcherScreen() {
  const router = useRouter();
  const { user, activeOrgId, switchOrg } = useAuthStore();

  const memberships = user?.memberships ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={C.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("screen.orgSwitcher")}</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {memberships.map((membership) => {
            const isActive = membership.organizationId === activeOrgId;
            const roleColor = ROLE_COLORS[membership.role] || C.muted;
            const roleLabel = ROLE_LABELS[membership.role] || membership.role;

            return (
              <TouchableOpacity
                key={membership.id}
                style={[styles.orgCard, isActive && styles.orgCardActive]}
                onPress={() => switchOrg(membership.organizationId)}
                activeOpacity={0.8}
              >
                <View style={styles.orgCardTop}>
                  <View style={[styles.orgLogo, { borderColor: isActive ? C.green : C.border }]}>
                    <Text style={[styles.orgLogoText, { color: isActive ? C.green : C.muted }]}>
                      {getInitials(membership.organization.name)}
                    </Text>
                  </View>
                  <View style={styles.orgInfo}>
                    <View style={styles.orgNameRow}>
                      <Text style={styles.orgName}>{membership.organization.name}</Text>
                      {isActive && (
                        <View style={styles.activeDot} />
                      )}
                    </View>
                    <Text style={styles.orgType}>
                      {getOrgTypeLabel(membership.organization.type)}
                    </Text>
                  </View>
                  {isActive && (
                    <View style={styles.checkCircle}>
                      <Check size={16} color="#080c0a" strokeWidth={3} />
                    </View>
                  )}
                </View>

                <View style={styles.orgCardBottom}>
                  <View style={[styles.roleBadge, { backgroundColor: roleColor + "18" }]}>
                    <Text style={[styles.roleText, { color: roleColor }]}>
                      {roleLabel}
                    </Text>
                  </View>
                  <Text style={styles.memberSince}>
                    {t("label.since")} {formatJoinedAt(membership.joinedAt)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Add New Space */}
          <TouchableOpacity style={styles.addButton}>
            <Plus size={20} color={C.green} strokeWidth={2} />
            <Text style={styles.addButtonText}>{t("btn.addSpace")}</Text>
          </TouchableOpacity>

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

  // Org Card
  orgCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  orgCardActive: {
    borderColor: C.green + "40",
    backgroundColor: C.green + "08",
  },
  orgCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 12,
  },
  orgLogo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.surface2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  orgLogoText: {
    fontSize: 18,
    fontWeight: "800",
  },
  orgInfo: {
    flex: 1,
  },
  orgNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orgName: {
    fontSize: 17,
    fontWeight: "700",
    color: C.text,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.green,
  },
  orgType: {
    fontSize: 13,
    color: C.muted,
    marginTop: 2,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.green,
    alignItems: "center",
    justifyContent: "center",
  },
  orgCardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  memberSince: {
    fontSize: 12,
    color: C.muted,
    fontWeight: "500",
  },

  // Add Button
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.green + "40",
    borderStyle: "dashed",
    backgroundColor: C.green + "08",
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: C.green,
  },
});
