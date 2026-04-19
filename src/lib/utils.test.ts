import { describe, it, expect } from "vitest";
import {
  groupByFirstLetter,
  sortItems,
  filterByMealType,
  MEAL_TYPE_OPTIONS,
} from "./utils";
import enMessages from "../../messages/en.json";
import esMessages from "../../messages/es.json";

const items = (titles: string[]) => titles.map((t) => ({ title: t }));

describe("groupByFirstLetter", () => {
  it("groups items by first letter", () => {
    const grouped = groupByFirstLetter(items(["Apple", "Avocado", "Broccoli"]));
    expect(grouped.get("A")?.map((i) => i.title)).toEqual(["Apple", "Avocado"]);
    expect(grouped.get("B")?.map((i) => i.title)).toEqual(["Broccoli"]);
  });

  it("returns empty Map for empty array", () => {
    expect(groupByFirstLetter([]).size).toBe(0);
  });

  it("puts number-starting titles under #", () => {
    const grouped = groupByFirstLetter(items(["3-Seed Mix", "Apple"]));
    expect(grouped.get("#")?.map((i) => i.title)).toEqual(["3-Seed Mix"]);
  });

  it("normalizes accented letters (Ñ → N)", () => {
    const grouped = groupByFirstLetter(items(["Ñame", "Nuez"]));
    expect(grouped.get("N")?.length).toBe(2);
  });
});

describe("sortItems", () => {
  it("asc sort produces A→Z order", () => {
    const sorted = sortItems(items(["Zucchini", "Apple", "Miso"]), "asc");
    expect(sorted.map((i) => i.title)).toEqual(["Apple", "Miso", "Zucchini"]);
  });

  it("desc sort produces Z→A order", () => {
    const sorted = sortItems(items(["Apple", "Miso", "Zucchini"]), "desc");
    expect(sorted.map((i) => i.title)).toEqual(["Zucchini", "Miso", "Apple"]);
  });

  it("does not mutate the original array", () => {
    const original = items(["Zucchini", "Apple"]);
    sortItems(original, "asc");
    expect(original[0].title).toBe("Zucchini");
  });
});

describe("filterByMealType", () => {
  const recipes = [
    { title: "Oatmeal", meal_type: ["breakfast"] },
    { title: "Smoothie", meal_type: ["breakfast", "drink"] },
    { title: "Chickpea Stew", meal_type: ["lunch", "dinner"] },
    { title: "Legacy Recipe" },
  ];

  it("returns all items when mealType is 'all'", () => {
    expect(filterByMealType(recipes, "all")).toHaveLength(4);
  });

  it("filters to single-meal match", () => {
    const lunch = filterByMealType(recipes, "lunch");
    expect(lunch.map((r) => r.title)).toEqual(["Chickpea Stew"]);
  });

  it("multi-meal recipe appears under every applicable filter", () => {
    const breakfast = filterByMealType(recipes, "breakfast");
    const drink = filterByMealType(recipes, "drink");
    expect(breakfast.map((r) => r.title)).toEqual(["Oatmeal", "Smoothie"]);
    expect(drink.map((r) => r.title)).toEqual(["Smoothie"]);
  });

  it("skips items without meal_type for non-all filters", () => {
    const dinner = filterByMealType(recipes, "dinner");
    expect(dinner.map((r) => r.title)).toEqual(["Chickpea Stew"]);
  });

  it("returns empty array for empty input", () => {
    expect(filterByMealType([], "breakfast")).toEqual([]);
    expect(filterByMealType([], "all")).toEqual([]);
  });

  it("returns empty array for unknown meal type", () => {
    expect(filterByMealType(recipes, "brunch")).toEqual([]);
  });

  it("treats an empty meal_type array as non-matching for specific filters", () => {
    const empty = [{ title: "Mystery", meal_type: [] as string[] }];
    expect(filterByMealType(empty, "lunch")).toEqual([]);
    expect(filterByMealType(empty, "all")).toHaveLength(1);
  });
});

describe("meal_type i18n keys", () => {
  const mealTypeKeys = MEAL_TYPE_OPTIONS;

  it.each(["en", "es"] as const)("%s locale exports all meal_type keys", (locale) => {
    const messages = locale === "en" ? enMessages : esMessages;
    for (const key of mealTypeKeys) {
      expect(messages.recipes.meal_type).toHaveProperty(key);
      expect(typeof messages.recipes.meal_type[key]).toBe("string");
      expect(messages.recipes.meal_type[key].length).toBeGreaterThan(0);
    }
  });
});
