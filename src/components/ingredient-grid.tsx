"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { AlphaGroupedGrid } from "@/components/alpha-grouped-grid";
import { sortItems, groupByFirstLetter, type SortBy } from "@/lib/utils";

interface IngredientCard {
  slug: string;
  title: string;
  category: string;
  longevity_score: number;
  tags: string[];
}

const CATEGORY_LABELS: Record<string, string> = {
  all: "All",
  vegetable: "Vegetables",
  fruit: "Fruits",
  legume: "Legumes",
  grain: "Grains",
  nut: "Nuts",
  seed: "Seeds",
  spice: "Spices",
  herb: "Herbs",
  oil_condiment: "Oils",
  fish_seafood: "Fish",
  beverage: "Beverages",
};

export function IngredientGrid({ ingredients }: { ingredients: IngredientCard[] }) {
  const locale = useLocale();
  const t = useTranslations("ingredients");
  const tCat = useTranslations("categories");
  const [active, setActive] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("asc");

  const categories = ["all", ...new Set(ingredients.map((i) => i.category))];

  const filtered = useMemo(() => {
    const base = ingredients
      .filter((i) => active === "all" || i.category === active)
      .filter(
        (i) =>
          !search ||
          i.title.toLowerCase().includes(search.toLowerCase()) ||
          i.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      );
    return sortItems(base, sortBy);
  }, [ingredients, active, search, sortBy]);

  const letters = useMemo(() => {
    const grouped = groupByFirstLetter(filtered);
    return Array.from(grouped.keys()).sort((a, b) =>
      a === "#" ? 1 : b === "#" ? -1 : sortBy === "desc" ? b.localeCompare(a) : a.localeCompare(b)
    );
  }, [filtered, sortBy]);

  const [activeLetter, setActiveLetter] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveLetter(visible[0].target.id.replace("letter-", ""));
        }
      },
      { rootMargin: "-200px 0px -55% 0px", threshold: 0 }
    );
    letters.forEach((letter) => {
      const el = document.getElementById(`letter-${letter}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [letters, sortBy]);

  const scrollToLetter = (letter: string) => {
    const el = document.getElementById(`letter-${letter}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      {/* Sticky filter bar */}
      <div className="sticky top-14 z-20 bg-bg/95 backdrop-blur-sm border-b border-border py-4 mb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center gap-4 mb-3">
          <input
            type="text"
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs px-4 py-2 text-sm bg-surface border border-border rounded-md text-text placeholder:text-muted/60 focus:outline-none focus:border-accent transition-colors"
          />
          <span className="text-sm text-muted shrink-0">
            {t("count", { count: filtered.length })}
            {active !== "all" && ` ${t("in_category", { category: tCat.has(active) ? tCat(active) : active })}`}
            {search && ` ${t("matching", { query: search })}`}
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto flex-nowrap lg:flex-wrap pb-3 lg:pb-0 pr-8 lg:pr-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-sm border transition-colors duration-150 capitalize shrink-0 ${
                active === cat
                  ? "bg-accent text-white border-accent"
                  : "bg-transparent text-muted border-border hover:border-accent hover:text-accent"
              }`}
            >
              {tCat.has(cat) ? tCat(cat) : (CATEGORY_LABELS[cat] || cat)}
              {cat !== "all" && (
                <span className="ml-1 opacity-60">
                  {ingredients.filter((i) => i.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main layout: sidebar + content */}
      <div className="flex gap-3 lg:gap-10">
        {/* Left sidebar */}
        <aside className="flex flex-col gap-6 w-10 lg:w-32 shrink-0">
          <div className="sticky top-50 lg:top-[224px]">
            {/* Sort */}
            <div className="mb-6 lg:mb-10">
              <button
                onClick={() => setSortBy(sortBy === "asc" ? "desc" : "asc")}
                className="flex items-center gap-1 text-xs lg:text-sm text-left px-0 py-1 text-muted hover:text-text transition-colors"
              >
                {sortBy === "asc" ? t("sort_asc") : t("sort_desc")}
                <svg
                  width="10" height="10" viewBox="0 0 10 10" fill="none"
                  className={`transition-transform duration-200 ${sortBy === "desc" ? "rotate-180" : ""}`}
                >
                  <path d="M5 2L5 8M5 8L2 5M5 8L8 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Letter jump nav */}
            {letters.length > 0 && (
              <div className="flex flex-col gap-0.5">
                {letters.map((letter) => (
                  <button
                    key={letter}
                    onClick={() => scrollToLetter(letter)}
                    className={`text-sm lg:text-base text-left px-0 py-0.5 transition-colors font-mono ${
                      activeLetter === letter
                        ? "text-accent font-semibold"
                        : "text-muted hover:text-accent"
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">

          {/* Grid */}
          <AlphaGroupedGrid
            items={filtered}
            reverse={sortBy === "desc"}
            gridClassName="flex flex-col divide-y divide-border sm:grid sm:grid-cols-2 md:grid-cols-3 sm:gap-6 sm:divide-y-0"
            renderCard={(entry) => (
              <Link
                key={entry.slug}
                href={`/${locale}/ingredients/${entry.slug}/`}
                className="group flex flex-row items-center gap-4 py-3 !no-underline transition-all duration-200 sm:gap-5 sm:p-5 sm:bg-surface sm:border sm:border-border sm:rounded-lg sm:hover:border-accent sm:hover:shadow-md sm:hover:shadow-accent/30 sm:overflow-hidden sm:relative sm:h-full"
              >
                <div className="w-12 h-12 sm:w-20 sm:h-20 flex items-center justify-center shrink-0 rounded-md border border-border group-hover:border-accent group-hover:shadow-md group-hover:shadow-accent/30 transition-all duration-200 overflow-hidden">
                  <Image
                    src={`/icons/${entry.slug}.webp`}
                    alt=""
                    width={80}
                    height={80}
                    className="w-full h-full opacity-70 group-hover:opacity-100 transition-opacity duration-200"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <h3 className="font-display text-sm sm:text-lg font-normal mb-0 sm:mb-1 text-text truncate">
                    {entry.title}
                  </h3>
                  <div className="text-[11px] sm:text-xs text-muted uppercase tracking-wide">
                    {CATEGORY_LABELS[entry.category] || entry.category}
                  </div>
                </div>
              </Link>
            )}
          />

          {filtered.length === 0 && (
            <p className="text-muted text-center py-12">
              {t("no_results")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
