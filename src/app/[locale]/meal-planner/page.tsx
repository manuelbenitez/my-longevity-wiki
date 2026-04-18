import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getAllRecipes, getAllWikiEntries } from "@/lib/data";
import { parseIngredientLines } from "@/lib/parse-ingredients";
import { MealPlannerClient } from "@/components/meal-planner-client";
import type { RecipeForPlanner } from "@/lib/meal-planner-reducer";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meal_planner" });
  return {
    title: t("page_title"),
    description: t("page_description"),
  };
}

export default async function MealPlannerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const allRecipes = getAllRecipes(locale);
  const allWikiEntries = getAllWikiEntries(locale);

  // Build wikiCategories: slug → category (from wiki frontmatter)
  const wikiCategories: Record<string, string> = {};
  for (const entry of allWikiEntries) {
    if (entry.frontmatter.category) {
      wikiCategories[entry.slug] = entry.frontmatter.category;
    }
  }

  // Build RecipeForPlanner[] — extract ingredients server-side, omit full content
  const recipes: RecipeForPlanner[] = allRecipes.map((r) => ({
    slug: r.slug,
    title: r.frontmatter.title,
    servings: r.frontmatter.servings,
    prepTime: r.frontmatter.prep_time,
    cookTime: r.frontmatter.cook_time,
    ingredientLines: parseIngredientLines(r.content),
    longevity_ingredients: r.frontmatter.longevity_ingredients ?? [],
  }));

  const totalLongevityIngredients = new Set(
    allRecipes.flatMap((r) => r.frontmatter.longevity_ingredients ?? [])
  ).size;

  return (
    <main className="min-h-screen">
      <MealPlannerClient
        recipes={recipes}
        wikiCategories={wikiCategories}
        totalLongevityIngredients={totalLongevityIngredients}
        locale={locale}
      />
    </main>
  );
}
