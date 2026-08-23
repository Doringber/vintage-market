import type { SupabaseClient } from "@supabase/supabase-js";

export const PRODUCT_IMAGES_BUCKET = "product-images";

type StorageErrorLike = {
  message?: string;
  statusCode?: string | number;
  error?: string;
  name?: string;
};

function errorText(error: StorageErrorLike | null | undefined): string {
  return `${error?.message ?? ""} ${error?.error ?? ""} ${error?.statusCode ?? ""} ${error?.name ?? ""}`
    .toLowerCase()
    .trim();
}

export function isMissingStorageBucket(
  error: StorageErrorLike | null | undefined,
): boolean {
  const haystack = errorText(error);
  return (
    haystack.includes("bucket not found") ||
    haystack.includes("not found") && haystack.includes("bucket")
  );
}

export function isExistingStorageBucket(
  error: StorageErrorLike | null | undefined,
): boolean {
  const haystack = errorText(error);
  return (
    haystack.includes("already exists") ||
    haystack.includes("duplicate") ||
    String(error?.statusCode) === "409"
  );
}

export async function ensureProductImagesBucket(
  supabase: SupabaseClient,
): Promise<void> {
  const existing = await supabase.storage.getBucket(PRODUCT_IMAGES_BUCKET);
  if (!existing.error && existing.data) {
    if (existing.data.public === false) {
      const updated = await supabase.storage.updateBucket(PRODUCT_IMAGES_BUCKET, {
        public: true,
      });
      if (updated.error) {
        throw new Error(
          `תיקיית התמונות קיימת ב-Supabase אבל לא פתוחה לצפייה: ${updated.error.message}`,
        );
      }
    }
    return;
  }

  const created = await supabase.storage.createBucket(PRODUCT_IMAGES_BUCKET, {
    public: true,
    fileSizeLimit: 4 * 1024 * 1024,
  });

  if (created.error && !isExistingStorageBucket(created.error)) {
    throw new Error(
      `אין תיקיית תמונות ב-Supabase בשם product-images. ניסינו ליצור אותה ולא הצלחנו: ${created.error.message}`,
    );
  }
}
