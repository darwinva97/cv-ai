"use server";

import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { plan, subscription, aiUsageLog, creditPack } from "@/db/schema/billing";
import {
  getBillingSummary as getBillingSummaryLib,
  type BillingSummary,
} from "@/lib/credits";
import { getSessionUser } from "@/lib/auth-helpers";
import {
  getPaymentProvider,
  paymentsAreStubbed,
  type CheckoutResult,
} from "@/lib/payments";

/** Everything the user-facing billing page needs in one round-trip. */
export interface BillingOverview {
  summary: BillingSummary;
  subscription: {
    planName: string;
    status: string;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  } | null;
  usage: Array<{
    id: string;
    model: string;
    source: string;
    inputTokens: number;
    outputTokens: number;
    creditsCharged: number;
    status: string;
    createdAt: Date;
  }>;
  plans: Array<{
    id: string;
    name: string;
    description: string | null;
    monthlyCredits: number;
    priceCents: number;
    currency: string;
  }>;
  packs: Array<{
    id: string;
    name: string;
    description: string | null;
    credits: number;
    priceCents: number;
    currency: string;
  }>;
  paymentsStubbed: boolean;
}

async function requireUserId(): Promise<string> {
  const user = await getSessionUser();
  if (!user) throw new Error("No autenticado.");
  return user.id;
}

export async function getBillingOverview(): Promise<BillingOverview> {
  const userId = await requireUserId();

  const summary = await getBillingSummaryLib(userId);

  const [sub] = await db
    .select({
      planName: plan.name,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    })
    .from(subscription)
    .leftJoin(plan, eq(plan.id, subscription.planId))
    .where(
      and(eq(subscription.userId, userId), inArray(subscription.status, ["active", "past_due"]))
    )
    .orderBy(desc(subscription.currentPeriodEnd))
    .limit(1);

  const usage = await db
    .select({
      id: aiUsageLog.id,
      model: aiUsageLog.model,
      source: aiUsageLog.source,
      inputTokens: aiUsageLog.inputTokens,
      outputTokens: aiUsageLog.outputTokens,
      creditsCharged: aiUsageLog.creditsCharged,
      status: aiUsageLog.status,
      createdAt: aiUsageLog.createdAt,
    })
    .from(aiUsageLog)
    .where(eq(aiUsageLog.userId, userId))
    .orderBy(desc(aiUsageLog.createdAt))
    .limit(25);

  const plans = await db
    .select({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      monthlyCredits: plan.monthlyCredits,
      priceCents: plan.priceCents,
      currency: plan.currency,
    })
    .from(plan)
    .where(eq(plan.isActive, true))
    .orderBy(plan.priceCents);

  const packs = await db
    .select({
      id: creditPack.id,
      name: creditPack.name,
      description: creditPack.description,
      credits: creditPack.credits,
      priceCents: creditPack.priceCents,
      currency: creditPack.currency,
    })
    .from(creditPack)
    .where(eq(creditPack.isActive, true))
    .orderBy(creditPack.priceCents);

  return {
    summary,
    subscription: sub
      ? {
          planName: sub.planName ?? "Plan",
          status: sub.status,
          currentPeriodEnd: sub.currentPeriodEnd,
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
        }
      : null,
    usage,
    plans,
    packs,
    paymentsStubbed: paymentsAreStubbed(),
  };
}

/** Begin a subscription checkout (Stub → no URL, UI shows "próximamente"). */
export async function startSubscriptionCheckout(planId: string): Promise<CheckoutResult> {
  const userId = await requireUserId();
  return getPaymentProvider().createSubscriptionCheckout({ userId, planId });
}

/** Begin a credit-pack checkout (Stub → no URL). */
export async function startCreditCheckout(packId: string): Promise<CheckoutResult> {
  const userId = await requireUserId();
  return getPaymentProvider().createCreditCheckout({ userId, packId });
}
