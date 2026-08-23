const MAX_EDGE = 1600;
const TARGET_QUALITY = 0.84;
const SKIP_IF_SMALLER_THAN = 800_000;

function replaceExtension(name: string, extension: string): string {
  return name.replace(/\.[^.]+$/, "") + `.${extension}`;
}

export async function compressImageForUpload(file: File): Promise<File> {
  if (
    file.size > 0 &&
    file.size <= SKIP_IF_SMALLER_THAN &&
    (file.type === "image/jpeg" || file.type === "image/webp")
  ) {
    return file;
  }

  if (typeof createImageBitmap !== "function" || typeof document === "undefined") {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return file;
  }

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", TARGET_QUALITY);
  });

  if (!blob || blob.size === 0) {
    return file;
  }

  return new File([blob], replaceExtension(file.name, "jpg"), {
    type: "image/jpeg",
  });
}
