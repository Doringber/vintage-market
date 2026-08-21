import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="siteFooter">
      <section>
        <div className="brand">חנות קטנה ומטריפה</div>
        <p className="footerText">
          פריטי וינטג׳ מיוחדים עם אופי, סיפור ואהבה לעיצוב ישראלי.
        </p>
      </section>

      <section>
        <h3>דפים חשובים</h3>
        <div className="footerLinks">
          <Link href="/about">אודות</Link>
          <Link href="/delivery">משלוחים והחזרות</Link>
          <Link href="/who-we-are">מי אנחנו</Link>
          <Link href="/products">מוצרים</Link>
        </div>
      </section>

      <section>
        <h3>בואו לעקוב</h3>
        <p className="footerText">כל הפריטים החדשים עולים קודם באינסטגרם.</p>
        <Link className="button buttonSecondary" href="/instagram">
          לעמוד אינסטגרם
        </Link>
      </section>

      <small>© 2026 חנות קטנה ומטריפה - כל הזכויות שמורות</small>
    </footer>
  );
}
