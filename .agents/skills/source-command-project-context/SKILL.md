---
name: "source-command-project-context"
description: "Load full Vytal project context — architecture, stack, conventions, and scope boundaries"
---

# source-command-project-context

Use this skill when the user asks to run the migrated source command `project-context`.

## Command Template

# Vytal Project Context

You are working on **Vytal**, an AI-powered SaaS platform for intelligent management of CrossFit boxes, functional training gyms, and personal trainers.

## Scope Boundary

This is a self-contained monorepo. You must:
- Only read, search, and modify files within this repo — never access external codebases or projects
- Never use MCP tools, skills, or plugins that belong to other organizations (cb:*, cloudbeds-*, cb-mfe:*, cb-java:*, etc.) — only generic tools and Vytal-specific commands
- All code, configs, dependencies, and deployments target the Vytal product exclusively

## Architecture

Turborepo monorepo:
- `apps/web` — Next.js 15 App Router, deployed on Vercel
- `packages/api` — tRPC routers (backend logic)
- `packages/db` — Drizzle ORM schema, migrations (PostgreSQL)
- `packages/auth` — Better Auth instance, RBAC, orgs
- `packages/shared` — Shared TypeScript types, constants, utilities

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Web frontend | React 19, Next.js 15, Tailwind CSS 4, Radix UI, shadcn/ui |
| API | tRPC v11, SuperJSON |
| Database | Drizzle ORM, PostgreSQL |
| Auth | Better Auth (JWT, refresh tokens, RBAC, orgs) |
| Build | Turborepo, TypeScript 5 |
| Test | Vitest |
| Deploy | Vercel (web) |
| i18n | Custom — PT, EN, ES |

## Naming Conventions

- Package scope: `@vytal-fit/*`
- Domain: `vytal.fit`
- GitHub: `github.com/vytal-fit/vytal-fit`

## User Personas

- **Gestor/Owner** — Box management, billing, CRM, staff, compliance
- **Coach** — Group class programming, WODs, athlete tracking
- **Personal Trainer** — Session scheduling, client CRM, billing
- **Atleta/Member** — Class booking, WOD tracking, PRs, leaderboard

## Quality Standards

- All UI must support light and dark mode
- All user-facing strings must be translated to PT, EN, and ES
- App must look production-ready at all times
- Use existing shared components and patterns before creating new ones
- Portuguese fiscal compliance (SAF-T, ATCUD, QR fiscal) is mandatory
- RGPD by design — health data encryption, consent, audit logs
