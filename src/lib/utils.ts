export type SortBy = "asc" | "desc";

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

export function sortItems<T extends { title: string }>(
  items: T[],
  sortBy: SortBy
): T[] {
  if (sortBy === "asc") {
    return [...items].sort((a, b) => a.title.localeCompare(b.title));
  }
  return [...items].sort((a, b) => b.title.localeCompare(a.title));
}

export const MEAL_TYPE_OPTIONS = [
  "all",
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "drink",
] as const;

export type MealType = (typeof MEAL_TYPE_OPTIONS)[number];

export function filterByMealType<T extends { meal_type?: string[] }>(
  items: T[],
  mealType: string
): T[] {
  if (mealType === "all") return items;
  return items.filter((r) => r.meal_type?.includes(mealType));
}
