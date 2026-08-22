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

  const password = String(formData.get("password") ?? "");
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

async function saveUploadedImage(file: File, slug: string): Promise<string | null> {
  return saveProductImage(file, slug);
}

function collectImageUrls(formData: FormData): string[] {
  return formData
    .getAll("imageUrls")
    .map((value) => String(value).trim())
    .filter((value) => value.length > 0);
}

export async function saveAdminProduct(formData: FormData): Promise<{ error: string } | void> {
  await requireAdmin();

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

  const slug = existingSlug || createProductSlug(name);
  const existing = existingSlug ? await getCatalogProduct(existingSlug) : null;
  const imageUrls = collectImageUrls(formData);

  try {
    const uploadedMain = await saveUploadedImage(
      formData.get("imageFile") as File,
      slug,
    );
    const extraFiles = formData.getAll("extraImageFiles") as File[];
    const uploadedExtras: string[] = [];
    for (const file of extraFiles) {
      const saved = await saveUploadedImage(file, slug);
      if (saved) {
        uploadedExtras.push(saved);
      }
    }

    const image = uploadedMain ?? imageUrls[0] ?? existing?.image ?? "";
    const images = [
      ...imageUrls.filter((url) => url !== image),
      ...uploadedExtras,
      ...(existing?.images ?? []).filter(
        (url) => url !== image && !imageUrls.includes(url),
      ),
    ];

    if (!image) {
      return { error: "צריך תמונה: להעלות קובץ או להדביק קישור." };
    }

    const product: CatalogProduct = {
      slug,
      name,
      category: category || "דברי ילדים",
      price,
      image,
      images,
      description,
      stock: Number.isFinite(stock) ? stock : 1,
      isActive,
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

