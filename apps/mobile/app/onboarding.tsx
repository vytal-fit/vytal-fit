import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { mockClasses } from "@vytal-fit/shared";
import { t } from "@/i18n";
import { useTheme } from "./_layout";
import type { Colors } from "@/colors";
import { LogoLayer } from "@/components/brand/LogoLayer";
import { VytalMark } from "@/components/brand/VytalMark";


const TOTAL_STEPS = 4;

// ─── Step Components ─────────────────────────────────────

function StepWelcome() {
  const styles = makeStyles(useTheme());
  return (
    <View style={styles.stepContainer}>
      <View style={styles.welcomeLogoContainer}>
        <VytalMark size={96} style={styles.welcomeMark} />
        <Text style={styles.welcomeLogo}>VYTAL</Text>
      </View>
      <Text style={styles.welcomeTitle}>{t("onboarding.welcome").replace("{gym}", "CrossFit Aveiro")}</Text>
      <Text style={styles.welcomeSubtitle}>
        {t("onboarding.welcomeSubtitle")}
      </Text>
    </View>
  );
}

function StepProfile({
  profile,
  setProfile,
}: {
  profile: {
    name: string;
    nickname: string;
    dob: string;
    gender: string;
    emergencyContact: string;
  };
  setProfile: (p: typeof profile) => void;
}) {
  const C = useTheme();
  const styles = makeStyles(C);
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t("onboarding.profileTitle")}</Text>

      {/* Photo Placeholder */}
      <View style={styles.photoPlaceholder}>
        <Text style={styles.photoPlaceholderText}>{t("onboarding.photo")}</Text>
      </View>

      <View style={styles.formFields}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t("onboarding.name")}</Text>
          <TextInput
            style={styles.input}
            value={profile.name}
            onChangeText={(v) => setProfile({ ...profile, name: v })}
            placeholder={t("onboarding.namePlaceholder")}
            placeholderTextColor={C.muted + "60"}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t("onboarding.nickname")}</Text>
          <TextInput
            style={styles.input}
            value={profile.nickname}
            onChangeText={(v) => setProfile({ ...profile, nickname: v })}
            placeholder={t("onboarding.nicknamePlaceholder")}
            placeholderTextColor={C.muted + "60"}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t("onboarding.dob")}</Text>
          <TextInput
            style={styles.input}
            value={profile.dob}
            onChangeText={(v) => setProfile({ ...profile, dob: v })}
            placeholder={t("onboarding.dobPlaceholder")}
            placeholderTextColor={C.muted + "60"}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t("onboarding.gender")}</Text>
          <View style={styles.genderRow}>
            {[t("label.male"), t("label.female")].map((g) => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.genderOption,
                  profile.gender === g && styles.genderOptionActive,
                ]}
                onPress={() => setProfile({ ...profile, gender: g })}
              >
                <Text
                  style={[
                    styles.genderOptionText,
                    profile.gender === g && styles.genderOptionTextActive,
                  ]}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t("onboarding.emergency")}</Text>
          <TextInput
            style={styles.input}
            value={profile.emergencyContact}
            onChangeText={(v) => setProfile({ ...profile, emergencyContact: v })}
            placeholder={t("onboarding.emergencyPlaceholder")}
            placeholderTextColor={C.muted + "60"}
            keyboardType="phone-pad"
          />
        </View>
      </View>
    </View>
  );
}

