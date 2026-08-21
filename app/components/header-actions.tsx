"use client";

import Link from "next/link";
import { useStore } from "./store-context";

export function HeaderActions() {
  const { cartCount, favoriteCount } = useStore();

  return (
    <div className="actions">
      <Link className="buttonSecondary actionLink" href="/search">
        חיפוש
      </Link>

      <Link className="buttonSecondary actionLink" href="/favorites">
        מועדפים {favoriteCount}
      </Link>

      <Link className="buttonSecondary actionLink" href="/cart">
        סל {cartCount}
      </Link>
    </div>
  );
}
