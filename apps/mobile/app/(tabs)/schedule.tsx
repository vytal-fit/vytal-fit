import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { User, MapPin, Bell, Check, CalendarX, Zap } from "lucide-react-native";
import { mockClasses } from "@vytal-fit/shared";
import type { Class } from "@vytal-fit/shared";
import { useTheme } from "../_layout";
import type { Colors } from "@/colors";
import { t } from "@/i18n";

// ─── Filter pills config ──────────────────────────────────
const FILTERS = ["Todas", "CrossFit", "Ginástica", "Weightlifting", "Cardio"] as const;
type FilterLabel = typeof FILTERS[number];

// ─── Helpers ──────────────────────────────────────────────
function getWeekDays(): { key: string; label: string; dayNum: number; dateStr: string; isToday: boolean }[] {
  const days: ReturnType<typeof getWeekDays> = [];
  // Use i18n keys so day abbreviations respect language
  const weekLabels = [
    t("schedule.daySun"),
    t("schedule.dayMon"),
    t("schedule.dayTue"),
    t("schedule.dayWed"),
    t("schedule.dayThu"),
    t("schedule.dayFri"),
    t("schedule.daySat"),
  ];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({
      key: dateStr,
      label: weekLabels[d.getDay()],
      dayNum: d.getDate(),
      dateStr,
      isToday: i === 0,
    });
  }
  return days;
}

function formatDateHeader(): string {
  const now = new Date();
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  const weekDays = [
    "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
    "Quinta-feira", "Sexta-feira", "Sábado",
  ];
  return `${weekDays[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]}`;
}

function matchesFilter(cls: Class, filter: FilterLabel): boolean {
  if (filter === "Todas") return true;
  const name = cls.classType.name.toLowerCase();
  switch (filter) {
    case "CrossFit": return name.includes("crossfit");
    case "Ginástica": return name.includes("gin") || name.includes("gymnastics");
    case "Weightlifting": return name.includes("weightlifting") || name.includes("halterofilia");
    case "Cardio": return name.includes("cardio") || name.includes("endurance");
    default: return true;
  }
}

