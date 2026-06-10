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
import { mockSubscriptions, mockClassTypes } from "@vytal-fit/shared";
import { ArrowLeft, Check, Calendar, CreditCard } from "lucide-react-native";

// ─── Colors ──────────────────────────────────────────────
import { useTheme } from "./_layout";
import type { Colors } from "@/colors";

// Current user's subscription (first one, member m-1)
const userSub = mockSubscriptions.find((s) => s.memberId === "m-1")!;
const plan = userSub.plan;

function getTypeLabel(type: string): string {
  switch (type) {
    case "monthly":
      return "Mensal";
    case "quarterly":
      return "Trimestral";
    case "semester":
      return "Semestral";
    case "annual":
      return "Anual";
    case "session_pack":
      return "Pack Sessoes";
    case "day_pass":
      return "Day Pass";
    case "trial":
      return "Trial";
    default:
      return type;
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// ─── Screen ──────────────────────────────────────────────
export default function PlanDetailScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();

  const allowedTypes = mockClassTypes.filter((ct) =>
    plan.allowedClassTypes.includes(ct.id)
  );

  const hasSessionLimit = plan.maxSessions != null;
  const sessionsUsed = userSub.sessionsUsed || 0;
  const sessionProgress = hasSessionLimit
    ? sessionsUsed / (plan.maxSessions || 1)
    : 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={C.text} strokeWidth={1.8} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>O Meu Plano</Text>
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
            <View style={styles.planTypeBadge}>
              <Text style={styles.planTypeText}>{getTypeLabel(plan.type)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceValue}>{plan.price.toFixed(2)}</Text>
              <Text style={styles.priceCurrency}>{plan.currency}</Text>
            </View>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Ativo</Text>
            </View>
          </View>

          {/* Sessions Progress (if applicable) */}
          {hasSessionLimit && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Sessoes</Text>
                <Text style={styles.sectionBadge}>
                  {sessionsUsed}/{plan.maxSessions}
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(sessionProgress * 100, 100)}%`,
                      backgroundColor:
                        sessionProgress > 0.8 ? C.amber : C.green,
                    },
                  ]}
                />
              </View>
              <Text style={styles.sessionNote}>
                {(plan.maxSessions || 0) - sessionsUsed} sessoes restantes
              </Text>
            </View>
          )}

          {/* Allowed Class Types */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Aulas Incluidas</Text>
            <View style={styles.classTypeList}>
              {allowedTypes.map((ct) => (
                <View key={ct.id} style={styles.classTypeRow}>
                  <View style={styles.classTypeLeft}>
                    <View style={[styles.classTypeDot, { backgroundColor: ct.color }]} />
                    <Text style={styles.classTypeName}>{ct.name}</Text>
                  </View>
                  <View style={[styles.checkCircle, { backgroundColor: C.green + "18" }]}>
                    <Check size={14} color={C.green} strokeWidth={2.5} />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Billing Info */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Informacao de Faturacao</Text>
            <View style={styles.billingList}>
              <View style={styles.billingRow}>
                <View style={styles.billingLeft}>
                  <Calendar size={16} color={C.muted} strokeWidth={1.8} />
                  <Text style={styles.billingLabel}>Inicio</Text>
                </View>
                <Text style={styles.billingValue}>{formatDate(userSub.startDate)}</Text>
              </View>
              {userSub.nextBillingDate && (
                <View style={styles.billingRow}>
                  <View style={styles.billingLeft}>
                    <Calendar size={16} color={C.green} strokeWidth={1.8} />
                    <Text style={styles.billingLabel}>Proxima faturacao</Text>
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
                    <Text style={styles.billingLabel}>Fim</Text>
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
