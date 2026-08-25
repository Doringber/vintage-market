export type PlaceType = "sell" | "give" | "both";

export type PlaceCategory =
  | "clothes"
  | "furniture"
  | "books"
  | "toys"
  | "general";

export type SecondHandPlace = {
  slug: string;
  name: string;
  placeType: PlaceType;
  categories: PlaceCategory[];
  address: string;
  city: string;
  lat: number;
  lng: number;
  description: string;
  phone?: string;
  hours?: string;
  source?: "wizo" | "pitchonlev" | "dandasha" | "betterbesecond" | "kan" | "custom";
  sourceUrl?: string;
};

export const placeSourceLabels: Record<
  NonNullable<SecondHandPlace["source"]>,
  string
> = {
  wizo: "ויצו",
  pitchonlev: "פתחון לב",
  dandasha: "דנדשה",
  betterbesecond: "Better Be Second",
  kan: "כאן 11",
  custom: "מקומות נוספים",
};

export const placeTypeLabels: Record<PlaceType, string> = {
  sell: "מכירה",
  give: "תרומה / חינם",
  both: "מכירה ותרומה",
};

export const categoryLabels: Record<PlaceCategory, string> = {
  clothes: "בגדים",
  furniture: "רהיטים",
  books: "ספרים",
  toys: "צעצועים",
  general: "כללי",
};

export const fallbackPlaces: SecondHandPlace[] = [
  {
    slug: "jaffa-flea-market",
    name: "שוק הפשפשים יפו",
    placeType: "sell",
    categories: ["clothes", "furniture", "general"],
    address: "שוק הפשפשים, יפו",
    city: "תל אביב-יפו",
    lat: 32.0533,
    lng: 34.7525,
    description:
      "שוק וינטג׳ ויד שנייה עם בגדים, רהיטים, תכשיטים ופריטי אספנות. מתאים לחיפוש מציאות ייחודיות.",
    hours: "יום ראשון–חמישי 10:00–18:00, שישי 10:00–14:00",
  },
  {
    slug: "gan-hair-second-hand",
    name: "חנויות יד שנייה — גן העיר",
    placeType: "both",
    categories: ["clothes", "general"],
    address: "כיכר מגן-דוד / גן העיר",
    city: "תל אביב",
    lat: 32.0722,
    lng: 34.7764,
    description:
      "מספר חנויות יד שנייה ועמותות באזור גן העיר — בגדים, ספרים ופריטים לבית במחירים נוחים.",
    hours: "שעות משתנות לפי חנות",
  },
  {
    slug: "haifa-flea-market",
    name: "שוק הפשפשים חיפה",
    placeType: "sell",
    categories: ["clothes", "furniture", "general"],
    address: "שוק תלפיות / שדרות ההסתדרות",
    city: "חיפה",
    lat: 32.8191,
    lng: 34.9983,
    description:
      "שוק יד שנייה גדול בחיפה — בגדים, רהיטים, כלי בית ופריטי וינטג׳.",
    hours: "יום ראשון–חמישי, בבוקר עד צהריים",
  },
  {
    slug: "jerusalem-second-hand",
    name: "חנויות יד שנייה — מרכז ירושלים",
    placeType: "both",
    categories: ["clothes", "books", "general"],
    address: "ירושלים, אזור העיר",
    city: "ירושלים",
    lat: 31.7857,
    lng: 35.2115,
    description:
      "חנויות יד שנייה ועמותות בירושלים — בגדים, ספרים וציוד לבית.",
    hours: "ראשון–חמישי 10:00–19:00",
  },
  {
    slug: "beer-sheva-donation",
    name: "מרכז חלוקת בגדים — באר שבע",
    placeType: "give",
    categories: ["clothes"],
    address: "באר שבע, אזור העיר",
    city: "באר שבע",
    lat: 31.2529,
    lng: 34.7915,
    description:
      "נקודת חלוקה ותרומת בגדים לקהילה. ניתן לתרום ולקבל בגדים במצב טוב.",
    phone: "08-000-0000",
    hours: "ראשון–רביעי 09:00–15:00",
  },
  {
    slug: "netanya-second-hand",
    name: "חנות יד שנייה — נתניה",
    placeType: "sell",
    categories: ["clothes", "toys", "general"],
    address: "נתניה, אזור מסחרי",
    city: "נתניה",
    lat: 32.3215,
    lng: 34.8532,
    description: "בגדים, צעצועים ופריטים לבית במחירים מוזלים.",
    hours: "ראשון–חמישי 10:00–18:00",
  },
];
