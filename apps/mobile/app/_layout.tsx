import React, { createContext, useContext, useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAppStore } from "@/stores/app-store";
import { useAuthStore } from "@/stores/auth-store";
import { getColors, Colors } from "@/colors";

// ─── Theme Context ─────────────────────────────────────────
export const ThemeContext = createContext<Colors>(getColors("dark"));

export function useTheme(): Colors {
  return useContext(ThemeContext);
}

// ─── Root Layout ───────────────────────────────────────────
export default function RootLayout() {
  const theme = useAppStore((s) => s.theme);
  const hydrate = useAppStore((s) => s.hydrate);
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const C = getColors(theme);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    void hydrateAuth();
  }, [hydrateAuth]);

  return (
    <ThemeContext.Provider value={C}>
      <StatusBar style={theme === "light" ? "dark" : "light"} backgroundColor={C.bg} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: C.bg },
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" options={{ animation: "fade" }} />
        <Stack.Screen name="register" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="class-detail" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="leaderboard" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="score-entry" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="timer" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="notifications" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="plan-detail" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="exercises" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="calculator" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="wod-detail" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="coach-profile" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="box-records" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="news" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="pr-entry" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="birthdays" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="checkin" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="fistbumps" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="feedback" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="settings" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="booking-history" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="wod-history" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="dropin" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="social-feed" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="forgot-password" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="org-switcher" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
        <Stack.Screen name="booking-confirm" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="waitlist-status" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="wod-comments" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="fistbump-detail" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="photo-gallery" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="converters" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="challenge-detail" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="athlete-of-month" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="dossier-viewer" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="questionnaire" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="password-change" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="language-selector" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="notification-prefs" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="chat" options={{ animation: "slide_from_right" }} />
      </Stack>
    </ThemeContext.Provider>
  );
}
