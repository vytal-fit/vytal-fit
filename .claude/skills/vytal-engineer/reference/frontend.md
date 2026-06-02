# Frontend reference — web (Next.js)

## Web — `apps/web` (Next.js 15 App Router, React 19)

Structure:
- `src/app/(app)/…` — authenticated app routes (the product). Route segments
  mirror PRD personas (`/dashboard`, `/members`, `/classes`, `/wods`…).
- `src/app/(auth)/…` — login, register, onboarding flows.
- `src/components/ui/*` — design-system primitives. **Reuse these first.**
  Only add a new primitive when none fits.

Patterns:
- **Server Components by default.** Add `"use client"` only for interactivity
  (state, effects, event handlers, tRPC hooks).
- **Data fetching:** tRPC + TanStack Query v5 (`@trpc/react-query`). Server
  state lives in the query cache — do not mirror it into Zustand. Zustand is for
  ephemeral UI state (open panels, filters, drafts).
- **Forms:** react-hook-form + Zod. Reuse the same Zod schema the tRPC procedure
  validates with (from `@vytal-fit/shared`).
- **Mutations:** optimistic update or invalidate the relevant query on success;
  surface errors with toast. Never leave a failed mutation silent.
- **Loading/empty/error states are required**, not optional. Use skeletons for
  loading and empty-state components for empty.

## Design System

### Colors (dark theme primary)

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#080c0a` | Main background |
| `--bg2` | `#0f1610` | Cards, modals |
| `--bg3` | `#162018` | Tertiary containers |
| `--g` | `#3dff6e` | Primary action (green) |
| `--b` | `#00d4ff` | Information (blue) |
| `--a` | `#ffb300` | Warning (amber) |
| `--r` | `#ff4757` | Error/alert (red) |
| `--p` | `#c084fc` | Premium (purple) |
| `--o` | `#ff8c42` | Secondary CTA (orange) |
| `--t` | `#dceee0` | Primary text |
| `--m` | `#6b8c72` | Muted text |

### Typography

- Display: Space Grotesk, 700, clamp(28px, 4vw, 52px)
- Body: Space Grotesk, 400-500, 12-14px
- Labels: Space Grotesk, 700, 9px, uppercase, letter-spacing 2.5px
- Monospace: Space Mono, 400, 10-13px

### Components

- Cards: `rgba(22,32,24,.9)` bg, `rgba(61,255,110,.1)` border, 10px radius
- Badges: translucent bg + border per color (green, blue, amber, red, purple, orange)
- Buttons: transparent border, hover `rgba(61,255,110,.3)` border
- Inputs: `#0f1610` bg, `rgba(61,255,110,.1)` border, 8px radius

## i18n — every string, three languages

- **No hardcoded user-facing copy.** Add keys in `pt`, `en`, **and** `es`.
  Missing one language is a bug.
- Run `/i18n-check` to find stragglers before finishing.
- Market default is Portugal (PT); copy must read naturally in PT-PT.

## Theming — light + dark, always

- **Dark mode is the default**; light mode must work too. Every surface uses
  design tokens — **never hardcoded hex**.
- Verify both themes for every new/changed surface.

## Accessibility & responsiveness

- Mobile-first. Breakpoints sm 640 / md 768 / lg 1024 / xl 1280.
- Keyboard navigable, visible focus rings, labelled inputs, sufficient contrast.
- All critical actions in <=3 taps (booking, check-in, result entry).

## Before you call frontend work done

- type-check + lint green; no new `any`.
- Strings in PT+EN+ES; verified light **and** dark.
- Loading / empty / error states present.
- Reused `components/ui/*` where possible.
- Hand off to **`vytal-qa`** for a real-browser pass.
