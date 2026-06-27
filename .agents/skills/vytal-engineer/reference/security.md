# Security reference

Vytal is multi-tenant SaaS holding PII, health data, and financial data for
CrossFit boxes and gyms. A security defect here leaks one box's members to
another, or exposes health/financial data. Treat the items below as hard
requirements.

## 1. Tenant isolation (the #1 risk)

Every query against a tenant-owned table MUST filter by
`ctx.activeOrganizationId`.

- Use `orgProcedure`, never `publicProcedure`/`protectedProcedure`, for
  app-domain resources.
- For any mutation that takes an `id` from the client, **re-fetch the row scoped
  to the caller's org and 404 if absent** before acting.
- Return `NOT_FOUND` rather than `FORBIDDEN` for rows outside the tenant.
- Watch joins, aggregates, dashboards, search, and exports — the org filter is
  easy to drop.

A query path that can return another tenant's row is a **critical
vulnerability**, full stop.

## 2. AuthN / AuthZ

- Better Auth owns sessions; don't hand-roll auth.
- **Authorize on the server.** Role gates (Owner/Admin/Coach/PT/Athlete)
  live in the procedure, not just hidden UI. Assume the client is hostile.
- A coach may only see their own classes and assigned athletes; management
  roles see aggregate views. Enforce per role.

## 3. RGPD & Health Data (Art. 9)

- Health data (injuries, PAR-Q, medication, body metrics) is classified as
  special category data under RGPD Art. 9.
- **Encryption at rest** for all health data fields.
- **Granular consent** — collect explicit consent before processing health data.
- **Right to erasure** — implement full data deletion on request.
- **Audit logs** — log all access to sensitive data with who/when/what.
- **Data minimization** — collect only what's necessary for the stated purpose.

## 4. Portuguese Fiscal Compliance

- SAF-T, ATCUD, QR fiscal codes are legally required on all invoices.
- Invoice numbering must be sequential and immutable.
- Credit notes must reference the original invoice.
- SAF-T XML export must conform to AT (Tax Authority) format.
- Never allow invoice deletion — only credit notes.

## 5. Input validation

- Every tRPC input is a Zod schema — no raw/loosely-typed inputs.
- Drizzle parameterizes queries; **never** build SQL by string concatenation.
- Sanitize anything rendered as rich text or HTML to prevent stored XSS.

## 6. AI / LLM trust boundary (Phase 2+)

- LLM output is **untrusted user input.** Validate every model response against
  a Zod schema before persisting or acting on it.
- **No medical diagnosis.** All AI suggestions include disclaimers; guardrails
  required. Advisory only.
- Don't put secrets or other tenants' data into prompts.

## 7. Secrets, data protection, logging

- Secrets come from env only. Never commit keys; never log secrets, tokens, or
  PII (names, contacts, NIF, health data).
- Payment data (Stripe, MBWay) — never store raw card data; use tokenization.

## Security review checklist

- [ ] Every new/changed query filters by org.
- [ ] Mutations re-verify row ownership before acting; 404 on miss.
- [ ] Correct procedure base (`orgProcedure`) + role gate where required.
- [ ] All inputs Zod-validated; no string-built SQL.
- [ ] Health data encrypted at rest with consent tracked.
- [ ] No secrets/PII in code, logs, or client bundle.
- [ ] Fiscal documents are immutable (no delete, only credit notes).
- [ ] Errors return safe shapes (no stack traces / DB internals to client).
