"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores/app-store";

export function ThemeInitializer() {
  const hydrate = useAppStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return null;
}
