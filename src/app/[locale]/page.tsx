import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
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
        <Link
          href={`/${locale}/meal-planner/`}
          className="group grid overflow-hidden rounded-lg border border-border bg-surface transition-all duration-200 !no-underline !border-border hover:!border-accent hover:shadow-md hover:shadow-accent/30 sm:grid-cols-[1fr_220px]"
        >
          <div className="flex flex-col gap-4 p-8 sm:p-10">
            <h2 className="font-display text-3xl font-light leading-snug text-text">
              {t("meal_planner_title")}
            </h2>
            <p className="text-base text-muted leading-relaxed max-w-[480px]">
              {t("hero_heading")}
            </p>
            <span className="text-sm text-muted mt-2">
              {recipes.length} {t("recipes_label")}
            </span>
          </div>
          <div className="aspect-square border-t border-border bg-bg overflow-hidden sm:border-l sm:border-t-0">
            <Image
              src="/headers/meal-planner.webp"
              alt=""
              width={700}
              height={700}
              priority
              className="h-full w-full object-cover"
            />
          </div>
        </Link>

        {/* Secondary: wiki + recipes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            href={`/${locale}/ingredients/`}
            className="group flex overflow-hidden rounded-lg border border-border bg-surface transition-all duration-200 !no-underline !border-border hover:!border-accent hover:shadow-md hover:shadow-accent/30 sm:flex-col"
          >
            <div className="aspect-square w-28 shrink-0 border-r border-border bg-bg overflow-hidden sm:w-full sm:border-b sm:border-r-0">
              <Image
                src="/headers/ingredients.webp"
                alt=""
                width={700}
                height={700}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
              <h3 className="font-display text-lg font-normal text-text">
                {t("cta_ingredients")}
              </h3>
              <p className="text-sm text-muted leading-relaxed flex-1">
                {t("cta_ingredients_description", { count: wikiEntries.length })}
              </p>
              <span className="text-sm text-muted">
                {wikiEntries.length} {t("ingredients_label")}
              </span>
            </div>
          </Link>

          <Link
            href={`/${locale}/recipes/`}
            className="group flex overflow-hidden rounded-lg border border-border bg-surface transition-all duration-200 !no-underline !border-border hover:!border-accent hover:shadow-md hover:shadow-accent/30 sm:flex-col"
          >
            <div className="aspect-square w-28 shrink-0 border-r border-border bg-bg overflow-hidden sm:w-full sm:border-b sm:border-r-0">
              <Image
                src="/headers/recipes.webp"
                alt=""
                width={700}
                height={700}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
              <h3 className="font-display text-lg font-normal text-text">
                {t("cta_recipes")}
              </h3>
              <p className="text-sm text-muted leading-relaxed flex-1">
                {t("cta_recipes_description", { count: recipes.length })}
              </p>
              <span className="text-sm text-muted">
                {recipes.length} {t("recipes_label")}
              </span>
            </div>
          </Link>
        </div>

      </section>
    </main>
  );
}
