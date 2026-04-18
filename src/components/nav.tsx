"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { LanguageToggle } from "@/components/language-toggle";

export function Nav() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  const links = [
    { href: `/${locale}/ingredients/`, label: t("ingredients"), accent: false },
    { href: `/${locale}/recipes/`, label: t("recipes"), accent: false },
    { href: `/${locale}/sources/`, label: t("sources"), accent: false },
    { href: `/${locale}/support/`, label: t("support"), accent: true },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-bg/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href={`/${locale}/`}
          className="flex items-center gap-2.5 font-display text-lg font-normal text-text !no-underline !border-none hover:text-accent transition-colors"
          onClick={() => setOpen(false)}
        >
          <Image src="/logo.svg" alt="" width={28} height={28} className="shrink-0" />
          Longevity Wiki
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm !no-underline !border-none transition-colors ${
                link.accent
                  ? "font-semibold text-accent hover:text-accent-hover"
                  : "text-muted hover:text-accent"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <LanguageToggle />
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Menu"
        >
          <span
            className={`w-5 h-0.5 bg-text transition-transform duration-200 ${
              open ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`w-5 h-0.5 bg-text transition-opacity duration-200 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`w-5 h-0.5 bg-text transition-transform duration-200 ${
              open ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-bg/95 backdrop-blur-sm">
          <div className="max-w-[1200px] mx-auto px-6 py-4 flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`text-sm !no-underline !border-none transition-colors py-1 ${
                  link.accent
                    ? "font-semibold text-accent"
                    : "text-muted hover:text-accent"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border">
              <LanguageToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
