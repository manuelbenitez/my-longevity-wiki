/**
 * Generate the Longevity Wiki hand-written wordmark via OpenAI's gpt-image-1.
 *
 * Usage:
 *   bun run scripts/brand/generate-wordmark.ts
 *
 * Requires OPENAI_API_KEY in .env.local, env.local, or local.env.
 */

import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname ?? __dirname, "..", "..");
const RAW_DIR = path.join(ROOT, "scripts", "brand", "raw");
const OUT_DIR = path.join(ROOT, "public", "brand");
const RAW_PATH = path.join(RAW_DIR, "longevity-wiki-wordmark.png");
const OUT_PATH = path.join(OUT_DIR, "longevity-wiki-wordmark.webp");
const BG = { r: 245, g: 240, b: 235 };

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

async function main() {
  loadEnvFiles();

  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY not set. Add it to .env.local, env.local, or local.env and re-run.");
    process.exit(1);
  }

  fs.mkdirSync(RAW_DIR, { recursive: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const client = new OpenAI();
  const prompt = [
    "Create a clean hand-written wordmark that says exactly: Longevity Wiki",
    "The spelling must be exact: capital L in Longevity, capital W in Wiki, one space, no other words.",
    "Style: thin dark brown ink stroke, elegant human handwriting, slightly imperfect, calm editorial botanical field-guide feeling.",
    "Use a single continuous hand-lettered baseline, not a font, not calligraphy with thick downstrokes.",
    "Ink color #2C2418 on a perfectly flat bone-white background #F5F0EB.",
    "No icon, no leaf, no border, no underline, no shadow, no texture, no paper grain, no watermark.",
    "Wide horizontal composition with generous padding.",
  ].join("\n");

  const response = await client.images.generate({
    model: "gpt-image-1",
    prompt,
    size: "1536x1024",
    quality: "high",
    background: "opaque",
    n: 1,
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI returned no image data");

  const rawBuffer = Buffer.from(b64, "base64");
  fs.writeFileSync(RAW_PATH, rawBuffer);

  const flattened = await sharp(rawBuffer)
    .flatten({ background: BG })
    .trim({ background: BG, threshold: 14 })
    .extend({ top: 24, bottom: 24, left: 36, right: 36, background: BG })
    .resize({ width: 320, height: 72, fit: "inside", background: BG })
    .webp({ quality: 90 })
    .toFile(OUT_PATH);

  console.log(`Raw: ${RAW_PATH}`);
  console.log(`Out: ${OUT_PATH}`);
  console.log(`Size: ${(flattened.size / 1024).toFixed(1)}KB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
