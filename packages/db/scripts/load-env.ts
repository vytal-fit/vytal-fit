/**
 * Minimal .env loader (no dependencies — dotenv is not a declared dep of any
 * workspace package). Reads the candidate files in priority order and fills
 * `process.env` WITHOUT overriding variables already set in the shell.
 *
 * Search order (first definition of a key wins):
 *   <repo>/.env.local → <repo>/.env → <repo>/apps/web/.env.local → <repo>/apps/web/.env
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

export function parseEnvFile(filePath: string): Record<string, string> {
  const parsed: Record<string, string> = {};
  for (const rawLine of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim().replace(/^export\s+/, "");
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) parsed[key] = value;
  }
  return parsed;
}

/** Load env files into process.env (shell env always wins). */
export function loadEnvFiles(): string[] {
  const loaded: string[] = [];
  const candidates = [
    path.join(REPO_ROOT, ".env.local"),
    path.join(REPO_ROOT, ".env"),
    path.join(REPO_ROOT, "apps/web/.env.local"),
    path.join(REPO_ROOT, "apps/web/.env"),
  ];
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    for (const [key, value] of Object.entries(parseEnvFile(file))) {
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
    loaded.push(file);
  }
  return loaded;
}
