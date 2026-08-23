import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3040";
const START_SERVER = process.env.SMOKE_START !== "0";

const routes = [
  "/",
  "/shop",
  "/products",
  "/products/vroomzoom-driving-board-front",
  "/search?q=ילדים",
  "/cart",
  "/favorites",
  "/about",
  "/delivery",
  "/who-we-are",
  "/instagram",
  "/admin",
];

const mustInclude = {
  "/": ["חנות קטנה", "לכניסה לחנות", "בגדים"],
  "/shop": ["חנות קטנה ומטריפה"],
  "/products/vroomzoom-driving-board-front": ["לוח נהיגה", "חזרה לחנות"],
  "/cart": ["סל", "ביט"],
  "/about": ["יד שנייה"],
  "/admin": ["אדמין"],
};

const mustNotInclude = {
  "/": ["Stripe", "Application error"],
  "/cart": ["Stripe", "תשלום בכרטיס"],
  "/admin": ["Application error"],
};

try {
  const saved = JSON.parse(readFileSync(".tmp/last-admin-product.json", "utf8"));
  if (saved?.slug && saved?.name) {
    const productPath = `/products/${saved.slug}`;
    routes.push(productPath);
    mustInclude[productPath] = [saved.name.slice(0, 8), "חזרה לחנות"];
    mustInclude["/shop"].push(saved.name.slice(0, 8));
  }
} catch {
  // Admin catalog smoke writes this file when a new product was saved.
}

async function waitForServer(url, timeoutMs = 45000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.status > 0) {
        return;
      }
    } catch {
      // Server not up yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  throw new Error(`Server did not start at ${url}`);
}

async function checkRoute(path) {
  const response = await fetch(`${BASE}${path}`, { redirect: "follow" });
  if (response.status >= 500) {
    throw new Error(`${path} returned ${response.status}`);
  }
  if (response.status >= 400) {
    throw new Error(`${path} returned ${response.status}`);
  }

  const html = await response.text();
  for (const needle of mustInclude[path] ?? []) {
    if (!html.includes(needle)) {
      throw new Error(`${path} missing expected text: ${needle}`);
    }
  }
  for (const needle of mustNotInclude[path] ?? []) {
    if (html.includes(needle)) {
      throw new Error(`${path} still contains forbidden text: ${needle}`);
    }
  }
  return response.status;
}

async function checkCssTokens() {
  const home = await fetch(`${BASE}/`);
  const html = await home.text();
  const cssHref = html.match(/href="(\/_next\/static\/[^"]+\.css)"/)?.[1];
  if (!cssHref) {
    throw new Error("Could not find CSS bundle on home page.");
  }
  const css = await (await fetch(`${BASE}${cssHref}`)).text();
  if (!css.includes("#f5f3e8") || !css.includes("#b5d39a")) {
    throw new Error("New cream/mint tokens missing from CSS bundle.");
  }
  if (css.includes("#c45f3f") || css.includes("#8e6b9e")) {
    throw new Error("Old orange/purple tokens still in CSS bundle.");
  }
}

function readAdminPassword() {
  let password = process.env.ADMIN_PASSWORD?.trim() ?? "";
  if (!password) {
    try {
      const line = readFileSync(".env.local", "utf8")
        .split("\n")
        .find((item) => item.startsWith("ADMIN_PASSWORD="));
      password = line?.slice("ADMIN_PASSWORD=".length).trim() ?? "";
    } catch {
      password = "";
    }
  }

  if (
    (password.startsWith('"') && password.endsWith('"')) ||
    (password.startsWith("'") && password.endsWith("'"))
  ) {
    password = password.slice(1, -1).trim();
  }

  return password || null;
}

async function checkAdminImageUpload() {
  const password = readAdminPassword();
  if (!password) {
    console.log("admin-upload-http: skipped");
    return;
  }

  const payload = String(Date.now() + 12 * 60 * 60 * 1000);
  const token = `${payload}.${createHmac("sha256", password).update(payload).digest("hex")}`;
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
  const form = new FormData();
  form.set("name", "חולצת ילדים לבדיקת העלאה");
  form.set("category", "בגדים");
  form.set("price", "25");
  form.set("stock", "1");
  form.set("description", "פריט בדיקה להעלאת תמונה מהאדמין.");
  form.set("isActive", "on");
  form.set("imageFileSelected", "1");
  form.set("imageFile", new File([png], "upload-check.png", { type: "image/png" }));

  const response = await fetch(`${BASE}/api/admin/products`, {
    method: "POST",
    headers: { cookie: `admin_session=${token}` },
    body: form,
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(`admin upload failed ${response.status}: ${body.error ?? "unknown"}`);
  }
  if (!body.slug) {
    throw new Error("admin upload did not return a slug");
  }

  const productPage = await fetch(`${BASE}/products/${body.slug}`);
  const html = await productPage.text();
  if (productPage.status >= 400 || !html.includes("חולצת ילדים")) {
    throw new Error(`uploaded product page missing ${body.slug}`);
  }
}

async function runChecks() {
  const results = [];
  for (const path of routes) {
    const status = await checkRoute(path);
    results.push(`${status} ${path}`);
  }
  await checkCssTokens();
  await checkAdminImageUpload();
  console.log(results.join("\n"));
  console.log("smoke-routes: ok");
}

async function main() {
  let server;
  if (START_SERVER && !process.env.BASE_URL) {
    server = spawn("npx", ["next", "start", "-p", "3040"], {
      stdio: "inherit",
      env: { ...process.env, PORT: "3040" },
    });
    await waitForServer(`${BASE}/`);
  }

  try {
    await runChecks();
  } finally {
    if (server) {
      server.kill("SIGTERM");
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
