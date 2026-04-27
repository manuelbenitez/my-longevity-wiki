import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { getIndividualIngredients } from "@/lib/data";
import { IngredientGrid } from "@/components/ingredient-grid";
import Link from "next/link";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ingredients" });
  const path = `/${locale}/ingredients/`;
  const languages: Record<string, string> = { "x-default": `/en/ingredients/` };
  for (const loc of routing.locales) {
    languages[loc] = `/${loc}/ingredients/`;
  }
  return {
    title: t("page_title"),
    description: t("page_description"),
    alternates: { canonical: path, languages },
    openGraph: { url: path, images: ["/og-image.png"] },
  };
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://longevity.mbdev.to";

export default async function IngredientsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "ingredients" });
  const wikiEntries = getIndividualIngredients(locale);

  const ingredientCards = wikiEntries.map((e) => ({
    slug: e.slug,
    title: e.frontmatter.title,
    category: e.frontmatter.category || "other",
    longevity_score: e.frontmatter.longevity_score || 0,
    tags: e.frontmatter.tags || [],
  }));

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
        <h1 className="font-display text-[42px] font-light leading-[1.1] mb-3">
          {t("page_title")}
        </h1>
        <p className="text-muted text-lg leading-relaxed mb-12">
          {t("page_description")}
        </p>
        <IngredientGrid ingredients={ingredientCards} />
      </section>
    </main>
  );
}
