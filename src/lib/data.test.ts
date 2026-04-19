import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getAllRecipes } from "./data";
import { MEAL_TYPE_OPTIONS } from "./utils";

describe("getAllRecipes", () => {
  it("loads English recipes with meal_type frontmatter plumbed through", () => {
    const recipes = getAllRecipes("en");
    expect(recipes.length).toBeGreaterThan(0);
    // At least one recipe on the branch must expose meal_type as an array
    const withMealType = recipes.filter(
      (r) => Array.isArray(r.frontmatter.meal_type) && r.frontmatter.meal_type.length > 0
    );
    expect(withMealType.length).toBeGreaterThan(0);
  });

  it("returns empty array for a non-existent locale dir", () => {
    expect(getAllRecipes("zz-nonexistent")).toEqual([]);
  });

  it("loads Spanish recipes when a Spanish dir exists", () => {
    const esDir = path.join(process.cwd(), "content", "recipes", "es");
    if (!fs.existsSync(esDir)) return;
    const recipes = getAllRecipes("es");
    expect(recipes.length).toBeGreaterThan(0);
  });
});

describe("recipe frontmatter meal_type integrity", () => {
  const allowedValues = new Set(
    MEAL_TYPE_OPTIONS.filter((m) => m !== "all")
  );

  const recipeDir = path.join(process.cwd(), "content", "recipes", "en");
  const files = fs.existsSync(recipeDir)
    ? fs.readdirSync(recipeDir).filter((f) => f.endsWith(".md"))
    : [];

  it("has at least one recipe file checked-in on the English branch", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)("%s has a non-empty meal_type array with only allowed values", (file) => {
    const raw = fs.readFileSync(path.join(recipeDir, file), "utf-8");
    const { data } = matter(raw);
    expect(Array.isArray(data.meal_type)).toBe(true);
    expect((data.meal_type as string[]).length).toBeGreaterThan(0);
    for (const value of data.meal_type as string[]) {
      expect((allowedValues as Set<string>).has(value)).toBe(true);
    }
  });
});
