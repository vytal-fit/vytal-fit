# QA scenario bank

Per-feature scenarios mapped to PRD acceptance criteria, plus reusable journeys
and personas.

## Personas to test as

- **Carlos — Gestor/Owner.** Manages the box. Billing, members, CRM, staff.
  Should see everything in his box, nothing from other boxes.
- **Marta — Coach.** Programs WODs, runs classes. Should see class roster,
  coachboard, athlete PRs. Should NOT see billing or CRM.
- **Joao — Personal Trainer.** Manages 1:1 clients, scheduling, session packs.
  Should only see his own clients and schedule.
- **Ana — Athlete/Member.** Books classes, logs results, tracks PRs. Should only
  see her own data and box leaderboards.
- **Box B user.** Used only to prove tenant isolation: must never see Box A data.

## Cross-cutting checks (run on every UI change)

- Tenant isolation: as Box B, attempt to view Box A records by direct URL/id.
- Role gating: as Ana (Athlete), hit a Gestor URL directly — must be blocked.
- Responsive at sm/md/lg/xl; tables→cards, sidebar→bottom nav, >=44px taps.
- Light + dark on every surface.
- i18n PT/EN/ES: no missing keys, no raw key paths, no overflow, natural PT-PT.
- Loading / empty / error states present.
- Keyboard nav + visible focus + labelled inputs.
- Critical actions <=3 taps and <=2 seconds.

## Feature scenarios

### G1 — Dashboard & KPIs
- Dashboard loads with today's classes, occupancy %, active members, alerts.
- Data refreshes (polling <=30s or websocket).
- Pending actions widget shows overdue payments, leads without follow-up.
- Edge: empty box (no members), first-day setup.

### G2 — Member Management
- Create member with all fields (name, NIF, phone, DOB, goals, photo).
- Health section (injuries, PAR-Q) visible to coach.
- Subscription plan CRUD (monthly, pack, annual, day pass).
- Dunning sequence fires correctly.
- CSV import with column mapping, preview, error report.
- Digital waiver with e-signature, timestamp, IP.
- Edge: duplicate member, invalid NIF, expired waiver.

### G3 — Billing & Fiscal
- Automatic charge on configured date.
- Invoice with ATCUD, QR fiscal code, correct numbering.
- SAF-T XML export validates against AT schema.
- Credit note linked to original invoice.
- POS quick sale with receipt.
- Edge: failed payment retry, partial refund, zero-amount invoice.

### G4 — CRM & Leads
- Kanban pipeline with configurable columns.
- Lead auto-created from form embed.
- Automation triggers fire (welcome email, no-response reminder, trial confirm).
- Retention automations (no-show, birthday, win-back).
- Edge: lead with no email, duplicate lead.

### C1 — WOD Builder
- Create WOD with AMRAP/EMOM/For Time/Tabata/Strength.
- Parts: Warm Up / Skill / WOD / Cool Down.
- Each exercise linked to movement library with video.
- Publish to athlete app + TV display with 1 click.
- Auto-saved drafts.
- Edge: empty WOD, WOD with 50+ exercises.

### C2 — Coach App & Class
- Class roster with enrolled athletes, photos, plan info.
- Manual check-in by tap.
- Injury/restriction flags visible.
- Timer types: AMRAP, EMOM, Countdown, Stopwatch.
- Timer mirrored on TV display.
- Coachboard with real-time score entry and auto-sort.
- Edge: offline mode, class with 0 athletes, timer reset during WOD.

### C3 — PRs & Leaderboard
- PR auto-detected on new score > previous best.
- Celebration animation + push notification.
- Leaderboard filters: Rx/Scaled/gender/age.
- Edge: tie scores, invalid result format.

### P1 — PT Scheduling
- Weekly agenda with available/occupied slots.
- Public booking page at /pt/[name].
- Session packs with balance tracking.
- Edge: double-booking, expired pack, cancellation.

### A1 — Athlete Booking & Check-in
- Book class in <=3 taps from home screen.
- QR code generated per booking.
- QR valid 30min before and 15min after class start.
- Waitlist when class is full.
- Edge: booking cancelled class, checking in to wrong class.

### A2 — WOD & Gamification
- WOD visible from coach-configured time.
- Result input by WOD type (time, rounds+reps, weight).
- Streak counting, medal milestones.
- Edge: backdating a result, duplicate submission.

## Reusable end-to-end journeys

1. **Member lifecycle:** register → onboarding → first booking → check-in →
   WOD result → PR → leaderboard → subscription renewal.
2. **Coach day:** publish WOD → open class → check-in athletes → start timer →
   coachboard results → review RPE → coaching notes.
3. **PT session:** client books via public page → PT confirms → session →
   notes → pack balance decremented → receipt sent.
4. **Gestor morning:** dashboard KPIs → check at-risk members → review
   dunning alerts → CRM pipeline → check attendance heatmap.
5. **Isolation probe:** Box B user walks the same URLs with Box A ids — every
   one must 404 / be denied.
