/**
 * Export large ingredient detail images from existing raw OpenAI PNGs.
 *
 * This does not call the OpenAI API. It reads scripts/icons/raw/{slug}.png and
 * writes public/icons/{slug}-lg.webp at 700x700 to match recipe artwork.
 *
 * Usage:
 *   bun run scripts/icons/export-large.ts
 *   bun run scripts/icons/export-large.ts --only almond-milk,broccoli
 *   bun run scripts/icons/export-large.ts --dry-run
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname ?? __dirname, "..", "..");
const WIKI_DIR = path.join(ROOT, "content", "wiki", "en");
const RAW_DIR = path.join(ROOT, "scripts", "icons", "raw");
const ICON_DIR = path.join(ROOT, "public", "icons");

const SIZE = 700;
const BG = { r: 245, g: 240, b: 235 };

interface Args {
  only?: string[];
  dryRun: boolean;
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const args: Args = { dryRun: false };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--only") args.only = parseList(argv[++i]);
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

function listWikiSlugs() {
  return fs
    .readdirSync(WIKI_DIR)
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.replace(/\.md$/, ""))
    .sort();
}

async function exportOne(slug: string) {
  const rawPath = path.join(RAW_DIR, `${slug}.png`);
  const outPath = path.join(ICON_DIR, `${slug}-lg.webp`);

  if (!fs.existsSync(rawPath)) {
    throw new Error(`Missing raw PNG: ${rawPath}`);
  }

  const info = await sharp(rawPath)
    .flatten({ background: BG })
    .resize(SIZE, SIZE, { fit: "cover", background: BG })
    .webp({ quality: 85 })
    .toFile(outPath);

  return { outPath, bytes: info.size };
}

async function main() {
  const args = parseArgs();
  const allSlugs = listWikiSlugs();
  const targets = args.only?.length
    ? args.only.filter((slug) => allSlugs.includes(slug))
    : allSlugs;
  const unknown = args.only?.filter((slug) => !allSlugs.includes(slug)) ?? [];

  fs.mkdirSync(ICON_DIR, { recursive: true });

  console.log(`Wiki slugs:       ${allSlugs.length}`);
  console.log(`Targets:          ${targets.length}`);
  console.log(`Output size:      ${SIZE}x${SIZE}`);
  console.log(`Dry run:          ${args.dryRun}`);
  if (unknown.length) console.warn(`Unknown slugs:     ${unknown.join(", ")}`);
  console.log("");

  if (args.dryRun) {
    for (const slug of targets) console.log(`would export: ${slug}`);
    return;
  }

  let totalBytes = 0;
  let success = 0;
  const failed: { slug: string; error: string }[] = [];

  for (const [index, slug] of targets.entries()) {
    process.stdout.write(`[${index + 1}/${targets.length}] ${slug} ... `);

    try {
      const result = await exportOne(slug);
      totalBytes += result.bytes;
      success += 1;
      console.log(`${(result.bytes / 1024).toFixed(1)}KB`);
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      failed.push({ slug, error });
      console.log(`FAIL: ${error}`);
    }
  }

  console.log("");
  console.log(`Done. ${success} exported, ${failed.length} failed.`);
  console.log(`Total bytes: ${(totalBytes / 1024 / 1024).toFixed(1)}MB`);

  if (failed.length) {
    console.log("");
    console.log("Failed slugs:");
    for (const item of failed) console.log(`  ${item.slug}: ${item.error}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
