"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

export function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale() {
    const newLocale = locale === "en" ? "es" : "en";
    // Replace the locale segment in the path
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  }

  return (
    <button
      onClick={switchLocale}
      className="text-xs font-semibold border border-border rounded-sm px-2 py-1 text-muted hover:border-accent hover:text-accent transition-colors"
      title={locale === "en" ? "Cambiar a Espanol" : "Switch to English"}
    >
      {locale === "en" ? "ES" : "EN"}
    </button>
  );
}
