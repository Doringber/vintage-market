type StripeEnv = {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string | null;
};

function readEnv(name: string): string | null {
  const value = process.env[name];
  return value?.trim() ? value.trim() : null;
}

export function hasStripeSecret(): boolean {
  return Boolean(readEnv("STRIPE_SECRET_KEY"));
}

export function getStripeEnv(): StripeEnv {
  const secretKey = readEnv("STRIPE_SECRET_KEY");
  const publishableKey = readEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");

  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY. Add it to .env.local.");
  }

  if (!publishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY. Add it to .env.local.",
    );
  }

  return {
    secretKey,
    publishableKey,
    webhookSecret: readEnv("STRIPE_WEBHOOK_SECRET"),
  };
}