function StepPreferences({
  prefs,
  setPrefs,
}: {
  prefs: {
    classReminders: boolean;
    wodPublished: boolean;
    prNotifications: boolean;
    privacy: "public" | "box_only" | "private";
  };
  setPrefs: (p: typeof prefs) => void;
}) {
  const C = useTheme();
  const styles = makeStyles(C);
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t("onboarding.prefsTitle")}</Text>

      <View style={styles.prefsSection}>
        <Text style={styles.prefsGroupTitle}>{t("screen.notifications")}</Text>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>{t("onboarding.classReminders")}</Text>
            <Text style={styles.toggleSublabel}>{t("onboarding.classRemindersSub")}</Text>
          </View>
          <Switch
            value={prefs.classReminders}
            onValueChange={(v) => setPrefs({ ...prefs, classReminders: v })}
            trackColor={{ false: C.surface2, true: C.green + "50" }}
            thumbColor={prefs.classReminders ? C.green : C.muted}
          />
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>{t("onboarding.wodPublished")}</Text>
            <Text style={styles.toggleSublabel}>{t("onboarding.wodPublishedSub")}</Text>
          </View>
          <Switch
            value={prefs.wodPublished}
            onValueChange={(v) => setPrefs({ ...prefs, wodPublished: v })}
            trackColor={{ false: C.surface2, true: C.green + "50" }}
            thumbColor={prefs.wodPublished ? C.green : C.muted}
          />
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>{t("label.prs")}</Text>
            <Text style={styles.toggleSublabel}>{t("onboarding.prsSub")}</Text>
          </View>
          <Switch
            value={prefs.prNotifications}
            onValueChange={(v) => setPrefs({ ...prefs, prNotifications: v })}
            trackColor={{ false: C.surface2, true: C.green + "50" }}
            thumbColor={prefs.prNotifications ? C.green : C.muted}
          />
        </View>
      </View>

      <View style={styles.prefsSection}>
        <Text style={styles.prefsGroupTitle}>{t("screen.privacy")}</Text>
        {(["public", "box_only", "private"] as const).map((level) => {
          const labels = {
            public: { title: t("onboarding.privacyPublic"), sub: t("onboarding.privacyPublicSub") },
            box_only: { title: t("onboarding.privacyBoxOnly"), sub: t("onboarding.privacyBoxOnlySub") },
            private: { title: t("onboarding.privacyPrivate"), sub: t("onboarding.privacyPrivateSub") },
          };
          const isSelected = prefs.privacy === level;
          return (
            <TouchableOpacity
              key={level}
              style={[styles.privacyOption, isSelected && styles.privacyOptionActive]}
              onPress={() => setPrefs({ ...prefs, privacy: level })}
            >
              <View style={styles.privacyInfo}>
                <Text style={[styles.privacyLabel, isSelected && styles.privacyLabelActive]}>
                  {labels[level].title}
                </Text>
                <Text style={styles.privacySublabel}>{labels[level].sub}</Text>
              </View>
              {isSelected && (
                <View style={styles.privacyCheck}>
                  <Text style={styles.privacyCheckText}>V</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function StepFirstBooking() {
  const C = useTheme();
  const styles = makeStyles(C);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const todayClasses = mockClasses.filter(
    (cls) => cls.date === new Date().toISOString().split("T")[0]
  ).slice(0, 4);

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t("onboarding.firstClassTitle")}</Text>
      <Text style={styles.stepSubtitle}>
        {t("onboarding.firstClassSubtitle")}
      </Text>

      <View style={styles.classesListOnboarding}>
        {todayClasses.map((cls) => {
          const isSelected = selectedClassId === cls.id;
          const isFull = cls.enrolledCount >= cls.maxCapacity;
          return (
            <TouchableOpacity
              key={cls.id}
              style={[
                styles.classCardOnboarding,
                isSelected && styles.classCardOnboardingActive,
                isFull && styles.classCardOnboardingFull,
              ]}
              onPress={() => !isFull && setSelectedClassId(cls.id)}
              activeOpacity={isFull ? 1 : 0.8}
            >
              <View style={styles.classCardOnboardingHeader}>
                <View style={styles.classTypeRowOnboarding}>
                  <View style={[styles.colorDot, { backgroundColor: cls.classType.color }]} />
                  <Text style={styles.classTypeNameOnboarding}>{cls.classType.name}</Text>
                </View>
                <Text style={[styles.classTimeOnboarding, isSelected && { color: "#080c0a" }]}>
                  {cls.startTime} - {cls.endTime}
                </Text>
              </View>
              <View style={styles.classCardOnboardingFooter}>
                <Text style={[styles.classCoachOnboarding, isSelected && { color: "#080c0a" }]}>
                  {cls.coaches.length > 0 ? cls.coaches[0].name : "TBD"}
                </Text>
                <Text style={[styles.classSpotsOnboarding, isFull && { color: C.amber }]}>
                  {isFull
                    ? t("onboarding.full")
                    : t("onboarding.spots").replace("{n}", String(cls.maxCapacity - cls.enrolledCount))}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {selectedClassId && (
        <TouchableOpacity style={styles.bookFirstButton}>
          <Text style={styles.bookFirstButtonText}>{t("onboarding.bookFirst")}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────
export default function OnboardingScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    name: "",
    nickname: "",
    dob: "",
    gender: "",
    emergencyContact: "",
  });
  const [prefs, setPrefs] = useState<{
    classReminders: boolean;
    wodPublished: boolean;
    prNotifications: boolean;
    privacy: "public" | "box_only" | "private";
  }>({
    classReminders: true,
    wodPublished: true,
    prNotifications: true,
    privacy: "box_only",
  });

  function handleNext() {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      router.replace("/(tabs)/home");
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep(step - 1);
    }
  }

  function handleSkip() {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      router.replace("/(tabs)/home");
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <LogoLayer intensity="bold" />
      <View style={styles.container}>
        {/* Progress Dots */}
        <View style={styles.progressRow}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i + 1 === step && styles.progressDotActive,
                i + 1 < step && styles.progressDotCompleted,
              ]}
            />
          ))}
        </View>

        {/* Step Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {step === 1 && <StepWelcome />}
          {step === 2 && <StepProfile profile={profile} setProfile={setProfile} />}
          {step === 3 && <StepPreferences prefs={prefs} setPrefs={setPrefs} />}
          {step === 4 && <StepFirstBooking />}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <View style={styles.bottomNavRow}>
            {step > 1 ? (
              <TouchableOpacity style={styles.navBackButton} onPress={handleBack}>
                <Text style={styles.navBackText}>{t("onboarding.back")}</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flex: 1 }} />
            )}
            <TouchableOpacity onPress={handleSkip}>
              <Text style={styles.skipText}>{t("onboarding.skip")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navNextButton} onPress={handleNext}>
              <Text style={styles.navNextText}>
                {step === TOTAL_STEPS ? t("onboarding.start") : t("btn.next")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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

  // Progress
  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
  },
  progressDotActive: {
    backgroundColor: C.green,
    borderColor: C.green,
    width: 28,
    borderRadius: 5,
  },
  progressDotCompleted: {
    backgroundColor: C.green + "60",
    borderColor: C.green + "60",
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  // Step Container
  stepContainer: {
    flex: 1,
  },

  // Welcome
  welcomeLogoContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 32,
  },
  welcomeMark: {
    marginBottom: 16,
  },
  welcomeLogo: {
    fontSize: 48,
    fontWeight: "800",
    color: C.green,
    letterSpacing: 6,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: C.text,
    textAlign: "center",
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: C.muted,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  // Profile Step
  stepTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: C.text,
    marginBottom: 16,
    textAlign: "center",
  },
  stepSubtitle: {
    fontSize: 14,
    color: C.muted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.surface2,
    borderWidth: 2,
    borderColor: C.border,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  photoPlaceholderText: {
    fontSize: 12,
    color: C.muted,
    fontWeight: "500",
  },
  formFields: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: C.muted,
    letterSpacing: 1.5,
  },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: C.text,
  },
  genderRow: {
    flexDirection: "row",
    gap: 10,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    alignItems: "center",
  },
  genderOptionActive: {
    borderColor: C.green,
    backgroundColor: C.green + "15",
  },
  genderOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: C.muted,
  },
  genderOptionTextActive: {
    color: C.green,
  },

  // Preferences Step
  prefsSection: {
    marginBottom: 20,
  },
  prefsGroupTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: C.text,
  },
  toggleSublabel: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  privacyOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  privacyOptionActive: {
    borderColor: C.green + "40",
    backgroundColor: C.green + "08",
  },
  privacyInfo: {
    flex: 1,
  },
  privacyLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: C.text,
  },
  privacyLabelActive: {
    color: C.green,
  },
  privacySublabel: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  privacyCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.green,
    alignItems: "center",
    justifyContent: "center",
  },
  privacyCheckText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#080c0a",
  },

  // First Booking Step
  classesListOnboarding: {
    gap: 10,
    marginTop: 8,
  },
  classCardOnboarding: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  classCardOnboardingActive: {
    backgroundColor: C.green,
    borderColor: C.green,
  },
  classCardOnboardingFull: {
    opacity: 0.5,
  },
  classCardOnboardingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  classTypeRowOnboarding: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  classTypeNameOnboarding: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
  },
  classTimeOnboarding: {
    fontSize: 14,
    fontWeight: "600",
    color: C.green,
  },
  classCardOnboardingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  classCoachOnboarding: {
    fontSize: 13,
    color: C.muted,
  },
  classSpotsOnboarding: {
    fontSize: 13,
    fontWeight: "600",
    color: C.green,
  },
  bookFirstButton: {
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: C.green,
    alignItems: "center",
  },
  bookFirstButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#080c0a",
    letterSpacing: 1,
  },

  // Bottom Navigation
  bottomNav: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.bg,
  },
  bottomNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navBackButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: "center",
    marginRight: 10,
  },
  navBackText: {
    fontSize: 13,
    fontWeight: "800",
    color: C.muted,
    letterSpacing: 1,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600",
    color: C.muted,
    paddingHorizontal: 12,
  },
  navNextButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: C.green,
    alignItems: "center",
    marginLeft: 10,
  },
  navNextText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#080c0a",
    letterSpacing: 1,
  },
}); }
