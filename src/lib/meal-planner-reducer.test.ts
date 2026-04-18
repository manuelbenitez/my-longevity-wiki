import { describe, it, expect } from "vitest";
import {
  mealPlannerReducer,
  DEFAULT_STATE,
  type RecipeForPlanner,
  type MealPlannerState,
} from "./meal-planner-reducer";

const makeRecipe = (slug: string): RecipeForPlanner => ({
  slug,
  title: slug,
  servings: 4,
  prepTime: "10 min",
  cookTime: "20 min",
  ingredientLines: ["item"],
  longevity_ingredients: [slug],
});

const RECIPES = Array.from({ length: 8 }, (_, i) => makeRecipe(`recipe-${i}`));
const NO_TRIED = new Set<string>();

describe("SET_SERVINGS", () => {
  it("sets servings within range", () => {
    const s = mealPlannerReducer(DEFAULT_STATE, { type: "SET_SERVINGS", value: 6 });
    expect(s.servings).toBe(6);
  });
  it("clamps to 1 minimum", () => {
    const s = mealPlannerReducer(DEFAULT_STATE, { type: "SET_SERVINGS", value: 0 });
    expect(s.servings).toBe(1);
  });
  it("clamps to 20 maximum", () => {
    const s = mealPlannerReducer(DEFAULT_STATE, { type: "SET_SERVINGS", value: 99 });
    expect(s.servings).toBe(20);
  });
});

describe("SET_RECIPE_COUNT", () => {
  it("sets recipe count within range", () => {
    const s = mealPlannerReducer(DEFAULT_STATE, { type: "SET_RECIPE_COUNT", value: 3 });
    expect(s.recipeCount).toBe(3);
  });
  it("clamps to 1 minimum", () => {
    const s = mealPlannerReducer(DEFAULT_STATE, { type: "SET_RECIPE_COUNT", value: 0 });
    expect(s.recipeCount).toBe(1);
  });
  it("clamps to 7 maximum", () => {
    const s = mealPlannerReducer(DEFAULT_STATE, { type: "SET_RECIPE_COUNT", value: 10 });
    expect(s.recipeCount).toBe(7);
  });
});

describe("SUGGEST", () => {
  it("selects recipeCount distinct recipes", () => {
    const state: MealPlannerState = { ...DEFAULT_STATE, recipeCount: 3 };
    const s = mealPlannerReducer(state, { type: "SUGGEST", allRecipes: RECIPES, triedSlugs: NO_TRIED });
    expect(s.selectedRecipes).toHaveLength(3);
    const slugs = s.selectedRecipes.map((r) => r.slug);
    expect(new Set(slugs).size).toBe(3);
  });

  it("selects no more than available recipes", () => {
    const state: MealPlannerState = { ...DEFAULT_STATE, recipeCount: 5 };
    const smallPool = RECIPES.slice(0, 2);
    const s = mealPlannerReducer(state, { type: "SUGGEST", allRecipes: smallPool, triedSlugs: NO_TRIED });
    expect(s.selectedRecipes).toHaveLength(2);
  });

  it("in surprise mode prefers untried recipes", () => {
    const state: MealPlannerState = { ...DEFAULT_STATE, recipeCount: 2, surpriseMode: true };
    const tried = new Set(["recipe-0", "recipe-1", "recipe-2", "recipe-3", "recipe-4", "recipe-5"]);
    const s = mealPlannerReducer(state, { type: "SUGGEST", allRecipes: RECIPES, triedSlugs: tried });
    const slugs = s.selectedRecipes.map((r) => r.slug);
    expect(slugs.every((slug) => !tried.has(slug))).toBe(true);
  });

  it("in surprise mode falls back to full pool when all tried", () => {
    const state: MealPlannerState = { ...DEFAULT_STATE, recipeCount: 2, surpriseMode: true };
    const tried = new Set(RECIPES.map((r) => r.slug));
    const s = mealPlannerReducer(state, { type: "SUGGEST", allRecipes: RECIPES, triedSlugs: tried });
    expect(s.selectedRecipes).toHaveLength(2);
  });
});

describe("SWAP_RECIPE", () => {
  const baseState: MealPlannerState = {
    ...DEFAULT_STATE,
    selectedRecipes: [RECIPES[0], RECIPES[1], RECIPES[2]],
  };

  it("replaces the recipe at the given index", () => {
    const s = mealPlannerReducer(baseState, {
      type: "SWAP_RECIPE",
      index: 1,
      allRecipes: RECIPES,
      triedSlugs: NO_TRIED,
    });
    expect(s.selectedRecipes[0]).toBe(RECIPES[0]);
    expect(s.selectedRecipes[2]).toBe(RECIPES[2]);
    expect(s.selectedRecipes[1].slug).not.toBe(RECIPES[1].slug);
  });

  it("replacement is not already in selected list", () => {
    for (let i = 0; i < 20; i++) {
      const s = mealPlannerReducer(baseState, {
        type: "SWAP_RECIPE",
        index: 0,
        allRecipes: RECIPES,
        triedSlugs: NO_TRIED,
      });
      const selectedSlugs = s.selectedRecipes.map((r) => r.slug);
      expect(new Set(selectedSlugs).size).toBe(3);
    }
  });

  it("no-ops when pool is empty", () => {
    const tinyState: MealPlannerState = {
      ...DEFAULT_STATE,
      selectedRecipes: [RECIPES[0], RECIPES[1]],
    };
    const s = mealPlannerReducer(tinyState, {
      type: "SWAP_RECIPE",
      index: 0,
      allRecipes: [RECIPES[0], RECIPES[1]],
      triedSlugs: NO_TRIED,
    });
    expect(s.selectedRecipes[0]).toBe(RECIPES[0]);
  });
});

describe("TOGGLE_SURPRISE_MODE", () => {
  it("toggles from false to true", () => {
    const s = mealPlannerReducer(DEFAULT_STATE, { type: "TOGGLE_SURPRISE_MODE" });
    expect(s.surpriseMode).toBe(true);
  });
  it("toggles from true to false", () => {
    const state = { ...DEFAULT_STATE, surpriseMode: true };
    const s = mealPlannerReducer(state, { type: "TOGGLE_SURPRISE_MODE" });
    expect(s.surpriseMode).toBe(false);
  });
});
