import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Star, MapPin, Search } from "lucide-react-native";
import { useTheme } from "./_layout";
import type { Colors } from "@/colors";
import { t } from "@/i18n";


// ─── Types ───────────────────────────────────────────────
type DropInGym = {
  id: string;
  name: string;
  initials: string;
  type: string;
  distance: string;
  rating: number;
  price: string;
  address: string;
  schedule: string;
  color: keyof Colors;
};

// ─── Mock Data ───────────────────────────────────────────
const mockGyms: DropInGym[] = [
  {
    id: "gym-1",
    name: "CrossFit Porto",
    initials: "CP",
    type: "CrossFit Box",
    distance: "2.3 km",
    rating: 4.8,
    price: "15 EUR / sessão",
    address: "Rua das Flores 123, Porto",
    schedule: "06:30 - 21:00",
    color: "green",
  },
  {
    id: "gym-2",
    name: "Zen Yoga Studio",
    initials: "ZY",
    type: "Yoga Studio",
    distance: "3.7 km",
    rating: 4.5,
    price: "12 EUR / sessão",
    address: "Av. da Liberdade 45, Aveiro",
    schedule: "07:00 - 20:00",
    color: "purple",
  },
  {
    id: "gym-3",
    name: "Iron House Gym",
    initials: "IH",
    type: "Weightlifting Club",
    distance: "5.1 km",
    rating: 4.7,
    price: "10 EUR / sessão",
    address: "Rua do Ferro 78, Aveiro",
    schedule: "06:00 - 22:00",
    color: "amber",
  },
  {
    id: "gym-4",
    name: "FitBox Lisboa",
    initials: "FL",
    type: "CrossFit Box",
    distance: "8.4 km",
    rating: 4.6,
    price: "18 EUR / sessão",
    address: "Rua Augusta 200, Lisboa",
    schedule: "07:00 - 21:30",
    color: "blue",
  },
  {
    id: "gym-5",
    name: "Movimento Livre",
    initials: "ML",
    type: "Functional Training",
    distance: "12.0 km",
    rating: 4.3,
    price: "8 EUR / sessão",
    address: "Rua Nova 55, Coimbra",
    schedule: "08:00 - 20:00",
    color: "orange",
  },
];

function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(5 - full - half);
}

