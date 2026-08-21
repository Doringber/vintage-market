export type Product = {
  slug: string;
  name: string;
  category: string;
  price: string;
  image: string;
  description: string;
};

export const products: Product[] = [
  {
    slug: "french-ceramic-vase-1960",
    name: "אגרטל קרמיקה צרפתי, שנות ה־60",
    category: "לבית",
    price: "₪185",
    image:
      "https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=900&q=85",
    description:
      "קרמיקה מקורית עם גוון חם ומרקם עדין. מתאים לפינה בסלון או לשולחן אוכל.",
  },
  {
    slug: "denim-jacket-80s",
    name: "ג׳קט ג׳ינס משופשף, אייטיז מקורי",
    category: "אופנה",
    price: "₪240",
    image:
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=900&q=85",
    description:
      "גזרה קלאסית עם אופי, ג׳ינס רך ונוח. פריט וינטג׳ אמיתי עם נוכחות.",
  },
  {
    slug: "transistor-radio-japan-1974",
    name: "רדיו טרנזיסטור עובד, יפן 1974",
    category: "אספנות",
    price: "₪320",
    image:
      "https://images.unsplash.com/photo-1594784052785-1d6a2e0e7a18?auto=format&fit=crop&w=900&q=85",
    description:
      "פריט אספנות נדיר שעובד, עם צליל חם ונוכחות של פעם. כולל כבל מקורי.",
  },
  {
    slug: "handmade-leather-bag-1979",
    name: "תיק עור בעבודת יד, תל אביב 1979",
    category: "אקססוריז",
    price: "₪210",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85",
    description:
      "עור איכותי בגוון עמוק, תפרים חזקים וסטייל ישראלי ישן שלא יוצא מהאופנה.",
  },
];
