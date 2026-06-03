# Regibox Competitive Analysis

**Source:** Live exploration of Regibox admin panel and client app (CrossFit Aveiro, box #38)
**Date:** 2026-06-03
**Purpose:** Feature inventory to ensure Vytal matches or exceeds Regibox in every area

---

## Executive Summary

Regibox is a mature PHP-based platform with 17 admin modules and a Framework7 mobile web app. It serves CrossFit boxes, gyms, and training centers across Portugal and Brazil. Key strengths: comprehensive class management with FullCalendar, 7-stage CRM pipeline, SEPA direct debit integration, and a modular upsell model. Key weaknesses: legacy PHP/iframe architecture, no real-time capabilities, limited AI features, no offline mode, and a dated UI.

**Vytal's opportunity:** Modern stack (Next.js + React Native), real-time WebSocket features (coachboard, timers, leaderboard), offline-first coach app, AI-powered insights, and a superior UX — while matching every feature Regibox currently offers.

---

## 1. Admin Module Map

Regibox admin has 17 top-level modules:

| Module | Regibox | Vytal PRD Coverage | Gap |
|---|---|---|---|
| Box Settings | Details, logo, GPS, social links, timezone, currency | G1-01 Dashboard | Add box profile settings |
| Members (alunos) | Search, import, permissions, options, login tracking | G2-01 to G2-09 | Covered |
| Staff (profs) | Permissions, admin logins | G5-01 to G5-04 | Covered |
| Classes (aulas) | Calendar, types, plans, bulk ops, reports, drop-ins, history | C2-01 to C2-06, G2-02 | Covered |
| Workouts | Exercises, group WODs, personal training, Regy Screen | C1-01 to C1-07, C3-01 to C3-04 | Covered |
| CRM | Integrations, leads, new members, monitoring, options | G4-01 to G4-05 | Covered |
| Communications | News, emails, SMS, meetings | G4-02, G4-03 | Add meetings module |
| Financial | Direct debit, expenses, monthly budget, options | G3-01 to G3-06 | Add expense tracking + budget |
| POS | Credit, options | G3-04 | Covered |
| Activities | Competitions, challenges, races, awards, tournaments | Not in PRD | **NEW: Add activities/events engine** |
| Tablet/Kiosk | Check-in, score logging, digital signature, rotating images | A1-02 | Add kiosk customization |
| Mobile APP | Colors, menus, content toggles, PWA, QR install | - | Add app customization settings |
| Dashboard | Dashboard 2.0 (separate module) | G1-01 to G1-08 | Covered |
| Partnerships | NControl integration | - | Low priority |
| Omni | Omni channel | - | Low priority |
| Additional Modules | Upsell: Graduations, Physical Eval 2.0, Training Plans | - | Build natively, no upsell gates |
| Updates | Video tutorials | - | Add in-app help system |

---

## 2. Classes / Services Module

### 2.1 Class Calendar (Manage Classes)

**What Regibox has:**
- FullCalendar weekly/monthly/day views with zoom controls
- Click-to-create on empty time slots
- Drag-and-drop event editing
- Copy/paste entire weeks
- Copy individual classes
- Delete entire weeks
- Active/Inactive toggle for all classes (with custom APP message)
- Filter by: location, coach, class type
- Color-coded events per class type
- Events show: title, coach, registrations/capacity count
- Date range navigation with valid boundaries

**Create/Edit class form fields:**
- Date, start time, end time
- Location (8 locations: Empresa, First Floor, Open Box, Outdoors, PT, Strength Box, White Box, Yellow Box)
- Class type (30+ types: WOD, Open Box, Strength, Hyrox, CF Teens, Workshops, etc.)
- Maximum capacity (toggle + number)
- Multiple coaches (checkbox with photos)
- Registration rules: according to defined rules OR custom per-class
  - Allow registrations until: beginning / custom (days+hours+mins before) / end
  - Allow cancellation until: beginning / custom / end
  - Allow registrations with advance of: days + hours + minutes
- Waiting list: general options / no / unlimited / up to N (1-100)
- Bilingual daily message (PT + EN) associated to a date

**Search/filter view:**
- Date range with 10+ presets (today, yesterday, this week, last week, etc.)
- Filter by: location, class type, coach
- Order by: date/time, class type, location
- Records per page: 10-200

**Vytal must have:** All of the above, plus real-time occupancy updates, WebSocket sync between coach app and admin.

### 2.2 Class Types

**What Regibox has:**
- Name + abbreviation (auto-generated, editable)
- SVG icon selector (200+ icons)
- Color picker per type
- Active/inactive toggle
- Email notification toggle
- Registration list visibility toggle
- DataTable with search

**Vytal must have:** All of the above.

### 2.3 Membership Plans & Permissions

**What Regibox has:**
- Three financial categories: Memberships, Services, Products
- Membership plans: Monthly (9/13/unlimited sessions), semester, annual, weekly, daily, trial 30 days, voucher packs (10 sessions), corporate protocols, team building, direct debit variants
- Services: PTs, osteo/physio, physical assessment, workshops, nutrition, space rental, coaching, vouchers, Hyrox doubles
- Products: Clothing, shop items, consumables, brand partnerships
- Per-plan class type permissions (which classes each plan can book)

**Vytal must have:** All of the above, plus configurable per-plan weekly class limits and time slot restrictions (already in PRD G2-02).

### 2.4 Locations / Rooms

**What Regibox has:**
- 8 configurable locations/rooms
- Per-class location assignment
- Filter classes by location

**Vytal must have:** Same, with future multi-location (multi-box) support.

### 2.5 Drop-ins

**What Regibox has:**
- Price/description configuration
- Active/inactive toggle
- GPS coordinates with draggable map marker
- Accept registrations from: box members + visitors / members only
- Email validation for visitors
- Required details: full (name, email, phone, gender, DOB) / basic (name, email)
- Email notification on new drop-in
- Absence limit filter (0-5 max absences)
- WOD visibility for drop-ins
- Participant list visibility: full / count only / hidden
- Multi-language details (PT/EN): About, Equipment, Parking, Showers, Bar, Payment methods
- Photo gallery with drag-and-drop upload and reorder

**Vytal must have:** All of the above. Cross-box drop-in network is a major Regibox feature.

### 2.6 Listings & Reports

**What Regibox has:**
- Report 1: Registrations, attendances, absences (PDF) — by date range, group, member, type
- Report 2: Totals (Excel + PDF) — same filters
- Report 3: Monthly map (Excel + PDF) — by month/year, class type, group, status, include free transit
- Report 4: Members by class type (PDF) — class type, status, order by
- Report 5: Members by membership plan (PDF)
- Report 6: Athletes with complementary plans (PDF)
- Report 7: Total classes/services (PDF) — by date range
- Groups/Teams support for filtering

**Vytal must have:** All reports, plus interactive dashboards (not just static PDF/Excel exports).

### 2.7 Bulk Operations

**What Regibox has:**
- Bulk class deletion by date range
- Bulk class creation tools

**Vytal must have:** Same.

### 2.8 Class History

**What Regibox has:**
- Historical view of all past classes with filters

**Vytal must have:** Same.

---

## 3. Workouts Module

### 3.1 Exercise Library

**What Regibox has:**
- Exercise management with video
- Categories for organizing exercises
- Rich text descriptions (Summernote editor)
- Tagging/categories (Select2 dropdowns)
- Toggle active/inactive

**Vytal must have:** All of the above, plus 200+ pre-loaded movements with demo videos and scaling variations (already in PRD C1-02).

### 3.2 Group Workouts (WOD Programming)

**What Regibox has:**
- Weekly/multi-week timeline (1-10 weeks, default 8)
- Per-class-type workout programming
- Date picker navigation
- Class type selector with icons (30+ types)
- Show/hide weeks, toolbar, descriptions
- Sharing functionality
- Category management
- Export to Excel and PDF
- Drag-and-drop workout builder

**Vytal must have:** All of the above, plus structured WOD parts (Warm Up / Skill / WOD / Cool Down), 1-click publish to athlete app + TV display, and auto-saved drafts (already in PRD C1-01, C1-03).

### 3.3 Personal Training

**What Regibox has:**
- **Programs tab:** Create named programs (e.g., "WENDLER 531 - 4 sessions/week"), view/edit/delete/rename
- **Athletes tab:** Search by membership number, name, program filter (all / without / with / finished / in progress)
- **Feedback Scales tab:** Create custom feedback questionnaires (e.g., "Did you like this exercise?", "Difficulty level", "Did you feel pain?"), with editable items per scale, lock when associated
- **Legacy PT tab:** Read-only consultation of old PT plans

**Vytal must have:** All of the above. Feedback scales are a nice feature — add them to the RPE system (PRD C2-05).

### 3.4 Regy Screen (TV Display)

**What Regibox has:**
- Dedicated TV display web app
- Controlled from admin panel

**Vytal must have:** Same — already in PRD C2-04 (1080p/4K optimized, auto-mode, remote control from coach phone).

### 3.5 Workout Options

**What Regibox has:**
- Group workout visibility and scoring settings
- Special permissions for specific members/coaches
- Individual workout settings
- Movement library configuration

**Vytal must have:** Same, with more granular permissions.

---

## 4. CRM Module

### 4.1 Lead Pipeline

**What Regibox has:**
- 7 pipeline stages with auto-progression rules:
  - Leads (28) — manually added or imported
  - Contacted (27) — auto when form filled or communication logged
  - Prospects (82) — auto when trial class booked
  - Subscribed (0) — auto when converted to athlete
  - Failures (0) — manually flagged
  - Drop-ins (2,524) — auto when guest class booked
  - Others (644) — catch-all

**Vytal must have:** Same pipeline with additional automation (PRD G4-01 kanban + G4-02 automations), but with AI-powered lead scoring (Phase 2).

### 4.2 Lead Management

**What Regibox has:**
- Add lead: name, email, mobile, language (PT/EN), recommended by (dropdown of all members), how heard about us (customizable), initial contact method (customizable), assign to staff, notes
- Excel import with drag-and-drop, column mapping, template download, batch staff assignment
- Search/filter: date range (10+ presets), name, email, mobile, notes, type (7 stages), assigned staff, how heard, initial contact, order by (6 options), per page 10-100
- Bulk delete with multi-select checkboxes
- Contact detail modal: book trial, send confirmation/feedback email, convert to member, mark as failed, communication history

**Vytal must have:** All of the above.

### 4.3 Email Templates (CRM)

**What Regibox has:**
- Trial class confirmation (PT + EN): subject, greeting, body, class details toggle, Google Calendar button toggle, map link toggle, closing text, responsible person photo toggle, contacts/social toggle
- Feedback email after trial: same structure + questionnaire selector (3 built-in questionnaires)
- Send test email to self
- Rich text editing

**Vytal must have:** Same, with more templates and an email builder.

### 4.4 CRM Statistics

**What Regibox has:**
- Date range filter
- Staff filter
- Chart.js visualization
- Activity log with date/time/staff filters

**Vytal must have:** Same, with interactive dashboards.

### 4.5 New Member Retention (16-Week Monitoring)

**What Regibox has:**
- 4 tabs: Week 1-4, 5-8, 9-12, 13-16
- Per-member cards with photo, membership number, name, assigned coach
- Color-coded attendance indicators (green/yellow/orange/red/gray)
- "Advantage index" engagement scoring (0-100% with 5 color zones)
- Configurable attendance thresholds (slider: 1-30 range with 5 handles)
- Configurable advantage index thresholds (slider: 1-100 range with 5 handles)
- Bulk selection with checkboxes
- Bulk communication: APP notification, email, SMS, push, schedule meeting

**Vytal must have:** All of the above — this is a critical retention tool. Map to PRD G2-06 (30-day onboarding) but extend to 16 weeks.

### 4.6 Member Monitor

**What Regibox has:**
- Full member list with attendance tracking
- Photo hover zoom
- Assigned coach column
- Bulk communication tools (same 5 channels)
- DataTable with sorting and search

**Vytal must have:** Same, integrated with the dashboard alerts (PRD G1-03).

### 4.7 Site Integrations

**What Regibox has:**
- 7 embeddable form types:
  1. Contact/Callback Request → auto-inserts into CRM as "Contacted"
  2. New Member Registration → auto-sends APP login, configurable auto-active/inactive
  3. Trial Class Booking → confirmation email, CRM integration
  4. Voucher Pack Sales → online purchase, self-registration for classes
  5. Membership Plan Sales → online purchase, choose start date
  6. Class/Service Sales → individual class purchase (1-9 per booking), per-type pricing
  7. Custom form
- Configurable form fields (16 fields, each mandatory/optional toggle)
- Multi-language text (PT/EN with auto-translate)
- Layout customization: margins, colors (bg, text, buttons, links), font family, font size, border radius, logo

**Vytal must have:** All 7 integration types — this is how Regibox captures leads from gym websites. Add to PRD G4-05 (Landing pages & capture forms).

### 4.8 CRM Options

**What Regibox has:**
- Advantage index calculation basis: registrations vs attendances
- New member monitoring period: 4/8/12/16 weeks
- Advantage index calculation window: 7-180 days
- Absence notification threshold: 1-30+ days
- Advantage index notification threshold: 10-90%
- Contact suppression window: 2-72 hours (avoid spamming)
- Manual "UPDATE NOW" for recalculation (auto-runs 2x daily)

**Vytal must have:** All settings, with real-time calculation instead of 2x daily batch.

---

## 5. Members Module

### 5.1 Member Search & Stats

**What Regibox has:**
- Stats bar: Total (1,057), Active (428), With/Without member number, Inactive (629), Regularized (92), Suspended (0)
- PDF export per segment
- Search by: membership number, name, email, ID card, NIF, mobile
- Filter by: frequency (1-14x/week, 1-30x/month), payment period (weekly to annually + vouchers + free transit), gender, box, active/inactive/suspended
- Order by: member number, name, ID card, gender, email, birthdate, login times, registration date, inactive date

**Vytal must have:** All of the above.

### 5.2 Member Options

**What Regibox has:**
- Auto-numbering: sequential / sequential + suffix (multi-box)
- Self-service toggles: change password, change photo (with photo upload suggestion), change personal details
- Profile completion enforcement: require X% complete with access block after N warnings
- Required field enforcement: 15 configurable fields (nickname, email, DOB, ID card, NIF, mobile, emergency contact, gender, profession, address, zip, weight, height)

**Vytal must have:** All self-service options.

### 5.3 Member Import

**What Regibox has:**
- Excel import (.xls) with drag-and-drop
- Template sheet download
- Progress bar
- Batch staff assignment

**Vytal must have:** Same, plus Regybox and Wodify format support (PRD G2-04).

---

## 6. Financial Module

### 6.1 Direct Debit (SEPA)

**What Regibox has:**
- Creditor entity setup
- Debtor management per member (search by IBAN, mandate ID, name, etc.)
- C2B SEPA billing file generation
- Bank XML return file import for payment validation
- Return/refund/chargeback processing
- Revenue category association (3-tier: Memberships/Services/Products with 50+ subcategories)
- Vendus invoicing integration

**Vytal must have:** SEPA DD support — critical for Portuguese market. Map to PRD G3-01.

### 6.2 Expense Tracking

**What Regibox has:**
- Full expense CRUD with categorization:
  - Fixed: water, electricity, gas, rent, cleaning, staff, internet, accountant, social security, tax, bank, meal cards
  - Variable: gear, drinks, lawyer, maintenance, insurance, subscriptions, marketing, stationery, bank charges, clothing
  - Tax: VAT, payments on account, rent withholding, IRC, social security, IRS
- 9 payment methods
- Warranty tracking
- Staff attribution
- Date range search with 10+ presets
- Two views: LIST (paginated) and TOTAL (aggregated by category)
- Vendus invoice integration

**Vytal must have:** Expense tracking is NOT in current PRD. **ADD as new epic G3-07.**

### 6.3 Monthly Budget

**What Regibox has:**
- Per-subcategory monthly spending limits
- Previous month actual vs limit comparison
- Running total animation
- Grouped by category (Fixed/Variable/Tax)

**Vytal must have:** Budget management is NOT in current PRD. **ADD as new epic G3-08.**

### 6.4 Payment Methods

**What Regibox supports:**
Credit card, Bank Check, Direct Debit (SEPA), Cash, MBWAY, Multibanco, ATM Reference, Bank Transfer, Other

**Vytal PRD already covers:** Stripe (card), MBWay, SEPA DD, Multibanco reference. Add: Cash, Bank Transfer, Bank Check.

---

## 7. POS Module

### 7.1 Member Credit

**What Regibox has:**
- Member search (all members with photos)
- Current credit display
- Add credit with live calculation
- Optional financial category association (auto-registers as revenue)
- Recent operations list with cancel/undo
- 9 payment methods

### 7.2 POS Options

**What Regibox has:**
- Block class registrations for negative-balance members (configurable deadline: 1-90 days)
- Credit category/subcategory mapping
- APP self-service credit adds auto-register as revenue

**Vytal must have:** Both, plus a proper product catalog (PRD G3-04).

---

## 8. Communications Module

### 8.1 Channels

**What Regibox has (5 channels):**
1. **Email** — Bulk/individual, Summernote rich text editor, bilingual templates, member selection from full list
2. **SMS** — Via RegySMS Android APK (uses phone's SIM as gateway), schedule sending, filter by frequency/gender/status/class type/age range/group
3. **APP News** — Rich text + image upload, target audience (all or specific), comments/likes moderation, active/inactive/featured status
4. **Push notifications** — In-app messaging
5. **Meetings** — Schedule with members, email notifications, reminders (days/hours/minutes before)

**Vytal must have:** All 5 channels. SMS via native integration (Twilio) instead of requiring an Android phone. Add meeting scheduling to PRD — **NEW epic G5-05.**

### 8.2 Communication Targeting

**What Regibox has:**
- Filter by: frequency, gender, status, class types, groups/teams, membership plan, age range
- Target: all active / specific members
- Bulk selection with checkboxes

**Vytal must have:** Same, with more advanced segmentation (PRD G4-04).

---

## 9. Activities / Events Module

**What Regibox has (NOT in Vytal PRD):**

8 activity types:
1. **Cross-training Competition** — Full competition management with heats, scores, leaderboards
2. **Challenge** — Month/week challenges with score logging and video submission
3. **Race** — Running, cycling, triathlon with time tracking
4. **Member of the Month** — Qualifying phase + voting phase
5. **Awards Ceremony** — Category-based voting with bar chart results
6. **Secret Friend** — Gift exchange for parties
7. **Tournament** — Multiple sports (handball, badminton, basketball, soccer, padel, tennis, etc.)
8. **Other Activities** — Generic registration + payment collection

Per activity:
- Title, type (unchangeable after creation), privacy (all/personal), visibility (box members/everyone)
- Icon selector (SVG picker)
- APP highlight options: no / yes / until registration deadline / until activity start
- Status tracking (completed/active)
- Terms of use (PDF), poster image, video tutorials

**Vytal must add:** Activities/events engine as a new module. **NEW epic: Activities (Phase 2).** This covers competitions, challenges, social events — great for community engagement.

---

## 10. Tablet / Kiosk Module

**What Regibox has:**
- 6 rotating display images with custom text overlays (30 chars each)
- Check-in timing: beginning of class / 5-60 minutes before
- 4 animation types + random
- Theme color: 8 options (red, green, blue, pink, yellow, orange, grey, black)
- 7 customizable button colors (outer shadow, ellipses, arc/dots, background, circles, text bg, text)
- Toggleable buttons: new member registration, digital signature, check-in, score logging, training plans
- QR code for tablet app launch
- Multi-tablet support (different configs per tablet)

**Vytal must have:** All of the above for the kiosk check-in (PRD G3-04 mentions POS on tablet). Extend kiosk module.

---

## 11. Mobile App Configuration

**What Regibox has (configurable from admin):**
- **Theme:** Background (dark/light), theme color (8 + custom), member color override toggle
- **Custom menus:** Add URL-based menu items
- **Content toggles (20+ sections):**
  - Classes/Services (+ COVID cert, book class, drop-in sub-options)
  - Workouts (box workouts, individual, movements, historic)
  - Records (personal, box)
  - Physical Evaluation
  - Digital Dossiers
  - News
  - Store (box store, Prozis)
  - Challenge
  - Ranking
  - Best WOD Results
  - Fistbumps and Comments
  - My Box (rules, birthdays, members, coaches, contacts)
  - Converters (unit converters)
  - Timers
  - Settings (personal details, password, photo, locations, class types, account, privacy, email options, other)
- **PWA:** Custom icon (512px+), title, splash screen color, QR code for installation
- **Activities visibility:** All / own box only / custom
- **Birthday visibility:** Yes / No / HR staff only

**Vytal must have:** Admin-configurable mobile app content. This is a huge feature — the box owner controls what athletes see in the app.

---

## 12. Client App (Athlete-Facing) Features

From admin configuration and login page analysis:

| Feature | Description |
|---|---|
| **Class Booking** | View schedule, book/cancel classes, waiting list |
| **QR Check-in** | At kiosk tablet |
| **WOD View** | Daily workout with details |
| **Score Logging** | Enter results on tablet or app |
| **Workouts** | Box workouts, individual plans, movement library, history |
| **Records/PRs** | Personal records, box records |
| **Ranking** | Box ranking/leaderboard |
| **Best Results** | Highlighted WOD performances |
| **Fistbumps & Comments** | Social reactions on results |
| **News** | Box news feed with comments/likes |
| **Store** | In-app store (box products + Prozis integration) |
| **Challenge** | Participate in box challenges |
| **Activities** | Competition registration, challenges, events |
| **Physical Evaluation** | Body composition, fitness assessments |
| **Digital Dossiers** | Document storage |
| **Timers** | AMRAP, EMOM, Tabata, Stopwatch |
| **Converters** | Unit converters (lbs/kg, etc.) |
| **My Box** | Class rules, birthdays, member/coach directory, contacts |
| **Settings** | Personal details, password, photo, notifications, privacy |
| **Feedback** | Post-class questionnaires |
| **Messages** | In-app messaging |

---

## 13. Box Settings

**What Regibox has:**
- Business type: Box, Gym, Studio, Academy, Training Center, Health Club, School, Therapy Center
- Name, slogan, email, phone, mobile (with Portuguese legal compliance text)
- Timezone (UTC -12 to +14)
- Currency: EUR, BRL, GBP, MZN, MAD, AOA, CVE, CHF
- Social links: website, Facebook, YouTube, Instagram, Twitter
- Logo upload (JPG)
- Address, zip code, city, country (full world list)
- GPS coordinates with draggable Google Maps marker

**Vytal must have:** All box profile settings. Add to admin settings module.

---

## 14. Premium/Upsell Features (RegyPlus+)

Regibox gates these features behind a premium plan:
- IBAN search in Direct Debit
- Filter by Box in Direct Debit
- Digital signature on tablet (generates PDF contracts)
- Training plans on tablet
- Sequential numbering with suffix for multi-box

**Vytal advantage:** Include ALL features natively — no upsell gates. This is a key differentiator.

Additional paid modules (EUR 17-20/month each):
- Graduations (belt/level progression)
- Physical Evaluation 2.0 (advanced body composition)
- Standardized Training Plans

**Vytal advantage:** Build these natively in the platform.

---

## 15. Integration Points

**What Regibox integrates with:**
- Vendus (Portuguese invoicing software)
- SEPA banking (C2B file generation + XML return)
- Google Maps API (box location, drop-in map)
- Google Calendar (add trial class to calendar)
- RegySMS (Android APK as SMS gateway)
- Prozis Store (nutrition/supplement store in APP)
- ManyChat (chatbot — listed as expense category)
- NControl (access control partnership)
- FullCalendar, DataTables, Select2, Summernote, Chart.js (internal libs)

**Vytal will integrate with:**
- Stripe (cards, SCA), MBWay, SEPA DD, Multibanco (PRD MVP)
- SendGrid (email), Firebase (push), Twilio (SMS) (PRD MVP)
- AWS S3 (media) (PRD MVP)
- Portuguese Tax Authority (SAF-T, ATCUD, QR fiscal) (PRD MVP)
- Garmin, Apple Health, Google Fit, Strava (Phase 2)
- Xero/QuickBooks, Zapier (Phase 2)

---

## 16. Gaps — Features to ADD to Vytal PRD

Based on this analysis, the following features are present in Regibox but missing from the current Vytal PRD:

### Must Add (MVP)

| # | Feature | Regibox Module | Suggested Vytal Epic |
|---|---|---|---|
| 1 | Box profile settings (name, logo, GPS, social, timezone, currency, business type) | Box Settings | G-NEW-01 |
| 2 | Expense tracking with categorization (fixed/variable/tax) + payment method | Financial > Expenses | G3-07 |
| 3 | Monthly budget per expense category with actual vs limit comparison | Financial > Budget | G3-08 |
| 4 | Drop-in system (cross-box visiting athletes with GPS map, photos, details) | Classes > Drop-ins | G-NEW-02 |
| 5 | 16-week new member retention monitoring with attendance scoring | CRM > New Members | Extend G2-06 to 16 weeks |
| 6 | "Advantage index" — engagement scoring with configurable thresholds + coach alerts | CRM > Options | G-NEW-03 |
| 7 | Contact suppression window (avoid spamming recently contacted members) | CRM > Options | G4-03 enhancement |
| 8 | Website embeddable forms (7 types: contact, register, trial, voucher sale, plan sale, class sale, custom) | CRM > Site Integrations | Extend G4-05 |
| 9 | Configurable mobile app content (admin controls what athletes see) | Mobile APP Options | G-NEW-04 |
| 10 | Kiosk/tablet customization (images, colors, buttons, animations, multi-tablet) | Tablet Options | Extend A1-02 |
| 11 | Member auto-inactivation after N days absent | Class Options | G-NEW-05 |
| 12 | Groups/Teams for member segmentation and filtering | Cross-cutting | G-NEW-06 |

### Should Add (Phase 2)

| # | Feature | Regibox Module | Suggested Vytal Epic |
|---|---|---|---|
| 13 | Activities/events engine (competitions, challenges, races, awards, tournaments, secret friend) | Activities | Activities Epic (Phase 2) |
| 14 | Meeting scheduling with members (email notifications, reminders) | Communications > Meetings | G5-05 |
| 15 | Custom feedback scales/questionnaires | Workouts > PT | Extend C2-05 |
| 16 | SEPA C2B file generation + bank return XML processing | Financial > DD | Extend G3-01 |
| 17 | In-app store (box products + partner stores like Prozis) | POS + APP | POS Epic (Phase 2) |
| 18 | Digital dossiers (document storage for members) | Dossiers | Phase 2 |
| 19 | Physical evaluation / body composition assessments | Phys Eval | Extend to include FMS (P2-04) |
| 20 | Graduations / belt system | Additional Modules | Extend C3-03 (skills & levels) |
| 21 | Unit converters (lbs/kg, etc.) in athlete app | APP > Converters | A-NEW-01 |
| 22 | Birthday visibility in athlete app | APP > My Box | A-NEW-02 |

---

## 17. Vytal Competitive Advantages Over Regibox

| Area | Regibox | Vytal |
|---|---|---|
| **Architecture** | Legacy PHP + iframes, jQuery, Bootstrap 4 | Next.js 15, React 19, tRPC, Tailwind CSS 4 |
| **Mobile** | Framework7 webview (PWA) | Native React Native (Expo) — offline-first |
| **Real-time** | Polling (30s refresh) | WebSocket (sub-second for coachboard, timers, leaderboard) |
| **Offline** | No offline support | Coach app + kiosk work without internet |
| **AI** | None | AI-powered: churn prediction, WOD suggestions, nutrition assistant (Phase 2+) |
| **Fiscal** | Via Vendus (3rd party) | Native SAF-T, ATCUD, QR fiscal — no 3rd party dependency |
| **SMS** | Requires Android phone as gateway | Twilio (proper SMS API) |
| **UX/UI** | Dated Bootstrap 4, iframes, popups | Modern dark theme, Space Grotesk, glassmorphism cards |
| **Pricing** | Feature gates (RegyPlus+), paid modules (EUR 17-20/mo each) | All features included — no upsell gates |
| **WOD Builder** | Basic drag-and-drop | Structured (Warm Up/Skill/WOD/Cool Down), auto %RM calc, 1-click publish |
| **Coachboard** | Static page | Real-time score entry, auto-sort, PR highlights, timer sync |
| **TV Display** | Basic | 1080p/4K optimized, auto-mode, remote control from coach phone |
| **Gamification** | Ranking, best results | Streaks, medals, milestones, social feed with fistbumps |
| **RGPD** | Basic | RGPD by design — Art. 9 health data encryption, consent, audit logs |
| **Multi-language** | PT + EN | PT + EN + ES |
