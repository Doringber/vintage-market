import Stripe from "stripe";
import { cache } from "react";
import { getStripeEnv } from "./config";

export const getStripeClient = cache(() => {
  const { secretKey } = getStripeEnv();
  return new Stripe(secretKey);
});
