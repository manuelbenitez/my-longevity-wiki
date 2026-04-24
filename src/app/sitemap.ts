import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

export const dynamic = "force-static";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://longevity.mbdev.to";
const LOCALES = ["en", "es"];
const CONTENT_DIR = path.join(process.cwd(), "content");

function getSlugs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const ingredientSlugs = getSlugs(path.join(CONTENT_DIR, "wiki", "en"));
  const recipeSlugs = getSlugs(path.join(CONTENT_DIR, "recipes", "en"));

  const entries: MetadataRoute.Sitemap = [];

  // Top-level locale pages. Root `/` is intentionally omitted — it 307-redirects
  // to `/en/` or `/es/` based on Accept-Language, so indexing it creates a
  // canonical split with the locale roots.
  for (const locale of LOCALES) {
    entries.push({
      url: `${SITE_URL}/${locale}/`,
      changeFrequency: "weekly",
      priority: 1.0,
    });
    entries.push({
      url: `${SITE_URL}/${locale}/meal-planner/`,
      changeFrequency: "weekly",
      priority: 1.0,
    });
    entries.push({
      url: `${SITE_URL}/${locale}/ingredients/`,
      changeFrequency: "weekly",
      priority: 0.9,
    });
    entries.push({
      url: `${SITE_URL}/${locale}/recipes/`,
      changeFrequency: "weekly",
      priority: 0.9,
    });
    entries.push({
      url: `${SITE_URL}/${locale}/support/`,
      changeFrequency: "monthly",
      priority: 0.7,
    });
    entries.push({
      url: `${SITE_URL}/${locale}/about/`,
      changeFrequency: "monthly",
      priority: 0.6,
    });
    entries.push({
      url: `${SITE_URL}/${locale}/sources/`,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  // Ingredient pages — only include a locale URL if the content file actually exists.
  // Without this guard the sitemap would list es URLs for en-only ingredients, causing
  // Google to crawl 126 duplicate pages (en content served at es URLs via fallback).
  for (const slug of ingredientSlugs) {
    for (const locale of LOCALES) {
      if (!fs.existsSync(path.join(CONTENT_DIR, "wiki", locale, `${slug}.md`))) continue;
      entries.push({
        url: `${SITE_URL}/${locale}/ingredients/${slug}/`,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  // Recipe pages — same guard: only include es URLs where an es file exists.
  for (const slug of recipeSlugs) {
    for (const locale of LOCALES) {
      if (!fs.existsSync(path.join(CONTENT_DIR, "recipes", locale, `${slug}.md`))) continue;
      entries.push({
        url: `${SITE_URL}/${locale}/recipes/${slug}/`,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
