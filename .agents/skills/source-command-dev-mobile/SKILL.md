---
name: "source-command-dev-mobile"
description: "Start Vytal mobile development server (Expo)"
---

# source-command-dev-mobile

Use this skill when the user asks to run the migrated source command `dev-mobile`.

## Command Template

Start the Vytal mobile app development server (Expo/React Native).

## Steps

1. Check that dependencies are installed — if `node_modules` looks stale or missing, run `npm install` first.
2. Start the Expo dev server:
   ```
   npm run dev:mobile
   ```
   This starts Expo via Turborepo, watching `@vytal-fit/shared` for changes.

## Running on devices

- **iOS Simulator:** press `i` in the Expo CLI, or run `cd apps/mobile && npx expo run:ios`
- **Android Emulator:** press `a` in the Expo CLI, or run `cd apps/mobile && npx expo run:android`
- **Physical device:** install Expo Go, scan the QR code shown in the terminal

## Prerequisites

- **iOS:** Xcode with iOS Simulator installed (macOS only)
- **Android:** Android Studio with an AVD configured, or a physical device with USB debugging
- **Expo CLI:** included via `npx`, no global install needed

## Troubleshooting

- **Metro bundler port conflict** — kill existing Metro processes: `lsof -ti:8081 | xargs kill -9`
- **Pod install issues (iOS)** — run `cd apps/mobile/ios && pod install` (if ios/ dir exists)
- **Missing native modules** — run `npx expo prebuild` then rebuild
