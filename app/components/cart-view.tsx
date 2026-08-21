"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useStore } from "./store-context";

function parsePrice(price: string): number {
  const parsed = Number(price.replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function CartView() {
  const { cart, cartProducts, removeFromCart, updateCartQty, clearCart } = useStore();

  const items = useMemo(
    () => {
      const mapped = cart.map((item) => {
        const product = cartProducts[item.slug];
        if (!product) {
          return null;
        }
        const unitPrice = parsePrice(product.price);
        return {
          ...item,
          product,
          unitPrice,
          lineTotal: unitPrice * item.qty,
        };
      });

      return mapped.filter(
        (
          item,
        ): item is {
          slug: string;
          qty: number;
          product: { slug: string; name: string; price: string; image: string; category: string };
          unitPrice: number;
          lineTotal: number;
        } => item !== null,
      );
    },
    [cart, cartProducts],
  );

  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

  if (items.length === 0) {
    return (
      <section className="contentBox">
        <h2>הסל שלך ריק</h2>
        <p>כדאי להוסיף כמה פריטים מהמבחר שלנו ולחזור לכאן.</p>
        <Link className="button" href="/shop">
          מעבר לחנות
        </Link>
      </section>
    );
  }

  return (
    <section className="cartWrap">
      <div className="cartList">
        {items.map((item) => (
          <article className="cartItem quirky-container" key={item.slug}>
            <div
              className="cartThumb"
              style={{ backgroundImage: `url(${item.product.image})` }}
              aria-label={`תמונה של ${item.product.name}`}
            />
            <div className="cartBody">
              <h3>{item.product.name}</h3>
              <p>{item.product.category}</p>
              <strong>₪{item.lineTotal}</strong>
              <div className="cartControls">
                <label htmlFor={`qty-${item.slug}`}>כמות</label>
                <input
                  id={`qty-${item.slug}`}
                  type="number"
                  min={1}
                  value={item.qty}
                  onChange={(event) => updateCartQty(item.slug, Number(event.target.value))}
                />
                <button
                  className="buttonSecondary actionLink"
                  type="button"
                  onClick={() => removeFromCart(item.slug)}
                >
                  הסרה
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <aside className="cartSummary quirky-container">
        <h2>סיכום סל</h2>
        <p>סה״כ לתשלום:</p>
        <strong>₪{total}</strong>
        <button className="button" type="button">
          לתשלום מאובטח
        </button>
        <button className="buttonSecondary actionLink" type="button" onClick={clearCart}>
          ריקון סל
        </button>
      </aside>
    </section>
  );
}
