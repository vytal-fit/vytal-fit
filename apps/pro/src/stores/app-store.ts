import { create } from "zustand";
import { mockOrgAccentColors, STORAGE_KEYS } from "@vytal-fit/shared";

const THEME_STORAGE_KEY = STORAGE_KEYS.theme;
const SIDEBAR_STORAGE_KEY = STORAGE_KEYS.sidebarCollapsed;
const RIGHT_SIDEBAR_STORAGE_KEY = STORAGE_KEYS.rightSidebarOpen;
const ACCENT_STORAGE_KEY = STORAGE_KEYS.accentColor;
const ORG_ACCENT_COLORS_KEY = STORAGE_KEYS.orgAccentColors;

type Theme = "dark" | "light";

interface AppState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  rightSidebarOpen: boolean;
  toggleRightSidebar: () => void;
  setRightSidebarOpen: (open: boolean) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  orgAccentColors: Record<string, string>;
  setOrgAccentColor: (orgId: string, color: string) => void;
  applyOrgAccentColor: (orgId: string) => void;
  hydrate: () => void;
}

function applyThemeClass(theme: Theme) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.classList.remove("dark", "light");
  html.classList.add(theme);
}

function applyAccentColor(color: string) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--color-vytal-green", color);
}

function loadOrgAccentColors(): Record<string, string> {
  if (typeof window === "undefined") return { ...mockOrgAccentColors };
  try {
    const raw = localStorage.getItem(ORG_ACCENT_COLORS_KEY);
    if (!raw) return { ...mockOrgAccentColors };
    return { ...mockOrgAccentColors, ...JSON.parse(raw) };
  } catch {
    return { ...mockOrgAccentColors };
  }
}

function persistOrgAccentColors(colors: Record<string, string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ORG_ACCENT_COLORS_KEY, JSON.stringify(colors));
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: "dark",
  sidebarCollapsed: false,
  rightSidebarOpen: false,
  accentColor: "#22c55e",
  orgAccentColors: loadOrgAccentColors(),

  setTheme: (theme: Theme) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
    applyThemeClass(theme);
    set({ theme });
  },

  toggleTheme: () => {
    set((state) => {
      const next: Theme = state.theme === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      }
      applyThemeClass(next);
      return { theme: next };
    });
  },

  toggleSidebar: () => {
    set((state) => {
      const next = !state.sidebarCollapsed;
      if (typeof window !== "undefined") {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      }
      return { sidebarCollapsed: next };
    });
  },

  toggleRightSidebar: () => {
    set((state) => {
      const next = !state.rightSidebarOpen;
      if (typeof window !== "undefined") {
        localStorage.setItem(RIGHT_SIDEBAR_STORAGE_KEY, String(next));
      }
      return { rightSidebarOpen: next };
    });
  },

  setRightSidebarOpen: (open: boolean) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(RIGHT_SIDEBAR_STORAGE_KEY, String(open));
    }
    set({ rightSidebarOpen: open });
  },

  setAccentColor: (color: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ACCENT_STORAGE_KEY, color);
    }
    applyAccentColor(color);
    set({ accentColor: color });
  },

  setOrgAccentColor: (orgId: string, color: string) => {
    const updated = { ...get().orgAccentColors, [orgId]: color };
    persistOrgAccentColors(updated);
    applyAccentColor(color);
    set({ orgAccentColors: updated, accentColor: color });
    if (typeof window !== "undefined") {
      localStorage.setItem(ACCENT_STORAGE_KEY, color);
    }
  },

  applyOrgAccentColor: (orgId: string) => {
    const colors = get().orgAccentColors;
    const color = colors[orgId] ?? "#22c55e";
    applyAccentColor(color);
    set({ accentColor: color });
    if (typeof window !== "undefined") {
      localStorage.setItem(ACCENT_STORAGE_KEY, color);
    }
  },

  hydrate: () => {
    if (typeof window === "undefined") return;
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const storedSidebar = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    const storedRightSidebar = localStorage.getItem(RIGHT_SIDEBAR_STORAGE_KEY);
    const storedAccent = localStorage.getItem(ACCENT_STORAGE_KEY);
    const theme = storedTheme === "light" ? "light" : "dark";
    const accentColor = storedAccent ?? "#22c55e";
    const orgAccentColors = loadOrgAccentColors();
    applyThemeClass(theme);
    applyAccentColor(accentColor);
    set({
      theme,
      sidebarCollapsed: storedSidebar === "true",
      rightSidebarOpen: storedRightSidebar === "true",
      accentColor,
      orgAccentColors,
    });
  },
}));
