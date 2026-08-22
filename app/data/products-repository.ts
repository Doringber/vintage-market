import { unstable_noStore as noStore } from "next/cache";
import { mapRowToCatalogProduct, readCatalogFile } from "../../lib/catalog/store";
import { hasSupabaseAnonKey, hasSupabaseUrl } from "../../lib/catalog/backend";
import { getSupabaseServerClient } from "../../lib/supabase/server";
import { products as fallbackProducts, type Product } from "./products";

type ProductRow = {
  slug: string;
  name: string;
  category: string;
  price: number | string;
  image_url: string | null;
  images?: string[] | null;
  description: string | null;
  stock: number | null;
  is_active: boolean | null;
};

const fallbackImage =
  "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1400&q=90";

function hasSupabaseEnv(): boolean {
  return hasSupabaseUrl() && hasSupabaseAnonKey();
}

function toStorefrontProduct(row: ProductRow): Product {
  const product = mapRowToCatalogProduct(row);
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
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from("products")
        .select("slug, name, category, price, image_url, images, description, stock, is_active")
        .eq("is_active", true)
        .gt("stock", 0)
        .order("created_at", { ascending: false });

      if (error || !data) {
        throw error ?? new Error("No products returned from Supabase");
      }

      return data.map(toStorefrontProduct);
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
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from("products")
        .select("slug, name, category, price, image_url, images, description, stock, is_active")
        .eq("slug", slug)
        .eq("is_active", true)
        .gt("stock", 0)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? toStorefrontProduct(data) : null;
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
