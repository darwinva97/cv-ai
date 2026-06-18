/**
 * Unit smoke test for AES-256-GCM secret encryption (no DB, no Next).
 * Run: node --env-file=.env --experimental-strip-types scripts/test-crypto.ts
 *
 * Note: src/lib/crypto.ts imports "server-only" which throws outside Next, so we
 * replicate the tiny crypto here to exercise the exact same algorithm + env key.
 */
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import assert from "node:assert";

const raw = process.env.MASTER_ENCRYPTION_KEY;
assert(raw, "MASTER_ENCRYPTION_KEY not set");
const key = Buffer.from(raw, "base64");
assert.strictEqual(key.length, 32, `key must be 32 bytes, got ${key.length}`);

function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, enc].map((b) => b.toString("base64")).join(":");
}
function decrypt(blob: string): string {
  const [iv, tag, enc] = blob.split(":").map((p) => Buffer.from(p, "base64"));
  const d = createDecipheriv("aes-256-gcm", key, iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(enc), d.final()]).toString("utf8");
}

const secret = "AIzaSyExample-1234567890_secret-token";
const blob = encrypt(secret);
assert.notStrictEqual(blob, secret, "ciphertext must differ from plaintext");
assert.strictEqual(decrypt(blob), secret, "round-trip must recover plaintext");
console.log("✓ round-trip OK:", blob.slice(0, 24) + "…");

// Two encryptions of the same plaintext must differ (random IV).
assert.notStrictEqual(encrypt(secret), encrypt(secret), "IV must randomize ciphertext");
console.log("✓ random IV OK");

// Tampered auth tag must throw.
let threw = false;
try {
  const parts = blob.split(":");
  const tag = Buffer.from(parts[1], "base64");
  tag[0] ^= 0xff; // flip a bit
  parts[1] = tag.toString("base64");
  decrypt(parts.join(":"));
} catch {
  threw = true;
}
assert(threw, "tampered ciphertext must throw");
console.log("✓ tamper detection OK");

console.log("\n✓ all crypto tests passed");
