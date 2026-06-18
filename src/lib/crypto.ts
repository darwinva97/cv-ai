import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

/**
 * Symmetric encryption for secrets at rest (system AI keys).
 * AES-256-GCM. The master key comes from MASTER_ENCRYPTION_KEY (32 bytes,
 * base64-encoded). Ciphertext is stored as "iv:authTag:ciphertext" (base64 parts).
 *
 * Decrypted plaintext NEVER leaves the server — only used to build provider
 * configs inside server-only modules.
 */

const ALGO = "aes-256-gcm";
const IV_BYTES = 12; // GCM standard nonce size

function getKey(): Buffer {
  const raw = process.env.MASTER_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "MASTER_ENCRYPTION_KEY is not set. Generate one with: openssl rand -base64 32"
    );
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error(
      `MASTER_ENCRYPTION_KEY must decode to 32 bytes (got ${key.length}). Use: openssl rand -base64 32`
    );
  }
  return key;
}

export function encryptSecret(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, enc].map((b) => b.toString("base64")).join(":");
}

export function decryptSecret(blob: string): string {
  const key = getKey();
  const parts = blob.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid ciphertext format");
  }
  const [iv, tag, enc] = parts.map((p) => Buffer.from(p, "base64"));
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

/** Mask a secret for display (e.g. "AIza…b3kQ"). Never returns the full value. */
export function maskSecret(plaintext: string): string {
  if (plaintext.length <= 8) return "••••";
  return `${plaintext.slice(0, 4)}…${plaintext.slice(-4)}`;
}

/** Constant-time string compare (for webhook signatures later). */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
