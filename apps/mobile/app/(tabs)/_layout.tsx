import { Tabs } from "expo-router";
import {
  CalendarDays,
  Dumbbell,
  Trophy,
  Home,
  User,
} from "lucide-react-native";
import { colors } from "@/colors";
import { t } from "@/i18n";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 88,
          paddingBottom: 28,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="classes"
        options={{
          title: t("tab.classes"),
          tabBarIcon: ({ color, size }) => (
            <CalendarDays size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="wod"
        options={{
          title: t("tab.wod"),
          tabBarIcon: ({ color, size }) => (
            <Dumbbell size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: t("tab.records"),
          tabBarIcon: ({ color, size }) => (
            <Trophy size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="mybox"
        options={{
          title: t("tab.mybox"),
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tab.profile"),
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
    </Tabs>
  );
}
