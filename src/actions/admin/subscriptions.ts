"use server";

import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { plan, subscription } from "@/db/schema/billing";
import { grantCredits } from "@/lib/credits";
import { requireAdmin } from "@/lib/auth-helpers";

/**
 * Admin subscription management. Assigning/renewing a subscription grants the
 * plan's monthly credit bag as an EXPIRING grant (expiresAt = period end),
 * reusing grantCredits — identical to what a billing webhook will do.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

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
  const [p] = await db.select().from(plan).where(eq(plan.id, input.planId));
  if (!p) throw new Error("Plan no encontrado.");

  const now = new Date();
  const periodEnd = new Date(now.getTime() + (input.periodDays ?? 30) * DAY_MS);

  const [sub] = await db
    .insert(subscription)
    .values({
      userId: input.userId,
      planId: input.planId,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    })
    .returning();

  await grantCredits(input.userId, p.monthlyCredits, {
    expiring: true,
    expiresAt: periodEnd,
    kind: "subscription_grant",
    source: "subscription_renewal",
  });

  return sub;
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
