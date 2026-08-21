import Link from "next/link";
import { HeaderActions } from "./header-actions";
import { primaryNavigationLinks } from "../data/navigation";

export function SiteHeader() {
  return (
    <header className="headerShell">
      <div className="header">
        <Link href="/" className="brand" aria-label="דף הבית">
          חנות קטנה ומטריפה
          <span className="brandTag">וינטג׳ | יד שנייה | אספנות</span>
        </Link>

        <nav className="mainNav" aria-label="ניווט ראשי">
          {primaryNavigationLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <HeaderActions />
      </div>
    </header>
  );
}
