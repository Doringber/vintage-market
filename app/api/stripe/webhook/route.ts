import { NextResponse } from "next/server";
import { getStripeEnv } from "../../../../lib/stripe/config";
import { getStripeClient } from "../../../../lib/stripe/server";

export async function POST(request: Request): Promise<NextResponse> {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  let webhookSecret: string | null = null;

  try {
    webhookSecret = getStripeEnv().webhookSecret;
  } catch (error) {
    console.error("Stripe webhook is not configured.", error);
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
  }

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Missing STRIPE_WEBHOOK_SECRET." },
      { status: 500 },
    );
  }

  const payload = await request.text();

  try {
    const stripe = getStripeClient();
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.info("Stripe checkout completed.", {
        sessionId: session.id,
        paymentStatus: session.payment_status,
        slugs: session.metadata?.slugs ?? null,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook verification failed.", error);
    return NextResponse.json({ error: "Invalid Stripe webhook." }, { status: 400 });
  }
}
