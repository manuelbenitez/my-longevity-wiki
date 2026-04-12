import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { LanguageToggle } from "@/components/language-toggle";

export function Nav() {
  const t = useTranslations("nav");

  return (
    <nav className="sticky top-0 z-40 bg-bg/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display text-lg font-normal text-text !no-underline !border-none hover:text-accent transition-colors"
        >
          <Image src="/logo.svg" alt="" width={28} height={28} className="shrink-0" />
          Longevity Wiki
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/#ingredients"
            className="text-sm text-muted hover:text-accent !no-underline !border-none transition-colors"
          >
            {t("ingredients")}
          </Link>
          <Link
            href="/#recipes"
            className="text-sm text-muted hover:text-accent !no-underline !border-none transition-colors"
          >
            {t("recipes")}
          </Link>
          <Link
            href="/sources/"
            className="text-sm text-muted hover:text-accent !no-underline !border-none transition-colors"
          >
            {t("sources")}
          </Link>
          <Link
            href="/support/"
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
