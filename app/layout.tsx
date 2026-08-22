import type { Metadata, Viewport } from "next";
import { Fredoka, Playpen_Sans_Hebrew } from "next/font/google";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { StoreProvider } from "./components/store-context";
import "./globals.css";

const playpenSansHebrew = Playpen_Sans_Hebrew({
  subsets: ["hebrew", "latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--font-display",
});

const fredoka = Fredoka({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-body",
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
      <body className={`${playpenSansHebrew.variable} ${fredoka.variable}`}>
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
