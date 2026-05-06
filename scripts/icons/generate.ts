/**
 * Generate ingredient icons via OpenAI's gpt-image-1.
 *
 * Reads each wiki entry slug from content/wiki/en/, calls the OpenAI Image API
 * with the locked prompt template, resizes the PNG output to 192x192, and
 * writes an opaque WEBP to public/icons/{slug}.webp.
 *
 * Usage:
 *   bun run scripts/icons/generate.ts                    # generate all missing
 *   bun run scripts/icons/generate.ts --limit 5          # generate first 5 missing (sanity check)
 *   bun run scripts/icons/generate.ts --regen kale       # force regenerate one slug
 *   bun run scripts/icons/generate.ts --only kale,broccoli  # generate only these slugs
 *   bun run scripts/icons/generate.ts --quality high     # override quality (default: medium)
 *   bun run scripts/icons/generate.ts --dry-run          # show what would run, no API calls
 *
 * Requires OPENAI_API_KEY in .env.local.
 */

import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname ?? __dirname, "..", "..");
const WIKI_DIR = path.join(ROOT, "content", "wiki", "en");
const ICON_DIR = path.join(ROOT, "public", "icons");
const RAW_DIR = path.join(ROOT, "scripts", "icons", "raw");
const PROMPT_PATH = path.join(ROOT, "scripts", "icons", "PROMPT.md");

type Quality = "low" | "medium" | "high" | "auto";

interface Args {
  limit?: number;
  regen?: string[];
  only?: string[];
  quality: Quality;
  dryRun: boolean;
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const args: Args = { quality: "medium", dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--limit") args.limit = parseInt(argv[++i] ?? "0", 10);
    else if (a === "--regen") args.regen = (argv[++i] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--only") args.only = (argv[++i] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--quality") args.quality = (argv[++i] ?? "medium") as Quality;
    else if (a === "--dry-run") args.dryRun = true;
  }
  return args;
}

function slugToDisplayName(slug: string): string {
  return slug.replace(/-/g, " ");
}

function listWikiSlugs(): string[] {
  return fs
    .readdirSync(WIKI_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""))
    .sort();
}

async function generateOne(
  client: OpenAI,
  slug: string,
  promptTemplate: string,
  quality: Quality,
): Promise<{ webpBytes: number; rawPath: string }> {
  const ingredient = slugToDisplayName(slug);
  const prompt = promptTemplate.replace(/\{INGREDIENT_NAME\}/g, ingredient);

  const response = await client.images.generate({
    model: "gpt-image-1",
    prompt,
    size: "1024x1024",
    quality,
    n: 1,
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) throw new Error(`OpenAI returned no image data for slug=${slug}`);

  const pngBuffer = Buffer.from(b64, "base64");
  const rawPath = path.join(RAW_DIR, `${slug}.png`);
  fs.writeFileSync(rawPath, pngBuffer);

  const webpPath = path.join(ICON_DIR, `${slug}.webp`);
  const webpInfo = await sharp(pngBuffer)
    .resize(192, 192, { fit: "cover", background: { r: 245, g: 240, b: 235 } })
    .webp({ quality: 80 })
    .toFile(webpPath);

  return { webpBytes: webpInfo.size, rawPath };
}

async function main() {
  const args = parseArgs();

  if (!fs.existsSync(PROMPT_PATH)) {
    console.error(`Missing prompt template at ${PROMPT_PATH}`);
    process.exit(1);
  }
  const promptTemplate = fs.readFileSync(PROMPT_PATH, "utf-8");

  fs.mkdirSync(ICON_DIR, { recursive: true });
  fs.mkdirSync(RAW_DIR, { recursive: true });

  const allSlugs = listWikiSlugs();
  let targets: string[];

  if (args.regen && args.regen.length > 0) {
    targets = args.regen.filter((s) => allSlugs.includes(s));
    const missing = args.regen.filter((s) => !allSlugs.includes(s));
    if (missing.length) console.warn(`Skipping unknown slugs: ${missing.join(", ")}`);
  } else if (args.only && args.only.length > 0) {
    targets = args.only.filter((s) => allSlugs.includes(s));
  } else {
    targets = allSlugs.filter((s) => !fs.existsSync(path.join(ICON_DIR, `${s}.webp`)));
  }

  if (args.limit) targets = targets.slice(0, args.limit);

  console.log(`Slugs total in wiki:       ${allSlugs.length}`);
  console.log(`Existing .webp icons:      ${allSlugs.filter((s) => fs.existsSync(path.join(ICON_DIR, `${s}.webp`))).length}`);
  console.log(`Targets this run:          ${targets.length}`);
  console.log(`Quality:                   ${args.quality}`);
  console.log(`Dry run:                   ${args.dryRun}`);
  console.log("");

  if (args.dryRun) {
    for (const slug of targets) console.log(`would generate: ${slug}`);
    return;
  }

  if (targets.length === 0) {
    console.log("Nothing to do.");
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY not set. Add it to .env.local and re-run.");
    process.exit(1);
  }

  const client = new OpenAI();

  let totalBytes = 0;
  let success = 0;
  let failed: { slug: string; err: string }[] = [];

  for (const [i, slug] of targets.entries()) {
    const idx = `[${i + 1}/${targets.length}]`;
    process.stdout.write(`${idx} ${slug} ... `);
    try {
      const { webpBytes } = await generateOne(client, slug, promptTemplate, args.quality);
      totalBytes += webpBytes;
      success += 1;
      console.log(`${(webpBytes / 1024).toFixed(1)}KB`);
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
    for (const f of failed) console.log(`  ${f.slug} :: ${f.err}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
