# Vytal — Product Requirements Document

**Version:** 1.0
**Last updated:** 2026-06-02
**Status:** Draft
**Team:** vytal-fit

---

## 1. Product Overview

**Vytal** is a SaaS platform for intelligent management of CrossFit boxes, functional training gyms, and personal trainers, with integrated AI capabilities.

**Core mission:** Enable boxes to operate completely independently without external tools like Regybox or Excel spreadsheets.

### 1.1 User Personas

| Persona | Role | Description |
|---|---|---|
| **Gestor/Owner** | Admin | Box management, billing, CRM, staff, compliance |
| **Coach** | Instructor | Group class programming, WODs, athlete tracking |
| **Personal Trainer** | 1:1 Coach | Session scheduling, client CRM, billing |
| **Atleta/Member** | End user | Class booking, WOD tracking, PRs, leaderboard |
| **Nutricionista** | Specialist | Nutrition plans and tracking (Phase 3+) |
| **Fisioterapeuta** | Specialist | Rehabilitation and injury management (Phase 3+) |

### 1.2 Core Principles

1. **Velocidade acima de tudo** — Critical actions in 3 taps or 2 seconds max
2. **Offline-first** — Coach App and Kiosk work without internet; sync on reconnect
3. **Fiscal PT nativo** — SAF-T, ATCUD, QR fiscal mandatory from MVP
4. **RGPD by design** — Granular consent, right to erasure, audit logs, health data encryption (Art. 9)
5. **Modular e extensivel** — Each profile has independent UI/permissions; new modules without core rewrites
6. **IA responsavel** — All AI suggestions include disclaimers; guardrails required; no medical diagnosis

---

## 2. Design System

### 2.1 Color Palette

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

### 2.2 Typography

| Element | Font | Size | Weight | Line-Height |
|---|---|---|---|---|
| Display | Space Grotesk | `clamp(28px, 4vw, 52px)` | 700 | 1.08 |
| Headline | Space Grotesk | 18px | 700 | — |
| Subheadline | Space Grotesk | 13px | 600 | — |
| Body | Space Grotesk | 12-14px | 400-500 | 1.6-1.75 |
| Label | Space Grotesk | 9px | 700 | — |
| Monospace | Space Mono | 10-13px | 400 | — |

Letter-spacing: Display `-0.5px`, Labels `2.5px`, Table headers `1.5px`.

### 2.3 Component Patterns

**Cards:** `rgba(22,32,24,.9)` background, `1px solid rgba(61,255,110,.1)` border, `10px` radius, `18-20px` padding. Hover: border to `rgba(61,255,110,.22)`.

**Buttons:** Transparent border default. Hover: border `rgba(61,255,110,.3)`, background `rgba(61,255,110,.08)`. Transition `0.15s`.

**Inputs:** `#0f1610` background, `rgba(61,255,110,.1)` border, `8px` radius. Focus: border `rgba(61,255,110,.4)`.

**Gradient:** `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(61,255,110,.05), transparent)`.

### 2.4 Logo

- **Mark:** Circular green (`#3dff6e`) background with white monospace "V"
- **Text:** "VYTAL" in Space Grotesk 17px, weight 700, letter-spacing 0.5px
- **Version badge:** Muted gray (`#6b8c72`), 9px, uppercase, letter-spacing 2px

---

## 3. MVP Scope (Phase 1 — 90 days)

### 3.1 What's IN

- Gestor: Dashboard, member CRUD, subscriptions, billing (Stripe/MBWay/SEPA), SAF-T/ATCUD, CRM, automations, staff RBAC, waivers, kiosk check-in
- Coach: Offline app, WOD builder, movement library, class roster, coachboard, TV display, timers, PRs, coaching notes, injury flags, RPE
- PT: Session scheduling, public booking page, session packs, billing/receipts, client CRM, workout plan builder
- Athlete: Class booking (3 taps), QR check-in, WOD view, results, leaderboard, PR history, notifications, gamification

### 3.2 What's OUT of MVP

Wearable integrations, AI nutrition/training, marketplace, corporate wellness, white-label, multi-location, VOD/online classes, nutritionist/PT modules, inter-box challenges, Apple/Google Wallet, Coach Assist AI.

