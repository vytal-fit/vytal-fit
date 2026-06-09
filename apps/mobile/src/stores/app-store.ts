import { create } from "zustand";

interface AppState {
  theme: "dark" | "light";
  accentColor: string;
  language: "pt" | "en" | "es";
  setTheme: (t: "dark" | "light") => void;
  toggleTheme: () => void;
  setAccentColor: (c: string) => void;
  setLanguage: (l: "pt" | "en" | "es") => void;
  hydrate: () => void;
}

const APP_STORE_KEY = "vytal-app-store";

function persistAppState(state: { theme: string; language: string; accentColor: string }) {
  try {
    if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
      localStorage.setItem(APP_STORE_KEY, JSON.stringify(state));
    }
  } catch {}
}

function loadAppState(): { theme: "dark" | "light"; language: "pt" | "en" | "es"; accentColor: string } | null {
  try {
    if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
      const raw = localStorage.getItem(APP_STORE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {}
  return null;
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: "dark",
  accentColor: "#22c55e",
  language: "pt",

  setTheme: (t) => {
    set({ theme: t });
    const s = get();
    persistAppState({ theme: t, language: s.language, accentColor: s.accentColor });
  },
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    set({ theme: next });
    const s = get();
    persistAppState({ theme: next, language: s.language, accentColor: s.accentColor });
  },
  setAccentColor: (c) => {
    set({ accentColor: c });
    const s = get();
    persistAppState({ theme: s.theme, language: s.language, accentColor: c });
  },
  setLanguage: (l) => {
    set({ language: l });
    const s = get();
    persistAppState({ theme: s.theme, language: l, accentColor: s.accentColor });
  },
  hydrate: () => {
    const saved = loadAppState();
    if (saved) {
      set({ theme: saved.theme, language: saved.language, accentColor: saved.accentColor });
    }
  },
}));
