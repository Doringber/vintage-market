import { getCatalogStatus } from "../../lib/catalog/backend";

export function CatalogStatusNote() {
  const status = getCatalogStatus();

  if (status.backend === "remote") {
    return (
      <section className="contentBox adminStatus">
        <h2>עריכה מרחוק פעילה</h2>
        <p>
          המוצרים נשמרים בענן. אחרי שהאתר חי, נכנסים מכל מכשיר עם אותה סיסמה
          לכתובת{" "}
          {status.siteAdminUrl ? (
            <code>{status.siteAdminUrl}</code>
          ) : (
            <code>https://הדומיין-שלך/admin</code>
          )}
          .
        </p>
      </section>
    );
  }

  if (status.backend === "blocked") {
    return (
      <section className="contentBox adminStatus">
        <h2>אי אפשר לשמור כאן מוצרים</h2>
        <p>
          האתר רץ על שרת בלי דיסק קבוע. הוסיפו ב-Vercel את{" "}
          <code>NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> ו-
          <code>SUPABASE_SERVICE_ROLE_KEY</code> ואז אפשר לערוך מהטלפון.
        </p>
      </section>
    );
  }

  return (
    <section className="contentBox adminStatus">
      <h2>שמירה מקומית בלבד</h2>
      <p>
        עכשיו המוצרים נשמרים במחשב הזה. כדי לערוך מרחוק אחרי הפריסה: פתחו פרויקט
        חינמי ב-Supabase, הריצו את <code>supabase/products.sql</code>, והדביקו את
        המפתחות ב-Vercel יחד עם <code>ADMIN_PASSWORD</code>.
      </p>
    </section>
  );
}
