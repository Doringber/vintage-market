"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { primaryNavigationLinks } from "../data/navigation";

const extraLinks = [
  { href: "/delivery", label: "משלוחים והחזרות" },
  { href: "/who-we-are", label: "מי אנחנו" },
  { href: "/instagram", label: "אינסטגרם" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("navOpen");

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("navOpen");
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <div className="mobileNav">
      <button
        type="button"
        className="menuToggle"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="menuToggleText">{open ? "סגירה" : "תפריט"}</span>
      </button>

      {open ? (
        <>
          <button
            className="navBackdrop"
            type="button"
            aria-label="סגירת תפריט"
            onClick={closeMenu}
          />
          <nav id="mobile-menu" className="mobileMenu" aria-label="ניווט במובייל">
            {primaryNavigationLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={closeMenu}>
                {link.label}
              </Link>
            ))}
            {extraLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={closeMenu}>
                {link.label}
              </Link>
            ))}
          </nav>
        </>
      ) : null}
    </div>
  );
}
