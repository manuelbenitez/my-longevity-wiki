"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { LanguageToggle } from "@/components/language-toggle";

export function Nav() {
  const t = useTranslations("nav");
  const locale = useLocale();

  return (
    <nav className="sticky top-0 z-40 bg-bg/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href={`/${locale}/`}
          className="flex items-center gap-2.5 font-display text-lg font-normal text-text !no-underline !border-none hover:text-accent transition-colors"
        >
          <Image src="/logo.svg" alt="" width={28} height={28} className="shrink-0" />
          Longevity Wiki
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href={`/${locale}/#ingredients`}
            className="text-sm text-muted hover:text-accent !no-underline !border-none transition-colors"
          >
            {t("ingredients")}
          </Link>
          <Link
            href={`/${locale}/#recipes`}
            className="text-sm text-muted hover:text-accent !no-underline !border-none transition-colors"
          >
            {t("recipes")}
          </Link>
          <Link
            href={`/${locale}/sources/`}
            className="text-sm text-muted hover:text-accent !no-underline !border-none transition-colors"
          >
            {t("sources")}
          </Link>
          <Link
            href={`/${locale}/support/`}
            className="text-sm font-semibold text-accent hover:text-accent-hover !no-underline !border-none transition-colors"
          >
            {t("support")}
          </Link>
          <LanguageToggle />
        </div>
      </div>
    </nav>
  );
}
