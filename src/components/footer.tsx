import Link from "next/link";

export function Footer() {
  return (
    <footer className="max-w-[1200px] mx-auto px-6 py-12 border-t border-border">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <p className="font-display text-sm text-text mb-1">Longevity Wiki</p>
          <p className="text-xs text-muted">
            Open source food encyclopedia grounded in peer-reviewed longevity
            research.
          </p>
        </div>
        <div className="flex gap-6">
          <Link
            href="/#ingredients"
            className="text-xs text-muted hover:text-accent !no-underline !border-none transition-colors"
          >
            Ingredients
          </Link>
          <Link
            href="/#recipes"
            className="text-xs text-muted hover:text-accent !no-underline !border-none transition-colors"
          >
            Recipes
          </Link>
          <Link
            href="/sources/"
            className="text-xs text-muted hover:text-accent !no-underline !border-none transition-colors"
          >
            Sources
          </Link>
        </div>
      </div>
    </footer>
  );
}
