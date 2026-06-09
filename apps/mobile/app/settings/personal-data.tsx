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
import { ArrowLeft, Save, CheckCircle } from "lucide-react-native";
import { mockMembers } from "@vytal-fit/shared";

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
  text: "#dceee0",
  muted: "#6b8c72",
  cardBg: "rgba(22,32,24,0.9)",
  border: "rgba(61,255,110,0.1)",
};

const tshirtSizes = ["XS", "S", "M", "L", "XL", "XXL"];
const currentUser = mockMembers[0];

// ─── Screen ──────────────────────────────────────────────
export default function PersonalDataScreen() {
  const router = useRouter();

  const [name, setName] = useState(currentUser.name);
  const [nickname, setNickname] = useState("Ze");
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || "");
  const [emergency, setEmergency] = useState("Maria Fonte - 911222333");
  const [dob, setDob] = useState("1993-06-15");
  const [gender, setGender] = useState<"M" | "F">(
    currentUser.gender === "female" ? "F" : "M"
  );
  const [nif, setNif] = useState("234567890");
  const [address, setAddress] = useState("Rua das Flores, 42");
  const [city, setCity] = useState("Lisboa");
  const [zip, setZip] = useState("1200-100");
  const [country, setCountry] = useState("Portugal");
  const [tshirt, setTshirt] = useState("L");
  const [weight, setWeight] = useState("82");
  const [height, setHeight] = useState("178");
  const [saved, setSaved] = useState(false);

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
          <Text style={styles.headerTitle}>Dados Pessoais</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Basic Info */}
          <FormField label="Nome Completo" value={name} onChangeText={setName} />
          <FormField label="Alcunha" value={nickname} onChangeText={setNickname} />
          <FormField
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <FormField
            label="Telefone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <FormField
            label="Contacto de Emergência"
            value={emergency}
            onChangeText={setEmergency}
          />

          {/* DOB */}
          <FormField
            label="Data de Nascimento"
            value={dob}
            onChangeText={setDob}
            placeholder="AAAA-MM-DD"
          />

          {/* Gender */}
          <Text style={styles.fieldLabel}>Género</Text>
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
                Masculino
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
                Feminino
              </Text>
            </TouchableOpacity>
          </View>

          {/* NIF + Address */}
          <FormField label="NIF" value={nif} onChangeText={setNif} keyboardType="numeric" />
          <FormField label="Morada" value={address} onChangeText={setAddress} />
          <View style={styles.row}>
            <View style={styles.rowHalf}>
              <FormField label="Cidade" value={city} onChangeText={setCity} />
            </View>
            <View style={styles.rowHalf}>
              <FormField label="Código Postal" value={zip} onChangeText={setZip} />
            </View>
          </View>
          <FormField label="País" value={country} onChangeText={setCountry} />

          {/* T-shirt Size */}
          <Text style={styles.fieldLabel}>Tamanho T-shirt</Text>
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
                label="Peso (kg)"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.rowHalf}>
              <FormField
                label="Altura (cm)"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* BMI Display */}
          <View style={styles.bmiCard}>
            <Text style={styles.bmiLabel}>IMC (calculado)</Text>
            <Text style={styles.bmiValue}>{bmi}</Text>
          </View>

          {/* Success Banner */}
          {saved && (
            <View style={styles.successBanner}>
              <CheckCircle size={16} color={C.bg} strokeWidth={2.5} />
              <Text style={styles.successBannerText}>Guardado com sucesso!</Text>
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saved}>
            <Save size={18} color="#080c0a" strokeWidth={2.5} />
            <Text style={styles.saveButtonText}>{saved ? "GUARDADO" : "GUARDAR"}</Text>
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
    backgroundColor: C.cardBg,
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
    backgroundColor: C.cardBg,
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
    backgroundColor: C.cardBg,
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
});
