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

// ─── Colors ──────────────────────────────────────────────
const COLORS = {
  bg: "#080c0a",
  bg2: "#0f1610",
  bg3: "#162018",
  green: "#3dff6e",
  text: "#dceee0",
  muted: "#6b8c72",
  border: "rgba(61,255,110,0.1)",
};

// ─── Screen ──────────────────────────────────────────────
export default function ForgotPasswordScreen() {
  const router = useRouter();
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
          <Text style={styles.logo}>VYTAL</Text>
        </View>

        {sent ? (
          /* Success State */
          <View style={styles.successContainer}>
            <View style={styles.lockIconContainer}>
              <Lock size={40} color={COLORS.green} strokeWidth={1.8} />
            </View>
            <Text style={styles.successTitle}>Verifica o teu email</Text>
            <Text style={styles.successBody}>
              Enviamos um link de recuperacao para {email}. Verifica a tua caixa de entrada e a pasta de spam.
            </Text>
            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={() => router.replace("/login")}
            >
              <Text style={styles.backToLoginText}>VOLTAR AO LOGIN</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Form */
          <View style={styles.form}>
            <Text style={styles.title}>Recuperar Password</Text>
            <Text style={styles.subtitle}>
              Insere o teu email e enviamos-te um link para redefinir a password.
            </Text>

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
            </View>

            {/* Send Button */}
            <TouchableOpacity
              style={[styles.button, (loading || !email) && styles.buttonDisabled]}
              onPress={handleSend}
              disabled={loading || !email}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {loading ? "A ENVIAR..." : "ENVIAR LINK"}
              </Text>
            </TouchableOpacity>

            {/* Back to login */}
            <View style={styles.backContainer}>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.backLink}>Voltar ao login</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
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
    color: COLORS.green,
    letterSpacing: 4,
  },

  // Form
  form: {
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
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
  button: {
    backgroundColor: COLORS.green,
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
    color: COLORS.bg,
    letterSpacing: 1,
  },
  backContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  backLink: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.green,
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
    backgroundColor: COLORS.green + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
  },
  successBody: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  backToLoginButton: {
    backgroundColor: COLORS.green,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: "center",
    marginTop: 16,
  },
  backToLoginText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.bg,
    letterSpacing: 1,
  },
});
