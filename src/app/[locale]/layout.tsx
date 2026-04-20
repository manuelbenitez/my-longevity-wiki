import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { BackToTop } from "@/components/back-to-top";
import { Nav } from "@/components/nav";
import { SmoothScroll } from "@/components/smooth-scroll";
import { Footer } from "@/components/footer";
import "./globals.css";

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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://longevity.mbdev.to";

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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Longevity Wiki",
    url: SITE_URL,
    inLanguage: locale,
    description:
      "Free encyclopedia of longevity foods, anti-aging ingredients, and healthy aging recipes.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/${locale}/ingredients?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang={locale} className={`${fraunces.variable} ${instrumentSans.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextIntlClientProvider messages={messages}>
          <SmoothScroll />
          <Nav />
          {children}
          <Footer />
          <BackToTop />
        </NextIntlClientProvider>
      </body>
      <GoogleAnalytics gaId="G-TEEYF701CL" />
    </html>
  );
}
