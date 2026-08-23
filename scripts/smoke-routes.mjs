import { spawn } from "node:child_process";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3010";
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

async function runChecks() {
  const results = [];
  for (const path of routes) {
    const status = await checkRoute(path);
    results.push(`${status} ${path}`);
  }
  await checkCssTokens();
  console.log(results.join("\n"));
  console.log("smoke-routes: ok");
}

async function main() {
  let server;
  if (START_SERVER && !process.env.BASE_URL) {
    server = spawn("npx", ["next", "start", "-p", "3010"], {
      stdio: "inherit",
      env: { ...process.env, PORT: "3010" },
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
