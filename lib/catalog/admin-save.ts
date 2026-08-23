import {
  asUploadedFile,
  collectImageUrls,
  parseAdminProductFields,
  resolveProductImages,
} from "./admin-form";
import { saveProductImage } from "./images";
import { createProductSlug } from "./slug";
import { getCatalogProduct, upsertCatalogProduct } from "./store";
import type { CatalogProduct } from "./types";

export type AdminProductSaveResult =
  | { error: string }
  | { slug: string; name: string };

function missingImageError(formData: FormData): string {
  const selected =
    formData.get("imageFileSelected") === "1" ||
    formData.get("extraImageFilesSelected") === "1";
  if (selected) {
    return "הקובץ לא הגיע לשרת. נסי תמונה קטנה יותר, עד 4MB, או הדביקי קישור.";
  }
  return "צריך תמונה: להעלות קובץ או להדביק קישור.";
}

export async function saveAdminProductRecord(
  formData: FormData,
): Promise<AdminProductSaveResult> {
  const parsed = parseAdminProductFields(formData);
  if ("error" in parsed) {
    return parsed;
  }

  const slug = parsed.existingSlug || createProductSlug(parsed.name);
  const existing = parsed.existingSlug
    ? await getCatalogProduct(parsed.existingSlug)
    : null;
  const imageUrls = collectImageUrls(formData);

  const uploadedMain = await saveProductImage(
    asUploadedFile(formData.get("imageFile")),
    slug,
  );
  const uploadedExtras: string[] = [];
  for (const value of formData.getAll("extraImageFiles")) {
    const saved = await saveProductImage(asUploadedFile(value), slug);
    if (saved) {
      uploadedExtras.push(saved);
    }
  }

  const images = resolveProductImages({
    uploadedMain,
    imageUrls,
    uploadedExtras,
    existing,
  });
  if ("error" in images) {
    return { error: missingImageError(formData) };
  }

  const product: CatalogProduct = {
    slug,
    name: parsed.name,
    category: parsed.category || "דברי ילדים",
    price: parsed.price,
    image: images.image,
    images: images.images,
    description: parsed.description,
    stock: parsed.stock,
    isActive: parsed.isActive,
  };

  await upsertCatalogProduct(product);
  return { slug: product.slug, name: product.name };
}
