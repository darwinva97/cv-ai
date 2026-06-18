"use server";

import { eq, desc, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { billingAccount, creditTransaction } from "@/db/schema/billing";
import { grantCredits } from "@/lib/credits";
import { requireAdmin } from "@/lib/auth-helpers";

/**
 * Admin credit operations. Grants reuse the SAME pure functions in
 * src/lib/credits.ts that a payment webhook will call later, so manual
 * provisioning today and gateway provisioning tomorrow share one code path.
 */

export interface UserWithBalance {
  id: string;
  name: string;
  email: string;
  role: string | null;
  expiringBalance: number;
  nonExpiringBalance: number;
  total: number;
}

/** List users (optionally filtered by name/email) with their cached balances. */
export async function listUsersWithBalances(search?: string): Promise<UserWithBalance[]> {
  await requireAdmin();
  const q = search?.trim();
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      expiringBalance: billingAccount.expiringBalance,
      nonExpiringBalance: billingAccount.nonExpiringBalance,
    })
    .from(user)
    .leftJoin(billingAccount, eq(billingAccount.userId, user.id))
    .where(
      q ? or(ilike(user.email, `%${q}%`), ilike(user.name, `%${q}%`)) : undefined
    )
    .orderBy(desc(user.createdAt))
    .limit(50);

  return rows.map((r) => {
    const exp = r.expiringBalance ?? 0;
    const non = r.nonExpiringBalance ?? 0;
    return { ...r, expiringBalance: exp, nonExpiringBalance: non, total: exp + non };
  });
}

/** Manually grant credits to a user (expiring = subscription-style; else a non-expiring pack). */
export async function adminGrantCredits(input: {
  userId: string;
  amount: number;
  expiring?: boolean;
  expiresAt?: string | null; // ISO; required-ish when expiring
}) {
  const admin = await requireAdmin();
  if (input.amount <= 0) throw new Error("La cantidad debe ser positiva.");

  const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
  const summary = await grantCredits(input.userId, input.amount, {
    expiring: input.expiring ?? false,
    expiresAt,
    kind: input.expiring ? "subscription_grant" : "admin_adjust",
    source: `admin:${admin.email}`,
  });
  return summary;
}

/** Recent ledger entries for a user (newest first). */
export async function getUserLedger(userId: string, limit = 50) {
  await requireAdmin();
  return db
    .select()
    .from(creditTransaction)
    .where(eq(creditTransaction.userId, userId))
    .orderBy(desc(creditTransaction.createdAt))
    .limit(limit);
}

/**
 * Reconciliation check: does the cached account equal the signed sum of the
 * ledger? The ledger is the source of truth. Returns drift per bucket.
 */
export async function checkLedgerDrift(userId: string) {
  await requireAdmin();
  const [acct] = await db
    .select()
    .from(billingAccount)
    .where(eq(billingAccount.userId, userId));
  const [sums] = await db
    .select({
      ledgerSum: sql<number>`COALESCE(SUM(${creditTransaction.amount}), 0)`,
    })
    .from(creditTransaction)
    .where(eq(creditTransaction.userId, userId));

  const cachedTotal = (acct?.expiringBalance ?? 0) + (acct?.nonExpiringBalance ?? 0);
  const ledgerTotal = Number(sums?.ledgerSum ?? 0);
  return { cachedTotal, ledgerTotal, drift: cachedTotal - ledgerTotal };
}
