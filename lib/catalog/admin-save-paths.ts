import { revalidatePath } from "next/cache";

export function revalidateStorefront(slug?: string): void {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  if (slug) {
    revalidatePath(`/products/${slug}`);
    revalidatePath(`/admin/products/${slug}`);
  }
}
