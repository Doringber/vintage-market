#!/usr/bin/env node
/**
 * Syncs second-hand places from Pitchon Lev, Dandasha, and Better Be Second.
 * Kan.org.il article is Cloudflare-blocked for automated fetch — add manually if needed.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, "../app/data/curated-places.json");
const CACHE_FILE = join(__dirname, "../app/data/geocode-cache.json");

const PITCHON_URL = "https://www.pitchonlev.org.il/second-hand-clothes/";
const DANDASHA_URL = "https://dandasha.co.il/pages/branches";

const SOURCE_URLS = {
  pitchonlev: PITCHON_URL,
  dandasha: DANDASHA_URL,
  betterbesecond:
    "https://www.betterbesecond.com/post/%D7%9C%D7%A7%D7%91%D7%9C-%D7%9B%D7%A1%D7%A3-%D7%A2%D7%9C-%D7%94%D7%91%D7%92%D7%93%D7%99%D7%9D-%D7%A9%D7%9C%D7%99",
  kan: "https://www.kan.org.il/content/kan-news/local/269807/",
};

function loadCache() {
  if (!existsSync(CACHE_FILE)) {
    return {};
  }
  return JSON.parse(readFileSync(CACHE_FILE, "utf8"));
}

function saveCache(cache) {
  writeFileSync(CACHE_FILE, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
}

function decodeHtml(text) {
  return text
    .replace(/&#038;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function toSlug(prefix, name) {
  return `${prefix}-${name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[()""']/g, "")
    .slice(0, 48)}`;
}

const CITY_CENTERS = {
  "תל אביב": { lat: 32.0853, lng: 34.7818 },
  "ראשון לציון": { lat: 31.973, lng: 34.7925 },
  "כרמיאל": { lat: 32.919, lng: 35.303 },
  "חיפה": { lat: 32.794, lng: 34.9896 },
  "נתניה": { lat: 32.3215, lng: 34.8532 },
  "עפולה": { lat: 32.607, lng: 35.289 },
  "באר שבע": { lat: 31.2529, lng: 34.7915 },
  "רמת גן": { lat: 32.082, lng: 34.814 },
  "כפר סבא": { lat: 32.178, lng: 34.907 },
  "קרית גת": { lat: 31.61, lng: 34.771 },
  "קרית מוצקין": { lat: 32.833, lng: 35.077 },
  "ירושלים": { lat: 31.7683, lng: 35.2137 },
  "חולון": { lat: 32.011, lng: 34.779 },
  "אשדוד": { lat: 31.804, lng: 34.655 },
  "נהריה": { lat: 33.008, lng: 35.098 },
  "טבריה": { lat: 32.792, lng: 35.531 },
  "נצרת": { lat: 32.699, lng: 35.303 },
  "עפולה": { lat: 32.607, lng: 35.289 },
  "רחובות": { lat: 31.892, lng: 34.811 },
  "נתניה": { lat: 32.3215, lng: 34.8532 },
  "קרית אתא": { lat: 32.804, lng: 35.106 },
  "קרית חיים": { lat: 32.833, lng: 35.067 },
  "ראש פינה": { lat: 32.481, lng: 35.542 },
  "סתריה": { lat: 31.883, lng: 34.867 },
  "צריפין": { lat: 31.967, lng: 34.837 },
  "מגדל העמק": { lat: 32.676, lng: 35.242 },
  "משמר הירדן": { lat: 33.1, lng: 35.65 },
  "חורפיש": { lat: 33.017, lng: 35.348 },
  "יפיע": { lat: 32.684, lng: 35.275 },
  "ירכא": { lat: 32.954, lng: 35.212 },
  "כבול": { lat: 32.95, lng: 35.2 },
  "תמרה": { lat: 32.637, lng: 35.208 },
  "כפר סבא": { lat: 32.178, lng: 34.907 },
  "סתריה": { lat: 31.883, lng: 34.867 },
  "ירכא": { lat: 32.954, lng: 35.212 },
  "כבול": { lat: 32.95, lng: 35.2 },
  "יפיע": { lat: 32.684, lng: 35.275 },
  "כפר תבור": { lat: 32.721, lng: 35.421 },
  "חולון": { lat: 32.011, lng: 34.779 },
};

const KNOWN_COORDINATES = {
  "מקווה ישראל 22, תל אביב": { lat: 32.0665, lng: 34.7867 },
  "בוגרשוב 53, תל אביב": { lat: 32.0778, lng: 34.7712 },
  "דיזנגוף 91, תל אביב": { lat: 32.078, lng: 34.7749 },
  "המלך חירם 8, תל אביב": { lat: 32.053, lng: 34.752 },
  "ביאליק 27, רמת גן": { lat: 32.082, lng: 34.814 },
  "ויצמן 24, כפר סבא": { lat: 32.178, lng: 34.907 },
  "הרצל 27, נתניה": { lat: 32.328, lng: 34.856 },
  "הרב נחום לוין 2, עפולה": { lat: 32.607, lng: 35.289 },
  "דרך הדרום 9, קרית גת": { lat: 31.61, lng: 34.771 },
  "שדרות גושן 29, קרית מוצקין": { lat: 32.833, lng: 35.077 },
  "רוטשילד 56, ראשון לציון": { lat: 31.973, lng: 34.7925 },
  "דרך יפו 24, חיפה": { lat: 32.819, lng: 34.998 },
  "שדרות ההסתדרות 251, חיפה": { lat: 32.789, lng: 35.034 },
  "התקווה 10, באר שבע": { lat: 31.245, lng: 34.792 },
  "רחוב לישנסקי 9, ראשון לציון": { lat: 31.987, lng: 34.769 },
  "רחוב לבונה 1, כרמיאל": { lat: 32.919, lng: 35.303 },
  "קרסל 6, חולון": { lat: 32.0178, lng: 34.7792 },
  "פייר קניג 39, ירושלים": { lat: 31.7512, lng: 35.2134 },
  "דיזנגוף סנטר, בניין B, קומה 3, תל אביב": { lat: 32.0753, lng: 34.7749 },
};

function parsePitchonCenters(html) {
  const centers = [];
  const centerPattern =
    /(?:מרכזי הסיוע|לאחד מ-2)[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i;
  const listMatch = html.match(centerPattern);
  const listHtml = listMatch?.[1] ?? html;

  const itemPattern =
    /<li[^>]*>\s*([^<]+?),\s*([^,]+?)\s*,\s*ימים[^,]*,\s*טלפון:\s*([^<]+)/gi;

  for (const match of listHtml.matchAll(itemPattern)) {
    const city = decodeHtml(match[1].trim());
    const address = decodeHtml(match[2].trim());
    const phone = decodeHtml(match[3].trim());
    centers.push({
      slug: toSlug("pitchonlev-center", `${city}-${address}`),
      name: `מרכז סיוע פתחון לב — ${city}`,
      placeType: "give",
      categories: ["clothes", "toys", "general"],
      address,
      city,
      description:
        "מרכז סיוע של פתחון לב — תרומת בגדים, צעצועים וכלי בית. הבגדים מועברים לנזקקים או נמכרים בבזאר מכל הלב.",
      phone,
      hours: "א'-ה' 9:00-17:00",
      source: "pitchonlev",
      sourceUrl: SOURCE_URLS.pitchonlev,
    });
  }

  if (!centers.length) {
    centers.push(
      {
        slug: "pitchonlev-center-rishon",
        name: "מרכז סיוע פתחון לב — ראשון לציון",
        placeType: "give",
        categories: ["clothes", "toys", "general"],
        address: "רחוב לישנסקי 9",
        city: "ראשון לציון",
        description:
          "מרכז סיוע של פתחון לב — תרומת בגדים, צעצועים וכלי בית.",
        phone: "03-9512755",
        hours: "א'-ה' 9:00-17:00",
        source: "pitchonlev",
        sourceUrl: SOURCE_URLS.pitchonlev,
      },
      {
        slug: "pitchonlev-center-carmiel",
        name: "מרכז סיוע פתחון לב — כרמיאל",
        placeType: "give",
        categories: ["clothes", "toys", "general"],
        address: "רחוב לבונה 1, א.ת.",
        city: "כרמיאל",
        description:
          "מרכז סיוע של פתחון לב — תרומת בגדים, צעצועים וכלי בית.",
        phone: "04-9985661",
        hours: "א'-ה' 8:00-17:00",
        source: "pitchonlev",
        sourceUrl: SOURCE_URLS.pitchonlev,
      },
    );
  }

  return centers;
}

function getDandashaBranches() {
  return [
    branch("dandasha-beer-sheva", "באר שבע", "התקווה 10, באר שבע", "א'-ה' 09:00-19:00"),
    branch("dandasha-haifa", "חיפה", "דרך יפו 24, חיפה", "א'-ה' 09:00-19:00"),
    branch("dandasha-haifa-low", "חיפה", "שדרות ההסתדרות 251, חיפה", "א'-ה' 09:00-19:00"),
    branch("dandasha-tlv-hiram", "תל אביב", "המלך חירם 8, תל אביב", "א'-ה' 09:00-19:00"),
    branch("dandasha-kfar-saba", "כפר סבא", "ויצמן 24, כפר סבא", "א'-ה' 09:00-19:00"),
    branch("dandasha-netanya", "נתניה", "הרצל 27, נתניה", "א'-ה' 09:00-19:00"),
    branch("dandasha-afula", "עפולה", "הרב נחום לוין 2, עפולה", "א'-ה' 09:00-19:00"),
    branch("dandasha-kiryat-gat", "קרית גת", "דרך הדרום 9, קרית גת", "א'-ה' 09:00-19:00"),
    branch("dandasha-kiryat-motzkin", "קרית מוצקין", "שדרות גושן 29, קרית מוצקין", "א'-ה' 09:00-19:00"),
    branch("dandasha-rishon", "ראשון לציון", "רוטשילד 56, ראשון לציון", "א'-ה' 09:00-19:00"),
    branch("dandasha-ramat-gan", "רמת גן", "ביאליק 27, רמת גן", "א'-ה' 09:00-19:00"),
    branch("dandasha-tlv-dizengoff", "תל אביב", "דיזנגוף 91, תל אביב", "א'-ה' 10:00-20:00"),
  ];
}

function branch(slugSuffix, branchName, address, hours) {
  const city = address.split(",").pop()?.trim() ?? branchName;
  return {
    slug: `dandasha-${slugSuffix}`,
    name: `דנדשה — ${branchName}`,
    placeType: "both",
    categories: ["clothes"],
    address: address.split(",")[0]?.trim() ?? address,
    city,
    description:
      "רשת בגדי יד שנייה חברתית. על כל 10 פריטים שמוסרים — זיכוי/הנחה לרכישה בחנות.",
    phone: "*2559 שלוחה 3",
    hours,
    source: "dandasha",
    sourceUrl: SOURCE_URLS.dandasha,
  };
}

function getPitchonBins() {
  const bins = [
    ["אשדוד", "אשדוד צפון, רח' המדע 35, א.ת. צפוני"],
    ["חולון", "המרכבה 35, א.ת. — תחנת המרכבה"],
    ["חורפיש", "א.ת. — תחנת חורפיש"],
    ["חיפה", "אופיר צ'ק פוסט"],
    ["טבריה", "צומת אלומות, פוריה עין הגליל"],
    ["יפיע", "יפיע"],
    ["ירכא", "כפר ירכא"],
    ["כבול", "כפר כבול"],
    ["כפר סבא", "רח' מנחם בגין — תחנת כפר סבא צפון"],
    ["כפר סבא", "כפר סבא מזרח"],
    ["כפר תבור", "תחנת סונול כוכב התבור"],
    ["כרמיאל", "תחנת סונול בכביש עכו-צפת"],
    ["כרמיאל", "רח' החרושת 40, א.ת."],
    ["כרמיאל", "כביש 85, אזור כרמיאל"],
    ["מגדל העמק", "תחנת מגדל העמק, רח' הקישון"],
    ["משמר הירדן", "משמר הירדן"],
    ["נהריה", "תחנת סונול נהריה, רח' שז\"ר"],
    ["נצרת", "כביש נצרת-ציפורי, מבואות נצרת"],
    ["נתניה", "צומת השרון"],
    ["סתריה", "סתריה"],
    ["עפולה", "מפגש העמק"],
    ["עפולה", "עפולה"],
    ["צריפין", "תחנת שלמה"],
    ["קרית אתא", "תחנת סונול מבואות אתא, רח' העצמאות"],
    ["קרית אתא", "תחנת סונול, כביש קרית ביאליק"],
    ["קרית חיים", "קרית חיים, ליד האצטדיון"],
    ["ראשון לציון", "רח' האצ\"ל 22, א.ת. — תחנת סונול"],
    ["ראשון לציון", "כביש נס ציונה-ראשל\"צ — תחנת סונול עטרת"],
    ["ראשון לציון", "רח' רוזנסקי 2 — תחנת עמי"],
    ["ראש פינה", "ראש פינה"],
    ["רחובות", "פארק המדע, רח' המדע"],
    ["תמרה", "מפגש תמרה"],
  ];

  return bins.map(([city, address]) => ({
    slug: toSlug("pitchonlev-bin", `${city}-${address}`),
    name: `איסוף בגדים פתחון לב — ${city}`,
    placeType: "give",
    categories: ["clothes"],
    address,
    city,
    description:
      "מכולת איסוף בגדים של פתחון לב (פרויקט סונול). הבגדים ממוינים ומועברים לנזקקים.",
    hours: "24/7 — מכולה בתחנת דלק",
    source: "pitchonlev",
    sourceUrl: SOURCE_URLS.pitchonlev,
  }));
}

function getBetterBeSecondPlaces() {
  return [
    {
      slug: "bbs-chelsea-tlv",
      name: "צ'לסי — יד שנייה",
      placeType: "sell",
      categories: ["clothes"],
      address: "מקווה ישראל 22",
      city: "תל אביב",
      lat: 32.0665,
      lng: 34.7867,
      description:
        "חנות יד שנייה במתחם גן החשמל. מקבלת עד 10 פריטים בתיאום מראש — זיכוי לרכישה בחנות. מקור: Better Be Second.",
      hours: "יש לתאם באפליקציה",
      source: "betterbesecond",
      sourceUrl: SOURCE_URLS.betterbesecond,
    },
    {
      slug: "bbs-adret-tlv",
      name: "אדרת — וינטג'",
      placeType: "sell",
      categories: ["clothes"],
      address: "בוגרשוב 53",
      city: "תל אביב",
      lat: 32.0778,
      lng: 34.7712,
      description:
        "וינטג' משנות ה-90 ומטה. מזומן 25% או זיכוי 35% — בתיאום מראש. מקור: Better Be Second.",
      hours: "בתיאום מראש",
      source: "betterbesecond",
      sourceUrl: SOURCE_URLS.betterbesecond,
    },
  ];
}

/** Places often listed in Kan local guides when article is unavailable to scrape. */
function getKanFallbackPlaces() {
  return [
    {
      slug: "kan-hamezion-tlv",
      name: "המציאון — תל אביב",
      placeType: "both",
      categories: ["clothes"],
      address: "דיזנגוף סנטר, בניין B, קומה 3",
      city: "תל אביב",
      lat: 32.0753,
      lng: 34.7749,
      description:
        "רשת חנויות וינטג' ויד שנייה. ניתן לתרום בגדים. מקור: מדריכי תרומה מקומיים (כאן 11 חסום לסריקה).",
      phone: "02-6247993",
      hours: "א'-ה' 10:00-20:00, ו' 10:00-15:00",
      source: "kan",
      sourceUrl: SOURCE_URLS.kan,
    },
    {
      slug: "kan-hamezion-jlm",
      name: "המציאון — ירושלים",
      placeType: "both",
      categories: ["clothes"],
      address: "פייר קניג 39, תלפיות",
      city: "ירושלים",
      lat: 31.7512,
      lng: 35.2134,
      description:
        "סניף ירושלים — תרומת ורכישת בגדי יד שנייה. מקור: מדריכי תרומה מקומיים (כאן 11 חסום לסריקה).",
      phone: "02-6247993",
      hours: "א'-ה' 10:00-20:00, ו' 9:00-14:00",
      source: "kan",
      sourceUrl: SOURCE_URLS.kan,
    },
    {
      slug: "kan-boutique-gurion",
      name: "בוטיק גוריון",
      placeType: "both",
      categories: ["clothes", "toys", "general"],
      address: "קרסל 6, מרכז קהילתי בן גוריון",
      city: "חולון",
      lat: 32.0178,
      lng: 34.7792,
      description:
        "חנות יד שנייה חברתית — בגדים, צעצועים וכלי בית. מקור: מדריכי תרומה מקומיים (כאן 11 חסום לסריקה).",
      phone: "03-5528490",
      hours: "עדכון בשעות בפייסבוק boutique_gurion",
      source: "kan",
      sourceUrl: SOURCE_URLS.kan,
    },
  ];
}

