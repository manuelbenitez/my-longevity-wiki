import { describe, it, expect } from "vitest";
import {
  mealPlannerReducer,
  DEFAULT_STATE,
  type RecipeForPlanner,
  type MealPlannerState,
} from "./meal-planner-reducer";

const makeRecipe = (slug: string, meal_type: string[] = []): RecipeForPlanner => ({
  slug,
  title: slug,
  servings: 4,
  prepTime: "10 min",
  cookTime: "20 min",
  ingredientLines: ["item"],
  longevity_ingredients: [slug],
  meal_type,
});

const RECIPES = Array.from({ length: 8 }, (_, i) => makeRecipe(`recipe-${i}`));

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
    const s = mealPlannerReducer(state, { type: "SUGGEST", allRecipes: RECIPES });
    expect(s.selectedRecipes).toHaveLength(3);
    const slugs = s.selectedRecipes.map((r) => r.slug);
    expect(new Set(slugs).size).toBe(3);
  });

  it("selects no more than available recipes", () => {
    const state: MealPlannerState = { ...DEFAULT_STATE, recipeCount: 5 };
    const smallPool = RECIPES.slice(0, 2);
    const s = mealPlannerReducer(state, { type: "SUGGEST", allRecipes: smallPool });
    expect(s.selectedRecipes).toHaveLength(2);
  });

  it("does not pick duplicate slugs", () => {
    const state: MealPlannerState = { ...DEFAULT_STATE, recipeCount: 7 };
    const s = mealPlannerReducer(state, { type: "SUGGEST", allRecipes: RECIPES });
    const slugs = s.selectedRecipes.map((r) => r.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
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
    });
    expect(s.selectedRecipes[0]).toBe(RECIPES[0]);
  });
});

describe("REMOVE_RECIPE", () => {
  it("removes recipe and decrements recipeCount", () => {
    const state: MealPlannerState = {
      ...DEFAULT_STATE,
      recipeCount: 3,
      selectedRecipes: [RECIPES[0], RECIPES[1], RECIPES[2]],
    };
    const s = mealPlannerReducer(state, { type: "REMOVE_RECIPE", index: 1 });
    expect(s.selectedRecipes).toHaveLength(2);
    expect(s.selectedRecipes.find((r) => r.slug === RECIPES[1].slug)).toBeUndefined();
    expect(s.recipeCount).toBe(2);
  });
});

describe("SET_MEAL_TYPE", () => {
  it("sets meal type", () => {
    const s = mealPlannerReducer(DEFAULT_STATE, { type: "SET_MEAL_TYPE", value: "breakfast" });
    expect(s.mealType).toBe("breakfast");
  });

  it("does not clear selected recipes", () => {
    const state: MealPlannerState = {
      ...DEFAULT_STATE,
      selectedRecipes: [RECIPES[0], RECIPES[1]],
    };
    const s = mealPlannerReducer(state, { type: "SET_MEAL_TYPE", value: "lunch" });
    expect(s.selectedRecipes).toHaveLength(2);
  });
});

describe("SUGGEST with meal type filter", () => {
  const mealTypedPool: RecipeForPlanner[] = [
    makeRecipe("breakfast-1", ["breakfast"]),
    makeRecipe("breakfast-2", ["breakfast"]),
    makeRecipe("breakfast-3", ["breakfast"]),
    makeRecipe("lunch-1", ["lunch"]),
    makeRecipe("lunch-2", ["lunch", "dinner"]),
    makeRecipe("dinner-1", ["dinner"]),
    makeRecipe("snack-drink", ["snack", "drink"]),
  ];

  it("picks only recipes matching the active meal type", () => {
    const state: MealPlannerState = {
      ...DEFAULT_STATE,
      recipeCount: 3,
      mealType: "breakfast",
    };
    const s = mealPlannerReducer(state, { type: "SUGGEST", allRecipes: mealTypedPool });
    expect(s.selectedRecipes).toHaveLength(3);
    expect(s.selectedRecipes.every((r) => r.meal_type.includes("breakfast"))).toBe(true);
  });

  it("returns full pool when meal type is all", () => {
    const state: MealPlannerState = {
      ...DEFAULT_STATE,
      recipeCount: 5,
      mealType: "all",
    };
    const s = mealPlannerReducer(state, { type: "SUGGEST", allRecipes: mealTypedPool });
    expect(s.selectedRecipes).toHaveLength(5);
  });

  it("caps at pool size when filter leaves too few recipes", () => {
    const state: MealPlannerState = {
      ...DEFAULT_STATE,
      recipeCount: 7,
      mealType: "drink",
    };
    const s = mealPlannerReducer(state, { type: "SUGGEST", allRecipes: mealTypedPool });
    expect(s.selectedRecipes).toHaveLength(1);
    expect(s.selectedRecipes[0].slug).toBe("snack-drink");
  });

  it("includes multi-meal recipes under each applicable filter", () => {
    const state: MealPlannerState = {
      ...DEFAULT_STATE,
      recipeCount: 7,
      mealType: "dinner",
    };
    const s = mealPlannerReducer(state, { type: "SUGGEST", allRecipes: mealTypedPool });
    const slugs = s.selectedRecipes.map((r) => r.slug).sort();
    expect(slugs).toEqual(["dinner-1", "lunch-2"]);
  });
});

