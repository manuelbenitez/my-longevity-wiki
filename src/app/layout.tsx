import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { BackToTop } from "@/components/back-to-top";
import { Nav } from "@/components/nav";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ScrollToTop } from "@/components/scroll-to-top";
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

export const metadata: Metadata = {
  title: {
    default: "Longevity Wiki — Science-Backed Foods for Healthy Aging",
    template: "%s | Longevity Wiki",
  },
  description:
    "Free encyclopedia of longevity foods, anti-aging ingredients, and healthy aging recipes. Evidence-based nutrition from peer-reviewed research. Discover superfoods, Mediterranean diet ingredients, and plant-based foods that promote a longer, healthier life.",
  keywords: [
    "longevity diet",
    "anti-aging foods",
    "healthy aging",
    "longevity foods",
    "superfoods",
    "Mediterranean diet",
    "plant-based nutrition",
    "longevity recipes",
    "healthy recipes",
    "anti-inflammatory foods",
    "gut health foods",
    "longevity nutrition",
    "foods that slow aging",
    "healthspan",
    "blue zones diet",
    "curcumin",
    "polyphenols",
    "omega-3 foods",
    "antioxidant rich foods",
    "science-backed nutrition",
  ],
  openGraph: {
    title: "Longevity Wiki — Science-Backed Foods for Healthy Aging",
    description:
      "Free encyclopedia of 59+ longevity ingredients and 18 healthy aging recipes. Every claim grounded in peer-reviewed research.",
    type: "website",
    locale: "en_US",
    siteName: "Longevity Wiki",
  },
  twitter: {
    card: "summary_large_image",
    title: "Longevity Wiki — Science-Backed Foods for Healthy Aging",
    description:
      "Free encyclopedia of longevity foods and anti-aging recipes. Evidence-based nutrition from peer-reviewed research.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/logo-large.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${instrumentSans.variable}`}
    >
      <body>
        <SmoothScroll />
        <ScrollToTop />
        <Nav />
        {children}
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
