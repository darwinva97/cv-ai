/**
 * Payment-provider seam. The whole monetization core (credits, plans,
 * subscriptions, admin grants) is built to work WITHOUT a live gateway. When a
 * provider is connected (Lemon Squeezy / Paddle / PayPal), it only needs to:
 *   1. produce a checkout URL, and
 *   2. on webhook, call the SAME pure credit functions admin actions use today
 *      (grantCredits / assignSubscription).
 *
 * Note (Peru): Stripe doesn't onboard Peru-based accounts, so we keep this
 * agnostic. `externalProvider`/`externalId` columns carry whatever the chosen
 * Merchant-of-Record uses.
 */

export interface CheckoutResult {
  /** URL to redirect the buyer to, or null when no real gateway is wired yet. */
  url: string | null;
  /** True while running on the stub (no real payment). */
  stub?: boolean;
  /** Provider-specific session/order id, when available. */
  externalId?: string;
}

export interface WebhookResult {
  handled: boolean;
  /** Human-readable note for logging. */
  message?: string;
}

export interface SubscriptionCheckoutParams {
  userId: string;
  planId: string;
  /** Where to send the user after a successful/cancelled checkout. */
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreditCheckoutParams {
  userId: string;
  /** The credit_pack being purchased (provider resolves credits + gateway variant). */
  packId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface PaymentProvider {
  readonly id: string;
  createSubscriptionCheckout(params: SubscriptionCheckoutParams): Promise<CheckoutResult>;
  createCreditCheckout(params: CreditCheckoutParams): Promise<CheckoutResult>;
  /** Verify + dispatch a provider webhook. Real impls call grantCredits/assignSubscription. */
  handleWebhook(req: Request): Promise<WebhookResult>;
}