// ─── Screen ──────────────────────────────────────────────
export default function DropInScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGym, setSelectedGym] = useState<string | null>(null);

  const filteredGyms = mockGyms.filter((gym) =>
    gym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gym.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const detailGym = selectedGym ? mockGyms.find((g) => g.id === selectedGym) : null;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (selectedGym) {
                setSelectedGym(null);
              } else {
                router.back();
              }
            }}
          >
            <ArrowLeft size={22} color={C.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {selectedGym ? t("dropin.details") : t("screen.dropin")}
          </Text>
          <View style={{ width: 44 }} />
        </View>

        {!selectedGym ? (
          <>
            {/* Search Bar */}
            <View style={styles.searchSection}>
              <View style={styles.searchBar}>
                <Search size={18} color={C.muted} strokeWidth={2} />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={t("dropin.searchPlaceholder")}
                  placeholderTextColor={C.muted + "80"}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Gym List */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {filteredGyms.map((gym) => (
                <TouchableOpacity
                  key={gym.id}
                  style={styles.gymCard}
                  onPress={() => setSelectedGym(gym.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.gymCardTop}>
                    <View style={[styles.gymLogo, { borderColor: C[gym.color] }]}>
                      <Text style={[styles.gymLogoText, { color: C[gym.color] }]}>
                        {gym.initials}
                      </Text>
                    </View>
                    <View style={styles.gymInfo}>
                      <Text style={styles.gymName}>{gym.name}</Text>
                      <Text style={styles.gymType}>{gym.type}</Text>
                    </View>
                  </View>
                  <View style={styles.gymCardBottom}>
                    <View style={styles.gymMeta}>
                      <View style={styles.metaItem}>
                        <MapPin size={12} color={C.muted} strokeWidth={2} />
                        <Text style={styles.metaText}>{gym.distance}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Star size={12} color={C.amber} strokeWidth={2} fill={C.amber} />
                        <Text style={[styles.metaText, { color: C.amber }]}>{gym.rating}</Text>
                      </View>
                    </View>
                    <Text style={styles.gymPrice}>{gym.price}</Text>
                  </View>
                </TouchableOpacity>
              ))}

              {filteredGyms.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>{"( )"}</Text>
                  <Text style={styles.emptyText}>{t("dropin.empty")}</Text>
                </View>
              )}

              <View style={{ height: 30 }} />
            </ScrollView>
          </>
        ) : detailGym ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Detail View */}
            <View style={styles.detailHeader}>
              <View style={[styles.detailLogo, { borderColor: C[detailGym.color] }]}>
                <Text style={[styles.detailLogoText, { color: C[detailGym.color] }]}>
                  {detailGym.initials}
                </Text>
              </View>
              <Text style={styles.detailName}>{detailGym.name}</Text>
              <View style={[styles.typeBadge, { backgroundColor: C[detailGym.color] + "20" }]}>
                <Text style={[styles.typeBadgeText, { color: C[detailGym.color] }]}>
                  {detailGym.type}
                </Text>
              </View>
            </View>

            <View style={styles.detailCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t("label.address")}</Text>
                <Text style={styles.detailValue}>{detailGym.address}</Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t("dropin.distance")}</Text>
                <Text style={styles.detailValue}>{detailGym.distance}</Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t("dropin.schedule")}</Text>
                <Text style={styles.detailValue}>{detailGym.schedule}</Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t("dropin.rating")}</Text>
                <View style={styles.ratingRow}>
                  <Star size={14} color={C.amber} strokeWidth={2} fill={C.amber} />
                  <Text style={[styles.detailValue, { color: C.amber }]}>
                    {detailGym.rating}
                  </Text>
                </View>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t("dropin.price")}</Text>
                <Text style={[styles.detailValue, { color: C.green, fontWeight: "800" }]}>
                  {detailGym.price}
                </Text>
              </View>
            </View>

            {/* Book Button */}
            <TouchableOpacity style={styles.bookButton}>
              <Text style={styles.bookButtonText}>{t("dropin.book")}</Text>
            </TouchableOpacity>

            <View style={{ height: 30 }} />
          </ScrollView>
        ) : null}
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

  // Search
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: C.text,
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 10,
  },

  // Gym Card
  gymCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  gymCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 12,
  },
  gymLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.surface2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  gymLogoText: {
    fontSize: 16,
    fontWeight: "800",
  },
  gymInfo: {
    flex: 1,
  },
  gymName: {
    fontSize: 17,
    fontWeight: "700",
    color: C.text,
    marginBottom: 2,
  },
  gymType: {
    fontSize: 13,
    color: C.muted,
    fontWeight: "500",
  },
  gymCardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gymMeta: {
    flexDirection: "row",
    gap: 14,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: "600",
    color: C.muted,
  },
  gymPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: C.green,
  },

  // Detail
  detailHeader: {
    alignItems: "center",
    paddingVertical: 20,
  },
  detailLogo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.surface2,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  detailLogoText: {
    fontSize: 24,
    fontWeight: "800",
  },
  detailName: {
    fontSize: 22,
    fontWeight: "800",
    color: C.text,
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  detailCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: C.muted,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: C.text,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    marginLeft: 20,
  },
  detailDivider: {
    height: 1,
    backgroundColor: C.border,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  // Book Button
  bookButton: {
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: C.green,
    alignItems: "center",
  },
  bookButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#080c0a",
    letterSpacing: 1.5,
  },

  // Empty
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 40,
    color: C.muted,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: C.muted,
  },
}); }
