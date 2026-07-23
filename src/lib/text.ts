// Scraped excerpts carry the old site's meta-description suffix
// (e.g. "... - Bodhanam Quarterly Journal") — strip it so previews read as content, not SEO boilerplate.
const TRAILING_SITE_NAME = /\s*[-–—]\s*Bodhanam Quarterly Journal\s*$/i;

export function cleanExcerpt(excerpt: string): string {
  return excerpt.replace(TRAILING_SITE_NAME, "").trim();
}

/** Plain-text preview derived from article HTML, cut at a word boundary. */
export function htmlToExcerpt(html: string, maxLen = 220): string {
  const text = html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}
