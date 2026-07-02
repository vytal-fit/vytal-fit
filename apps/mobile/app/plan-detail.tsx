import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, CreditCard } from "lucide-react-native";

// ─── Colors ──────────────────────────────────────────────
import { useTheme } from "./_layout";
import type { Colors } from "@/colors";
import { t } from "@/i18n";
import {
  listMemberSubscriptions,
  listSubscriptionPlans,
  type SubscriptionItem,
  type SubscriptionPlanItem,
} from "@/lib/auth-api";
import { useAuthStore } from "@/stores/auth-store";

function formatDate(dateStr: string | Date): string {
  const d = new Date(dateStr);
  const months = t("planDetail.months").split(",");
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// ─── Screen ──────────────────────────────────────────────
export default function PlanDetailScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();
  const { user, activeOrgId } = useAuthStore();
  const memberId = useMemo(
    () => user?.memberships.find((m) => m.organizationId === activeOrgId)?.id ?? user?.memberships[0]?.id ?? "",
    [activeOrgId, user],
  );

  const [userSub, setUserSub] = useState<SubscriptionItem | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlanItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!memberId) return;

    let cancelled = false;
    setIsLoading(true);
    setLoadError(false);

    Promise.all([listMemberSubscriptions(memberId), listSubscriptionPlans()])
      .then(([subs, plans]) => {
        if (cancelled) return;
        const active = subs.find((s) => s.status === "active") ?? subs[0] ?? null;
        setUserSub(active);
        setPlan(active ? plans.find((p) => p.id === active.planId) ?? null : null);
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
  }, [memberId]);

  if (isLoading || loadError || !userSub || !plan) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft size={24} color={C.text} strokeWidth={1.8} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t("menu.plan")}</Text>
            <View style={{ width: 44 }} />
          </View>
          <View style={styles.centerState}>
            {isLoading ? (
              <ActivityIndicator color={C.green} />
            ) : (
              <Text style={styles.centerStateText}>
                {loadError ? t("common.error") : t("common.empty")}
              </Text>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const priceNumber = typeof plan.price === "string" ? Number(plan.price) : plan.price;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={C.text} strokeWidth={1.8} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("menu.plan")}</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Plan Card */}
          <View style={styles.planCard}>
            <View style={styles.planBadge}>
              <CreditCard size={24} color={C.green} strokeWidth={1.8} />
            </View>
            <Text style={styles.planName}>{plan.name}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceValue}>{priceNumber.toFixed(2)}</Text>
              <Text style={styles.priceCurrency}>EUR</Text>
            </View>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{t("status.active")}</Text>
            </View>
          </View>

          {/* Billing Info */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t("planDetail.billingInfo")}</Text>
            <View style={styles.billingList}>
              {userSub.startDate && (
                <View style={styles.billingRow}>
                  <View style={styles.billingLeft}>
                    <Calendar size={16} color={C.muted} strokeWidth={1.8} />
                    <Text style={styles.billingLabel}>{t("planDetail.start")}</Text>
                  </View>
                  <Text style={styles.billingValue}>{formatDate(userSub.startDate)}</Text>
                </View>
              )}
              {userSub.nextBillingDate && (
                <View style={styles.billingRow}>
                  <View style={styles.billingLeft}>
                    <Calendar size={16} color={C.green} strokeWidth={1.8} />
                    <Text style={styles.billingLabel}>{t("planDetail.nextBilling")}</Text>
                  </View>
                  <Text style={[styles.billingValue, { color: C.green }]}>
                    {formatDate(userSub.nextBillingDate)}
                  </Text>
                </View>
              )}
              {userSub.endDate && (
                <View style={styles.billingRow}>
                  <View style={styles.billingLeft}>
                    <Calendar size={16} color={C.amber} strokeWidth={1.8} />
                    <Text style={styles.billingLabel}>{t("planDetail.end")}</Text>
                  </View>
                  <Text style={[styles.billingValue, { color: C.amber }]}>
                    {formatDate(userSub.endDate)}
                  </Text>
                </View>
              )}
            </View>
          </View>
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
    paddingBottom: 40,
    gap: 12,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  centerStateText: {
    fontSize: 15,
    color: C.muted,
    textAlign: "center",
  },

  // Plan Card
  planCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.green + "30",
    padding: 24,
    alignItems: "center",
  },
  planBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.green + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  planName: {
    fontSize: 24,
    fontWeight: "800",
    color: C.text,
    marginBottom: 8,
  },
  planTypeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: C.surface2,
    marginBottom: 16,
  },
  planTypeText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginBottom: 14,
  },
  priceValue: {
    fontSize: 40,
    fontWeight: "800",
    color: C.green,
    fontVariant: ["tabular-nums"],
  },
  priceCurrency: {
    fontSize: 18,
    fontWeight: "700",
    color: C.muted,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: C.green + "15",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.green,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.green,
  },

  // Section Card
  sectionCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
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
    marginBottom: 14,
  },
  sectionBadge: {
    fontSize: 16,
    fontWeight: "800",
    color: C.green,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: C.surface2,
    marginBottom: 8,
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  sessionNote: {
    fontSize: 13,
    color: C.muted,
  },

  // Class Types
  classTypeList: {
    gap: 10,
  },
  classTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  classTypeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  classTypeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  classTypeName: {
    fontSize: 15,
    fontWeight: "600",
    color: C.text,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  // Billing
  billingList: {
    gap: 14,
  },
  billingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  billingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  billingLabel: {
    fontSize: 14,
    color: C.muted,
  },
  billingValue: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
  },
}); }
