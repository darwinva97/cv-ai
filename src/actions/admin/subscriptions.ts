"use server";

import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { plan, subscription } from "@/db/schema/billing";
import { provisionSubscription } from "@/lib/subscriptions";
import { requireAdmin } from "@/lib/auth-helpers";

/**
 * Admin subscription management. Assigning/renewing a subscription grants the
 * plan's monthly credit bag as an EXPIRING grant (expiresAt = period end),
 * via the same provisionSubscription() a billing webhook uses.
 */

export async function listSubscriptions() {
  await requireAdmin();
  return db
    .select({
      id: subscription.id,
      userId: subscription.userId,
      userEmail: user.email,
      planId: subscription.planId,
      planName: plan.name,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      createdAt: subscription.createdAt,
    })
    .from(subscription)
    .leftJoin(user, eq(user.id, subscription.userId))
    .leftJoin(plan, eq(plan.id, subscription.planId))
    .orderBy(desc(subscription.createdAt));
}

/**
 * Create (or renew) a subscription for a user and grant its monthly credits.
 * Period defaults to 30 days. The granted bag expires at period end; whatever
 * is unspent from a prior period expires on its own (lazy expiration).
 */
export async function assignSubscription(input: {
  userId: string;
  planId: string;
  periodDays?: number;
}) {
  await requireAdmin();
  return provisionSubscription({
    userId: input.userId,
    planId: input.planId,
    periodDays: input.periodDays,
  });
}

export async function cancelSubscription(id: string, immediately = false) {
  await requireAdmin();
  const [row] = await db
    .update(subscription)
    .set(
      immediately
        ? { status: "canceled", cancelAtPeriodEnd: false, updatedAt: new Date() }
        : { cancelAtPeriodEnd: true, updatedAt: new Date() }
    )
    .where(eq(subscription.id, id))
    .returning();
  return row;
}
