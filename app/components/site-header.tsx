import Link from "next/link";
import { navigationLinks } from "../data/navigation";

export function SiteHeader() {
  return (
    <header className="headerShell">
      <div className="header">
        <Link href="/" className="brand" aria-label="דף הבית">
          חנות קטנה ומטריפה
          <span className="brandTag">וינטג׳ | יד שנייה | אספנות</span>
        </Link>

        <nav className="mainNav" aria-label="ניווט ראשי">
          {navigationLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="actions">
          <button type="button" aria-label="חיפוש">
            חיפוש
          </button>
          <button type="button" aria-label="סל קניות">
            סל (0)
          </button>
          <Link className="button navCta" href="/shop">
            לקנייה
          </Link>
        </div>
      </div>
    </header>
  );
}
