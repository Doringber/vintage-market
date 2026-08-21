import { CartView } from "../components/cart-view";

export default function CartPage() {
  return (
    <main className="shopPage">
      <header className="shopHeader">
        <h1>סל הקניות</h1>
        <p>כאן אפשר לעדכן כמויות, להסיר פריטים ולהמשיך לתשלום.</p>
      </header>
      <CartView />
    </main>
  );
}
