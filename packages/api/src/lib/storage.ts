// The storage ref (s3://…, file://…, blob url) is held server-side and never
// returned to clients — downloads stream through the HMAC-signed capability route.
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";

/** `addRandomSuffix` (Vercel Blob only): assets pass false so getKey() can resolve by exact key. */
export interface PutOpts {
  addRandomSuffix?: boolean;
}

export interface ObjectStore {
  /** Store bytes under a logical key; returns an opaque server-side reference. */
  put(key: string, bytes: Buffer, contentType?: string, opts?: PutOpts): Promise<{ ref: string }>;
  get(ref: string): Promise<Buffer>;
  /**
   * Fetch bytes by logical key, confined to `allowedPrefix`. Unlike get(ref),
   * never lets the caller escape the prefix (no `../`, no cross-bucket/host, no
   * scheme) — the key here originates from a client-presented token. Throws if it escapes.
   */
  getKey(key: string, allowedPrefix: string): Promise<Buffer>;
}

function assertConfinedKey(key: string, allowedPrefix: string): void {
  // Reject traversal, absolute paths and schemes — defense in depth behind the HMAC.
  if (
    !key.startsWith(allowedPrefix) ||
    key.includes("..") ||
    key.includes("://") ||
    key.startsWith("/")
  ) {
    throw new Error(`Key outside allowed namespace: ${key}`);
  }
}

// ── In-memory (tests only) ──────────────────────────────────────────────────
const memory = new Map<string, Buffer>();
let memCounter = 0;

const memoryStore: ObjectStore = {
  async put(key, bytes, _contentType, _opts) {
    memCounter += 1;
    const ref = `mem://${key}#${memCounter}`;
    memory.set(ref, Buffer.from(bytes));
    return { ref };
  },
  async get(ref) {
    const b = memory.get(ref);
    if (!b) throw new Error(`Object not found in memory store: ${ref}`);
    return b;
  },
  async getKey(key, allowedPrefix) {
    assertConfinedKey(key, allowedPrefix);
    for (const [ref, bytes] of memory) {
      if (ref.startsWith(`mem://${key}#`)) return bytes;
    }
    throw new Error(`Object not found in memory store: ${key}`);
  },
};

// ── Filesystem (local dev default) ──────────────────────────────────────────
function objectDir(): string {
  return process.env.OBJECT_STORE_DIR ?? path.join(os.tmpdir(), "vytal-object-store");
}

const filesystemStore: ObjectStore = {
  async put(key, bytes, _contentType, _opts) {
    const abs = path.join(objectDir(), key);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, bytes);
    return { ref: `file://${abs}` };
  },
  async get(ref) {
    const abs = ref.startsWith("file://") ? ref.slice("file://".length) : ref;
    return await fs.readFile(abs);
  },
  async getKey(key, allowedPrefix) {
    assertConfinedKey(key, allowedPrefix);
    const root = path.resolve(objectDir());
    const abs = path.resolve(root, key);
    // Second layer: resolved path must stay inside the store dir.
    if (abs !== root && !abs.startsWith(root + path.sep)) {
      throw new Error(`Resolved path escapes store dir: ${key}`);
    }
    return await fs.readFile(abs);
  },
};

// ── Vercel Blob ─────────────────────────────────────────────────────────────
// Optional provider — loaded lazily and typed loosely so the package type-checks
// without `@vercel/blob` installed (only required when BLOB_READ_WRITE_TOKEN is set).
type VercelBlobModule = {
  put: (
    key: string,
    body: Buffer,
    opts: { access: "public"; contentType: string; addRandomSuffix: boolean },
  ) => Promise<{ url: string }>;
  list: (opts: { prefix: string }) => Promise<{ blobs: { pathname: string; url: string }[] }>;
};

async function loadVercelBlob(): Promise<VercelBlobModule> {
  return (await import(/* webpackIgnore: true */ "@vercel/blob" as string)) as VercelBlobModule;
}

const blobStore: ObjectStore = {
  async put(key, bytes, contentType = "application/pdf", opts) {
    const { put } = await loadVercelBlob();
    const res = await put(key, bytes, {
      access: "public",
      contentType,
      addRandomSuffix: opts?.addRandomSuffix ?? true,
    });
    return { ref: res.url };
  },
  async get(ref) {
    const res = await fetch(ref);
    if (!res.ok) throw new Error(`Blob fetch failed (${res.status})`);
    return Buffer.from(await res.arrayBuffer());
  },
  async getKey(key, allowedPrefix) {
    assertConfinedKey(key, allowedPrefix);
    // Resolve via the SDK's list-by-prefix (never a client URL) so the fetched
    // URL is the store's own, not an attacker-supplied SSRF target.
    const { list } = await loadVercelBlob();
    const { blobs } = await list({ prefix: key });
    const hit = blobs.find((b) => b.pathname === key);
    if (!hit) throw new Error(`Blob not found for key: ${key}`);
    const res = await fetch(hit.url);
    if (!res.ok) throw new Error(`Blob fetch failed (${res.status})`);
    return Buffer.from(await res.arrayBuffer());
  },
};

// ── S3-compatible (AWS S3 / Backblaze B2 / R2 / MinIO) ──────────────────────
// Credentials never touch the DB or the client.
function s3Bucket(): string {
  const b = process.env.S3_BUCKET;
  if (!b) throw new Error("S3_BUCKET is not set");
  return b;
}

async function s3Client() {
  const { S3Client } = await import("@aws-sdk/client-s3");
  return new S3Client({
    region: process.env.S3_REGION ?? "auto",
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "1" || process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
      ? { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY }
      : undefined,
  });
}

const s3Store: ObjectStore = {
  async put(key, bytes, contentType = "application/pdf") {
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const bucket = s3Bucket();
    const client = await s3Client();
    await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: bytes, ContentType: contentType }));
    return { ref: `s3://${bucket}/${key}` };
  },
  async get(ref) {
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    const m = /^s3:\/\/([^/]+)\/(.+)$/.exec(ref);
    if (!m) throw new Error(`Invalid S3 ref: ${ref}`);
    const [, bucket, key] = m;
    const client = await s3Client();
    const res = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const bytes = await res.Body?.transformToByteArray();
    if (!bytes) throw new Error(`S3 object empty: ${ref}`);
    return Buffer.from(bytes);
  },
  async getKey(key, allowedPrefix) {
    assertConfinedKey(key, allowedPrefix);
    // Bucket pinned to S3_BUCKET, never client-supplied.
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    const bucket = s3Bucket();
    const client = await s3Client();
    const res = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const bytes = await res.Body?.transformToByteArray();
    if (!bytes) throw new Error(`S3 object empty: ${key}`);
    return Buffer.from(bytes);
  },
};

function s3Configured(): boolean {
  return !!process.env.S3_BUCKET;
}

export function objectStore(): ObjectStore {
  if (process.env.OBJECT_STORE === "memory") return memoryStore;
  if (process.env.OBJECT_STORE === "fs") return filesystemStore;
  if (s3Configured()) return s3Store;
  if (process.env.BLOB_READ_WRITE_TOKEN) return blobStore;
  return filesystemStore;
}

/** Test helper: clear the in-memory store between cases. */
export function resetMemoryStore(): void {
  memory.clear();
  memCounter = 0;
}
