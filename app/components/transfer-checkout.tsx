"use client";

import { useMemo, useState } from "react";
import { revealTransferDetails } from "../actions/reveal-transfer-details";
import { formatShekels } from "../../lib/commerce/money";
import { useStore } from "./store-context";

type TransferFormState = {
  name: string;
  phone: string;
  website: string;
  confirmPurchase: boolean;
};

const emptyForm: TransferFormState = {
  name: "",
  phone: "",
  website: "",
  confirmPurchase: false,
};

export function TransferCheckout() {
  const { cart } = useStore();
  const cartKey = useMemo(
    () => cart.map((item) => `${item.slug}:${item.qty}`).join("|"),
    [cart],
  );
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<TransferFormState>(emptyForm);
  const [revealedForCart, setRevealedForCart] = useState<string | null>(null);
  const [details, setDetails] = useState<{
    phone: string;
    reference: string;
    total: number;
    buyerName: string;
  } | null>(null);

  const revealed = details && revealedForCart === cartKey;

  async function handleReveal() {
    setPending(true);
    setError(null);

    const result = await revealTransferDetails(cart, form);

    if (!result.ok) {
      setDetails(null);
      setRevealedForCart(null);
      setError(result.error);
      setPending(false);
      return;
    }

    setDetails(result.details);
    setRevealedForCart(cartKey);
    setPending(false);
  }

  return (
    <div className="checkoutActions">
      {!open ? (
        <button
          className="button"
          type="button"
          onClick={() => setOpen(true)}
          disabled={cart.length === 0}
        >
          תשלום בביט / PayBox
        </button>
      ) : null}

      {open && !revealed ? (
        <form
          className="transferForm"
          onSubmit={(event) => {
            event.preventDefault();
            void handleReveal();
          }}
        >
          <p className="checkoutHint">
            המספר יופיע רק אחרי שתמלאו פרטים ותאשרו שאתם משלמים עכשיו. ככה לא
            חושפים אותו לכל מי שנכנס לאתר.
          </p>
          <label className="transferField">
            שם מלא
            <input
              type="text"
              name="name"
              autoComplete="name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
              minLength={2}
            />
          </label>
          <label className="transferField">
            נייד שלכם
            <input
              type="tel"
              name="phone"
              autoComplete="tel"
              inputMode="tel"
              placeholder="050-000-0000"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              required
            />
          </label>
          <label className="transferHoney" aria-hidden="true">
            אתר
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(event) => setForm({ ...form, website: event.target.value })}
            />
          </label>
          <label className="transferCheck">
            <input
              type="checkbox"
              checked={form.confirmPurchase}
              onChange={(event) =>
                setForm({ ...form, confirmPurchase: event.target.checked })
              }
            />
            אני מתכוון/ת לשלם עכשיו בביט או PayBox
          </label>
          <button className="button" type="submit" disabled={pending}>
            {pending ? "בודקים..." : "הצג פרטי תשלום"}
          </button>
        </form>
      ) : null}

      {revealed && details ? (
        <section className="transferReveal">
          <h3>פרטי תשלום</h3>
          <p>
            שלמו <strong>{formatShekels(details.total)}</strong> בביט או PayBox
            למספר:
          </p>
          <p className="transferPhone" dir="ltr">
            {details.phone}
          </p>
          <p>
            בתיאור ההעברה כתבו את הקוד <strong>{details.reference}</strong> ואת
            השם {details.buyerName}.
          </p>
          <p className="checkoutHint">
            אחרי שהתשלום מגיע נאשר את ההזמנה. בלי הקוד קשה לשייך את הכסף לסל.
          </p>
        </section>
      ) : null}

      {error ? <p className="checkoutError">{error}</p> : null}
    </div>
  );
}
