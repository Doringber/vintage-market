import Link from "next/link";
import { AddToCartButton } from "./components/add-to-cart-button";
import { FavoriteButton } from "./components/favorite-button";
import { getProducts } from "./data/products-repository";

export default async function Home() {
  const products = await getProducts();

  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">וינטג׳ אמיתי · יד שנייה מוקפדת · פריטים עם נשמה</p>
          <h1>
            חנות קטנה
            <br />
            <em>ומטריפה.</em>
          </h1>
          <p className="heroText">
            אוצרות שנאספו בשווקים, בתים ישנים ונסיעות קטנות. כל פריט מקבל
            במה חדשה - בדיוק כמו שמגיע לו.
          </p>
          <div className="heroButtons">
            <Link className="button" href="/shop">
              לכניסה לחנות
            </Link>
            <Link className="button buttonSecondary" href="/about">
              מי אנחנו
            </Link>
          </div>
        </div>
        <div className="heroImage" aria-label="תמונה של פריטי וינטג׳" />
      </section>

      <section className="intro" id="shop">
        <div>
          <p className="eyebrow">נבחר ביד ובהרבה אהבה</p>
          <h2>הפריטים שעלו השבוע</h2>
        </div>
        <Link href="/shop">לכל הפריטים</Link>
      </section>

      <section className="grid">
        {products.map((product, index) => (
          <article className={`card card-${index}`} key={product.name}>
            <div className="imageLayer">
              <Link
                className="imageWrap"
                href={`/products/${product.slug}`}
                style={{ backgroundImage: `url(${product.image})` }}
              />
              <FavoriteButton className="heart" slug={product.slug} name={product.name} />
            </div>
            <div className="cardMeta">
              <div>
                <span>{product.category}</span>
                <h3>
                  <Link href={`/products/${product.slug}`}>{product.name}</Link>
                </h3>
                <p>{product.description}</p>
              </div>
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

      <section className="statement">
        <p>
          לא חדש. לא נקי מדי.
          <br />
          <strong>וזה כל הקסם.</strong>
        </p>
      </section>
    </main>
  );
}
