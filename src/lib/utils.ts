export type SortBy = "default" | "alpha" | "score";

function normalizeFirstChar(title: string): string {
  const first = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")[0]
    ?.toUpperCase();
  if (!first || !/[A-Z]/.test(first)) return "#";
  return first;
}

export function groupByFirstLetter<T extends { title: string }>(
  items: T[]
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = normalizeFirstChar(item.title);
    const bucket = map.get(key) ?? [];
    bucket.push(item);
    map.set(key, bucket);
  }
  return map;
}

export function sortItems<T extends { title: string; longevity_score?: number }>(
  items: T[],
  sortBy: SortBy
): T[] {
  if (sortBy === "alpha") {
    return [...items].sort((a, b) => a.title.localeCompare(b.title));
  }
  if (sortBy === "score") {
    return [...items].sort(
      (a, b) => (b.longevity_score ?? 0) - (a.longevity_score ?? 0)
    );
  }
  return items;
}
