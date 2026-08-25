#!/usr/bin/env node
/**
 * Fetches WIZO second-hand clothing shops (ביגודיות) and writes app/data/wizo-places.json
 * Source: https://wizo.org.il/institution/?wpv-type-of-institution[]=ביגודיות
 */

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const WIZO_URL =
  "https://wizo.org.il/institution/?wpv-type-of-institution%5B%5D=%D7%91%D7%99%D7%92%D7%95%D7%93%D7%99%D7%95%D7%AA&wpv_aux_current_post_id=4049&wpv_aux_parent_post_id=4049&wpv_view_count=387-TCPID4049";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, "../app/data/wizo-places.json");

function decodeHtml(text) {
  return text
    .replace(/&#038;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function toSlug(name) {
  return `wizo-${name
    .replace(/^ביגודית\s+/, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[()""]/g, "")}`;
}

function extractCity(name, address) {
  const label = name.replace(/^ביגודית\s+/, "").trim();

  const cityPatterns = [
    "תל אביב",
    "פתח תקווה",
    "ראשון לציון",
    "רמת גן",
    "רמת השרון",
    "פרדס חנה",
    "כפר סבא",
    "הוד השרון",
    "זכרון יעקב",
    "קרית חיים",
    "קרית ים",
    "קרית גת",
    "קרית מלאכי",
    "קרית שמונה",
    "באר שבע",
    "בת ים",
    "נס ציונה",
    "נתניה",
    "רעננה",
    "חיפה",
    "ירושלים",
    "חולון",
    "גבעתיים",
    "הרצליה",
    "אשדוד",
    "אשקלון",
    "אילת",
    "דימונה",
    "טבריה",
    "עפולה",
    "כרמיאל",
    "נהריה",
    "מודיעין",
    "סביון",
    "רחובות",
    "אזור",
    "קדימה",
  ];

  for (const city of cityPatterns) {
    if (label.includes(city) || address.includes(city)) {
      return city;
    }
  }

  const commaParts = address
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part && !/^\d+$/.test(part));

  if (commaParts.length > 0) {
    return commaParts[commaParts.length - 1];
  }

  return label.replace(/\s*\([^)]+\).*/, "").split(" – ")[0].trim();
}

function parseWizoHtml(html) {
  const coords = new Map();

  const coordPattern =
    /data-markertitle="([^"]+)"[^>]*data-markerlat="([^"]+)"[^>]*data-markerlon="([^"]+)"/g;

  for (const match of html.matchAll(coordPattern)) {
    coords.set(decodeHtml(match[1]), {
      lat: Number.parseFloat(match[2]),
      lng: Number.parseFloat(match[3]),
    });
  }

  const detailPattern =
    /<div class="marker_jo_bottom">\s*<div>\s*<h3>([^<]+)<\/h3>\s*<span><strong>כתובת:<\/strong>\s*([^<]+)<\/span>\s*<span><strong>שעות פתיחה:<\/strong>\s*([^<]+)<\/span>\s*(?:<span><strong>טלפון:<\/strong>\s*([^<]+)<\/span>)?/g;

  const places = [];

  for (const match of html.matchAll(detailPattern)) {
    const name = decodeHtml(match[1].trim());
    const address = decodeHtml(match[2].trim());
    const hours = decodeHtml(match[3].trim());
    const phone = match[4] ? decodeHtml(match[4].trim()) : undefined;
    const point = coords.get(name);

    if (!point) {
      console.warn(`Missing coordinates for: ${name}`);
      continue;
    }

    places.push({
      slug: toSlug(name),
      name,
      placeType: "both",
      categories: ["clothes"],
      address,
      city: extractCity(name, address),
      lat: point.lat,
      lng: point.lng,
      description:
        "ביגודית ויצו — חנות יד שנייה לתרומה ורכישת בגדים. הכנסות מופנות לפעילות רווחה של ויצו.",
      phone,
      hours,
      source: "wizo",
      sourceUrl: WIZO_URL,
    });
  }

  places.sort((a, b) => a.city.localeCompare(b.city, "he"));

  return places;
}

async function main() {
  console.log("Fetching WIZO ביגודיות...");
  const response = await fetch(WIZO_URL, {
    headers: {
      "User-Agent": "vintage-market-sync/1.0 (+local dev)",
      "Accept-Language": "he-IL,he;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(`WIZO fetch failed: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const places = parseWizoHtml(html);

  if (places.length === 0) {
    throw new Error("No WIZO places parsed — page structure may have changed.");
  }

  const payload = {
    syncedAt: new Date().toISOString(),
    source: WIZO_URL,
    count: places.length,
    places,
  };

  writeFileSync(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote ${places.length} places to ${OUTPUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
