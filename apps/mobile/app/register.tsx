import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Check } from "lucide-react-native";

const COLORS = {
  bg: "#080c0a",
  bg2: "#0f1610",
  bg3: "#162018",
  green: "#3dff6e",
  greenDim: "rgba(61,255,110,0.1)",
  greenMid: "rgba(61,255,110,0.2)",
  text: "#dceee0",
  muted: "#6b8c72",
  border: "rgba(61,255,110,0.1)",
  red: "#ff4757",
};

export default function RegisterScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Step 1 fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2 fields
  const [gender, setGender] = useState<"M" | "F" | null>(null);
  const [dob, setDob] = useState("");
  const [country, setCountry] = useState("Portugal");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validateStep1(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Nome obrigatorio";
    if (!email.trim()) errs.email = "Email obrigatorio";
    if (password.length < 10)
      errs.password = "Minimo 10 caracteres";
    if (password !== confirmPassword)
      errs.confirmPassword = "Passwords nao coincidem";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    }
  }

  function handleRegister() {
    if (!acceptedTerms) {
      setErrors({ terms: "Aceite os termos" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      router.replace("/(tabs)/classes");
    }, 600);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (step === 2) setStep(1);
              else router.back();
            }}
          >
            <ArrowLeft size={20} color={COLORS.muted} />
          </TouchableOpacity>
          <Text style={styles.logo}>VYTAL</Text>
          <View style={styles.backButton} />
        </View>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressDot,
              step >= 1 && styles.progressDotActive,
            ]}
          />
          <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
          <View
            style={[
              styles.progressDot,
              step >= 2 && styles.progressDotActive,
            ]}
          />
        </View>

        <Text style={styles.title}>
          {step === 1 ? "Crie a sua conta" : "Sobre voce"}
        </Text>
        <Text style={styles.subtitle}>
          {step === 1
            ? "Dados de acesso"
            : "Informacoes adicionais"}
        </Text>

        {/* Step 1 */}
        {step === 1 && (
          <View style={styles.form}>
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>NOME</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="O seu nome"
                placeholderTextColor={`${COLORS.muted}80`}
                autoCapitalize="words"
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="voce@exemplo.com"
                placeholderTextColor={`${COLORS.muted}80`}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Minimo 10 caracteres"
                  placeholderTextColor={`${COLORS.muted}80`}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={COLORS.muted} />
                  ) : (
                    <Eye size={18} color={COLORS.muted} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CONFIRMAR PASSWORD</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repita a password"
                  placeholderTextColor={`${COLORS.muted}80`}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? (
                    <EyeOff size={18} color={COLORS.muted} />
                  ) : (
                    <Eye size={18} color={COLORS.muted} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Next button */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>SEGUINTE</Text>
              <ArrowRight size={18} color={COLORS.bg} />
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <View style={styles.form}>
            {/* Gender */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>GENERO</Text>
              <View style={styles.genderRow}>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    gender === "M" && styles.genderOptionActive,
                  ]}
                  onPress={() => setGender("M")}
                >
                  <Text
                    style={[
                      styles.genderText,
                      gender === "M" && styles.genderTextActive,
                    ]}
                  >
                    Masculino
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    gender === "F" && styles.genderOptionActive,
                  ]}
                  onPress={() => setGender("F")}
                >
                  <Text
                    style={[
                      styles.genderText,
                      gender === "F" && styles.genderTextActive,
                    ]}
                  >
                    Feminino
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Date of Birth */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>DATA DE NASCIMENTO</Text>
              <TextInput
                style={styles.input}
                value={dob}
                onChangeText={setDob}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={`${COLORS.muted}80`}
                keyboardType="numeric"
              />
            </View>

            {/* Country */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PAIS</Text>
              <TextInput
                style={styles.input}
                value={country}
                onChangeText={setCountry}
                placeholder="Portugal"
                placeholderTextColor={`${COLORS.muted}80`}
              />
            </View>

            {/* Terms */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  acceptedTerms && styles.checkboxActive,
                ]}
              >
                {acceptedTerms && <Check size={14} color={COLORS.bg} />}
              </View>
              <Text style={styles.termsText}>
                Aceito os{" "}
                <Text style={styles.termsLink}>Termos de Servico</Text> e a{" "}
                <Text style={styles.termsLink}>Politica de Privacidade</Text>
              </Text>
            </TouchableOpacity>
            {errors.terms && (
              <Text style={styles.errorText}>{errors.terms}</Text>
            )}

            {/* Register button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {loading ? "A CRIAR..." : "CRIAR CONTA"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Login link */}
        {step === 1 && (
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Ja tem conta? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>Entrar</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.green,
    letterSpacing: 3,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    gap: 4,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.bg3,
  },
  progressDotActive: {
    backgroundColor: COLORS.green,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.bg3,
    borderRadius: 1,
  },
  progressLineActive: {
    backgroundColor: COLORS.green,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.muted,
    letterSpacing: 1.5,
  },
  input: {
    backgroundColor: COLORS.bg2,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.text,
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  errorText: {
    fontSize: 12,
    color: COLORS.red,
    marginTop: 2,
  },
  genderRow: {
    flexDirection: "row",
    gap: 12,
  },
  genderOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: COLORS.bg2,
  },
  genderOptionActive: {
    borderColor: COLORS.green,
    backgroundColor: COLORS.greenDim,
  },
  genderText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.muted,
  },
  genderTextActive: {
    color: COLORS.green,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxActive: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 20,
  },
  termsLink: {
    color: COLORS.green,
    fontWeight: "600",
  },
  button: {
    backgroundColor: COLORS.green,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.bg,
    letterSpacing: 1,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: COLORS.muted,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.green,
  },
});
