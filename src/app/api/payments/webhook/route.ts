import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";

/**
 * Payment-gateway webhook endpoint.
 *
 * The active provider (resolved from env) verifies the signature and dispatches
 * the event. A real provider's handleWebhook calls the SAME pure credit
 * functions the admin panel uses today (grantCredits / assignSubscription), so
 * provisioning is identical whether triggered by an admin or a paid event.
 *
 * With the Stub provider this returns 200 + handled:false (no-op), so wiring a
 * gateway later is a drop-in: implement PaymentProvider.handleWebhook and set
 * PAYMENT_PROVIDER in env. No route changes required.
 */
export async function POST(req: Request) {
  try {
    const result = await getPaymentProvider().handleWebhook(req);
    return NextResponse.json(result, { status: result.handled ? 200 : 202 });
  } catch (err) {
    console.error("Payment webhook error:", err);
    return NextResponse.json(
      { handled: false, message: "webhook processing failed" },
      { status: 400 }
    );
  }
}

// Gateways send a GET to verify the endpoint during setup.
export async function GET() {
  return NextResponse.json({ ok: true, provider: getPaymentProvider().id });
}
