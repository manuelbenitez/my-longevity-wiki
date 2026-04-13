import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { BackToTop } from "@/components/back-to-top";
import { Nav } from "@/components/nav";
import { SmoothScroll } from "@/components/smooth-scroll";
import { Footer } from "@/components/footer";
import "./globals.css";

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
    <NextIntlClientProvider messages={messages}>
      <SmoothScroll />
      <Nav />
      {children}
      <Footer />
      <BackToTop />
    </NextIntlClientProvider>
  );
}