describe("SWAP_RECIPE with meal type filter", () => {
  const mealTypedPool: RecipeForPlanner[] = [
    makeRecipe("b1", ["breakfast"]),
    makeRecipe("b2", ["breakfast"]),
    makeRecipe("b3", ["breakfast"]),
    makeRecipe("l1", ["lunch"]),
    makeRecipe("l2", ["lunch"]),
  ];

  it("swap replacement respects active meal type", () => {
    const state: MealPlannerState = {
      ...DEFAULT_STATE,
      mealType: "breakfast",
      selectedRecipes: [mealTypedPool[0]],
    };
    for (let i = 0; i < 20; i++) {
      const s = mealPlannerReducer(state, {
        type: "SWAP_RECIPE",
        index: 0,
        allRecipes: mealTypedPool,
      });
      expect(s.selectedRecipes[0].meal_type).toContain("breakfast");
    }
  });

  it("swap no-ops when filtered pool has no replacement", () => {
    const state: MealPlannerState = {
      ...DEFAULT_STATE,
      mealType: "breakfast",
      selectedRecipes: [mealTypedPool[0], mealTypedPool[1], mealTypedPool[2]],
    };
    const s = mealPlannerReducer(state, {
      type: "SWAP_RECIPE",
      index: 0,
      allRecipes: mealTypedPool,
    });
    expect(s.selectedRecipes[0].slug).toBe("b1");
  });
});

describe("MARK_AS_TRIED / UNMARK_TRIED", () => {
  it("moves recipe from selected to tried", () => {
    const state: MealPlannerState = {
      ...DEFAULT_STATE,
      recipeCount: 2,
      selectedRecipes: [RECIPES[0], RECIPES[1]],
    };
    const s = mealPlannerReducer(state, { type: "MARK_AS_TRIED", index: 0 });
    expect(s.selectedRecipes).toHaveLength(1);
    expect(s.triedRecipes).toHaveLength(1);
    expect(s.triedRecipes[0].slug).toBe(RECIPES[0].slug);
    expect(s.recipeCount).toBe(1);
  });

  it("does not duplicate in tried list", () => {
    const state: MealPlannerState = {
      ...DEFAULT_STATE,
      recipeCount: 1,
      selectedRecipes: [RECIPES[0]],
      triedRecipes: [RECIPES[0]],
    };
    const s = mealPlannerReducer(state, { type: "MARK_AS_TRIED", index: 0 });
    expect(s.triedRecipes).toHaveLength(1);
  });

  it("moves recipe from tried back to selected", () => {
    const state: MealPlannerState = {
      ...DEFAULT_STATE,
      recipeCount: 1,
      selectedRecipes: [RECIPES[1]],
      triedRecipes: [RECIPES[0]],
    };
    const s = mealPlannerReducer(state, { type: "UNMARK_TRIED", slug: RECIPES[0].slug });
    expect(s.triedRecipes).toHaveLength(0);
    expect(s.selectedRecipes).toHaveLength(2);
    expect(s.recipeCount).toBe(2);
  });
});
