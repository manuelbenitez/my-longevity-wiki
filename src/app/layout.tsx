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

export const metadata: Metadata = {
  title: {
    default: "Longevity Wiki — Science-Backed Foods for Healthy Aging",
    template: "%s | Longevity Wiki",
  },
  description:
    "Free encyclopedia of longevity foods, anti-aging ingredients, and healthy aging recipes.",
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg", apple: "/logo-large.svg" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${instrumentSans.variable}`}>
      <body>
        {children}
      </body>
      <GoogleAnalytics gaId="G-TEEYF701CL" />
    </html>
  );
}
