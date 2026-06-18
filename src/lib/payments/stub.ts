import "server-only";
import type {
  PaymentProvider,
  CheckoutResult,
  WebhookResult,
} from "./types";

/**
 * No-op payment provider for the "core without real payments" phase.
 *
 * Checkouts resolve to `{ stub: true, url: null }` — the UI shows
 * "próximamente". Credits/subscriptions are instead provisioned by the admin
 * panel, which calls the exact same pure functions a real webhook would.
 */
export const stubPaymentProvider: PaymentProvider = {
  id: "stub",

  async createSubscriptionCheckout(): Promise<CheckoutResult> {
    return { url: null, stub: true };
  },

  async createCreditCheckout(): Promise<CheckoutResult> {
    return { url: null, stub: true };
  },

  async handleWebhook(): Promise<WebhookResult> {
    return { handled: false, message: "stub provider: webhooks not configured" };
  },
};
