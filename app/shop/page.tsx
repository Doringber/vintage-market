import Link from "next/link";
import { AddToCartButton } from "../components/add-to-cart-button";
import { FavoriteButton } from "../components/favorite-button";
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
            <div className="imageLayer">
              <Link
                className="shopImage"
                href={`/products/${product.slug}`}
                style={{ backgroundImage: `url(${product.image})` }}
                aria-label={`מעבר לפריט: ${product.name}`}
              />
              <FavoriteButton className="heart" slug={product.slug} name={product.name} />
            </div>
            <div className="shopMeta">
              <span>{product.category}</span>
              <h2>
                <Link href={`/products/${product.slug}`}>{product.name}</Link>
              </h2>
              <p>{product.description}</p>
              <div className="metaActions">
                <strong>{product.price}</strong>
                <AddToCartButton
                  className="button miniButton"
                  product={{
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    category: product.category,
                  }}
                />
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
