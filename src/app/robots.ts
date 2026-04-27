import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://longevity.mbdev.to";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Build artifacts have no SEO value and were polluting the
        // crawled-not-indexed bucket (16/49 pages were _next chunks).
        disallow: "/_next/",
      },
      {
        userAgent: ["GPTBot", "ClaudeBot", "PerplexityBot", "OAI-SearchBot"],
        allow: "/",
        disallow: "/_next/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
