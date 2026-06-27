/**
 * Single source of truth for the web app's browser-storage keys.
 *
 * Data-layer rule (F1): persistent app/domain data lives in PostgreSQL and is
 * read/written exclusively through the tRPC API. localStorage holds ONLY client
 * preferences (theme, language, layout) and demo/offline caches — and every key
 * is referenced from here. Never hardcode a "vytal-*" string in a store, page or
 * component: a rename is then one edit and grep finds every use.
 *
 * Per-organization caches append the org id to the relevant base key
 * (e.g. `${STORAGE_KEYS.data}-${orgId}`).
 */
export const STORAGE_KEYS = {
  // Session & identity
  auth: "vytal-auth",
  // Preferences
  theme: "vytal-theme",
  landingTheme: "vytal-landing-theme",
  language: "vytal-language",
  accentColor: "vytal-accent-color",
  orgAccentColors: "vytal-org-accent-colors",
  sidebarCollapsed: "vytal-sidebar-collapsed",
  rightSidebarOpen: "vytal-right-sidebar-open",
  dashboardLayout: "vytal-dashboard-layout",
  appConfig: "vytal-app-config",
  // Per-org caches (base keys; append `-${orgId}`)
  data: "vytal-data",
  orgSettings: "vytal-org-settings",
  messages: "vytal-messages",
  // Setup / onboarding
  setupChecklist: "vytal-setup-checklist",
  setupDismissed: "vytal-setup-dismissed",
  // Console / athlete demo caches (slated to move to tRPC — see NEXT_STEPS F2/F4)
  automations: "vytal-automations",
  communityFeed: "vytal-community-feed",
  progressGoals: "vytal-progress-goals",
  consoleBookings: "vytal-console-bookings",
  consoleCheckins: "vytal-console-checkins",
  consoleWodLogs: "vytal-console-wod-logs",
  consoleExtraPrs: "vytal-console-extra-prs",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
