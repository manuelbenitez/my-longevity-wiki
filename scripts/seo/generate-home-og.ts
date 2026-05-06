/**
 * Generate the site-wide Open Graph image.
 *
 * Usage:
 *   bun run scripts/seo/generate-home-og.ts
 *   bun run scripts/seo/generate-home-og.ts --regen-subtitle
 *
 * Requires OPENAI_API_KEY in .env.local, env.local, or local.env when
 * regenerating the handwritten subtitle asset.
 */

import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname ?? __dirname, "..", "..");
const RAW_DIR = path.join(ROOT, "scripts", "seo", "raw");
const BRAND_DIR = path.join(ROOT, "public", "brand");
const OUT_PATH = path.join(ROOT, "public", "og-image.png");
const ICON_PATH = path.join(ROOT, "public", "logo-large.svg");
const WORDMARK_PATH = path.join(BRAND_DIR, "longevity-wiki-wordmark.webp");
const RAW_SUBTITLE_PATH = path.join(RAW_DIR, "home-og-subtitle.png");
const SUBTITLE_PATH = path.join(BRAND_DIR, "home-og-subtitle.webp");

const WIDTH = 1200;
const HEIGHT = 630;
const BG = "#F7EEDD";
const INK = "#2C2418";
const MUTED = "#6F6658";
const GREEN = "#6F8060";
const BORDER = "#D8CCB8";
const BG_RGB = { r: 247, g: 238, b: 221 };

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

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function generateSubtitle() {
  loadEnvFiles();

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not set. Add it to .env.local, env.local, or local.env and re-run.");
  }

  fs.mkdirSync(RAW_DIR, { recursive: true });
  fs.mkdirSync(BRAND_DIR, { recursive: true });

  const client = new OpenAI();
  const prompt = [
    "Create a clean handwritten text image that says exactly: Science-backed foods for healthy aging",
    "The spelling must be exact, with no extra words and no punctuation.",
    "Style: thin dark brown ink stroke, human handwritten note, calm editorial botanical field-guide feeling.",
    "Use one line only. Do not use a typeface, block letters, bold lettering, calligraphy flourishes, or thick downstrokes.",
    `Ink color ${INK} on a perfectly flat bone-white background ${BG}.`,
    "No icon, no border, no underline, no shadow, no texture, no paper grain, no watermark.",
    "Wide horizontal composition with modest padding.",
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

  fs.writeFileSync(RAW_SUBTITLE_PATH, Buffer.from(b64, "base64"));
}

async function normalizeSubtitle() {
  if (!fs.existsSync(RAW_SUBTITLE_PATH)) return false;

  await sharp(RAW_SUBTITLE_PATH)
    .flatten({ background: BG })
    .trim({ background: BG, threshold: 14 })
    .extend({ top: 20, bottom: 20, left: 28, right: 28, background: BG })
    .resize({ width: 690, height: 92, fit: "inside", background: BG })
    .webp({ quality: 92 })
    .toFile(SUBTITLE_PATH);

  return true;
}

async function transparentLightBackground(input: string, width: number, height: number) {
  const { data, info } = await sharp(input)
    .flatten({ background: BG })
    .resize({ width, height, fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const bg = [data[0] ?? BG_RGB.r, data[1] ?? BG_RGB.g, data[2] ?? BG_RGB.b];
  const transparentAt = 28;
  const opaqueAt = 115;

  for (let i = 0; i < data.length; i += 4) {
    const dr = data[i] - bg[0];
    const dg = data[i + 1] - bg[1];
    const db = data[i + 2] - bg[2];
    const distance = Math.sqrt(dr * dr + dg * dg + db * db);
    const alpha = Math.max(0, Math.min(255, ((distance - transparentAt) / (opaqueAt - transparentAt)) * 255));
    data[i + 3] = Math.round(alpha);
  }

  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
}

async function renderOg() {
  const subtitleExists = fs.existsSync(SUBTITLE_PATH);
  const fallbackSubtitle = "Science-backed foods for healthy aging";

  const baseSvg = Buffer.from(`
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${WIDTH}" height="${HEIGHT}" fill="${BG}"/>
      <rect x="22" y="22" width="${WIDTH - 44}" height="${HEIGHT - 44}" rx="28" fill="none" stroke="${BORDER}" stroke-width="2"/>
      <circle cx="960" cy="118" r="184" fill="#EFE5D2" opacity="0.42"/>
      <circle cx="214" cy="506" r="156" fill="#FFFFFF" opacity="0.32"/>
      <path d="M78 517 C218 469, 331 477, 463 521 S746 576, 913 510 S1082 467, 1140 493" fill="none" stroke="${GREEN}" stroke-width="5" stroke-linecap="round" opacity="0.34"/>
      <text x="372" y="426" fill="${escapeXml(MUTED)}" font-family="Georgia, 'Times New Roman', serif" font-size="30" letter-spacing="0">
        Ingredients • Recipes • Meal Planner
      </text>
      <text x="372" y="476" fill="${escapeXml(GREEN)}" font-family="Georgia, 'Times New Roman', serif" font-size="25" letter-spacing="0">
        longevity.mbdev.to
      </text>
      ${
        subtitleExists
          ? ""
          : `<text x="372" y="340" fill="${escapeXml(INK)}" font-family="Georgia, 'Times New Roman', serif" font-size="48" font-style="italic" letter-spacing="0">${escapeXml(fallbackSubtitle)}</text>`
      }
    </svg>
  `);

  const composites: sharp.OverlayOptions[] = [
    {
      input: await sharp(ICON_PATH).resize(190, 190, { fit: "inside" }).png().toBuffer(),
      left: 130,
      top: 210,
    },
    {
      input: await transparentLightBackground(WORDMARK_PATH, 610, 150),
      left: 360,
      top: 166,
    },
  ];

  if (subtitleExists) {
    composites.push({
      input: await transparentLightBackground(SUBTITLE_PATH, 670, 90),
      left: 365,
      top: 312,
    });
  }

  await sharp(baseSvg)
    .composite(composites)
    .png({ compressionLevel: 9, palette: true })
    .toFile(OUT_PATH);
}

async function main() {
  const regenSubtitle = process.argv.includes("--regen-subtitle") || !fs.existsSync(RAW_SUBTITLE_PATH);

  if (regenSubtitle) await generateSubtitle();
  await normalizeSubtitle();
  await renderOg();

  const meta = await sharp(OUT_PATH).metadata();
  console.log(`Out: ${OUT_PATH}`);
  console.log(`Size: ${meta.width}x${meta.height}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
