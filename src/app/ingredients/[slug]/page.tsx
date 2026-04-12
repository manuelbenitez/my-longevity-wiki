import { getAllWikiSlugs, getWikiEntry, getAllRecipes } from "@/lib/data";
import { markdownToHtml } from "@/lib/markdown";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return getAllWikiSlugs().map((slug) => ({ slug }));
}

export default async function IngredientPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getWikiEntry(slug);
  if (!entry) notFound();

  const { frontmatter, content } = entry;
  const html = await markdownToHtml(content);

  // Find recipes that use this ingredient
  const allRecipes = getAllRecipes();
  const relatedRecipes = allRecipes.filter((r) =>
    r.frontmatter.longevity_ingredients?.some(
      (ing) =>
        ing === slug ||
        ing === frontmatter.title.toLowerCase() ||
        slug.includes(ing) ||
        ing.includes(slug.split("-")[0])
    )
  );

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

      <article className="max-w-[680px] mx-auto px-6 pb-12">
        {/* Meta */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          {frontmatter.longevity_score && (
            <span
              className="inline-flex items-center gap-1.5 bg-accent text-white px-3 py-1 rounded-sm text-xs font-semibold"
              title="Evidence strength: how well-supported are the longevity claims for this ingredient"
            >
              Evidence: {frontmatter.longevity_score}/10
            </span>
          )}
          {frontmatter.category && (
            <span className="text-xs border border-border rounded-sm px-2 py-1 text-muted">
              {frontmatter.category}
            </span>
          )}
          {frontmatter.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs border border-border rounded-sm px-2 py-1 text-muted"
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
                  href={`/recipes/${recipe.slug}/`}
                  className="block bg-surface border border-border rounded-lg p-5 !border-b-border hover:!border-accent transition-colors duration-200 !no-underline"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-lg font-normal text-text mb-1">
                        {recipe.frontmatter.title}
                      </h3>
                      <div className="flex gap-2 flex-wrap">
                        {recipe.frontmatter.longevity_ingredients
                          ?.slice(0, 5)
                          .map((ing) => (
                            <span
                              key={ing}
                              className={`text-xs rounded-sm px-2 py-0.5 ${
                                ing === slug ||
                                slug.includes(ing) ||
                                ing.includes(slug.split("-")[0])
                                  ? "border border-accent/30 bg-accent/5 text-accent font-medium"
                                  : "border border-border text-muted"
                              }`}
                            >
                              {ing}
                            </span>
                          ))}
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

      {/* Footer */}
      <footer className="max-w-[680px] mx-auto px-6 py-12 text-center border-t border-border">
        <p className="text-sm text-muted">
          Longevity Wiki. Content grounded in{" "}
          <em>The Path to Longevity</em> by Luigi Fontana.
        </p>
      </footer>
    </main>
  );
}
