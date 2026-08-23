"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearAdminSession,
  hasAdminPassword,
  isAdminAuthenticated,
  setAdminSession,
  verifyAdminPassword,
} from "../../lib/admin/auth";
import {
  asUploadedFile,
  collectImageUrls,
  parseAdminProductFields,
  resolveProductImages,
} from "../../lib/catalog/admin-form";
import { saveProductImage } from "../../lib/catalog/images";
import { createProductSlug } from "../../lib/catalog/slug";
import {
  getCatalogProduct,
  upsertCatalogProduct,
} from "../../lib/catalog/store";
import type { CatalogProduct } from "../../lib/catalog/types";

function revalidateStorefront(slug?: string): void {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  if (slug) {
    revalidatePath(`/products/${slug}`);
    revalidatePath(`/admin/products/${slug}`);
  }
}

export async function loginAdmin(formData: FormData): Promise<{ error: string } | void> {
  if (!hasAdminPassword()) {
    return {
      error:
        "צריך להגדיר ADMIN_PASSWORD בשרת (Vercel) או בקובץ .env.local במחשב.",
    };
  }

  const password = String(formData.get("password") ?? "").trim();
  if (!verifyAdminPassword(password)) {
    return { error: "סיסמה שגויה." };
  }

  await setAdminSession();
  redirect("/admin/products");
}

export async function logoutAdmin(): Promise<void> {
  await clearAdminSession();
  redirect("/admin");
}

async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }
}

export async function saveAdminProduct(formData: FormData): Promise<{ error: string } | void> {
  await requireAdmin();

  const parsed = parseAdminProductFields(formData);
  if ("error" in parsed) {
    return parsed;
  }

  const slug = parsed.existingSlug || createProductSlug(parsed.name);
  const existing = parsed.existingSlug ? await getCatalogProduct(parsed.existingSlug) : null;
  const imageUrls = collectImageUrls(formData);

  try {
    const uploadedMain = await saveProductImage(
      asUploadedFile(formData.get("imageFile")),
      slug,
    );
    const extraFiles = formData.getAll("extraImageFiles");
    const uploadedExtras: string[] = [];
    for (const value of extraFiles) {
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
      return images;
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
    revalidateStorefront(slug);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "לא הצלחנו לשמור את המוצר.";
    return { error: message };
  }

  redirect("/admin/products");
}
