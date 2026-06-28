/**
 * Create/update Brevo transactional templates from the version-controlled HTML
 * mirrors in brevo-templates/. Idempotent: matches by templateName and updates
 * in place, so re-running never duplicates.
 *
 * Covers all 6 transactional templates × 3 locales (18 entries). After the
 * upsert it prints the {type,locale} → id map AND rewrites the `TEMPLATES`
 * object in src/config/templates.ts with the real Brevo ids.
 *
 *   node packages/email/scripts/brevo-sync.mjs
 *   # or, from packages/email:  npm run brevo:sync
 *
 * Reads BREVO_API_KEY from the environment, falling back to apps/web/.env.local.
 * Reads the sender from EMAIL_FROM ("Name <email>") in apps/web/.env.local,
 * falling back to the name "Vytal".
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../..");
const MIRRORS = path.resolve(__dirname, "../brevo-templates");
const CONFIG = path.resolve(__dirname, "../src/config/templates.ts");

/** Read a key from apps/web/.env.local. */
function readEnvLocal(key) {
  try {
    const env = fs.readFileSync(path.join(ROOT, "apps/web/.env.local"), "utf8");
    const m = env.match(new RegExp(`^${key}\\s*=\\s*"?([^"\\n\\r]+)"?`, "m"));
    if (m) return m[1].trim();
  } catch {
    /* ignore */
  }
  return undefined;
}

function apiKey() {
  if (process.env.BREVO_API_KEY) return process.env.BREVO_API_KEY;
  const fromFile = readEnvLocal("BREVO_API_KEY");
  if (fromFile) return fromFile;
  throw new Error("BREVO_API_KEY not set (env or apps/web/.env.local)");
}

/** Parse "Display Name <email@example.com>" → { name, email }. */
function parseSender() {
  const raw = process.env.EMAIL_FROM || readEnvLocal("EMAIL_FROM");
  if (raw) {
    const m = raw.match(/^\s*(.+?)\s*<([^>]+)>\s*$/);
    if (m) return { name: m[1], email: m[2] };
    if (raw.includes("@")) return { name: "Vytal", email: raw.trim() };
  }
  // No sender address available — Brevo requires one, so leave email empty
  // and let Brevo surface a clear error if the script is run without it.
  return { name: "Vytal", email: raw || "" };
}

const SENDER = parseSender();

// All 6 transactional templates × 3 locales. Subjects use Brevo
// {{ params.X }} substitution where it adds value.
const TEMPLATES = [
  // invitation
  { type: "invitation", locale: "en", name: "Vytal — Invitation (EN)", subject: "{{ params.inviter_name }} invited you to {{ params.organization_name }} on Vytal", file: "en/invitation.html" },
  { type: "invitation", locale: "pt", name: "Vytal — Invitation (PT)", subject: "{{ params.inviter_name }} convidou-o para {{ params.organization_name }} na Vytal", file: "pt/invitation.html" },
  { type: "invitation", locale: "es", name: "Vytal — Invitation (ES)", subject: "{{ params.inviter_name }} te ha invitado a {{ params.organization_name }} en Vytal", file: "es/invitation.html" },
  // verification
  { type: "verification", locale: "en", name: "Vytal — Verification (EN)", subject: "Confirm your email for Vytal", file: "en/verification.html" },
  { type: "verification", locale: "pt", name: "Vytal — Verification (PT)", subject: "Confirme o seu email na Vytal", file: "pt/verification.html" },
  { type: "verification", locale: "es", name: "Vytal — Verification (ES)", subject: "Confirma tu correo en Vytal", file: "es/verification.html" },
  // password-reset
  { type: "password-reset", locale: "en", name: "Vytal — Password reset (EN)", subject: "Reset your Vytal password", file: "en/password-reset.html" },
  { type: "password-reset", locale: "pt", name: "Vytal — Password reset (PT)", subject: "Redefina a sua palavra-passe da Vytal", file: "pt/password-reset.html" },
  { type: "password-reset", locale: "es", name: "Vytal — Password reset (ES)", subject: "Restablece tu contraseña de Vytal", file: "es/password-reset.html" },
  // welcome
  { type: "welcome", locale: "en", name: "Vytal — Welcome (EN)", subject: "Welcome to Vytal, {{ params.name }}", file: "en/welcome.html" },
  { type: "welcome", locale: "pt", name: "Vytal — Welcome (PT)", subject: "Bem-vindo à Vytal, {{ params.name }}", file: "pt/welcome.html" },
  { type: "welcome", locale: "es", name: "Vytal — Welcome (ES)", subject: "Bienvenido a Vytal, {{ params.name }}", file: "es/welcome.html" },
  // password-changed
  { type: "password-changed", locale: "en", name: "Vytal — Password changed (EN)", subject: "Your Vytal password was changed", file: "en/password-changed.html" },
  { type: "password-changed", locale: "pt", name: "Vytal — Password changed (PT)", subject: "A sua palavra-passe da Vytal foi alterada", file: "pt/password-changed.html" },
  { type: "password-changed", locale: "es", name: "Vytal — Password changed (ES)", subject: "Tu contraseña de Vytal ha cambiado", file: "es/password-changed.html" },
  // invitation-accepted
  { type: "invitation-accepted", locale: "en", name: "Vytal — Invitation accepted (EN)", subject: "{{ params.member_name }} joined {{ params.organization_name }}", file: "en/invitation-accepted.html" },
  { type: "invitation-accepted", locale: "pt", name: "Vytal — Invitation accepted (PT)", subject: "{{ params.member_name }} juntou-se a {{ params.organization_name }}", file: "pt/invitation-accepted.html" },
  { type: "invitation-accepted", locale: "es", name: "Vytal — Invitation accepted (ES)", subject: "{{ params.member_name }} se unió a {{ params.organization_name }}", file: "es/invitation-accepted.html" },
];

