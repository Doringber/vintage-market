import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSupabaseAdminClient } from "../supabase/admin";
import { canUseRemoteCatalog, isEphemeralHost } from "./backend";

const PRODUCT_IMAGES_BUCKET = "product-images";
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export function assertValidProductImage(file: File): void {
  if (!ALLOWED_IMAGE_TYPES.has(file.type) || file.size > MAX_IMAGE_BYTES) {
    throw new Error("אפשר להעלות תמונת JPG, PNG, WEBP או GIF עד 4MB.");
  }
}

function imageExtension(file: File): string {
  const fromType = file.type.split("/")[1];
  if (fromType === "jpeg") {
    return "jpg";
  }
  return fromType || "jpg";
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
      contentType: file.type,
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
  file: File,
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
