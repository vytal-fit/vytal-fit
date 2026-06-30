# Vytal — Execution Plan (PRR MVP, Jun–Oct 2026)

**Version:** 1.0
**Created:** 2026-06-27
**Status:** Draft for alignment
**Owners:** José Cunha Fonte (Tech Lead/Arquiteto), Lucas Hartridge (Senior Full-Stack)

> This plan reconciles three inputs into a single phased roadmap:
> 1. The **Commercial Proposal** (JCUNHAFONTE → Musas & Vikings, Lda — *CrossFit Aveiro*), 6 phases F1–F6, €290.000, PRR-funded, **go-live 30 Oct 2026**.
> 2. The **PRD** (`docs/PRD.md`) — full product spec (100+ POC screens built from the MVP v2.0 / `mvpvytalv23.netlify.app` mockup).
> 3. Capabilities to **port from the `kloser` sibling repo** (agents runtime, auth maturity, dev skills).
>
> Latest client/lead decisions are captured in `docs/PRD_DECISIONS_2026-06.md`. This plan **does not** edit `docs/PRD.md` directly — José will reconcile the PRD separately.

---

## 0. Where we actually are

The proposal's **F1 is essentially done and F2 is underway.** Current Vytal backend already has:

- **Better Auth** wired (`packages/auth` — `createAuth` factory, organization plugin, 5-role access control `owner > admin > coach > pt > athlete`).
- **Org-isolated tRPC** (`packages/api/src/trpc.ts`): `publicProcedure` → `protectedProcedure` → `orgProcedure` (tenant isolation) → `minRole()` / `staffProcedure` / `adminProcedure`. Role resolved **server-side** from the Better Auth `member` table — never client-supplied.
- **16 domain routers** (`packages/api/src/routers/`): bookings, checkIns, classes, classTypes, coaches, dashboard, exercises, leads, locations, members, notifications, orgSettings, personalRecords, subscriptions, wods, wodResults.
- **PostgreSQL + Drizzle** (`packages/db`), **shared domain** (`packages/shared`), POC UI being wired onto real mutations.
- **Dev skills**: `.claude/skills/vytal-engineer`, `.claude/skills/vytal-qa` (ported earlier from kloser).

**Gaps vs the proposal:** no `packages/agents` (Coach Assist AI), auth still needs full invitations/email + Expo mobile parity, no `vytal-planner` dev agent, and several prototype pages still need final API wiring. CI is split between lightweight automatic checks and manual E2E. Vercel now uses native monorepo projects for the production apps.

---

## 1. What we port from `kloser` (decisions locked)

| Capability | kloser source | Vytal target | Decision |
|---|---|---|---|
| **AI agents runtime** | `packages/agents` (5,542 LOC) | new `packages/agents` | Port runtime (gateway, registry, memory/audit, RAG, guardrails). **Drop** real-estate profiles. **Add** `coach-assist` profile. |
| **AI provider strategy** | Groq → NVIDIA NIM → Gemini fallback | same | **Multi-provider free-tier fallback (€0).** Claude optional behind the same gateway later. |
| **Auth maturity** | `packages/auth` (invitations+email, Expo client, session hooks, OAuth) | extend existing `packages/auth` | Port invitation flow + email, `client-expo`, `activeOrganizationId` session hook. OAuth optional. |
| **Authorization granularity** | `packages/authz` (8-profile matrix) | — | **Keep lean.** Current 5-role + `minRole` gating is enough for MVP. Revisit the per-module matrix only if the G5-01 permissions screen demands it. |
| **Dev skills** | `kloser-planner`, richer reference files | `vytal-planner` + enrich `vytal-engineer`/`vytal-qa` | Port planner agent + skill; bring `backend/frontend/security/scaling/testing` reference depth + QA scenarios. |
| **Doc scaffolding** | `docs/architecture/auth`, `docs/agents/roster` | Vytal `docs/` | Port as templates, adapt to Vytal domain. |

---

## 2. Phased roadmap

