import type { Metadata } from "next";
import { Noto_Serif_Malayalam, Noto_Sans_Malayalam, Poppins } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import JsonLd from "./_components/JsonLd";
import {
  DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_LOCALE, SITE_NAME, SITE_NAME_SHORT, SITE_URL, siteGraph,
} from "@/lib/seo";

const notoSerifMalayalam = Noto_Serif_Malayalam({
  variable: "--font-serif-ml",
  subsets: ["malayalam"],
  weight: ["400", "500", "600", "700"],
});

// Body/UI font — defines --font-sans-ml used by globals.css so every
// Malayalam glyph (incl. conjuncts) renders from the webfont, not a system fallback.
const notoSansMalayalam = Noto_Sans_Malayalam({
  variable: "--font-sans-ml",
  subsets: ["malayalam"],
  weight: ["400", "500", "600", "700"],
});

// English/Latin font — the Malayalam webfonts above only ship malayalam
// glyphs, so every Latin character (titles, numbers, UI chrome) falls
// through to this instead of a system font.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s · ബോധനം",
    default: SITE_NAME,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME_SHORT,
  keywords: [
    "Bodhanam", "ബോധനം", "Malayalam Islamic journal", "Islamic quarterly",
    "Islamic research Malayalam", "Quran", "Hadith", "Fiqh", "ഇസ്‌ലാം", "ഖുർആൻ",
  ],
  icons: {
    icon: "/images/icon.png",
    apple: "/images/icon.png",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    images: [{ url: DEFAULT_OG_IMAGE, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
  alternates: {
    types: { "text/plain": "/llms.txt" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ml"
      className={`${notoSerifMalayalam.variable} ${notoSansMalayalam.variable} ${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-paper text-ink antialiased">
        <JsonLd data={siteGraph()} />
        {/* Start every fresh load at the top. Next's App Router only scrolls on
            client navigations, so on reload the browser's native "auto" restore
            drops you back to the old offset — onto the loading skeleton. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('scrollRestoration' in history)history.scrollRestoration='manual';`,
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
