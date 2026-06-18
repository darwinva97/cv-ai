import "server-only";
import { and, asc, eq, gt, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  billingAccount,
  creditTransaction,
  modelPricing,
} from "@/db/schema/billing";
import type { TokenUsage } from "@/lib/ai-generate";

/**
 * Credit engine: pricing, estimation, and the reserve → reconcile → refund
 * ledger flow. Credits are integers throughout.
 *
 * Invariant: billing_account.expiringBalance == SUM(remainingExpiring) over
 * non-expired subscription_grant rows; nonExpiringBalance == purchases/grants
 * minus spend. The account row is the lock target (SELECT ... FOR UPDATE) that
 * serializes concurrent debits for a user.
 */

// ---- Errors ----
export type CreditErrorCode =
  | "insufficient_credits"
  | "no_pricing"
  | "no_account";

export class CreditError extends Error {
  code: CreditErrorCode;
  balance?: number;
  estCost?: number;
  constructor(code: CreditErrorCode, opts?: { balance?: number; estCost?: number; message?: string }) {
    super(opts?.message ?? code);
    this.name = "CreditError";
    this.code = code;
    this.balance = opts?.balance;
    this.estCost = opts?.estCost;
  }
}

// ---- Pure pricing ----
export interface Pricing {
  baseCredits: number;
  inputCreditsPer1k: number;
  outputCreditsPer1k: number;
}

/** Exact credit cost of a generation given real token usage. Integer, rounded up per 1k. */
export function priceOf(pricing: Pricing, usage: TokenUsage): number {
  return (
    pricing.baseCredits +
    Math.ceil(usage.inputTokens / 1000) * pricing.inputCreditsPer1k +
    Math.ceil(usage.outputTokens / 1000) * pricing.outputCreditsPer1k
  );
}

const SAFETY_MARGIN = 1.2;
const ESTIMATED_OUTPUT_TOKENS = 1600; // structured resume output is fairly large

/** Conservative pre-call estimate from prompt length, with a safety margin. */
export function estimateCost(pricing: Pricing, promptChars: number): number {
  const estInputTokens = Math.ceil(promptChars / 4); // ~4 chars per token
  const raw = priceOf(pricing, {
    inputTokens: estInputTokens,
    outputTokens: ESTIMATED_OUTPUT_TOKENS,
    totalTokens: 0,
  });
  return Math.ceil(raw * SAFETY_MARGIN) + 1;
}

