import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { DonationFeed } from "@/components/donation-feed";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const path = `/${locale}/support/`;
  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `/${loc}/support/`;
  }
  return {
    title: "Support the Wiki",
    description:
      "Help keep Longevity Wiki free, ad-free, and growing. Donations buy longevity research books that become new ingredient articles and recipes for everyone.",
    alternates: { canonical: path, languages },
    openGraph: { url: path },
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
          Support the Wiki
        </h1>

        {/* The Pledge */}
        <div className="border border-accent/20 bg-accent/5 rounded-lg p-8 mb-12">
          <h2 className="font-display text-xl font-normal mb-3">
            Our promise to you
          </h2>
          <p className="leading-relaxed mb-4">
            Longevity Wiki will <strong>never</strong> run advertising.
            No sponsored content. No affiliate links disguised as
            recommendations. No paywalls. No data collection.
          </p>
          <p className="leading-relaxed text-muted">
            Every ingredient article and recipe is written based on
            peer-reviewed science, not whoever pays the most. This is how
            nutrition information should work.
          </p>
        </div>

        {/* Where the money goes */}
        <h2 className="font-display text-2xl font-normal mb-6">
          Where your donation goes
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
                Buy the next book
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Each longevity research book we parse becomes 50-100 new
                ingredient articles and dozens of science-backed recipes. Next
                on the list: Valter Longo&apos;s &quot;The Longevity Diet&quot;,
                Peter Attia&apos;s &quot;Outlive&quot;, and Dan
                Buettner&apos;s &quot;The Blue Zones Kitchen&quot;.
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
                Keep the site running
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Domain registration, hosting, and the occasional coffee for the
                person maintaining this. Running costs are minimal since the
                wiki is a static site with no servers.
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
                Improve the research
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Cross-referencing claims with PubMed studies, verifying
                mechanisms, updating articles when new research comes out. The
                wiki gets more accurate over time.
              </p>
            </div>
          </div>
        </div>

        {/* What's next — Roadmap */}
        <h2 className="font-display text-2xl font-normal mb-6">
          What&apos;s next
        </h2>
        <p className="text-muted leading-relaxed mb-8">
          Where your donations take us next.
        </p>

        <div className="space-y-6 mb-12">
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
                    More books on the shelf
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-[11px] font-medium uppercase tracking-[0.08em] bg-[#C4963A] text-[#FDFBF8] border border-[#C4963A]">
                    In Progress
                  </span>
                </div>
                <p className="inline-flex items-baseline gap-1.5 text-muted mb-2">
                  <span className="font-display text-lg font-normal leading-none">2</span>
                  <span className="text-[11px] font-medium uppercase tracking-[0.08em]">books so far</span>
                </p>
                <p className="text-sm leading-relaxed">
                  Each longevity book we parse becomes 50+ new ingredient
                  articles and dozens of science-backed recipes. Next on
                  the shelf: Valter Longo&apos;s &quot;The Longevity
                  Diet,&quot; Peter Attia&apos;s &quot;Outlive,&quot; Dan
                  Buettner&apos;s &quot;The Blue Zones Kitchen.&quot;
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
                  Symptom to food
                </h3>
                <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-[11px] font-medium uppercase tracking-[0.08em] text-muted border border-border">
                  Planned
                </span>
              </div>
              <p className="text-sm leading-relaxed">
                Pick how you feel &mdash; low energy, poor sleep, bloating
                &mdash; and get ingredient suggestions grounded in
                peer-reviewed science.
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
                  Saved recipes across devices
                </h3>
                <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-[11px] font-medium uppercase tracking-[0.08em] text-muted border border-border">
                  Planned
                </span>
              </div>
              <p className="text-sm leading-relaxed">
                Sign in and keep your meal plans and tried ingredients on
                any device, with no ads and no data tracking.
              </p>
            </div>
          </div>

          {/* Planned — hand-drawn illustrations (last) */}
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
                  Hand-drawn illustrations for every ingredient
                </h3>
                <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-[11px] font-medium uppercase tracking-[0.08em] text-muted border border-border">
                  Planned
                </span>
              </div>
              <p className="text-sm leading-relaxed">
                Every ingredient article gets a pen-and-ink SVG in the
                field-guide style. No stock photography, ever.
              </p>
            </div>
          </div>
        </div>

        {/* Donate */}
        <h2 className="font-display text-2xl font-normal mb-6">
          How to support
        </h2>

        {/* Buy Me a Coffee */}
        <div className="border border-border rounded-lg p-8 bg-surface mb-6">
          <h3 className="font-display text-lg font-normal mb-1">
            Buy Me a Coffee
          </h3>
          <p className="text-sm text-muted mb-4">
            One-time or monthly. Credit card, Apple Pay, Google Pay. No
            account needed.
          </p>
          <a
            href="https://buymeacoffee.com/longevity.wiki"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-accent text-accent px-6 py-3 rounded-sm text-sm font-semibold hover:bg-accent/10 transition-all duration-200 !no-underline !border-b-accent"
          >
            Buy Me a Coffee
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
            Crypto (ETH / EVM)
          </h3>
          <p className="text-sm text-muted mb-4">
            Send ETH or any EVM-compatible token to this address.
          </p>
          <div className="bg-bg border border-border rounded-md p-4 font-mono text-sm break-all select-all">
            {CRYPTO_ADDRESS}
          </div>
          <p className="text-xs text-muted mt-3">
            Ethereum, Polygon, Arbitrum, Optimism, Base, or any EVM chain.
          </p>
        </div>

        {/* Donation Feed */}
        <div className="mb-12">
          <h2 className="font-display text-2xl font-normal mb-6">
            Recent donations
          </h2>
          <DonationFeed />
        </div>

        {/* Contribute */}
        <h2 className="font-display text-2xl font-normal mb-6">
          Support doesn&apos;t only mean money
        </h2>
        <p className="leading-relaxed mb-6">
          This is an open source project. You can help by improving the
          ingredient extraction skills, adding new data, fixing bugs, or
          writing better wiki articles. Every pull request makes the wiki
          better for everyone.
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
                Longevity Wiki
              </h3>
              <p className="text-sm text-muted">
                The website, articles, and recipes. Add ingredients, fix content,
                improve the design.
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
                Longevity Skills
              </h3>
              <p className="text-sm text-muted">
                The Claude Code skills that extract, research, and generate
                content. Improve the pipeline, add new book parsers.
              </p>
            </div>
          </a>
        </div>

      </article>
    </main>
  );
}
