import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { db } from "./db";
import { CONTENT_TAG } from "./data";

/** Canonical origin. Override per-env with NEXT_PUBLIC_SITE_URL (no trailing slash). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://bodhanam.net").replace(/\/$/, "");
export const SITE_NAME = "ബോധനം | Bodhanam Quarterly";
export const SITE_NAME_SHORT = "Bodhanam";
export const SITE_NAME_ML = "ബോധനം";
export const SITE_DESCRIPTION =
  "ബോധനം (Bodhanam) — a Malayalam Islamic quarterly research journal publishing scholarship on Quran, Hadith, Fiqh, Islamic history, spirituality and contemporary thought.";
export const SITE_LOCALE = "ml_IN";
export const SITE_LOGO = "/images/logo1.png";
export const DEFAULT_OG_IMAGE = "/images/default-image.jpg";

export function absUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export const articlePath = (id: number) => `/articles/show/${id}`;
export const issuePath = (id: number) => `/issue/${id}`;
export const authorPath = (name: string) => `/authors/${encodeURIComponent(name.trim())}`;

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

/**
 * Best-effort ISO date from an issue period like "2024 January - March".
 * Returns undefined when no year is found — never invent a date.
 */
export function periodToIsoDate(period: string | null | undefined): string | undefined {
  if (!period) return undefined;
  const year = period.match(/\b(19|20)\d{2}\b/)?.[0];
  if (!year) return undefined;
  const lower = period.toLowerCase();
  // first month *mentioned* ("2021 November - 2022 January" → November)
  let monthIdx = -1;
  let bestPos = Infinity;
  MONTHS.forEach((m, i) => {
    const pos = lower.indexOf(m.slice(0, 3));
    if (pos >= 0 && pos < bestPos) [bestPos, monthIdx] = [pos, i];
  });
  const month = String(monthIdx >= 0 ? monthIdx + 1 : 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

/** Trim to a meta-description-friendly length on a word boundary. */
export function clampDescription(text: string | null | undefined, max = 160): string | undefined {
  if (!text) return undefined;
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut}…`;
}

interface PageMetaInput {
  title: string;
  description?: string | null;
  path: string;
  image?: string | null;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  authors?: string[];
  section?: string | null;
  noindex?: boolean;
}

/**
 * Per-page metadata. Next replaces (not merges) a parent's openGraph/twitter
 * objects, so every page rebuilds the full set here, plus a canonical URL.
 */
export function pageMeta(p: PageMetaInput): Metadata {
  const description = clampDescription(p.description) ?? SITE_DESCRIPTION;
  const images = [{ url: p.image || DEFAULT_OG_IMAGE, alt: p.title }];
  return {
    title: p.title,
    description,
    alternates: { canonical: p.path },
    openGraph: {
      type: p.type ?? "website",
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      url: p.path,
      title: p.title,
      description,
      images,
      ...(p.type === "article" && {
        ...(p.publishedTime && { publishedTime: p.publishedTime }),
        ...(p.authors?.length && { authors: p.authors }),
        ...(p.section && { section: p.section }),
      }),
    },
    twitter: { card: "summary_large_image", title: p.title, description, images: images.map((i) => i.url) },
    ...(p.noindex && { robots: { index: false, follow: true } }),
  };
}

// ============ JSON-LD BUILDERS ============

export const PERIODICAL_ID = `${SITE_URL}/#periodical`;
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function siteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: "Bodhanam",
        alternateName: SITE_NAME_ML,
        url: SITE_URL,
        foundingDate: "1976-05",
        address: { "@type": "PostalAddress", addressLocality: "Kozhikode", addressRegion: "Kerala", addressCountry: "IN" },
        logo:{ "@type": "ImageObject", url: absUrl(SITE_LOGO) },
      },
      {
        "@type": "Periodical",
        "@id": PERIODICAL_ID,
        name: "Bodhanam Quarterly",
        alternateName: [SITE_NAME_ML, "Bodhanam Islamic Quarterly"],
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        inLanguage: "ml",
        publisher: { "@id": ORG_ID },
        locationCreated: { "@type": "Place", name: "Kerala, India" },
        genre: "Islamic studies",
        about: ["Islam", "Quran", "Hadith", "Islamic jurisprudence", "Islamic history"],
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: "ml",
        publisher: { "@id": ORG_ID },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

type IssueLike = {
  id: number;
  volume: number | null;
  issueNo: number | null;
  period: string;
  coverImage?: string | null;
};

export function issueNode(issue: IssueLike) {
  const date = periodToIsoDate(issue.period);
  return {
    "@type": "PublicationIssue",
    "@id": `${absUrl(issuePath(issue.id))}#issue`,
    url: absUrl(issuePath(issue.id)),
    name: `Bodhanam Vol ${issue.volume ?? "?"} · Issue ${issue.issueNo ?? "?"} (${issue.period})`,
    ...(issue.issueNo != null && { issueNumber: String(issue.issueNo) }),
    ...(date && { datePublished: date }),
    ...(issue.coverImage && { image: absUrl(issue.coverImage) }),
    isPartOf:
      issue.volume != null
        ? {
            "@type": "PublicationVolume",
            volumeNumber: String(issue.volume),
            isPartOf: { "@id": PERIODICAL_ID },
          }
        : { "@id": PERIODICAL_ID },
  };
}

export function breadcrumb(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absUrl(it.path),
    })),
  };
}

// ============ SITEMAP / LLMS DATA ============

const VISIBLE = {
  AND: [{ OR: [{ published: true }, { published: null }, { published: { isSet: false } }] }],
};

async function _getIndexableContent() {
  const [issues, articles] = await Promise.all([
    db.issue.findMany({
      where: { published: true },
      orderBy: { id: "desc" },
      select: { id: true, volume: true, issueNo: true, period: true, coverImage: true },
    }),
    db.article.findMany({
      where: { issue: { published: true }, ...VISIBLE },
      orderBy: { id: "desc" },
      select: { id: true, title: true, author: true, category: true, issueId: true, coverImage: true },
    }),
  ]);
  return { issues, articles };
}

export const getIndexableContent = unstable_cache(_getIndexableContent, ["seo", "indexable"], {
  tags: [CONTENT_TAG],
  revalidate: 3600,
});