---

## 4. User Stories

### 4.1 Gestor/Owner (25 stories)

#### Epic G1 — Dashboard & KPIs

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

#### Epic G2 — Member Management

| ID | Story | Phase | Priority |
|---|---|---|---|
| G2-01 | Complete member profile CRUD | MVP | MUST |
| G2-02 | Subscription plan creation/management | MVP | MUST |
| G2-03 | Payment dunning alerts | MVP | MUST |
| G2-04 | CSV bulk member import | MVP | MUST |
| G2-05 | Digital contracts & waivers (e-signature) | MVP | MUST |
| G2-06 | New member 30-day onboarding journey | MVP | SHOULD |
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
- Pre-configured sequence: D+0 welcome, D+1 complete profile, D+3 first WOD, D+7 check-in
- Manager-editable content
- Conversion report: % of members completing each step

#### Epic G3 — Billing & Portuguese Tax Compliance

| ID | Story | Phase | Priority |
|---|---|---|---|
| G3-01 | Automatic recurring billing (Stripe, MBWay, SEPA) | MVP | MUST |
| G3-02 | SAF-T + ATCUD + QR code fiscal | MVP | MUST |
| G3-03 | Credit notes & refunds | MVP | MUST |
| G3-04 | Counter POS for quick sales | MVP | MUST |
| G3-05 | Accounting integration (Xero/QuickBooks) | Phase 2 | SHOULD |
| G3-06 | Equipment management & maintenance | Phase 2 | SHOULD |

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

#### Epic G4 — CRM & Lead Pipeline

| ID | Story | Phase | Priority |
|---|---|---|---|
| G4-01 | Lead pipeline kanban | MVP | MUST |
| G4-02 | Lead communication automations | MVP | MUST |
| G4-03 | Retention automations (no-show, birthday, win-back) | MVP | SHOULD |
| G4-04 | Member segmentation & campaigns | Phase 2 | SHOULD |
| G4-05 | Landing pages & capture forms | Phase 2 | COULD |

**G4-01 Acceptance Criteria:**
- Kanban with configurable columns
- Lead card: name, source, entry date, last interaction, plan interest
- Quick actions: call, email, schedule trial
- Automatic lead creation from site form (embed)

**G4-02 Acceptance Criteria:**
- Trigger: lead created -> auto welcome email (editable template)
- Trigger: lead no response 3 days -> auto reminder
- Trigger: trial scheduled -> confirmation + 1h reminder
- All communications logged on lead profile

**G4-03 Acceptance Criteria:**
- No-show: member booked but no check-in -> personalized message next day
- Birthday: email/push on birthday with configurable offer
- Win-back: inactive 21 days -> 3-message reactivation campaign
- All automations configurable (enable/disable, edit content)

#### Epic G5 — Staff, Permissions & Scheduling

| ID | Story | Phase | Priority |
|---|---|---|---|
| G5-01 | Roles & granular permissions (RBAC) | MVP | MUST |
| G5-02 | Coach shift scheduling | MVP | SHOULD |
| G5-03 | Payroll automation for coaches | Phase 2 | SHOULD |
| G5-04 | Internal staff chat | MVP | SHOULD |

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

---

### 4.2 Coach (17 stories)

#### Epic C1 — WOD Builder & Programming

| ID | Story | Phase | Priority |
|---|---|---|---|
| C1-01 | WOD Builder with stimulus types & timers | MVP | MUST |
| C1-02 | Movement library with video & variations | MVP | MUST |
| C1-03 | Weekly workout planning with scheduling | MVP | MUST |
| C1-04 | Automatic %RM calculation for strength | MVP | SHOULD |
| C1-05 | Periodization cycles (4/8/12 weeks) | Phase 2 | SHOULD |
| C1-06 | Coach Assist AI — WOD suggestions | Phase 3 | COULD |
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

#### Epic C2 — Coach App & Class Management

