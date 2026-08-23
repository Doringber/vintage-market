import type { CatalogProduct } from "./types";

export type ParsedAdminProductFields = {
  existingSlug: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  isActive: boolean;
};

export function collectImageUrls(formData: FormData): string[] {
  return formData
    .getAll("imageUrls")
    .map((value) => String(value).trim())
    .filter((value) => value.length > 0);
}

export function asUploadedFile(
  value: FormDataEntryValue | null | undefined,
): File | null {
  if (!value || typeof value === "string") {
    return null;
  }

  const candidate = value as File;
  if (typeof candidate.size !== "number" || candidate.size <= 0) {
    return null;
  }

  return candidate;
}

export function parseAdminProductFields(
  formData: FormData,
): ParsedAdminProductFields | { error: string } {
  const existingSlug = String(formData.get("slug") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const isActive = formData.get("isActive") === "on";

  if (name.length < 2) {
    return { error: "צריך כותרת למוצר." };
  }

  if (!Number.isFinite(price) || price < 0) {
    return { error: "צריך מחיר תקין." };
  }

  return {
    existingSlug,
    name,
    category,
    description,
    price,
    stock: Number.isFinite(stock) ? stock : 1,
    isActive,
  };
}

export function resolveProductImages(input: {
  uploadedMain: string | null;
  imageUrls: string[];
  uploadedExtras: string[];
  existing: CatalogProduct | null;
}): { image: string; images: string[] } | { error: string } {
  const image =
    input.uploadedMain ?? input.imageUrls[0] ?? input.existing?.image ?? "";
  const images = [
    ...input.imageUrls.filter((url) => url !== image),
    ...input.uploadedExtras,
    ...(input.existing?.images ?? []).filter(
      (url) => url !== image && !input.imageUrls.includes(url),
    ),
  ];

  if (!image) {
    return { error: "צריך תמונה: להעלות קובץ או להדביק קישור." };
  }

  return { image, images };
}
