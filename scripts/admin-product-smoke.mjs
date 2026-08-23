import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, ".tmp", "admin-product-smoke");
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const COMPILE_FILES = [
  "lib/catalog/image-kind.ts",
  "lib/catalog/admin-form.ts",
  "lib/catalog/slug.ts",
  "lib/catalog/backend.ts",
  "lib/catalog/images.ts",
  "lib/catalog/store.ts",
  "lib/catalog/remote.ts",
  "lib/catalog/types.ts",
  "lib/supabase/admin.ts",
  "lib/commerce/money.ts",
  "app/data/products.ts",
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function rewriteRelativeImports(source) {
  return source.replace(/from\s+["'](\.[^"']+)["']/g, (full, spec) => {
    if (/\.(js|json|mjs|cjs)$/.test(spec)) {
      return full;
    }
    return `from "${spec}.js"`;
  });
}

function compileWorkspaceModules() {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(path.join(OUT_DIR, "package.json"), '{"type":"module"}\n');

  for (const rel of COMPILE_FILES) {
    const srcPath = path.join(ROOT, rel);
    const source = readFileSync(srcPath, "utf8");
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
        jsx: ts.JsxEmit.ReactJSX,
      },
      fileName: srcPath,
    });
    const outPath = path.join(OUT_DIR, rel.replace(/\.tsx?$/, ".js"));
    mkdirSync(path.dirname(outPath), { recursive: true });
    writeFileSync(outPath, rewriteRelativeImports(outputText));
  }
}

function expectError(fn, needle) {
  try {
    fn();
  } catch (error) {
    assert(
      error instanceof Error && error.message.includes(needle),
      `expected error to include "${needle}", got ${error instanceof Error ? error.message : error}`,
    );
    return;
  }
  throw new Error(`expected an error containing "${needle}"`);
}

async function main() {
  compileWorkspaceModules();

  const imageKind = await import(pathToFileURL(path.join(OUT_DIR, "lib/catalog/image-kind.js")).href);
  const adminForm = await import(pathToFileURL(path.join(OUT_DIR, "lib/catalog/admin-form.js")).href);
  const slugMod = await import(pathToFileURL(path.join(OUT_DIR, "lib/catalog/slug.js")).href);
  const images = await import(pathToFileURL(path.join(OUT_DIR, "lib/catalog/images.js")).href);
  const store = await import(pathToFileURL(path.join(OUT_DIR, "lib/catalog/store.js")).href);

  const jpegPhone = imageKind.inspectProductImage({
    name: "IMG_1234.JPG",
    type: "image/jpg",
    size: 2048,
  });
  assert(jpegPhone.extension === "jpg", "image/jpg from phones should be accepted");

  const pngNoMime = imageKind.inspectProductImage({
    name: "jacket.png",
    type: "",
    size: 2048,
  });
  assert(pngNoMime.extension === "png", "png extension should work without MIME");

  expectError(
    () =>
      imageKind.inspectProductImage({
        name: "photo.heic",
        type: "image/heic",
        size: 2048,
      }),
    "HEIC",
  );

  const emptyFile = adminForm.asUploadedFile("");
  assert(emptyFile === null, "empty file field should be ignored");

  const realFile = new File([PNG], "jacket.png", { type: "image/png" });
  assert(adminForm.asUploadedFile(realFile)?.name === "jacket.png", "uploaded File should pass through");
  assert(adminForm.asUploadedFile(new File([], "empty.png", { type: "image/png" })) === null, "empty File should be ignored");

  const missingName = adminForm.parseAdminProductFields(new FormData());
  assert("error" in missingName && missingName.error.includes("כותרת"), "missing title should fail");

  const form = new FormData();
  form.set("name", "מעיל ילדים יד שנייה");
  form.set("category", "בגדים");
  form.set("price", "45");
  form.set("stock", "1");
  form.set("description", "מעיל ילדים יד שנייה במצב טוב, נמכר כמו שהוא.");
  form.set("isActive", "on");
  form.set("imageFile", realFile);

  const parsed = adminForm.parseAdminProductFields(form);
  assert(!("error" in parsed), "valid product fields should parse");

  const slug = slugMod.createProductSlug(parsed.name);
  assert(/^[a-z0-9-]+$/.test(slug), `slug must stay ASCII for product URLs, got ${slug}`);
  assert(slug.includes("mayl") || slug.includes("yldym"), `hebrew title should transliterate, got ${slug}`);

  const uploadedMain = await images.saveProductImage(realFile, slug);
  assert(
    typeof uploadedMain === "string" && uploadedMain.startsWith("/uploads/") && uploadedMain.endsWith(".png"),
    `local upload should return /uploads path, got ${uploadedMain}`,
  );

  const resolved = adminForm.resolveProductImages({
    uploadedMain,
    imageUrls: [],
    uploadedExtras: [],
    existing: null,
  });
  assert(!("error" in resolved), "uploaded image should resolve");

  const product = await store.upsertCatalogProduct({
    slug,
    name: parsed.name,
    category: parsed.category,
    price: parsed.price,
    image: resolved.image,
    images: resolved.images,
    description: parsed.description,
    stock: parsed.stock,
    isActive: parsed.isActive,
  });

  const saved = await store.getCatalogProduct(slug);
  assert(saved?.name === "מעיל ילדים יד שנייה", "saved product should be readable from catalog");
  assert(saved?.image === uploadedMain, "saved product should keep uploaded image path");

  const imagePath = path.join(ROOT, "public", uploadedMain.replace(/^\//, ""));
  const written = await readFile(imagePath);
  assert(written.length === PNG.length, "uploaded image bytes should be on disk");

  const catalogRaw = await readFile(path.join(ROOT, "data", "catalog.json"), "utf8");
  assert(catalogRaw.includes("מעיל ילדים יד שנייה"), "catalog.json should contain the new product");
  assert(catalogRaw.includes(uploadedMain), "catalog.json should point at the uploaded image");

  const afterEdit = adminForm.resolveProductImages({
    uploadedMain: null,
    imageUrls: [saved.image],
    uploadedExtras: [],
    existing: saved,
  });
  assert(!("error" in afterEdit) && afterEdit.image.startsWith("/uploads/"), "editing a local upload must keep /uploads path");

  writeFileSync(
    path.join(ROOT, ".tmp", "last-admin-product.json"),
    `${JSON.stringify({ slug: product.slug, name: product.name, image: product.image }, null, 2)}\n`,
  );

  console.log(`admin-product-smoke: ok ${product.slug} ${product.image}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
