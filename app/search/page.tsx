import Link from "next/link";
import { getProducts } from "../data/products-repository";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const products = await getProducts();

  const results = query
    ? products.filter((product) => {
        const haystack = `${product.name} ${product.category} ${product.description}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
    : [];

  return (
    <main className="shopPage">
      <header className="shopHeader">
        <h1>תוצאות חיפוש</h1>
        <p>
          {query
            ? `נמצאו ${results.length} תוצאות עבור "${query}".`
            : "הקלידי מונח חיפוש בשורת החיפוש למעלה."}
        </p>
      </header>

      {query && results.length === 0 ? (
        <section className="contentBox">
          <h2>לא נמצאו תוצאות</h2>
          <p>נסי לחפש לפי קטגוריה או מילה אחרת.</p>
          <Link className="button" href="/shop">
            מעבר לכל המוצרים
          </Link>
        </section>
      ) : null}

      {results.length > 0 ? (
        <section className="shopGrid">
          {results.map((product) => (
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
      ) : null}
    </main>
  );
}
