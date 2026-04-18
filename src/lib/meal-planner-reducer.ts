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
  surpriseMode: boolean;
}

export type MealPlannerAction =
  | { type: "SET_SERVINGS"; value: number }
  | { type: "SET_RECIPE_COUNT"; value: number }
  | { type: "SUGGEST"; allRecipes: RecipeForPlanner[]; triedSlugs: Set<string> }
  | { type: "SWAP_RECIPE"; index: number; allRecipes: RecipeForPlanner[]; triedSlugs: Set<string> }
  | { type: "TOGGLE_SURPRISE_MODE" };

export const DEFAULT_STATE: MealPlannerState = {
  servings: 4,
  recipeCount: 4,
  selectedRecipes: [],
  surpriseMode: false,
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

function buildPool(
  allRecipes: RecipeForPlanner[],
  excludeSlugs: string[],
  triedSlugs: Set<string>,
  surpriseMode: boolean
): RecipeForPlanner[] {
  const excluded = new Set(excludeSlugs);
  const base = allRecipes.filter((r) => !excluded.has(r.slug));
  if (!surpriseMode || triedSlugs.size === 0) return base;
  const fresh = base.filter((r) => !triedSlugs.has(r.slug));
  return fresh.length > 0 ? fresh : base;
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
        const pool = buildPool(action.allRecipes, pickedSlugs, action.triedSlugs, state.surpriseMode);
        if (pool.length === 0) break;
        const pick = pickRandom(pool);
        selected.push(pick);
        pickedSlugs.push(pick.slug);
      }
      return { ...state, selectedRecipes: selected };
    }

    case "SWAP_RECIPE": {
      const currentSlugs = state.selectedRecipes.map((r) => r.slug);
      const pool = buildPool(action.allRecipes, currentSlugs, action.triedSlugs, state.surpriseMode);
      if (pool.length === 0) return state;
      const replacement = pickRandom(pool);
      const updated = state.selectedRecipes.map((r, i) =>
        i === action.index ? replacement : r
      );
      return { ...state, selectedRecipes: updated };
    }

    case "TOGGLE_SURPRISE_MODE":
      return { ...state, surpriseMode: !state.surpriseMode };

    default:
      return state;
  }
}
