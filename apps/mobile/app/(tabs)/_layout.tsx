import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
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
      {focused && <View style={styles.activeDot} />}
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
          height: 82,
          paddingBottom: 24,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarActiveTintColor: C.green,
        tabBarInactiveTintColor: C.muted,
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: "700",
          marginTop: 1,
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t("tab.home"),
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              focused={focused}
              icon={<Home size={size - 2} color={color} strokeWidth={focused ? 2.2 : 1.8} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: t("tab.schedule"),
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              focused={focused}
              icon={<CalendarDays size={size - 2} color={color} strokeWidth={focused ? 2.2 : 1.8} />}
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
              icon={<Dumbbell size={size - 2} color={color} strokeWidth={focused ? 2.2 : 1.8} />}
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
              icon={<Trophy size={size - 2} color={color} strokeWidth={focused ? 2.2 : 1.8} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: t("tab.community"),
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              focused={focused}
              icon={<Users size={size - 2} color={color} strokeWidth={focused ? 2.2 : 1.8} />}
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
              icon={<User size={size - 2} color={color} strokeWidth={focused ? 2.2 : 1.8} />}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 36,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    position: "relative",
  },
  iconWrapActive: {
    backgroundColor: C.green + "15",
  },
  activeDot: {
    position: "absolute",
    bottom: -4,
    width: 12,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: C.green,
    opacity: 0.9,
  },
});
