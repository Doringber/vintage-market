"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="contentPage">
      <h1>האדמין נתקע</h1>
      <p>השמירה או הטעינה מהענן נכשלה. אפשר לנסות שוב, או לבדוק את מפתחות Supabase ב-Vercel.</p>
      {error.message ? <p className="checkoutError">{error.message}</p> : null}
      <button className="button" type="button" onClick={() => reset()}>
        לנסות שוב
      </button>
    </main>
  );
}
