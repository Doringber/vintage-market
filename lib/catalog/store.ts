import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { products as fallbackProducts } from "../../app/data/products";
import { parseShekels } from "../commerce/money";
import { getSupabaseAdminClient } from "../supabase/admin";
import type { CatalogProduct } from "./types";

const CATALOG_PATH = path.join(process.cwd(), "data", "catalog.json");

function fromFallback(): CatalogProduct[] {
  return fallbackProducts.map((product) => ({
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: parseShekels(product.price),
    image: product.image,
    images: product.images ?? [],
    description: product.description,
    stock: 1,
    isActive: true,
  }));
}

export async function readCatalogFile(): Promise<CatalogProduct[] | null> {
  try {
    const raw = await readFile(CATALOG_PATH, "utf8");
    const parsed = JSON.parse(raw) as CatalogProduct[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return null;
    }
    return parsed.map(normalizeProduct);
  } catch {
    return null;
  }
}

export async function readCatalog(): Promise<CatalogProduct[]> {
  return (await readCatalogFile()) ?? fromFallback();
}

export async function writeCatalog(products: CatalogProduct[]): Promise<void> {
  const normalized = products.map(normalizeProduct);
  await mkdir(path.dirname(CATALOG_PATH), { recursive: true });
  await writeFile(CATALOG_PATH, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  await syncCatalogToSupabase(normalized);
}

export async function upsertCatalogProduct(
  product: CatalogProduct,
): Promise<CatalogProduct> {
  const catalog = await readCatalog();
  const next = normalizeProduct(product);
  const index = catalog.findIndex((item) => item.slug === next.slug);
  if (index >= 0) {
    catalog[index] = next;
  } else {
    catalog.unshift(next);
  }
  await writeCatalog(catalog);
  return next;
}

export async function getCatalogProduct(
  slug: string,
): Promise<CatalogProduct | null> {
  const catalog = await readCatalog();
  return catalog.find((item) => item.slug === slug) ?? null;
}

function normalizeProduct(product: CatalogProduct): CatalogProduct {
  const images = Array.isArray(product.images)
    ? product.images.filter((item) => item.trim().length > 0)
    : [];
  const image = product.image.trim() || images[0] || "";

  return {
    slug: product.slug.trim(),
    name: product.name.trim(),
    category: product.category.trim(),
    price: Number.isFinite(product.price) ? product.price : 0,
    image,
    images: images.filter((item) => item !== image),
    description: product.description.trim(),
    stock: Number.isFinite(product.stock) ? Math.max(0, Math.round(product.stock)) : 0,
    isActive: Boolean(product.isActive),
  };
}

async function syncCatalogToSupabase(products: CatalogProduct[]): Promise<void> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return;
  }

  const rows = products.map((product) => ({
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: product.price,
    image_url: product.image,
    description: product.description,
    stock: product.stock,
    is_active: product.isActive,
  }));

  const { error } = await supabase.from("products").upsert(rows, { onConflict: "slug" });
  if (error) {
    console.error("Failed to sync catalog to Supabase.", error);
  }
}
