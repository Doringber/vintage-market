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
        <span className="actionLabelFull">מועדפים</span>
        <span className="actionLabelShort" aria-hidden="true">
          ♡
        </span>
        <span>{favoriteCount}</span>
      </Link>

      <Link
        className="buttonSecondary actionLink"
        href="/cart"
        aria-label={`סל קניות, ${cartCount} פריטים`}
      >
        <span className="actionLabelFull">סל</span>
        <span className="actionLabelShort" aria-hidden="true">
          סל
        </span>
        <span>{cartCount}</span>
      </Link>
    </div>
  );
}
