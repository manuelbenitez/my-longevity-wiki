import Link from "next/link";

export function Nav() {
  return (
    <nav className="sticky top-0 z-40 bg-bg/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-lg font-normal text-text !no-underline !border-none hover:text-accent transition-colors"
        >
          Longevity Wiki
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/#ingredients"
            className="text-sm text-muted hover:text-accent !no-underline !border-none transition-colors"
          >
            Ingredients
          </Link>
          <Link
            href="/#recipes"
            className="text-sm text-muted hover:text-accent !no-underline !border-none transition-colors"
          >
            Recipes
          </Link>
          <Link
            href="/sources/"
            className="text-sm text-muted hover:text-accent !no-underline !border-none transition-colors"
          >
            Sources
          </Link>
        </div>
      </div>
    </nav>
  );
}
