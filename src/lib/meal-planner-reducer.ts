export interface RecipeForPlanner {
  slug: string;
  title: string;
  servings: number;
  prepTime: string;
  cookTime: string;
  ingredientLines: string[];
  longevity_ingredients: string[];
}

export interface MealPlannerState {
  servings: number;
  recipeCount: number;
  selectedRecipes: RecipeForPlanner[];
  triedRecipes: RecipeForPlanner[];
}

export type MealPlannerAction =
  | { type: "SET_SERVINGS"; value: number }
  | { type: "SET_RECIPE_COUNT"; value: number }
  | { type: "SUGGEST"; allRecipes: RecipeForPlanner[] }
  | { type: "SWAP_RECIPE"; index: number; allRecipes: RecipeForPlanner[] }
  | { type: "REMOVE_RECIPE"; index: number }
  | { type: "MARK_AS_TRIED"; index: number }
  | { type: "UNMARK_TRIED"; slug: string };

export const DEFAULT_STATE: MealPlannerState = {
  servings: 1,
  recipeCount: 1,
  selectedRecipes: [],
  triedRecipes: [],
};

function clampServings(v: number): number {
  return Math.min(20, Math.max(1, Math.round(v)));
}

function clampRecipeCount(v: number): number {
  return Math.min(7, Math.max(1, Math.round(v)));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildPool(allRecipes: RecipeForPlanner[], excludeSlugs: string[]): RecipeForPlanner[] {
  const excluded = new Set(excludeSlugs);
  return allRecipes.filter((r) => !excluded.has(r.slug));
}

export function mealPlannerReducer(
  state: MealPlannerState,
  action: MealPlannerAction
): MealPlannerState {
  switch (action.type) {
    case "SET_SERVINGS":
      return { ...state, servings: clampServings(action.value) };

    case "SET_RECIPE_COUNT":
      return { ...state, recipeCount: clampRecipeCount(action.value) };

    case "SUGGEST": {
      const selected: RecipeForPlanner[] = [];
      const pickedSlugs: string[] = [];
      for (let i = 0; i < state.recipeCount; i++) {
        const pool = buildPool(action.allRecipes, pickedSlugs);
        if (pool.length === 0) break;
        const pick = pickRandom(pool);
        selected.push(pick);
        pickedSlugs.push(pick.slug);
      }
      return { ...state, selectedRecipes: selected };
    }

    case "SWAP_RECIPE": {
      const currentSlugs = state.selectedRecipes.map((r) => r.slug);
      const pool = buildPool(action.allRecipes, currentSlugs);
      if (pool.length === 0) return state;
      const replacement = pickRandom(pool);
      const updated = state.selectedRecipes.map((r, i) =>
        i === action.index ? replacement : r
      );
      return { ...state, selectedRecipes: updated };
    }

    case "REMOVE_RECIPE": {
      const updated = state.selectedRecipes.filter((_, i) => i !== action.index);
      return { ...state, selectedRecipes: updated, recipeCount: Math.max(1, state.recipeCount - 1) };
    }

    case "MARK_AS_TRIED": {
      const recipe = state.selectedRecipes[action.index];
      if (!recipe) return state;
      const updated = state.selectedRecipes.filter((_, i) => i !== action.index);
      const alreadyTried = state.triedRecipes.some((r) => r.slug === recipe.slug);
      return {
        ...state,
        selectedRecipes: updated,
        recipeCount: Math.max(1, state.recipeCount - 1),
        triedRecipes: alreadyTried ? state.triedRecipes : [...state.triedRecipes, recipe],
      };
    }

    case "UNMARK_TRIED": {
      const recipe = state.triedRecipes.find((r) => r.slug === action.slug);
      if (!recipe) return state;
      return {
        ...state,
        triedRecipes: state.triedRecipes.filter((r) => r.slug !== action.slug),
        selectedRecipes: [...state.selectedRecipes, recipe],
        recipeCount: state.recipeCount + 1,
      };
    }

    default:
      return state;
  }
}
