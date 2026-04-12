import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { BackToTop } from "@/components/back-to-top";
import { Nav } from "@/components/nav";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ScrollToTop } from "@/components/scroll-to-top";
import { Footer } from "@/components/footer";
import { GoogleAnalytics } from "@next/third-parties/google";
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

export const metadata: Metadata = {
  title: {
    default: "Longevity Wiki — Science-Backed Foods for Healthy Aging",
    template: "%s | Longevity Wiki",
  },
  description:
    "Free encyclopedia of longevity foods, anti-aging ingredients, and healthy aging recipes. Evidence-based nutrition from peer-reviewed research.",
  keywords: [
    "longevity diet", "anti-aging foods", "healthy aging", "superfoods",
    "Mediterranean diet", "longevity recipes", "anti-inflammatory foods",
    "healthspan", "blue zones diet", "science-backed nutrition",
    "dieta longevidad", "alimentos anti envejecimiento", "recetas saludables",
  ],
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
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${fraunces.variable} ${instrumentSans.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <SmoothScroll />
          <ScrollToTop />
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