const KEY = apiKey();
const headers = { "api-key": KEY, "content-type": "application/json", accept: "application/json" };

async function listTemplates() {
  const out = [];
  for (let offset = 0; ; offset += 50) {
    const r = await fetch(`https://api.brevo.com/v3/smtp/templates?limit=50&offset=${offset}&sort=desc`, { headers });
    if (!r.ok) throw new Error(`list failed ${r.status}: ${await r.text()}`);
    const j = await r.json();
    const batch = j.templates ?? [];
    out.push(...batch);
    if (batch.length < 50) break;
  }
  return out;
}

async function upsert(t, existingByName) {
  const htmlContent = fs.readFileSync(path.join(MIRRORS, t.file), "utf8");
  const body = JSON.stringify({ templateName: t.name, subject: t.subject, htmlContent, sender: SENDER, isActive: true });
  const existing = existingByName.get(t.name);
  if (existing) {
    const r = await fetch(`https://api.brevo.com/v3/smtp/templates/${existing.id}`, { method: "PUT", headers, body });
    if (!r.ok) throw new Error(`update ${t.name} failed ${r.status}: ${await r.text()}`);
    return { ...t, id: existing.id, action: "updated" };
  }
  const r = await fetch("https://api.brevo.com/v3/smtp/templates", { method: "POST", headers, body });
  if (!r.ok) throw new Error(`create ${t.name} failed ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return { ...t, id: j.id, action: "created" };
}

/**
 * Build the `TEMPLATES` object literal (type → { en, pt, es }) from results
 * and rewrite it into src/config/templates.ts in place.
 */
function rewriteConfig(results) {
  const byType = {};
  for (const r of results) {
    byType[r.type] ??= {};
    byType[r.type][r.locale] = r.id;
  }
  // Preserve declaration order from the source list.
  const order = ["invitation", "verification", "password-reset", "welcome", "password-changed", "invitation-accepted"];
  const lines = order.map((type) => {
    const ids = byType[type] ?? {};
    const key = `"${type}":`.padEnd(22);
    const en = String(ids.en ?? 0);
    const pt = String(ids.pt ?? 0);
    const es = String(ids.es ?? 0);
    return `  ${key} { en: ${en.padEnd(2)}, pt: ${pt.padEnd(2)}, es: ${es.padEnd(2)} },`;
  });
  const literal = `export const TEMPLATES: Record<EmailTemplateType, Record<Locale, number>> = {\n${lines.join("\n")}\n};`;

  const src = fs.readFileSync(CONFIG, "utf8");
  const re = /export const TEMPLATES:\s*Record<EmailTemplateType,\s*Record<Locale,\s*number>>\s*=\s*\{[\s\S]*?\n\};/;
  if (!re.test(src)) {
    console.warn("\n[brevo-sync] Could not locate the TEMPLATES object in templates.ts to rewrite.");
    console.warn("Paste this literal in manually:\n");
    console.warn(literal);
    return false;
  }
  fs.writeFileSync(CONFIG, src.replace(re, literal), "utf8");
  return true;
}

const existing = await listTemplates();
const byName = new Map(existing.map((e) => [e.name, e]));
const results = [];
for (const t of TEMPLATES) results.push(await upsert(t, byName));

console.log("\nResult ({type, locale} → Brevo id):");
for (const r of results) console.log(`  ${r.type} / ${r.locale} → ${r.id}  (${r.action})`);

const rewritten = rewriteConfig(results);
if (rewritten) {
  console.log(`\nWrote real ids into ${path.relative(ROOT, CONFIG)} — review the diff and commit.`);
}

console.log("\nJSON:", JSON.stringify(results.map(({ type, locale, id }) => ({ type, locale, id })), null, 2));
