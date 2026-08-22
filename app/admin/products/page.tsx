import Link from "next/link";
import { logoutAdmin } from "../../actions/admin";
import { isAdminAuthenticated } from "../../../lib/admin/auth";
import { readCatalog } from "../../../lib/catalog/store";
import type { CatalogProduct } from "../../../lib/catalog/types";
import { redirect } from "next/navigation";
import { CatalogStatusNote } from "../catalog-status";

export default async function AdminProductsPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  let products: CatalogProduct[] = [];
  let loadError: string | null = null;
  try {
    products = await readCatalog();
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "לא הצלחנו לטעון את המוצרים מהענן.";
  }

  return (
    <main className="shopPage">
      <header className="shopHeader">
        <h1>עריכת מוצרים</h1>
        <p>אפשר לשנות כותרת, מחיר, מידע ותמונות. מוצר בלי מלאי או כבוי לא יופיע בחנות.</p>
        <CatalogStatusNote />
        {loadError ? <p className="checkoutError">{loadError}</p> : null}
        <div className="heroButtons">
          <Link className="button" href="/admin/products/new">
            מוצר חדש
          </Link>
          <form action={logoutAdmin}>
            <button className="button buttonSecondary" type="submit">
              יציאה
            </button>
          </form>
        </div>
      </header>

      <section className="adminList">
        {products.map((product) => (
          <article className="adminRow quirky-container" key={product.slug}>
            <div
              className="adminThumb"
              style={{ backgroundImage: `url(${product.image})` }}
              aria-hidden
            />
            <div>
              <h2>{product.name}</h2>
              <p>
                {product.category} · ₪{product.price} · מלאי {product.stock} ·{" "}
                {product.isActive ? "מוצג" : "מוסתר"}
              </p>
            </div>
            <Link className="button miniButton" href={`/admin/products/${product.slug}`}>
              עריכה
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
