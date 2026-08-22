"use client";

import { useEffect } from "react";
import { useStore } from "./store-context";

export function ClearCartOnSuccess() {
  const { clearCart } = useStore();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}
