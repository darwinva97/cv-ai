import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { plan, creditPack, subscription } from "@/db/schema/billing";
import { grantCredits } from "@/lib/credits";
import { provisionSubscription, markSubscriptionStatus } from "@/lib/subscriptions";
import type {
  PaymentProvider,
  CheckoutResult,
  WebhookResult,
  SubscriptionCheckoutParams,
  CreditCheckoutParams,
} from "./types";

/**
 * Lemon Squeezy (Merchant of Record). Checkouts are created via the LS API with
 * server-set custom_data carrying our user/plan/pack ids; webhooks (HMAC-signed)
 * dispatch to the SAME pure credit functions used by the admin panel
 * (grantCredits / provisionSubscription), with idempotency by gateway event id.
 *
 * Env: LEMONSQUEEZY_API_KEY, LEMONSQUEEZY_STORE_ID, LEMONSQUEEZY_WEBHOOK_SECRET.
 */

export const LS_PROVIDER_ID = "lemonsqueezy";
const LS_API = "https://api.lemonsqueezy.com/v1";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}
function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

/** Verify the LS webhook signature (HMAC-SHA256 hex of the raw body). */
export function verifyLemonSignature(raw: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const digest = createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(digest, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

async function createCheckout(
  variantId: string,
  custom: Record<string, string>,
  redirectUrl: string
): Promise<CheckoutResult> {
  const apiKey = requireEnv("LEMONSQUEEZY_API_KEY");
  const storeId = requireEnv("LEMONSQUEEZY_STORE_ID");
  const body = {
    data: {
      type: "checkouts",
      attributes: {
        checkout_data: { custom },
        product_options: { redirect_url: redirectUrl },
      },
      relationships: {
        store: { data: { type: "stores", id: String(storeId) } },
        variant: { data: { type: "variants", id: String(variantId) } },
      },
    },
  };
  const res = await fetch(`${LS_API}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Lemon Squeezy checkout failed (${res.status}): ${await res.text()}`);
  }
  const j = (await res.json()) as { data?: { id?: string; attributes?: { url?: string } } };
  return { url: j?.data?.attributes?.url ?? null, externalId: j?.data?.id };
}

/** Route a verified webhook payload to credit/subscription provisioning. Exported for tests. */
export async function dispatchLemonEvent(payload: unknown): Promise<WebhookResult> {
  const p = payload as {
    meta?: { event_name?: string; custom_data?: Record<string, string> };
    data?: { id?: string; attributes?: Record<string, unknown> };
  };
  const event = p?.meta?.event_name;
  const custom = p?.meta?.custom_data ?? {};
  const data = p?.data ?? {};
  const attrs = (data.attributes ?? {}) as Record<string, unknown>;

  switch (event) {
    case "order_created": {
      const userId = custom.user_id;
      const credits = Number(custom.credits);
      if (!userId || !Number.isFinite(credits) || credits <= 0) {
        return { handled: false, message: "order_created missing user_id/credits" };
      }
      if (attrs.status && attrs.status !== "paid") {
        return { handled: true, message: `order not paid (${String(attrs.status)})` };
      }
      await grantCredits(userId, credits, {
        expiring: false,
        kind: "purchase",
        source: LS_PROVIDER_ID,
        externalProvider: LS_PROVIDER_ID,
        externalId: String(data.id),
      });
      return { handled: true, message: `granted ${credits} credits to ${userId}` };
    }

    case "subscription_created": {
      const userId = custom.user_id;
      const planId = custom.plan_id;
      if (!userId || !planId) return { handled: false, message: "subscription_created missing custom data" };
      await provisionSubscription({
        userId,
        planId,
        currentPeriodEnd: attrs.renews_at ? new Date(String(attrs.renews_at)) : null,
        status: "active",
        externalProvider: LS_PROVIDER_ID,
        subscriptionExternalId: String(data.id),
        doGrant: false, // credits are granted on subscription_payment_success
      });
      return { handled: true, message: "subscription row created" };
    }

    case "subscription_payment_success": {
      const subId = attrs.subscription_id ? String(attrs.subscription_id) : "";
      let userId = custom.user_id;
      let planId = custom.plan_id;
      if ((!userId || !planId) && subId) {
        const [row] = await db
          .select()
          .from(subscription)
          .where(eq(subscription.externalId, subId))
          .limit(1);
        if (row) {
          userId = row.userId;
          planId = row.planId;
        }
      }
      if (!userId || !planId) return { handled: false, message: "payment_success: cannot resolve user/plan" };
      await provisionSubscription({
        userId,
        planId,
        currentPeriodEnd: attrs.renews_at ? new Date(String(attrs.renews_at)) : null,
        status: "active",
        externalProvider: LS_PROVIDER_ID,
        subscriptionExternalId: subId || null,
        grantExternalId: String(data.id), // invoice id → one grant per payment
        doGrant: true,
      });
      return { handled: true, message: "subscription credits granted" };
    }

    case "subscription_cancelled":
      await markSubscriptionStatus(LS_PROVIDER_ID, String(data.id), "canceled");
      return { handled: true, message: "subscription canceled" };

    case "subscription_expired":
      await markSubscriptionStatus(LS_PROVIDER_ID, String(data.id), "expired");
      return { handled: true, message: "subscription expired" };

    default:
      return { handled: true, message: `ignored event: ${event ?? "unknown"}` };
  }
}

export const lemonSqueezyProvider: PaymentProvider = {
  id: LS_PROVIDER_ID,

  async createSubscriptionCheckout(params: SubscriptionCheckoutParams): Promise<CheckoutResult> {
    const [p] = await db.select().from(plan).where(eq(plan.id, params.planId));
    if (!p) throw new Error("Plan no encontrado.");
    if (!p.externalId) throw new Error("El plan no tiene variant de Lemon Squeezy configurado (externalId).");
    return createCheckout(
      p.externalId,
      { user_id: params.userId, plan_id: p.id, type: "subscription" },
      params.successUrl ?? `${appUrl()}/billing`
    );
  },

  async createCreditCheckout(params: CreditCheckoutParams): Promise<CheckoutResult> {
    const [pack] = await db.select().from(creditPack).where(eq(creditPack.id, params.packId));
    if (!pack) throw new Error("Paquete de créditos no encontrado.");
    if (!pack.externalId) throw new Error("El paquete no tiene variant de Lemon Squeezy configurado (externalId).");
    return createCheckout(
      pack.externalId,
      { user_id: params.userId, pack_id: pack.id, type: "credit_pack", credits: String(pack.credits) },
      params.successUrl ?? `${appUrl()}/billing`
    );
  },

  async handleWebhook(req: Request): Promise<WebhookResult> {
    const secret = requireEnv("LEMONSQUEEZY_WEBHOOK_SECRET");
    const raw = await req.text();
    const signature = req.headers.get("x-signature");
    if (!verifyLemonSignature(raw, signature, secret)) {
      return { handled: false, message: "invalid signature" };
    }
    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      return { handled: false, message: "invalid JSON" };
    }
    return dispatchLemonEvent(payload);
  },
};
