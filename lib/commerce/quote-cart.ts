import { getProducts } from "../../app/data/products-repository";
import { parseShekels } from "./money";
import { getShippingShekels } from "./shipping";

export type CartQuoteItem = {
  slug: string;
  qty: number;
};

export type QuotedLine = {
  slug: string;
  name: string;
  qty: number;
  lineTotal: number;
};

export type CartQuote =
  | {
      ok: true;
      subtotal: number;
      shipping: number;
      total: number;
      lines: QuotedLine[];
    }
  | { ok: false; error: string };

const MAX_LINE_ITEMS = 30;
const MAX_QTY_PER_ITEM = 20;

export async function quoteCart(cartItems: CartQuoteItem[]): Promise<CartQuote> {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return { ok: false, error: "הסל ריק. הוסיפו פריטים לפני התשלום." };
  }

  if (cartItems.length > MAX_LINE_ITEMS) {
    return { ok: false, error: "יש יותר מדי פריטים בסל לתשלום אחד." };
  }

  const catalog = await getProducts();
  const productsBySlug = new Map(catalog.map((product) => [product.slug, product]));
  const lines: QuotedLine[] = [];
  let subtotal = 0;

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

    const safeQty = Math.round(qty);
    const lineTotal = unitShekels * safeQty;
    subtotal += lineTotal;
    lines.push({
      slug: product.slug,
      name: product.name,
      qty: safeQty,
      lineTotal,
    });
  }

  const shipping = getShippingShekels(subtotal);
  return {
    ok: true,
    subtotal,
    shipping,
    total: subtotal + shipping,
    lines,
  };
}
