import { unstable_noStore as noStore } from "next/cache";
import { readCatalogFile } from "../../lib/catalog/store";
import { getSupabaseServerClient } from "../../lib/supabase/server";
import { products as fallbackProducts, type Product } from "./products";

type ProductRow = {
  slug: string;
  name: string;
  category: string;
  price: number;
  image_url: string | null;
  description: string | null;
  stock: number | null;
  is_active: boolean | null;
};

const fallbackImage =
  "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1400&q=90";

function resolveProductImage(row: ProductRow): string {
  if (row.image_url?.trim()) {
    return row.image_url.trim();
  }

  return fallbackImage;
}

function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function mapRowToProduct(row: ProductRow): Product {
  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    price: `₪${row.price}`,
    image: resolveProductImage(row),
    description: row.description ?? "פריט יד שנייה לילדים.",
  };
}

export async function getProducts(): Promise<Product[]> {
  noStore();

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

  if (!hasSupabaseEnv()) {
    return fallbackProducts;
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("slug, name, category, price, image_url, description, stock, is_active")
      .eq("is_active", true)
      .gt("stock", 0)
      .order("created_at", { ascending: false });

    if (error || !data) {
      throw error ?? new Error("No products returned from Supabase");
    }

    return data.map(mapRowToProduct);
  } catch (error) {
    console.error("Failed to load products from Supabase, using fallback data.", error);
    return fallbackProducts;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  noStore();

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

  if (!hasSupabaseEnv()) {
    return fallbackProducts.find((product) => product.slug === slug) ?? null;
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("slug, name, category, price, image_url, description, stock, is_active")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return mapRowToProduct(data);
  } catch (error) {
    console.error("Failed to load product from Supabase by slug.", error);
    return fallbackProducts.find((product) => product.slug === slug) ?? null;
  }
}
