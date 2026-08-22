"use server";

import { hasStripeSecret } from "../../lib/stripe/config";
import { getStripeClient } from "../../lib/stripe/server";

export type CheckoutSessionSummary = {
  paid: boolean;
  amountShekels: number | null;
};

export async function getCheckoutSessionSummary(
  sessionId: string,
): Promise<CheckoutSessionSummary | null> {
  if (!hasStripeSecret() || !sessionId.startsWith("cs_")) {
    return null;
  }

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const amountTotal = session.amount_total;

    return {
      paid: session.payment_status === "paid",
      amountShekels:
        typeof amountTotal === "number" ? Math.round(amountTotal) / 100 : null,
    };
  } catch (error) {
    console.error("Failed to retrieve Stripe checkout session.", error);
    return null;
  }
}