// ---- Reservation shape ----
interface SpentBreakdown {
  lots: Array<{ id: string; amt: number }>; // expiring grant lots decremented (FIFO)
  nonExpiring: number;
}
export interface Reservation {
  reservationTxnId: string;
  estCost: number;
  spent: SpentBreakdown;
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// ---- Internal helpers (assume the account row is already locked) ----

async function lockAccount(tx: Tx, userId: string) {
  await tx.insert(billingAccount).values({ userId }).onConflictDoNothing();
  const [acct] = await tx
    .select()
    .from(billingAccount)
    .where(eq(billingAccount.userId, userId))
    .for("update");
  return acct;
}

/** Expire any subscription grant lots whose expiresAt has passed. Idempotent. */
async function applyExpirationLocked(tx: Tx, userId: string) {
  const now = new Date();
  const expiredLots = await tx
    .select()
    .from(creditTransaction)
    .where(
      and(
        eq(creditTransaction.userId, userId),
        eq(creditTransaction.kind, "subscription_grant"),
        gt(creditTransaction.remainingExpiring, 0),
        lte(creditTransaction.expiresAt, now)
      )
    )
    .for("update");

  let expired = 0;
  for (const lot of expiredLots) expired += lot.remainingExpiring ?? 0;
  if (expired === 0) return;

  for (const lot of expiredLots) {
    await tx
      .update(creditTransaction)
      .set({ remainingExpiring: 0 })
      .where(eq(creditTransaction.id, lot.id));
  }
  const [acct] = await tx
    .update(billingAccount)
    .set({
      expiringBalance: sql`${billingAccount.expiringBalance} - ${expired}`,
      updatedAt: now,
    })
    .where(eq(billingAccount.userId, userId))
    .returning();

  await tx.insert(creditTransaction).values({
    userId,
    kind: "expiration",
    amount: -expired,
    bucket: "expiring",
    balanceAfterExpiring: acct.expiringBalance,
    balanceAfterNonExpiring: acct.nonExpiringBalance,
    source: "expiry",
  });
}

/** Restore up to `amount` credits, LIFO: nonExpiring first, then expiring lots in reverse. */
async function restoreLocked(
  tx: Tx,
  userId: string,
  amount: number,
  spent: SpentBreakdown
) {
  let remaining = amount;
  let addNonExpiring = 0;

  const giveNonExp = Math.min(remaining, spent.nonExpiring);
  addNonExpiring += giveNonExp;
  remaining -= giveNonExp;

  // Restore expiring lots in reverse spend order (LIFO).
  for (let i = spent.lots.length - 1; i >= 0 && remaining > 0; i--) {
    const lot = spent.lots[i];
    const give = Math.min(remaining, lot.amt);
    if (give <= 0) continue;
    await tx
      .update(creditTransaction)
      .set({ remainingExpiring: sql`${creditTransaction.remainingExpiring} + ${give}` })
      .where(eq(creditTransaction.id, lot.id));
    await tx
      .update(billingAccount)
      .set({ expiringBalance: sql`${billingAccount.expiringBalance} + ${give}` })
      .where(eq(billingAccount.userId, userId));
    remaining -= give;
  }

  if (addNonExpiring > 0) {
    await tx
      .update(billingAccount)
      .set({ nonExpiringBalance: sql`${billingAccount.nonExpiringBalance} + ${addNonExpiring}` })
      .where(eq(billingAccount.userId, userId));
  }
  // Any leftover `remaining` (lots already maxed) falls back to non-expiring.
  if (remaining > 0) {
    await tx
      .update(billingAccount)
      .set({ nonExpiringBalance: sql`${billingAccount.nonExpiringBalance} + ${remaining}` })
      .where(eq(billingAccount.userId, userId));
  }
}

// ---- Public API ----

export interface BillingSummary {
  expiringBalance: number;
  nonExpiringBalance: number;
  total: number;
  nextExpiry: Date | null;
}

/** Read balances after applying lazy expiration. */
export async function getBillingSummary(userId: string): Promise<BillingSummary> {
  return db.transaction(async (tx) => {
    await lockAccount(tx, userId);
    await applyExpirationLocked(tx, userId);
    const [acct] = await tx
      .select()
      .from(billingAccount)
      .where(eq(billingAccount.userId, userId));

    const [next] = await tx
      .select({ expiresAt: creditTransaction.expiresAt })
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          eq(creditTransaction.kind, "subscription_grant"),
          gt(creditTransaction.remainingExpiring, 0)
        )
      )
      .orderBy(asc(creditTransaction.expiresAt))
      .limit(1);

    return {
      expiringBalance: acct.expiringBalance,
      nonExpiringBalance: acct.nonExpiringBalance,
      total: acct.expiringBalance + acct.nonExpiringBalance,
      nextExpiry: next?.expiresAt ?? null,
    };
  });
}

export interface GrantOptions {
  expiring?: boolean;
  expiresAt?: Date | null;
  kind?: "subscription_grant" | "purchase" | "admin_adjust";
  source?: string;
  externalProvider?: string | null;
  externalId?: string | null;
}