| ID | Story | Phase | Priority |
|---|---|---|---|
| C2-01 | Coach App offline-first with class roster | MVP | MUST |
| C2-02 | Integrated timers during class | MVP | MUST |
| C2-03 | Digital whiteboard/coachboard real-time | MVP | MUST |
| C2-04 | TV display — box screen | MVP | MUST |
| C2-05 | Post-class feedback (RPE) from athletes | MVP | SHOULD |
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

**C2-06 Acceptance Criteria:**
- Free-text notes per athlete with date-stamped history
- Configurable visibility: coach only / all coaches / manager included
- Injury/restriction notes synced with coachboard flag
- Option to share specific note with athlete

#### Epic C3 — PRs, Results & Athlete Progression

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
- Filters: Rx / Scaled / gender / age group
- Historical WOD leaderboard (when same WOD is repeated)
- Visible on TV display and athlete app

**C3-04 Acceptance Criteria:**
- Injury record: date, description, affected movements, status (active/recovered)
- Visual flag on athlete card in coachboard (red icon)
- Notification to coach when athlete with active restriction books class
- Injury history accessible to manager and PT

---

### 4.3 Personal Trainer (17 stories)

#### Epic P1 — Scheduling & Appointments

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

#### Epic P2 — Client CRM & Training Plans

| ID | Story | Phase | Priority |
|---|---|---|---|
| P2-01 | Complete client profile | MVP | MUST |
| P2-02 | Workout plan builder for clients | MVP | MUST |
| P2-03 | Session notes & coaching history | MVP | SHOULD |
| P2-04 | Physical assessments (FMS, etc.) | Phase 2 | SHOULD |
| P2-05 | Weekly progress check-ins | Phase 2 | SHOULD |
| P2-06 | Access to client wearable data | Phase 3 | COULD |
| P2-07 | Marketplace — sell plans | Phase 4 | COULD |

**P2-01 Acceptance Criteria:**
- Data: name, photo, primary/secondary goals, experience level
- Injuries and movement restrictions (shared with coach if client also attends classes)
- Session history with PT notes
- Physical metric evolution (weight, body composition, benchmarks)

**P2-02 Acceptance Criteria:**
- Plan editor: week with configurable training + rest days
- Each session: warmup, exercises with sets/reps/rest, PT notes
- Exercises from library (video included) + custom exercises
- Publish to athlete app: client sees plan, videos, marks as completed
- Reusable plan templates for new clients

**P2-03 Acceptance Criteria:**
- Notes field per session with timestamp
- Note visible to PT in context of next session
- Option to share note with client via push/email

#### Epic P3 — Billing & Revenue

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

### 4.4 Athlete/Member (11 stories)

#### Epic A1 — Booking, Check-in & Plans

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

#### Epic A2 — WOD, PRs, Leaderboard & Gamification

| ID | Story | Phase | Priority |
|---|---|---|---|
| A2-01 | View WOD with details & videos | MVP | MUST |
| A2-02 | Register result & view leaderboard | MVP | MUST |
| A2-03 | PR history & progression per movement | MVP | MUST |
| A2-04 | Gamification (streaks, medals, ranking) | MVP | SHOULD |
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
- Medals: check-in milestones (10, 50, 100, 250, 500)
- Monthly box ranking by check-ins (optional, can disable)
- Notification on new medal or streak level

**A2-05 Acceptance Criteria:**
- Chronological feed: PRs, highlighted results, colleague check-ins
- Fistbump reaction on colleague results
- 1-line comment (WhatsApp-style)
- Privacy option: show/hide results from feed

---

## 5. Technical Architecture

### 5.1 Stack

| Layer | Technology |
|---|---|
| **Web** | Next.js 15 (App Router), React 19, Tailwind CSS 4, Radix UI |
| **Mobile** | React Native (cross-platform, offline-first) |
| **API** | tRPC, Node.js |
| **Database** | PostgreSQL (OLTP) |
| **Cache** | Redis (sessions, real-time) |
| **Real-time** | WebSockets (coachboard, leaderboard, timers) |
| **Auth** | Better Auth (JWT + refresh tokens, RBAC) |
| **ORM** | Drizzle ORM |
| **Storage** | AWS S3 (exercise videos, media) |
| **Build** | Turborepo, TypeScript 5, npm workspaces |
| **Test** | Vitest |
| **Deploy** | Vercel (web), EAS (mobile) |
| **CI/CD** | GitHub Actions |

