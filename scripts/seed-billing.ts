/**
 * Seed the monetization core so it can be exercised end-to-end without a payment
 * gateway. Idempotent: safe to re-run.
 *
 *   1. model_pricing for google/gemini-2.5-flash (upsert on (provider, model)).
 *   2. one system_ai_key holding your real Gemini key, ENCRYPTED (upsert by name).
 *
 * It does NOT grant credits — do that from the admin UI, which goes through the
 * ledger logic in src/lib/credits.ts (the verified path). Use scripts/make-admin.ts
 * to give yourself the admin role first.
 *
 * Run (needs a live DB):
 *   node --env-file=.env --experimental-strip-types scripts/seed-billing.ts
 *
 * Required env: DATABASE_URL, MASTER_ENCRYPTION_KEY (32 bytes base64), and a
 * Gemini key in GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY.
 * Optional env: SEED_MODEL (default gemini-2.5-flash), SEED_KEY_NAME (default
 *   "Gemini (seed)"), SEED_BASE_CREDITS=5, SEED_IN_PER_1K=1, SEED_OUT_PER_1K=4.
 *
 * Uses raw SQL via `postgres` (no src imports) so it runs under plain node.
 */
import { createCipheriv, randomBytes } from "node:crypto";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Missing DATABASE_URL.");
  process.exit(1);
}

const masterKeyRaw = process.env.MASTER_ENCRYPTION_KEY;
if (!masterKeyRaw) {
  console.error("Missing MASTER_ENCRYPTION_KEY. Generate: openssl rand -base64 32");
  process.exit(1);
}
const masterKey = Buffer.from(masterKeyRaw, "base64");
if (masterKey.length !== 32) {
  console.error(`MASTER_ENCRYPTION_KEY must decode to 32 bytes (got ${masterKey.length}).`);
  process.exit(1);
}

if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  console.error("Missing GEMINI_API_KEY (or GOOGLE_GENERATIVE_AI_API_KEY).");
  process.exit(1);
}
const geminiKey: string = (process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_GENERATIVE_AI_API_KEY)!;

/** Same format as src/lib/crypto.ts: "iv:tag:ciphertext" (base64 parts). */
function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", masterKey, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, enc].map((b) => b.toString("base64")).join(":");
}

const model = process.env.SEED_MODEL || "gemini-2.5-flash";
const keyName = process.env.SEED_KEY_NAME || "Gemini (seed)";
const baseCredits = Number(process.env.SEED_BASE_CREDITS ?? 5);
const inPer1k = Number(process.env.SEED_IN_PER_1K ?? 1);
const outPer1k = Number(process.env.SEED_OUT_PER_1K ?? 4);

const sql = postgres(databaseUrl, { prepare: false });

async function main() {
  // 1) Pricing (upsert on the unique (provider_ai, model)).
  await sql`
    INSERT INTO model_pricing
      (provider_ai, model, base_credits, input_credits_per_1k, output_credits_per_1k, is_active)
    VALUES
      ('google', ${model}, ${baseCredits}, ${inPer1k}, ${outPer1k}, true)
    ON CONFLICT (provider_ai, model) DO UPDATE SET
      base_credits = EXCLUDED.base_credits,
      input_credits_per_1k = EXCLUDED.input_credits_per_1k,
      output_credits_per_1k = EXCLUDED.output_credits_per_1k,
      is_active = true,
      updated_at = now()
  `;
  console.log(`✓ pricing upserted: google/${model} = ${baseCredits} + ${inPer1k}/1k in + ${outPer1k}/1k out`);

  // 2) System key (upsert by name; token always re-encrypted with a fresh IV).
  const tokenEncrypted = encryptSecret(geminiKey);
  const existing = await sql`SELECT id FROM system_ai_key WHERE name = ${keyName} LIMIT 1`;
  if (existing.length > 0) {
    await sql`
      UPDATE system_ai_key SET
        token_encrypted = ${tokenEncrypted},
        provider_ai = 'google',
        model = ${model},
        is_active = true,
        disabled_until = NULL,
        failure_count = 0
      WHERE id = ${existing[0].id}
    `;
    console.log(`✓ system key updated: "${keyName}" (google/${model}), token re-encrypted`);
  } else {
    await sql`
      INSERT INTO system_ai_key
        (name, provider_ai, model, token_encrypted, is_active, weight, priority)
      VALUES
        (${keyName}, 'google', ${model}, ${tokenEncrypted}, true, 1, 0)
    `;
    console.log(`✓ system key created: "${keyName}" (google/${model}), token encrypted`);
  }

  console.log("\n✓ seed complete. Next: scripts/make-admin.ts, then grant yourself credits in the admin UI.");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
