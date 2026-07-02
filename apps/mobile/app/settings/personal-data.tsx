import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Save, CheckCircle } from "lucide-react-native";

// ─── Colors ──────────────────────────────────────────────
import { useTheme } from "../_layout";
import type { Colors } from "@/colors";
import { t } from "@/i18n";
import { getMyMember } from "@/lib/auth-api";

const tshirtSizes = ["XS", "S", "M", "L", "XL", "XXL"];

// ─── Screen ──────────────────────────────────────────────
export default function PersonalDataScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();

  // Prefilled from the member API (name/email/phone). The member UPDATE
  // endpoint is admin-only, so these are editable locally but not persisted.
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  // Fields with no member-accessible API source: kept blank and local-only.
  const [emergency, setEmergency] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [nif, setNif] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");
  const [tshirt, setTshirt] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    void getMyMember()
      .then((member) => {
        if (cancelled || !member) return;
        setName(member.name);
        setEmail(member.email);
        setPhone(member.phone ?? "");
      })
      .catch(() => {
        // Prefill is best-effort; leave fields blank on failure.
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const bmi =
    weight && height
      ? (
          parseFloat(weight) /
          Math.pow(parseFloat(height) / 100, 2)
        ).toFixed(1)
      : "--";

  function handleSave() {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.back();
    }, 1500);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={22} color={C.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("screen.personalData")}</Text>
          <View style={{ width: 44 }} />
        </View>

        {isLoading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={C.green} />
          </View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Basic Info */}
          <FormField label={t("label.name")} value={name} onChangeText={setName} />
          <FormField label={t("label.nickname")} value={nickname} onChangeText={setNickname} />
          <FormField
            label={t("label.email")}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <FormField
            label={t("label.phone")}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <FormField
            label={t("label.emergency")}
            value={emergency}
            onChangeText={setEmergency}
          />

          {/* DOB */}
          <FormField
            label={t("label.dob")}
            value={dob}
            onChangeText={setDob}
            placeholder={t("personalData.dobPlaceholder")}
          />

          {/* Gender */}
          <Text style={styles.fieldLabel}>{t("label.gender")}</Text>
          <View style={styles.genderRow}>
            <TouchableOpacity
              style={[
                styles.genderPill,
                gender === "M" && styles.genderPillActive,
              ]}
              onPress={() => setGender("M")}
            >
              <Text
                style={[
                  styles.genderPillText,
                  gender === "M" && styles.genderPillTextActive,
                ]}
              >
                {t("label.male")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderPill,
                gender === "F" && styles.genderPillActive,
              ]}
              onPress={() => setGender("F")}
            >
              <Text
                style={[
                  styles.genderPillText,
                  gender === "F" && styles.genderPillTextActive,
                ]}
              >
                {t("label.female")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* NIF + Address */}
          <FormField label={t("label.nif")} value={nif} onChangeText={setNif} keyboardType="numeric" />
          <FormField label={t("label.address")} value={address} onChangeText={setAddress} />
          <View style={styles.row}>
            <View style={styles.rowHalf}>
              <FormField label={t("label.city")} value={city} onChangeText={setCity} />
            </View>
            <View style={styles.rowHalf}>
              <FormField label={t("label.zip")} value={zip} onChangeText={setZip} />
            </View>
          </View>
          <FormField label={t("label.country")} value={country} onChangeText={setCountry} />

          {/* T-shirt Size */}
          <Text style={styles.fieldLabel}>{t("label.tshirtSize")}</Text>
          <View style={styles.sizeRow}>
            {tshirtSizes.map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.sizePill,
                  tshirt === size && styles.sizePillActive,
                ]}
                onPress={() => setTshirt(size)}
              >
                <Text
                  style={[
                    styles.sizePillText,
                    tshirt === size && styles.sizePillTextActive,
                  ]}
                >
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Weight + Height */}
          <View style={styles.row}>
            <View style={styles.rowHalf}>
              <FormField
                label={t("label.weight")}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.rowHalf}>
              <FormField
                label={t("label.height")}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* BMI Display */}
          <View style={styles.bmiCard}>
            <Text style={styles.bmiLabel}>{t("label.bmi")}</Text>
            <Text style={styles.bmiValue}>{bmi}</Text>
          </View>

          {/* Success Banner */}
          {saved && (
            <View style={styles.successBanner}>
              <CheckCircle size={16} color={C.bg} strokeWidth={2.5} />
              <Text style={styles.successBannerText}>{t("personalData.savedBanner")}</Text>
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saved}>
            <Save size={18} color="#080c0a" strokeWidth={2.5} />
            <Text style={styles.saveButtonText}>{saved ? t("personalData.savedBtn") : t("btn.save")}</Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ─── Form Field ──────────────────────────────────────────
function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
}) {
  const C = useTheme();
  const styles = makeStyles(C);
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.muted + "60"}
        keyboardType={keyboardType || "default"}
      />
    </View>
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

  // Loading
  loadingBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  // Form Field
  fieldContainer: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: C.muted,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldInput: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: C.text,
    fontWeight: "500",
  },

  // Row layout
  row: {
    flexDirection: "row",
    gap: 10,
  },
  rowHalf: {
    flex: 1,
  },

  // Gender
  genderRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  genderPill: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    alignItems: "center",
  },
  genderPillActive: {
    backgroundColor: C.green,
    borderColor: C.green,
  },
  genderPillText: {
    fontSize: 14,
    fontWeight: "700",
    color: C.muted,
  },
  genderPillTextActive: {
    color: "#080c0a",
  },

  // T-shirt Size
  sizeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  sizePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    alignItems: "center",
  },
  sizePillActive: {
    backgroundColor: C.green,
    borderColor: C.green,
  },
  sizePillText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.muted,
  },
  sizePillTextActive: {
    color: "#080c0a",
  },

  // BMI
  bmiCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.blue + "12",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.blue + "30",
    padding: 16,
    marginBottom: 20,
  },
  bmiLabel: {
    fontSize: 14,
    color: C.muted,
    fontWeight: "600",
  },
  bmiValue: {
    fontSize: 22,
    fontWeight: "800",
    color: C.blue,
  },

  // Save
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.green,
    borderRadius: 14,
    paddingVertical: 16,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#080c0a",
    letterSpacing: 1,
  },

  // Success Banner
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.green,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 4,
  },
  successBannerText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.bg,
  },
}); }