### Phase 0 — Dev enablement (now, parallel to F1)
- Port `kloser-planner` → `vytal-planner` agent + `.claude/skills/vytal-planner`.
- Enrich `vytal-engineer` / `vytal-qa` reference files (backend, frontend, security, scaling, testing) + QA scenario bank, adapted to Vytal (20 verticals, 5 roles, PT fiscal, PostgreSQL).
- Port `docs/architecture/auth` + `docs/agents/roster` scaffolding.
- **CI/CD hardening** (see §3): keep E2E manual and deploy via Vercel monorepo projects.
- *Low risk, high leverage. Encodes the proposal's Definition of Done (§12.2).* 

### F1 — Foundation, Infra & Multi-Tenant (Jun · mostly done → harden)
- Already shipped: Better Auth, 5-role RBAC, org isolation, tRPC base, 16 routers, CI.
- **Port from kloser auth:** session hook backfilling `activeOrganizationId`; invitation flow + transactional email; Better Auth **Expo client** (`client-expo`) — prerequisite for F4 mobile; account linking; (Google/Microsoft OAuth optional).
- Stand up dev/staging/prod environments; finalize design system; produce the detailed backlog.
- **Exit:** envs live, auth maturity merged, design system baseline, backlog approved.

### F2 — Backoffice de Gestão (Jul · in progress)
Wire the remaining backoffice routers onto the POC UI:
- Members + lifestyle profile, plans, dunning, CSV import, digital waivers/contracts, CRM kanban + lead automations, staff + RBAC, dashboard/KPIs.
- Apply kloser patterns: cursor pagination, activity-log/audit trail, `access.ts`-style gating (see `vytal-engineer` security reference).
- **Exit:** backoffice operable end-to-end on real data for a pilot org.

### F3 — Treino (Ago)
- WOD Builder (AMRAP/EMOM/For Time/Tabata/Strength; Warm Up/Skill/WOD/Cool Down) + timers.
- Exercise DB **≥300 exercises / 5 methodologies** + **≥200 WODs**, seeded from CrossFit Aveiro logs (proposal §18.8 dependency).
- Weekly planning engine, %RM per athlete, PRs, leaderboards.
- **This corpus is the RAG ground truth for F5 Coach Assist.**
- **Exit:** coaches build and publish WODs; athletes' PRs/results flow.

### F4 — App do Atleta + Bem-estar base (Set)
- Expo athlete app on tRPC via the ported Better Auth Expo client.
- Booking ≤3 taps, QR check-in, WOD view, results, PRs, gamification.
- **Wellness base:** lifestyle profile (A3-01) + daily 1–10 check-in (A3-02).
- **Post-training questionnaire (A3-03) — KEPT per lead decision** to start building the athlete performance/health profile. **DEFER** the interactive injury **body map (SVG)** and the cross performance↔health **dashboard (A3-04)** to a later phase (minimal Art. 9 data in MVP; advanced encrypted layer deferred — matches risk R6).
- **Exit:** pilot athletes can book, check in, train, log, and answer the questionnaire on mobile.

### F5 — Coach Assist AI + Faturação (Out)
- **Port `packages/agents`:** runtime (swappable **gateway**, registry, memory/audit, RAG, untrusted/guardrails). Add a `coach-assist` profile that generates WOD/plan structures **grounded by RAG** on the F3 corpus. Mandatory **human-in-the-loop**, visible **disclaimer**, full **audit trail** (proposal §7, §10.2, Anexo B.1). Provider = **multi-provider free-tier fallback**.
- **Faturação:** integrate a **certified billing provider** (InvoiceXpress / Moloni / Vendus) — *do not* build certified software (§9.3.1, risk R2).
- **SAF-T phased (lead decision):** charging operational (Stripe/MBWay/SEPA) in the MVP; certified fiscal-document emission (SAF-T/ATCUD/QR) **immediately after** via the provider API.
- **Exit:** coach generates a reviewed plan in < 5 min; charging works; fiscal emission path validated with the provider.

