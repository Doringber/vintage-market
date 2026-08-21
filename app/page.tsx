const products = [
  { name: "קערת עץ וינטג׳", category: "לבית", price: "₪85", image: "https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=900&q=85" },
  { name: "מעיל ג׳ינס משנות ה־90", category: "נשים", price: "₪140", image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=900&q=85" },
  { name: "צעצוע עץ ישן", category: "צעצועים", price: "₪45", image: "https://images.unsplash.com/photo-1594784052785-1d6a2e0e7a18?auto=format&fit=crop&w=900&q=85" },
  { name: "תיק עור קלאסי", category: "אקססוריז", price: "₪190", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85" },
];

const categories = ["נשים", "גברים", "ילדים", "צעצועים", "לבית", "וינטג׳", "אקססוריז"];

export default function Home() {
  return (
    <main>
      <header className="header">
        <div className="brand">שנית<span>׳</span></div>
        <nav>
          {categories.slice(0, 5).map((category) => <a key={category} href="#shop">{category}</a>)}
        </nav>
        <div className="actions"><button aria-label="חיפוש">⌕</button><button aria-label="סל">סל (0)</button></div>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">יד שנייה · וינטג׳ · פריטים מיוחדים</p>
          <h1>דברים עם<br /><em>סיפור.</em></h1>
          <p className="heroText">אוסף קטן של בגדים, צעצועים וחפצים יפים שקיבלו חיים חדשים.</p>
          <a className="button" href="#shop">לכל הפריטים</a>
        </div>
        <div className="heroImage" aria-label="תמונה של פריטי וינטג׳" />
      </section>

      <section className="intro" id="shop">
        <div>
          <p className="eyebrow">נבחר בקפידה</p>
          <h2>חדש באתר</h2>
        </div>
        <a href="#all">לכל הפריטים ←</a>
      </section>

      <section className="grid">
        {products.map((product, index) => (
          <article className={`card card-${index}`} key={product.name}>
            <div className="imageWrap" style={{ backgroundImage: `url(${product.image})` }}>
              <button className="heart" aria-label={`הוספה למועדפים: ${product.name}`}>♡</button>
            </div>
            <div className="cardMeta">
              <div><span>{product.category}</span><h3>{product.name}</h3></div>
              <strong>{product.price}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="statement">
        <p>לא חדש. לא מושלם.<br /><strong>בדיוק בגלל זה.</strong></p>
      </section>

      <footer>
        <div className="brand">שנית<span>׳</span></div>
        <div><a href="#about">אודות</a><a href="#shipping">משלוחים והחזרות</a><a href="#contact">צרו קשר</a></div>
        <small>© 2026 שנית — כל הזכויות שמורות</small>
      </footer>
    </main>
  );
}
