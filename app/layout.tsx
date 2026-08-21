import type { Metadata } from "next";
import { Assistant } from "next/font/google";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import "./globals.css";

const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "חנות קטנה ומטריפה | וינטג׳, יד שנייה ואספנות",
  description: "חנות קטנה ומטריפה - פריטי וינטג׳, יד שנייה ואוצרות עם סיפור.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl">
      <body className={assistant.className}>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
