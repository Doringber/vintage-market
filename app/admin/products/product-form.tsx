"use client";

import { useEffect, useState } from "react";
import { compressImageForUpload } from "../../../lib/catalog/compress-image";
import { PRODUCT_IMAGE_ACCEPT } from "../../../lib/catalog/image-kind";
import { toCssImageUrl } from "../../../lib/catalog/media";
import type { CatalogProduct } from "../../../lib/catalog/types";

type ProductFormProps = {
  product?: CatalogProduct;
};

export function ProductForm({ product }: ProductFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [extraUrls, setExtraUrls] = useState<string[]>(product?.images ?? [""]);
  const [mainPreview, setMainPreview] = useState<string | null>(product?.image ?? null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const [chosenFileName, setChosenFileName] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewObjectUrl) {
        URL.revokeObjectURL(previewObjectUrl);
      }
    };
  }, [previewObjectUrl]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    extraUrls.forEach((url) => {
      if (url.trim()) {
        formData.append("imageUrls", url.trim());
      }
    });

    const mainFile = formData.get("imageFile");
    if (mainFile instanceof File && mainFile.size > 0) {
      formData.set("imageFileSelected", "1");
      formData.set("imageFile", await compressImageForUpload(mainFile));
    }

    const extraFiles = formData.getAll("extraImageFiles").filter(
      (value): value is File => value instanceof File && value.size > 0,
    );
    if (extraFiles.length > 0) {
      formData.set("extraImageFilesSelected", "1");
      formData.delete("extraImageFiles");
      for (const file of extraFiles) {
        formData.append("extraImageFiles", await compressImageForUpload(file));
      }
    }

    const hasImage =
      (formData.get("imageFile") instanceof File &&
        (formData.get("imageFile") as File).size > 0) ||
      extraFiles.length > 0 ||
      Boolean(String(formData.get("imageUrls") ?? "").trim()) ||
      extraUrls.some((url) => url.trim().length > 0) ||
      Boolean(product?.image);

    if (!hasImage) {
      setError("צריך תמונה: להעלות קובץ או להדביק קישור.");
      setPending(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string; slug?: string }
        | null;

      if (response.status === 401) {
        window.location.href = "/admin";
        return;
      }

      if (!response.ok || payload?.error) {
        setError(payload?.error || "לא הצלחנו לשמור את המוצר.");
        setPending(false);
        return;
      }

      window.location.href = "/admin/products";
    } catch {
      setError("לא הצלחנו לשמור את המוצר. בדקי את החיבור ונסי שוב.");
      setPending(false);
    }
  }

  return (
    <form
      className="adminForm"
      onSubmit={handleSubmit}
      encType="multipart/form-data"
    >
      {product ? <input type="hidden" name="slug" value={product.slug} /> : null}

      <label className="transferField">
        כותרת
        <input
          type="text"
          name="name"
          defaultValue={product?.name ?? ""}
          required
          minLength={2}
          data-testid="admin-product-name"
        />
      </label>

      <label className="transferField">
        קטגוריה
        <input
          type="text"
          name="category"
          defaultValue={product?.category ?? "דברי ילדים"}
          data-testid="admin-product-category"
        />
      </label>

      <label className="transferField">
        מחיר בשקלים
        <input
          type="number"
          name="price"
          min={0}
          step="1"
          defaultValue={product?.price ?? 0}
          required
          data-testid="admin-product-price"
        />
      </label>

      <label className="transferField">
        מלאי
        <input
          type="number"
          name="stock"
          min={0}
          step="1"
          defaultValue={product?.stock ?? 1}
          data-testid="admin-product-stock"
        />
      </label>

      <label className="transferField">
        מידע על המוצר
        <textarea
          name="description"
          rows={5}
          defaultValue={product?.description ?? ""}
          data-testid="admin-product-description"
        />
      </label>

      {mainPreview ? (
        <div
          className="adminPreview"
          style={{ backgroundImage: toCssImageUrl(mainPreview) }}
          aria-label="תמונה נוכחית"
          data-testid="admin-product-preview"
        />
      ) : null}

      <label className="transferField">
        קישור לתמונה ראשית
        <input
          type="text"
          name="imageUrls"
          defaultValue={product?.image ?? ""}
          inputMode="url"
          placeholder="https:// או /uploads/..."
          data-testid="admin-product-image-url"
        />
      </label>

      <label className="transferField">
        או העלאת תמונה ראשית
        <input
          type="file"
          name="imageFile"
          accept={PRODUCT_IMAGE_ACCEPT}
          data-testid="admin-product-image-file"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) {
              return;
            }
            const nextUrl = URL.createObjectURL(file);
            setPreviewObjectUrl((current) => {
              if (current) {
                URL.revokeObjectURL(current);
              }
              return nextUrl;
            });
            setMainPreview(nextUrl);
            setChosenFileName(file.name);
          }}
        />
        <span className="adminHint">
          JPG, PNG, WEBP או GIF עד 4MB. מהאייפון שמרו כ-JPG.
          {chosenFileName ? ` נבחר: ${chosenFileName}` : ""}
        </span>
      </label>

      <fieldset className="adminFieldset">
        <legend>תמונות נוספות</legend>
        {extraUrls.map((url, index) => (
          <input
            key={`${url}-${index}`}
            type="text"
            name="extraImageUrls"
            value={url}
            inputMode="url"
            placeholder="https:// או /uploads/..."
            onChange={(event) => {
              const next = [...extraUrls];
              next[index] = event.target.value;
              setExtraUrls(next);
            }}
          />
        ))}
        <button
          className="buttonSecondary actionLink"
          type="button"
          onClick={() => setExtraUrls((current) => [...current, ""])}
        >
          קישור תמונה נוסף
        </button>
        <label className="transferField">
          העלאת תמונות נוספות
          <input
            type="file"
            name="extraImageFiles"
            accept={PRODUCT_IMAGE_ACCEPT}
            multiple
          />
        </label>
      </fieldset>

      <label className="transferCheck">
        <input type="checkbox" name="isActive" defaultChecked={product?.isActive ?? true} />
        להציג את המוצר בחנות
      </label>

      <button className="button" type="submit" disabled={pending} data-testid="admin-product-save">
        {pending ? "שומרים..." : "שמירת מוצר"}
      </button>
      {error ? <p className="checkoutError">{error}</p> : null}
    </form>
  );
}
