import Link from "next/link";
import { HeaderActions } from "./header-actions";
import { MobileNav } from "./mobile-nav";
import { SearchForm } from "./search-form";
import { primaryNavigationLinks } from "../data/navigation";

export function SiteHeader() {
  return (
    <header className="headerShell">
      <div className="header">
        <MobileNav />

        <Link href="/" className="brand" aria-label="דף הבית">
          חנות קטנה ומטריפה
          <span className="brandTag">בגדים · מציאות · יד שנייה לילדים</span>
        </Link>

        <nav className="mainNav" aria-label="ניווט ראשי">
          {primaryNavigationLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="headerTools">
          <SearchForm className="headerSearch" />
          <HeaderActions />
        </div>
      </div>
    </header>
  );
}
