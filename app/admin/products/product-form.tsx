"use client";

import { useEffect, useState } from "react";
import { saveAdminProduct } from "../../actions/admin";
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

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    extraUrls.forEach((url) => {
      if (url.trim()) {
        formData.append("imageUrls", url.trim());
      }
    });
    const result = await saveAdminProduct(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <form
      className="adminForm"
      action={handleSubmit}
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
