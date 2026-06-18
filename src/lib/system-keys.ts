import "server-only";
import { and, asc, eq, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { systemAiKey } from "@/db/schema/system-key";
import { decryptSecret } from "@/lib/crypto";

/**
 * Platform-owned API key pool. Selects a key per (provider, model), decrypts it
 * just-in-time, and provides failover: keys that hit auth/rate-limit/quota errors
 * are put on a cooldown (disabledUntil) and the next key is tried.
 *
 * The decrypted token never leaves the server.
 */

export interface ResolvedSystemKey {
  id: string;
  providerAi: string;
  model: string;
  token: string; // decrypted, server-only
  url: string | null;
}

const MAX_KEY_RETRIES = 3;
const COOLDOWN_AUTH_MS = 24 * 60 * 60 * 1000; // likely revoked key
const COOLDOWN_RATELIMIT_MS = 5 * 60 * 1000;
const COOLDOWN_OTHER_MS = 60 * 1000;

export class NoSystemKeyError extends Error {
  constructor(public providerAi: string, public model: string) {
    super(`No system key available for ${providerAi}/${model}`);
    this.name = "NoSystemKeyError";
  }
}

function weightedPick<T extends { weight: number }>(items: T[]): T {
  const total = items.reduce((s, i) => s + Math.max(1, i.weight), 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= Math.max(1, item.weight);
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

/** Pick one available key for (provider, model): best priority tier, weighted within it. */
export async function pickSystemKey(
  providerAiValue: string,
  model: string
): Promise<ResolvedSystemKey | null> {
  const now = new Date();
  const candidates = await db
    .select()
    .from(systemAiKey)
    .where(
      and(
        eq(systemAiKey.providerAi, providerAiValue as never),
        eq(systemAiKey.model, model),
        eq(systemAiKey.isActive, true),
        or(isNull(systemAiKey.disabledUntil), lte(systemAiKey.disabledUntil, now))
      )
    )
    .orderBy(asc(systemAiKey.priority), asc(systemAiKey.lastUsedAt));

  if (candidates.length === 0) return null;

  // Restrict to the best (lowest) priority tier, then weighted-random within it.
  const topPriority = candidates[0].priority;
  const topTier = candidates.filter((c) => c.priority === topPriority);
  const chosen = weightedPick(topTier);

  // Best-effort LRU bookkeeping (advisory; no lock needed).
  await db
    .update(systemAiKey)
    .set({ lastUsedAt: now })
    .where(eq(systemAiKey.id, chosen.id));

  return {
    id: chosen.id,
    providerAi: chosen.providerAi,
    model: chosen.model,
    token: decryptSecret(chosen.tokenEncrypted),
    url: chosen.url,
  };
}

function classifyError(err: unknown): "auth" | "ratelimit" | "other" {
  const e = err as { statusCode?: number; status?: number; message?: string };
  const status = e?.statusCode ?? e?.status;
  const msg = (e?.message ?? String(err)).toLowerCase();
  if (status === 401 || status === 403 || /unauthor|invalid api key|permission|forbidden/.test(msg)) {
    return "auth";
  }
  if (status === 429 || /rate limit|quota|resource_exhausted|too many requests/.test(msg)) {
    return "ratelimit";
  }
  return "other";
}

/** Errors that should burn the key + try the next one (vs. surface immediately). */
function isKeyError(err: unknown): boolean {
  return classifyError(err) !== "other" || /overloaded|503|502|unavailable/.test(String((err as Error)?.message ?? err).toLowerCase());
}

async function markKeyFailure(keyId: string, err: unknown) {
  const kind = classifyError(err);
  const ms =
    kind === "auth" ? COOLDOWN_AUTH_MS : kind === "ratelimit" ? COOLDOWN_RATELIMIT_MS : COOLDOWN_OTHER_MS;
  await db
    .update(systemAiKey)
    .set({
      disabledUntil: new Date(Date.now() + ms),
      failureCount: sql`${systemAiKey.failureCount} + 1`,
    })
    .where(eq(systemAiKey.id, keyId));
}

/**
 * Run `fn` with a system key, retrying on key-level failures across the pool.
 * Throws NoSystemKeyError if the pool is empty/exhausted, or the original error
 * for non-key failures (bad prompt/schema) — those must not burn keys.
 */
export async function runWithSystemKey<T>(
  providerAiValue: string,
  model: string,
  fn: (key: ResolvedSystemKey) => Promise<T>
): Promise<{ result: T; keyId: string }> {
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < MAX_KEY_RETRIES; attempt++) {
    const key = await pickSystemKey(providerAiValue, model);
    if (!key) {
      if (lastErr) throw lastErr;
      throw new NoSystemKeyError(providerAiValue, model);
    }
    try {
      const result = await fn(key);
      return { result, keyId: key.id };
    } catch (err) {
      if (isKeyError(err)) {
        await markKeyFailure(key.id, err);
        lastErr = err;
        continue; // try the next key
      }
      throw err; // non-key error: surface (don't burn keys)
    }
  }
  throw lastErr ?? new NoSystemKeyError(providerAiValue, model);
}
