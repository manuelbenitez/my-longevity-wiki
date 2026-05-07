"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";

export function Footer() {
  const tNav = useTranslations("nav");
  const tFooter = useTranslations("footer");
  const locale = useLocale();

  return (
    <footer className="max-w-[1200px] mx-auto px-6 py-12 border-t border-border">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <Image
            src="/brand/longevity-wiki-wordmark.webp"
            alt="Longevity Wiki"
            width={186}
            height={60}
            className="h-11 w-auto mb-1"
          />
          <p className="text-xs text-muted">{tFooter("description")}</p>
        </div>
        <div className="flex gap-6">
          <Link href={`/${locale}/#ingredients`} className="text-xs text-muted hover:text-accent !no-underline !border-none transition-colors">
            {tNav("ingredients")}
          </Link>
          <Link href={`/${locale}/#recipes`} className="text-xs text-muted hover:text-accent !no-underline !border-none transition-colors">
            {tNav("recipes")}
          </Link>
          <Link href={`/${locale}/sources/`} className="text-xs text-muted hover:text-accent !no-underline !border-none transition-colors">
            {tNav("sources")}
          </Link>
          <Link href={`/${locale}/about/`} className="text-xs text-muted hover:text-accent !no-underline !border-none transition-colors">
            {tNav("about")}
          </Link>
          <Link href={`/${locale}/support/`} className="text-xs text-muted hover:text-accent !no-underline !border-none transition-colors">
            {tNav("support")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
