/**
 * Live verification of the credit engine (src/lib/credits.ts) against the real
 * DB, exercising the plan's test matrix WITHOUT the browser: grant → reserve →
 * reconcile → refund, insufficient funds, concurrency, lazy expiration, FIFO
 * buckets, ledger==balance invariant, and system-key decryption.
 *
 * Each scenario uses a throwaway user that is deleted afterward (cascade),
 * so it never touches real accounts.
 *
 * Run (needs live DB + MASTER_ENCRYPTION_KEY + GEMINI_API_KEY in .env):
 *   pnpm dlx tsx scripts/verify-credits.ts
 *   # (loads .env via dotenv-style? No — pass with node env. We rely on process.env)
 */
import assert from "node:assert";
import { randomUUID } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { db, client } from "@/db";
import { user } from "@/db/schema/auth";
import { billingAccount, creditTransaction } from "@/db/schema/billing";
import {
  grantCredits,
  reserveCredits,
  reconcileCharge,
  refundReservation,
  getBillingSummary,
  CreditError,
} from "@/lib/credits";
import { pickSystemKey } from "@/lib/system-keys";

const PROV = "google";
const MODEL = "gemini-2.5-flash";
const DAY = 86_400_000;

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean, extra?: unknown) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.log(`  ✗ ${name}`, extra ?? "");
  }
}

