import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <main className="contentPage">
      <h1>התשלום בוטל</h1>
      <p>לא חייבנו את הכרטיס. אפשר לחזור לסל ולנסות שוב מתי שנוח.</p>
      <div className="heroButtons">
        <Link className="button" href="/cart">
          חזרה לסל
        </Link>
        <Link className="button buttonSecondary" href="/shop">
          להמשך קניות
        </Link>
      </div>
    </main>
  );
}
