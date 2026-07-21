import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p",
  "br",
  "h1",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "blockquote",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "s",
  "a",
  "img",
  "figure",
  "figcaption",
  "div",
  "span",
  "table",
  "thead",
  "tbody",
  "tr",
  "td",
  "th",
  "hr",
];

const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt", "title", "width", "height"],
  span: ["class"],
  div: ["class"],
};

export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS as string[],
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      a: ["http", "https", "mailto"],
      img: ["http", "https"],
    },
    transformTags: {
      // Ensure links don't have dangerous schemes
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          href: attribs.href?.startsWith("javascript:")
            ? "#"
            : attribs.href || "",
        },
      }),
      // Allow data-* attributes on img but validate src
      img: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          src: attribs.src?.startsWith("javascript:")
            ? ""
            : attribs.src || "",
          // Allow existing /storage/... and /uploads/... paths
        },
      }),
    },
    disallowedTagsMode: "discard",
  });
}

/** Strip an <img> from bodyHtml if its src matches the article's separately-rendered cover image (avoids showing it twice). */
export function stripDuplicateCoverImage(html: string, coverImage?: string | null): string {
  if (!coverImage) return html;
  const escaped = coverImage.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const imgTag = `<img[^>]*src=["']${escaped}["'][^>]*>`;
  return html
    .replace(new RegExp(`<figure[^>]*>\\s*${imgTag}[\\s\\S]*?<\\/figure>`, "gi"), "")
    .replace(new RegExp(imgTag, "gi"), "");
}
