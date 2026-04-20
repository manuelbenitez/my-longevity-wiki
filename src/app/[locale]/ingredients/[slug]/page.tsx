import { setRequestLocale } from "next-intl/server";
import { getAllWikiSlugs, getWikiEntry, getAllRecipes, wikiLocales } from "@/lib/data";
import { markdownToHtml } from "@/lib/markdown";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return getAllWikiSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const entry = getWikiEntry(slug, locale);
  if (!entry) return {};
  const { title, category, tags } = entry.frontmatter;
  const path = `/${locale}/ingredients/${slug}/`;
  const languages: Record<string, string> = {};
  for (const loc of wikiLocales(slug)) {
    languages[loc] = `/${loc}/ingredients/${slug}/`;
  }
  return {
    title: `${title} — Longevity Benefits, How to Use, Recipes`,
    description: `${title}: science-backed health benefits for longevity and healthy aging. Learn the best ways to eat ${title.toLowerCase()}, what to pair it with, and the research behind it.`,
    keywords: [
      title.toLowerCase(),
      `${title.toLowerCase()} health benefits`,
      `${title.toLowerCase()} longevity`,
      `${title.toLowerCase()} anti-aging`,
      `${title.toLowerCase()} nutrition`,
      category,
      ...(tags || []),
    ],
    alternates: {
      canonical: path,
      languages,
    },
    openGraph: {
      title: `${title} — Longevity Wiki`,
      description: `Science-backed guide to ${title.toLowerCase()} for healthy aging. Evidence-based nutrition, preparation tips, and synergies.`,
      type: "article",
      url: path,
      images: ["/og-image.png"],
    },
  };
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://longevity.mbdev.to";

export default async function IngredientPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const entry = getWikiEntry(slug, locale);
  if (!entry) notFound();

  const { frontmatter, content } = entry;
  const html = await markdownToHtml(content);

  // Find recipes that use this ingredient
  const allRecipes = getAllRecipes(locale);
  const relatedRecipes = allRecipes.filter((r) =>
    r.frontmatter.longevity_ingredients?.some(
      (ing) =>
        ing === slug ||
        ing === frontmatter.title.toLowerCase() ||
        slug.includes(ing) ||
        ing.includes(slug.split("-")[0])
    )
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: frontmatter.title,
    url: `${SITE_URL}/${locale}/ingredients/${slug}/`,
    image: `${SITE_URL}/og-image.png`,
    inLanguage: locale,
    articleSection: frontmatter.category,
    keywords: frontmatter.tags?.join(", "),
    dateModified: frontmatter.last_updated,
    author: { "@type": "Organization", name: "Longevity Wiki" },
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
      <div className="max-w-[680px] mx-auto px-6 pt-12 pb-4">
        <Link
          href={`/${locale}/ingredients/`}
          className="text-sm text-muted hover:text-accent transition-colors !no-underline !border-none"
        >
          &larr; Back to wiki
        </Link>
      </div>

      <article className="max-w-[680px] mx-auto px-6 pb-12">
        {/* Meta */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          {frontmatter.category && (
            <span className="text-xs font-semibold border border-border rounded-sm px-3 py-1.5 text-muted capitalize">
              {frontmatter.category}
            </span>
          )}
          {frontmatter.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs font-semibold border border-border rounded-sm px-3 py-1.5 text-muted capitalize"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="font-display text-[42px] font-light leading-[1.1] mb-12">
          {frontmatter.title}
        </h1>

        {/* Content rendered server-side */}
        <div
          className="wiki-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>

      {/* Related Recipes */}
      {relatedRecipes.length > 0 && (
        <section className="max-w-[680px] mx-auto px-6 pb-24">
          <div className="border-t border-border pt-12">
            <h2 className="font-display text-2xl font-normal mb-6">
              Recipes with {frontmatter.title}
            </h2>
            <div className="space-y-4">
              {relatedRecipes.map((recipe) => (
                <Link
                  key={recipe.slug}
                  href={`/${locale}/recipes/${recipe.slug}/`}
                  className="block bg-surface border border-border rounded-lg p-5 hover:border-accent transition-all duration-200 !no-underline hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-lg font-normal text-text mb-2">
                        {recipe.frontmatter.title}
                      </h3>
                      <div className="flex gap-2 flex-wrap">
                        {recipe.frontmatter.longevity_ingredients
                          ?.slice(0, 5)
                          .map((ing) => {
                            const label = ing
                              .split("-")
                              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                              .join(" ");
                            const isCurrentIngredient =
                              ing === slug ||
                              slug.includes(ing) ||
                              ing.includes(slug.split("-")[0]);
                            return (
                              <span
                                key={ing}
                                className={`text-xs font-semibold rounded-sm px-3 py-1.5 ${
                                  isCurrentIngredient
                                    ? "border border-accent/30 bg-accent/5 text-accent"
                                    : "border border-border text-muted"
                                }`}
                              >
                                {label}
                              </span>
                            );
                          })}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {recipe.frontmatter.prep_time && (
                        <span className="text-xs text-muted">
                          {recipe.frontmatter.prep_time}
                        </span>
                      )}
                      {recipe.frontmatter.difficulty && (
                        <span className="text-xs text-muted">
                          {recipe.frontmatter.difficulty}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
