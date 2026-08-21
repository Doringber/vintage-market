import Link from "next/link";
import { getProducts } from "../data/products-repository";

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <main className="shopPage">
      <header className="shopHeader">
        <h1>חנות קטנה ומטריפה</h1>
        <p>כל הפריטים הייחודיים במקום אחד, עם ניווט פשוט וחוויית קנייה ברורה.</p>
        <Link href="/products" className="button">
          עמוד מוצרים מלא
        </Link>
      </header>

      <section className="shopGrid">
        {products.map((product) => (
          <article className="shopCard" key={product.slug}>
            <Link
              className="shopImage"
              href={`/products/${product.slug}`}
              style={{ backgroundImage: `url(${product.image})` }}
              aria-label={`מעבר לפריט: ${product.name}`}
            />
            <div className="shopMeta">
              <span>{product.category}</span>
              <h2>
                <Link href={`/products/${product.slug}`}>{product.name}</Link>
              </h2>
              <p>{product.description}</p>
              <strong>{product.price}</strong>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
