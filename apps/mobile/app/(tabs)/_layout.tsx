import { useEffect, useState } from "react";
import { Tabs } from "expo-router";
import {
  Home,
  CalendarDays,
  Dumbbell,
  Trophy,
  Users,
  User,
} from "lucide-react-native";
import type { OrganizationFeatures } from "@vytal-fit/shared";
import { useAppStore } from "@/stores/app-store";
import { useAuthStore } from "@/stores/auth-store";
import { getOrgSettings } from "@/lib/auth-api";
import { canAccess, resolveFeatures } from "@/lib/features";
import { getColors } from "@/colors";
import { t } from "@/i18n";

export default function TabLayout() {
  const theme = useAppStore((s) => s.theme);
  const C = getColors(theme);

  const activeOrgId = useAuthStore((s) => s.activeOrgId);
  const user = useAuthStore((s) => s.user);

  const membership = user?.memberships.find(
    (m) => m.organizationId === activeOrgId,
  );
  const role = membership?.role ?? "athlete";
  const orgType = membership?.organization.type ?? null;

  // While loading, treat all features as enabled to avoid hiding tabs on a flash.
  const [features, setFeatures] = useState<OrganizationFeatures | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!activeOrgId) {
      setFeatures(null);
      return;
    }
    (async () => {
      try {
        const data = await getOrgSettings(activeOrgId);
        if (!cancelled) setFeatures(resolveFeatures(orgType, data.features));
      } catch {
        // Fail open: keep all tabs enabled if org settings can't be fetched.
        if (!cancelled) setFeatures(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeOrgId, orgType]);

  // No features loaded yet (loading or fail-open) => allow everything.
  const gate = (requiresFeature?: keyof OrganizationFeatures): boolean =>
    features
      ? canAccess(features, role, requiresFeature ? { requiresFeature } : {})
      : true;

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
          href: gate("groupClasses") ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <CalendarDays size={18} color={color} strokeWidth={focused ? 2.4 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="wod"
        options={{
          title: t("tab.wod"),
          href: gate("wods") ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <Dumbbell size={18} color={color} strokeWidth={focused ? 2.4 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: t("tab.records"),
          href: gate("personalRecords") ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <Trophy size={18} color={color} strokeWidth={focused ? 2.4 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: t("tab.community"),
          href: gate("community") ? undefined : null,
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

