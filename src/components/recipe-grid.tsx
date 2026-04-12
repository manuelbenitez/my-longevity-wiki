"use client";

import Link from "next/link";
import { useState } from "react";
import { StaggerGrid, StaggerItem } from "@/components/animate-in";

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
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");

  const difficulties = ["all", ...new Set(recipes.map((r) => r.difficulty).filter(Boolean))];

  const filtered = recipes
    .filter((r) => difficulty === "all" || r.difficulty === difficulty)
    .filter(
      (r) =>
        !search ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.longevity_ingredients?.some((ing) =>
          ing.toLowerCase().includes(search.toLowerCase())
        )
    );

  return (
    <div>
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search recipes or ingredients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs px-4 py-2 text-sm bg-surface border border-border rounded-md text-text placeholder:text-muted/60 focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Difficulty filters */}
      <div className="flex gap-2 flex-wrap mb-8">
        {difficulties.map((d) => (
          <button
            key={d || "all"}
            onClick={() => setDifficulty(d || "all")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-sm border transition-colors duration-150 capitalize ${
              difficulty === d
                ? "bg-accent text-white border-accent"
                : "bg-transparent text-muted border-border hover:border-accent hover:text-accent"
            }`}
          >
            {d === "all" ? "All" : d}
            {d !== "all" && (
              <span className="ml-1 opacity-60">
                {recipes.filter((r) => r.difficulty === d).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-sm text-muted mb-6">
        {filtered.length} recipe{filtered.length !== 1 ? "s" : ""}
        {search && ` matching "${search}"`}
      </p>

      {/* Grid */}
      <StaggerGrid
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        key={difficulty + search}
      >
        {filtered.map((recipe) => (
          <StaggerItem key={recipe.slug}>
            <Link
              href={`/recipes/${recipe.slug}/`}
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
          </StaggerItem>
        ))}
      </StaggerGrid>

      {filtered.length === 0 && (
        <p className="text-muted text-center py-12">
          No recipes found. Try a different search term.
        </p>
      )}
    </div>
  );
}
