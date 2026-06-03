# Vytal -- Product Requirements Document

**Version:** 2.0
**Last updated:** 2026-06-03
**Status:** Active
**Team:** vytal-fit
**Repository:** github.com/vytal-fit/vytal-fit (private)

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
9. [Organization Verticals](#9-organization-verticals)
10. [Competitive Analysis Summary](#10-competitive-analysis-summary)
11. [Integrations](#11-integrations)
12. [Roadmap](#12-roadmap)
13. [Implementation Status](#13-implementation-status)
14. [Backlog Summary](#14-backlog-summary)
15. [Key Constraints](#15-key-constraints)

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

### 6.3 Remaining Admin Pages (11 pages -- not yet built)

| # | Route | Status | Purpose | Key Features | Stories |
|---|---|---|---|---|---|
| 21 | `/(app)/pos` | Not built | Point-of-sale counter | Product catalog, cart, payment methods (card/MBWay/cash), digital receipt, member credit management | G3-04 |
| 22 | `/(app)/contracts` | Not built | Contracts & waivers | Template editor, e-signature flow, email delivery, document dashboard (signed/pending/expired), access block config | G2-05 |
| 23 | `/(app)/automations` | Not built | Automation rules engine | No-show, birthday, win-back, dunning sequences; trigger/condition/action builder; enable/disable per rule | G4-03 |
| 24 | `/(app)/kiosk` | Not built | Kiosk/tablet management | Rotating images, check-in timing, animation themes, button customization, multi-tablet configs | A1-02 |
| 25 | `/(app)/activities` | Not built | Activities/events engine | Competitions, challenges, races, awards, tournaments; registration, scoring, leaderboards | NEW |
| 26 | `/(app)/expenses` | Not built | Expense tracking | Fixed/variable/tax categories, payment methods, warranty tracking, Vendus-like categorization | G3-07 |
| 27 | `/(app)/budget` | Not built | Monthly budget | Per-category spending limits, actual vs limit comparison, grouped by Fixed/Variable/Tax | G3-08 |
| 28 | `/(app)/tv-display` | Not built | TV display / coachboard config | Theme selection, auto-mode settings, remote control pairing, preview | C2-04 |
| 29 | `/(app)/groups` | Not built | Member groups/teams | Create groups, assign members, use for filtering across all modules | NEW |
| 30 | `/(app)/integrations` | Not built | Embeddable forms & site integrations | 7 form types (contact, register, trial, voucher, plan sale, class sale, custom), style editor, embed code | G4-05 |
| 31 | `/(app)/meetings` | Not built | Meeting scheduling | Schedule meetings with members, email notifications, reminders, calendar integration | G5-05 |

**Total admin web pages: 31** (20 built + 11 remaining)

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

### 7.4 Remaining Mobile Screens (7 screens -- not yet built)

| # | Route | Status | Purpose | Key Features | Stories |
|---|---|---|---|---|---|
| 29 | `/challenges` | Not built | Challenges & gamification | Points, ranking, level progress, 63 medals grid, point-earning mechanisms | A2-04 |
| 30 | `/store` | Not built | In-app store | Account balance, credit top-up, product catalog with images/prices/stock, purchase history | NEW |
| 31 | `/activities` | Not built | Activities & events | Cross-box activity search, registration, regulation acceptance, competition details | NEW |
| 32 | `/training-plans` | Not built | Individual workout plans | Calendar view, class type selector, create workout, coach notes, PT-assigned plans | P2-02 |
| 33 | `/social-feed` | Not built | Box social feed | Chronological feed of PRs, results, check-ins; fistbump reactions; 1-line comments; privacy toggle | A2-05 |
| 34 | `/calendar-sync` | Not built | Calendar integration | Sync booked classes to Google Calendar / Apple Calendar | NEW |
| 35 | `/dossiers` | Not built | Digital dossiers | Document storage: waivers, contracts, informational files from the box | NEW |

**Total mobile screens: 35** (28 built + 7 remaining)

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

## 9. Organization Verticals

### 9.1 Complete Vertical Configuration Matrix

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

### 9.2 Feature Flags per Vertical

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

### 9.3 Onboarding Wizard

The 3-step onboarding wizard runs during organization creation:

1. **Select Vertical:** Grid of 20 vertical cards with icon, label, and description. Selecting one pre-loads terminology and feature flags.
2. **Organization Details:** Name, email, address, logo upload, timezone, currency. Form labels use the selected vertical's terminology.
3. **Invite Staff:** Invite coaches/PTs by email with role assignment. Confirm and create organization.

### 9.4 Feature Adaptation

- **Navigation labels** change: "WODs" becomes "Flows" (Yoga), "Rides" (Cycling), "Katas" (Martial Arts)
- **Member labels** change: "Athletes" becomes "Students" (Yoga/Martial Arts), "Climbers" (Climbing), "Riders" (Cycling)
- **Modules hide/show** based on feature flags: A yoga studio never sees leaderboard or Rx/Scaled; a gym never sees WODs or TV display
- **Default class types** are pre-populated but fully customizable

---

## 10. Competitive Analysis Summary

### 10.1 Platform: Regibox (RegyBox)

- **Scale:** 849 affiliated gyms/boxes across Portugal, Angola, Mozambique
- **Stack:** Legacy PHP + Bootstrap 4 + jQuery + iframes; Framework7 PWA for mobile
- **Admin modules:** 17 top-level modules
- **Client app routes:** 132 routes across 17 sections
- **Business model:** Base subscription + paid modules (EUR 17-20/mo each for Graduations, Physical Eval 2.0, Training Plans) + feature gates (RegyPlus+)

### 10.2 Feature Comparison

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

### 10.3 Identified Gaps (33 total)

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

### 10.4 Vytal Competitive Advantages (17)

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

## 11. Integrations

### 11.1 MVP Integrations (Phase 1)

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

### 11.2 Phase 2 Integrations

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

### 11.3 Phase 3+ Integrations

| Integration | Purpose |
|---|---|
| **Zoom / Google Meet** | Online coaching sessions |
| **Coverflex / Cobee / Edenred** | Employee wellness benefit cards |
| **Facebook Login** | Social sign-in for athletes |
| **Public API** | REST/GraphQL API for 3rd-party integrations |

---

## 12. Roadmap

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

## 13. Implementation Status

### 13.1 Summary

| Area | Built (POC) | Remaining | Total |
|---|---|---|---|
| Admin Web pages | 20 | 11 | 31 |
| Mobile Client screens | 28 | 7 | 35 |
| **Total screens** | **48** | **18** | **66** |
| Playwright E2E tests | 71 | -- | 71 |
| Organization verticals | 20 | 0 | 20 |
| Shared types (TypeScript) | Complete | -- | -- |
| Mock data (packages/shared) | Complete | -- | -- |

### 13.2 What Is Built

- All 20 admin pages with full mock data and interactive UI
- All 28 mobile screens with Expo Router navigation and mock data
- 3 authentication pages (login, register, onboarding wizard)
- 20 organization vertical configs with terminology + feature flags
- Multi-org user model with org switcher in admin sidebar
- Role hierarchy and permission helpers
- Shared TypeScript types for all domain models (Member, Class, WOD, Booking, Lead, etc.)
- Design system: dark theme, Space Grotesk font, green (#3dff6e) accent, glassmorphism cards
- 71 Playwright E2E tests covering navigation, rendering, accessibility, i18n, theme switching
- 10 E2E test spec files: smoke, home, dashboard, classes, members, navigation, admin-pages, a11y, i18n, theme

### 13.3 What Is NOT Built

- **Backend:** No real API wired -- all data is mock (next step: connect tRPC + Drizzle + PostgreSQL)
- **Auth:** Better Auth not integrated -- login/register are UI-only
- **Payments:** No Stripe/MBWay/SEPA integration
- **Fiscal:** No SAF-T/ATCUD generation
- **Notifications:** No push/email/SMS -- UI only
- **Real-time:** No WebSocket connections -- coachboard and timers are static
- **Offline:** No offline sync implemented
- **11 admin pages** not yet built (POS, contracts, automations, kiosk, activities, expenses, budget, TV display, groups, integrations, meetings)
- **7 mobile screens** not yet built (challenges, store, activities, training plans, social feed, calendar sync, dossiers)

### 13.4 Test Coverage

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

## 14. Backlog Summary

### 14.1 Total Story Count

**90 total stories** (65 original + 12 G-NEW + 6 A-NEW + 7 enhancements to existing stories)

| Persona | MVP | Phase 2 | Phase 3 | Phase 4 | Total |
|---|---|---|---|---|---|
| Gestor/Owner | 22 | 15 | 2 | 0 | 39 |
| Coach | 10 | 3 | 2 | 0 | 15 |
| Personal Trainer | 6 | 5 | 1 | 1 | 13 |
| Athlete/Member | 5 | 8 | 1 | 0 | 14 |
| **Total** | **43** | **31** | **6** | **1** | **81** |

Note: Some stories span multiple personas (e.g., leaderboard is both Coach and Athlete). The 81 unique stories above deduplicate cross-persona overlaps. Including all role-specific views, the full backlog is approximately 90 trackable items.

### 14.2 MoSCoW Prioritization

| Priority | Count | Description |
|---|---|---|
| **MUST** | 32 | Essential for MVP launch -- blocking if missing |
| **SHOULD** | 34 | Important for product-market fit -- planned for MVP or Phase 2 |
| **COULD** | 15 | Nice-to-have -- improves UX/engagement but not blocking |
| **WON'T (yet)** | 0 | Deferred beyond Phase 4 |

---

## 15. Key Constraints

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
