"use client";

import Link from "next/link";
import { toCssImageUrl } from "../../lib/catalog/media";
import { storefrontProductHref } from "../../lib/catalog/slug";
import { FavoriteButton } from "./favorite-button";
import { useStore } from "./store-context";

type Product = {
  slug: string;
  name: string;
  category: string;
  price: string;
  image: string;
  description: string;
};

type FavoritesViewProps = {
  products: Product[];
};

export function FavoritesView({ products }: FavoritesViewProps) {
  const { favorites } = useStore();
  const favoriteProducts = products.filter((product) => favorites.includes(product.slug));

  if (favoriteProducts.length === 0) {
    return (
      <section className="contentBox">
        <h2>אין עדיין פריטים במועדפים</h2>
        <p>אפשר ללחוץ על הלב בכל כרטיס מוצר כדי לשמור פריטים שאהבת.</p>
        <Link className="button" href="/shop">
          מעבר לחנות
        </Link>
      </section>
    );
  }

  return (
    <section className="shopGrid">
      {favoriteProducts.map((product) => (
        <article className="shopCard" key={product.slug}>
          <div className="imageLayer">
            <Link
              className="shopImage"
              href={storefrontProductHref(product.slug)}
              style={{ backgroundImage: toCssImageUrl(product.image) }}
              aria-label={`מעבר לפריט: ${product.name}`}
            />
            <FavoriteButton className="heart favoriteActive" slug={product.slug} name={product.name} />
          </div>
          <div className="shopMeta">
            <span>{product.category}</span>
            <h2>
              <Link href={storefrontProductHref(product.slug)}>{product.name}</Link>
            </h2>
            <p>{product.description}</p>
            <strong>{product.price}</strong>
          </div>
        </article>
      ))}
    </section>
  );
}
