import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// /search = thin, infinite query-string pages; keep crawl budget on articles.
const PRIVATE = ["/admin", "/api/", "/search"];

// AI search + training crawlers are allowed explicitly: GEO visibility in
// ChatGPT, Claude, Perplexity, Gemini/AI Overviews depends on them.
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "CCBot",
  "Meta-ExternalAgent",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      { userAgent: AI_BOTS, allow: "/", disallow: PRIVATE },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
