import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#080c0a" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#080c0a" },
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
      </Stack>
    </>
  );
}
