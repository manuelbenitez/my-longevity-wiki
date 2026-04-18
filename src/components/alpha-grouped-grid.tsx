"use client";

import { groupByFirstLetter } from "@/lib/utils";

interface Props<T extends { title: string; slug: string }> {
  items: T[];
  renderCard: (item: T) => React.ReactNode;
  scrollMargin?: string;
}

export function AlphaGroupedGrid<T extends { title: string; slug: string }>({
  items,
  renderCard,
  scrollMargin = "scroll-mt-52",
}: Props<T>) {
  const grouped = groupByFirstLetter(items);
  const letters = Array.from(grouped.keys()).sort((a, b) =>
    a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b)
  );

  if (items.length === 0) return null;

  return (
    <div className="space-y-12">
      {letters.map((letter) => (
        <section
          key={letter}
          id={`letter-${letter}`}
          className={scrollMargin}
        >
          <h2 className="font-display text-3xl font-light text-muted/40 mb-6">
            {letter}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {grouped.get(letter)!.map((item) => renderCard(item))}
          </div>
        </section>
      ))}
    </div>
  );
}
