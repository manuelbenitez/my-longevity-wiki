"use client";

import { Suspense, useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  mealPlannerReducer,
  DEFAULT_STATE,
  type RecipeForPlanner,
} from "@/lib/meal-planner-reducer";
import { ShoppingList } from "@/components/shopping-list";


interface RecipeCardProps {
  recipe: RecipeForPlanner;
  servings: number;
  onSwap: () => void;
  onRemove: () => void;
  onMarkTried: () => void;
  locale: string;
}

function RecipeCard({ recipe, servings, onSwap, onRemove, onMarkTried, locale }: RecipeCardProps) {
  const t = useTranslations("meal_planner");
  const sum = parseInt(recipe.prepTime) + parseInt(recipe.cookTime);
  const timeLabel = isNaN(sum) ? t("time_see_recipe") : t("time_total", { minutes: sum });

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
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-muted flex-wrap">
          <span>{timeLabel}</span>
          <span>·</span>
          <span>
            {t("serves", { count: recipe.servings })}
            {servings !== recipe.servings && `, ${t("cooking_for", { count: servings })}`}
          </span>
        </div>
      </div>
      <div className="print:hidden flex items-center gap-2 shrink-0">
        <button
          onClick={onMarkTried}
          className="px-3 py-1.5 text-sm border border-border text-muted rounded hover:border-accent hover:text-accent transition-colors"
          aria-label={t("tried_aria", { title: recipe.title })}
        >
          ✓ {t("tried_button")}
        </button>
        <button
          onClick={onSwap}
          className="px-3 py-1.5 text-sm border border-border text-muted rounded hover:border-accent hover:text-accent transition-colors"
          aria-label={t("swap_aria", { title: recipe.title })}
        >
          ↺ {t("swap_button")}
        </button>
        <button
          onClick={onRemove}
          className="px-3 py-1.5 text-sm border border-border text-muted rounded hover:border-red-400 hover:text-red-400 transition-colors"
          aria-label={t("remove_aria", { title: recipe.title })}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

interface MealPlannerInnerProps {
  recipes: RecipeForPlanner[];
  wikiCategories: Record<string, string>;
  totalRecipes: number;
  locale: string;
}

function MealPlannerInner({
  recipes,
  wikiCategories,
  totalRecipes,
  locale,
}: MealPlannerInnerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("meal_planner");

  const [state, dispatch] = useReducer(mealPlannerReducer, DEFAULT_STATE);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  const urlSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);

  // Restore from URL params on mount
  useEffect(() => {
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
        dispatch({ type: "SUGGEST", allRecipes: found });
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
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
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
    dispatch({ type: "SUGGEST", allRecipes: recipes });
  }, [recipes]);

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
        {t("title")}
      </h1>
      <p className="text-muted text-base mb-6 print:hidden">
        {t("subtitle", { count: recipes.length })}
      </p>

      {/* Progress bar */}
      <div className="mb-10 print:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted">
            {t("progress", { selected: state.selectedRecipes.length, total: totalRecipes })}
            {state.selectedRecipes.length === totalRecipes && (
              <span className="ml-2 text-accent font-medium">— {t("full_menu")}</span>
            )}
          </span>
          <span className="text-xs text-muted">
            {totalRecipes > 0 ? Math.round((state.selectedRecipes.length / totalRecipes) * 100) : 0}%
          </span>
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent/70 rounded-full transition-all duration-500"
            style={{ width: `${totalRecipes > 0 ? (state.selectedRecipes.length / totalRecipes) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-6 items-end mb-8 print:hidden">
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-widest mb-2">
            {t("people_label")}
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
            {t("recipes_label")}
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

        <button
          onClick={handleSuggest}
          className="px-6 py-2.5 bg-accent text-white text-sm font-medium rounded hover:bg-accent-hover transition-colors"
        >
          {t("suggest_button")}
        </button>
      </div>

      {/* Recipe cards */}
      {hasSuggestions ? (
        <div className="space-y-3 mb-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold text-muted uppercase tracking-widest">
              {t("suggested_section")}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          {state.selectedRecipes.map((recipe, i) => (
            <RecipeCard
              key={`${recipe.slug}-${i}`}
              recipe={recipe}
              servings={state.servings}
              locale={locale}
              onSwap={() =>
                dispatch({
                  type: "SWAP_RECIPE",
                  index: i,
                  allRecipes: recipes,
                })
              }
              onMarkTried={() => dispatch({ type: "MARK_AS_TRIED", index: i })}
              onRemove={() => dispatch({ type: "REMOVE_RECIPE", index: i })}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-muted text-sm border border-dashed border-border rounded-lg print:hidden">
          {t("empty_state")}
        </div>
      )}

      {/* Shopping list */}
      {hasSuggestions && (
        <>
          <div className="flex items-center gap-3 mt-10 mb-2 print:hidden">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold text-muted uppercase tracking-widest">
              {t("shopping_section")}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <ShoppingList
            recipes={state.selectedRecipes}
            wikiCategories={wikiCategories}
            servings={state.servings}
            onCopyText={handleCopy}
            copyStatus={copyStatus}
          />
        </>
      )}

      {/* Tried Recipes */}
      {state.triedRecipes.length > 0 && (
        <div className="mt-16 print:hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold text-muted uppercase tracking-widest">
              {t("tried_section")}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-3">
            {state.triedRecipes.map((recipe) => {
              const sum = parseInt(recipe.prepTime) + parseInt(recipe.cookTime);
              const timeLabel = isNaN(sum) ? t("time_see_recipe") : t("time_total", { minutes: sum });
              return (
                <div
                  key={recipe.slug}
                  className="flex items-center justify-between gap-4 p-4 bg-surface border border-border rounded-lg opacity-60"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/${locale}/recipes/${recipe.slug}/`}
                      className="font-display text-base font-normal text-text hover:text-accent transition-colors !no-underline !border-none"
                    >
                      {recipe.title}
                    </Link>
                    <div className="text-sm text-muted mt-0.5">
                      {timeLabel}
                    </div>
                  </div>
                  <button
                    onClick={() => dispatch({ type: "UNMARK_TRIED", slug: recipe.slug })}
                    className="shrink-0 px-3 py-1.5 text-sm border border-border text-muted rounded hover:border-accent hover:text-accent transition-colors"
                  >
                    ↩ {t("undo_button")}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface MealPlannerClientProps {
  recipes: RecipeForPlanner[];
  wikiCategories: Record<string, string>;
  totalRecipes: number;
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
