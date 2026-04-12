import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { BackToTop } from "@/components/back-to-top";
import { Nav } from "@/components/nav";
import { SmoothScroll } from "@/components/smooth-scroll";
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
  title: "Longevity Wiki",
  description:
    "Science-backed longevity food encyclopedia. 101 ingredients, grounded in research.",
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
        <Nav />
        {children}
        <BackToTop />
      </body>
    </html>
  );
}
