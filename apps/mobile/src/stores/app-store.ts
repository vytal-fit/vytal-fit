import { create } from "zustand";

interface AppState {
  theme: "dark" | "light";
  accentColor: string;
  language: "pt" | "en" | "es";
  setTheme: (t: "dark" | "light") => void;
  setAccentColor: (c: string) => void;
  setLanguage: (l: "pt" | "en" | "es") => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: "dark",
  accentColor: "#22c55e",
  language: "pt",

  setTheme: (t) => set({ theme: t }),
  setAccentColor: (c) => set({ accentColor: c }),
  setLanguage: (l) => set({ language: l }),
}));
