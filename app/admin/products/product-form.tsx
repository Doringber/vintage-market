"use client";

import { useState } from "react";
import { saveAdminProduct } from "../../actions/admin";
import type { CatalogProduct } from "../../../lib/catalog/types";

type ProductFormProps = {
  product?: CatalogProduct;
};

export function ProductForm({ product }: ProductFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [extraUrls, setExtraUrls] = useState<string[]>(product?.images ?? [""]);

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
    <form className="adminForm" action={handleSubmit}>
      {product ? <input type="hidden" name="slug" value={product.slug} /> : null}

      <label className="transferField">
        כותרת
        <input type="text" name="name" defaultValue={product?.name ?? ""} required minLength={2} />
      </label>

      <label className="transferField">
        קטגוריה
        <input
          type="text"
          name="category"
          defaultValue={product?.category ?? "דברי ילדים"}
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
        />
      </label>

      <label className="transferField">
        מלאי
        <input type="number" name="stock" min={0} step="1" defaultValue={product?.stock ?? 1} />
      </label>

      <label className="transferField">
        מידע על המוצר
        <textarea name="description" rows={5} defaultValue={product?.description ?? ""} />
      </label>

      {product?.image ? (
        <div
          className="adminPreview"
          style={{ backgroundImage: `url(${product.image})` }}
          aria-label="תמונה נוכחית"
        />
      ) : null}

      <label className="transferField">
        קישור לתמונה ראשית
        <input type="url" name="imageUrls" defaultValue={product?.image ?? ""} />
      </label>

      <label className="transferField">
        או העלאת תמונה ראשית
        <input type="file" name="imageFile" accept="image/jpeg,image/png,image/webp,image/gif" />
      </label>

      <fieldset className="adminFieldset">
        <legend>תמונות נוספות</legend>
        {extraUrls.map((url, index) => (
          <input
            key={`${url}-${index}`}
            type="url"
            value={url}
            placeholder="https://..."
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
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
          />
        </label>
      </fieldset>

      <label className="transferCheck">
        <input type="checkbox" name="isActive" defaultChecked={product?.isActive ?? true} />
        להציג את המוצר בחנות
      </label>

      <button className="button" type="submit" disabled={pending}>
        {pending ? "שומרים..." : "שמירת מוצר"}
      </button>
      {error ? <p className="checkoutError">{error}</p> : null}
    </form>
  );
}
