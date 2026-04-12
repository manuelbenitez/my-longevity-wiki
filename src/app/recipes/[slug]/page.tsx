import { getAllRecipeSlugs, getRecipe } from "@/lib/data";
import { markdownToHtml } from "@/lib/markdown";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return getAllRecipeSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const recipe = getRecipe(slug);
  if (!recipe) return {};
  const { title, longevity_ingredients, difficulty, tags } = recipe.frontmatter;
  const ingredients = longevity_ingredients
    ?.map((s) => s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "))
    .join(", ");
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
    openGraph: {
      title: `${title} — Longevity Wiki Recipe`,
      description: `Science-backed recipe with ${ingredients}. Every ingredient chosen for its longevity benefits.`,
      type: "article",
    },
  };
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = getRecipe(slug);
  if (!recipe) notFound();

  const { frontmatter, content } = recipe;
  const html = await markdownToHtml(content);

  return (
    <main className="min-h-screen">
      <div className="max-w-[680px] mx-auto px-6 pt-12 pb-4">
        <Link
          href="/"
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
                <span
                  key={ing}
                  className="text-xs font-semibold border border-accent/30 bg-accent/5 rounded-sm px-3 py-1.5 text-accent"
                >
                  {label}
                </span>
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
