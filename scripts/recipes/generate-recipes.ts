/**
 * Generate recipe images via OpenAI's gpt-image-1.
 *
 * Reads recipe frontmatter from content/recipes/en/, calls the OpenAI Image API
 * with the locked recipe prompt template, normalizes the raw PNG background to
 * srgb(247,238,221), resizes to 700x700, and writes WEBP files to
 * public/recipes/{slug}.webp.
 *
 * Usage:
 *   bun run scripts/recipes/generate-recipes.ts
 *   bun run scripts/recipes/generate-recipes.ts --limit 5
 *   bun run scripts/recipes/generate-recipes.ts --only broccoli-garlic-lemon-orecchiette
 *   bun run scripts/recipes/generate-recipes.ts --regen broccoli-garlic-lemon-orecchiette
 *   bun run scripts/recipes/generate-recipes.ts --quality high
 *   bun run scripts/recipes/generate-recipes.ts --from-raw --only ajvar
 *   bun run scripts/recipes/generate-recipes.ts --dry-run
 *
 * Requires OPENAI_API_KEY in .env.local, env.local, or local.env.
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import OpenAI from "openai";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname ?? __dirname, "..", "..");
const RECIPES_DIR = path.join(ROOT, "content", "recipes", "en");
const OUT_DIR = path.join(ROOT, "public", "recipes");
const RAW_DIR = path.join(ROOT, "scripts", "recipes", "raw");
const PROMPT_PATH = path.join(ROOT, "scripts", "recipes", "PROMPT.md");
const TARGET = { r: 247, g: 238, b: 221 };

type Quality = "low" | "medium" | "high" | "auto";

interface Args {
  limit?: number;
  regen?: string[];
  only?: string[];
  quality: Quality;
  dryRun: boolean;
  fromRaw: boolean;
}

interface RecipeMeta {
  slug: string;
  title: string;
  ingredients: string[];
  mealType: string[];
  tags: string[];
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const args: Args = { quality: "medium", dryRun: false, fromRaw: false };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--limit") args.limit = parseInt(argv[++i] ?? "0", 10);
    else if (arg === "--regen") args.regen = parseSlugList(argv[++i]);
    else if (arg === "--only") args.only = parseSlugList(argv[++i]);
    else if (arg === "--quality") args.quality = (argv[++i] ?? "medium") as Quality;
    else if (arg === "--from-raw") args.fromRaw = true;
    else if (arg === "--dry-run") args.dryRun = true;
  }

  return args;
}

function parseSlugList(value = ""): string[] {
  return value
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") return [value];
  return [];
}

function loadEnvFiles() {
  for (const name of [".env.local", "env.local", "local.env"]) {
    const filePath = path.join(ROOT, name);
    if (!fs.existsSync(filePath)) continue;

    for (const line of fs.readFileSync(filePath, "utf-8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(trimmed);
      if (!match) continue;

      const [, key, rawValue] = match;
      if (process.env[key]) continue;

      process.env[key] = rawValue.replace(/^(['"])(.*)\1$/, "$2");
    }
  }
}

function readRecipe(slug: string): RecipeMeta {
  const filePath = path.join(RECIPES_DIR, `${slug}.md`);
  const parsed = matter(fs.readFileSync(filePath, "utf-8"));
  const data = parsed.data;

  return {
    slug,
    title: String(data.title ?? slug.replace(/-/g, " ")),
    ingredients: asStringArray(data.longevity_ingredients).map((s) => s.replace(/-/g, " ")),
    mealType: asStringArray(data.meal_type),
    tags: asStringArray(data.tags),
  };
}

function listRecipeSlugs(): string[] {
  return fs
    .readdirSync(RECIPES_DIR)
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.replace(/\.md$/, ""))
    .sort();
}

function buildPrompt(template: string, recipe: RecipeMeta): string {
  return template
    .replace(/\{RECIPE_TITLE\}/g, recipe.title)
    .replace(/\{SLUG\}/g, recipe.slug)
    .replace(/\{INGREDIENTS\}/g, recipe.ingredients.join(", ") || "not specified")
    .replace(/\{MEAL_TYPE\}/g, recipe.mealType.join(", ") || "not specified")
    .replace(/\{TAGS\}/g, recipe.tags.join(", ") || "not specified");
}

async function cornerRgb(image: Buffer | string): Promise<[number, number, number]> {
  const { data } = await sharp(image)
    .extract({ left: 0, top: 0, width: 4, height: 4 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  return [data[0] ?? 0, data[1] ?? 0, data[2] ?? 0];
}

async function normalizeAndSave(pngBuffer: Buffer, outAbs: string) {
  const resizedPng = await sharp(pngBuffer)
    .resize(700, 700, { fit: "cover" })
    .png()
    .toBuffer();
  const [actualR, actualG, actualB] = await cornerRgb(resizedPng);
  let webpBuffer: Buffer | undefined;
  let final: readonly [number, number, number] = [actualR, actualG, actualB];
  let delta: [number, number, number] = [0, 0, 0];

  for (const webpOptions of [{ quality: 85 }, { quality: 95 }]) {
    delta = [0, 0, 0];
    for (let i = 0; i < 8; i++) {
      webpBuffer = await sharp(resizedPng)
        .linear([1, 1, 1], delta)
        .webp(webpOptions)
        .toBuffer();
      final = await cornerRgb(webpBuffer);

      if (
        Math.abs(TARGET.r - final[0]) <= 1 &&
        Math.abs(TARGET.g - final[1]) <= 1 &&
        Math.abs(TARGET.b - final[2]) <= 1
      ) {
        fs.writeFileSync(outAbs, webpBuffer);
        return {
          bytes: webpBuffer.length,
          actual: [actualR, actualG, actualB] as const,
          delta,
          final: [final[0], final[1], final[2]] as const,
        };
      }

      delta[0] += TARGET.r - final[0];
      delta[1] += TARGET.g - final[1];
      delta[2] += TARGET.b - final[2];
    }
  }

  if (!webpBuffer) {
    webpBuffer = await sharp(resizedPng)
      .linear([1, 1, 1], delta)
      .webp({ quality: 85 })
      .toBuffer();
    final = await cornerRgb(webpBuffer);
  }
  fs.writeFileSync(outAbs, webpBuffer);

  const [finalR, finalG, finalB] = final;

  return {
    bytes: webpBuffer.length,
    actual: [actualR, actualG, actualB] as const,
    delta: delta as [number, number, number],
    final: [finalR, finalG, finalB] as const,
  };
}

async function generateOne(client: OpenAI, recipe: RecipeMeta, promptTemplate: string, quality: Quality) {
  const response = await client.images.generate({
    model: "gpt-image-1",
    prompt: buildPrompt(promptTemplate, recipe),
    size: "1024x1024",
    quality,
    background: "opaque",
    n: 1,
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) throw new Error(`OpenAI returned no image data for slug=${recipe.slug}`);

  const pngBuffer = Buffer.from(b64, "base64");
  const rawPath = path.join(RAW_DIR, `${recipe.slug}.png`);
  fs.writeFileSync(rawPath, pngBuffer);

  const outAbs = path.join(OUT_DIR, `${recipe.slug}.webp`);
  const normalized = await normalizeAndSave(pngBuffer, outAbs);

  return { rawPath, outAbs, ...normalized };
}

async function exportFromRaw(slug: string) {
  const rawPath = path.join(RAW_DIR, `${slug}.png`);
  if (!fs.existsSync(rawPath)) throw new Error(`Missing raw PNG for slug=${slug}`);

  const outAbs = path.join(OUT_DIR, `${slug}.webp`);
  const pngBuffer = fs.readFileSync(rawPath);
  const normalized = await normalizeAndSave(pngBuffer, outAbs);

  return { rawPath, outAbs, ...normalized };
}

async function main() {
  loadEnvFiles();

  const args = parseArgs();
  const promptTemplate = fs.readFileSync(PROMPT_PATH, "utf-8");

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(RAW_DIR, { recursive: true });

  const allSlugs = listRecipeSlugs();
  let targets: string[];

  if (args.regen && args.regen.length > 0) {
    targets = args.regen.filter((slug) => allSlugs.includes(slug));
    const missing = args.regen.filter((slug) => !allSlugs.includes(slug));
    if (missing.length) console.warn(`Skipping unknown slugs: ${missing.join(", ")}`);
  } else if (args.only && args.only.length > 0) {
    targets = args.only.filter((slug) => allSlugs.includes(slug));
    const missing = args.only.filter((slug) => !allSlugs.includes(slug));
    if (missing.length) console.warn(`Skipping unknown slugs: ${missing.join(", ")}`);
  } else {
    targets = allSlugs.filter((slug) => !fs.existsSync(path.join(OUT_DIR, `${slug}.webp`)));
  }

  if (args.limit) targets = targets.slice(0, args.limit);

  console.log(`Recipes total in en:       ${allSlugs.length}`);
  console.log(`Existing .webp recipes:    ${allSlugs.filter((slug) => fs.existsSync(path.join(OUT_DIR, `${slug}.webp`))).length}`);
  console.log(`Targets this run:          ${targets.length}`);
  console.log(`Quality:                   ${args.quality}`);
  console.log(`From raw:                  ${args.fromRaw}`);
  console.log(`Dry run:                   ${args.dryRun}`);
  console.log(`Target bg:                 rgb(${TARGET.r},${TARGET.g},${TARGET.b})`);
  console.log("");

  if (args.dryRun) {
    for (const slug of targets) console.log(`would generate: ${slug}`);
    return;
  }

  if (targets.length === 0) {
    console.log("Nothing to do.");
    return;
  }

  if (!args.fromRaw && !process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY not set. Add it to .env.local, env.local, or local.env and re-run.");
    process.exit(1);
  }

  const client = new OpenAI();
  let totalBytes = 0;
  let success = 0;
  const failed: { slug: string; err: string }[] = [];

  for (const [i, slug] of targets.entries()) {
    const idx = `[${i + 1}/${targets.length}]`;
    process.stdout.write(`${idx} ${slug} ... `);

    try {
      const result = args.fromRaw
        ? await exportFromRaw(slug)
        : await generateOne(client, readRecipe(slug), promptTemplate, args.quality);
      totalBytes += result.bytes;
      success += 1;
      console.log(
        `${(result.bytes / 1024).toFixed(1)}KB raw=${result.actual.join(",")} delta=${result.delta.join(",")} final=${result.final.join(",")}`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      failed.push({ slug, err: msg });
      console.log(`FAIL: ${msg}`);
    }
  }

  console.log("");
  console.log(`Done. ${success} succeeded, ${failed.length} failed.`);
  console.log(`Total WEBP bytes added: ${(totalBytes / 1024).toFixed(0)}KB`);

  if (failed.length) {
    console.log("");
    console.log("Failed slugs (re-run with --regen):");
    for (const failure of failed) console.log(`  ${failure.slug} :: ${failure.err}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
