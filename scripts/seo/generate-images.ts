/**
 * Generate static 1200x630 SEO share images from existing wiki icons and recipe art.
 *
 * Usage:
 *   bun run scripts/seo/generate-images.ts
 *   bun run scripts/seo/generate-images.ts --only broccoli,classic-hummus
 *   bun run scripts/seo/generate-images.ts --section recipes
 *   bun run scripts/seo/generate-images.ts --dry-run
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname ?? __dirname, "..", "..");
const WIKI_DIR = path.join(ROOT, "content", "wiki", "en");
const RECIPES_DIR = path.join(ROOT, "content", "recipes", "en");
const ICON_DIR = path.join(ROOT, "public", "icons");
const RECIPE_IMAGE_DIR = path.join(ROOT, "public", "recipes");
const OUT_DIR = path.join(ROOT, "public", "seo");

const SIZE = { width: 1200, height: 630 };
const BG = "#F7EEDD";
const INK = "#2C2418";
const MUTED = "#6F6658";
const BORDER = "#D8CCB8";

interface Args {
  only?: string[];
  section: "all" | "ingredients" | "recipes";
  dryRun: boolean;
}

interface ShareCard {
  slug: string;
  title: string;
  kicker: string;
  detail: string;
  input: string;
  output: string;
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const args: Args = { section: "all", dryRun: false };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--only") args.only = parseList(argv[++i]);
    else if (arg === "--section") args.section = (argv[++i] ?? "all") as Args["section"];
    else if (arg === "--dry-run") args.dryRun = true;
  }

  return args;
}

function parseList(value = "") {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(text: string, maxChars: number, maxLines: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
      continue;
    }

    if (current) lines.push(current);
    current = word;
    if (lines.length === maxLines) break;
  }

  if (current && lines.length < maxLines) lines.push(current);
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    lines[maxLines - 1] = lines[maxLines - 1].replace(/[,. ]+$/, "") + "...";
  }

  return lines;
}

function slugToLabel(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function readMarkdownCards(
  dir: string,
  assetDir: string,
  outSubdir: string,
  fallbackKicker: string,
  detailFor: (data: Record<string, unknown>) => string,
) {
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((name): ShareCard | null => {
      const slug = name.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(dir, name), "utf-8");
      const { data } = matter(raw);
      const input = path.join(assetDir, `${slug}.webp`);
      if (!fs.existsSync(input)) return null;

      return {
        slug,
        title: String(data.title ?? slugToLabel(slug)),
        kicker: fallbackKicker,
        detail: detailFor(data),
        input,
        output: path.join(OUT_DIR, outSubdir, `${slug}.jpg`),
      };
    })
    .filter((card): card is ShareCard => card !== null)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

function ingredientCards() {
  return readMarkdownCards(
    WIKI_DIR,
    ICON_DIR,
    "ingredients",
    "Science-Backed Ingredient Guide",
    (data) => {
      const category = typeof data.category === "string" ? data.category : "ingredient";
      return `${slugToLabel(category)} | Longevity Wiki`;
    },
  );
}

function recipeCards() {
  return readMarkdownCards(
    RECIPES_DIR,
    RECIPE_IMAGE_DIR,
    "recipes",
    "Healthy Longevity Recipe",
    (data) => {
      const parts = [
        typeof data.difficulty === "string" ? slugToLabel(data.difficulty) : undefined,
        typeof data.prep_time === "string" ? `Prep ${data.prep_time}` : undefined,
        typeof data.cook_time === "string" ? `Cook ${data.cook_time}` : undefined,
      ].filter(Boolean);
      return parts.length ? `${parts.join(" | ")} | Longevity Wiki` : "Longevity Wiki";
    },
  );
}

function textSvg(card: ShareCard) {
  const titleLines = wrapText(card.title, 22, 4);
  const titleTspans = titleLines
    .map((line, i) => `<tspan x="82" y="${178 + i * 58}">${escapeXml(line)}</tspan>`)
    .join("");

  return Buffer.from(`
    <svg width="${SIZE.width}" height="${SIZE.height}" viewBox="0 0 ${SIZE.width} ${SIZE.height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="${BG}"/>
      <rect x="42" y="42" width="1116" height="546" rx="8" fill="none" stroke="${BORDER}" stroke-width="2"/>
      <text x="82" y="122" fill="${MUTED}" font-family="Instrument Sans, Arial, sans-serif" font-size="28" font-weight="700" letter-spacing="2">${escapeXml(card.kicker.toUpperCase())}</text>
      <text fill="${INK}" font-family="Fraunces, Georgia, serif" font-size="52" font-weight="400">${titleTspans}</text>
      <text x="82" y="518" fill="${MUTED}" font-family="Instrument Sans, Arial, sans-serif" font-size="28">${escapeXml(card.detail)}</text>
      <text x="82" y="554" fill="${MUTED}" font-family="Instrument Sans, Arial, sans-serif" font-size="22">longevity.mbdev.to</text>
      <rect x="742" y="82" width="376" height="376" rx="8" fill="${BG}" stroke="${BORDER}" stroke-width="2"/>
    </svg>
  `);
}

async function renderCard(card: ShareCard) {
  fs.mkdirSync(path.dirname(card.output), { recursive: true });

  const artwork = await sharp(card.input)
    .resize(352, 352, { fit: "contain", background: BG })
    .jpeg({ quality: 92 })
    .toBuffer();

  await sharp(textSvg(card))
    .composite([{ input: artwork, left: 754, top: 94 }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(card.output);
}

async function main() {
  const args = parseArgs();
  const cards = [
    ...(args.section === "all" || args.section === "ingredients" ? ingredientCards() : []),
    ...(args.section === "all" || args.section === "recipes" ? recipeCards() : []),
  ].filter((card) => !args.only || args.only.includes(card.slug));

  console.log(`Targets: ${cards.length}`);
  console.log(`Dry run: ${args.dryRun}`);

  if (args.dryRun) {
    for (const card of cards) console.log(`would generate: ${card.output}`);
    return;
  }

  for (const [i, card] of cards.entries()) {
    process.stdout.write(`[${i + 1}/${cards.length}] ${card.slug} ... `);
    await renderCard(card);
    const size = fs.statSync(card.output).size;
    console.log(`${(size / 1024).toFixed(1)}KB`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
