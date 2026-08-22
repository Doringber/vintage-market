import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdminAuthenticated } from "../../../../lib/admin/auth";
import { getCatalogProduct } from "../../../../lib/catalog/store";
import { ProductForm } from "../product-form";

type EditProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditAdminProductPage({
  params,
}: EditProductPageProps) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const { slug } = await params;
  const product = await getCatalogProduct(slug);
  if (!product) {
    notFound();
  }

  return (
    <main className="contentPage">
      <Link href="/admin/products" className="backLink">
        חזרה לכל המוצרים
      </Link>
      <h1>עריכת מוצר</h1>
      <p>אפשר לשנות כותרת, מידע, מחיר ותמונות. השמירה מתעדכנת בחנות מיד.</p>
      <ProductForm product={product} />
    </main>
  );
}
