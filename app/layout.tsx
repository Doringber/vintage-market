import type { Metadata, Viewport } from "next";
import { Assistant, Frank_Ruhl_Libre } from "next/font/google";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { StoreProvider } from "./components/store-context";
import "./globals.css";

const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
  variable: "--font-body",
});

const frankRuhlLibre = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "חנות קטנה ומטריפה | יד שנייה לילדים",
  description:
    "חנות יד שנייה מגניבה לילדים - בגדים, מציאות ושאר דברים במחירים שפויים. בלי הבטחה לבדיקה או לווינטג׳.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${assistant.variable} ${frankRuhlLibre.variable}`}>
        <StoreProvider>
          <a className="skipLink" href="#main-content">
            דילוג לתוכן
          </a>
          <SiteHeader />
          <div id="main-content">{children}</div>
          <SiteFooter />
        </StoreProvider>
      </body>
    </html>
  );
}
