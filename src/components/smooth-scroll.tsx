"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    function handleAnchorClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      e.preventDefault();

      if (href === "#" || href.length <= 1) {
        lenis.scrollTo(0);
        window.history.replaceState(null, "", window.location.pathname);
        return;
      }

      try {
        const el = document.querySelector(href);
        if (el) {
          lenis.scrollTo(el as HTMLElement, { offset: -72 });
          window.history.replaceState(null, "", href);
        }
      } catch {
        lenis.scrollTo(0);
      }
    }

    document.addEventListener("click", handleAnchorClick);

    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      try {
        const el = document.querySelector(hash);
        if (el) {
          requestAnimationFrame(() =>
            lenis.scrollTo(el as HTMLElement, { offset: -72, immediate: true })
          );
        }
      } catch {
        // ignore
      }
    }

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Scroll to top on page navigation using Lenis so it works with the smooth scroll engine
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  return null;
}
