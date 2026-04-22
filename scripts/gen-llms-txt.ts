import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname ?? __dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content");
const OUT_FILE = path.join(ROOT, "public", "llms.txt");
const SITE_URL = "https://longevity.mbdev.to";

function countMd(dir: string): number {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter((f) => f.endsWith(".md")).length;
}

const enIngredients = countMd(path.join(CONTENT_DIR, "wiki", "en"));
const esIngredients = countMd(path.join(CONTENT_DIR, "wiki", "es"));
const enRecipes = countMd(path.join(CONTENT_DIR, "recipes", "en"));
const esRecipes = countMd(path.join(CONTENT_DIR, "recipes", "es"));

const today = new Date().toISOString().slice(0, 10);

const body = `# LLMs.txt — machine-readable site index
# Version: 1.1
# Regenerated automatically by scripts/gen-llms-txt.ts on every build

## Site
Longevity Wiki
${SITE_URL}

## About
This site is a free, bilingual (English + Spanish) encyclopedia of foods,
ingredients, and recipes studied for their effect on healthy aging and
longevity. Content is grounded in peer-reviewed research (primarily Valter
Longo's "The Longevity Diet" and Luigi Fontana's "The Path to Longevity")
and structured for both human readers and AI agents.

## Author
Manuel Benitez — independent software engineer
${SITE_URL}/en/about/

## Key pages
- ${SITE_URL}/en/ingredients: index of ${enIngredients} longevity ingredients with research summaries
- ${SITE_URL}/en/recipes: ${enRecipes} science-backed recipes using longevity ingredients
- ${SITE_URL}/en/meal-planner: interactive tool to build weekly meal plans from the recipe database
- ${SITE_URL}/en/sources: research sources and extraction methodology
- ${SITE_URL}/en/about: authorship and content provenance

## Content counts
English: ${enIngredients} ingredients, ${enRecipes} recipes
Spanish: ${esIngredients} ingredients, ${esRecipes} recipes

## Content types
- Ingredient pages: one page per ingredient with longevity claims, mechanisms, confidence levels, and culinary pairings
- Recipe pages: structured recipes using longevity ingredients, with meal-type and ingredient tagging
- Source pages: book citations with chapters parsed and claim counts
- Meal planner: client-side tool, not a content page

## Structured data
All ingredient pages: schema.org/Article with Person author linked to /about/
All recipe pages: schema.org/Recipe with Person author linked to /about/
Meal planner: schema.org/WebApplication (HealthApplication category)
About page: schema.org/Person
Every page: hreflang en + es + x-default

## Crawling
GPTBot: allowed
ClaudeBot: allowed
PerplexityBot: allowed
OAI-SearchBot: allowed

## Languages
English (en) — primary
Spanish (es) — partial translation (${esIngredients}/${enIngredients} ingredients, ${esRecipes}/${enRecipes} recipes)

## Last updated
${today}
`;

fs.writeFileSync(OUT_FILE, body);
console.log(
  `gen-llms-txt: wrote ${OUT_FILE} (${enIngredients} en ingredients, ${enRecipes} en recipes, ${esIngredients} es ingredients, ${esRecipes} es recipes)`
);
