const HEBREW_TO_LATIN: Record<string, string> = {
  א: "a",
  ב: "b",
  ג: "g",
  ד: "d",
  ה: "h",
  ו: "v",
  ז: "z",
  ח: "ch",
  ט: "t",
  י: "y",
  כ: "k",
  ך: "k",
  ל: "l",
  מ: "m",
  ם: "m",
  נ: "n",
  ן: "n",
  ס: "s",
  ע: "a",
  פ: "p",
  ף: "p",
  צ: "tz",
  ץ: "tz",
  ק: "k",
  ר: "r",
  ש: "sh",
  ת: "t",
};

export function decodeSlugParam(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export function storefrontProductHref(slug: string): string {
  return `/products/${encodeURIComponent(decodeSlugParam(slug))}`;
}

export function adminProductHref(slug: string): string {
  return `/admin/products/${encodeURIComponent(decodeSlugParam(slug))}`;
}

export function createProductSlug(name: string, now: number = Date.now()): string {
  const mapped = Array.from(name.trim().toLowerCase(), (char) => {
    if (HEBREW_TO_LATIN[char]) {
      return HEBREW_TO_LATIN[char];
    }
    if (/[a-z0-9]/.test(char)) {
      return char;
    }
    if (/\s|-/.test(char)) {
      return "-";
    }
    return "";
  }).join("");

  const cleaned = mapped.replace(/-+/g, "-").replace(/^-|-$/g, "");
  const base = cleaned.length >= 2 ? cleaned.slice(0, 60) : "item";
  return `${base}-${now.toString(36)}`;
}
