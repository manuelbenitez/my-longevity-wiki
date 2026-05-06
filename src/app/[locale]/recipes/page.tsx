import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { getAllRecipes } from "@/lib/data";
import { RecipeGrid } from "@/components/recipe-grid";
import Link from "next/link";
import Image from "next/image";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "recipes" });
  const path = `/${locale}/recipes/`;
  const languages: Record<string, string> = { "x-default": `/en/recipes/` };
  for (const loc of routing.locales) {
    languages[loc] = `/${loc}/recipes/`;
  }
  return {
    title: t("page_title"),
    description: t("page_description"),
    alternates: { canonical: path, languages },
    openGraph: { url: path, images: ["/og-image.png"] },
  };
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://longevity.mbdev.to";

export default async function RecipesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "recipes" });
  const recipes = getAllRecipes(locale);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/${locale}/` },
      { "@type": "ListItem", position: 2, name: t("page_title") },
    ],
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="max-w-[1200px] mx-auto px-6 pt-12 pb-4">
        <Link
          href={`/${locale}/`}
          className="text-sm text-muted hover:text-accent transition-colors !no-underline !border-none"
        >
          &larr; {t("back")}
        </Link>
      </div>

      <section className="max-w-[1200px] mx-auto px-6 pb-24">
        <div className="flex flex-col items-center text-center gap-5 sm:flex-row sm:items-start sm:text-left sm:gap-6 mb-12">
          <div className="w-48 h-48 sm:w-87.5 sm:h-87.5 shrink-0 rounded-md border border-border overflow-hidden flex items-center justify-center">
            <Image
              src="/headers/recipes.webp"
              alt=""
              width={350}
              height={350}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <h1 className="font-display text-3xl sm:text-[42px] font-light leading-[1.1] mb-3 sm:mb-4">
              {t("page_title")}
            </h1>
            <p className="text-muted text-lg leading-relaxed">
              {t("page_description")}
            </p>
          </div>
        </div>
        <RecipeGrid
          recipes={recipes.map((r) => ({
            slug: r.slug,
            title: r.frontmatter.title,
            prep_time: r.frontmatter.prep_time,
            cook_time: r.frontmatter.cook_time,
            difficulty: r.frontmatter.difficulty,
            longevity_ingredients: r.frontmatter.longevity_ingredients,
            tags: r.frontmatter.tags,
            meal_type: r.frontmatter.meal_type,
          }))}
        />
      </section>
    </main>
  );
}
