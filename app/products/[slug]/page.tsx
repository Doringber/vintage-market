import { AddToCartButton } from "../../components/add-to-cart-button";
import { FavoriteButton } from "../../components/favorite-button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "../../data/products-repository";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="productPage">
      <Link href="/shop" className="backLink">
        חזרה לחנות
      </Link>

      <section className="productLayout">
        <div className="imageLayer">
          <div
            className="productImage"
            style={{ backgroundImage: `url(${product.image})` }}
            aria-label={`תמונה של ${product.name}`}
          />
          <FavoriteButton className="heart" slug={product.slug} name={product.name} />
        </div>

        <article className="productContent">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <strong className="productPrice">{product.price}</strong>
          <p className="productDescription">{product.description}</p>
          <div className="heroButtons">
            <AddToCartButton
              className="button"
              product={{
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.category,
              }}
            />
            <Link className="button buttonSecondary" href="/delivery">
              מידע על משלוחים
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
