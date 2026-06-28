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
import { t } from "@/i18n";
import { useTheme } from "./_layout";
import type { Colors } from "@/colors";
import { useAuthStore } from "@/stores/auth-store";

export default function RegisterScreen() {
  const router = useRouter();
  const C = useTheme();
  const styles = makeStyles(C);
  const { register } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitError, setSubmitError] = useState("");

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
    if (!name.trim()) errs.name = t("register.errName");
    if (!email.trim()) errs.email = t("register.errEmail");
    if (password.length < 10)
      errs.password = t("register.errPasswordMin");
    if (password !== confirmPassword)
      errs.confirmPassword = t("passwordChange.mismatch");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    }
  }

  async function handleRegister() {
    if (!acceptedTerms) {
      setErrors({ terms: t("register.errTerms") });
      return;
    }
    setLoading(true);
    setSubmitError("");
    const success = await register(name, email, password);
    setLoading(false);

    if (!success) {
      setSubmitError(t("auth.registerFailed"));
      return;
    }

    router.replace("/(tabs)/home");
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
            <ArrowLeft size={20} color={C.muted} />
          </TouchableOpacity>
          <Text style={styles.logo}><Text style={{ fontSize: 18, color: C.muted }}>my</Text>VYTAL</Text>
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
          {step === 1 ? t("register.title1") : t("register.title2")}
        </Text>
        <Text style={styles.subtitle}>
          {step === 1
            ? t("register.subtitle1")
            : t("register.subtitle2")}
        </Text>

        {/* Step 1 */}
        {step === 1 && (
          <View style={styles.form}>
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("register.name")}</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder={t("register.namePlaceholder")}
                placeholderTextColor={`${C.muted}80`}
                autoCapitalize="words"
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("label.email")}</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder={t("login.emailPlaceholder")}
                placeholderTextColor={`${C.muted}80`}
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
              <Text style={styles.label}>{t("label.password")}</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t("register.passwordPlaceholder")}
                  placeholderTextColor={`${C.muted}80`}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={C.muted} />
                  ) : (
                    <Eye size={18} color={C.muted} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("register.confirmPassword")}</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder={t("register.confirmPlaceholder")}
                  placeholderTextColor={`${C.muted}80`}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? (
                    <EyeOff size={18} color={C.muted} />
                  ) : (
                    <Eye size={18} color={C.muted} />
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
              <Text style={styles.buttonText}>{t("btn.next")}</Text>
              <ArrowRight size={18} color={C.bg} />
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <View style={styles.form}>
            {/* Gender */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("register.gender")}</Text>
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
                    {t("label.male")}
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
                    {t("label.female")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Date of Birth */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("register.dob")}</Text>
              <TextInput
                style={styles.input}
                value={dob}
                onChangeText={setDob}
                placeholder={t("register.dobPlaceholder")}
                placeholderTextColor={`${C.muted}80`}
                keyboardType="numeric"
              />
            </View>

            {/* Country */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("register.country")}</Text>
              <TextInput
                style={styles.input}
                value={country}
                onChangeText={setCountry}
                placeholder="Portugal"
                placeholderTextColor={`${C.muted}80`}
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
                {acceptedTerms && <Check size={14} color={C.bg} />}
              </View>
              <Text style={styles.termsText}>
                {t("register.termsPrefix")}
                <Text style={styles.termsLink}>{t("register.termsService")}</Text>
                {t("register.termsAnd")}
                <Text style={styles.termsLink}>{t("register.termsPrivacy")}</Text>
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
                {loading ? t("register.creating") : t("register.create")}
              </Text>
            </TouchableOpacity>

            {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}
          </View>
        )}

        {/* Login link */}
        {step === 1 && (
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>{t("register.haveAccount")}</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>{t("screen.login")}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(C: Colors) { return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
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
    color: C.green,
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
    backgroundColor: C.surface2,
  },
  progressDotActive: {
    backgroundColor: C.green,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: C.surface2,
    borderRadius: 1,
  },
  progressLineActive: {
    backgroundColor: C.green,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: C.text,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: C.muted,
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
    color: C.muted,
    letterSpacing: 1.5,
  },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: C.text,
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
    color: C.red,
    marginTop: 2,
  },
  genderRow: {
    flexDirection: "row",
    gap: 12,
  },
  genderOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: C.surface,
  },
  genderOptionActive: {
    borderColor: C.green,
    backgroundColor: C.green + "15",
  },
  genderText: {
    fontSize: 14,
    fontWeight: "600",
    color: C.muted,
  },
  genderTextActive: {
    color: C.green,
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
    borderColor: C.border,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxActive: {
    backgroundColor: C.green,
    borderColor: C.green,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: C.muted,
    lineHeight: 20,
  },
  termsLink: {
    color: C.green,
    fontWeight: "600",
  },
  button: {
    backgroundColor: C.green,
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
    color: C.bg,
    letterSpacing: 1,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: C.muted,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "600",
    color: C.green,
  },
}); }
