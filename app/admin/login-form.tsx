"use client";

import { useState } from "react";
import { loginAdmin } from "../actions/admin";

export function AdminLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await loginAdmin(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <form className="adminForm" action={handleSubmit}>
      <label className="transferField">
        סיסמת אדמין
        <input type="password" name="password" autoComplete="current-password" required />
      </label>
      <button className="button" type="submit" disabled={pending}>
        {pending ? "נכנסים..." : "כניסה"}
      </button>
      {error ? <p className="checkoutError">{error}</p> : null}
    </form>
  );
}
