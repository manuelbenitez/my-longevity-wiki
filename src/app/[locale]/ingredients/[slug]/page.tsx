import { setRequestLocale } from "next-intl/server";
import {
  getAllWikiSlugs,
  getWikiEntry,
  getAllRecipes,
  getIndividualIngredients,
  wikiLocales,
} from "@/lib/data";
import { markdownToHtml } from "@/lib/markdown";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
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
  const seoImage = `/seo/ingredients/${slug}.jpg`;
  const locales = wikiLocales(slug);
  const languages: Record<string, string> = {};
  if (locales.includes("en")) languages["x-default"] = `/en/ingredients/${slug}/`;
  for (const loc of locales) {
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
      images: [
        {
          url: seoImage,
          width: 1200,
          height: 630,
          alt: `${title} — Longevity Wiki ingredient guide`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — Longevity Wiki`,
      description: `Science-backed guide to ${title.toLowerCase()} for healthy aging.`,
      images: [seoImage],
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

  // If this locale has no dedicated file, getWikiEntry fell back to English.
  // Redirect to the English page so we never serve duplicate content at es URLs.
  const availableLocales = wikiLocales(slug);
  if (!availableLocales.includes(locale)) {
    redirect(`/en/ingredients/${slug}`);
  }

  const { frontmatter, content } = entry;
  // Pull the lead paragraph out of the body so we can render it in the hero.
  const bodyAfterTitle = content.replace(/^\s*#\s+.+\n+/m, "");
  const leadMatch = bodyAfterTitle.match(/^([^\n][\s\S]*?)(?:\n\n|$)/);
  const leadMarkdown = leadMatch?.[1]?.trim() ?? "";
  const leadHtml = leadMarkdown ? await markdownToHtml(leadMarkdown) : "";
  const remainingContent = leadMarkdown
    ? content.replace(leadMarkdown, "").replace(/^\s*#\s+.+\n+/m, "")
    : content;
  const html = await markdownToHtml(remainingContent);

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

  // Related ingredients: same category first, then tag overlap. Excludes self.
  // Internal-link density helps Google understand topical clustering and gives
  // crawlers more paths into long-tail pages.
  const allIngredients = getIndividualIngredients(locale);
  const tagSet = new Set(frontmatter.tags || []);
  const relatedIngredients = allIngredients
    .filter((i) => i.slug !== slug)
    .map((i) => {
      const sameCategory = i.frontmatter.category === frontmatter.category ? 2 : 0;
      const tagOverlap = (i.frontmatter.tags || []).filter((t) => tagSet.has(t)).length;
      return { entry: i, score: sameCategory + tagOverlap };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((x) => x.entry);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: frontmatter.title,
    url: `${SITE_URL}/${locale}/ingredients/${slug}/`,
    image: `${SITE_URL}/icons/${slug}.webp`,
    inLanguage: locale,
    articleSection: frontmatter.category,
    keywords: frontmatter.tags?.join(", "),
    dateModified: frontmatter.last_updated,
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
      { "@type": "ListItem", position: 2, name: "Ingredients", item: `${SITE_URL}/${locale}/ingredients/` },
      { "@type": "ListItem", position: 3, name: frontmatter.title },
    ],
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
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
        {/* Hero */}
        <div className="flex flex-col items-center text-center gap-5 sm:flex-row sm:items-start sm:text-left sm:gap-6 mb-12">
          <div className="w-full aspect-square sm:w-87.5 sm:h-87.5 sm:aspect-auto shrink-0 rounded-md border border-border overflow-hidden flex items-center justify-center">
            <Image
              src={`/icons/${slug}.webp`}
              alt=""
              width={350}
              height={350}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <h1 className="font-display text-3xl sm:text-[42px] font-light leading-[1.1] mb-3 sm:mb-4">
              {frontmatter.title}
            </h1>
            <div className="flex items-center gap-2 flex-wrap mb-4">
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
            {leadHtml && (
              <div
                className="wiki-content text-text"
                dangerouslySetInnerHTML={{ __html: leadHtml }}
              />
            )}
          </div>
        </div>

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

      {/* Related Ingredients */}
      {relatedIngredients.length > 0 && (
        <section className="max-w-[680px] mx-auto px-6 pb-24">
          <div className="border-t border-border pt-12">
            <h2 className="font-display text-2xl font-normal mb-6">
              Related ingredients
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {relatedIngredients.map((i) => (
                <Link
                  key={i.slug}
                  href={`/${locale}/ingredients/${i.slug}/`}
                  className="block bg-surface border border-border rounded-lg p-4 hover:border-accent transition-all duration-200 !no-underline hover:-translate-y-0.5"
                >
                  <div className="font-display text-base font-normal text-text mb-1">
                    {i.frontmatter.title}
                  </div>
                  {i.frontmatter.category && (
                    <div className="text-xs text-muted capitalize">
                      {i.frontmatter.category}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
