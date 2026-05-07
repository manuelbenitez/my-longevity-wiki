import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { routing } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "sources" });
  const path = `/${locale}/sources/`;
  const languages: Record<string, string> = { "x-default": `/en/sources/` };
  for (const loc of routing.locales) {
    languages[loc] = `/${loc}/sources/`;
  }
  return {
    title: t("metadata_title"),
    description: t("metadata_description"),
    alternates: { canonical: path, languages },
    openGraph: { url: path, images: ["/og-image.png"] },
  };
}

const SOURCES = [
  {
    title: "The Longevity Diet",
    subtitleKey: "longo_subtitle",
    author: "Dr. Valter Longo",
    year: 2018,
    publisher: "Avery / Penguin Random House",
    isbn: "978-0525534075",
    amazonUrl: "https://www.amazon.com/dp/0525534075",
    googleBooksUrl: "https://books.google.com/books?isbn=9780525534075",
    descriptionKey: "longo_description",
    chapterKeys: [
      "longo_chapter_2",
      "longo_chapter_3",
      "longo_chapter_4",
      "longo_chapter_5",
      "longo_chapter_6",
      "longo_chapter_7",
    ],
    ingredients_extracted: 224,
    claims_extracted: 380,
    status: "active",
  },
  {
    title: "The Path to Longevity",
    subtitleKey: "fontana_subtitle",
    author: "Professor Luigi Fontana",
    year: 2020,
    publisher: "Hardie Grant Publishing",
    isbn: "978-1743795965",
    amazonUrl: "https://www.amazon.com/dp/1743795963",
    googleBooksUrl: "https://books.google.com/books?isbn=9781743795965",
    descriptionKey: "fontana_description",
    chapterKeys: [
      "fontana_chapter_4",
      "fontana_chapter_5",
      "fontana_chapter_7",
      "fontana_chapter_8",
      "fontana_chapter_9",
      "fontana_chapter_10",
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
  const t = await getTranslations({ locale, namespace: "sources" });
  return (
    <main className="min-h-screen">
      <div className="max-w-[680px] mx-auto px-6 pt-12 pb-4">
        <Link
          href={`/${locale}/`}
          className="text-sm text-muted hover:text-accent transition-colors !no-underline !border-none"
        >
          &larr; {t("back")}
        </Link>
      </div>

      <div className="max-w-[680px] mx-auto px-6 mb-12">
        <div className="flex flex-col items-center text-center gap-5 sm:flex-row sm:items-start sm:text-left sm:gap-6">
          <div className="w-full aspect-square sm:w-87.5 sm:h-87.5 sm:aspect-auto shrink-0 rounded-md border border-border overflow-hidden flex items-center justify-center">
            <Image
              src="/headers/sources.webp"
              alt=""
              width={350}
              height={350}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <h1 className="font-display text-3xl sm:text-[42px] font-light leading-[1.1] mb-3 sm:mb-4">
              {t("title")}
            </h1>
            <p className="text-muted text-lg leading-relaxed">
              {t("description")}
            </p>
          </div>
        </div>
      </div>

      <article className="max-w-[680px] mx-auto px-6 pb-24">

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
                  <p className="text-sm text-muted">{t(source.subtitleKey)}</p>
                </div>
                {source.status === "active" && (
                  <span className="shrink-0 text-xs font-semibold bg-accent/10 text-accent border border-accent/20 rounded-sm px-3 py-1.5">
                    {t("active")}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <span className="text-muted">{t("author")}</span>
                  <p className="font-medium">{source.author}</p>
                </div>
                <div>
                  <span className="text-muted">{t("published")}</span>
                  <p className="font-medium">{source.year}</p>
                </div>
                <div>
                  <span className="text-muted">{t("publisher")}</span>
                  <p className="font-medium">{source.publisher}</p>
                </div>
                <div>
                  <span className="text-muted">ISBN</span>
                  <p className="font-medium">{source.isbn}</p>
                </div>
              </div>

              <p className="text-sm leading-relaxed mb-6">
                {t(source.descriptionKey)}
              </p>

              <div className="flex gap-8 mb-6">
                <div>
                  <div className="font-display text-2xl font-light">
                    {source.ingredients_extracted}
                  </div>
                  <div className="text-xs text-muted">{t("ingredients_extracted")}</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-light">
                    {source.claims_extracted}
                  </div>
                  <div className="text-xs text-muted">{t("health_claims")}</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-light">
                    {source.chapterKeys.length}
                  </div>
                  <div className="text-xs text-muted">{t("chapters_parsed")}</div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
                  {t("chapters_used")}
                </p>
                <div className="space-y-1">
                  {source.chapterKeys.map((chapterKey) => (
                    <p key={chapterKey} className="text-sm text-text">
                      {t(chapterKey)}
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
                  {t("buy_amazon")}
                </a>
                <a
                  href={source.googleBooksUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold border border-border rounded px-3 py-1.5 hover:border-accent hover:text-accent transition-colors"
                >
                  {t("google_books")}
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 border border-border border-dashed rounded-lg p-8 text-center">
          <p className="font-display text-lg mb-2 text-muted">
            {t("coming_soon")}
          </p>
          <p className="text-sm text-muted">
            {t("coming_soon_description")}
          </p>
        </div>
      </article>
    </main>
  );
}
