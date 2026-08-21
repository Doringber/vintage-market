import { FavoritesView } from "../components/favorites-view";
import { getProducts } from "../data/products-repository";

export default async function FavoritesPage() {
  const products = await getProducts();

  return (
    <main className="shopPage">
      <header className="shopHeader">
        <h1>המועדפים שלי</h1>
        <p>כל הפריטים שסימנת עם לב מחכים לך כאן.</p>
      </header>
      <FavoritesView products={products} />
    </main>
  );
}
