"use client";

import Link from "next/link";
import { useStore } from "./store-context";

export function HeaderActions() {
  const { cartCount, favoriteCount } = useStore();

  return (
    <div className="actions">
      <Link
        className="buttonSecondary actionLink"
        href="/favorites"
        aria-label={`מועדפים, ${favoriteCount} פריטים`}
      >
        מועדפים {favoriteCount}
      </Link>

      <Link
        className="buttonSecondary actionLink"
        href="/cart"
        aria-label={`סל קניות, ${cartCount} פריטים`}
      >
        סל {cartCount}
      </Link>
    </div>
  );
}
