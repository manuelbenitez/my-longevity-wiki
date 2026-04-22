import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { getIndividualIngredients, getAllRecipes } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const path = `/${locale}/`;
  const languages: Record<string, string> = { "x-default": `/en/` };
  for (const loc of routing.locales) {
    languages[loc] = `/${loc}/`;
  }
  return {
    alternates: { canonical: path, languages },
    openGraph: { url: path },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const wikiEntries = getIndividualIngredients(locale);
  const recipes = getAllRecipes(locale);

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <header className="max-w-[680px] mx-auto px-6 pt-24 pb-16 animate-fade-up">
        <h1 className="font-display text-5xl font-light leading-[1.1] mb-6">
          {t("tagline")}
        </h1>
        <p className="text-muted text-lg leading-relaxed max-w-[480px]">
          {t("description", { count: wikiEntries.length })}
        </p>
      </header>

      {/* Stats */}
      <div className="max-w-[680px] mx-auto px-6 pb-16 flex gap-12">
        <div>
          <div className="font-display text-3xl font-light">
            {wikiEntries.length}
          </div>
          <div className="text-muted text-sm">{t("ingredients_label")}</div>
        </div>
        <div>
          <div className="font-display text-3xl font-light">
            {recipes.length}
          </div>
          <div className="text-muted text-sm">{t("recipes_label")}</div>
        </div>
      </div>

      <div className="border-t border-border" />

      {/* CTA cards */}
      <section className="max-w-[680px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            href={`/${locale}/ingredients/`}
            className="group flex flex-col bg-surface border border-border rounded-lg p-8 hover:border-accent transition-all duration-200 !no-underline hover:-translate-y-0.5"
          >
            <h2 className="font-display text-2xl font-normal mb-2 text-text group-hover:text-accent transition-colors">
              {t("cta_ingredients")}
            </h2>
            <p className="text-sm text-muted leading-relaxed mb-4">
              {t("cta_ingredients_description")}
            </p>
            <span className="text-xs font-semibold text-accent mt-auto">
              {wikiEntries.length} {t("ingredients_label")} &rarr;
            </span>
          </Link>

          <Link
            href={`/${locale}/recipes/`}
            className="group flex flex-col bg-surface border border-border rounded-lg p-8 hover:border-accent transition-all duration-200 !no-underline hover:-translate-y-0.5"
          >
            <h2 className="font-display text-2xl font-normal mb-2 text-text group-hover:text-accent transition-colors">
              {t("cta_recipes")}
            </h2>
            <p className="text-sm text-muted leading-relaxed mb-4">
              {t("cta_recipes_description")}
            </p>
            <span className="text-xs font-semibold text-accent mt-auto">
              {recipes.length} {t("recipes_label")} &rarr;
            </span>
          </Link>

          <Link
            href={`/${locale}/meal-planner/`}
            className="group flex flex-col bg-surface border border-border rounded-lg p-8 hover:border-accent transition-all duration-200 !no-underline hover:-translate-y-0.5 sm:col-span-2"
          >
            <h2 className="font-display text-2xl font-normal mb-2 text-text group-hover:text-accent transition-colors">
              {t("cta_meal_planner")}
            </h2>
            <p className="text-sm text-muted leading-relaxed mb-4">
              {t("cta_meal_planner_description")}
            </p>
            <span className="text-xs font-semibold text-accent mt-auto">
              {t("cta_meal_planner_cta")} &rarr;
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
