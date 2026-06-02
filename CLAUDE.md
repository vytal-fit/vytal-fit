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
  web/          — Next.js 15 App Router (Vercel deployment)
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
- **Deploy:** Vercel (web), Expo EAS (mobile)
- **i18n:** Portuguese (pt), English (en), Spanish (es)

## Key Conventions

- Package names use `@vytal-fit/` scope
- All UI must support PT/ES/EN

## Commands

```bash
npm run dev:web      # Start web dev server
npm run dev:mobile   # Start Expo dev server
npm run build:web    # Build web for production
npm run lint         # Lint all packages
npm run type-check   # Type check all packages
npm test             # Run all tests
npm run test:watch   # Tests in watch mode
```

## Rules

- This is a self-contained monorepo. Only read, search, and modify files within this repo.
- Do not use MCP tools, skills, or plugins that belong to other organizations (cb:*, cloudbeds-*, cb-mfe:*, cb-java:*, etc.). Only use generic tools and Vytal-specific commands.
- All code, configs, dependencies, and deployments target the Vytal product exclusively.
