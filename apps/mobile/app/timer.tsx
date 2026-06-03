import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Vibration,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react-native";
import { colors } from "@/colors";

const C = { ...colors, cardBg: colors.card };

// ─── Timer Modes ────────────────────────────────────────
const timerModes = [
  { key: "amrap", label: "AMRAP" },
  { key: "emom", label: "EMOM" },
  { key: "for_time", label: "For Time" },
  { key: "tabata", label: "Tabata" },
  { key: "stopwatch", label: "Stopwatch" },
] as const;

type TimerMode = (typeof timerModes)[number]["key"];

type TimerState = "idle" | "running" | "paused" | "rest";

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function getDisplayColor(state: TimerState, remaining: number): string {
  if (state === "rest") return C.red;
  if (state === "paused") return C.amber;
  if (state === "running" && remaining <= 10 && remaining > 0) return C.red;
  if (state === "running") return C.green;
  return C.text;
}

// ─── Screen ──────────────────────────────────────────────
export default function TimerScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<TimerMode>("amrap");
  const [timerState, setTimerState] = useState<TimerState>("idle");

  // Config
  const [configMinutes, setConfigMinutes] = useState("15");
  const [configRounds, setConfigRounds] = useState("10");
  const [configWork, setConfigWork] = useState("20");
  const [configRest, setConfigRest] = useState("10");

  // Timer state
  const [elapsed, setElapsed] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [isRestPhase, setIsRestPhase] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getTotalSeconds = useCallback((): number => {
    switch (mode) {
      case "amrap":
      case "for_time":
        return (parseInt(configMinutes, 10) || 0) * 60;
      case "emom":
        return (parseInt(configRounds, 10) || 0) * 60;
      case "tabata": {
        const work = parseInt(configWork, 10) || 20;
        const rest = parseInt(configRest, 10) || 10;
        const rounds = parseInt(configRounds, 10) || 8;
        return (work + rest) * rounds;
      }
      case "stopwatch":
        return 0; // counts up
      default:
        return 0;
    }
  }, [mode, configMinutes, configRounds, configWork, configRest]);

  const getDisplayTime = (): number => {
    if (mode === "stopwatch") return elapsed;
    const total = getTotalSeconds();
    return Math.max(total - elapsed, 0);
  };

  const getRemaining = (): number => {
    if (mode === "stopwatch") return 999;
    return getTotalSeconds() - elapsed;
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const start = () => {
    if (timerState === "running") return;
    setTimerState("running");
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;

        // Check tabata rest/work phases
        if (mode === "tabata") {
          const work = parseInt(configWork, 10) || 20;
          const rest = parseInt(configRest, 10) || 10;
          const cycleLength = work + rest;
          const posInCycle = next % cycleLength;
          const newRound = Math.floor(next / cycleLength) + 1;
          setCurrentRound(newRound);
          setIsRestPhase(posInCycle >= work);
          if (posInCycle >= work) {
            setTimerState("rest");
          } else {
            setTimerState("running");
          }
        }

        // Check EMOM rounds
        if (mode === "emom") {
          setCurrentRound(Math.floor(next / 60) + 1);
        }

        // Check completion
        const total = (mode === "amrap" || mode === "for_time")
          ? (parseInt(configMinutes, 10) || 0) * 60
          : mode === "emom"
          ? (parseInt(configRounds, 10) || 0) * 60
          : mode === "tabata"
          ? ((parseInt(configWork, 10) || 20) + (parseInt(configRest, 10) || 10)) * (parseInt(configRounds, 10) || 8)
          : 0;

        if (mode !== "stopwatch" && next >= total) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimerState("idle");
          Vibration.vibrate([0, 500, 200, 500, 200, 500]);
        }

        return next;
      });
    }, 1000);
  };

  const pause = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerState("paused");
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setElapsed(0);
    setCurrentRound(1);
    setIsRestPhase(false);
    setTimerState("idle");
  };

  const displayTime = getDisplayTime();
  const remaining = getRemaining();
  const displayColor = getDisplayColor(timerState === "idle" ? "idle" : isRestPhase ? "rest" : timerState, remaining);
  const isActive = timerState === "running" || timerState === "rest";

  const showConfig = timerState === "idle";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ArrowLeft size={24} color={C.text} strokeWidth={1.8} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Timer</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Mode Selector */}
        <View style={styles.modeSelector}>
          {timerModes.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={[
                styles.modePill,
                mode === m.key && styles.modePillActive,
              ]}
              onPress={() => {
                if (showConfig) {
                  setMode(m.key);
                  reset();
                }
              }}
            >
              <Text
                style={[
                  styles.modePillText,
                  mode === m.key && styles.modePillTextActive,
                ]}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Configuration */}
        {showConfig && mode !== "stopwatch" && (
          <View style={styles.configSection}>
            {(mode === "amrap" || mode === "for_time") && (
              <View style={styles.configRow}>
                <Text style={styles.configLabel}>Tempo (min)</Text>
                <View style={styles.configInputGroup}>
                  <TouchableOpacity
                    style={styles.configBtn}
                    onPress={() => setConfigMinutes(String(Math.max(1, (parseInt(configMinutes, 10) || 0) - 1)))}
                  >
                    <Text style={styles.configBtnText}>-</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.configInput}
                    value={configMinutes}
                    onChangeText={setConfigMinutes}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                  <TouchableOpacity
                    style={styles.configBtn}
                    onPress={() => setConfigMinutes(String((parseInt(configMinutes, 10) || 0) + 1))}
                  >
                    <Text style={styles.configBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {(mode === "emom" || mode === "tabata") && (
              <View style={styles.configRow}>
                <Text style={styles.configLabel}>Rounds</Text>
                <View style={styles.configInputGroup}>
                  <TouchableOpacity
                    style={styles.configBtn}
                    onPress={() => setConfigRounds(String(Math.max(1, (parseInt(configRounds, 10) || 0) - 1)))}
                  >
                    <Text style={styles.configBtnText}>-</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.configInput}
                    value={configRounds}
                    onChangeText={setConfigRounds}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                  <TouchableOpacity
                    style={styles.configBtn}
                    onPress={() => setConfigRounds(String((parseInt(configRounds, 10) || 0) + 1))}
                  >
                    <Text style={styles.configBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {mode === "tabata" && (
              <>
                <View style={styles.configRow}>
                  <Text style={styles.configLabel}>Work (seg)</Text>
                  <View style={styles.configInputGroup}>
                    <TouchableOpacity
                      style={styles.configBtn}
                      onPress={() => setConfigWork(String(Math.max(5, (parseInt(configWork, 10) || 0) - 5)))}
                    >
                      <Text style={styles.configBtnText}>-</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={styles.configInput}
                      value={configWork}
                      onChangeText={setConfigWork}
                      keyboardType="number-pad"
                      maxLength={3}
                    />
                    <TouchableOpacity
                      style={styles.configBtn}
                      onPress={() => setConfigWork(String((parseInt(configWork, 10) || 0) + 5))}
                    >
                      <Text style={styles.configBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.configRow}>
                  <Text style={styles.configLabel}>Rest (seg)</Text>
                  <View style={styles.configInputGroup}>
                    <TouchableOpacity
                      style={styles.configBtn}
                      onPress={() => setConfigRest(String(Math.max(5, (parseInt(configRest, 10) || 0) - 5)))}
                    >
                      <Text style={styles.configBtnText}>-</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={styles.configInput}
                      value={configRest}
                      onChangeText={setConfigRest}
                      keyboardType="number-pad"
                      maxLength={3}
                    />
                    <TouchableOpacity
                      style={styles.configBtn}
                      onPress={() => setConfigRest(String((parseInt(configRest, 10) || 0) + 5))}
                    >
                      <Text style={styles.configBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        )}

        {/* Timer Display */}
        <View style={styles.timerSection}>
          {/* Round indicator */}
          {(mode === "emom" || mode === "tabata") && isActive && (
            <View style={styles.roundIndicator}>
              <Text style={styles.roundLabel}>ROUND</Text>
              <Text style={[styles.roundValue, { color: displayColor }]}>
                {currentRound}
              </Text>
            </View>
          )}

          {/* Phase indicator */}
          {mode === "tabata" && isActive && (
            <View style={[styles.phaseBadge, { backgroundColor: (isRestPhase ? C.red : C.green) + "20" }]}>
              <Text style={[styles.phaseText, { color: isRestPhase ? C.red : C.green }]}>
                {isRestPhase ? "REST" : "WORK"}
              </Text>
            </View>
          )}

          <Text style={[styles.timerDisplay, { color: displayColor }]}>
            {formatTime(displayTime)}
          </Text>

          {/* Sound/Vibration indicator */}
          <View style={styles.soundIndicator}>
            <View style={[styles.soundDot, { backgroundColor: isActive ? C.green : C.muted }]} />
            <Text style={styles.soundText}>
              {isActive ? "Ativo" : "Pronto"}
            </Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlBtnSecondary}
            onPress={reset}
          >
            <RotateCcw size={24} color={C.text} strokeWidth={1.8} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlBtnPrimary,
              {
                backgroundColor: isActive ? C.amber : C.green,
              },
            ]}
            onPress={isActive ? pause : start}
          >
            {isActive ? (
              <Pause size={32} color="#080c0a" strokeWidth={2.5} />
            ) : (
              <Play size={32} color="#080c0a" strokeWidth={2.5} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlBtnSecondary}
            onPress={reset}
          >
            <Text style={styles.controlBtnLabel}>Reset</Text>
          </TouchableOpacity>
        </View>
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

  // Mode Selector
  modeSelector: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 16,
  },
  modePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
  },
  modePillActive: {
    backgroundColor: C.green,
    borderColor: C.green,
  },
  modePillText: {
    fontSize: 10,
    fontWeight: "800",
    color: C.muted,
    letterSpacing: 0.5,
  },
  modePillTextActive: {
    color: "#080c0a",
  },

  // Config
  configSection: {
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  configRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
  },
  configLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: C.text,
  },
  configInputGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  configBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  configBtnText: {
    fontSize: 20,
    fontWeight: "700",
    color: C.green,
  },
  configInput: {
    width: 60,
    height: 40,
    borderRadius: 10,
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
  },

  // Timer Display
  timerSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  roundIndicator: {
    alignItems: "center",
    marginBottom: 12,
  },
  roundLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: C.muted,
    letterSpacing: 2,
  },
  roundValue: {
    fontSize: 28,
    fontWeight: "800",
  },
  phaseBadge: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 12,
  },
  phaseText: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2,
  },
  timerDisplay: {
    fontSize: 96,
    fontWeight: "200",
    fontVariant: ["tabular-nums"],
    letterSpacing: 2,
  },
  soundIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
  },
  soundDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  soundText: {
    fontSize: 12,
    fontWeight: "600",
    color: C.muted,
  },

  // Controls
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    paddingBottom: 60,
    paddingTop: 20,
  },
  controlBtnPrimary: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  controlBtnSecondary: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  controlBtnLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: C.muted,
  },
});
