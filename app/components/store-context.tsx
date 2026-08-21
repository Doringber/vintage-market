"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type StoredProduct = {
  slug: string;
  name: string;
  price: string;
  image: string;
  category: string;
};

type CartItem = {
  slug: string;
  qty: number;
};

type StoreContextValue = {
  favorites: string[];
  cart: CartItem[];
  cartProducts: Record<string, StoredProduct>;
  favoriteCount: number;
  cartCount: number;
  isFavorite: (slug: string) => boolean;
  toggleFavorite: (slug: string) => void;
  addToCart: (product: StoredProduct) => void;
  removeFromCart: (slug: string) => void;
  updateCartQty: (slug: string, qty: number) => void;
  clearCart: () => void;
};

const FAVORITES_KEY = "vintage-market-favorites";
const CART_KEY = "vintage-market-cart";
const CART_PRODUCTS_KEY = "vintage-market-cart-products";

const StoreContext = createContext<StoreContextValue | null>(null);

type StoreProviderProps = {
  children: React.ReactNode;
};

export function StoreProvider({ children }: StoreProviderProps) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartProducts, setCartProducts] = useState<Record<string, StoredProduct>>({});

  useEffect(() => {
    const savedFavorites = window.localStorage.getItem(FAVORITES_KEY);
    const savedCart = window.localStorage.getItem(CART_KEY);
    const savedCartProducts = window.localStorage.getItem(CART_PRODUCTS_KEY);

    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites) as string[]);
    }
    if (savedCart) {
      setCart(JSON.parse(savedCart) as CartItem[]);
    }
    if (savedCartProducts) {
      setCartProducts(JSON.parse(savedCartProducts) as Record<string, StoredProduct>);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    window.localStorage.setItem(CART_PRODUCTS_KEY, JSON.stringify(cartProducts));
  }, [cartProducts]);

  const value = useMemo<StoreContextValue>(() => {
    function isFavorite(slug: string): boolean {
      return favorites.includes(slug);
    }

    function toggleFavorite(slug: string): void {
      setFavorites((prev) =>
        prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug],
      );
    }

    function addToCart(product: StoredProduct): void {
      setCartProducts((prev) => ({ ...prev, [product.slug]: product }));
      setCart((prev) => {
        const existing = prev.find((item) => item.slug === product.slug);
        if (existing) {
          return prev.map((item) =>
            item.slug === product.slug ? { ...item, qty: item.qty + 1 } : item,
          );
        }
        return [...prev, { slug: product.slug, qty: 1 }];
      });
    }

    function removeFromCart(slug: string): void {
      setCart((prev) => prev.filter((item) => item.slug !== slug));
    }

    function updateCartQty(slug: string, qty: number): void {
      const safeQty = Number.isFinite(qty) ? Math.max(1, Math.round(qty)) : 1;
      setCart((prev) =>
        prev.map((item) => (item.slug === slug ? { ...item, qty: safeQty } : item)),
      );
    }

    function clearCart(): void {
      setCart([]);
    }

    return {
      favorites,
      cart,
      cartProducts,
      favoriteCount: favorites.length,
      cartCount: cart.reduce((sum, item) => sum + item.qty, 0),
      isFavorite,
      toggleFavorite,
      addToCart,
      removeFromCart,
      updateCartQty,
      clearCart,
    };
  }, [favorites, cart, cartProducts]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return context;
}
