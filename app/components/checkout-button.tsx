"use client";

import { useState } from "react";
import { createCheckoutSession } from "../actions/create-checkout-session";
import { useStore } from "./store-context";

export function CheckoutButton() {
  const { cart } = useStore();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setPending(true);
    setError(null);

    const result = await createCheckoutSession(cart);

    if (!result.ok) {
      setError(result.error);
      setPending(false);
      return;
    }

    window.location.assign(result.url);
  }

  return (
    <div className="checkoutActions">
      <button
        className="button"
        type="button"
        onClick={handleCheckout}
        disabled={pending || cart.length === 0}
      >
        {pending ? "פותחים תשלום..." : "לתשלום מאובטח ב-Stripe"}
      </button>
      <p className="checkoutHint">
        כרטיס האשראי מוזן אצל Stripe, לא אצלנו. אפשר לבדוק עם כרטיס בדיקה
        4242.
      </p>
      {error ? <p className="checkoutError">{error}</p> : null}
    </div>
  );
}
