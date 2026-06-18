import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHmac } from "node:crypto";

// Mock the credit/subscription side-effects so we assert routing, not DB writes.
vi.mock("@/lib/credits", () => ({ grantCredits: vi.fn(async () => ({})) }));
vi.mock("@/lib/subscriptions", () => ({
  provisionSubscription: vi.fn(async () => ({})),
  markSubscriptionStatus: vi.fn(async () => {}),
}));

import { verifyLemonSignature, dispatchLemonEvent } from "@/lib/payments/lemonsqueezy";
import { grantCredits } from "@/lib/credits";
import { provisionSubscription, markSubscriptionStatus } from "@/lib/subscriptions";

const SECRET = "test_webhook_secret";
function sign(raw: string) {
  return createHmac("sha256", SECRET).update(raw).digest("hex");
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("verifyLemonSignature", () => {
  it("accepts a correct HMAC-SHA256 signature", () => {
    const raw = JSON.stringify({ hello: "world" });
    expect(verifyLemonSignature(raw, sign(raw), SECRET)).toBe(true);
  });
  it("rejects a wrong signature", () => {
    const raw = JSON.stringify({ hello: "world" });
    expect(verifyLemonSignature(raw, "deadbeef", SECRET)).toBe(false);
  });
  it("rejects a missing signature", () => {
    expect(verifyLemonSignature("{}", null, SECRET)).toBe(false);
  });
});

describe("dispatchLemonEvent routing", () => {
  it("order_created (paid) grants non-expiring credits, idempotent by order id", async () => {
    const res = await dispatchLemonEvent({
      meta: { event_name: "order_created", custom_data: { user_id: "u1", type: "credit_pack", credits: "1000" } },
      data: { id: "order_99", attributes: { status: "paid" } },
    });
    expect(res.handled).toBe(true);
    expect(grantCredits).toHaveBeenCalledTimes(1);
    expect(grantCredits).toHaveBeenCalledWith(
      "u1",
      1000,
      expect.objectContaining({ expiring: false, externalProvider: "lemonsqueezy", externalId: "order_99" })
    );
  });

  it("order_created not paid does NOT grant", async () => {
    const res = await dispatchLemonEvent({
      meta: { event_name: "order_created", custom_data: { user_id: "u1", credits: "1000" } },
      data: { id: "order_1", attributes: { status: "pending" } },
    });
    expect(res.handled).toBe(true);
    expect(grantCredits).not.toHaveBeenCalled();
  });

  it("order_created without custom data is not handled (no grant)", async () => {
    const res = await dispatchLemonEvent({
      meta: { event_name: "order_created", custom_data: {} },
      data: { id: "order_2", attributes: { status: "paid" } },
    });
    expect(res.handled).toBe(false);
    expect(grantCredits).not.toHaveBeenCalled();
  });

  it("subscription_created creates the row WITHOUT granting (grant happens on payment)", async () => {
    await dispatchLemonEvent({
      meta: { event_name: "subscription_created", custom_data: { user_id: "u2", plan_id: "p1" } },
      data: { id: "sub_1", attributes: { renews_at: "2026-07-18T00:00:00Z" } },
    });
    expect(provisionSubscription).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "u2", planId: "p1", doGrant: false, subscriptionExternalId: "sub_1" })
    );
  });

  it("subscription_payment_success grants, keyed by invoice id", async () => {
    await dispatchLemonEvent({
      meta: { event_name: "subscription_payment_success", custom_data: { user_id: "u2", plan_id: "p1" } },
      data: { id: "invoice_7", attributes: { subscription_id: "sub_1" } },
    });
    expect(provisionSubscription).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "u2", planId: "p1", doGrant: true, grantExternalId: "invoice_7" })
    );
  });

  it("subscription_cancelled marks the subscription canceled", async () => {
    await dispatchLemonEvent({
      meta: { event_name: "subscription_cancelled" },
      data: { id: "sub_1" },
    });
    expect(markSubscriptionStatus).toHaveBeenCalledWith("lemonsqueezy", "sub_1", "canceled");
  });

  it("ignores unknown events without side effects", async () => {
    const res = await dispatchLemonEvent({ meta: { event_name: "order_refunded" }, data: { id: "x" } });
    expect(res.handled).toBe(true);
    expect(grantCredits).not.toHaveBeenCalled();
    expect(provisionSubscription).not.toHaveBeenCalled();
  });
});
