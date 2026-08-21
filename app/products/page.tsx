import Link from "next/link";
import { getProducts } from "../data/products-repository";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="shopPage">
      <header className="shopHeader">
        <h1>כל המוצרים</h1>
        <p>עמוד המוצרים המרכזי של חנות קטנה ומטריפה.</p>
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