/** Add credits to a user (admin grant, subscription renewal, or purchase). */
export async function grantCredits(
  userId: string,
  amount: number,
  opts: GrantOptions = {}
): Promise<BillingSummary> {
  if (amount <= 0) throw new Error("grant amount must be positive");
  const expiring = opts.expiring ?? false;
  const kind = opts.kind ?? (expiring ? "subscription_grant" : "purchase");

  return db.transaction(async (tx) => {
    await lockAccount(tx, userId);
    const [acct] = await tx
      .update(billingAccount)
      .set(
        expiring
          ? { expiringBalance: sql`${billingAccount.expiringBalance} + ${amount}`, updatedAt: new Date() }
          : { nonExpiringBalance: sql`${billingAccount.nonExpiringBalance} + ${amount}`, updatedAt: new Date() }
      )
      .where(eq(billingAccount.userId, userId))
      .returning();

    await tx.insert(creditTransaction).values({
      userId,
      kind,
      amount,
      bucket: expiring ? "expiring" : "non_expiring",
      balanceAfterExpiring: acct.expiringBalance,
      balanceAfterNonExpiring: acct.nonExpiringBalance,
      expiresAt: expiring ? opts.expiresAt ?? null : null,
      remainingExpiring: expiring ? amount : null,
      source: opts.source ?? "admin",
      externalProvider: opts.externalProvider ?? null,
      externalId: opts.externalId ?? null,
    });

    return {
      expiringBalance: acct.expiringBalance,
      nonExpiringBalance: acct.nonExpiringBalance,
      total: acct.expiringBalance + acct.nonExpiringBalance,
      nextExpiry: null,
    };
  });
}

/** Reserve `estCost` credits before the AI call. Throws CreditError on insufficient funds. */
export async function reserveCredits(
  userId: string,
  providerAi: string,
  model: string,
  estCost: number
): Promise<Reservation> {
  return db.transaction(async (tx) => {
    await lockAccount(tx, userId);
    await applyExpirationLocked(tx, userId);
    const [acct] = await tx
      .select()
      .from(billingAccount)
      .where(eq(billingAccount.userId, userId))
      .for("update");

    const total = acct.expiringBalance + acct.nonExpiringBalance;
    if (total < estCost) {
      throw new CreditError("insufficient_credits", { balance: total, estCost });
    }

    const fromExpiring = Math.min(acct.expiringBalance, estCost);
    const fromNonExpiring = estCost - fromExpiring;

    // Consume expiring lots FIFO (soonest expiry first).
    const spent: SpentBreakdown = { lots: [], nonExpiring: fromNonExpiring };
    let need = fromExpiring;
    if (need > 0) {
      const lots = await tx
        .select()
        .from(creditTransaction)
        .where(
          and(
            eq(creditTransaction.userId, userId),
            eq(creditTransaction.kind, "subscription_grant"),
            gt(creditTransaction.remainingExpiring, 0)
          )
        )
        .orderBy(asc(creditTransaction.expiresAt))
        .for("update");
      for (const lot of lots) {
        if (need <= 0) break;
        const take = Math.min(need, lot.remainingExpiring ?? 0);
        if (take <= 0) continue;
        await tx
          .update(creditTransaction)
          .set({ remainingExpiring: sql`${creditTransaction.remainingExpiring} - ${take}` })
          .where(eq(creditTransaction.id, lot.id));
        spent.lots.push({ id: lot.id, amt: take });
        need -= take;
      }
    }

    const [updated] = await tx
      .update(billingAccount)
      .set({
        expiringBalance: acct.expiringBalance - fromExpiring,
        nonExpiringBalance: acct.nonExpiringBalance - fromNonExpiring,
        updatedAt: new Date(),
      })
      .where(eq(billingAccount.userId, userId))
      .returning();

    const [resv] = await tx
      .insert(creditTransaction)
      .values({
        userId,
        kind: "debit",
        amount: -estCost,
        bucket: "mixed",
        balanceAfterExpiring: updated.expiringBalance,
        balanceAfterNonExpiring: updated.nonExpiringBalance,
        source: "generation",
        metadata: { reservation: true, spent, providerAi, model, estCost },
      })
      .returning();

    return { reservationTxnId: resv.id, estCost, spent };
  });
}

