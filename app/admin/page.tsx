import { redirect } from "next/navigation";
import { hasAdminPassword, isAdminAuthenticated } from "../../lib/admin/auth";
import { AdminLoginForm } from "./login-form";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin/products");
  }

  return (
    <main className="contentPage">
      <h1>כניסת אדמין</h1>
      <p>כאן עורכים מוצרים, כותרות, מידע ותמונות. העמוד לא מופיע בתפריט הציבורי.</p>
      {hasAdminPassword() ? (
        <AdminLoginForm />
      ) : (
        <section className="contentBox">
          <h2>צריך סיסמה</h2>
          <p>
            הוסיפו <code>ADMIN_PASSWORD</code> לקובץ <code>.env.local</code> והריצו
            מחדש את האתר.
          </p>
        </section>
      )}
    </main>
  );
}
