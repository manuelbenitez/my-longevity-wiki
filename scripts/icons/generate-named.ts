/**
 * One-off generator for non-ingredient assets (page headers, logo, OG image).
 * Reuses the locked PROMPT.md style block but accepts a free-form subject sentence.
 *
 * Usage:
 *   bun run scripts/icons/generate-named.ts \
 *     --subject "a single overflowing rustic ceramic bowl ..." \
 *     --out public/headers/ingredients.webp \
 *     --size 350
 *
 * The raw 1024x1024 PNG is preserved at scripts/icons/raw/named-{name}.png
 * (where {name} is the basename of --out without extension).
 *
 * Requires OPENAI_API_KEY in .env.local.
 */

import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname ?? __dirname, "..", "..");
const RAW_DIR = path.join(ROOT, "scripts", "icons", "raw");
const PROMPT_PATH = path.join(ROOT, "scripts", "icons", "PROMPT.md");

interface Args {
  subject: string;
  out: string;
  size: number;
  quality: "low" | "medium" | "high" | "auto";
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const args: Partial<Args> = { size: 350, quality: "medium" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--subject") args.subject = argv[++i];
    else if (a === "--out") args.out = argv[++i];
    else if (a === "--size") args.size = parseInt(argv[++i] ?? "350", 10);
    else if (a === "--quality") args.quality = argv[++i] as Args["quality"];
  }
  if (!args.subject) throw new Error("--subject is required");
  if (!args.out) throw new Error("--out is required");
  return args as Args;
}

async function main() {
  const args = parseArgs();
  const promptTemplate = fs.readFileSync(PROMPT_PATH, "utf-8");
  const prompt = promptTemplate.replace(/\{INGREDIENT_NAME\}/g, args.subject);

  const outAbs = path.isAbsolute(args.out) ? args.out : path.join(ROOT, args.out);
  fs.mkdirSync(path.dirname(outAbs), { recursive: true });
  fs.mkdirSync(RAW_DIR, { recursive: true });

  const name = path.basename(args.out).replace(/\.[^.]+$/, "");
  const rawPath = path.join(RAW_DIR, `named-${name}.png`);

  console.log(`Subject: ${args.subject.slice(0, 80)}${args.subject.length > 80 ? "..." : ""}`);
  console.log(`Out:     ${outAbs} (${args.size}x${args.size})`);
  console.log(`Raw:     ${rawPath}`);
  console.log(`Quality: ${args.quality}`);
  console.log("");

  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY not set. Add it to .env.local and re-run.");
    process.exit(1);
  }

  const client = new OpenAI();
  process.stdout.write("Generating ... ");

  const response = await client.images.generate({
    model: "gpt-image-1",
    prompt,
    size: "1024x1024",
    quality: args.quality,
    n: 1,
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI returned no image data");

  const pngBuffer = Buffer.from(b64, "base64");
  fs.writeFileSync(rawPath, pngBuffer);

  const info = await sharp(pngBuffer)
    .resize(args.size, args.size, { fit: "cover", background: { r: 247, g: 238, b: 221 } })
    .webp({ quality: 85 })
    .toFile(outAbs);

  console.log(`${(info.size / 1024).toFixed(1)}KB`);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
