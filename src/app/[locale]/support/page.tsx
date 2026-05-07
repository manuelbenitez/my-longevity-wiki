import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { DonationFeed } from "@/components/donation-feed";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "support" });
  const path = `/${locale}/support/`;
  const languages: Record<string, string> = { "x-default": `/en/support/` };
  for (const loc of routing.locales) {
    languages[loc] = `/${loc}/support/`;
  }
  return {
    title: t("title"),
    description: t("metadata_description"),
    alternates: { canonical: path, languages },
    openGraph: { url: path, images: ["/og-image.png"] },
  };
}

const CRYPTO_ADDRESS = "0x8b930D725e7D4CE7442b9BdCe4c470cf7beDda72";

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "support" });
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
              src="/headers/support.webp"
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
              {t("page_description")}
            </p>
          </div>
        </div>
      </div>

      <article className="max-w-[680px] mx-auto px-6 pb-24">
        {/* The Pledge */}
        <div className="border border-accent/20 bg-accent/5 rounded-lg p-8 mb-12">
          <h2 className="font-display text-xl font-normal mb-3">
            {t("pledge_title")}
          </h2>
          <p className="leading-relaxed mb-4">
            {t("pledge_body")}
          </p>
          <p className="leading-relaxed text-muted">
            {t("pledge_sub")}
          </p>
        </div>

        {/* Where the money goes */}
        <h2 className="font-display text-2xl font-normal mb-6">
          {t("where_title")}
        </h2>

        <div className="space-y-6 mb-12">
          <div className="flex gap-4">
            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2C2418" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19V5c0-1 1-2 2-2h8l6 6v10c0 1-1 2-2 2H6c-1 0-2-1-2-2z"/>
                <path d="M14 3v6h6"/>
                <path d="M8 13h8M8 17h5"/>
              </svg>
            </div>
            <div>
              <h3 className="font-display text-lg font-normal mb-1">
                {t("books_title")}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {t("books_description")}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2C2418" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div>
              <h3 className="font-display text-lg font-normal mb-1">
                {t("hosting_title")}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {t("hosting_description")}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2C2418" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7"/>
                <path d="M16 16l5 5"/>
              </svg>
            </div>
            <div>
              <h3 className="font-display text-lg font-normal mb-1">
                {t("research_title")}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {t("research_description")}
              </p>
            </div>
          </div>
        </div>

        {/* What's next — Roadmap */}
        <h2 className="font-display text-2xl font-normal mb-6">
          {t("roadmap_title")}
        </h2>
        <p className="text-muted leading-relaxed mb-8">
          {t("roadmap_sub")}
        </p>

        <div className="space-y-6 mb-12">
          {/* Complete — ingredient and recipe images */}
          <div className="border border-accent/20 bg-accent/5 rounded-lg p-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2C2418" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 5l4 4L8 20l-5 1 1-5z"/>
                  <path d="M13 7l4 4"/>
                  <circle cx="3" cy="21" r="0.8" fill="#2C2418"/>
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h3 className="font-display text-lg font-normal">
                    {t("roadmap_images_title")}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-[11px] font-medium uppercase tracking-[0.08em] bg-accent text-[#FDFBF8] border border-accent">
                    {t("roadmap_status_complete")}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">
                  {t("roadmap_images_body")}
                </p>
              </div>
            </div>
          </div>

          {/* In Progress — more books (sage callout, always on top) */}
          <div className="border border-accent/20 bg-accent/5 rounded-lg p-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2C2418" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 20h18"/>
                  <rect x="5" y="10" width="3" height="10"/>
                  <rect x="9" y="13" width="3" height="7"/>
                  <rect x="13" y="8" width="3" height="12"/>
                  <path d="M17.5 20l1-10 2.5 0.3L19.5 20z"/>
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h3 className="font-display text-lg font-normal">
                    {t("roadmap_books_title")}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-[11px] font-medium uppercase tracking-[0.08em] bg-[#C4963A] text-[#FDFBF8] border border-[#C4963A]">
                    {t("roadmap_status_in_progress")}
                  </span>
                </div>
                <p className="inline-flex items-baseline gap-1.5 text-muted mb-2">
                  <span className="font-display text-lg font-normal leading-none">2</span>
                  <span className="text-[11px] font-medium uppercase tracking-[0.08em]">{t("roadmap_books_count")}</span>
                </p>
                <p className="text-sm leading-relaxed">
                  {t("roadmap_books_body")}
                </p>
              </div>
            </div>
          </div>

          {/* Planned — symptom to food */}
          <div className="flex gap-4">
            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2C2418" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="6" r="2.5"/>
                <path d="M6 20v-5a6 6 0 0 1 12 0v5"/>
                <path d="M8 15h2l1.5-2 1 3 1.5-1h2"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h3 className="font-display text-lg font-normal">
                  {t("roadmap_symptoms_title")}
                </h3>
                <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-[11px] font-medium uppercase tracking-[0.08em] text-muted border border-border">
                  {t("roadmap_status_planned")}
                </span>
              </div>
              <p className="text-sm leading-relaxed">
                {t("roadmap_symptoms_body")}
              </p>
            </div>
          </div>

          {/* Planned — saved recipes across devices */}
          <div className="flex gap-4">
            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2C2418" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="12" height="9" rx="1"/>
                <path d="M2 15h14"/>
                <rect x="13" y="9" width="7" height="11" rx="1"/>
                <path d="M15 18h3"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h3 className="font-display text-lg font-normal">
                  {t("roadmap_devices_title")}
                </h3>
                <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-[11px] font-medium uppercase tracking-[0.08em] text-muted border border-border">
                  {t("roadmap_status_planned")}
                </span>
              </div>
              <p className="text-sm leading-relaxed">
                {t("roadmap_devices_body")}
              </p>
            </div>
          </div>
        </div>

        {/* Donate */}
        <h2 className="font-display text-2xl font-normal mb-6">
          {t("how_title")}
        </h2>

        {/* Buy Me a Coffee */}
        <div className="border border-border rounded-lg p-8 bg-surface mb-6">
          <h3 className="font-display text-lg font-normal mb-1">
            {t("bmc_title")}
          </h3>
          <p className="text-sm text-muted mb-4">
            {t("bmc_description")}
          </p>
          <a
            href="https://buymeacoffee.com/longevity.wiki"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-accent text-accent px-6 py-3 rounded-sm text-sm font-semibold hover:bg-accent/10 transition-all duration-200 !no-underline !border-b-accent"
          >
            {t("bmc_button")}
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 3l5 5-5 5" />
            </svg>
          </a>
        </div>

        {/* Crypto */}
        <div className="border border-border rounded-lg p-8 bg-surface mb-12">
          <h3 className="font-display text-lg font-normal mb-1">
            {t("crypto_title")}
          </h3>
          <p className="text-sm text-muted mb-4">
            {t("crypto_description")}
          </p>
          <div className="bg-bg border border-border rounded-md p-4 font-mono text-sm break-all select-all">
            {CRYPTO_ADDRESS}
          </div>
          <p className="text-xs text-muted mt-3">
            {t("crypto_networks")}
          </p>
        </div>

        {/* Donation Feed */}
        <div className="mb-12">
          <h2 className="font-display text-2xl font-normal mb-6">
            {t("recent_donations")}
          </h2>
          <DonationFeed />
        </div>

        {/* Contribute */}
        <h2 className="font-display text-2xl font-normal mb-6">
          {t("contribute_title")}
        </h2>
        <p className="leading-relaxed mb-6">
          {t("contribute_description")}
        </p>

        <div className="space-y-4 mb-12">
          <a
            href="https://github.com/manuelbenitez/my-longevity-wiki"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 border border-border rounded-lg p-5 bg-surface hover:border-accent transition-all duration-200 !no-underline hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2C2418" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-1-2.6c3.1-.4 6.4-1.5 6.4-7A5.4 5.4 0 0 0 20 4.8 5 5 0 0 0 19.8 1s-1.3-.4-4.2 1.6a14.6 14.6 0 0 0-7.6 0C5.1.6 3.8 1 3.8 1a5 5 0 0 0-.2 3.8 5.4 5.4 0 0 0-1.4 3.7c0 5.5 3.3 6.6 6.4 7a3.4 3.4 0 0 0-1 2.6V22"/>
              </svg>
            </div>
            <div>
              <h3 className="font-display text-lg font-normal text-text mb-0.5">
                {t("wiki_repo")}
              </h3>
              <p className="text-sm text-muted">
                {t("wiki_repo_description")}
              </p>
            </div>
          </a>

          <a
            href="https://github.com/manuelbenitez/longevity-skills"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 border border-border rounded-lg p-5 bg-surface hover:border-accent transition-all duration-200 !no-underline hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2C2418" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-1-2.6c3.1-.4 6.4-1.5 6.4-7A5.4 5.4 0 0 0 20 4.8 5 5 0 0 0 19.8 1s-1.3-.4-4.2 1.6a14.6 14.6 0 0 0-7.6 0C5.1.6 3.8 1 3.8 1a5 5 0 0 0-.2 3.8 5.4 5.4 0 0 0-1.4 3.7c0 5.5 3.3 6.6 6.4 7a3.4 3.4 0 0 0-1 2.6V22"/>
              </svg>
            </div>
            <div>
              <h3 className="font-display text-lg font-normal text-text mb-0.5">
                {t("skills_repo")}
              </h3>
              <p className="text-sm text-muted">
                {t("skills_repo_description")}
              </p>
            </div>
          </a>
        </div>

      </article>
    </main>
  );
}
