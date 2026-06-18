import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { plan, subscription } from "@/db/schema/billing";
import { grantCredits } from "@/lib/credits";

/**
 * Pure subscription provisioning, shared by the admin panel (manual assignment)
 * and the payment webhook (gateway events). Creating/renewing a subscription
 * grants the plan's monthly credit bag as EXPIRING credits (expiresAt = period
 * end), reusing grantCredits — identical code path for admin and webhook.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export type SubscriptionStatus = "active" | "canceled" | "expired" | "past_due";

export interface ProvisionSubscriptionInput {
  userId: string;
  planId: string;
  /** Explicit period end (e.g. gateway renews_at). Falls back to periodDays. */
  currentPeriodEnd?: Date | null;
  periodDays?: number;
  status?: SubscriptionStatus;
  externalProvider?: string | null;
  /** Gateway subscription id — used to upsert the subscription row idempotently. */
  subscriptionExternalId?: string | null;
  /** Whether to grant the monthly credits now (false = only create/refresh the row). */
  doGrant?: boolean;
  /**
   * Idempotency key for the credit grant (e.g. gateway invoice/order id). Each
   * renewal carries a distinct one so every period grants exactly once on retries.
   */
  grantExternalId?: string | null;
}

export async function provisionSubscription(input: ProvisionSubscriptionInput) {
  const [p] = await db.select().from(plan).where(eq(plan.id, input.planId));
  if (!p) throw new Error("Plan no encontrado.");

  const now = new Date();
  const periodEnd =
    input.currentPeriodEnd ?? new Date(now.getTime() + (input.periodDays ?? 30) * DAY_MS);
  const status = input.status ?? "active";

  // Upsert the subscription row (keyed by gateway subscription id when present).
  let row;
  if (input.externalProvider && input.subscriptionExternalId) {
    const [existing] = await db
      .select()
      .from(subscription)
      .where(
        and(
          eq(subscription.externalProvider, input.externalProvider),
          eq(subscription.externalId, input.subscriptionExternalId)
        )
      )
      .limit(1);
    if (existing) {
      [row] = await db
        .update(subscription)
        .set({ planId: input.planId, status, currentPeriodEnd: periodEnd, updatedAt: now })
        .where(eq(subscription.id, existing.id))
        .returning();
    } else {
      [row] = await db
        .insert(subscription)
        .values({
          userId: input.userId,
          planId: input.planId,
          status,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          externalProvider: input.externalProvider,
          externalId: input.subscriptionExternalId,
        })
        .returning();
    }
  } else {
    [row] = await db
      .insert(subscription)
      .values({
        userId: input.userId,
        planId: input.planId,
        status,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      })
      .returning();
  }

  if (input.doGrant ?? true) {
    await grantCredits(input.userId, p.monthlyCredits, {
      expiring: true,
      expiresAt: periodEnd,
      kind: "subscription_grant",
      source: "subscription_renewal",
      externalProvider: input.externalProvider ?? null,
      externalId: input.grantExternalId ?? input.subscriptionExternalId ?? null,
    });
  }

  return row;
}

/** Mark a subscription canceled/expired by gateway subscription id. */
export async function markSubscriptionStatus(
  externalProvider: string,
  subscriptionExternalId: string,
  status: SubscriptionStatus
) {
  await db
    .update(subscription)
    .set({ status, updatedAt: new Date() })
    .where(
      and(
        eq(subscription.externalProvider, externalProvider),
        eq(subscription.externalId, subscriptionExternalId)
      )
    );
}
