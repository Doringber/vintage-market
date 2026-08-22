import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { products as fallbackProducts } from "../../app/data/products";
import { parseShekels } from "../commerce/money";
import { getSupabaseAdminClient } from "../supabase/admin";
import { canUseRemoteCatalog, isEphemeralHost } from "./backend";
import type { CatalogProduct } from "./types";

const CATALOG_PATH = path.join(process.cwd(), "data", "catalog.json");

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

function toProductRow(product: CatalogProduct): ProductRow {
  return {
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: product.price,
    image_url: product.image,
    images: product.images,
    description: product.description,
    stock: product.stock,
    is_active: product.isActive,
  };
}

export function mapRowToCatalogProduct(row: ProductRow): CatalogProduct {
  const extraImages = Array.isArray(row.images)
    ? row.images.filter((item) => item.trim().length > 0)
    : [];

  return normalizeProduct({
    slug: row.slug,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    image: row.image_url ?? "",
    images: extraImages,
    description: row.description ?? "",
    stock: row.stock ?? 0,
    isActive: row.is_active ?? false,
  });
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

async function writeLocalCatalog(products: CatalogProduct[]): Promise<void> {
  const normalized = products.map(normalizeProduct);
  await mkdir(path.dirname(CATALOG_PATH), { recursive: true });
  await writeFile(CATALOG_PATH, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
}

async function writeLocalCatalogQuietly(products: CatalogProduct[]): Promise<void> {
  try {
    await writeLocalCatalog(products);
  } catch {
    // Local disk is only a cache. Remote writes should still succeed.
  }
}

async function readRemoteCatalog(): Promise<CatalogProduct[] | null> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("products")
    .select("slug, name, category, price, image_url, images, description, stock, is_active")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`לא הצלחנו לקרוא את הקטלוג מהענן: ${error.message}`);
  }

  return (data ?? []).map(mapRowToCatalogProduct);
}

async function upsertRemoteProduct(product: CatalogProduct): Promise<void> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error("חסר SUPABASE_SERVICE_ROLE_KEY לשמירה מרחוק.");
  }

  const { error } = await supabase
    .from("products")
    .upsert(toProductRow(product), { onConflict: "slug" });

  if (error) {
    throw new Error(`לא הצלחנו לשמור את המוצר בענן: ${error.message}`);
  }
}

export async function readCatalog(): Promise<CatalogProduct[]> {
  if (canUseRemoteCatalog()) {
    return (await readRemoteCatalog()) ?? [];
  }

  return (await readCatalogFile()) ?? fromFallback();
}

export async function writeCatalog(products: CatalogProduct[]): Promise<void> {
  const normalized = products.map(normalizeProduct);

  if (canUseRemoteCatalog()) {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      throw new Error("חסר SUPABASE_SERVICE_ROLE_KEY לשמירה מרחוק.");
    }

    const { error } = await supabase
      .from("products")
      .upsert(normalized.map(toProductRow), { onConflict: "slug" });
    if (error) {
      throw new Error(`לא הצלחנו לשמור את הקטלוג בענן: ${error.message}`);
    }
    await writeLocalCatalogQuietly(normalized);
    return;
  }

  if (isEphemeralHost()) {
    throw new Error(
      "באתר החי הקבצים נמחקים אחרי כל פריסה. הוסיפו SUPABASE_SERVICE_ROLE_KEY כדי לערוך מוצרים מהטלפון.",
    );
  }

  await writeLocalCatalog(normalized);
}

export async function upsertCatalogProduct(
  product: CatalogProduct,
): Promise<CatalogProduct> {
  const next = normalizeProduct(product);

  if (canUseRemoteCatalog()) {
    await upsertRemoteProduct(next);
    const current = (await readCatalogFile()) ?? [];
    const index = current.findIndex((item) => item.slug === next.slug);
    if (index >= 0) {
      current[index] = next;
    } else {
      current.unshift(next);
    }
    await writeLocalCatalogQuietly(current);
    return next;
  }

  const catalog = await readCatalog();
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
  if (canUseRemoteCatalog()) {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from("products")
      .select("slug, name, category, price, image_url, images, description, stock, is_active")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw new Error(`לא הצלחנו לקרוא את המוצר מהענן: ${error.message}`);
    }

    return data ? mapRowToCatalogProduct(data) : null;
  }

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
