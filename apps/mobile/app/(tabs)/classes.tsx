import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { mockClasses } from "@vytal-fit/shared";
import type { Class } from "@vytal-fit/shared";

// ─── Colors ──────────────────────────────────────────────
const C = {
  bg: "#080c0a",
  surface: "#0f1610",
  surface2: "#162018",
  green: "#3dff6e",
  blue: "#00d4ff",
  amber: "#ffb300",
  red: "#ff4757",
  text: "#dceee0",
  muted: "#6b8c72",
  cardBg: "rgba(22,32,24,0.9)",
  border: "rgba(61,255,110,0.1)",
};

// ─── Helpers ─────────────────────────────────────────────
function getWeekDays(): { key: string; label: string; dayNum: number; dateStr: string; isToday: boolean }[] {
  const days: ReturnType<typeof getWeekDays> = [];
  const weekLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
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
    "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  const weekDays = [
    "Domingo", "Segunda-feira", "Terca-feira", "Quarta-feira",
    "Quinta-feira", "Sexta-feira", "Sabado",
  ];
  return `${weekDays[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]}`;
}

// Mock booked classes (simulate user bookings)
const bookedClassIds = new Set(["cl-2", "cl-6"]);

// ─── Components ──────────────────────────────────────────

function DaySelector({
  days,
  selected,
  onSelect,
}: {
  days: ReturnType<typeof getWeekDays>;
  selected: string;
  onSelect: (d: string) => void;
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

function ClassCard({ cls, onPress }: { cls: Class; onPress: () => void }) {
  const isFull = cls.enrolledCount >= cls.maxCapacity;
  const isBooked = bookedClassIds.has(cls.id);
  const occupancy = cls.enrolledCount / cls.maxCapacity;
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
          <Text style={styles.infoIcon}>{"///"}</Text>
          <Text style={styles.infoText}>{coachName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>{"@"}</Text>
          <Text style={styles.infoText}>{cls.location.name}</Text>
        </View>
      </View>

      <View style={styles.enrollmentSection}>
        <View style={styles.enrollmentHeader}>
          <Text style={styles.enrollmentLabel}>
            {cls.enrolledCount}/{cls.maxCapacity} inscritos
          </Text>
          {cls.waitlistCount > 0 && (
            <Text style={styles.waitlistLabel}>
              +{cls.waitlistCount} em espera
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
                  ? C.amber
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
          <TouchableOpacity style={styles.bookedButton}>
            <Text style={styles.bookedButtonText}>RESERVADO</Text>
          </TouchableOpacity>
        ) : isFull ? (
          <TouchableOpacity style={styles.waitlistButton}>
            <Text style={styles.waitlistButtonText}>LISTA DE ESPERA</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.bookButton}>
            <Text style={styles.bookButtonText}>RESERVAR</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ──────────────────────────────────────────────
export default function ClassesScreen() {
  const router = useRouter();
  const weekDays = getWeekDays();
  const [selectedDate, setSelectedDate] = useState(weekDays[0].dateStr);

  const filteredClasses = mockClasses.filter(
    (cls) => cls.date === selectedDate
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Aulas</Text>
          <Text style={styles.headerDate}>{formatDateHeader()}</Text>
        </View>

        {/* Day Selector */}
        <DaySelector
          days={weekDays}
          selected={selectedDate}
          onSelect={setSelectedDate}
        />

        {/* Class List */}
        <FlatList
          data={filteredClasses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ClassCard
              cls={item}
              onPress={() => router.push(`/class-detail?id=${item.id}`)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>{"( )"}</Text>
              <Text style={styles.emptyText}>
                Sem aulas para este dia
              </Text>
            </View>
          }
        />
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: C.text,
    letterSpacing: -0.5,
  },
  headerDate: {
    fontSize: 14,
    color: C.muted,
    marginTop: 4,
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

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },

  // Card
  card: {
    backgroundColor: C.cardBg,
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
  infoIcon: {
    fontSize: 12,
    color: C.muted,
    width: 20,
    textAlign: "center",
    fontWeight: "700",
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
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.green,
  },
  bookButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: C.green,
    letterSpacing: 1,
  },
  bookedButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: C.green,
  },
  bookedButtonText: {
    fontSize: 13,
    fontWeight: "800",
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
});
