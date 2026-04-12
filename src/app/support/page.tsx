import Link from "next/link";
import type { Metadata } from "next";
import { DonationFeed } from "@/components/donation-feed";

export const metadata: Metadata = {
  title: "Support the Wiki",
  description:
    "Help keep Longevity Wiki free, ad-free, and growing. Donations buy longevity research books that become new ingredient articles and recipes for everyone.",
};

const CRYPTO_ADDRESS = "0x8b930D725e7D4CE7442b9BdCe4c470cf7beDda72";

export default function SupportPage() {
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
            <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-lg shrink-0">
              📚
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
            <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-lg shrink-0">
              🌐
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
            <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-lg shrink-0">
              🔬
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

        {/* Donate */}
        <h2 className="font-display text-2xl font-normal mb-6">
          How to support
        </h2>

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

      </article>
    </main>
  );
}
