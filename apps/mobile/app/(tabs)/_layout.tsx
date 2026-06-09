import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import {
  Home,
  CalendarDays,
  Dumbbell,
  Trophy,
  User,
} from "lucide-react-native";
import { colors } from "@/colors";
import { t } from "@/i18n";

const C = colors;

function TabIcon({
  icon,
  focused,
}: {
  icon: React.ReactNode;
  focused: boolean;
}) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      {icon}
      {focused && <View style={styles.activeGlow} />}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.surface,
          borderTopColor: C.border,
          borderTopWidth: 1,
          height: 92,
          paddingBottom: 30,
          paddingTop: 10,
          elevation: 0,
        },
        tabBarActiveTintColor: C.green,
        tabBarInactiveTintColor: C.muted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          marginTop: 2,
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="mybox"
        options={{
          title: t("tab.home"),
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              focused={focused}
              icon={<Home size={size} color={color} strokeWidth={focused ? 2.2 : 1.8} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="classes"
        options={{
          title: t("tab.schedule"),
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              focused={focused}
              icon={<CalendarDays size={size} color={color} strokeWidth={focused ? 2.2 : 1.8} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wod"
        options={{
          title: t("tab.wod"),
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              focused={focused}
              icon={<Dumbbell size={size} color={color} strokeWidth={focused ? 2.2 : 1.8} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: t("tab.records"),
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              focused={focused}
              icon={<Trophy size={size} color={color} strokeWidth={focused ? 2.2 : 1.8} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tab.profile"),
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              focused={focused}
              icon={<User size={size} color={color} strokeWidth={focused ? 2.2 : 1.8} />}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 40,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    position: "relative",
  },
  iconWrapActive: {
    backgroundColor: C.green + "18",
  },
  activeGlow: {
    position: "absolute",
    bottom: -6,
    width: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: C.green,
    opacity: 0.9,
  },
});
