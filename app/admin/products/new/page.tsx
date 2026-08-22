import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "../../../../lib/admin/auth";
import { ProductForm } from "../product-form";

export default async function NewAdminProductPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  return (
    <main className="contentPage">
      <Link href="/admin/products" className="backLink">
        חזרה לכל המוצרים
      </Link>
      <h1>מוצר חדש</h1>
      <p>מלאו כותרת, מידע ותמונה. אפשר להעלות קובץ או להדביק קישור.</p>
      <ProductForm />
    </main>
  );
}