async function newUser(): Promise<string> {
  const id = randomUUID();
  const now = new Date();
  await db.insert(user).values({
    id,
    name: "Credit Test",
    email: `__credittest+${id}@example.test`,
    emailVerified: false,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}
async function delUser(id: string) {
  await db.delete(user).where(eq(user.id, id));
}
async function balances(userId: string) {
  const [a] = await db.select().from(billingAccount).where(eq(billingAccount.userId, userId));
  return { exp: a?.expiringBalance ?? 0, non: a?.nonExpiringBalance ?? 0 };
}
async function ledgerSum(userId: string) {
  const [r] = await db
    .select({ s: sql<number>`COALESCE(SUM(${creditTransaction.amount}),0)` })
    .from(creditTransaction)
    .where(eq(creditTransaction.userId, userId));
  return Number(r.s);
}

async function scenario(label: string, fn: (uid: string) => Promise<void>) {
  console.log(`\n— ${label}`);
  const uid = await newUser();
  try {
    await fn(uid);
  } catch (e) {
    failed++;
    console.log("  ✗ threw unexpectedly:", (e as Error).message);
  } finally {
    await delUser(uid);
  }
}

async function main() {
  // S1: grant + summary buckets
  await scenario("S1 grant + summary (buckets + nextExpiry)", async (uid) => {
    await grantCredits(uid, 100, { expiring: false });
    await grantCredits(uid, 50, { expiring: true, expiresAt: new Date(Date.now() + 7 * DAY) });
    const s = await getBillingSummary(uid);
    check("total = 150", s.total === 150, s);
    check("expiring = 50", s.expiringBalance === 50);
    check("nonExpiring = 100", s.nonExpiringBalance === 100);
    check("nextExpiry set", s.nextExpiry instanceof Date);
  });

  // S2: reserve spends expiring first, reconcile refunds overage; ledger invariant
  await scenario("S2 reserve(expiring-first) + reconcile refund + invariant", async (uid) => {
    await grantCredits(uid, 50, { expiring: true, expiresAt: new Date(Date.now() + 7 * DAY) });
    await grantCredits(uid, 100, { expiring: false });
    const r = await reserveCredits(uid, PROV, MODEL, 30);
    let b = await balances(uid);
    check("after reserve: expiring 20", b.exp === 20, b);
    check("after reserve: nonExpiring 100", b.non === 100, b);
    check("reservation spent from expiring lots", r.spent.lots.reduce((a, l) => a + l.amt, 0) === 30, r.spent);
    const rec = await reconcileCharge(uid, r, 20);
    b = await balances(uid);
    check("after reconcile(actual 20): expiring back to 30", b.exp === 30, b);
    check("after reconcile: nonExpiring 100", b.non === 100, b);
    check("reconcile reports charged 20", rec.creditsCharged === 20, rec);
    check("reconcile reports remaining 130", rec.remaining === 130, rec);
    check("LEDGER INVARIANT: SUM(ledger) == balance(130)", (await ledgerSum(uid)) === 130);
  });

  // S3: insufficient credits → throws, no charge, NO AI call would happen
  await scenario("S3 insufficient_credits (no charge)", async (uid) => {
    await grantCredits(uid, 10, { expiring: false });
    let threw: CreditError | null = null;
    try {
      await reserveCredits(uid, PROV, MODEL, 50);
    } catch (e) {
      threw = e as CreditError;
    }
    check("threw CreditError", threw instanceof CreditError, threw);
    check("code = insufficient_credits", threw?.code === "insufficient_credits");
    check("reports balance 10 / estCost 50", threw?.balance === 10 && threw?.estCost === 50);
    const b = await balances(uid);
    check("balance unchanged (10)", b.non === 10 && b.exp === 0, b);
  });

  // S4: refund on AI failure restores full reservation
  await scenario("S4 refund on failure (user made whole)", async (uid) => {
    await grantCredits(uid, 40, { expiring: false });
    const r = await reserveCredits(uid, PROV, MODEL, 40);
    let b = await balances(uid);
    check("after reserve: balance 0", b.exp + b.non === 0, b);
    await refundReservation(uid, r);
    b = await balances(uid);
    check("after refund: balance restored to 40", b.non === 40, b);
    check("LEDGER INVARIANT: SUM(ledger) == 40", (await ledgerSum(uid)) === 40);
  });

  // S5: concurrency — two reserves of 100 with balance 100 → exactly one wins, never negative
  await scenario("S5 concurrency (FOR UPDATE serializes; no negative balance)", async (uid) => {
    await grantCredits(uid, 100, { expiring: false });
    const results = await Promise.allSettled([
      reserveCredits(uid, PROV, MODEL, 100),
      reserveCredits(uid, PROV, MODEL, 100),
    ]);
    const ok = results.filter((r) => r.status === "fulfilled").length;
    const rej = results.filter((r) => r.status === "rejected").length;
    check("exactly one reservation succeeded", ok === 1, { ok, rej });
    check("exactly one rejected (insufficient)", rej === 1, { ok, rej });
    const b = await balances(uid);
    check("final balance 0, never negative", b.exp + b.non === 0 && b.exp >= 0 && b.non >= 0, b);
  });

  // S6: lazy expiration — past-due grant expires on read; non-expiring intact
  await scenario("S6 lazy expiration", async (uid) => {
    await grantCredits(uid, 30, { expiring: true, expiresAt: new Date(Date.now() - 1 * DAY) });
    await grantCredits(uid, 20, { expiring: false });
    const s = await getBillingSummary(uid); // triggers applyExpiration
    check("expiring expired to 0", s.expiringBalance === 0, s);
    check("nonExpiring intact (20)", s.nonExpiringBalance === 20, s);
    const [expTxn] = await db
      .select()
      .from(creditTransaction)
      .where(and(eq(creditTransaction.userId, uid), eq(creditTransaction.kind, "expiration")));
    check("an 'expiration' ledger entry was written", !!expTxn, expTxn);
    check("expiration amount = -30", expTxn?.amount === -30, expTxn?.amount);
  });

  // S7: system key pool — pick + decrypt
  console.log("\n— S7 system key pool (pick + decrypt)");
  const key = await pickSystemKey(PROV, MODEL);
  check("pickSystemKey returns a key", !!key, key);
  check("provider/model correct", key?.providerAi === PROV && key?.model === MODEL);
  check(
    "decrypted token equals GEMINI_API_KEY",
    !!key && key.token === (process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY)
  );

  console.log(`\n==== RESULT: ${passed} passed, ${failed} failed ====`);
}

main()
  .catch((e) => {
    console.error("harness error:", e);
    failed++;
  })
  .finally(async () => {
    await client.end();
    process.exit(failed > 0 ? 1 : 0);
  });
