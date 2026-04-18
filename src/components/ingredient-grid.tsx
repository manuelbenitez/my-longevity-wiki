"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { StaggerGrid, StaggerItem } from "@/components/animate-in";
import { AlphaGroupedGrid } from "@/components/alpha-grouped-grid";
import { sortItems, type SortBy } from "@/lib/utils";

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
  const [sortBy, setSortBy] = useState<SortBy>("default");

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

  const SORT_OPTIONS: { value: SortBy; label: string }[] = [
    { value: "default", label: t("sort_default") },
    { value: "alpha", label: t("sort_alpha") },
    { value: "score", label: t("sort_score") },
  ];

  return (
    <div>
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder={t("search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs px-4 py-2 text-sm bg-surface border border-border rounded-md text-text placeholder:text-muted/60 focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-sm border transition-colors duration-150 capitalize ${
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

      {/* Sort buttons */}
      <div className="flex gap-2 flex-wrap mb-8">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSortBy(opt.value)}
            className={`text-xs font-medium px-3 py-1.5 rounded-sm border transition-colors duration-150 ${
              sortBy === opt.value
                ? "bg-text text-bg border-text"
                : "bg-transparent text-muted border-border hover:border-text hover:text-text"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-sm text-muted mb-6">
        {t("count", { count: filtered.length })}
        {active !== "all" && ` ${t("in_category", { category: tCat.has(active) ? tCat(active) : active })}`}
        {search && ` ${t("matching", { query: search })}`}
      </p>

      {/* Grid */}
      {sortBy === "alpha" ? (
        <AlphaGroupedGrid
          items={filtered}
          renderCard={(entry) => (
            <Link
              key={entry.slug}
              href={`/${locale}/ingredients/${entry.slug}/`}
              className="group flex flex-col items-center bg-surface border border-border rounded-lg p-6 text-center hover:border-accent transition-all duration-200 !no-underline overflow-hidden relative hover:-translate-y-0.5 h-full"
            >
              <div className="w-12 h-12 mb-4 flex items-center justify-center">
                <Image
                  src={`/icons/${entry.slug}.svg`}
                  alt=""
                  width={48}
                  height={48}
                  className="opacity-70 group-hover:opacity-100 transition-opacity"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              <h3 className="font-display text-lg font-normal mb-1 text-text">
                {entry.title}
              </h3>
              <div className="text-xs text-muted uppercase tracking-wide mt-auto">
                {CATEGORY_LABELS[entry.category] || entry.category}
              </div>
            </Link>
          )}
        />
      ) : (
        <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((entry) => (
            <StaggerItem key={entry.slug}>
              <Link
                href={`/${locale}/ingredients/${entry.slug}/`}
                className="group flex flex-col items-center bg-surface border border-border rounded-lg p-6 text-center hover:border-accent transition-all duration-200 !no-underline overflow-hidden relative hover:-translate-y-0.5 h-full"
              >
                <div className="w-12 h-12 mb-4 flex items-center justify-center">
                  <Image
                    src={`/icons/${entry.slug}.svg`}
                    alt=""
                    width={48}
                    height={48}
                    className="opacity-70 group-hover:opacity-100 transition-opacity"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                <h3 className="font-display text-lg font-normal mb-1 text-text">
                  {entry.title}
                </h3>
                <div className="text-xs text-muted uppercase tracking-wide mt-auto">
                  {CATEGORY_LABELS[entry.category] || entry.category}
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGrid>
      )}

      {filtered.length === 0 && (
        <p className="text-muted text-center py-12">
          {t("no_results")}
        </p>
      )}
    </div>
  );
}
