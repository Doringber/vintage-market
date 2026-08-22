export function createProductSlug(name: string): string {
  const cleaned = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0590-\u05FF-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (cleaned.length >= 2) {
    return cleaned.slice(0, 80);
  }

  return `item-${Date.now()}`;
}
