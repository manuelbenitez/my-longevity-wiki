"use client";

import { Suspense, useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  mealPlannerReducer,
  DEFAULT_STATE,
  type RecipeForPlanner,
} from "@/lib/meal-planner-reducer";
import { ShoppingList } from "@/components/shopping-list";

const TRIED_KEY = "longevity-tried-slugs";

function totalMinutes(prep: string, cook: string): string {
  const sum = parseInt(prep) + parseInt(cook);
  return isNaN(sum) ? "See recipe" : `${sum} min total`;
}

interface RecipeCardProps {
  recipe: RecipeForPlanner;
  servings: number;
  tried: boolean;
  onSwap: () => void;
  locale: string;
}

function RecipeCard({ recipe, servings, tried, onSwap, locale }: RecipeCardProps) {
  return (
    <div className="flex items-start justify-between gap-4 p-5 bg-surface border border-border rounded-lg print:p-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/${locale}/recipes/${recipe.slug}/`}
            className="font-display text-lg font-normal text-text hover:text-accent transition-colors !no-underline !border-none"
          >
            {recipe.title}
          </Link>
          {tried && (
            <span className="text-xs px-1.5 py-0.5 bg-border text-muted rounded">
              Tried
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-muted flex-wrap">
          <span>{totalMinutes(recipe.prepTime, recipe.cookTime)}</span>
          <span>·</span>
          <span>serves {recipe.servings}{servings !== recipe.servings && `, cooking for ${servings}`}</span>
          <span>·</span>
          <span className="text-accent">
            {recipe.longevity_ingredients.length} longevity ingredients
          </span>
        </div>
      </div>
      <button
        onClick={onSwap}
        className="print:hidden shrink-0 px-3 py-1.5 text-sm border border-border text-muted rounded hover:border-accent hover:text-accent transition-colors"
        aria-label={`Swap ${recipe.title}`}
      >
        ↺ swap
      </button>
    </div>
  );
}

interface MealPlannerInnerProps {
  recipes: RecipeForPlanner[];
  wikiCategories: Record<string, string>;
  totalLongevityIngredients: number;
  locale: string;
}

function MealPlannerInner({
  recipes,
  wikiCategories,
  totalLongevityIngredients,
  locale,
}: MealPlannerInnerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [state, dispatch] = useReducer(mealPlannerReducer, DEFAULT_STATE);
  const [triedSlugs, setTriedSlugs] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  const urlSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);

  // Single useEffect: read localStorage first, then searchParams
  useEffect(() => {
    // 1. Read triedSlugs from localStorage
    let tried = new Set<string>();
    let storageOk = true;
    try {
      const raw = localStorage.getItem(TRIED_KEY);
      if (raw) tried = new Set(JSON.parse(raw) as string[]);
    } catch {
      storageOk = false;
    }
    setTriedSlugs(tried);
    setStorageUnavailable(!storageOk);
    setHydrated(true);

    // 2. Restore from URL params
    const recipesParam = searchParams.get("recipes");
    const servingsParam = searchParams.get("servings");

    if (servingsParam) {
      const v = parseInt(servingsParam);
      if (!isNaN(v)) dispatch({ type: "SET_SERVINGS", value: v });
    }

    if (recipesParam) {
      const slugs = recipesParam.split(",").filter(Boolean);
      const found = slugs
        .map((s) => recipes.find((r) => r.slug === s))
        .filter(Boolean) as RecipeForPlanner[];
      if (found.length > 0) {
        dispatch({ type: "SET_RECIPE_COUNT", value: found.length });
        // Directly set selected recipes via SUGGEST with a fixed pool
        dispatch({ type: "SUGGEST", allRecipes: found, triedSlugs: tried });
      }
    }

    mountedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // URL sync on state change (debounced, skips initial mount)
  useEffect(() => {
    if (!mountedRef.current) return;
    if (urlSyncTimer.current) clearTimeout(urlSyncTimer.current);
    urlSyncTimer.current = setTimeout(() => {
      try {
        const params = new URLSearchParams();
        if (state.selectedRecipes.length > 0) {
          params.set("recipes", state.selectedRecipes.map((r) => r.slug).join(","));
        }
        params.set("servings", String(state.servings));
        router.replace(`${pathname}?${params.toString()}`);
      } catch (err) {
        console.error("URL sync failed:", err);
      }
    }, 300);
    return () => {
      if (urlSyncTimer.current) clearTimeout(urlSyncTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedRecipes, state.servings]);

  const handleSuggest = useCallback(() => {
    dispatch({ type: "SUGGEST", allRecipes: recipes, triedSlugs });
    // Add selected slugs to triedSlugs (done after state updates via effect)
    setTriedSlugs((prev) => {
      const next = new Set(prev);
      // We'll capture in the post-suggest effect below
      return next;
    });
  }, [recipes, triedSlugs]);

  // Persist triedSlugs after suggestion
  const prevSelectedRef = useRef<string[]>([]);
  useEffect(() => {
    const current = state.selectedRecipes.map((r) => r.slug);
    const prev = prevSelectedRef.current;
    if (current.length > 0 && current.join(",") !== prev.join(",")) {
      prevSelectedRef.current = current;
      setTriedSlugs((t) => {
        const next = new Set(t);
        current.forEach((s) => next.add(s));
        try {
          localStorage.setItem(TRIED_KEY, JSON.stringify(Array.from(next)));
        } catch {
          // storage quota — non-blocking
        }
        return next;
      });
    }
  }, [state.selectedRecipes]);

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch {
      setCopyStatus("failed");
      setTimeout(() => setCopyStatus("idle"), 2000);
    }
  }, []);

  const hasSuggestions = state.selectedRecipes.length > 0;

  return (
    <div className="max-w-[720px] mx-auto px-6 pt-8 pb-24">
      {/* Back link + title */}
      <div className="mb-8 print:hidden">
        <Link
          href={`/${locale}/`}
          className="text-sm text-muted hover:text-accent transition-colors !no-underline !border-none"
        >
          &larr; Back to wiki
        </Link>
      </div>

      <h1 className="font-display text-[42px] font-light leading-[1.1] mb-2 print:text-3xl">
        Meal Planner
      </h1>
      <p className="text-muted text-base mb-10 print:hidden">
        {recipes.length} evidence-based recipes. Pick how many people and recipes, get a shopping list.
      </p>

      {/* Controls */}
      <div className="flex flex-wrap gap-6 items-end mb-8 print:hidden">
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-widest mb-2">
            People to feed
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch({ type: "SET_SERVINGS", value: state.servings - 1 })}
              className="w-8 h-8 flex items-center justify-center border border-border rounded text-muted hover:border-accent hover:text-accent transition-colors"
            >
              −
            </button>
            <span className="font-display text-2xl w-10 text-center">{state.servings}</span>
            <button
              onClick={() => dispatch({ type: "SET_SERVINGS", value: state.servings + 1 })}
              className="w-8 h-8 flex items-center justify-center border border-border rounded text-muted hover:border-accent hover:text-accent transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-widest mb-2">
            Recipes
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch({ type: "SET_RECIPE_COUNT", value: state.recipeCount - 1 })}
              className="w-8 h-8 flex items-center justify-center border border-border rounded text-muted hover:border-accent hover:text-accent transition-colors"
            >
              −
            </button>
            <span className="font-display text-2xl w-10 text-center">{state.recipeCount}</span>
            <button
              onClick={() => dispatch({ type: "SET_RECIPE_COUNT", value: state.recipeCount + 1 })}
              className="w-8 h-8 flex items-center justify-center border border-border rounded text-muted hover:border-accent hover:text-accent transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleSuggest}
            className="px-6 py-2.5 bg-accent text-white text-sm font-medium rounded hover:bg-accent-hover transition-colors"
          >
            Suggest recipes
          </button>
          <button
            onClick={() => dispatch({ type: "TOGGLE_SURPRISE_MODE" })}
            disabled={!hydrated}
            className={`px-4 py-1.5 text-xs border rounded transition-colors ${
              state.surpriseMode
                ? "border-accent text-accent bg-accent/5"
                : "border-border text-muted hover:border-accent hover:text-accent"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title={storageUnavailable ? "Storage unavailable" : undefined}
          >
            {state.surpriseMode ? "✓ Surprise me" : "Surprise me"}
            {hydrated && storageUnavailable && (
              <span className="ml-1 opacity-60">(storage unavailable)</span>
            )}
          </button>
        </div>
      </div>

      {/* Recipe cards */}
      {hasSuggestions ? (
        <div className="space-y-3 mb-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold text-muted uppercase tracking-widest">
              Suggested Recipes
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          {state.selectedRecipes.map((recipe, i) => (
            <RecipeCard
              key={`${recipe.slug}-${i}`}
              recipe={recipe}
              servings={state.servings}
              tried={triedSlugs.has(recipe.slug)}
              locale={locale}
              onSwap={() =>
                dispatch({
                  type: "SWAP_RECIPE",
                  index: i,
                  allRecipes: recipes,
                  triedSlugs,
                })
              }
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-muted text-sm border border-dashed border-border rounded-lg print:hidden">
          Set how many people and recipes, then click Suggest recipes.
        </div>
      )}

      {/* Shopping list */}
      {hasSuggestions && (
        <>
          <div className="flex items-center gap-3 mt-10 mb-2 print:hidden">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold text-muted uppercase tracking-widest">
              Shopping List
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <ShoppingList
            recipes={state.selectedRecipes}
            wikiCategories={wikiCategories}
            locale={locale}
            servings={state.servings}
            totalLongevityIngredients={totalLongevityIngredients}
            onCopyText={handleCopy}
            copyStatus={copyStatus}
          />
        </>
      )}
    </div>
  );
}

interface MealPlannerClientProps {
  recipes: RecipeForPlanner[];
  wikiCategories: Record<string, string>;
  totalLongevityIngredients: number;
  locale: string;
}

export function MealPlannerClient(props: MealPlannerClientProps) {
  return (
    <Suspense
      fallback={
        <div className="max-w-[720px] mx-auto px-6 pt-24">
          <div className="h-10 w-48 bg-border rounded animate-pulse mb-6" />
          <div className="h-4 w-96 bg-border rounded animate-pulse mb-12" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-border rounded animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <MealPlannerInner {...props} />
    </Suspense>
  );
}
