import Link from "next/link";
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
            <Link
              className="imageWrap"
              href={`/products/${product.slug}`}
              style={{ backgroundImage: `url(${product.image})` }}
            >
              <span className="heart" aria-label={`הוספה למועדפים: ${product.name}`}>
                ♡
              </span>
            </Link>
            <div className="cardMeta">
              <div>
                <span>{product.category}</span>
                <h3>
                  <Link href={`/products/${product.slug}`}>{product.name}</Link>
                </h3>
                <p>{product.description}</p>
              </div>
              <strong>{product.price}</strong>
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
