import type { Metadata } from "next";
import { Noto_Serif_Malayalam, Noto_Sans_Malayalam } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

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

export const metadata: Metadata = {
  title: {
    template: "%s · ബോധനം",
    default: "ബോധനം | Bodhanam Quarterly",
  },
  description:
    "ബോധനം - A Malayalam Islamic quarterly research journal exploring scholarship, spirituality, and contemporary thought.",
  icons: {
    icon: "/images/icon.png",
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
      className={`${notoSerifMalayalam.variable} ${notoSansMalayalam.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-paper text-ink antialiased">
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
