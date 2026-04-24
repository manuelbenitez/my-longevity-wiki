import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import { routing } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const path = `/${locale}/sources/`;
  const languages: Record<string, string> = { "x-default": `/en/sources/` };
  for (const loc of routing.locales) {
    languages[loc] = `/${loc}/sources/`;
  }
  return {
    title: "Sources — Peer-Reviewed Research Behind the Wiki",
    description:
      "Books and publications parsed, verified, and structured into the Longevity Wiki ingredient database. Featuring Luigi Fontana and Valter Longo's longevity research.",
    alternates: { canonical: path, languages },
    openGraph: { url: path, images: ["/og-image.png"] },
  };
}

const SOURCES = [
  {
    title: "The Longevity Diet",
    subtitle: "Discover the New Science Behind Stem Cell Activation and Regeneration",
    author: "Dr. Valter Longo",
    year: 2018,
    publisher: "Avery / Penguin Random House",
    isbn: "978-0525534075",
    amazonUrl: "https://www.amazon.com/dp/0525534075",
    googleBooksUrl: "https://books.google.com/books?isbn=9780525534075",
    description:
      "Dr. Longo's evidence-based Longevity Diet program, developed from decades of research on fasting, stem cell activation, and the eating patterns of the world's longest-lived populations. Covers the five longevity pillars, the Fasting Mimicking Diet, and practical meal plans grounded in Mediterranean and Okinawan traditions.",
    chapters_used: [
      "Ch. 2: The Five Pillars of Longevity",
      "Ch. 3: Eating for Longevity — Fundamentals",
      "Ch. 4: What to Eat and Drink",
      "Ch. 5: When to Eat — Time-Restricted Feeding",
      "Ch. 6: The Fasting Mimicking Diet",
      "Ch. 7: Longevity Diet Meal Plans and Recipes",
    ],
    ingredients_extracted: 224,
    claims_extracted: 380,
    status: "active",
  },
  {
    title: "The Path to Longevity",
    subtitle: "How to Reach 100 with the Health and Stamina of a 40-Year-Old",
    author: "Professor Luigi Fontana",
    year: 2020,
    publisher: "Hardie Grant Publishing",
    isbn: "978-1743795965",
    amazonUrl: "https://www.amazon.com/dp/1743795963",
    googleBooksUrl: "https://books.google.com/books?isbn=9781743795965",
    description:
      "A summary of more than 20 years of research and clinical practice on healthy longevity. Covers nutrition, calorie restriction, fasting, the Mediterranean diet, the modern longevity food pyramid, exercise, brain health, and prevention. The primary source for ingredient claims, consumption recommendations, and scientific references in this wiki.",
    chapters_used: [
      "Ch. 4: The Science of Healthy Nutrition",
      "Ch. 5: Longevity Effects of Restricting Calories and Fasting",
      "Ch. 7: Diet Quality Matters",
      "Ch. 8: The Mediterranean Diet",
      "Ch. 9: Move to the Modern Healthy Longevity Diet",
      "Ch. 10: Foods to Eliminate or Drastically Reduce",
    ],
    ingredients_extracted: 101,
    claims_extracted: 236,
    status: "active",
  },
];

export default async function SourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main className="min-h-screen">
      <div className="max-w-[680px] mx-auto px-6 pt-12 pb-4">
        <Link
          href={`/${locale}/`}
          className="text-sm text-muted hover:text-accent transition-colors !no-underline !border-none"
        >
          &larr; Back to wiki
        </Link>
      </div>

      <article className="max-w-[680px] mx-auto px-6 pb-24">
        <h1 className="font-display text-[42px] font-light leading-[1.1] mb-6">
          Sources
        </h1>
        <p className="text-muted text-lg leading-relaxed mb-12">
          Every claim in this wiki is grounded in peer-reviewed research. These
          are the books and publications we have parsed, verified, and structured
          into the ingredient database.
        </p>

        <div className="space-y-12">
          {SOURCES.map((source) => (
            <div
              key={source.isbn}
              className="border border-border rounded-lg p-8 bg-surface"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="font-display text-2xl font-normal mb-1">
                    {source.title}
                  </h2>
                  <p className="text-sm text-muted">{source.subtitle}</p>
                </div>
                {source.status === "active" && (
                  <span className="shrink-0 text-xs font-semibold bg-accent/10 text-accent border border-accent/20 rounded-sm px-3 py-1.5">
                    Active
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <span className="text-muted">Author</span>
                  <p className="font-medium">{source.author}</p>
                </div>
                <div>
                  <span className="text-muted">Published</span>
                  <p className="font-medium">{source.year}</p>
                </div>
                <div>
                  <span className="text-muted">Publisher</span>
                  <p className="font-medium">{source.publisher}</p>
                </div>
                <div>
                  <span className="text-muted">ISBN</span>
                  <p className="font-medium">{source.isbn}</p>
                </div>
              </div>

              <p className="text-sm leading-relaxed mb-6">
                {source.description}
              </p>

              <div className="flex gap-8 mb-6">
                <div>
                  <div className="font-display text-2xl font-light">
                    {source.ingredients_extracted}
                  </div>
                  <div className="text-xs text-muted">Ingredients Extracted</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-light">
                    {source.claims_extracted}
                  </div>
                  <div className="text-xs text-muted">Health Claims</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-light">
                    {source.chapters_used.length}
                  </div>
                  <div className="text-xs text-muted">Chapters Parsed</div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
                  Chapters Used
                </p>
                <div className="space-y-1">
                  {source.chapters_used.map((ch) => (
                    <p key={ch} className="text-sm text-text">
                      {ch}
                    </p>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <a
                  href={source.amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold border border-border rounded px-3 py-1.5 hover:border-accent hover:text-accent transition-colors"
                >
                  Buy on Amazon
                </a>
                <a
                  href={source.googleBooksUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold border border-border rounded px-3 py-1.5 hover:border-accent hover:text-accent transition-colors"
                >
                  Google Books
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 border border-border border-dashed rounded-lg p-8 text-center">
          <p className="font-display text-lg mb-2 text-muted">
            More sources coming soon
          </p>
          <p className="text-sm text-muted">
            We are actively parsing additional longevity research including works
            by Peter Attia and Dan Buettner.
          </p>
        </div>
      </article>
    </main>
  );
}
