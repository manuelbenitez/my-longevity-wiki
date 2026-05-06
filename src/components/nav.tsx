"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { LanguageToggle } from "@/components/language-toggle";

export function Nav() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  const links = [
    { href: `/${locale}/meal-planner/`, label: t("meal_planner"), accent: true },
    { href: `/${locale}/ingredients/`, label: t("ingredients"), accent: false },
    { href: `/${locale}/recipes/`, label: t("recipes"), accent: false },
    { href: `/${locale}/sources/`, label: t("sources"), accent: false },
    { href: `/${locale}/support/`, label: t("support"), accent: false },
  ];

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <nav className="sticky top-0 z-40 bg-bg/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href={`/${locale}/`}
            className="flex h-14 items-center gap-3 font-display text-lg font-normal text-text !no-underline !border-none hover:text-accent transition-colors"
            onClick={() => setOpen(false)}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center">
              <Image src="/logo.svg" alt="" width={30} height={30} className="block" />
            </span>
            <Image
              src="/brand/longevity-wiki-wordmark-tight.webp"
              alt="Longevity Wiki"
              width={305}
              height={76}
              priority
              className="block h-7 w-auto shrink-0"
            />
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
            aria-expanded={open}
            aria-controls="mobile-menu"
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
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        className={`fixed inset-y-0 right-0 z-50 md:hidden h-dvh w-screen transform-gpu bg-[#F5F0EB] shadow-[-16px_0_40px_rgba(44,36,24,0.08)] transition-transform duration-300 ease-out ${
          open
            ? "translate-x-0 pointer-events-auto"
            : "translate-x-full pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <div className="h-full w-full flex flex-col">
          <div className="h-14 px-6 flex items-center justify-between border-b border-border">
            <Link
              href={`/${locale}/`}
              className="flex h-14 items-center font-display text-lg font-normal text-text !no-underline !border-none"
              onClick={() => setOpen(false)}
            >
              <Image
                src="/brand/longevity-wiki-wordmark-tight.webp"
                alt="Longevity Wiki"
                width={305}
                height={76}
                priority
                className="block h-7 w-auto shrink-0"
              />
            </Link>

            <button
              onClick={() => setOpen(false)}
              className="relative w-11 h-11 flex items-center justify-center"
              aria-label="Close menu"
            >
              <span className="absolute w-6 h-0.5 bg-text rotate-45" />
              <span className="absolute w-6 h-0.5 bg-text -rotate-45" />
            </button>
          </div>

          <div className="flex-1 px-6 py-10 flex flex-col">
            <div className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`font-display text-[34px] leading-tight !no-underline !border-none transition-colors py-3 ${
                    link.accent
                      ? "font-normal text-accent"
                      : "font-light text-muted hover:text-accent"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-auto pt-8 border-t border-border">
              <LanguageToggle />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
