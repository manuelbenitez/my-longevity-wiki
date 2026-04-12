import fs from "fs";
import path from "path";
import matter from "gray-matter";

const DATA_DIR = path.join(process.cwd(), "data");
const CONTENT_DIR = path.join(process.cwd(), "content");

export interface Ingredient {
  name: string;
  slug: string;
  category: string;
  claims: { claim: string; mechanism: string; confidence: string }[];
  consumption?: { amount?: string; frequency?: string; preparation?: string };
  relationships: {
    target_ingredient: string;
    type: string;
    description: string;
  }[];
  source_chapters: number[];
  [key: string]: unknown;
}

export interface EnrichedIngredient {
  name: string;
  slug: string;
  category: string;
  book_claims: { claim: string; mechanism: string; confidence: string }[];
  supplementary_research: {
    source: string;
    url?: string;
    finding: string;
    agrees_with_book?: boolean;
  }[];
  flavor_profile?: {
    taste?: string[];
    aroma?: string[];
    texture?: string[];
    culinary_category?: string;
  };
  culinary_pairings: {
    ingredient: string;
    tradition?: string;
    source?: string;
  }[];
  nutrient_highlights: {
    compound: string;
    amount_per_100g?: string;
    bioavailability_notes?: string;
  }[];
  synergies: {
    target_ingredient: string;
    type: string;
    description: string;
  }[];
  research_status: string;
  [key: string]: unknown;
}

export interface WikiEntry {
  slug: string;
  frontmatter: {
    title: string;
    slug: string;
    category: string;
    tags: string[];
    longevity_score: number;
    last_updated: string;
    type?: string;
  };
  content: string;
}

export interface Recipe {
  slug: string;
  frontmatter: {
    title: string;
    slug: string;
    servings: number;
    prep_time: string;
    cook_time: string;
    difficulty: string;
    longevity_ingredients: string[];
    tags: string[];
  };
  content: string;
}

export function getMasterIngredients(): Ingredient[] {
  const filePath = path.join(DATA_DIR, "book-extracts", "ingredients-master.json");
  if (!fs.existsSync(filePath)) return [];
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return data.ingredients || [];
}

export function getEnrichedIngredient(slug: string): EnrichedIngredient | null {
  const filePath = path.join(DATA_DIR, "ingredients", `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function getAllEnrichedSlugs(): string[] {
  const dir = path.join(DATA_DIR, "ingredients");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));
}

export function getWikiEntry(slug: string, locale: string = "en"): WikiEntry | null {
  let filePath = path.join(CONTENT_DIR, "wiki", locale, `${slug}.md`);
  if (!fs.existsSync(filePath)) filePath = path.join(CONTENT_DIR, "wiki", "en", `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    slug,
    frontmatter: data as WikiEntry["frontmatter"],
    content,
  };
}

export function getAllWikiSlugs(): string[] {
  const dir = path.join(CONTENT_DIR, "wiki", "en");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(".md", ""));
}

export function getRecipe(slug: string, locale: string = "en"): Recipe | null {
  let filePath = path.join(CONTENT_DIR, "recipes", locale, `${slug}.md`);
  if (!fs.existsSync(filePath)) filePath = path.join(CONTENT_DIR, "recipes", "en", `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    slug,
    frontmatter: data as Recipe["frontmatter"],
    content,
  };
}

export function getAllRecipeSlugs(): string[] {
  const dir = path.join(CONTENT_DIR, "recipes", "en");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(".md", ""));
}

export function getAllRecipes(locale: string = "en"): Recipe[] {
  return getAllRecipeSlugs()
    .map((slug) => getRecipe(slug, locale))
    .filter((r): r is Recipe => r !== null);
}

export function getAllWikiEntries(locale: string = "en"): WikiEntry[] {
  return getAllWikiSlugs()
    .map((slug) => getWikiEntry(slug, locale))
    .filter((e): e is WikiEntry => e !== null);
}

export function getIndividualIngredients(locale: string = "en"): WikiEntry[] {
  return getAllWikiEntries(locale).filter(
    (e) => e.frontmatter.type !== "overview"
  );
}
