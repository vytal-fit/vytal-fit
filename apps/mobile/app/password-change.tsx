import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Lock, Eye, EyeOff, Check } from "lucide-react-native";

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

export default function PasswordChangeScreen() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const hasMinLength = newPass.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPass);
  const hasNumber = /[0-9]/.test(newPass);
  const passwordsMatch = newPass === confirm && confirm.length > 0;

  function handleSubmit() {
    if (!current || !newPass || !confirm) {
      Alert.alert("Erro", "Preenche todos os campos.");
      return;
    }
    if (!passwordsMatch) {
      Alert.alert("Erro", "As passwords nao coincidem.");
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.successContainer}>
          <View style={styles.checkCircle}>
            <Check size={48} color="#080c0a" strokeWidth={3} />
          </View>
          <Text style={styles.successTitle}>Password Alterada!</Text>
          <Text style={styles.successSubtitle}>
            A tua password foi atualizada com sucesso.
          </Text>
          <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
            <Text style={styles.doneButtonText}>FECHAR</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={C.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Alterar Password</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Current Password */}
          <Text style={styles.fieldLabel}>Password Atual</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              secureTextEntry={!showCurrent}
              value={current}
              onChangeText={setCurrent}
              placeholder="Password atual"
              placeholderTextColor={C.muted}
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setShowCurrent(!showCurrent)}>
              {showCurrent ? <EyeOff size={20} color={C.muted} /> : <Eye size={20} color={C.muted} />}
            </TouchableOpacity>
          </View>

          {/* New Password */}
          <Text style={styles.fieldLabel}>Nova Password</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              secureTextEntry={!showNew}
              value={newPass}
              onChangeText={setNewPass}
              placeholder="Nova password"
              placeholderTextColor={C.muted}
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setShowNew(!showNew)}>
              {showNew ? <EyeOff size={20} color={C.muted} /> : <Eye size={20} color={C.muted} />}
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <Text style={styles.fieldLabel}>Confirmar Nova Password</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              secureTextEntry={!showConfirm}
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Confirmar password"
              placeholderTextColor={C.muted}
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <EyeOff size={20} color={C.muted} /> : <Eye size={20} color={C.muted} />}
            </TouchableOpacity>
          </View>

          {/* Requirements */}
          <View style={styles.requirements}>
            <Text style={styles.reqTitle}>Requisitos:</Text>
            <Requirement met={hasMinLength} text="Minimo 8 caracteres" />
            <Requirement met={hasUppercase} text="Pelo menos uma maiuscula" />
            <Requirement met={hasNumber} text="Pelo menos um numero" />
            <Requirement met={passwordsMatch} text="Passwords coincidem" />
          </View>

          {/* Submit */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Lock size={18} color="#080c0a" strokeWidth={2.5} />
            <Text style={styles.submitButtonText}>ALTERAR PASSWORD</Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function Requirement({ met, text }: { met: boolean; text: string }) {
  return (
    <View style={reqStyles.row}>
      <View style={[reqStyles.dot, met && reqStyles.dotMet]} />
      <Text style={[reqStyles.text, met && reqStyles.textMet]}>{text}</Text>
    </View>
  );
}

const reqStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.surface2 },
  dotMet: { backgroundColor: C.green },
  text: { fontSize: 13, color: C.muted },
  textMet: { color: C.green },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backButton: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: C.text },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },
  fieldLabel: {
    fontSize: 12, fontWeight: "600", color: C.muted, marginBottom: 6,
    marginTop: 16, textTransform: "uppercase", letterSpacing: 0.5,
  },
  inputRow: { flexDirection: "row", alignItems: "center" },
  input: {
    flex: 1, backgroundColor: C.cardBg, borderRadius: 12, borderWidth: 1,
    borderColor: C.border, paddingHorizontal: 14, paddingVertical: 14,
    fontSize: 15, color: C.text, fontWeight: "500",
  },
  eyeButton: { position: "absolute", right: 14 },
  requirements: {
    backgroundColor: C.cardBg, borderRadius: 14, borderWidth: 1,
    borderColor: C.border, padding: 16, marginTop: 20,
  },
  reqTitle: { fontSize: 13, fontWeight: "700", color: C.text, marginBottom: 10 },
  submitButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: C.green, borderRadius: 14, paddingVertical: 16,
    marginTop: 24,
  },
  submitButtonText: { fontSize: 15, fontWeight: "800", color: "#080c0a", letterSpacing: 1 },
  // Success
  successContainer: {
    flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24,
  },
  checkCircle: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: C.green,
    alignItems: "center", justifyContent: "center", marginBottom: 24,
  },
  successTitle: { fontSize: 24, fontWeight: "800", color: C.green, marginBottom: 8 },
  successSubtitle: { fontSize: 15, color: C.muted, textAlign: "center", marginBottom: 32 },
  doneButton: {
    paddingVertical: 16, paddingHorizontal: 48, borderRadius: 14,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
  },
  doneButtonText: { fontSize: 15, fontWeight: "700", color: C.text, letterSpacing: 1 },
});
