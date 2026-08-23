import Link from "next/link";
import { AddToCartButton } from "../components/add-to-cart-button";
import { FavoriteButton } from "../components/favorite-button";
import { toCssImageUrl } from "../../lib/catalog/media";
import { storefrontProductHref } from "../../lib/catalog/slug";
import { getProducts } from "../data/products-repository";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="shopPage">
      <header className="shopHeader">
        <h1>כל המוצרים</h1>
        <p>דברי ילדים יד שנייה - בגדים, מציאות ושאר דברים במחיר שפוי.</p>
      </header>

      <section className="shopGrid">
        {products.map((product) => (
          <article className="shopCard" key={product.slug}>
            <div className="imageLayer">
              <Link
                className="shopImage"
                href={storefrontProductHref(product.slug)}
                style={{ backgroundImage: toCssImageUrl(product.image) }}
                aria-label={`מעבר לפריט: ${product.name}`}
              />
              <FavoriteButton className="heart" slug={product.slug} name={product.name} />
            </div>
            <div className="shopMeta">
              <span>{product.category}</span>
              <h2>
                <Link href={storefrontProductHref(product.slug)}>{product.name}</Link>
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
