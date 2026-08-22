import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="siteFooter">
      <section>
        <div className="brand">חנות קטנה ומטריפה</div>
        <p className="footerText">
          חנות יד שנייה מגניבה לילדים - בגדים, מציאות ושאר דברים במחירים
          שפויים.
        </p>
      </section>

      <section>
        <h3>דפים חשובים</h3>
        <div className="footerLinks">
          <Link href="/about">אודות</Link>
          <Link href="/delivery">משלוחים והחזרות</Link>
          <Link href="/who-we-are">מי אנחנו</Link>
          <Link href="/products">מוצרים</Link>
          <Link href="/favorites">מועדפים</Link>
          <Link href="/cart">סל קניות</Link>
        </div>
      </section>

      <section>
        <h3>בואו לעקוב</h3>
        <p className="footerText">המציאות החדשות עולות קודם באינסטגרם.</p>
        <Link className="button buttonSecondary" href="/instagram">
          לעמוד אינסטגרם
        </Link>
      </section>

      <small>
        הפריטים נמכרים כפי שהם. אנחנו לא מבטיחים בדיקה, אישור וינטג׳ או
        מצב מסוים. © 2026 חנות קטנה ומטריפה
      </small>
    </footer>
  );
}
