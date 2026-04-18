"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { StaggerGrid, StaggerItem } from "@/components/animate-in";
import { AlphaGroupedGrid } from "@/components/alpha-grouped-grid";
import { sortItems, groupByFirstLetter, type SortBy } from "@/lib/utils";

interface RecipeCard {
  slug: string;
  title: string;
  prep_time?: string;
  cook_time?: string;
  difficulty?: string;
  longevity_ingredients?: string[];
  tags?: string[];
}

function slugToLabel(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function RecipeGrid({ recipes }: { recipes: RecipeCard[] }) {
  const locale = useLocale();
  const t = useTranslations("recipes");
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [sortBy, setSortBy] = useState<SortBy>("asc");

  const difficulties = ["all", ...new Set(recipes.map((r) => r.difficulty).filter(Boolean))];

  const filtered = useMemo(() => {
    const base = recipes
      .filter((r) => difficulty === "all" || r.difficulty === difficulty)
      .filter(
        (r) =>
          !search ||
          r.title.toLowerCase().includes(search.toLowerCase()) ||
          r.longevity_ingredients?.some((ing) =>
            ing.toLowerCase().includes(search.toLowerCase())
          )
      );
    return sortItems(base, sortBy);
  }, [recipes, difficulty, search, sortBy]);

  const letters = useMemo(() => {
    if (sortBy !== "asc") return [];
    const grouped = groupByFirstLetter(filtered);
    return Array.from(grouped.keys()).sort((a, b) =>
      a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b)
    );
  }, [filtered, sortBy]);

  const [activeLetter, setActiveLetter] = useState("");

  useEffect(() => {
    if (sortBy !== "asc") return;
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

  const recipeCard = (recipe: RecipeCard) => (
    <Link
      key={recipe.slug}
      href={`/${locale}/recipes/${recipe.slug}/`}
      className="flex flex-col bg-surface border border-border rounded-lg p-6 hover:border-accent transition-all duration-200 !no-underline hover:-translate-y-0.5 h-full"
    >
      <div className="flex gap-2 mb-3">
        {recipe.prep_time && (
          <span className="text-xs font-semibold border border-border rounded-sm px-3 py-1.5 text-muted capitalize">
            {recipe.prep_time}
          </span>
        )}
        {recipe.difficulty && (
          <span className="text-xs font-semibold border border-border rounded-sm px-3 py-1.5 text-muted capitalize">
            {recipe.difficulty}
          </span>
        )}
      </div>
      <h3 className="font-display text-xl font-normal mb-3 text-text">
        {recipe.title}
      </h3>
      <div className="flex gap-1.5 flex-wrap mt-auto">
        {recipe.longevity_ingredients?.slice(0, 4).map((ing) => (
          <span
            key={ing}
            className="text-xs font-semibold border border-border rounded-sm px-2 py-1 text-muted"
          >
            {slugToLabel(ing)}
          </span>
        ))}
      </div>
    </Link>
  );

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
            {search && ` matching "${search}"`}
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto flex-nowrap lg:flex-wrap pb-1 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-none">
          {difficulties.map((d) => (
            <button
              key={d || "all"}
              onClick={() => setDifficulty(d || "all")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-sm border transition-colors duration-150 capitalize shrink-0 ${
                difficulty === d
                  ? "bg-accent text-white border-accent"
                  : "bg-transparent text-muted border-border hover:border-accent hover:text-accent"
              }`}
            >
              {d === "all" ? t("all") : d}
              {d !== "all" && (
                <span className="ml-1 opacity-60">
                  {recipes.filter((r) => r.difficulty === d).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main layout: sidebar + content */}
      <div className="flex gap-10">
        {/* Left sidebar — desktop only */}
        <aside className="hidden lg:flex flex-col gap-6 w-32 shrink-0">
          <div className="sticky top-[224px]">
            {/* Sort */}
            <div className="flex flex-col gap-1 mb-10">
              <button
                onClick={() => setSortBy("asc")}
                className={`text-sm text-left px-0 py-1 transition-colors ${
                  sortBy === "asc" ? "text-text font-semibold" : "text-muted hover:text-text"
                }`}
              >
                {t("sort_asc")}
              </button>
              <button
                onClick={() => setSortBy("desc")}
                className={`text-sm text-left px-0 py-1 transition-colors ${
                  sortBy === "desc" ? "text-text font-semibold" : "text-muted hover:text-text"
                }`}
              >
                {t("sort_desc")}
              </button>
            </div>

            {/* Letter jump nav — only in A-Z mode */}
            {sortBy === "asc" && letters.length > 0 && (
              <div className="flex flex-col gap-0.5">
                {letters.map((letter) => (
                  <button
                    key={letter}
                    onClick={() => scrollToLetter(letter)}
                    className={`text-base text-left px-0 py-0.5 transition-colors font-mono ${
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
          {/* Mobile sort buttons */}
          <div className="flex gap-2 mb-4 lg:hidden">
            <button
              onClick={() => setSortBy("asc")}
              className={`text-xs font-medium px-3 py-1.5 rounded-sm border transition-colors duration-150 ${
                sortBy === "asc"
                  ? "bg-text text-bg border-text"
                  : "bg-transparent text-muted border-border hover:border-text hover:text-text"
              }`}
            >
              {t("sort_asc")}
            </button>
            <button
              onClick={() => setSortBy("desc")}
              className={`text-xs font-medium px-3 py-1.5 rounded-sm border transition-colors duration-150 ${
                sortBy === "desc"
                  ? "bg-text text-bg border-text"
                  : "bg-transparent text-muted border-border hover:border-text hover:text-text"
              }`}
            >
              {t("sort_desc")}
            </button>
          </div>


          {/* Grid */}
          {sortBy === "asc" ? (
            <AlphaGroupedGrid
              items={filtered}
              renderCard={recipeCard}
            />
          ) : (
            <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((recipe) => (
                <StaggerItem key={recipe.slug}>
                  {recipeCard(recipe)}
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
      </div>
    </div>
  );
}