### F6 — Testes, Pilotagem & Go-Live (Out · go-live 30 Oct 2026)
- Playwright E2E (kloser `testing.md` patterns incl. the **mandatory cross-tenant isolation test**), load tests, UAT with 3–5 pilot athletes.
- Runbook + alarms, PT-PT user manual, go-live, **30-day warranty** (until 29 Nov 2026).
- `vytal-qa` drives the QA matrix + health-score ship/no-ship gate.
- **Exit:** production pilot live, accepted per proposal §15.

---

## 3. CI/CD changes (this plan ships them)

**Problem:** the current `.github/workflows/ci.yml` runs a heavy E2E job (Postgres service + migrations + seed + Playwright, 40-min timeout) on **every push and PR** — it will exhaust the free GitHub Actions minute budget.

**Changes:**
1. **CI pipeline** (`ci.yml`): keep lint + type-check + unit tests (+ secret scan). Use a cached-install composite action (`.github/actions/setup`) so a lockfile cache hit skips `npm ci`. **E2E removed from the automatic pipeline.**
2. **E2E moved to manual** (`e2e.yml`, `workflow_dispatch` only): the full Playwright suite is preserved and run on demand / before go-live, not on every commit. *(Mirrors kloser's intent of not paying ~20–40 runner-minutes per push.)*
3. **Deployment**: Vercel deploys the monorepo directly from GitHub. Each production surface is a separate Vercel project with a root directory and domain:

| Vercel project | Root directory | Production domain |
|---|---|---|
| `landing` | `apps/landing` | `vytal.fit`, `www.vytal.fit` |
| `pro` | `apps/pro` | `pro.vytal.fit`, `www.pro.vytal.fit` |
| `my` | `apps/my` | `my.vytal.fit`, `www.my.vytal.fit` |
| `api` | `apps/api` | `api.vytal.fit`, `www.api.vytal.fit` |

The app-level `vercel.json` files restrict Git deployments to `main` and use
`turbo-ignore` so Vercel skips unaffected projects instead of rebuilding every
surface on every push.

**One-time setup required:**
- Connect the GitHub repository to each Vercel project.
- Keep each project's root directory aligned with the table above.
- Store production env vars on the project that uses them: database/auth secrets
  on `api`, public API URL on `pro` and `my`, and public landing-only vars on
  `landing`.

---

## 4. Governance & open items

- **DPIA** before piloting real data (proposal §10.1); **DPA** signed before formal start. JCUNHAFONTE = processor, Musas & Vikings = controller.
- **PRR candidatura in name of Musas & Vikings, Lda** — confirmed (resolves the §17.1 "a confirmar" eligibility flag).
- **Change-request discipline** for anything beyond the §9 MVP cut-line.
- **OPEN — "Ponto 2":** needs José to specify exactly what's required; **Juvenal (client) to validate.** Most likely the §18.2 / §9.3 MVP cut-line confirmation. Tracked as a blocking client-validation item.
- **Content dependency:** exercise/WOD DB seed content from CrossFit Aveiro (§18.8).
- **Branding/domain** confirmed by end of F1.

---

## 5. Phase → investment → PRR mapping (from proposal §13–17, Anexo A)

| Phase | Period | Designation | Investment | PRR phase |
|---|---|---|---|---|
| Adjudicação | Jun 2026 | Formalização + arranque | €5.000 | Desenvolvimento |
| F1 | Jun 2026 | Fundação, Infra & Multi-Tenant | €35.000 | Desenvolvimento e integração |
| F2 | Jul 2026 | Backoffice de Gestão | €55.000 | Desenvolvimento e integração |
| F3 | Ago 2026 | Treino | €55.000 | Desenvolvimento / testes |
| F4 | Set 2026 | App do Atleta + Bem-estar | €60.000 | Implementação e operação piloto |
| F5 | Out 2026 | Coach Assist AI + Faturação | €55.000 | Implementação e operação piloto |
| F6 | Out 2026 | Testes, Pilotagem & Go-Live | €25.000 | Operação piloto / avaliação |
| **Total** | **Jun–Out 2026** | | **€290.000** | Investimento total elegível |

PRR: apoio 75% (~€217.500 a fundo perdido) · contrapartida da empresa (~€72.500). Billing by milestone (7 tranches), not by rubric.
