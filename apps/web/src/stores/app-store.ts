import { create } from "zustand";

const THEME_STORAGE_KEY = "vytal-theme";
const SIDEBAR_STORAGE_KEY = "vytal-sidebar-collapsed";
const ACCENT_STORAGE_KEY = "vytal-accent-color";

type Theme = "dark" | "light";

interface AppState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
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

export const useAppStore = create<AppState>((set) => ({
  theme: "dark",
  sidebarCollapsed: false,
  accentColor: "#22c55e",

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

  setAccentColor: (color: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ACCENT_STORAGE_KEY, color);
    }
    applyAccentColor(color);
    set({ accentColor: color });
  },

  hydrate: () => {
    if (typeof window === "undefined") return;
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const storedSidebar = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    const storedAccent = localStorage.getItem(ACCENT_STORAGE_KEY);
    const theme = storedTheme === "light" ? "light" : "dark";
    const accentColor = storedAccent ?? "#22c55e";
    applyThemeClass(theme);
    applyAccentColor(accentColor);
    set({
      theme,
      sidebarCollapsed: storedSidebar === "true",
      accentColor,
    });
  },
}));
