"use client";

import { useRef } from "react";
import { groupByFirstLetter } from "@/lib/utils";

interface Props<T extends { title: string; slug: string }> {
  items: T[];
  renderCard: (item: T) => React.ReactNode;
}

export function AlphaGroupedGrid<T extends { title: string; slug: string }>({
  items,
  renderCard,
}: Props<T>) {
  const grouped = groupByFirstLetter(items);
  const letters = Array.from(grouped.keys()).sort((a, b) =>
    a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b)
  );
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const scrollTo = (letter: string) => {
    sectionRefs.current[letter]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (items.length === 0) return null;

  return (
    <div>
      {/* Jump nav */}
      <div className="flex flex-wrap gap-1 mb-10">
        {letters.map((letter) => (
          <button
            key={letter}
            onClick={() => scrollTo(letter)}
            className="text-xs font-semibold w-7 h-7 flex items-center justify-center rounded border border-border text-muted hover:border-accent hover:text-accent transition-colors"
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Groups */}
      <div className="space-y-12">
        {letters.map((letter) => (
          <section
            key={letter}
            ref={(el) => { sectionRefs.current[letter] = el; }}
            id={`letter-${letter}`}
          >
            <h2 className="font-display text-3xl font-light text-muted/40 mb-6 scroll-mt-20">
              {letter}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {grouped.get(letter)!.map((item) => renderCard(item))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