/** After a successful AI call: settle the difference between estimate and actual cost. */
export async function reconcileCharge(
  userId: string,
  reservation: Reservation,
  actualCost: number,
  usageLogId?: string
): Promise<{ creditsCharged: number; remaining: number }> {
  return db.transaction(async (tx) => {
    await lockAccount(tx, userId);
    const delta = reservation.estCost - actualCost;

    if (delta > 0) {
      // Over-reserved: refund the unused portion to its source buckets.
      await restoreLocked(tx, userId, delta, reservation.spent);
      const [acct] = await tx
        .select()
        .from(billingAccount)
        .where(eq(billingAccount.userId, userId));
      await tx.insert(creditTransaction).values({
        userId,
        kind: "refund",
        amount: delta,
        bucket: "mixed",
        balanceAfterExpiring: acct.expiringBalance,
        balanceAfterNonExpiring: acct.nonExpiringBalance,
        source: "generation_reconcile",
        usageLogId: usageLogId ?? null,
        metadata: { reservationTxnId: reservation.reservationTxnId },
      });
    } else if (delta < 0) {
      // Under-reserved (rare): charge the extra, clamped to available balance.
      const need = -delta;
      const [acct] = await tx
        .select()
        .from(billingAccount)
        .where(eq(billingAccount.userId, userId))
        .for("update");
      const fromExpiring = Math.min(acct.expiringBalance, need);
      const fromNonExpiring = Math.min(acct.nonExpiringBalance, need - fromExpiring);
      const charged = fromExpiring + fromNonExpiring;
      const [acct2] = await tx
        .update(billingAccount)
        .set({
          expiringBalance: acct.expiringBalance - fromExpiring,
          nonExpiringBalance: acct.nonExpiringBalance - fromNonExpiring,
          updatedAt: new Date(),
        })
        .where(eq(billingAccount.userId, userId))
        .returning();
      await tx.insert(creditTransaction).values({
        userId,
        kind: "debit",
        amount: -charged,
        bucket: "mixed",
        balanceAfterExpiring: acct2.expiringBalance,
        balanceAfterNonExpiring: acct2.nonExpiringBalance,
        source: "generation_reconcile",
        usageLogId: usageLogId ?? null,
        metadata: { undercharge: need - charged, reservationTxnId: reservation.reservationTxnId },
      });
    }

    const [final] = await tx
      .select()
      .from(billingAccount)
      .where(eq(billingAccount.userId, userId));
    return {
      creditsCharged: actualCost,
      remaining: final.expiringBalance + final.nonExpiringBalance,
    };
  });
}

/** On AI failure: fully refund the reservation, restoring original buckets. */
export async function refundReservation(
  userId: string,
  reservation: Reservation,
  reason = "generation_failed"
): Promise<void> {
  await db.transaction(async (tx) => {
    await lockAccount(tx, userId);
    await restoreLocked(tx, userId, reservation.estCost, reservation.spent);
    const [acct] = await tx
      .select()
      .from(billingAccount)
      .where(eq(billingAccount.userId, userId));
    await tx.insert(creditTransaction).values({
      userId,
      kind: "refund",
      amount: reservation.estCost,
      bucket: "mixed",
      balanceAfterExpiring: acct.expiringBalance,
      balanceAfterNonExpiring: acct.nonExpiringBalance,
      source: reason,
      metadata: { reservationTxnId: reservation.reservationTxnId },
    });
  });
}

/** Look up active pricing for a (provider, model). Returns null if none configured. */
export async function getPricing(providerAiValue: string, model: string) {
  const [row] = await db
    .select()
    .from(modelPricing)
    .where(
      and(
        eq(modelPricing.providerAi, providerAiValue as never),
        eq(modelPricing.model, model),
        eq(modelPricing.isActive, true)
      )
    )
    .limit(1);
  return row ?? null;
}
