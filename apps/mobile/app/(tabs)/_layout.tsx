import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import {
  Home,
  CalendarDays,
  Dumbbell,
  Trophy,
  Users,
  User,
} from "lucide-react-native";
import { colors } from "@/colors";
import { t } from "@/i18n";

const C = colors;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.surface,
          borderTopColor: C.border,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 16,
          paddingTop: 10,
          elevation: 0,
        },
        tabBarActiveTintColor: C.green,
        tabBarInactiveTintColor: C.muted,
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: "700",
          marginTop: 2,
          letterSpacing: 0.3,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t("tab.home"),
          tabBarIcon: ({ color, focused }) => (
            <Home size={18} color={color} strokeWidth={focused ? 2.4 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: t("tab.schedule"),
          tabBarIcon: ({ color, focused }) => (
            <CalendarDays size={18} color={color} strokeWidth={focused ? 2.4 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="wod"
        options={{
          title: t("tab.wod"),
          tabBarIcon: ({ color, focused }) => (
            <Dumbbell size={18} color={color} strokeWidth={focused ? 2.4 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: t("tab.records"),
          tabBarIcon: ({ color, focused }) => (
            <Trophy size={18} color={color} strokeWidth={focused ? 2.4 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: t("tab.community"),
          tabBarIcon: ({ color, focused }) => (
            <Users size={18} color={color} strokeWidth={focused ? 2.4 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tab.profile"),
          tabBarIcon: ({ color, focused }) => (
            <User size={18} color={color} strokeWidth={focused ? 2.4 : 1.8} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({});
