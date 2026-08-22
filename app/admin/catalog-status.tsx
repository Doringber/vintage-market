import { getCatalogStatus } from "../../lib/catalog/backend";

export function CatalogStatusNote() {
  const status = getCatalogStatus();

  if (status.backend === "remote") {
    return (
      <section className="contentBox adminStatus">
        <h2>הניהול מחובר לקטלוג</h2>
        <p>
          החנות כבר קוראת מ-Supabase. מפתח הכתיבה גם מוגדר, אז שמירת מוצרים
          מהאדמין מתעדכנת בחנות לכולם.
        </p>
      </section>
    );
  }

  if (status.hasSupabaseRead && !status.hasServiceRole) {
    return (
      <section className="contentBox adminStatus">
        <h2>החנות מחוברת, הניהול עדיין לא יכול לשמור</h2>
        <p>
          המפתחות הציבוריים כבר עובדים: הקונים רואים מוצרים מ-Supabase. זה
          חיבור לקריאה בלבד. כדי שהאדמין יוכל להוסיף ולערוך מוצרים צריך מפתח
          כתיבה נפרד, <code>SUPABASE_SERVICE_ROLE_KEY</code>, מ-Supabase →
          Settings → API. בלי זה השמירה מהאתר החי לא תחזיק.
        </p>
      </section>
    );
  }

  if (status.backend === "blocked") {
    return (
      <section className="contentBox adminStatus">
        <h2>אי אפשר לשמור כאן מוצרים</h2>
        <p>
          האתר החי בלי דיסק קבוע. חברו את Supabase ב-Vercel, כולל מפתח הכתיבה
          לניהול, ואז אפשר לערוך מהטלפון.
        </p>
      </section>
    );
  }

  return (
    <section className="contentBox adminStatus">
      <h2>שמירה מקומית בלבד</h2>
      <p>
        עכשיו המוצרים נשמרים במחשב הזה. באתר החי צריך גם מפתח כתיבה ל-Supabase
        כדי שהאדמין ישמור לענן.
      </p>
    </section>
  );
}
