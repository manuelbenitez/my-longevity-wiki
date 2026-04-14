import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://longevity.wiki";

export const metadata: Metadata = {
  title: {
    default: "Longevity Wiki — Science-Backed Foods for Healthy Aging",
    template: "%s | Longevity Wiki",
  },
  description:
    "Free encyclopedia of longevity foods, anti-aging ingredients, and healthy aging recipes.",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Longevity Wiki",
    title: "Longevity Wiki — Science-Backed Foods for Healthy Aging",
    description:
      "Free encyclopedia of longevity foods, anti-aging ingredients, and healthy aging recipes.",
    url: SITE_URL,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Longevity Wiki — Science-Backed Foods for Healthy Aging",
      },
    ],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg", apple: "/logo-large.svg" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Longevity Wiki",
  url: SITE_URL,
  description:
    "Free encyclopedia of longevity foods, anti-aging ingredients, and healthy aging recipes.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/en/ingredients?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${instrumentSans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
      </body>
      <GoogleAnalytics gaId="G-TEEYF701CL" />
    </html>
  );
}
