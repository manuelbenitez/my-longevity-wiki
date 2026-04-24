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
    openGraph: { url: path, images: ["/og-image.png"] },
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
      {/* Tagline */}
      <header className="max-w-[680px] mx-auto px-6 pt-24 pb-16 animate-fade-up">
        <h1 className="font-display text-5xl font-light leading-[1.1]">
          {t("tagline")}
        </h1>
      </header>

      <div className="border-t border-border" />

      {/* Cards */}
      <section className="max-w-[680px] mx-auto px-6 py-16 flex flex-col gap-6">

        {/* Hero: meal planner */}
        <div className="bg-surface border border-border rounded-lg p-10 flex flex-col gap-4">
          <h2 className="font-display text-3xl font-light leading-snug text-text">
            {t("hero_heading")}
          </h2>
          <p className="text-base text-muted leading-relaxed max-w-[480px]">
            {t("hero_description")}
          </p>
          <div className="flex items-center gap-6 mt-2">
            <Link
              href={`/${locale}/meal-planner/`}
              className="inline-block bg-accent !text-surface text-sm font-semibold rounded-sm px-6 py-2.5 hover:bg-accent-hover transition-colors !no-underline !border-none"
            >
              {t("hero_cta")}
            </Link>
            <span className="text-sm text-muted">
              {recipes.length} {t("recipes_label")}
            </span>
          </div>
        </div>

        {/* Secondary: wiki + recipes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-surface border border-border rounded-lg p-6 flex flex-col gap-3">
            <h3 className="font-display text-lg font-normal text-text">
              {t("cta_ingredients")}
            </h3>
            <p className="text-sm text-muted leading-relaxed flex-1">
              {t("cta_ingredients_description", { count: wikiEntries.length })}
            </p>
            <Link
              href={`/${locale}/ingredients/`}
              className="text-sm text-muted hover:text-accent transition-colors !no-underline hover:underline"
            >
              {t("cta_ingredients_link")}
            </Link>
          </div>

          <div className="bg-surface border border-border rounded-lg p-6 flex flex-col gap-3">
            <h3 className="font-display text-lg font-normal text-text">
              {t("cta_recipes")}
            </h3>
            <p className="text-sm text-muted leading-relaxed flex-1">
              {t("cta_recipes_description", { count: recipes.length })}
            </p>
            <Link
              href={`/${locale}/recipes/`}
              className="text-sm text-muted hover:text-accent transition-colors !no-underline hover:underline"
            >
              {t("cta_recipes_link")}
            </Link>
          </div>
        </div>

      </section>
    </main>
  );
}
