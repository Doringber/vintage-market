"use server";

import { cookies, headers } from "next/headers";
import { quoteCart, type CartQuoteItem } from "../../lib/commerce/quote-cart";
import {
  formatTransferPhone,
  getTransferPhone,
  isIsraeliMobile,
} from "../../lib/checkout/transfer-phone";

export type TransferBuyer = {
  name: string;
  phone: string;
  website?: string;
  confirmPurchase: boolean;
};

export type TransferDetails = {
  phone: string;
  reference: string;
  total: number;
  buyerName: string;
};

export type RevealTransferResult =
  | { ok: true; details: TransferDetails }
  | { ok: false; error: string };

const RATE_COOKIE = "transfer_reveal";
const RATE_WINDOW_MS = 60 * 60 * 1000;
const MAX_REVEALS_PER_WINDOW = 4;
const MIN_NAME_LENGTH = 2;

function createReference(): string {
  const suffix = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "");
  return `K-${suffix.slice(0, 4)}`;
}

function parseRateCookie(value: string | undefined): { windowStart: number; count: number } {
  if (!value) {
    return { windowStart: Date.now(), count: 0 };
  }

  const [windowStartRaw, countRaw] = value.split(":");
  const windowStart = Number(windowStartRaw);
  const count = Number(countRaw);

  if (!Number.isFinite(windowStart) || !Number.isFinite(count)) {
    return { windowStart: Date.now(), count: 0 };
  }

  if (Date.now() - windowStart > RATE_WINDOW_MS) {
    return { windowStart: Date.now(), count: 0 };
  }

  return { windowStart, count };
}

export async function revealTransferDetails(
  cartItems: CartQuoteItem[],
  buyer: TransferBuyer,
): Promise<RevealTransferResult> {
  if (buyer.website?.trim()) {
    return { ok: false, error: "לא ניתן להשלים את הבקשה. נסו שוב." };
  }

  const phoneDigits = getTransferPhone();
  if (!phoneDigits) {
    return {
      ok: false,
      error: "תשלום בביט / PayBox עדיין לא הוגדר. צריך להוסיף BIT_PAYBOX_PHONE ל-.env.local.",
    };
  }

  const name = buyer.name.trim();
  if (name.length < MIN_NAME_LENGTH) {
    return { ok: false, error: "כתבו שם מלא כדי שנוכל לשייך את התשלום." };
  }

  if (!isIsraeliMobile(buyer.phone)) {
    return { ok: false, error: "כתבו מספר נייד ישראלי תקין." };
  }

  if (!buyer.confirmPurchase) {
    return { ok: false, error: "צריך לאשר שאתם מתכוונים לשלם עכשיו." };
  }

  const quote = await quoteCart(cartItems);
  if (!quote.ok) {
    return quote;
  }

  if (quote.total <= 0) {
    return { ok: false, error: "אין סכום לתשלום." };
  }

  const cookieStore = await cookies();
  const rate = parseRateCookie(cookieStore.get(RATE_COOKIE)?.value);
  if (rate.count >= MAX_REVEALS_PER_WINDOW) {
    return {
      ok: false,
      error: "נשלחו יותר מדי בקשות תשלום מהדפדפן הזה. נסו שוב בעוד שעה.",
    };
  }

  const headerStore = await headers();
  const userAgent = headerStore.get("user-agent") ?? "";
  if (userAgent.length < 10) {
    return { ok: false, error: "לא ניתן להשלים את הבקשה. נסו מדפדפן רגיל." };
  }

  const reference = createReference();

  cookieStore.set(RATE_COOKIE, `${rate.windowStart}:${rate.count + 1}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60,
    path: "/",
  });

  console.info("Bit/PayBox payment details revealed.", {
    reference,
    total: quote.total,
    itemCount: quote.lines.length,
    buyerPhoneSuffix: buyer.phone.replace(/\D/g, "").slice(-4),
  });

  return {
    ok: true,
    details: {
      phone: formatTransferPhone(phoneDigits),
      reference,
      total: quote.total,
      buyerName: name,
    },
  };
}
