"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { StaggerGrid, StaggerItem } from "@/components/animate-in";

interface IngredientCard {
  slug: string;
  title: string;
  category: string;
  longevity_score: number;
  tags: string[];
}

const CATEGORY_EMOJI: Record<string, string> = {
  vegetable: "🥬",
  fruit: "🍎",
  legume: "🫘",
  grain: "🌾",
  nut: "🥜",
  seed: "🌱",
  spice: "🌶",
  herb: "🌿",
  oil_condiment: "🫒",
  fish_seafood: "🐟",
  beverage: "🍵",
};

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
  const [active, setActive] = useState("all");
  const [search, setSearch] = useState("");

  const categories = ["all", ...new Set(ingredients.map((i) => i.category))];

  const filtered = ingredients
    .filter((i) => active === "all" || i.category === active)
    .filter(
      (i) =>
        !search ||
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        i.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => (b.longevity_score || 0) - (a.longevity_score || 0));

  return (
    <div>
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search ingredients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs px-4 py-2 text-sm bg-surface border border-border rounded-md text-text placeholder:text-muted/60 focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap mb-8">
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
            {CATEGORY_LABELS[cat] || cat}
            {cat !== "all" && (
              <span className="ml-1 opacity-60">
                {ingredients.filter((i) => i.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-sm text-muted mb-6">
        {filtered.length} ingredient{filtered.length !== 1 ? "s" : ""}
        {active !== "all" && ` in ${CATEGORY_LABELS[active] || active}`}
        {search && ` matching "${search}"`}
      </p>

      {/* Grid */}
      <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" key={active + search}>
        {filtered.map((entry) => (
          <StaggerItem key={entry.slug}>
          <Link
            key={entry.slug}
            href={`/ingredients/${entry.slug}/`}
            className="group flex flex-col items-center bg-surface border border-border rounded-lg p-6 text-center hover:border-accent transition-all duration-200 !no-underline overflow-hidden relative hover:-translate-y-0.5 h-full"
          >
            <div className="w-12 h-12 mb-4 flex items-center justify-center">
              <Image
                src={`/icons/${entry.slug}.svg`}
                alt=""
                width={48}
                height={48}
                className="opacity-70 group-hover:opacity-100 transition-opacity"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
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

      {filtered.length === 0 && (
        <p className="text-muted text-center py-12">
          No ingredients found. Try a different filter or search term.
        </p>
      )}
    </div>
  );
}
