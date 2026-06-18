import "server-only";
import type { PaymentProvider } from "./types";
import { stubPaymentProvider } from "./stub";
import { lemonSqueezyProvider } from "./lemonsqueezy";

export * from "./types";

/**
 * Resolve the active payment provider from env. Returns the Stub until a real
 * Merchant-of-Record is wired (set PAYMENT_PROVIDER + its credentials).
 */
export function getPaymentProvider(): PaymentProvider {
  const configured = process.env.PAYMENT_PROVIDER?.toLowerCase();
  switch (configured) {
    case "lemonsqueezy":
      return lemonSqueezyProvider;
    // case "paddle": return paddleProvider;
    // case "paypal": return paypalProvider;
    default:
      return stubPaymentProvider;
  }
}

/** True when no real gateway is connected (UI shows "próximamente"). */
export function paymentsAreStubbed(): boolean {
  return getPaymentProvider().id === "stub";
}
