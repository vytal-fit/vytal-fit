# Vytal -- Product Requirements Document

**Version:** 3.0
**Last updated:** 2026-06-06
**Status:** Active
**Team:** vytal-fit
**Repository:** github.com/vytal-fit/vytal-fit (public)

> This document is the **single source of truth** for the Vytal product. All design, engineering, and business decisions reference this PRD.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [User Personas & Roles](#2-user-personas--roles)
3. [Core Principles](#3-core-principles)
4. [Design System](#4-design-system)
5. [Architecture & Tech Stack](#5-architecture--tech-stack)
6. [Screen Inventory -- Admin Web](#6-screen-inventory----admin-web)
7. [Screen Inventory -- Mobile Client](#7-screen-inventory----mobile-client)
8. [User Stories](#8-user-stories)
9. [Community & Social](#9-community--social)
10. [Organization Verticals](#10-organization-verticals)
11. [Competitive Analysis Summary](#11-competitive-analysis-summary)
12. [Integrations](#12-integrations)
13. [Roadmap](#13-roadmap)
14. [Implementation Status](#14-implementation-status)
15. [Backlog Summary](#15-backlog-summary)
16. [Key Constraints](#16-key-constraints)

---

## 1. Product Overview

### 1.1 Mission

**Vytal** is a SaaS platform for intelligent management of **any fitness or wellness space** -- from CrossFit boxes and traditional gyms to yoga studios, martial arts academies, climbing gyms, and rehabilitation clinics.

**Core mission:** Enable fitness businesses to operate completely independently -- replacing fragmented tools (Regibox, Wodify, spreadsheets, WhatsApp groups) with a single, modern, AI-powered platform.

### 1.2 What Makes Vytal Different

| Dimension | Vytal | Legacy Competitors |
|---|---|---|
| **Vertical coverage** | 20 fitness/wellness verticals, adaptive terminology | CrossFit-only or generic |
| **Multi-org** | Users belong to multiple organizations with different roles | One account per gym |
| **Architecture** | Next.js 15, React Native, tRPC, WebSockets | PHP/jQuery, iframes, no real-time |
| **Offline** | Coach app and kiosk work without internet | No offline support |
| **AI** | Churn prediction, WOD suggestions, readiness (Phase 2+) | None |
| **Fiscal** | Native SAF-T, ATCUD, QR fiscal | Via 3rd-party (Vendus) |
| **Pricing** | All features included | Feature gates, paid modules |

### 1.3 Supported Verticals (20)

CrossFit Box, Functional Training, Gym, Yoga Studio, Pilates Studio, Martial Arts, Personal Training Studio, Swimming Pool, Dance Studio, Health Club, Sports Club, Climbing Gym, Cycling / Spinning Studio, Running Club, Gymnastics Academy, Rehabilitation / Physiotherapy, Weightlifting Club, Outdoor / Boot Camp, Surf / Water Sports, Other (fully customizable).

See [Section 9](#9-organization-verticals) for the complete vertical configuration matrix.

### 1.4 Target Market

- **Phase 1:** Portugal (fiscal compliance: SAF-T, ATCUD, MBWay, SEPA, RGPD)
- **Phase 2:** EU expansion (Spain, France, Germany)
- **Phase 3:** LATAM (Brazil, Portuguese-speaking markets)

### 1.5 Multi-Organization Model

A single Vytal user account can hold memberships across multiple organizations with different roles at each. Examples:

- Owner at "CrossFit Aveiro" + Athlete at "Yoga Flow Porto"
- Coach at "Box A" + Admin at "Box B" + Athlete at "Climbing Gym C"

The active organization is switchable via the org switcher in the admin sidebar or the mobile app home screen.

---

## 2. User Personas & Roles

### 2.1 Role Hierarchy

```
Owner (5) > Admin (4) > Coach (3) > PT (2) > Athlete (1)
```

Each role inherits permissions from all roles below it.

### 2.2 Persona Definitions

| Persona | Role Level | Description | Vertical-Adaptive Title |
|---|---|---|---|
| **Gestor/Owner** | 5 | Business management, billing, CRM, staff, compliance, full platform control | Owner |
| **Admin** | 4 | Same as Owner minus ownership transfer and billing config | Admin |
| **Coach** | 3 | Group class programming, WODs, athlete tracking, coachboard, TV display | Coach, Instructor, Sensei, Teacher |
| **Personal Trainer** | 2 | 1:1 session scheduling, client CRM, workout plans, billing | PT, Trainer, Therapist |
| **Athlete/Member** | 1 | Class booking, WOD tracking, PRs, leaderboard, notifications | Athlete, Student, Client, Climber, Rider, Runner, Swimmer, Dancer, Player, Gymnast, Lifter, Patient, Participant, Member |
| **Nutricionista** | Specialist | Nutrition plans and tracking (Phase 3+) | -- |
| **Fisioterapeuta** | Specialist | Rehabilitation and injury management (Phase 3+) | -- |

### 2.3 Multi-Org Membership

```typescript
interface OrgMembership {
  userId: string;
  organizationId: string;
  role: "owner" | "admin" | "coach" | "pt" | "athlete";
  status: "active" | "inactive" | "suspended" | "invited";
  memberNumber?: number;
  planId?: string;          // athletes
  coachSpecialty?: string;  // coaches/pts
}
```

A `UserWithOrgs` object contains the user profile plus an array of memberships, each linked to an organization. The `activeOrganizationId` determines which org context is currently in use.

---

## 3. Core Principles

| # | Principle | Description |
|---|---|---|
| 1 | **Velocidade acima de tudo** | Critical actions in 3 taps or 2 seconds max |
| 2 | **Offline-first** | Coach App and Kiosk work without internet; sync on reconnect |
| 3 | **Fiscal PT nativo** | SAF-T, ATCUD, QR fiscal mandatory from MVP |
| 4 | **RGPD by design** | Granular consent, right to erasure, audit logs, health data encryption (Art. 9) |
| 5 | **Modular e extensivel** | Each profile has independent UI/permissions; new modules without core rewrites |
| 6 | **IA responsavel** | All AI suggestions include disclaimers; guardrails required; no medical diagnosis |
| 7 | **Multi-vertical by design** | Every feature adapts its terminology, feature flags, and UI to the organization type |
| 8 | **Multi-org native** | A user is a platform citizen, not locked to one gym; org switching is seamless |

---

## 4. Design System

### 4.1 Color Palette

#### Primary Colors

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#080c0a` | Main app background |
| `--bg2` | `#0f1610` | Cards, modals, secondary surfaces |
| `--bg3` | `#162018` | Tertiary containers |
| `--g` (green) | `#3dff6e` | Primary action, buttons, active states, highlights |
| `--t` (text) | `#dceee0` | Primary text on dark backgrounds |
| `--m` (muted) | `#6b8c72` | Secondary text, captions |
| `--border` | `rgba(61,255,110,.1)` | Subtle borders |
| `--card` | `rgba(22,32,24,.9)` | Card backgrounds |

#### Secondary Colors

| Token | Hex | Usage |
|---|---|---|
| `--b` (blue) | `#00d4ff` | Information, secondary actions, status |
| `--a` (amber) | `#ffb300` | Warnings, caution, medium priority |
| `--r` (red) | `#ff4757` | Errors, alerts, destructive actions |
| `--p` (purple) | `#c084fc` | Premium tier, special features |
| `--o` (orange) | `#ff8c42` | Secondary CTAs, highlights |

#### Badge System

Each color has a badge variant with translucent background and border:

| Badge | Background | Border | Text |
|---|---|---|---|
| Green | `rgba(61,255,110,.12)` | `rgba(61,255,110,.3)` | `#3dff6e` |
| Blue | `rgba(0,212,255,.1)` | `rgba(0,212,255,.25)` | `#00d4ff` |
| Amber | `rgba(255,179,0,.1)` | `rgba(255,179,0,.25)` | `#ffb300` |
| Red | `rgba(255,71,87,.12)` | `rgba(255,71,87,.3)` | `#ff4757` |
| Purple | `rgba(192,132,252,.1)` | `rgba(192,132,252,.25)` | `#c084fc` |
| Orange | `rgba(255,140,66,.1)` | `rgba(255,140,66,.25)` | `#ff8c42` |

#### Role Colors

| Role | Hex |
|---|---|
| Owner | `#3dff6e` |
| Admin | `#00d4ff` |
| Coach | `#c084fc` |
| PT | `#ff8c42` |
| Athlete | `#6b8c72` |

### 4.2 Typography

| Element | Font | Size | Weight | Line-Height |
|---|---|---|---|---|
| Display | Space Grotesk | `clamp(28px, 4vw, 52px)` | 700 | 1.08 |
| Headline | Space Grotesk | 18px | 700 | -- |
| Subheadline | Space Grotesk | 13px | 600 | -- |
| Body | Space Grotesk | 12-14px | 400-500 | 1.6-1.75 |
| Label | Space Grotesk | 9px | 700 | -- |
| Monospace | Space Mono | 10-13px | 400 | -- |

Letter-spacing: Display `-0.5px`, Labels `2.5px`, Table headers `1.5px`.

### 4.3 Component Patterns

**Cards:** `rgba(22,32,24,.9)` background, `1px solid rgba(61,255,110,.1)` border, `10px` radius, `18-20px` padding. Hover: border to `rgba(61,255,110,.22)`.

**Buttons:** Transparent border default. Hover: border `rgba(61,255,110,.3)`, background `rgba(61,255,110,.08)`. Transition `0.15s`.

**Inputs:** `#0f1610` background, `rgba(61,255,110,.1)` border, `8px` radius. Focus: border `rgba(61,255,110,.4)`.

**Gradient:** `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(61,255,110,.05), transparent)`.

### 4.4 Logo

- **Mark:** Circular green (`#3dff6e`) background with white monospace "V"
- **Text:** "VYTAL" in Space Grotesk 17px, weight 700, letter-spacing 0.5px
- **Version badge:** Muted gray (`#6b8c72`), 9px, uppercase, letter-spacing 2px

---

## 5. Architecture & Tech Stack

### 5.1 Monorepo Structure

```
apps/
  web/              -- Next.js 15 App Router (Vercel deployment)
  mobile/           -- Expo 54 / React Native (iOS + Android)
packages/
  api/              -- tRPC routers (shared backend logic)
  db/               -- Drizzle ORM schema + migrations
  auth/             -- Better Auth instance + schema
  shared/           -- Shared types, constants, mock data, vertical configs
```

### 5.2 Tech Stack

| Layer | Technology |
|---|---|
| **Web** | Next.js 15 (App Router), React 19, Tailwind CSS 4, Radix UI, shadcn/ui |
| **Mobile** | Expo 54, React Native, Zustand (state management) |
| **API** | tRPC, Node.js |
| **Database** | PostgreSQL (OLTP) |
| **Cache** | Redis (sessions, real-time) |
| **Real-time** | WebSockets (coachboard, leaderboard, timers) |
| **Auth** | Better Auth (JWT + refresh tokens, RBAC) |
| **ORM** | Drizzle ORM |
| **Storage** | AWS S3 (exercise videos, media) |
| **Build** | Turborepo, TypeScript 5, npm workspaces |
| **Unit Test** | Vitest |
| **E2E Test** | Playwright |
| **Deploy** | Vercel (web), Expo EAS (mobile) |
| **CI/CD** | GitHub Actions |
| **i18n** | Portuguese (pt), English (en), Spanish (es) |

### 5.3 Multi-Org Data Model

```
User (1) ---< OrgMembership >--- (1) Organization
                |
           role, status,
           memberNumber,
           planId
```

- A `User` has global fields: name, email, phone, photo, language.
- An `OrgMembership` binds a user to an org with a role and status.
- Organization-scoped data (classes, WODs, plans, billing) is always filtered by `organizationId`.

### 5.4 Organization Type Config System

Each organization type produces an `OrganizationTypeConfig` with:

- **Terminology:** 12 adaptive strings (organization, member, instructor, session, workout, result, record, checkin, booking, and their plurals)
- **Feature flags:** 18 boolean toggles controlling which modules appear (wods, leaderboard, personalRecords, rxScaled, timers, rmCalculator, gamification, fistbumps, dropins, tvDisplay, movementLibrary, beltSystem, personalTraining, nutritionTracking, bodyComposition, groupClasses, openGym, store)
- **Default class types:** Pre-configured class type names per vertical

This config drives conditional rendering throughout the admin web and mobile client.

### 5.5 Security & Compliance

- **Auth:** JWT + refresh tokens with RBAC; role hierarchy enforced server-side
- **RGPD:** Consent management, audit logs, right to erasure, Art. 9 health data encryption at rest
- **Payments:** SCA/3DS compliant for EU transactions
- **Feature flags:** Per-country, per-plan toggles without re-deploy

---

## 6. Screen Inventory -- Admin Web

The admin web application lives at `apps/web/src/app/`. It uses Next.js 15 App Router with route groups: `(auth)` for authentication flows and `(app)` for authenticated admin pages.

### 6.1 Authentication Pages (3 pages)

| # | Route | Status | Purpose | Key Features | Stories |
|---|---|---|---|---|---|
| 1 | `/(auth)/login` | Built (POC) | User authentication | Email/password form, "Forgot password" link, social login placeholders | -- |
| 2 | `/(auth)/register` | Built (POC) | New account creation | Name, email, password form, terms acceptance | -- |
| 3 | `/(auth)/onboarding` | Built (POC) | 3-step organization setup wizard | Step 1: Select vertical (20 types). Step 2: Organization details (name, email, location). Step 3: Invite staff + confirm. | G5-01 |

### 6.2 Admin Dashboard & Operations (20 pages)

| # | Route | Status | Purpose | Key Features | Stories |
|---|---|---|---|---|---|
| 4 | `/(app)/dashboard` | Built (POC) | Daily operations overview | KPI cards (members, revenue, churn, occupancy), today's classes, alerts widget, at-risk members, pending actions | G1-01, G1-02, G1-03 |
| 5 | `/(app)/members` | Built (POC) | Member list and search | DataTable with search, filter by status/plan/frequency, stats bar (total/active/inactive), bulk actions | G2-01, G2-04 |
| 6 | `/(app)/members/[id]` | Built (POC) | Individual member profile | Profile card, attendance history, plan details, payment history, health info, coaching notes, injury flags | G2-01, G2-05, G2-06 |
| 7 | `/(app)/classes` | Built (POC) | Class calendar and management | Weekly/monthly calendar (FullCalendar-style), click-to-create, drag-and-drop, copy week, filter by location/coach/type, color-coded events | C2-01 |
| 8 | `/(app)/classes/[id]` | Built (POC) | Individual class detail | Enrolled athletes, waitlist, coach assignment, capacity, check-in controls, real-time occupancy | C2-01, C2-03 |
| 9 | `/(app)/class-types` | Built (POC) | Class type configuration | Name, abbreviation, color picker, icon selector, active/inactive toggle, email notification toggle | C2-01 |
| 10 | `/(app)/wods` | Built (POC) | WOD builder and programming | Weekly calendar, structured parts (Warm Up/Skill/WOD/Cool Down), exercise selection, publish to app, auto-save drafts | C1-01, C1-03 |
| 11 | `/(app)/exercises` | Built (POC) | Exercise/movement library | 200+ movements, video links, categories, equipment tags, muscle groups, scaled variations, search and filter | C1-02 |
| 12 | `/(app)/plans` | Built (POC) | Subscription plan management | Plan types (monthly/quarterly/annual/pack/day pass/trial), pricing, allowed class types, session limits, time slot rules | G2-02 |
| 13 | `/(app)/financials` | Built (POC) | Billing and revenue overview | Revenue charts, payment history, overdue list, dunning config, invoice list, SAF-T export placeholder | G3-01, G3-02, G3-03 |
| 14 | `/(app)/crm` | Built (POC) | Lead pipeline kanban | Configurable columns (Lead/Contacted/Prospect/Trial/Subscribed/Lost), lead cards, quick actions (call/email/trial), auto-lead from forms | G4-01, G4-02 |
| 15 | `/(app)/communications` | Built (POC) | Multi-channel messaging | Email, push, SMS, in-app news; audience targeting by segment/plan/status; template editor; schedule send | G4-02, G4-03 |
| 16 | `/(app)/staff` | Built (POC) | Staff management | Staff list with roles, invite by email, role assignment, shift calendar, permissions matrix | G5-01, G5-02 |
| 17 | `/(app)/locations` | Built (POC) | Rooms/locations config | Location CRUD, capacity per room, GPS coordinates, active/inactive toggle | -- |
| 18 | `/(app)/reports` | Built (POC) | Reports and analytics | Attendance reports, revenue reports, member reports, occupancy heatmap, CSV/PDF export | G1-04, G2-04 |
| 19 | `/(app)/settings` | Built (POC) | Organization settings | Org profile (name, logo, address, GPS, social links, timezone, currency), vertical type, billing config, kiosk settings, app content toggles | -- |
| 20 | `/` (root) | Built (POC) | Landing / redirect | Redirects to `/login` or `/dashboard` based on auth state | -- |

### 6.3 Extended Admin Pages (68 pages -- all built)

All admin pages listed below have been built as POC (proof-of-concept) with full UI, mock data, and i18n support.

| # | Route | Status | Purpose | Key Features | Stories |
|---|---|---|---|---|---|
| 21 | `/(app)/members/[id]/edit` | Built (POC) | Member edit form | Inline edit of all member fields, plan assignment, health info, photo upload, save/cancel | G2-01 |
| 22 | `/(app)/members/analytics` | Built (POC) | Member analytics | Attendance trends, churn analysis, engagement metrics, cohort analysis | G2-04 |
| 23 | `/(app)/members/contracts` | Built (POC) | Digital contracts & waivers | Template editor, e-signature flow, document dashboard (signed/pending/expired) | G2-05 |
| 24 | `/(app)/members/groups` | Built (POC) | Member groups/teams | Create groups, assign members, use for filtering across modules | G-NEW-06 |
| 25 | `/(app)/members/referrals` | Built (POC) | Referral program | Referral tracking, reward tiers, invite links, performance stats | G2-09 |
| 26 | `/(app)/members/import` | Built (POC) | Member import | CSV upload with column mapping, preview, duplicate detection | G2-04 |
| 27 | `/(app)/members/retention` | Built (POC) | 16-week retention monitor | 4-phase monitoring board, color-coded attendance, advantage index | G2-06 |
| 28 | `/(app)/members/[id]/360` | Built (POC) | Member 360 view | Complete member profile at a glance -- attendance, billing, health, notes | G2-01 |
| 29 | `/(app)/members/[id]/body` | Built (POC) | Body composition tracking | Weight, body fat, muscle mass charts, goal tracking | P2-04 |
| 30 | `/(app)/members/[id]/assessments` | Built (POC) | Physical assessments | FMS scores, mobility tests, benchmark tracking | P2-04 |
| 31 | `/(app)/members/[id]/billing` | Built (POC) | Member billing detail | Payment history, invoices, plan changes, account balance | G3-01 |
| 32 | `/(app)/members/[id]/nutrition` | Built (POC) | Nutrition tracking | Meal plans, macro tracking, calorie goals, food diary | P2-05 |
| 33 | `/(app)/classes/create` | Built (POC) | Class create/edit | Class type, coach, location, capacity, recurrence rules, time slot picker | C2-01 |
| 34 | `/(app)/classes/calendar` | Built (POC) | Visual class calendar | Weekly/monthly calendar view, drag-and-drop, copy week | C2-01 |
| 35 | `/(app)/classes/smart` | Built (POC) | Smart scheduling | AI-powered class time optimization, demand prediction | G1-07 |
| 36 | `/(app)/classes/templates` | Built (POC) | Class templates | Reusable class configurations, quick-apply to calendar | C2-01 |
| 37 | `/(app)/classes/waitlist` | Built (POC) | Waitlist management | Queue positions, auto-promote rules, notification config | A1-01 |
| 38 | `/(app)/classes/history` | Built (POC) | Class history | Historical class data, attendance records, coach performance | C2-01 |
| 39 | `/(app)/classes/[id]/attendance` | Built (POC) | Class attendance | Real-time check-in, manual entry, attendance stats per class | C2-01 |
| 40 | `/(app)/wods/builder` | Built (POC) | WOD builder | Structured parts, exercise selection, timer config, publish | C1-01 |
| 41 | `/(app)/wods/programming` | Built (POC) | Multi-week programming | Periodization cycles, weekly/monthly planning, copy weeks | C1-05 |
| 42 | `/(app)/crm/[id]` | Built (POC) | Lead detail | Full interaction timeline, stage transitions, conversion actions | G4-01 |
| 43 | `/(app)/plans/create` | Built (POC) | Plan create/edit form | Plan type, pricing, billing cycle, class types, session limits | G2-02 |
| 44 | `/(app)/staff/[id]` | Built (POC) | Staff detail | Staff profile, role/permissions, assigned classes, shift history | G5-01 |
| 45 | `/(app)/staff/[id]/edit` | Built (POC) | Staff edit form | Edit staff fields, role assignment, certifications | G5-01 |
| 46 | `/(app)/staff/[id]/performance` | Built (POC) | Staff performance | Class ratings, attendance stats, member feedback | G5-01 |
| 47 | `/(app)/staff/payroll` | Built (POC) | Staff payroll | Hours tracking, pay calculation, payslip generation | G5-03 |
| 48 | `/(app)/staff/schedule` | Built (POC) | Shift scheduling | Drag-and-drop shift calendar, swap requests, coverage gaps | G5-02 |
| 49 | `/(app)/financials/revenue` | Built (POC) | Revenue forecasting | Trend analysis, projections, MRR/ARR, churn impact | G1-07 |
| 50 | `/(app)/financials/dunning` | Built (POC) | Dunning management | Automated sequences, debtor list, payment reminders | G2-03 |
| 51 | `/(app)/financials/sepa` | Built (POC) | SEPA direct debit | C2B file generation, mandate management, XML returns | G3-01 |
| 52 | `/(app)/financials/invoices` | Built (POC) | Invoice management | Invoice list, SAF-T export, ATCUD, credit notes | G3-02 |
| 53 | `/(app)/financials/expenses` | Built (POC) | Expense tracking | Category assignment, payment methods, warranty tracking | G3-07 |
| 54 | `/(app)/financials/budget` | Built (POC) | Monthly budget | Per-category spending limits, actual vs limit bars | G3-08 |
| 55 | `/(app)/communications/sms` | Built (POC) | SMS compose | Audience selector, character count, schedule send | G4-02 |
| 56 | `/(app)/communications/templates` | Built (POC) | Email templates | Template builder, variable placeholders, preview | G4-02 |
| 57 | `/(app)/settings/kiosk` | Built (POC) | Kiosk configuration | Rotating images, check-in timing, animation themes | A1-02 |
| 58 | `/(app)/settings/app-config` | Built (POC) | Mobile app config | Toggle 20+ app sections, sub-section toggles | G-NEW-04 |
| 59 | `/(app)/settings/audit-log` | Built (POC) | Audit trail | Searchable admin action log, before/after state | G5-01 |
| 60 | `/(app)/settings/permissions` | Built (POC) | Permissions matrix | Granular RBAC, per-module view/edit/delete toggles | G5-01 |
| 61 | `/(app)/settings/webhooks` | Built (POC) | Webhooks config | Endpoint management, event subscriptions, retry policy | NEW |
| 62 | `/(app)/settings/api-keys` | Built (POC) | API keys | Key generation, scoping, rate limits, usage stats | NEW |
| 63 | `/(app)/settings/branding` | Built (POC) | White-label branding | Custom colors, logo, domain, email templates | NEW |
| 64 | `/(app)/settings/notifications` | Built (POC) | Notification rules | Per-event notification config, channels, templates | A1-04 |
| 65 | `/(app)/settings/booking` | Built (POC) | Booking rules | Cancellation policies, advance booking limits, waitlist | A1-01 |
| 66 | `/(app)/ai` | Built (POC) | AI insights | Churn prediction, recommendations, smart alerts | G1-07 |
| 67 | `/(app)/analytics` | Built (POC) | Advanced analytics | Trend analysis, cohort views, custom date ranges | G1-04 |
| 68 | `/(app)/reports/attendance` | Built (POC) | Attendance reports | Heatmaps, per-class stats, coach performance | G1-04 |
| 69 | `/(app)/community` | Built (POC) | Community hub | Social feed, events, member engagement | S1-01 |
| 70 | `/(app)/community/questionnaires` | Built (POC) | Questionnaires | Survey builder, response analytics, templates | G-NEW-10 |
| 71 | `/(app)/community/events` | Built (POC) | Competition builder | Events, heats, scoring, registration | S1-05 |
| 72 | `/(app)/community/badges` | Built (POC) | Achievement badges | 63+ badges, points, levels, streak tracking | S1-08 |
| 73 | `/(app)/store` | Built (POC) | POS store | Product catalog, cart, payment, inventory | G3-04 |
| 74 | `/(app)/store/vouchers` | Built (POC) | Gift cards & vouchers | Create, distribute, redeem, track balances | G-NEW-08 |
| 75 | `/(app)/tasks` | Built (POC) | Task management | Kanban board, drag-and-drop, assignments, due dates | NEW |
| 76 | `/(app)/inbox` | Built (POC) | Unified inbox | Aggregated conversations, filters, quick actions | NEW |
| 77 | `/(app)/automations` | Built (POC) | Automation rules | Trigger/condition/action builder, enable/disable | G4-03 |
| 78 | `/(app)/automations/milestones` | Built (POC) | Milestone automation | Auto-celebrate member achievements, configurable triggers | NEW |
| 79 | `/(app)/exercises/[id]` | Built (POC) | Exercise detail | Video, description, variations, muscle groups | C1-02 |
| 80 | `/(app)/dropins` | Built (POC) | Drop-in management | Visiting athlete tracking, pricing, GPS map | G-NEW-02 |
| 81 | `/(app)/import` | Built (POC) | Import center | CSV/Excel import for members, plans, leads | G2-04 |
| 82 | `/(app)/integrations` | Built (POC) | Integrations hub | Third-party connections, API status, sync config | G4-05 |
| 83 | `/(app)/screen` | Built (POC) | TV display config | Theme selection, auto-mode, remote control pairing | C2-04 |
| 84 | `/(app)/notifications` | Built (POC) | Notification center | All notification types, read/unread, actions | A1-04 |
| 85 | `/(app)/messages` | Built (POC) | Staff messaging | 1:1 and group channels, persistent history | G5-04 |
| 86 | `/(app)/profile` | Built (POC) | User profile | Personal info, preferences, security settings | -- |
| 87 | `/(app)/help` | Built (POC) | Help center | FAQs, contact support, documentation links | -- |
| 88 | `/(app)/locations/dashboard` | Built (POC) | Multi-location dashboard | Location cards, comparison charts, aggregate stats | NEW |
| 89 | `/(app)/media` | Built (POC) | Media library | File grid, folders, upload, search, type filters | NEW |
| 90 | `/(app)/equipment` | Built (POC) | Equipment inventory | Equipment table, condition tracking, maintenance log | G3-06 |
| 91 | `/(app)/changelog` | Built (POC) | What's new | Release timeline, version badges, feature lists | NEW |

**Total admin web pages: 92** (92 built + 0 remaining)

---

## 7. Screen Inventory -- Mobile Client

The mobile client lives at `apps/mobile/app/` using Expo Router (file-based routing). Tab navigation provides 5 main sections.

### 7.1 Authentication (3 screens)

| # | Route | Status | Purpose | Key Features | Stories |
|---|---|---|---|---|---|
| 1 | `/login` | Built (POC) | User login | Email/password, social login buttons, "Forgot password" | -- |
| 2 | `/register` | Built (POC) | New account creation | 3-step wizard: credentials, profile, gym selection | -- |
| 3 | `/index` | Built (POC) | Splash / redirect | Animated splash with Vytal logo, auto-redirect based on auth | -- |

### 7.2 Tab Navigation (5 tabs)

| # | Route | Status | Purpose | Key Features | Stories |
|---|---|---|---|---|---|
| 4 | `/(tabs)/classes` | Built (POC) | Class calendar & booking | Monthly calendar, day class list, class type filter pills, enrollment count, countdown timers, book in 3 taps | A1-01 |
| 5 | `/(tabs)/wod` | Built (POC) | Today's WOD | Collapsible WOD parts, exercise details with videos, score type indicators, action buttons (info/result/leaderboard/comments) | A2-01 |
| 6 | `/(tabs)/records` | Built (POC) | Personal records hub | Movement categories, PR list per movement, progression chart, import PRs button | A2-03 |
| 7 | `/(tabs)/mybox` | Built (POC) | Community hub | 5-tab layout: Rules, Birthdays, Athletes, Coaches, Contact; booking rules display, coach directory | -- |
| 8 | `/(tabs)/profile` | Built (POC) | User profile & settings | Avatar, plan info, stats (check-ins, streaks, medals), settings links, org switcher, logout | A1-03 |

### 7.3 Detail & Action Screens (23 screens)

| # | Route | Status | Purpose | Key Features | Stories |
|---|---|---|---|---|---|
| 9 | `/class-detail` | Built (POC) | Class detail + booking action | Class type, time, coach, enrollment list, book/cancel button, waitlist info | A1-01 |
| 10 | `/checkin` | Built (POC) | QR code check-in | QR code display (valid 30min before to 15min after), scanner mode, visual/audio confirmation | A1-02 |
| 11 | `/wod-detail` | Built (POC) | WOD history & details | Personal record for this WOD, past results, exercise video links | A2-01 |
| 12 | `/score-entry` | Built (POC) | Register WOD result | Score input (time/rounds+reps/weight/reps), scale selector (Rx/Scaled), RPE slider, notes | A2-02 |
| 13 | `/leaderboard` | Built (POC) | Class & box leaderboard | Ranked athlete list, age group filter, Rx/Scaled filter, fistbump buttons, real-time updates | A2-02, C3-02 |
| 14 | `/pr-entry` | Built (POC) | Register personal record | 1RM-10RM grid inputs, notes field, save, history of previous records | A2-03, C3-01 |
| 15 | `/box-records` | Built (POC) | Box-wide records | Filter by gender + Rx/Scaled, search by athlete name, movement list with best scores | C3-02 |
| 16 | `/exercises` | Built (POC) | Movement library browser | Alphabetical list (520+ movements), video indicator icons, search, tap to view video | C1-02 |
| 17 | `/timer` | Built (POC) | Workout timers | 6 modes: Tabata, EMOM, AMRAP, For Time, Stopwatch, Saved; configurable countdown/exercise/rest/rounds; save timer; send to TV display | C2-02 |
| 18 | `/calculator` | Built (POC) | RM% calculator & converters | 3 tabs: %RM table (Brzycki formula), general calculator, unit converters (miles/km, lbs/kg) | NEW |
| 19 | `/plan-detail` | Built (POC) | My plan details | Active plan name, payment type, allowed class types list, renewal date, account deletion option | A1-03 |
| 20 | `/notifications` | Built (POC) | Notification center | Notification list by type, read/unread state, tap to navigate to context | A1-04 |
| 21 | `/news` | Built (POC) | Box news feed | Rich content cards (title, image, body, author, date), like button with count, comment button, expandable like list | -- |
| 22 | `/fistbumps` | Built (POC) | Reactions & comments | Summary grid (received/sent fistbumps and comments), fan list showing top reactors | A2-05 |
| 23 | `/birthdays` | Built (POC) | Birthday celebrations | Today's birthdays with avatar, send congratulations message, view past birthdays | -- |
| 24 | `/coach-profile` | Built (POC) | Coach detail view | Coach photo, name, specialty, class schedule, contact action | -- |
| 25 | `/feedback` | Built (POC) | Feedback & contact | 2 tabs: Contact box staff (email form) / Contact Vytal team (bug/suggestion/question form) | -- |
| 26 | `/settings/personal-data` | Built (POC) | Personal data form | 20 fields: display name, nickname, email, DOB, ID card, NIF, phone, emergency contact, gender, profession, address, country, T-shirt size, weight, height, auto-BMI | -- |
| 27 | `/settings/privacy` | Built (POC) | Privacy options | 4 privacy controls (records, activities, enrollments, leaderboard visibility), 48-hour change cooldown | -- |
| 28 | `/settings/theme` | Built (POC) | Visual appearance | Background (dark/light), 6 background patterns (dark mode), 6 accent colors | -- |

### 7.4 Remaining Mobile Screens (20 screens -- not yet built)

| # | Route | Status | Purpose | Key Features | Stories |
|---|---|---|---|---|---|
| 29 | `/challenges` | Not built | Challenges & gamification | Points, ranking, level progress, 63 medals grid, point-earning mechanisms | A2-04 |
| 30 | `/store` | Not built | In-app store | Account balance, credit top-up, product catalog with images/prices/stock, purchase history, supplier/dealer mappings | NEW |
| 31 | `/activities` | Not built | Activities & events | Cross-box activity search, registration, regulation acceptance, competition details | NEW |
| 32 | `/training-plans` | Not built | Individual workout plans | Calendar view, class type selector, create workout, coach notes, PT-assigned plans | P2-02 |
| 33 | `/social-feed` | Not built | Box social feed | Chronological feed of PRs, results, check-ins; fistbump reactions; 1-line comments; privacy toggle | A2-05 |
| 34 | `/calendar-sync` | Not built | Calendar integration | Sync booked classes to Google Calendar / Apple Calendar | NEW |
| 35 | `/dossiers` | Not built | Digital dossiers | Document storage: waivers, contracts, informational files from the box | NEW |
| 36 | `/booking-confirm` | Not built | Booking confirmation + success | Booking summary (class, time, coach), confirm button, success animation, add-to-calendar prompt | A1-01 |
| 37 | `/waitlist-status` | Not built | Queue position + auto-promote | Current waitlist position, estimated promotion time, auto-promote notification toggle, cancel waitlist | A1-01 |
| 38 | `/wod-comments` | Not built | Comment thread on WOD | Threaded comments on today's WOD, reply support, coach/admin badges, delete own comment | S1-03 |
| 39 | `/fistbump-detail` | Not built | Who reacted to your result | Full list of members who fistbumped a specific result/post, timestamps, tap to view profile | S1-02 |
| 40 | `/photo-gallery` | Not built | PT progress photos | Photo grid with date stamps, side-by-side comparison mode, upload from camera/gallery, coach access | S1-07 |
| 41 | `/converters` | Not built | Unit converters standalone | Miles/km, lbs/kg, inches/cm converters with real-time calculation, swap direction button | A-NEW-01 |
| 42 | `/challenge-detail` | Not built | Competition heats/scores/standings | Challenge description, heat brackets, live score entry, real-time standings, registration status | S1-05 |
| 43 | `/athlete-of-month` | Not built | Voting + nominees | Nominee cards with photo and stats, vote button (1 vote/month), countdown to voting close, past winners | S1-06 |
| 44 | `/dossier-viewer` | Not built | Documents/contracts/waivers | PDF viewer for signed contracts, waivers, and informational documents from the box | NEW |
| 45 | `/questionnaire` | Not built | Feedback questionnaires | Multi-question forms from management, rating scales, text fields, submit with confirmation | G-NEW-10 |
| 46 | `/password-change` | Not built | Change password form | Current password, new password with strength indicator, confirm password, save with validation | -- |
| 47 | `/language-selector` | Not built | PT/EN/ES picker | Language list with flag icons, current selection indicator, instant locale switch on tap | -- |
| 48 | `/notification-prefs` | Not built | Granular notification toggles | Per-type toggles (booking, WOD, PR, social, promotions), push vs email independent toggles, quiet hours | A1-04 |

**Total mobile screens: 48** (35 built + 13 remaining)

---

## 8. User Stories

### 8.1 Gestor/Owner (25 original + 12 new = 37 stories)

#### Epic G1 -- Dashboard & KPIs

| ID | Story | Phase | Priority |
|---|---|---|---|
| G1-01 | Dashboard de operacao diaria | MVP | MUST |
| G1-02 | KPIs (members, churn, occupancy) | MVP | MUST |
| G1-03 | Alerts for at-risk members | MVP | MUST |
| G1-04 | Attendance by class/time heatmap | MVP | SHOULD |
| G1-05 | Business health score (0-100) | Phase 2 | SHOULD |
| G1-06 | NPS auto-survey + sentiment | Phase 2 | COULD |
| G1-07 | Occupancy/revenue forecast AI | Phase 2 | COULD |
| G1-08 | Natural language dashboard queries | Phase 3 | COULD |

**G1-01 Acceptance Criteria:**
- Main screen shows: today's classes, total occupancy (%), active members, urgent alerts
- Data refreshes in real-time (polling <=30s or websocket)
- "Pending actions" widget: overdue payments, leads without follow-up, unsigned waivers
- Accessible on mobile (iOS + Android) and web

**G1-02 Acceptance Criteria:**
- Line chart: active member evolution over last 12 months
- Average occupancy by period (week/month) with schedule heatmap
- Monthly churn: cancelled members, reason (if recorded), comparison
- CSV data export

**G1-03 Acceptance Criteria:**
- Configurable alert criteria: "no check-in for X days" (default: 14 days)
- At-risk member list with last check-in, active plan, and quick contact
- Quick action: send message/email to member from the list

**G1-04 Acceptance Criteria:**
- Weekly occupancy heatmap by time slot and day
- Class table with average occupancy, peak, and trend
- Filter by modality, coach, and period

#### Epic G2 -- Member Management

| ID | Story | Phase | Priority |
|---|---|---|---|
| G2-01 | Complete member profile CRUD | MVP | MUST |
| G2-02 | Subscription plan creation/management | MVP | MUST |
| G2-03 | Payment dunning alerts | MVP | MUST |
| G2-04 | CSV bulk member import | MVP | MUST |
| G2-05 | Digital contracts & waivers (e-signature) | MVP | MUST |
| G2-06 | New member 16-week retention monitoring | MVP | SHOULD |
| G2-07 | Family accounts & junior athletes | Phase 2 | SHOULD |
| G2-08 | Drop-in visitor management | Phase 2 | COULD |
| G2-09 | Referral program | Phase 2 | COULD |

**G2-01 Acceptance Criteria:**
- Form fields: name, email, NIF, phone, DOB, goals, photo
- Health section: injuries, relevant medication, PAR-Q (shared with coach)
- Attendance, plan, and payment history in a single view
- Private staff-only notes field

**G2-02 Acceptance Criteria:**
- Plan types: monthly subscription, session pack, annual plan, day pass
- Rules: included modalities, weekly class limit, allowed time slots
- Plan change history per member
- Plan pause with automatic resume date

**G2-03 Acceptance Criteria:**
- Configurable dunning sequence: 1st notice (D+0), 2nd (D+3), block (D+7)
- Automatic push + email notification to member
- Debtor list with quick contact action
- Manual debt waiver option with note

**G2-04 Acceptance Criteria:**
- CSV upload with assisted column mapping
- Preview first 10 rows before confirming import
- Import report: created records, errors, detected duplicates
- Support for Regybox and Wodify export formats

**G2-05 Acceptance Criteria:**
- Contract/waiver template editor
- Email delivery with signature link (no account required)
- E-signature with timestamp and IP
- Document dashboard: signed / pending / expired
- Configurable access block until waiver is signed

**G2-06 Acceptance Criteria:**
- 4-phase monitoring: Week 1-4, 5-8, 9-12, 13-16
- Color-coded attendance indicators (green/yellow/orange/red/gray)
- "Advantage index" engagement scoring (0-100% with 5 color zones)
- Configurable attendance and advantage index thresholds
- Bulk communication: push, email, SMS, in-app notification, schedule meeting
- Conversion report: % of members completing each step

#### Epic G3 -- Billing & Portuguese Tax Compliance

| ID | Story | Phase | Priority |
|---|---|---|---|
| G3-01 | Automatic recurring billing (Stripe, MBWay, SEPA) | MVP | MUST |
| G3-02 | SAF-T + ATCUD + QR code fiscal | MVP | MUST |
| G3-03 | Credit notes & refunds | MVP | MUST |
| G3-04 | Counter POS for quick sales | MVP | MUST |
| G3-05 | Accounting integration (Xero/QuickBooks) | Phase 2 | SHOULD |
| G3-06 | Equipment management & maintenance | Phase 2 | SHOULD |
| G3-07 | Expense tracking with categorization | MVP | SHOULD |
| G3-08 | Monthly budget per expense category | Phase 2 | SHOULD |

**G3-01 Acceptance Criteria:**
- Automatic charge on configured date (e.g., 1st of month)
- Methods: card (Visa/MC), MBWay, SEPA DD, Multibanco reference
- Automatic retry on failure (3 attempts in 7 days)
- Member notification on successful or failed charge

**G3-02 Acceptance Criteria:**
- Automatic invoice/receipt per charge
- ATCUD generated and printed on each document
- QR fiscal code per invoice (per AT regulation)
- Monthly/quarterly SAF-T export in AT XML format
- Configurable numbering series per document type
- AT series communication (via API or manual)

**G3-03 Acceptance Criteria:**
- Credit note linked to original invoice
- Refund via Stripe or member account credit
- Credit note included in SAF-T export

**G3-04 Acceptance Criteria:**
- POS interface optimized for tablet/touchscreen
- Product catalog with price and stock
- Payment: card (Stripe terminal) + MBWay + cash
- Digital receipt via email or SMS

**G3-07 Acceptance Criteria:**
- Expense CRUD with categorization (Fixed: rent, utilities, staff, insurance; Variable: gear, marketing, maintenance; Tax: VAT, IRC, IRS)
- 9+ payment methods (card, cash, SEPA, MBWay, transfer, check, etc.)
- Warranty tracking and staff attribution
- Date range search with presets
- Two views: list (paginated) and totals (aggregated by category)

**G3-08 Acceptance Criteria:**
- Per-subcategory monthly spending limits
- Previous month actual vs limit comparison
- Running totals grouped by category (Fixed/Variable/Tax)

#### Epic G4 -- CRM & Lead Pipeline

| ID | Story | Phase | Priority |
|---|---|---|---|
| G4-01 | Lead pipeline kanban | MVP | MUST |
| G4-02 | Lead communication automations | MVP | MUST |
| G4-03 | Retention automations (no-show, birthday, win-back) | MVP | SHOULD |
| G4-04 | Member segmentation & campaigns | Phase 2 | SHOULD |
| G4-05 | Landing pages & embeddable capture forms (7 types) | Phase 2 | COULD |

**G4-01 Acceptance Criteria:**
- Kanban with configurable columns (7 stages: Leads, Contacted, Prospects, Subscribed, Failures, Drop-ins, Others)
- Lead card: name, source, entry date, last interaction, plan interest
- Quick actions: call, email, schedule trial
- Automatic lead creation from site form (embed)
- Excel import with column mapping, template download, batch staff assignment

**G4-02 Acceptance Criteria:**
- Trigger: lead created -> auto welcome email (editable template)
- Trigger: lead no response 3 days -> auto reminder
- Trigger: trial scheduled -> confirmation + 1h reminder
- All communications logged on lead profile
- Bilingual email templates (PT + EN) with test-send-to-self

**G4-03 Acceptance Criteria:**
- No-show: member booked but no check-in -> personalized message next day
- Birthday: email/push on birthday with configurable offer
- Win-back: inactive 21 days -> 3-message reactivation campaign
- All automations configurable (enable/disable, edit content)
- Contact suppression window (2-72 hours) to avoid spamming recently contacted members

#### Epic G5 -- Staff, Permissions & Scheduling

| ID | Story | Phase | Priority |
|---|---|---|---|
| G5-01 | Roles & granular permissions (RBAC) | MVP | MUST |
| G5-02 | Coach shift scheduling | MVP | SHOULD |
| G5-03 | Payroll automation for coaches | Phase 2 | SHOULD |
| G5-04 | Internal staff chat | MVP | SHOULD |
| G5-05 | Meeting scheduling with members | Phase 2 | SHOULD |

**G5-01 Acceptance Criteria:**
- Pre-defined roles: Admin (all), Coach (ops + training), PT (schedule + own clients), Reception (check-in + POS)
- Granular permissions per module (view / edit / delete)
- Audit log of actions per user

**G5-02 Acceptance Criteria:**
- Drag-and-drop schedule calendar per coach
- Notification to coach on class assignment
- Shift swap request with manager approval
- Alert for classes without assigned coach

**G5-04 Acceptance Criteria:**
- 1:1 messages between staff users
- Group channel (e.g., "All coaches")
- Push notification + badge in app
- Persistent message history

**G5-05 Acceptance Criteria:**
- Schedule meetings with individual members or groups
- Email notification with meeting details
- Configurable reminders (days/hours/minutes before)
- Calendar integration (Google Calendar / Apple Calendar)

#### Epic G-NEW -- Competitive Parity (from Regibox analysis)

| ID | Story | Phase | Priority |
|---|---|---|---|
| G-NEW-01 | Organization profile settings (name, logo, GPS, social, timezone, currency, business type) | MVP | MUST |
| G-NEW-02 | Drop-in system (cross-org visiting athletes with GPS map, photos, details) | Phase 2 | SHOULD |
| G-NEW-03 | Engagement scoring ("advantage index") with configurable thresholds and coach alerts | MVP | SHOULD |
| G-NEW-04 | Configurable mobile app content (admin controls which sections athletes see) | MVP | SHOULD |
| G-NEW-05 | Member auto-inactivation after N days absent | MVP | SHOULD |
| G-NEW-06 | Member groups/teams for segmentation and filtering across all modules | MVP | SHOULD |
| G-NEW-07 | Activities/events engine (competitions, challenges, races, awards, tournaments) | Phase 2 | SHOULD |
| G-NEW-08 | In-app store (box products + partner stores) | Phase 2 | COULD |
| G-NEW-09 | Digital dossiers (document storage for members) | Phase 2 | COULD |
| G-NEW-10 | In-app questionnaires/surveys from management | Phase 2 | COULD |
| G-NEW-11 | Custom feedback scales/questionnaires for post-class review | Phase 2 | COULD |
| G-NEW-12 | Graduations/belt progression system (natively, no upsell gate) | Phase 2 | SHOULD |

**G-NEW-01 Acceptance Criteria:**
- Business type selector (Box, Gym, Studio, Academy, Training Center, Health Club, School, Therapy Center)
- Fields: name, slogan, email, phone, website, timezone, currency
- Social links: Facebook, Instagram, YouTube, Twitter
- Logo upload, address with GPS coordinates (draggable map marker)

**G-NEW-03 Acceptance Criteria:**
- Engagement score (0-100%) calculated from attendance frequency
- Configurable thresholds with 5 color zones (slider UI)
- Calculation basis configurable: registrations vs actual attendances
- Monitoring period configurable: 4/8/12/16 weeks
- Absence notification threshold: 1-30+ days
- Real-time calculation (not batch)

**G-NEW-04 Acceptance Criteria:**
- Toggle on/off for 20+ app sections (Classes, Workouts, Records, Ranking, News, Store, etc.)
- Sub-section toggles (e.g., within Workouts: box workouts, individual, movements, history)
- Birthday visibility control
- Fistbumps and comments toggle

**G-NEW-08 Acceptance Criteria:**
- Product catalog supports variants for model, color, size, branding and supplier
- Supplier mappings allow the platform to route fulfillment to external partners/dealers
- Order lifecycle includes placed, confirmed, in production, shipped, delivered, cancelled
- Stock updates and tracking status sync back into the store view

---

### 8.2 Coach (17 stories)

#### Epic C1 -- WOD Builder & Programming

| ID | Story | Phase | Priority |
|---|---|---|---|
| C1-01 | WOD Builder with stimulus types & timers | MVP | MUST |
| C1-02 | Movement library with video & variations | MVP | MUST |
| C1-03 | Weekly workout planning with scheduling | MVP | MUST |
| C1-04 | Automatic %RM calculation for strength | MVP | SHOULD |
| C1-05 | Periodization cycles (4/8/12 weeks) | Phase 2 | SHOULD |
| C1-06 | Coach Assist AI -- WOD suggestions | Phase 3 | COULD |
| C1-07 | Load & volume analysis per athlete | Phase 3 | COULD |

**C1-01 Acceptance Criteria:**
- Types: AMRAP, EMOM, For Time, Tabata, Stopwatch, Strength (sets x reps x %)
- Structured in parts: Warm Up / Skill / WOD / Cool Down (customizable)
- Each exercise linked to movement library with video
- Publish to athlete app and TV display with 1 click
- Auto-saved drafts

**C1-02 Acceptance Criteria:**
- 200+ pre-loaded movements (CrossFit, Hyrox, Gymnastics, Weightlifting, Cardio)
- Each movement: name, video (<=60s), technical description, variations (Scaled/RX/RX+)
- Filters: equipment, muscle group, modality
- Custom box movements supported

**C1-03 Acceptance Criteria:**
- Weekly/monthly calendar view with planned WODs
- Scheduled publish: WOD visible to athletes from configured date/time
- Copy previous week's WODs to new week (with editing)
- Visual indicator for days without published WOD

**C1-04 Acceptance Criteria:**
- Coach input: "Back Squat 5x3 @ 80%"
- Output per athlete: weight calculated from their PR (e.g., 80% of 120kg = 96kg)
- Visible in athlete app and coachboard
- Fallback when athlete has no recorded PR: self-adjust field

#### Epic C2 -- Coach App & Class Management

| ID | Story | Phase | Priority |
|---|---|---|---|
| C2-01 | Coach App offline-first with class roster | MVP | MUST |
| C2-02 | Integrated timers during class | MVP | MUST |
| C2-03 | Digital whiteboard/coachboard real-time | MVP | MUST |
| C2-04 | TV display -- box screen | MVP | MUST |
| C2-05 | Post-class feedback (RPE + custom scales) from athletes | MVP | SHOULD |
| C2-06 | Private coaching notes per athlete | MVP | MUST |

**C2-01 Acceptance Criteria:**
- Enrolled athlete list with photo + name + plan
- Manual check-in by coach (tap to confirm)
- Active injury/restriction flag visible on each athlete card
- Works offline: data syncs on reconnect
- Access to list 30 minutes before class start

**C2-02 Acceptance Criteria:**
- Timers: AMRAP (count up), EMOM (minute alert), Countdown, Stopwatch
- Configurable start/end sound (buzz, gong, beep)
- Timer auto-mirrored on TV display
- Pause/reset control from coach's phone

**C2-03 Acceptance Criteria:**
- Athlete list with real-time score entry
- Auto-sort by score (fastest on top for For Time, most rounds for AMRAP)
- Visual PR highlight (lightning icon)
- Quick note per athlete (coach-only)

**C2-04 Acceptance Criteria:**
- Web app optimized for 1080p/4K (Chrome fullscreen)
- Auto-mode: transitions from WOD -> timer -> results based on state
- Configurable visual themes (dark, light, box brand colors)
- Remote control via Coach App (start timer, advance slide)

**C2-05 Acceptance Criteria:**
- Push notification after class: "How did it go? RPE 1-10 + mood"
- Coach dashboard: RPE distribution per class, average and trend
- Alert when average class RPE consistently > 9 (overtraining risk)
- Custom feedback questionnaires (e.g., "Difficulty level", "Did you feel pain?") with lockable scales

**C2-06 Acceptance Criteria:**
- Free-text notes per athlete with date-stamped history
- Configurable visibility: coach only / all coaches / manager included
- Injury/restriction notes synced with coachboard flag
- Option to share specific note with athlete

#### Epic C3 -- PRs, Results & Athlete Progression

| ID | Story | Phase | Priority |
|---|---|---|---|
| C3-01 | PR registration per athlete/movement | MVP | MUST |
| C3-02 | Class & box leaderboard real-time | MVP | MUST |
| C3-03 | Skills & level progression system | Phase 2 | SHOULD |
| C3-04 | Injury management & movement restrictions | MVP | SHOULD |

**C3-01 Acceptance Criteria:**
- PR auto-detected when new score exceeds previous best
- Visual celebration in athlete app + push notification
- PR history per athlete and movement with progression chart
- Coach sees day's PRs on coachboard

**C3-02 Acceptance Criteria:**
- Current class leaderboard: updates in real-time as athletes enter scores
- Filters: Rx / Scaled / gender / age group (13 age brackets)
- Historical WOD leaderboard (when same WOD is repeated)
- Visible on TV display and athlete app

**C3-04 Acceptance Criteria:**
- Injury record: date, description, affected movements, status (active/recovered)
- Visual flag on athlete card in coachboard (red icon)
- Notification to coach when athlete with active restriction books class
- Injury history accessible to manager and PT

---

### 8.3 Personal Trainer (17 stories)

#### Epic P1 -- Scheduling & Appointments

| ID | Story | Phase | Priority |
|---|---|---|---|
| P1-01 | 1:1 & semi-private session scheduling | MVP | MUST |
| P1-02 | Public PT booking page | MVP | MUST |
| P1-03 | Session packs with balance & validity | MVP | MUST |
| P1-04 | Cancellation policy & no-show fees | Phase 2 | SHOULD |
| P1-05 | Online coaching subscription (recurring) | Phase 2 | SHOULD |
| P1-06 | PT activity dashboard | MVP | SHOULD |

**P1-01 Acceptance Criteria:**
- Weekly agenda view with available/occupied slots
- Session types: 1:1 / Semi-private (2-6 pax) / Online
- Auto confirmation via email/push on session creation
- Auto reminders 24h and 1h before session
- Visual distinction between paid (pack) and pending payment sessions

**P1-02 Acceptance Criteria:**
- Public URL: /pt/[name] (e.g., vytal.fit/pt/joao-silva)
- Real-time availability with selectable slots
- Session types and durations visible (e.g., "Free 30min consultation" / "60min PT session")
- Optional payment at booking or manual confirmation
- Intake form: goals, injuries, availability

**P1-03 Acceptance Criteria:**
- Pack creation: number of sessions, validity (months), total value
- Session balance visible to PT and client
- Automatic deduction from balance per consumed session
- Auto alert when X sessions remaining (configurable)
- 1-click renewal

**P1-06 Acceptance Criteria:**
- Widget: today's sessions (time + client)
- Widget: packs expiring soon (next 7 days)
- Widget: pending payments
- Monthly session goal with progress bar

#### Epic P2 -- Client CRM & Training Plans

| ID | Story | Phase | Priority |
|---|---|---|---|
| P2-01 | Complete client profile | MVP | MUST |
| P2-02 | Workout plan builder for clients | MVP | MUST |
| P2-03 | Session notes & coaching history | MVP | SHOULD |
| P2-04 | Physical assessments (FMS, body composition) | Phase 2 | SHOULD |
| P2-05 | Weekly progress check-ins | Phase 2 | SHOULD |
| P2-06 | Access to client wearable data | Phase 3 | COULD |
| P2-07 | Marketplace -- sell plans | Phase 4 | COULD |

**P2-01 Acceptance Criteria:**
- Data: name, photo, primary/secondary goals, experience level
- Injuries and movement restrictions (shared with coach if client also attends classes)
- Session history with PT notes
- Physical metric evolution (weight, body composition, benchmarks)
- PT progress photos with date-stamped history

**P2-02 Acceptance Criteria:**
- Plan editor: week with configurable training + rest days
- Each session: warmup, exercises with sets/reps/rest, PT notes
- Exercises from library (video included) + custom exercises
- Publish to athlete app: client sees plan, videos, marks as completed
- Reusable plan templates for new clients
- Named programs (e.g., "WENDLER 531 - 4 sessions/week") with athlete assignment

**P2-03 Acceptance Criteria:**
- Notes field per session with timestamp
- Note visible to PT in context of next session
- Option to share note with client via push/email

#### Epic P3 -- Billing & Revenue

| ID | Story | Phase | Priority |
|---|---|---|---|
| P3-01 | Payment link & session billing | MVP | MUST |
| P3-02 | Simplified invoice (recibo verde) | MVP | MUST |
| P3-03 | PT revenue dashboard | Phase 2 | SHOULD |
| P3-04 | Client retention automations | Phase 2 | COULD |

**P3-01 Acceptance Criteria:**
- Payment link generated per session or per pack
- Methods: MBWay, card (Stripe), bank transfer (Multibanco reference)
- Auto receipt sent via email after payment
- Payment history per client

**P3-02 Acceptance Criteria:**
- Invoice with: PT NIF, client NIF, service description, date, amount + VAT
- Auto email to client after payment
- Archive of all issued invoices with monthly export
- Note: does not replace certified accounting software for SAF-T-obligated companies

**P3-03 Acceptance Criteria:**
- Current vs previous month revenue (chart + value)
- Active, inactive, and new clients this month
- Sessions delivered vs available (utilization rate)
- Monthly summary export for IRS declaration

---

### 8.4 Athlete/Member (11 original + 7 new = 18 stories)

#### Epic A1 -- Booking, Check-in & Plans

| ID | Story | Phase | Priority |
|---|---|---|---|
| A1-01 | Book classes in <=3 taps | MVP | MUST |
| A1-02 | QR code check-in via app | MVP | MUST |
| A1-03 | View & manage active plan + billing | MVP | MUST |
| A1-04 | Configurable notifications | MVP | MUST |
| A1-05 | Cancellation with penalty policy | Phase 2 | SHOULD |

**A1-01 Acceptance Criteria:**
- Home screen: tomorrow's classes visible directly (no navigation)
- Tap class -> 1 additional tap to confirm
- Instant push notification confirmation
- Week view for advance planning
- Auto waitlist when class is full

**A1-02 Acceptance Criteria:**
- Unique QR code per booking (valid 30min before and 15min after class start)
- Scanner on kiosk or coach's phone
- Visual and audio feedback on confirmed check-in
- Attendance history accessible in athlete profile

**A1-03 Acceptance Criteria:**
- "My plan" section: active plan, start date, next renewal
- Payment history with receipt per line
- Self-service payment method update
- Plan pause (if permitted by manager)

**A1-04 Acceptance Criteria:**
- Notification types: booking confirmation, cancellation, 1h reminder, WOD published, PR, promotions
- Each type toggle-able in settings
- Push + email independently configurable

#### Epic A2 -- WOD, PRs, Leaderboard & Gamification

| ID | Story | Phase | Priority |
|---|---|---|---|
| A2-01 | View WOD with details & videos | MVP | MUST |
| A2-02 | Register result & view leaderboard | MVP | MUST |
| A2-03 | PR history & progression per movement | MVP | MUST |
| A2-04 | Gamification (streaks, medals, ranking, points) | MVP | SHOULD |
| A2-05 | Box social feed (results + fistbumps) | Phase 2 | SHOULD |
| A2-06 | Daily readiness dashboard | Phase 3 | COULD |

**A2-01 Acceptance Criteria:**
- WOD visible from coach-configured time (e.g., 8PM previous day)
- Each exercise links to demo video from library
- Scales visible: Rx / Scaled / Scaled+ with weights and variations
- "I'll do Rx / Scaled" button for athlete to indicate before arriving (visible to coach)

**A2-02 Acceptance Criteria:**
- Result input: time, rounds+reps, weight, reps (based on WOD type)
- Scale field: Rx / Scaled / Individual
- Real-time class leaderboard
- Auto highlight if PR (animation + notification)

**A2-03 Acceptance Criteria:**
- PR list per movement with date and context
- Line progression chart (last 10 entries per movement)
- Optional comparison with box average

**A2-04 Acceptance Criteria:**
- Streak: consecutive weeks with at least 1 check-in
- Medals: check-in milestones (10, 50, 100, 250, 500) + 63 challenge medals
- Monthly box ranking by check-ins (optional, can disable)
- Points system: attendance, activities, profile completion, voting
- Level progression with progress bar
- Notification on new medal or streak level

**A2-05 Acceptance Criteria:**
- Chronological feed: PRs, highlighted results, colleague check-ins
- Fistbump reaction on colleague results
- 1-line comment (WhatsApp-style)
- Privacy option: show/hide results from feed

#### Epic A-NEW -- Competitive Parity (from Regibox analysis)

| ID | Story | Phase | Priority |
|---|---|---|---|
| A-NEW-01 | RM percentage calculator + unit converters | MVP | SHOULD |
| A-NEW-02 | Calendar sync (Google Calendar, Apple Calendar for booked classes) | MVP | SHOULD |
| A-NEW-03 | Import PRs from another box or source | MVP | SHOULD |
| A-NEW-04 | Bet game -- gamified WOD outcome betting with leaderboard | Phase 2 | COULD |
| A-NEW-05 | Photo contests with community voting | Phase 2 | COULD |
| A-NEW-06 | PDF certificates for competition finishers | Phase 2 | COULD |
| A-NEW-07 | French language support (PT, EN, ES, FR) | Phase 2 | COULD |

**A-NEW-01 Acceptance Criteria:**
- 3-tab tool: %RM table (Brzycki formula for 1RM-10RM), general calculator, unit converters (miles/km, lbs/kg)
- Weight input with +/-1 and +/-5 buttons
- Percentage table: 5% to 110% in 5% increments
- Real-time calculation on input change

**A-NEW-02 Acceptance Criteria:**
- Sync booked classes to Google Calendar or Apple Calendar
- Include class type, time, location, coach in calendar event
- Auto-update on booking cancellation

**A-NEW-03 Acceptance Criteria:**
- Import PRs from Regibox or other source via CSV/manual entry
- Map imported movements to Vytal movement library
- Preserve historical dates

---

## 9. Community & Social

This module covers all social, community, and gamification features that drive athlete engagement, retention, and box culture. These features are designed to work within a single box and optionally across a network of boxes.

### 9.1 Feature Overview

| Feature | Description |
|---|---|
| **Social Feed** | Box-level timeline showing PRs, results, check-ins, photos, and milestones in chronological order |
| **Fistbumps / Reactions** | Lightweight reactions (fistbump emoji) on any result, post, or achievement |
| **Comments** | Comment threads on WODs, results, news posts, and social feed items |
| **Athlete Profiles** | Public-within-box profiles showing stats, PRs, badges, and activity |
| **Challenges & Competitions** | Box-level and cross-box challenges with heats, scoring, and standings |
| **Athlete of the Month** | Monthly voting system where members nominate and vote for standout athletes |
| **Photo Sharing & Galleries** | Photo uploads for WOD results, PT progress, and box events; browsable galleries |
| **Birthday Celebrations** | Automatic birthday announcements with community message wall |
| **Box News Feed** | Admin-published news with likes and comments from members |
| **Achievement Badges & Medals** | 63-medal system covering attendance milestones, PR achievements, challenge completions, and special events |
| **Points & Levels** | Points earned from attendance, voting, profile completion, and social activity; level progression with visual progress bar |
| **Streaks & Milestones** | Consecutive attendance streaks (weekly/monthly) with milestone celebrations |
| **Fan List** | Ranking of who reacts most to your content (top fistbumpers and commenters) |
| **Cross-box Social** | Activities and achievements visible across affiliated boxes in the network |
| **Leaderboards** | Per-WOD, monthly, all-time, and age-group leaderboards with Rx/Scaled filters |

### 9.2 User Stories

#### Epic S1 -- Community & Social

| ID | Story | Phase | Priority |
|---|---|---|---|
| S1-01 | Box social feed with chronological timeline of PRs, results, check-ins, photos, and milestones | Phase 2 | SHOULD |
| S1-02 | Fistbump reactions on any result, post, or achievement with aggregated counts and fan list | Phase 2 | SHOULD |
| S1-03 | Comment threads on WODs, results, news posts, and social feed items | Phase 2 | SHOULD |
| S1-04 | Public athlete profiles within box showing stats, PRs, badges, streaks, and recent activity | Phase 2 | SHOULD |
| S1-05 | Challenges & competitions engine with box-level and cross-box support, heats, scoring, and standings | Phase 2 | SHOULD |
| S1-06 | Athlete of the Month voting with nominations, voting period, and winner announcement | Phase 2 | COULD |
| S1-07 | Photo sharing and galleries for WOD results, PT progress, and box events | Phase 2 | COULD |
| S1-08 | Achievement badges and medals system (63 medals) with points, levels, and streaks | MVP | SHOULD |
| S1-09 | Leaderboards per WOD, monthly, all-time, and by age group with Rx/Scaled filters | MVP | MUST |
| S1-10 | Cross-box social visibility for activities, achievements, and leaderboards across affiliated network | Phase 3 | COULD |

**S1-01 Acceptance Criteria:**
- Chronological feed showing PRs, WOD results, check-ins, photos, and milestone achievements
- Each feed item shows athlete avatar, name, timestamp, and content
- Privacy toggle: athlete can show/hide their activity from the feed
- Feed scoped to current box; admin can moderate (hide/delete posts)
- Pull-to-refresh and infinite scroll with lazy loading

**S1-02 Acceptance Criteria:**
- Fistbump button on every result, post, and achievement in the feed
- Aggregated count displayed (e.g., "12 fistbumps")
- Tap count to see full list of who reacted
- Fan list: ranked list of who reacts most to your content (top 10)
- Push notification when someone fistbumps your content (toggle-able)

**S1-03 Acceptance Criteria:**
- Comment thread available on WODs, results, news posts, and social feed items
- Comments support text only (no media in MVP)
- Nested replies (1 level deep)
- Admin/coach can delete inappropriate comments
- Push notification when someone comments on your content (toggle-able)

**S1-04 Acceptance Criteria:**
- Profile visible to all members within the same box
- Shows: avatar, name, member since date, plan type, attendance stats
- PR showcase: top 5 PRs with progression charts
- Badge/medal collection display
- Current streak and level with progress bar
- Privacy settings: athlete controls which sections are visible

**S1-05 Acceptance Criteria:**
- Admin creates challenges with: name, description, start/end dates, scoring rules
- Challenge types: attendance-based, WOD-based, custom metric
- Heat/round structure for competitions
- Real-time standings with score updates
- Cross-box challenges: multiple boxes participate with combined leaderboard
- Registration with optional regulation acceptance

**S1-06 Acceptance Criteria:**
- Admin opens monthly voting window (configurable dates)
- Members nominate candidates (self-nomination optional, configurable)
- One vote per member per month
- Results visible after voting period closes
- Winner announced via push notification and featured on social feed
- Historical winners gallery

**S1-07 Acceptance Criteria:**
- Photo upload from camera or gallery on WOD results, PT progress, and events
- Photo gallery browsable by date, event, or athlete
- PT progress photos: side-by-side comparison view with date stamps
- Admin can create event albums
- Photo moderation: admin can approve/remove photos
- Storage via AWS S3 with image optimization

**S1-08 Acceptance Criteria:**
- 63 medals across categories: attendance (10, 50, 100, 250, 500 check-ins), PRs (first PR, 10 PRs, etc.), challenges, special events
- Points earned from: attendance (+10), voting (+5), profile completion (+20), social reactions (+2)
- Level progression (Level 1-50) with configurable XP thresholds
- Streaks: consecutive weeks with at least 1 check-in; streak freeze option (1 per month)
- Visual progress bar and level badge on profile
- Push notification on new medal, level-up, or streak milestone

**S1-09 Acceptance Criteria:**
- Per-WOD leaderboard: ranked by score (time, rounds+reps, weight)
- Monthly leaderboard: aggregated points from all WODs in the month
- All-time leaderboard: lifetime points and PRs
- Age group filters: 13 brackets (e.g., 18-24, 25-29, ..., 65+)
- Rx/Scaled/All filter
- Gender filter
- Real-time updates via WebSocket
- Visible on mobile app and TV display

**S1-10 Acceptance Criteria:**
- Affiliated boxes opt-in to cross-box visibility
- Cross-box leaderboard for shared WODs
- Cross-box challenge participation
- Athlete activity visible to members of affiliated boxes (respecting privacy settings)
- Network map showing participating boxes

---

## 10. Organization Verticals

### 10.1 Complete Vertical Configuration Matrix

| Vertical | Label | Org Term | Member Term | Instructor Term | Session Term | Workout Term | Record Term |
|---|---|---|---|---|---|---|---|
| `crossfit_box` | CrossFit Box | Box | Athlete | Coach | Class | WOD | PR |
| `functional_training` | Functional Training | Gym | Athlete | Coach | Class | Workout | Personal Best |
| `gym` | Gym | Gym | Member | Trainer | Session | Workout | Personal Best |
| `yoga_studio` | Yoga Studio | Studio | Student | Instructor | Class | Flow | Milestone |
| `pilates_studio` | Pilates Studio | Studio | Client | Instructor | Class | Routine | Milestone |
| `martial_arts` | Martial Arts | Academy | Student | Sensei | Training | Kata | Achievement |
| `personal_training` | PT Studio | Studio | Client | PT | Session | Program | Personal Best |
| `swimming` | Swimming Pool | Pool | Swimmer | Coach | Lesson | Set | Personal Best |
| `dance_studio` | Dance Studio | Studio | Dancer | Teacher | Class | Choreography | Achievement |
| `health_club` | Health Club | Club | Member | Trainer | Session | Program | Personal Best |
| `sports_club` | Sports Club | Club | Player | Coach | Session | Training | Record |
| `climbing_gym` | Climbing Gym | Gym | Climber | Coach | Session | Problem | Personal Best |
| `cycling_studio` | Cycling Studio | Studio | Rider | Instructor | Ride | Ride | Personal Best |
| `running_club` | Running Club | Club | Runner | Coach | Run | Session | PR |
| `gymnastics_academy` | Gymnastics Academy | Academy | Gymnast | Coach | Practice | Routine | Personal Best |
| `rehabilitation` | Rehab / Physio | Clinic | Patient | Therapist | Appointment | Protocol | Milestone |
| `weightlifting_club` | Weightlifting Club | Club | Lifter | Coach | Session | Program | PR |
| `bootcamp` | Outdoor / Boot Camp | Camp | Participant | Coach | Session | Workout | Personal Best |
| `surf_water_sports` | Surf / Water Sports | School | Student | Instructor | Lesson | Session | Achievement |
| `other` | Other | Space | Member | Instructor | Class | Workout | Record |

### 10.2 Feature Flags per Vertical

| Vertical | WODs | Leader board | PRs | Rx/ Scaled | Timers | RM Calc | Gamify | Fist bumps | Drop-ins | TV | Move Lib | Belts | PT | Nutrition | Body Comp | Group | Open Gym | Store |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CrossFit Box | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | - | Y | - | Y | Y | Y | Y |
| Functional Training | Y | Y | Y | - | Y | Y | Y | Y | - | Y | Y | - | Y | - | Y | Y | Y | Y |
| Gym | - | - | Y | - | - | Y | Y | - | - | - | Y | - | Y | Y | Y | Y | Y | Y |
| Yoga Studio | - | - | - | - | Y | - | Y | - | Y | - | Y | - | Y | - | - | Y | Y | Y |
| Pilates Studio | - | - | - | - | - | - | Y | - | - | - | Y | - | Y | - | Y | Y | - | Y |
| Martial Arts | - | Y | - | - | Y | - | Y | Y | - | - | Y | Y | Y | - | - | Y | Y | Y |
| PT Studio | - | - | Y | - | Y | Y | Y | - | - | - | Y | - | Y | Y | Y | - | - | - |
| Swimming | - | Y | Y | - | Y | - | Y | - | - | - | - | - | Y | - | - | Y | Y | Y |
| Dance Studio | - | - | - | - | - | - | Y | - | - | - | Y | Y | Y | - | - | Y | - | Y |
| Health Club | - | - | Y | - | - | - | Y | - | - | - | Y | - | Y | Y | Y | Y | Y | Y |
| Sports Club | - | Y | Y | - | Y | - | Y | Y | - | Y | - | - | Y | - | - | Y | Y | Y |
| Climbing Gym | - | Y | Y | - | Y | - | Y | Y | Y | - | Y | Y | Y | - | - | Y | Y | Y |
| Cycling Studio | - | Y | Y | - | Y | - | Y | Y | Y | Y | - | - | - | - | - | Y | - | Y |
| Running Club | Y | Y | Y | - | Y | - | Y | Y | - | - | - | - | Y | Y | - | Y | Y | Y |
| Gymnastics | - | Y | Y | - | - | - | Y | Y | - | - | Y | Y | Y | - | Y | Y | Y | Y |
| Rehabilitation | - | - | Y | - | Y | - | - | - | - | - | Y | - | Y | - | Y | Y | - | - |
| Weightlifting | Y | Y | Y | - | Y | Y | Y | Y | Y | Y | Y | - | Y | Y | Y | Y | Y | Y |
| Boot Camp | Y | Y | Y | - | Y | - | Y | Y | Y | - | Y | - | - | - | - | Y | - | Y |
| Surf / Water | - | - | - | - | - | - | Y | Y | Y | - | Y | Y | Y | - | - | Y | - | Y |
| Other | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |

### 10.3 Onboarding Wizard

The 3-step onboarding wizard runs during organization creation:

1. **Select Vertical:** Grid of 20 vertical cards with icon, label, and description. Selecting one pre-loads terminology and feature flags.
2. **Organization Details:** Name, email, address, logo upload, timezone, currency. Form labels use the selected vertical's terminology.
3. **Invite Staff:** Invite coaches/PTs by email with role assignment. Confirm and create organization.

### 10.4 Feature Adaptation

- **Navigation labels** change: "WODs" becomes "Flows" (Yoga), "Rides" (Cycling), "Katas" (Martial Arts)
- **Member labels** change: "Athletes" becomes "Students" (Yoga/Martial Arts), "Climbers" (Climbing), "Riders" (Cycling)
- **Modules hide/show** based on feature flags: A yoga studio never sees leaderboard or Rx/Scaled; a gym never sees WODs or TV display
- **Default class types** are pre-populated but fully customizable

---

## 11. Competitive Analysis Summary

### 11.1 Platform: Regibox (RegyBox)

- **Scale:** 849 affiliated gyms/boxes across Portugal, Angola, Mozambique
- **Stack:** Legacy PHP + Bootstrap 4 + jQuery + iframes; Framework7 PWA for mobile
- **Admin modules:** 17 top-level modules
- **Client app routes:** 132 routes across 17 sections
- **Business model:** Base subscription + paid modules (EUR 17-20/mo each for Graduations, Physical Eval 2.0, Training Plans) + feature gates (RegyPlus+)

### 11.2 Feature Comparison

| Feature Area | Regibox | Vytal | Advantage |
|---|---|---|---|
| Class Calendar | FullCalendar, drag-and-drop, copy weeks | Same + real-time WebSocket sync | Vytal |
| CRM Pipeline | 7 stages, Excel import, trial booking | Same + AI lead scoring (Phase 2) | Vytal |
| Retention Monitoring | 16-week with advantage index | Same + real-time calc (not 2x daily batch) | Vytal |
| WOD Builder | Basic drag-and-drop | Structured parts, auto %RM, 1-click publish | Vytal |
| Coachboard | Static page | Real-time score entry, auto-sort, PR highlights | Vytal |
| TV Display | Basic | 1080p/4K, auto-mode, remote control from phone | Vytal |
| Fiscal Compliance | Via Vendus (3rd party) | Native SAF-T/ATCUD/QR fiscal | Vytal |
| SMS | Requires Android phone as gateway (RegySMS) | Twilio API | Vytal |
| Offline | None | Coach app + kiosk work offline | Vytal |
| AI | None | Churn prediction, WOD suggestions, readiness | Vytal |
| Mobile | Framework7 PWA (webview) | Native React Native (Expo) | Vytal |
| Activities/Events | 8 types (competitions, challenges, races, etc.) | Not yet built | Regibox |
| Drop-in Network | 849 gyms cross-network | Not yet built | Regibox |
| In-app Store | Product catalog + Prozis integration | Not yet built | Regibox |
| Bet Game | Gamified WOD betting | Not yet built | Regibox |
| Multi-vertical | Box, Gym, Studio (limited) | 20 verticals with adaptive terminology | Vytal |
| Multi-org | One account per gym | Native multi-org | Vytal |
| Pricing | Feature gates + paid modules | All features included | Vytal |

### 11.3 Identified Gaps (33 total)

**Must Add (MVP) -- 12 gaps:**

| # | Gap | Regibox Module | Vytal Story |
|---|---|---|---|
| 1 | Box profile settings | Box Settings | G-NEW-01 |
| 2 | Expense tracking | Financial > Expenses | G3-07 |
| 3 | Monthly budget | Financial > Budget | G3-08 |
| 4 | Drop-in system | Classes > Drop-ins | G-NEW-02 |
| 5 | 16-week retention monitoring | CRM > New Members | G2-06 (extended) |
| 6 | Engagement scoring | CRM > Options | G-NEW-03 |
| 7 | Contact suppression window | CRM > Options | G4-03 (enhanced) |
| 8 | 7 embeddable form types | CRM > Site Integrations | G4-05 (extended) |
| 9 | Configurable app content | Mobile APP Options | G-NEW-04 |
| 10 | Kiosk customization | Tablet Options | A1-02 (extended) |
| 11 | Member auto-inactivation | Class Options | G-NEW-05 |
| 12 | Groups/teams for segmentation | Cross-cutting | G-NEW-06 |

**Should Add (Phase 2) -- 10 gaps:**

| # | Gap | Vytal Story |
|---|---|---|
| 13 | Activities/events engine | G-NEW-07 |
| 14 | Meeting scheduling | G5-05 |
| 15 | Custom feedback scales | C2-05 (enhanced) |
| 16 | SEPA C2B file generation + bank XML return | G3-01 (extended) |
| 17 | In-app store | G-NEW-08 |
| 18 | Digital dossiers | G-NEW-09 |
| 19 | Physical evaluation / body composition | P2-04 |
| 20 | Graduations/belt system (natively) | G-NEW-12 |
| 21 | Unit converters | A-NEW-01 |
| 22 | Birthday visibility in app | A2-05 (bundled) |

**Could Add (Phase 2-3) -- 11 gaps:**

| # | Gap | Vytal Story |
|---|---|---|
| 23 | Bet game (WOD betting) | A-NEW-04 |
| 24 | RM percentage calculator | A-NEW-01 |
| 25 | Calendar sync (Google/Apple) | A-NEW-02 |
| 26 | Photo contests | A-NEW-05 |
| 27 | PDF certificates | A-NEW-06 |
| 28 | Import PRs from other boxes | A-NEW-03 |
| 29 | French language support | A-NEW-07 |
| 30 | Partner/affiliate box system | Phase 3 |
| 31 | Facebook Login | Phase 2 |
| 32 | PT progress photos | P2-01 (enhanced) |
| 33 | In-app questionnaires/surveys | G-NEW-10 |

### 11.4 Vytal Competitive Advantages (17)

| # | Advantage | Impact |
|---|---|---|
| 1 | Modern tech stack (Next.js 15, React Native, tRPC) | Faster development, better DX, easier hiring |
| 2 | Native React Native mobile app (not PWA) | Better performance, offline support, native APIs |
| 3 | Real-time WebSocket (coachboard, timers, leaderboard) | Sub-second updates vs 30s polling |
| 4 | Offline-first coach app and kiosk | Works without internet |
| 5 | AI-powered features (churn prediction, WOD suggestions) | No AI in Regibox |
| 6 | Native fiscal compliance (SAF-T, ATCUD, QR fiscal) | No 3rd-party dependency (vs Vendus) |
| 7 | Proper SMS API (Twilio) | No Android phone needed (vs RegySMS) |
| 8 | Modern dark UI with glassmorphism | vs dated Bootstrap 4 |
| 9 | All features included (no upsell gates) | Key differentiator for sales |
| 10 | Structured WOD builder | vs basic drag-and-drop |
| 11 | Real-time coachboard with auto-sort and PR highlights | vs static page |
| 12 | 4K-optimized TV display with remote control | vs basic display |
| 13 | Advanced gamification (streaks, medals, points, levels) | vs basic ranking |
| 14 | RGPD by design (Art. 9 health data encryption) | vs basic compliance |
| 15 | 20 verticals with adaptive terminology | vs CrossFit-focused |
| 16 | Multi-org native (user across multiple gyms) | vs one account per gym |
| 17 | Multi-language (PT + EN + ES, expandable) | vs PT + EN only |

---

## 12. Integrations

### 12.1 MVP Integrations (Phase 1)

| Integration | Purpose | Status |
|---|---|---|
| **Stripe** | Card payments (Visa/MC), SCA-compliant, Stripe Terminal for POS | Not wired |
| **MBWay API** | Mobile payments (Portugal) | Not wired |
| **SEPA Direct Debit** | Recurring bank payments, C2B file generation, XML return processing | Not wired |
| **Multibanco** | Payment references (Portugal) | Not wired |
| **Portuguese Tax Authority (AT)** | SAF-T XML export, ATCUD generation, QR fiscal code, series communication | Not wired |
| **SendGrid** | Transactional email (receipts, notifications, dunning, CRM) | Not wired |
| **Firebase (FCM/APNs)** | Push notifications for mobile | Not wired |
| **Twilio** | SMS notifications | Not wired |
| **AWS S3** | Media storage (exercise videos, member photos, logos) | Not wired |

### 12.2 Phase 2 Integrations

| Integration | Purpose |
|---|---|
| **Garmin Connect** | Wearable data sync (HR, HRV, sleep, activity) |
| **Apple HealthKit** | iOS health data integration |
| **Google Fit** | Android fitness data integration |
| **Strava** | Activity tracking and social sharing |
| **Whoop** | Recovery and strain data |
| **Polar** | Heart rate and training load |
| **Xero** | Accounting integration |
| **QuickBooks** | Accounting integration (alternative) |
| **Zapier** | Workflow automation with 3rd-party apps |
| **Google Calendar** | Class booking sync for athletes |
| **Apple Calendar** | Class booking sync for athletes |
| **Google Maps API** | Organization location, drop-in map |

### 12.3 Phase 3+ Integrations

| Integration | Purpose |
|---|---|
| **Zoom / Google Meet** | Online coaching sessions |
| **Coverflex / Cobee / Edenred** | Employee wellness benefit cards |
| **Facebook Login** | Social sign-in for athletes |
| **Public API** | REST/GraphQL API for 3rd-party integrations |

---

## 13. Roadmap

### Phase 1 -- MVP (0-90 days) -- 43 stories

Core operations for all 4 personas plus competitive parity features:

- **Gestor (22):** Dashboard, KPIs, alerts, heatmap, member CRUD, plans, dunning, CSV import, waivers, 16-week retention, billing (Stripe/MBWay/SEPA), SAF-T/ATCUD, credit notes, POS, expense tracking, CRM kanban, lead automations, retention automations, RBAC, coach scheduling, org profile, engagement scoring, app content config, auto-inactivation, groups/teams
- **Coach (10):** WOD builder, movement library, weekly planning, %RM calc, coach app offline, timers, coachboard, TV display, RPE feedback, coaching notes
- **PT (6):** Session scheduling, public booking page, session packs, client profile, workout plan builder, session billing
- **Athlete (5):** Class booking (3 taps), QR check-in, plan management, notifications, WOD view + results + leaderboard

### Phase 2 (120-180 days) -- 27 stories

- **Wearables:** Garmin, Apple Health, Google Fit, Strava integration
- **AI lite:** Business health score, NPS, occupancy forecast, lead scoring
- **Gestor:** Family accounts, drop-ins, referral, campaigns, landing pages, meetings, equipment maintenance, budget, accounting integration, payroll, activities/events engine, in-app store, digital dossiers, questionnaires, graduations/belt system
- **Coach:** Periodization cycles, custom feedback scales
- **PT:** Cancellation policy, online coaching, physical assessments, weekly check-ins, revenue dashboard, client retention
- **Athlete:** Cancellation penalties, social feed, gamification points/levels, bet game, photo contests, PDF certificates, calendar sync, French language

### Phase 3 (180-360 days) -- 10 stories

- **Advanced AI:** Coach Assist AI (WOD suggestions), load/volume analysis, overtraining risk, digital twin, recovery coaching
- **Gestor:** Natural language dashboard queries
- **PT:** Wearable data access
- **Athlete:** Daily readiness dashboard
- **Platform:** Multi-location beta, partner/affiliate box system

### Phase 4 (1 year+) -- 5 stories

- **Marketplace:** PT plans marketplace
- **Corporate:** Corporate wellness B2B module
- **Payroll integrations:** Coverflex, Cobee, Edenred
- **White-label:** Custom branding per organization
- **Platform:** Conversational AI, full multi-location + franchising, public API

---

## 14. Implementation Status

### 14.1 Summary

| Area | Built (POC) | Total |
|---|---|---|
| Admin Web pages | 100+ | 100+ |
| Public Website pages | 6 | 6 |
| Member Console pages | 6 | 6 |
| Mobile Client screens | 48 | 48 |
| **Total screens** | **160+** | **160+** |
| Playwright E2E tests | 89 | 89 |
| Organization verticals | 20 | 20 |
| Feature flags | 27 | 27 |
| i18n translation keys | 1500+ | 1500+ x 3 languages |
| Data store | Full CRUD | Per-org localStorage |
| Payment methods | 6 | 6 |

### 14.2 Product Architecture

| Product | Domain | Purpose | Status |
|---|---|---|---|
| **Admin** | `admin.vytal.fit/@org` | Gym management backoffice | Built (100+ pages) |
| **Console** | `console.vytal.fit/@org` | Member portal (web) | Built (6 pages) |
| **Public Site** | `vytal.fit/@org` or custom domain | Marketing website | Built (6 pages) |
| **Mobile App** | iOS/Android (Expo) | Athlete app | Built (48 screens) |

### 14.3 What Is Built

**Admin Web (100+ pages):**
- **Dashboard & Core:** dashboard, profile, help, changelog
- **Members (12):** list, detail, edit, 360 view, body composition, assessments, billing, nutrition, analytics, contracts, groups, referrals, import, retention
- **Classes (9):** list, detail (with check-in flow), create, calendar, smart scheduling, templates, waitlist, history, attendance
- **WODs (3):** list (with edit modal), builder, multi-week programming
- **CRM (2):** pipeline kanban, lead detail
- **Plans (2):** list, create/edit
- **Staff (6):** list, detail, edit, performance, payroll, shift schedule
- **Financials (7):** overview (with payment registration), revenue forecasting, dunning, SEPA DD, invoices, expenses, budget
- **Communications (3):** overview, SMS compose, email templates
- **Community (4):** hub, questionnaires, competition builder, achievement badges
- **Store (2):** POS store (with filtering), gift cards & vouchers
- **Operations:** AI insights, analytics, reports (overview + attendance), tasks, unified inbox, notifications, messages, automations (rules + milestones + campaigns), TV display config, drop-ins, import center, integrations hub, media library, equipment inventory, marketing (social media scheduling), support tickets
- **Settings (14):** general, features (27 flags with groups), notification rules, booking rules, kiosk, app-config, audit trail, permissions, webhooks, API keys, branding, website config, payment methods, backup
- **Locations (2):** location management, multi-location dashboard
- **Auth (4):** login, register, onboarding (4-step wizard with feature config), forgot-password

**Public Website (6 pages, at /@orgslug):**
- Homepage (hero, stats, schedule, CTA)
- Schedule (weekly timetable, booking modal)
- Pricing (plan cards, comparison table, FAQ)
- Shop (product grid, category filter, working cart)
- Team (coach cards, bio, certifications)
- Contact (form, map, social links)

**Member Console (6 pages, at /console):**
- Home (next class, WOD preview, streak, quick actions)
- Schedule (weekly view, book/cancel, my bookings)
- WOD (today's WOD, score logging, timer)
- Records (PR list, add PR, progress)
- Profile (subscription, payment history, settings)

**Mobile Client (48 screens):**
- 5 tab screens + 43 standalone screens covering the full athlete experience

**Key Platform Features:**
- 27 feature flags in 4 categories (Training, Community, Health, Operations)
- 3 required features (Financials, Reports, Communications)
- Role-based access: Owner (full), Coach (limited), Athlete (minimal)
- Per-org data isolation (separate localStorage per org)
- 3 mock orgs: CrossFit Aveiro, Yoga Flow Porto, Iron Temple
- 6 payment methods: MB Way, Multibanco, SEPA, Card, Cash, Transfer
- Custom domain routing (crossfit-aveiro.pt → org public pages)
- Smart onboarding: 4-step wizard with vertical-specific feature defaults
- Route protection: disabled features redirect to dashboard
- Sidebar filtering: nav items hidden by feature flags + role
- Class check-in: individual, bulk, QR scan, walk-in
- i18n: PT/EN/ES with 1500+ keys per language
- 89 Playwright E2E tests
- Design system: dark theme, Inter font, green (#22c55e) accent

### 14.4 What Is NOT Built (Next Phase)

- **Backend:** No real API -- all data is mock (next: tRPC + Drizzle + PostgreSQL)
- **Auth:** Better Auth not integrated -- login is UI-only (localStorage pseudo-auth)
- **Real Payments:** No Stripe/MBWay/SEPA processing -- config UI only
- **Fiscal:** No SAF-T/ATCUD generation
- **Notifications:** No push/email/SMS delivery -- UI only
- **Real-time:** No WebSocket connections
- **Offline:** No offline sync
- **Search:** No full-text search (Cmd+K is client-side only)
- **File uploads:** No real file storage (simulated)

### 14.4 Test Coverage

| Test File | Focus |
|---|---|
| `smoke.spec.ts` | App loads and renders |
| `home.spec.ts` | Landing page / redirect |
| `dashboard.spec.ts` | Dashboard KPIs and widgets |
| `classes.spec.ts` | Class calendar and detail |
| `members.spec.ts` | Member list and profile |
| `navigation.spec.ts` | Sidebar nav, route transitions |
| `admin-pages.spec.ts` | All admin pages render without errors |
| `a11y.spec.ts` | Accessibility checks |
| `i18n.spec.ts` | Internationalization (PT/EN/ES) |
| `theme.spec.ts` | Theme switching |

---

## 15. Backlog Summary

### 15.1 Total Story Count

**100 total stories** (65 original + 12 G-NEW + 6 A-NEW + 10 S1 social/community + 7 enhancements to existing stories)

| Persona | MVP | Phase 2 | Phase 3 | Phase 4 | Total |
|---|---|---|---|---|---|
| Gestor/Owner | 22 | 15 | 2 | 0 | 39 |
| Coach | 10 | 3 | 2 | 0 | 15 |
| Personal Trainer | 6 | 5 | 1 | 1 | 13 |
| Athlete/Member | 5 | 8 | 1 | 0 | 14 |
| Community & Social | 2 | 7 | 1 | 0 | 10 |
| **Total** | **45** | **38** | **7** | **1** | **91** |

Note: Some stories span multiple personas (e.g., leaderboard is both Coach and Athlete). The 91 unique stories above deduplicate cross-persona overlaps. Including all role-specific views, the full backlog is approximately 100 trackable items. The Community & Social epic (S1-01 through S1-10) covers social feed, reactions, comments, profiles, challenges, voting, photos, gamification, leaderboards, and cross-box social features.

### 15.2 MoSCoW Prioritization

| Priority | Count | Description |
|---|---|---|
| **MUST** | 33 | Essential for MVP launch -- blocking if missing |
| **SHOULD** | 40 | Important for product-market fit -- planned for MVP or Phase 2 |
| **COULD** | 18 | Nice-to-have -- improves UX/engagement but not blocking |
| **WON'T (yet)** | 0 | Deferred beyond Phase 4 |

---

## 16. Key Constraints

| # | Constraint | Impact |
|---|---|---|
| 1 | **SAF-T, ATCUD, QR fiscal** are non-negotiable compliance -- present in MVP, not optional | Must integrate with Portuguese Tax Authority before launch |
| 2 | **Offline-first** for Coach App and kiosk -- must work without internet | Requires local storage + sync queue in mobile app |
| 3 | **<=3 taps** for booking, check-in, result entry -- UX is the product | Every user flow must be audited for tap count |
| 4 | **RGPD Art. 9** -- health data encrypted at rest; granular consent from day 1 | Injury data, medications, PAR-Q require encryption + explicit consent |
| 5 | **Real-time** -- coachboard, leaderboard, timers require sub-second latency | WebSocket infrastructure required from MVP |
| 6 | **Modular architecture** -- each persona has independent UI/permissions | Role-based rendering throughout; no monolithic pages |
| 7 | **AI guardrails** -- all suggestions include disclaimers; no medical diagnosis | Legal review of all AI output surfaces |
| 8 | **Multi-vertical terminology** -- every user-facing string must use the org's configured terms | All labels must read from `OrganizationTypeConfig.terminology`; no hardcoded "Athlete" or "WOD" |
| 9 | **Multi-org data isolation** -- all queries must be scoped by `organizationId` | No cross-org data leakage; tenant isolation at the query level |
| 10 | **Portuguese market first** -- payment methods (MBWay, SEPA, Multibanco) are Portugal-specific | Must work for Portuguese banks before expanding to EU |
| 11 | **No feature gates** -- all features included in base price | Key differentiator vs Regibox; pricing model must sustain this |
| 12 | **i18n from day 1** -- PT, EN, ES supported; FR in Phase 2 | All user-facing strings must be translatable; no hardcoded language |

---

*End of document. This PRD is maintained in `/docs/PRD.md` and versioned with the repository.*
