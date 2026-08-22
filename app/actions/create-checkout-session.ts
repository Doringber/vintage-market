"use server";

import { getProducts } from "../data/products-repository";
import { parseShekels, shekelsToAgorot } from "../../lib/commerce/money";
import { getShippingShekels } from "../../lib/commerce/shipping";
import { hasStripeSecret } from "../../lib/stripe/config";
import { getStripeClient } from "../../lib/stripe/server";
import { getSiteUrl } from "../../lib/stripe/site-url";

export type CheckoutCartItem = {
  slug: string;
  qty: number;
};

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

const MAX_LINE_ITEMS = 30;
const MAX_QTY_PER_ITEM = 20;

function isHttpsImage(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function createCheckoutSession(
  cartItems: CheckoutCartItem[],
): Promise<CheckoutResult> {
  if (!hasStripeSecret()) {
    return {
      ok: false,
      error: "סליקה עדיין לא הוגדרה. צריך להוסיף מפתחות Stripe לקובץ .env.local.",
    };
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return { ok: false, error: "הסל ריק. הוסיפו פריטים לפני התשלום." };
  }

  if (cartItems.length > MAX_LINE_ITEMS) {
    return { ok: false, error: "יש יותר מדי פריטים בסל לתשלום אחד." };
  }

  const catalog = await getProducts();
  const productsBySlug = new Map(catalog.map((product) => [product.slug, product]));
  const stripe = getStripeClient();
  const siteUrl = await getSiteUrl();

  try {
    const lineItems = [];
    let subtotalShekels = 0;

    for (const item of cartItems) {
      const qty = Number(item.qty);
      if (!item.slug || !Number.isFinite(qty) || qty < 1 || qty > MAX_QTY_PER_ITEM) {
        return { ok: false, error: "כמות לא תקינה באחד הפריטים." };
      }

      const product = productsBySlug.get(item.slug);
      if (!product) {
        return { ok: false, error: `הפריט ${item.slug} כבר לא זמין לתשלום.` };
      }

      const unitShekels = parseShekels(product.price);
      if (unitShekels <= 0) {
        return { ok: false, error: `לפריט ${product.name} אין מחיר תקין.` };
      }

      subtotalShekels += unitShekels * qty;
      const images = isHttpsImage(product.image) ? [product.image] : [];

      lineItems.push({
        quantity: Math.round(qty),
        price_data: {
          currency: "ils" as const,
          unit_amount: shekelsToAgorot(unitShekels),
          product_data: {
            name: product.name,
            description: product.category,
            ...(images.length > 0 ? { images } : {}),
          },
        },
      });
    }

    const shippingShekels = getShippingShekels(subtotalShekels);
    if (shippingShekels > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "ils",
          unit_amount: shekelsToAgorot(shippingShekels),
          product_data: {
            name: "משלוח עד הבית",
            description: "2-5 ימי עסקים",
          },
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "he",
      currency: "ils",
      line_items: lineItems,
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      shipping_address_collection: {
        allowed_countries: ["IL"],
      },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel`,
      metadata: {
        slugs: cartItems
          .map((item) => `${item.slug}x${item.qty}`)
          .join(",")
          .slice(0, 499),
      },
    });

    if (!session.url) {
      return { ok: false, error: "Stripe לא החזיר קישור לתשלום. נסו שוב." };
    }

    return { ok: true, url: session.url };
  } catch (error) {
    console.error("Failed to create Stripe checkout session.", error);
    return {
      ok: false,
      error: "לא הצלחנו לפתוח את עמוד התשלום. בדקו את מפתחות Stripe ונסו שוב.",
    };
  }
}
