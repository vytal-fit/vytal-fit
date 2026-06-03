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
      />
    </>
  );
}