// ─── Components ───────────────────────────────────────────
function DaySelector({
  days,
  selected,
  onSelect,
  styles,
}: {
  days: ReturnType<typeof getWeekDays>;
  selected: string;
  onSelect: (d: string) => void;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.daySelectorContent}
      style={styles.daySelector}
    >
      {days.map((day) => {
        const isSelected = day.dateStr === selected;
        return (
          <TouchableOpacity
            key={day.key}
            onPress={() => onSelect(day.dateStr)}
            style={[
              styles.dayPill,
              isSelected && styles.dayPillActive,
            ]}
          >
            <Text
              style={[
                styles.dayPillLabel,
                isSelected && styles.dayPillLabelActive,
              ]}
            >
              {day.label}
            </Text>
            <Text
              style={[
                styles.dayPillNum,
                isSelected && styles.dayPillNumActive,
              ]}
            >
              {day.dayNum}
            </Text>
            {day.isToday && (
              <View
                style={[
                  styles.todayDot,
                  isSelected && styles.todayDotActive,
                ]}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function FilterPills({
  active,
  onSelect,
  styles,
}: {
  active: FilterLabel;
  onSelect: (f: FilterLabel) => void;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterContent}
      style={styles.filterBar}
    >
      {FILTERS.map((f) => (
        <TouchableOpacity
          key={f}
          style={[styles.filterPill, active === f && styles.filterPillActive]}
          onPress={() => onSelect(f)}
        >
          <Text style={[styles.filterPillText, active === f && styles.filterPillTextActive]}>
            {f}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function ClassCard({
  cls,
  onPress,
  isBooked,
  onBook,
  enrollmentOffset,
  C,
  styles,
}: {
  cls: Class;
  onPress: () => void;
  isBooked: boolean;
  onBook: () => void;
  enrollmentOffset: number;
  C: Colors;
  styles: ReturnType<typeof makeStyles>;
}) {
  const adjustedEnrolled = cls.enrolledCount + enrollmentOffset;
  const isFull = adjustedEnrolled >= cls.maxCapacity;
  const occupancy = adjustedEnrolled / cls.maxCapacity;
  const coachName = cls.coaches.length > 0 ? cls.coaches[0].name : "TBD";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={styles.classTypeRow}>
          <View
            style={[styles.colorDot, { backgroundColor: cls.classType.color }]}
          />
          <Text style={styles.classTypeName}>{cls.classType.name}</Text>
          <View
            style={[
              styles.abbrevBadge,
              { backgroundColor: cls.classType.color + "20" },
            ]}
          >
            <Text
              style={[styles.abbrevText, { color: cls.classType.color }]}
            >
              {cls.classType.abbreviation}
            </Text>
          </View>
        </View>
        <Text style={styles.classTime}>
          {cls.startTime} - {cls.endTime}
        </Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <User size={14} color={C.muted} strokeWidth={1.8} />
          <Text style={styles.infoText}>{coachName}</Text>
        </View>
        <View style={styles.infoRow}>
          <MapPin size={14} color={C.muted} strokeWidth={1.8} />
          <Text style={styles.infoText}>{cls.location.name}</Text>
        </View>
      </View>

      <View style={styles.enrollmentSection}>
        <View style={styles.enrollmentHeader}>
          <Text style={styles.enrollmentLabel}>
            {adjustedEnrolled}/{cls.maxCapacity} {t("status.enrolled")}
          </Text>
          {cls.waitlistCount > 0 && (
            <Text style={styles.waitlistLabel}>
              +{cls.waitlistCount} {t("status.waiting")}
            </Text>
          )}
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(occupancy * 100, 100)}%`,
                backgroundColor: isFull
                  ? C.red
                  : occupancy > 0.8
                  ? C.amber
                  : C.green,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.cardFooter}>
        {isBooked ? (
          <TouchableOpacity
            style={styles.bookedButton}
            onPress={(e) => {
              e.stopPropagation?.();
              onBook();
            }}
          >
            <View style={styles.bookedButtonContent}>
              <Check size={14} color="#080c0a" strokeWidth={2.5} />
              <Text style={styles.bookedButtonText}>{t("btn.booked")}</Text>
            </View>
          </TouchableOpacity>
        ) : isFull ? (
          <TouchableOpacity
            style={styles.waitlistButton}
            onPress={(e) => {
              e.stopPropagation?.();
              onBook();
            }}
          >
            <Text style={styles.waitlistButtonText}>{t("btn.waitlist")}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.bookButton}
            onPress={(e) => {
              e.stopPropagation?.();
              onBook();
            }}
          >
            <Text style={styles.bookButtonText}>{t("btn.book")}</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────
export default function ScheduleScreen() {
  const router = useRouter();
  const C = useTheme();
  const styles = makeStyles(C);
  const weekDays = getWeekDays();
  const [selectedDate, setSelectedDate] = useState(weekDays[0].dateStr);
  const [activeFilter, setActiveFilter] = useState<FilterLabel>("Todas");
  const [bookedIds, setBookedIds] = useState<Set<string>>(new Set(["cl-2", "cl-6"]));

  const filteredClasses = mockClasses
    .filter((cls) => cls.date === selectedDate)
    .filter((cls) => matchesFilter(cls, activeFilter));

  function toggleBooking(classId: string, _cls: Class) {
    setBookedIds((prev) => {
      const next = new Set(prev);
      if (next.has(classId)) {
        next.delete(classId);
        router.push("/booking-history");
      } else {
        next.add(classId);
        router.push("/booking-confirm");
      }
      return next;
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <View style={styles.headerBrandRow}>
                <Zap size={14} color={C.green} strokeWidth={2.5} fill={C.green} />
                <Text style={styles.headerBrand}>AGENDA</Text>
              </View>
              <Text style={styles.headerTitle}>{t("screen.schedule")}</Text>
              <Text style={styles.headerDate}>{formatDateHeader()}</Text>
            </View>
            <TouchableOpacity
              style={styles.headerAction}
              onPress={() => router.push("/notifications")}
            >
              <Bell size={20} color={C.text} strokeWidth={1.8} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Class List with Day Selector + Filters as header */}
        <FlatList
          data={filteredClasses}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              <DaySelector
                days={weekDays}
                selected={selectedDate}
                onSelect={(d) => { setSelectedDate(d); setActiveFilter("Todas"); }}
                styles={styles}
              />
              <FilterPills active={activeFilter} onSelect={setActiveFilter} styles={styles} />
            </>
          }
          stickyHeaderIndices={[0]}
          renderItem={({ item }) => (
            <ClassCard
              cls={item}
              onPress={() => router.push(`/class-detail?id=${item.id}`)}
              isBooked={bookedIds.has(item.id)}
              onBook={() => toggleBooking(item.id, item)}
              enrollmentOffset={bookedIds.has(item.id) ? 1 : 0}
              C={C}
              styles={styles}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.cardGap} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <CalendarX size={48} color={C.muted} strokeWidth={1.2} />
              <Text style={styles.emptyText}>
                {t("label.noClasses")}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────
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
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  headerBrand: {
    fontSize: 10,
    fontWeight: "800",
    color: C.green,
    letterSpacing: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: C.text,
    letterSpacing: -0.5,
  },
  headerDate: {
    fontSize: 13,
    color: C.muted,
    marginTop: 3,
  },
  headerAction: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },

  // Day Selector
  daySelector: {
    maxHeight: 88,
    marginBottom: 8,
  },
  daySelectorContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dayPill: {
    alignItems: "center",
    justifyContent: "center",
    width: 52,
    height: 72,
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  dayPillActive: {
    backgroundColor: C.green,
    borderColor: C.green,
  },
  dayPillLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: C.muted,
    textTransform: "uppercase",
  },
  dayPillLabelActive: {
    color: "#080c0a",
  },
  dayPillNum: {
    fontSize: 20,
    fontWeight: "700",
    color: C.text,
    marginTop: 2,
  },
  dayPillNumActive: {
    color: "#080c0a",
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.green,
    marginTop: 4,
  },
  todayDotActive: {
    backgroundColor: "#080c0a",
  },

  // Filter pills
  filterBar: {
    maxHeight: 36,
    marginBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 6,
    alignItems: "center",
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  filterPillActive: {
    backgroundColor: C.green + "18",
    borderColor: C.green + "60",
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.muted,
    letterSpacing: 0.3,
  },
  filterPillTextActive: {
    color: C.green,
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  cardGap: {
    height: 12,
  },

  // Card
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  classTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  classTypeName: {
    fontSize: 17,
    fontWeight: "700",
    color: C.text,
  },
  abbrevBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  abbrevText: {
    fontSize: 11,
    fontWeight: "700",
  },
  classTime: {
    fontSize: 15,
    fontWeight: "600",
    color: C.green,
  },

  // Card Body
  cardBody: {
    marginBottom: 14,
    gap: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: C.muted,
  },

  // Enrollment
  enrollmentSection: {
    marginBottom: 14,
  },
  enrollmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  enrollmentLabel: {
    fontSize: 12,
    color: C.muted,
    fontWeight: "500",
  },
  waitlistLabel: {
    fontSize: 12,
    color: C.amber,
    fontWeight: "600",
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: C.surface2,
  },
  progressBarFill: {
    height: 4,
    borderRadius: 2,
  },

  // Card Footer
  cardFooter: {
    alignItems: "flex-end",
  },
  bookButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.green,
  },
  bookButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.green,
    letterSpacing: 1,
  },
  bookedButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: C.green,
  },
  bookedButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bookedButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#080c0a",
    letterSpacing: 1,
  },
  waitlistButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.amber,
  },
  waitlistButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: C.amber,
    letterSpacing: 1,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: C.muted,
  },
}); }
