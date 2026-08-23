const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export type ProductImageKind = "jpeg" | "png" | "webp" | "gif";

export type InspectedProductImage = {
  kind: ProductImageKind;
  extension: string;
};

const KIND_EXTENSION: Record<ProductImageKind, string> = {
  jpeg: "jpg",
  png: "png",
  webp: "webp",
  gif: "gif",
};

export const PRODUCT_IMAGE_ACCEPT =
  "image/jpeg,image/jpg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif";

export function inspectProductImage(file: {
  name?: string;
  type?: string;
  size: number;
}): InspectedProductImage {
  if (!file || file.size <= 0) {
    throw new Error("צריך לבחור קובץ תמונה.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("אפשר להעלות תמונת JPG, PNG, WEBP או GIF עד 4MB.");
  }

  const type = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();

  if (
    type === "image/heic" ||
    type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  ) {
    throw new Error(
      "תמונות מהאייפון בפורמט HEIC לא נפתחות באתר. שמרו כ-JPG או PNG ואז העלו.",
    );
  }

  if (
    type === "image/jpeg" ||
    type === "image/jpg" ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg")
  ) {
    return { kind: "jpeg", extension: KIND_EXTENSION.jpeg };
  }

  if (type === "image/png" || name.endsWith(".png")) {
    return { kind: "png", extension: KIND_EXTENSION.png };
  }

  if (type === "image/webp" || name.endsWith(".webp")) {
    return { kind: "webp", extension: KIND_EXTENSION.webp };
  }

  if (type === "image/gif" || name.endsWith(".gif")) {
    return { kind: "gif", extension: KIND_EXTENSION.gif };
  }

  throw new Error("אפשר להעלות תמונת JPG, PNG, WEBP או GIF עד 4MB.");
}
