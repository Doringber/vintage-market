"use server";

import { redirect } from "next/navigation";
import {
  clearAdminSession,
  hasAdminPassword,
  isAdminAuthenticated,
  setAdminSession,
  verifyAdminPassword,
} from "../../lib/admin/auth";
import { saveAdminProductRecord } from "../../lib/catalog/admin-save";
import { revalidateStorefront } from "../../lib/catalog/admin-save-paths";

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

export async function saveAdminProduct(formData: FormData): Promise<{ error: string } | void> {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  try {
    const result = await saveAdminProductRecord(formData);
    if ("error" in result) {
      return result;
    }
    revalidateStorefront(result.slug);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "לא הצלחנו לשמור את המוצר.";
    return { error: message };
  }

  redirect("/admin/products");
}
