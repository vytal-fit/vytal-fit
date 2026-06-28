# PRD Decisions Log — June 2026 (Commercial Proposal + Lead Feedback)

**Created:** 2026-06-27
**Status:** Pending merge into `docs/PRD.md`
**Purpose:** Capture the latest product/scope decisions arising from the **Commercial Proposal** (JCUNHAFONTE → Musas & Vikings, Lda) and lead feedback, **without editing `docs/PRD.md` directly**. José will push his own PRD revision later and reconcile against this log.

---

## Context: this is now a funded, scoped engagement

The PRD describes the full product (100+ POC screens, ~91–100 stories). The **Commercial Proposal** delimits a **true MVP** delivered inside the **PRR funding window**, for a first real client:

| Field | Value |
|---|---|
| Prestador | JCUNHAFONTE, LDA (NIF PT515097365) |
| Cliente / beneficiário PRR | **MUSAS & VIKINGS, LDA** (NIF PT516786997) — opera sob a marca **CrossFit Aveiro** |
| Candidatura PRR | *"Soluções de IA para PME's"* · projeto **CrossFit Aveiro Digital** |
| Valor | €290.000 (s/ IVA) · apoio 75% (~€217.500) · contrapartida ~€72.500 |
| Período | 1 Jun 2026 → 30 Nov 2026 (6 meses) |
| **Go-live** | **30 Out 2026** · garantia até 29 Nov 2026 |
| Surfaces | `vytal.fit` (landing) · `my.vytal.fit` (atleta) · `pro.vytal.fit` (backoffice) |

The execution roadmap lives in `docs/EXECUTION_PLAN.md` (phases F1–F6).

---

## Decision 1 — Post-training questionnaire: KEEP (without body map)

- The proposal (§9.2) recommended **deferring A3-03/A3-04** out of the MVP (the post-training questionnaire **with interactive injury body map** + cross performance/health dashboard) because the body map (build vs license) + Art. 9 RGPD encryption carry significant cost/risk.
- **Lead decision:** **keep the post-training questionnaire in the MVP** so we begin building the **athlete performance & health profile** from day one.
- **Scope split:**
  - ✅ **IN (F4):** post-training questionnaire (A3-03 minus the body map) — structured questions, rating scales, text. Feeds the athlete performance/health profile.
  - ⏸ **DEFERRED:** interactive injury **body map (SVG)** and the cross **performance↔health dashboard (A3-04)**.
- RGPD: collect **minimal** Art. 9 data in the MVP; the advanced encrypted health layer (body map) is deferred (matches risk R6 mitigation).
- *Noted "parece simples de implementar, depois falamos melhor" — exact question set TBD with the lead.*

**PRD edits implied:** update §7.4 mobile screen `/questionnaire` (G-NEW-10) and Epic **A3** to mark the questionnaire MVP-MUST (no body map); move body map + cross dashboard to Phase 2.

## Decision 2 — SAF-T phased (certified provider, not own software)

- **Confirmed phased.** Charging is operational in the MVP (Stripe / MB Way / SEPA / Multibanco); **certified fiscal-document emission** (SAF-T / ATCUD / QR) is delivered **immediately after**, via a **certified billing provider** (InvoiceXpress / Moloni / Vendus) — Vytal orchestrates the charge and delegates the fiscal document to the provider via API.
- We **do not** build/certify our own faturação software (avoids Portaria 363/2010 regulatory effort that would blow the timeline — proposal §9.3.1, risk R2).

**PRD edits implied:** G3-02 stays MVP-MUST but reframed as "via certified provider, phased activation"; update §12.1 integrations (AT) and §16 constraint #1 accordingly.

## Decision 3 — PRR candidatura in the name of Musas & Vikings, Lda

- **Confirmed.** The billed/beneficiary entity is **Musas & Vikings, Lda** (operating as CrossFit Aveiro), resolving the §17.1 "a confirmar" eligibility flag. Client signatory: **Juvenal Fernandes** (Sócio-Gerente).

## Decision 4 — AI provider: multi-provider free-tier fallback (€0)

- Coach Assist AI runs on a **swappable gateway** with a **multi-provider free-tier fallback chain** (Groq → NVIDIA NIM → Gemini), ported from kloser's `packages/agents` runtime. Near-zero inference cost for the pilot. Claude can be slotted behind the same gateway later if quality demands it.
- Mandatory guardrails unchanged: RAG grounding on the exercise/WOD DB, **human-in-the-loop**, visible disclaimer, full audit trail (proposal §7, §10.2).

## Decision 5 — Authorization stays lean for the MVP

- Keep the current Better Auth **5-role** model (`owner > admin > coach > pt > athlete`) + tRPC `minRole` gating. **Do not** port kloser's granular `packages/authz` per-module matrix yet.
- Revisit only if the **G5-01 permissions matrix screen** requires per-module view/edit/delete granularity.

## Decision 6 — Store / merch uses external suppliers and dealers

- The online store is a configurable **merchandising channel**, not just a local POS shelf: the box picks product model, color, size, branding and quantity, and Vytal handles the supplier connection and order lifecycle.
- The long-term target includes **Chinese manufacturing dealers** and other external suppliers behind the same product abstraction, so the platform can route orders without manual back-and-forth in the customer workflow.
- MVP implication: keep the store deferred, but shape the data model and integration surface for product variants, supplier mappings and order tracking from the start.

---

## Open items (require client / lead input)

- **"Ponto 2"** — José to specify exactly what's needed; **Juvenal (client) validates.** Most likely the **§18.2 / §9.3 MVP cut-line confirmation**. **Blocking** for final scope sign-off.
- Exact post-training questionnaire question set (Decision 1).
- Exercise/WOD DB seed content from CrossFit Aveiro (proposal §18.8).
- Final branding/domain confirmation (by end of F1).
- Supplier/dealer shortlist for the store / merch flow.

---

## Items the proposal defers out of the MVP (for PRD §13 roadmap alignment)

From proposal §9.2 / §9.3 — recommended to **transit to a later phase** (any can be reinstated via Change Request, §19):
- **G6-01** app white-label (theming dinâmico, apps nas stores).
- **G6-02** site builder + domínio próprio + SSL automático *(MVP ships a pre-configured site on a subdomain)*.
- **G2-08 / G6-03** drop-ins self-service + Google Reviews automático.
- **G6-04** avaliação interna de treinadores pelos atletas.
- **A3-03 (body map) / A3-04** — see Decision 1.
- SHOULD not prioritized in MVP: C1-06 weekly insights, G2-06 onboarding 30d, G5-02 escalas/turnos, G5-04 chat interno, G4-03 retention automations, C3-04 injury management, P1-06 PT dashboard, P2-03 session notes.
- Already Phase 2–4 in the PRD: wearables, AI nutrition, plans marketplace, corporate wellness, multi-location/franchises, VOD, nutritionist/physio modules, inter-box challenges, digital twin, mental coaching.
