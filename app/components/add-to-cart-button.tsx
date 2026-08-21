"use client";

import { useState } from "react";
import { useStore } from "./store-context";

type AddToCartButtonProps = {
  product: {
    slug: string;
    name: string;
    price: string;
    image: string;
    category: string;
  };
  className?: string;
};

export function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const { addToCart } = useStore();
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    addToCart(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  return (
    <button className={className ?? "button"} type="button" onClick={handleAddToCart}>
      {added ? "נוסף לסל" : "הוספה לסל"}
    </button>
  );
}
