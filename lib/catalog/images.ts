import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSupabaseAdminClient } from "../supabase/admin";
import { canUseRemoteCatalog, isEphemeralHost } from "./backend";
import { inspectProductImage } from "./image-kind";

const PRODUCT_IMAGES_BUCKET = "product-images";

function imageExtension(file: File): string {
  return inspectProductImage(file).extension;
}

export function assertValidProductImage(file: File): void {
  inspectProductImage(file);
}

async function saveLocalProductImage(file: File, slug: string): Promise<string> {
  const extension = imageExtension(file);
  const fileName = `${slug}-${Date.now()}.${extension}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const bytes = new Uint8Array(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, fileName), bytes);
  return `/uploads/${fileName}`;
}

async function saveRemoteProductImage(file: File, slug: string): Promise<string> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error("חסר מפתח Supabase לשמירת תמונות בענן.");
  }

  const extension = imageExtension(file);
  const objectPath = `${slug}/${Date.now()}.${extension}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(objectPath, bytes, {
      contentType: file.type || `image/${extension === "jpg" ? "jpeg" : extension}`,
      upsert: false,
    });

  if (error) {
    throw new Error(`לא הצלחנו להעלות תמונה לענן: ${error.message}`);
  }

  const { data } = supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(objectPath);
  return data.publicUrl;
}

export async function saveProductImage(
  file: File | null,
  slug: string,
): Promise<string | null> {
  if (!file || file.size === 0) {
    return null;
  }

  assertValidProductImage(file);

  if (canUseRemoteCatalog()) {
    return saveRemoteProductImage(file, slug);
  }

  if (isEphemeralHost()) {
    throw new Error(
      "באתר החי אי אפשר לשמור קובץ על השרת. חברו Supabase Storage או הדביקו קישור לתמונה.",
    );
  }

  return saveLocalProductImage(file, slug);
}
