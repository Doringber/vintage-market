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
      <p>
        כאן עורכים מוצרים, כותרות, מידע ותמונות. אחרי שהאתר עולה לאינטרנט, נכנסים
        מכל מכשיר לאותו עמוד עם הסיסמה שמוגדרת ב-Vercel.
      </p>
      {hasAdminPassword() ? (
        <AdminLoginForm />
      ) : (
        <section className="contentBox">
          <h2>צריך סיסמה</h2>
          <p>
            הוסיפו <code>ADMIN_PASSWORD</code> ב-Vercel לפריסה חיה, או לקובץ{" "}
            <code>.env.local</code> במחשב, והריצו מחדש.
          </p>
        </section>
      )}
    </main>
  );
}