### 5.2 Monorepo Structure

```
apps/
  web/              — Next.js 15 App Router (Vercel)
  mobile/           — React Native (future)
packages/
  api/              — tRPC routers
  db/               — Drizzle ORM schema + migrations
  auth/             — Better Auth instance
  shared/           — Shared types, constants, utilities
```

### 5.3 Security & Compliance

- **Auth:** JWT + refresh tokens with RBAC
- **RGPD:** Consent management, audit logs, right to erasure, Art. 9 health data encryption at rest
- **Payments:** SCA/3DS compliant for EU transactions
- **Feature flags:** Per-country, per-plan toggles without re-deploy

### 5.4 MVP Integrations

| Integration | Purpose |
|---|---|
| Stripe | Card payments (Visa/MC), SCA-compliant |
| MBWay API | Mobile payments (Portugal) |
| SEPA Direct Debit | Recurring bank payments |
| Multibanco | Payment references (Portugal) |
| Portuguese Tax Authority | SAF-T, ATCUD, QR fiscal |
| SendGrid | Transactional email |
| Firebase | Push notifications (FCM/APNs) |
| Twilio | SMS notifications |
| AWS S3 | Media storage |

### 5.5 Phase 2+ Integrations

Garmin Connect, Apple HealthKit, Google Fit, Strava, Whoop, Polar, Xero, QuickBooks, Zapier, Zoom/Google Meet, Coverflex/Cobee.

---

## 6. Roadmap

### Phase 1 — MVP (0-90 days) — 38 stories

Core operations for all 4 personas: member lifecycle, billing with Portuguese fiscal compliance, coach offline app, PT scheduling/invoicing, athlete booking/WOD/leaderboard, kiosk check-in, RBAC, waivers, CRM, automations, dashboard KPIs.

### Phase 2 (120-180 days) — 19 stories

Wearable integrations (Garmin, Apple Health, Google Fit, Strava). AI lite (forecast, NPS, health score). Nutritionist virtual (lite). PT: physical assessments, weekly check-ins, payroll. Athlete: social feed, skills/belts, referral. Box: family accounts, drop-ins, landing pages. Accounting integrations. Staff shift swaps and chat.

### Phase 3 (180-360 days) — 8 stories

Advanced AI (overtraining risk, digital twin, recovery, mental coaching). Wearables for PT (HRV, sleep). Coach Assist AI. Revenue/occupancy predictions. Multi-location beta. Physiotherapist module. Online classes (VOD). Inter-box challenges.

### Phase 4 (1 year+)

Marketplace (PT plans). Corporate wellness B2B. Payroll integrations (Coverflex, Cobee, Edenred). White-label. Conversational AI. Full multi-location + franchising. Public API.

---

## 7. Backlog Summary

**65 total stories:** 38 MVP | 19 Phase 2 | 8 Phase 3+ | 5 Phase 4

| Persona | MVP | Phase 2 | Phase 3+ | Total |
|---|---|---|---|---|
| Gestor | 17 | 10 | 2 | 29 |
| Coach | 12 | 2 | 3 | 17 |
| PT | 8 | 5 | 2 | 15 |
| Athlete | 7 | 2 | 1 | 10 |

All stories prioritized using MoSCoW: **MUST** (essential MVP), **SHOULD** (important, post-MVP), **COULD** (nice-to-have).

---

## 8. Key Constraints

1. **SAF-T, ATCUD, QR fiscal** are non-negotiable compliance — present in MVP, not optional
2. **Offline-first** for Coach App and kiosk — must work without internet
3. **<=3 taps** for booking, check-in, result entry — UX is the product
4. **RGPD Art. 9** — health data encrypted at rest; granular consent from day 1
5. **Real-time** — coachboard, leaderboard, timers require sub-second latency (WebSocket)
6. **Modular architecture** — each persona has independent UI/permissions
7. **AI guardrails** — all suggestions include disclaimers; no medical diagnosis
