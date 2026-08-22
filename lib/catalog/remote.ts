import type { SupabaseClient } from "@supabase/supabase-js";

export const PRODUCT_COLUMNS_WITH_IMAGES =
  "slug, name, category, price, image_url, images, description, stock, is_active";
export const PRODUCT_COLUMNS =
  "slug, name, category, price, image_url, description, stock, is_active";

export type ProductRow = {
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

type QueryError = {
  message?: string;
  code?: string;
};

export function isMissingImagesColumn(error: QueryError | null | undefined): boolean {
  if (!error) {
    return false;
  }

  const haystack = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();
  return haystack.includes("images") && (
    haystack.includes("column") ||
    haystack.includes("schema") ||
    haystack.includes("pgrst204") ||
    haystack.includes("does not exist")
  );
}

export function catalogErrorMessage(error: QueryError | null | undefined): string {
  const message = error?.message ?? "שגיאה לא ידועה";
  if (message.includes("does not exist") && message.includes("products")) {
    return "טבלת המוצרים עדיין לא קיימת ב-Supabase. הריצו את supabase/products.sql בעורך ה-SQL.";
  }
  return message;
}

export async function fetchProductRows(
  client: SupabaseClient,
  options: { slug?: string; listedOnly?: boolean } = {},
): Promise<ProductRow[]> {
  const run = async (columns: string) => {
    let query = client.from("products").select(columns);
    if (options.slug) {
      query = query.eq("slug", options.slug);
    }
    if (options.listedOnly) {
      query = query.eq("is_active", true).gt("stock", 0);
    }
    return query.order("created_at", { ascending: false });
  };

  const withImages = await run(PRODUCT_COLUMNS_WITH_IMAGES);
  if (!withImages.error) {
    return ((withImages.data ?? []) as unknown) as ProductRow[];
  }

  if (isMissingImagesColumn(withImages.error)) {
    const withoutImages = await run(PRODUCT_COLUMNS);
    if (!withoutImages.error) {
      return ((withoutImages.data ?? []) as unknown) as ProductRow[];
    }
    throw new Error(catalogErrorMessage(withoutImages.error));
  }

  throw new Error(catalogErrorMessage(withImages.error));
}

export async function upsertProductRow(
  client: SupabaseClient,
  row: ProductRow,
): Promise<void> {
  const withImages = await client.from("products").upsert(row, { onConflict: "slug" });
  if (!withImages.error) {
    return;
  }

  if (isMissingImagesColumn(withImages.error)) {
    const { images: _images, ...rowWithoutImages } = row;
    const withoutImages = await client
      .from("products")
      .upsert(rowWithoutImages, { onConflict: "slug" });
    if (!withoutImages.error) {
      return;
    }
    throw new Error(catalogErrorMessage(withoutImages.error));
  }

  throw new Error(catalogErrorMessage(withImages.error));
}
