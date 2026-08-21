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
        <div
          className="productImage"
          style={{ backgroundImage: `url(${product.image})` }}
          aria-label={`תמונה של ${product.name}`}
        />

        <article className="productContent">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <strong className="productPrice">{product.price}</strong>
          <p className="productDescription">{product.description}</p>
          <div className="heroButtons">
            <button className="button" type="button">
              הוספה לסל
            </button>
            <Link className="button buttonSecondary" href="/delivery">
              מידע על משלוחים
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
