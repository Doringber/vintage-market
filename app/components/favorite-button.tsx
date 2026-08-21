"use client";

import { useStore } from "./store-context";

type FavoriteButtonProps = {
  slug: string;
  name: string;
  className?: string;
};

export function FavoriteButton({ slug, name, className }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useStore();
  const favorite = isFavorite(slug);

  return (
    <button
      className={className}
      type="button"
      aria-label={favorite ? `הסרה ממועדפים: ${name}` : `הוספה למועדפים: ${name}`}
      onClick={() => toggleFavorite(slug)}
    >
      {favorite ? "♥" : "♡"}
    </button>
  );
}
