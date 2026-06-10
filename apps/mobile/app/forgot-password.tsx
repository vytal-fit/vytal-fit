import React, { useState } from "react";
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
import { Lock } from "lucide-react-native";
import { t } from "@/i18n";
import { useTheme } from "./_layout";
import type { Colors } from "@/colors";

// ─── Screen ──────────────────────────────────────────────
export default function ForgotPasswordScreen() {
  const router = useRouter();
  const C = useTheme();
  const styles = makeStyles(C);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function handleSend() {
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1000);
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
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}><Text style={{ fontSize: 18, color: C.muted }}>my</Text>VYTAL</Text>
        </View>

        {sent ? (
          /* Success State */
          <View style={styles.successContainer}>
            <View style={styles.lockIconContainer}>
              <Lock size={40} color={C.green} strokeWidth={1.8} />
            </View>
            <Text style={styles.successTitle}>{t("forgot.checkEmail")}</Text>
            <Text style={styles.successBody}>
              {t("forgot.sentBody").replace("{email}", email)}
            </Text>
            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={() => router.replace("/login")}
            >
              <Text style={styles.backToLoginText}>{t("forgot.backToLoginCaps")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Form */
          <View style={styles.form}>
            <Text style={styles.title}>{t("forgot.title")}</Text>
            <Text style={styles.subtitle}>
              {t("forgot.subtitle")}
            </Text>

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
            </View>

            {/* Send Button */}
            <TouchableOpacity
              style={[styles.button, (loading || !email) && styles.buttonDisabled]}
              onPress={handleSend}
              disabled={loading || !email}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {loading ? t("forgot.sending") : t("forgot.sendLink")}
              </Text>
            </TouchableOpacity>

            {/* Back to login */}
            <View style={styles.backContainer}>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.backLink}>{t("forgot.backToLogin")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ──────────────────────────────────────────────
function makeStyles(C: Colors) { return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  logo: {
    fontSize: 40,
    fontWeight: "800",
    color: C.green,
    letterSpacing: 4,
  },

  // Form
  form: {
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: C.text,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: C.muted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
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
  button: {
    backgroundColor: C.green,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
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
  backContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  backLink: {
    fontSize: 14,
    fontWeight: "600",
    color: C.green,
  },

  // Success State
  successContainer: {
    alignItems: "center",
    gap: 16,
  },
  lockIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.green + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: C.text,
  },
  successBody: {
    fontSize: 14,
    color: C.muted,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  backToLoginButton: {
    backgroundColor: C.green,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: "center",
    marginTop: 16,
  },
  backToLoginText: {
    fontSize: 15,
    fontWeight: "700",
    color: C.bg,
    letterSpacing: 1,
  },
}); }
