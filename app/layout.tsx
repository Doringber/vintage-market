import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "שנית | וינטג׳, יד שנייה ודברים עם סיפור",
  description: "חנות אוצרות יד שנייה, וינטג׳ ופריטים מיוחדים.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
