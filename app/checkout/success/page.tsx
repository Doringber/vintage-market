import Link from "next/link";
import { ClearCartOnSuccess } from "../../components/clear-cart-on-success";
import { getCheckoutSessionSummary } from "../../actions/get-checkout-session";

type SuccessPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { session_id: sessionId } = await searchParams;
  const summary = sessionId ? await getCheckoutSessionSummary(sessionId) : null;

  return (
    <main className="contentPage">
      <ClearCartOnSuccess />
      <h1>התשלום התקבל</h1>
      <p>
        תודה. אם התשלום עבר, נחזור אליכם לתיאום משלוח או איסוף לפי הפרטים
        שנשארו ב-Stripe.
      </p>
      {summary?.paid && summary.amountShekels !== null ? (
        <section className="contentBox">
          <h2>סיכום</h2>
          <p>הסכום ששולם: ₪{summary.amountShekels}</p>
        </section>
      ) : null}
      <Link className="button" href="/shop">
        חזרה לחנות
      </Link>
    </main>
  );
}
