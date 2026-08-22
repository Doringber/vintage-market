import { unstable_noStore as noStore } from "next/cache";
import { hasSupabaseAnonKey, hasSupabaseUrl } from "../../lib/catalog/backend";
import { fetchProductRows } from "../../lib/catalog/remote";
import { mapRowToCatalogProduct, readCatalogFile } from "../../lib/catalog/store";
import { getSupabaseServerClient } from "../../lib/supabase/server";
import { products as fallbackProducts, type Product } from "./products";

const fallbackImage =
  "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1400&q=90";

function hasSupabaseEnv(): boolean {
  return hasSupabaseUrl() && hasSupabaseAnonKey();
}

function toStorefrontProduct(
  product: ReturnType<typeof mapRowToCatalogProduct>,
): Product {
  return {
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: `₪${product.price}`,
    image: product.image || fallbackImage,
    images: product.images,
    description: product.description || "פריט יד שנייה לילדים.",
  };
}

export async function getProducts(): Promise<Product[]> {
  noStore();

  if (hasSupabaseEnv()) {
    try {
      const rows = await fetchProductRows(getSupabaseServerClient(), {
        listedOnly: true,
      });
      if (rows.length > 0) {
        return rows.map((row) => toStorefrontProduct(mapRowToCatalogProduct(row)));
      }
    } catch (error) {
      console.error("Failed to load products from Supabase, trying local catalog.", error);
    }
  }

  try {
    const catalog = await readCatalogFile();
    if (catalog) {
      return catalog
        .filter((product) => product.isActive && product.stock > 0)
        .map((product) => ({
          slug: product.slug,
          name: product.name,
          category: product.category,
          price: `₪${product.price}`,
          image: product.image || fallbackImage,
          images: product.images,
          description: product.description,
        }));
    }
  } catch (error) {
    console.error("Failed to load local catalog.", error);
  }

  return fallbackProducts;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  noStore();

  if (hasSupabaseEnv()) {
    try {
      const rows = await fetchProductRows(getSupabaseServerClient(), {
        slug,
        listedOnly: true,
      });
      if (rows[0]) {
        return toStorefrontProduct(mapRowToCatalogProduct(rows[0]));
      }
    } catch (error) {
      console.error("Failed to load product from Supabase by slug.", error);
    }
  }

  try {
    const catalog = await readCatalogFile();
    const product = catalog?.find(
      (item) => item.slug === slug && item.isActive && item.stock > 0,
    );
    if (product) {
      return {
        slug: product.slug,
        name: product.name,
        category: product.category,
        price: `₪${product.price}`,
        image: product.image || fallbackImage,
        images: product.images,
        description: product.description,
      };
    }
  } catch (error) {
    console.error("Failed to load local catalog product.", error);
  }

  return fallbackProducts.find((product) => product.slug === slug) ?? null;
}
