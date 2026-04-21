import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import { LenisProvider } from "./components/providers/LenisProvider";
import { Nav } from "./components/layout/Nav";
import "./globals.css";

// Manrope — headlines (SPEC 1.2)
const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

// Inter — body text (SPEC 1.2)
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://constructiva.cz"),
  title: "Constructiva — Stavíme viditelnost vašich projektů",
  description:
    "Marketingová agentura specializovaná na stavebnictví a development. Vizualizace, dokumentace, časosběry, drony, obsah a klientský portál.",
  openGraph: {
    title: "Constructiva — Stavíme viditelnost vašich projektů",
    description:
      "Marketingová agentura pro stavebnictví. Od vizualizace po hotový obsah.",
    url: "https://constructiva.cz",
    siteName: "Constructiva",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "cs_CZ",
    type: "website",
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="cs" className={`${manrope.variable} ${inter.variable}`}>
      <body className="bg-offwhite text-secondary antialiased">
        <LenisProvider>
          <Nav />
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
