// Scraped excerpts carry the old site's meta-description suffix
// (e.g. "... - Bodhanam Quarterly Journal") — strip it so previews read as content, not SEO boilerplate.
const TRAILING_SITE_NAME = /\s*[-–—]\s*Bodhanam Quarterly Journal\s*$/i;

export function cleanExcerpt(excerpt: string): string {
  return excerpt.replace(TRAILING_SITE_NAME, "").trim();
}
