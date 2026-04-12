import Link from "next/link";
import { getAllWikiEntries, getAllRecipes, getMasterIngredients } from "@/lib/data";
import { IngredientGrid } from "@/components/ingredient-grid";

export default function Home() {
  const wikiEntries = getAllWikiEntries();
  const recipes = getAllRecipes();
  const allIngredients = getMasterIngredients();

  const ingredientCards = wikiEntries.map((e) => ({
    slug: e.slug,
    title: e.frontmatter.title,
    category: e.frontmatter.category || "other",
    longevity_score: e.frontmatter.longevity_score || 0,
    tags: e.frontmatter.tags || [],
  }));

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <header className="max-w-[680px] mx-auto px-6 pt-24 pb-16 animate-fade-up">
        <p className="text-muted text-xs font-medium tracking-[0.15em] uppercase mb-4">
          Science-backed food encyclopedia
        </p>
        <h1 className="font-display text-5xl font-light leading-[1.1] mb-6">
          Longevity Wiki
        </h1>
        <p className="text-muted text-lg leading-relaxed max-w-[480px]">
          {wikiEntries.length} ingredients studied for their effect on healthy
          aging. Grounded in peer-reviewed research and the work of Professor
          Luigi Fontana.
        </p>
      </header>

      {/* Stats */}
      <div className="max-w-[680px] mx-auto px-6 pb-16 flex gap-12">
        <div>
          <div className="font-display text-3xl font-light">
            {wikiEntries.length}
          </div>
          <div className="text-muted text-sm">Ingredients</div>
        </div>
        <div>
          <div className="font-display text-3xl font-light">
            {recipes.length}
          </div>
          <div className="text-muted text-sm">Recipes</div>
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Filterable Ingredient Grid */}
      <section id="ingredients" className="max-w-[1200px] mx-auto px-6 py-16 scroll-mt-16">
        <p className="text-xs font-medium tracking-[0.15em] uppercase text-muted mb-8">
          Ingredients
        </p>
        <IngredientGrid ingredients={ingredientCards} />
      </section>

      <div className="border-t border-border" />

      {/* Recipes */}
      {recipes.length > 0 && (
        <section id="recipes" className="max-w-[1200px] mx-auto px-6 py-16 scroll-mt-16">
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-muted mb-8">
            Recipes
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {recipes.map((recipe) => (
              <Link
                key={recipe.slug}
                href={`/recipes/${recipe.slug}/`}
                className="block bg-surface border border-border rounded-lg p-6 hover:border-accent transition-all duration-200 !no-underline hover:-translate-y-0.5"
              >
                <div className="flex gap-2 mb-3">
                  {recipe.frontmatter.prep_time && (
                    <span className="text-xs border border-border rounded-sm px-2 py-1 text-muted">
                      {recipe.frontmatter.prep_time}
                    </span>
                  )}
                  {recipe.frontmatter.difficulty && (
                    <span className="text-xs border border-border rounded-sm px-2 py-1 text-muted">
                      {recipe.frontmatter.difficulty}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-xl font-normal mb-2 text-text">
                  {recipe.frontmatter.title}
                </h3>
                <div className="flex gap-1.5 flex-wrap">
                  {recipe.frontmatter.longevity_ingredients
                    ?.slice(0, 4)
                    .map((ing) => (
                      <span
                        key={ing}
                        className="text-xs border border-border rounded-sm px-2 py-0.5 text-muted"
                      >
                        {ing}
                      </span>
                    ))}
                </div>
              </Link>
            ))}
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
