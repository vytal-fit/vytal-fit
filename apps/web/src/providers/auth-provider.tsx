"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

const APP_ROUTES_PREFIX = [
  "/dashboard",
  "/members",
  "/classes",
  "/wods",
  "/crm",
  "/staff",
  "/class-types",
  "/locations",
  "/exercises",
  "/plans",
  "/financials",
  "/reports",
  "/communications",
  "/automations",
  "/settings",
  "/dropins",
];

function isAppRoute(pathname: string): boolean {
  return APP_ROUTES_PREFIX.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

function isAuthRoute(pathname: string): boolean {
  return pathname === "/login" || pathname === "/register" || pathname.startsWith("/login/") || pathname.startsWith("/register/");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, hydrate } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    hydrate();
    setHydrated(true);
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated && isAppRoute(pathname)) {
      router.replace("/login");
    }

    if (isAuthenticated && isAuthRoute(pathname)) {
      router.replace("/dashboard");
    }
  }, [hydrated, isAuthenticated, pathname, router]);

  if (!hydrated) {
    return null;
  }

  // Block rendering app routes when not authenticated
  if (!isAuthenticated && isAppRoute(pathname)) {
    return null;
  }

  // Block rendering auth routes when authenticated
  if (isAuthenticated && isAuthRoute(pathname)) {
    return null;
  }

  return <>{children}</>;
}
