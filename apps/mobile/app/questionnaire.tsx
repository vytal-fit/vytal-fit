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
import { ArrowLeft, Star } from "lucide-react-native";

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

export default function QuestionnaireScreen() {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [rating, setRating] = useState(0);
  const [multiChoice, setMultiChoice] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [yesNo, setYesNo] = useState<boolean | null>(null);
  const [rpe, setRpe] = useState(5);

  const totalQuestions = 5;

  function handleSubmit() {
    Alert.alert("Obrigado!", "As tuas respostas foram enviadas.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  }

  function renderQuestion() {
    switch (currentQ) {
      case 0:
        return (
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>Como classificas a aula de hoje?</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((val) => (
                <TouchableOpacity key={val} onPress={() => setRating(val)}>
                  <Star
                    size={36}
                    color={C.amber}
                    strokeWidth={2}
                    fill={val <= rating ? C.amber : "none"}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      case 1:
        return (
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>Qual parte do treino preferiste?</Text>
            {["Aquecimento", "Strength", "WOD", "Cool-down"].map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.choicePill, multiChoice === opt && styles.choicePillActive]}
                onPress={() => setMultiChoice(opt)}
              >
                <Text style={[styles.choiceText, multiChoice === opt && styles.choiceTextActive]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 2:
        return (
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>Tens alguma sugestao para melhorarmos?</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Escreve aqui..."
              placeholderTextColor={C.muted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={textAnswer}
              onChangeText={setTextAnswer}
            />
          </View>
        );
      case 3:
        return (
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>Recomendarias esta box a um amigo?</Text>
            <View style={styles.yesNoRow}>
              <TouchableOpacity
                style={[styles.yesNoPill, yesNo === true && styles.yesNoPillYes]}
                onPress={() => setYesNo(true)}
              >
                <Text style={[styles.yesNoText, yesNo === true && styles.yesNoTextActive]}>Sim</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.yesNoPill, yesNo === false && styles.yesNoPillNo]}
                onPress={() => setYesNo(false)}
              >
                <Text style={[styles.yesNoText, yesNo === false && styles.yesNoTextActive]}>Nao</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 4:
        return (
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>Nivel de esforco percebido (RPE)</Text>
            <Text style={[styles.rpeValue, { color: rpe <= 3 ? C.green : rpe <= 6 ? C.amber : C.red }]}>
              {rpe}
            </Text>
            <View style={styles.rpeRow}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.rpeDot,
                    { backgroundColor: val <= rpe ? (val <= 3 ? C.green : val <= 6 ? C.amber : C.red) : C.surface2 },
                  ]}
                  onPress={() => setRpe(val)}
                >
                  <Text style={[styles.rpeDotText, { color: val <= rpe ? "#080c0a" : C.muted }]}>
                    {val}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.rpeLabels}>
              <Text style={styles.rpeLabelText}>Facil</Text>
              <Text style={styles.rpeLabelText}>Maximo</Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={C.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Questionario</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((currentQ + 1) / totalQuestions) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>Pergunta {currentQ + 1} de {totalQuestions}</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderQuestion()}
        </ScrollView>

        {/* Navigation */}
        <View style={styles.bottomBar}>
          {currentQ > 0 && (
            <TouchableOpacity
              style={styles.prevButton}
              onPress={() => setCurrentQ(currentQ - 1)}
            >
              <Text style={styles.prevButtonText}>ANTERIOR</Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }} />
          {currentQ < totalQuestions - 1 ? (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => setCurrentQ(currentQ + 1)}
            >
              <Text style={styles.nextButtonText}>SEGUINTE</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>ENVIAR</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

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
  progressBar: {
    height: 4, backgroundColor: C.surface2, marginHorizontal: 16, borderRadius: 2,
  },
  progressFill: { height: 4, backgroundColor: C.green, borderRadius: 2 },
  progressText: {
    fontSize: 12, color: C.muted, fontWeight: "600", textAlign: "center",
    marginTop: 8, marginBottom: 4,
  },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, flex: 1 },
  questionCard: {
    backgroundColor: C.cardBg, borderRadius: 16, borderWidth: 1,
    borderColor: C.border, padding: 24,
  },
  questionText: { fontSize: 18, fontWeight: "700", color: C.text, marginBottom: 20 },
  starsRow: { flexDirection: "row", justifyContent: "center", gap: 12 },
  choicePill: {
    paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: C.border,
    backgroundColor: C.surface2, alignItems: "center", marginBottom: 10,
  },
  choicePillActive: { backgroundColor: C.green, borderColor: C.green },
  choiceText: { fontSize: 15, fontWeight: "700", color: C.muted },
  choiceTextActive: { color: "#080c0a" },
  textInput: {
    minHeight: 120, borderRadius: 12, backgroundColor: C.surface2,
    borderWidth: 1, borderColor: C.border, padding: 14, fontSize: 14,
    color: C.text, lineHeight: 20,
  },
  yesNoRow: { flexDirection: "row", gap: 12 },
  yesNoPill: {
    flex: 1, paddingVertical: 18, borderRadius: 14, borderWidth: 1.5,
    borderColor: C.border, alignItems: "center",
  },
  yesNoPillYes: { backgroundColor: C.green, borderColor: C.green },
  yesNoPillNo: { backgroundColor: C.red, borderColor: C.red },
  yesNoText: { fontSize: 16, fontWeight: "800", color: C.muted },
  yesNoTextActive: { color: "#080c0a" },
  rpeValue: { fontSize: 48, fontWeight: "800", textAlign: "center", marginBottom: 16 },
  rpeRow: { flexDirection: "row", justifyContent: "space-between", gap: 4 },
  rpeDot: {
    flex: 1, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center",
  },
  rpeDotText: { fontSize: 13, fontWeight: "800" },
  rpeLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  rpeLabelText: { fontSize: 11, fontWeight: "600", color: C.muted },
  bottomBar: {
    flexDirection: "row", paddingHorizontal: 16, paddingVertical: 16,
    paddingBottom: 36, borderTopWidth: 1, borderTopColor: C.border,
  },
  prevButton: {
    paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
  },
  prevButtonText: { fontSize: 13, fontWeight: "700", color: C.muted, letterSpacing: 0.5 },
  nextButton: {
    paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
  },
  nextButtonText: { fontSize: 13, fontWeight: "700", color: C.text, letterSpacing: 0.5 },
  submitButton: {
    paddingVertical: 14, paddingHorizontal: 32, borderRadius: 14,
    backgroundColor: C.green,
  },
  submitButtonText: { fontSize: 13, fontWeight: "800", color: "#080c0a", letterSpacing: 1 },
});
