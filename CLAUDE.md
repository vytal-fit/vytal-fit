# Vytal

AI-powered SaaS platform for intelligent management of CrossFit boxes, functional training gyms, and personal trainers.

## Project Identity

- **Name:** Vytal
- **Domain:** vytal.fit
- **GitHub:** github.com/vytal-fit/vytal-fit
- **Package scope:** @vytal-fit/*

## Architecture

```
apps/
  landing/      — Next.js 15 public site (Vercel project: landing)
  pro/          — Next.js 15 staff/backoffice app (Vercel project: pro)
  my/           — Next.js 15 athlete/member portal (Vercel project: my)
  api/          — Next.js 15 API origin (Vercel project: api)
  docs/         — local/internal docs reader; public docs sync from apps/api/readme
  mobile/       — Expo 54 / React Native (iOS + Android)
packages/
  api/          — tRPC routers (shared backend logic)
  db/           — Drizzle ORM schema + migrations
  auth/         — Better Auth instance + schema
  shared/       — Shared types, constants, utilities
```

## Tech Stack

- **Frontend:** React 19, Next.js 15 (App Router), Tailwind CSS, Radix UI, shadcn/ui
- **Backend:** tRPC, Drizzle ORM, PostgreSQL
- **Build:** Turborepo, TypeScript 5, npm workspaces
- **Test:** Vitest
- **Mobile:** Expo 54, React Native, Zustand
- **Deploy:** Vercel projects for landing/pro/my/api, Expo EAS (mobile)
- **i18n:** Portuguese (pt), English (en), Spanish (es)

## Key Conventions

- Package names use `@vytal-fit/` scope
- All UI must support PT/ES/EN
- **Data layer:** persistent app/domain data flows through the tRPC API (`packages/api`), never `localStorage`. `localStorage` holds only preferences and demo/offline caches.
- **Storage keys:** reference `STORAGE_KEYS` from `@vytal-fit/shared` — never hardcode `vytal-*` strings.

## Commands

```bash
npm run dev:landing   # Start public site dev server
npm run dev:pro       # Start staff/backoffice dev server
npm run dev:my        # Start athlete portal dev server
npm run dev:api       # Start API origin dev server
npm run dev:mobile    # Start Expo dev server
npm run build         # Build all workspace packages/apps through Turbo
npm run build:pro     # Build pro for production
npm run build:my      # Build my for production
npm run build:api     # Build API for production
npm run lint          # Lint all packages
npm run type-check    # Type check all packages
npm test              # Run all tests
npm run test:e2e      # Run Playwright E2E tests
npm run docs:readme:sync # Upload OpenAPI + apps/api/readme guides to ReadMe
```

## Rules

- This is a self-contained monorepo. Only read, search, and modify files within this repo.
- Do not use MCP tools, skills, or plugins that belong to other organizations (cb:*, cloudbeds-*, cb-mfe:*, cb-java:*, etc.). Only use generic tools and Vytal-specific commands.
- All code, configs, dependencies, and deployments target the Vytal product exclusively.
