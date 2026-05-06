import { setRequestLocale } from "next-intl/server";
import { getAllRecipeSlugs, getRecipe, recipeLocales } from "@/lib/data";
import { markdownToHtml } from "@/lib/markdown";
import { extractIngredientLines, extractInstructionSteps } from "@/lib/recipe-schema";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return getAllRecipeSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const recipe = getRecipe(slug, locale);
  if (!recipe) return {};
  const { title, longevity_ingredients, difficulty, tags } = recipe.frontmatter;
  const ingredients = longevity_ingredients
    ?.map((s) => s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "))
    .join(", ");
  const path = `/${locale}/recipes/${slug}/`;
  const seoImage = `/seo/recipes/${slug}.jpg`;
  const locales = recipeLocales(slug);
  const languages: Record<string, string> = {};
  if (locales.includes("en")) languages["x-default"] = `/en/recipes/${slug}/`;
  for (const loc of locales) {
    languages[loc] = `/${loc}/recipes/${slug}/`;
  }
  return {
    title: `${title} — Healthy Longevity Recipe`,
    description: `${title}: a ${difficulty || "easy"} recipe with ${ingredients}. Science-backed ingredient synergies for anti-aging and healthy longevity.`,
    keywords: [
      title.toLowerCase(),
      "healthy recipe",
      "longevity recipe",
      "anti-aging recipe",
      ...(longevity_ingredients || []),
      ...(tags || []),
    ],
    alternates: {
      canonical: path,
      languages,
    },
    openGraph: {
      title: `${title} — Longevity Wiki Recipe`,
      description: `Science-backed recipe with ${ingredients}. Every ingredient chosen for its longevity benefits.`,
      type: "article",
      url: path,
      images: [
        {
          url: seoImage,
          width: 1200,
          height: 630,
          alt: `${title} — Longevity Wiki recipe`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — Longevity Wiki Recipe`,
      description: `Science-backed recipe with ${ingredients}.`,
      images: [seoImage],
    },
  };
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://longevity.mbdev.to";

function parseDuration(t?: string): string | undefined {
  if (!t) return undefined;
  const m = t.match(/(\d+)\s*(min|hour|hr|h|m)/i);
  if (!m) return undefined;
  const n = parseInt(m[1], 10);
  const unit = m[2].toLowerCase();
  return unit.startsWith("h") ? `PT${n}H` : `PT${n}M`;
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const recipe = getRecipe(slug, locale);
  if (!recipe) notFound();

  // Redirect to English if no locale-specific file exists (avoids duplicate content).
  const availableLocales = recipeLocales(slug);
  if (!availableLocales.includes(locale)) {
    redirect(`/en/recipes/${slug}`);
  }

  const { frontmatter, content } = recipe;
  const html = await markdownToHtml(content);

  // Prefer ingredients-with-quantities parsed from the markdown body (Google Recipe
  // rich-result requirement). Fall back to capitalized frontmatter list if missing.
  const recipeIngredientList =
    extractIngredientLines(content) ??
    frontmatter.longevity_ingredients?.map((s) =>
      s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    );
  const recipeInstructions = extractInstructionSteps(content);

  const recipeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: frontmatter.title,
    url: `${SITE_URL}/${locale}/recipes/${slug}/`,
    image: `${SITE_URL}/recipes/${slug}.webp`,
    inLanguage: locale,
    recipeCategory: frontmatter.meal_type?.[0],
    recipeCuisine: frontmatter.tags?.includes("Mediterranean") ? "Mediterranean" : undefined,
    recipeYield: frontmatter.servings ? `${frontmatter.servings} servings` : undefined,
    prepTime: parseDuration(frontmatter.prep_time),
    cookTime: parseDuration(frontmatter.cook_time),
    keywords: frontmatter.tags?.join(", "),
    recipeIngredient: recipeIngredientList,
    recipeInstructions,
    suitableForDiet: frontmatter.tags?.includes("vegan")
      ? "https://schema.org/VeganDiet"
      : frontmatter.tags?.includes("vegetarian")
        ? "https://schema.org/VegetarianDiet"
        : undefined,
    author: {
      "@type": "Person",
      name: "Manuel Benitez",
      url: `${SITE_URL}/${locale}/about/`,
      jobTitle: "Software Engineer",
      sameAs: [
        "https://github.com/manuelbenitez",
        "mailto:manuel@mbdev.to",
      ],
    },
    publisher: {
      "@type": "Organization",
      name: "Longevity Wiki",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-large.svg` },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/${locale}/` },
      { "@type": "ListItem", position: 2, name: "Recipes", item: `${SITE_URL}/${locale}/recipes/` },
      { "@type": "ListItem", position: 3, name: frontmatter.title },
    ],
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="max-w-[680px] mx-auto px-6 pt-12 pb-4">
        <Link
          href={`/${locale}/recipes/`}
          className="text-sm text-muted hover:text-accent transition-colors !no-underline !border-none"
        >
          &larr; Back to wiki
        </Link>
      </div>

      <article className="max-w-[680px] mx-auto px-6 pb-24">
        {/* Meta */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          {frontmatter.prep_time && (
            <span className="text-xs font-semibold border border-border rounded-sm px-3 py-1.5 text-muted capitalize">
              Prep: {frontmatter.prep_time}
            </span>
          )}
          {frontmatter.cook_time && (
            <span className="text-xs font-semibold border border-border rounded-sm px-3 py-1.5 text-muted capitalize">
              Cook: {frontmatter.cook_time}
            </span>
          )}
          {frontmatter.servings && (
            <span className="text-xs font-semibold border border-border rounded-sm px-3 py-1.5 text-muted capitalize">
              {frontmatter.servings} servings
            </span>
          )}
          {frontmatter.difficulty && (
            <span className="text-xs font-semibold border border-border rounded-sm px-3 py-1.5 text-muted capitalize">
              {frontmatter.difficulty}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="font-display text-[42px] font-light leading-[1.1] mb-6">
          {frontmatter.title}
        </h1>

        {/* Longevity ingredients */}
        {frontmatter.longevity_ingredients && (
          <div className="flex gap-2 flex-wrap mb-12">
            {frontmatter.longevity_ingredients.map((ing) => {
              const label = ing
                .split("-")
                .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ");
              return (
                <Link
                  key={ing}
                  href={`/${locale}/ingredients/${ing}/`}
                  className="text-xs font-semibold border border-accent/30 bg-accent/5 rounded-sm px-3 py-1.5 text-accent hover:bg-accent/10 transition-colors !no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Content rendered server-side */}
        <div
          className="wiki-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </main>
  );
}