function resolveCoordinates(query, city) {
  const key = query.trim();
  if (KNOWN_COORDINATES[key]) {
    return KNOWN_COORDINATES[key];
  }

  const cityCenter = CITY_CENTERS[city];
  if (cityCenter) {
    return cityCenter;
  }

  return null;
}

async function attachCoordinates(places) {
  const enriched = [];

  for (const place of places) {
    if (place.lat && place.lng) {
      enriched.push(place);
      continue;
    }

    const query = `${place.address}, ${place.city}`;
    const point = resolveCoordinates(query, place.city);

    if (!point) {
      console.warn(`Skipping (no coordinates): ${place.name} — ${query}`);
      continue;
    }

    enriched.push({ ...place, lat: point.lat, lng: point.lng });
  }

  return enriched;
}

async function main() {
  console.log("Fetching Pitchon Lev (centers)...");
  const pitchonResponse = await fetch(PITCHON_URL, {
    headers: { "User-Agent": "vintage-market-sync/1.0" },
  });
  const pitchonHtml = await pitchonResponse.text();

  const rawPlaces = [
    ...parsePitchonCenters(pitchonHtml),
    ...getPitchonBins(),
    ...getDandashaBranches(),
    ...getBetterBeSecondPlaces(),
    ...getKanFallbackPlaces(),
  ];

  console.log(`Parsed ${rawPlaces.length} places. Resolving coordinates...`);
  const places = await attachCoordinates(rawPlaces);

  places.sort((a, b) => a.city.localeCompare(b.city, "he"));

  const payload = {
    syncedAt: new Date().toISOString(),
    sources: SOURCE_URLS,
    count: places.length,
    places,
  };

  writeFileSync(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote ${places.length} curated places to ${OUTPUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
