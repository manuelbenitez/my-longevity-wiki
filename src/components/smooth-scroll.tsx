"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

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
    };
  }, []);

  return null;
}
