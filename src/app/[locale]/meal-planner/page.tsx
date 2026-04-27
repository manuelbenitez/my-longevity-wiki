import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getAllRecipes, getAllWikiEntries } from "@/lib/data";
import { parseIngredientLines } from "@/lib/parse-ingredients";
import { MealPlannerClient } from "@/components/meal-planner-client";
import type { RecipeForPlanner } from "@/lib/meal-planner-reducer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://longevity.mbdev.to";

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
  const path = `/${locale}/meal-planner/`;
  const languages: Record<string, string> = { "x-default": `/en/meal-planner/` };
  for (const loc of routing.locales) {
    languages[loc] = `/${loc}/meal-planner/`;
  }
  return {
    title: t("page_title"),
    description: t("page_description"),
    alternates: { canonical: path, languages },
    openGraph: { url: path, images: ["/og-image.png"] },
  };
}

export default async function MealPlannerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "meal_planner" });

  const allRecipes = getAllRecipes(locale);
  const allWikiEntries = getAllWikiEntries(locale);

  // Build wikiCategories: slug → category (from wiki frontmatter)
  const wikiCategories: Record<string, string> = {};
  const wikiTitles: Record<string, string> = {};
  for (const entry of allWikiEntries) {
    if (entry.frontmatter.category) {
      wikiCategories[entry.slug] = entry.frontmatter.category;
    }
    if (entry.frontmatter.title) {
      wikiTitles[entry.slug] = entry.frontmatter.title;
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
    meal_type: r.frontmatter.meal_type ?? [],
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: locale === "es" ? "Planificador de Comidas Longevity" : "Longevity Meal Planner",
    url: `${SITE_URL}/${locale}/meal-planner/`,
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    inLanguage: locale,
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: {
      "@type": "Person",
      name: "Manuel Benitez",
      url: `${SITE_URL}/${locale}/about/`,
    },
    publisher: {
      "@type": "Organization",
      name: "Longevity Wiki",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-large.svg` },
    },
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MealPlannerClient
        recipes={recipes}
        wikiCategories={wikiCategories}
        wikiTitles={wikiTitles}
        totalRecipes={recipes.length}
        locale={locale}
      />

      {/* Server-rendered explainer — gives crawlers real content on what is
          otherwise a client-only interactive page. */}
      <section className="max-w-[680px] mx-auto px-6 pb-24 pt-12 border-t border-border">
        <h2 className="font-display text-2xl font-normal mb-4">
          {t("seo_section_title")}
        </h2>
        <p className="text-base text-muted leading-relaxed mb-10">
          {t("seo_intro")}
        </p>

        <ol className="space-y-6 mb-12">
          {[1, 2, 3].map((n) => (
            <li key={n}>
              <h3 className="font-display text-lg font-normal mb-1">
                {n}. {t(`seo_step_${n}_title`)}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {t(`seo_step_${n}_body`)}
              </p>
            </li>
          ))}
        </ol>

        <h2 className="font-display text-2xl font-normal mb-4">
          {t("seo_why_title")}
        </h2>
        <p className="text-base text-muted leading-relaxed">
          {t("seo_why_body")}
        </p>
      </section>
    </main>
  );
}
