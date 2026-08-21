import Link from "next/link";

const highlights = [
  "סטוריז יומיים על פריטים חדשים",
  "מאחורי הקלעים של ציד הוינטג׳",
  "הטבות לעוקבים בלבד",
];

export default function InstagramPage() {
  return (
    <main className="contentPage">
      <h1>האינסטגרם שלנו</h1>
      <p>
        רוצים להיות ראשונים לראות מה חדש? עקבו אחרינו באינסטגרם וקבלו עדכונים
        חיים מהחנות.
      </p>

      <section className="contentBox">
        <h2>@vintage_small_crazy_shop</h2>
        <ul>
          {highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Link
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
          className="button"
        >
          מעבר לאינסטגרם
        </Link>
      </section>
    </main>
  );
}
