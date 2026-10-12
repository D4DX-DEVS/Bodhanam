import { db } from "./db";
import { unstable_cache } from "next/cache";
import { htmlToExcerpt } from "./text";

/** Tag on every cached public query; admin mutations expire it. */
export const CONTENT_TAG = "content";

// Server data cache: public pages hit Mongo at most once per hour per query
// (or right after an admin edit expires CONTENT_TAG). Results are
// JSON-serialized, so Date fields come back as strings — don't render them.
function cached<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  key: string
): (...args: A) => Promise<R> {
  return unstable_cache(fn, ["data", key], { tags: [CONTENT_TAG], revalidate: 3600 });
}

// Full bodies are large (Malayalam HTML, ~60KB each) and pulling a whole
// issue's worth took ~7s. Mongo trims each body to its head server-side, so
// only a few KB per article cross the wire; the excerpt result is cached.
const EXCERPT_SOURCE_CHARS = 2500;

const getDerivedExcerpts = cached(async (ids: number[]) => {
  const rows = (await db.article.aggregateRaw({
    pipeline: [
      { $match: { _id: { $in: ids } } },
      { $project: { head: { $substrCP: ["$bodyHtml", 0, EXCERPT_SOURCE_CHARS] } } },
    ],
  })) as unknown as Array<{ _id: number; head: string | null }>;
  return rows.map((r): [number, string] => [r._id, htmlToExcerpt((r.head ?? "").replace(/<[^>]*$/, ""))]); // drop a tag cut mid-way
}, "getDerivedExcerpts");

/**
 * Fill missing excerpts from article bodies (one query for the missing ids)
 * so home cards always show a short description.
 */
export async function withDerivedExcerpts<
  T extends { id: number; excerpt: string | null }
>(articles: T[]): Promise<T[]> {
  const missing = articles.filter((a) => !a.excerpt?.trim()).map((a) => a.id);
  if (missing.length === 0) return articles;
  const derived = new Map(await getDerivedExcerpts(missing));
  return articles.map((a) =>
    a.excerpt?.trim() ? a : { ...a, excerpt: derived.get(a.id) || null }
  );
}

/**
 * Normalize category names for matching
 * Handles Unicode variants, zero-width joiners, and whitespace
 */
export function normalizeCategoryName(name: string): string {
  if (!name) return "";
  return name
    .normalize("NFC")
    .replace(/[‌‍]/g, "") // Remove zero-width joiner/non-joiner
    .trim();
}

// Draft gate: hide only articles explicitly unpublished (false).
// null = legacy article (visible), true = published, false = draft.
// Prisma `not: false` excludes null rows, so match true/null explicitly;
// AND-wrapped so it composes with callers that add their own OR.
const VISIBLE_ARTICLE = {
  // Mongo: `null` filter misses docs where the field was never set (bulk import), so match unset too.
  AND: [{ OR: [{ published: true }, { published: null }, { published: { isSet: false } }] }],
};

// ============ PUBLIC QUERIES (PUBLISHED ISSUES ONLY) ============

async function _getLatestIssue() {
  return db.issue.findFirst({
    where: { published: true },
    orderBy: { id: "desc" },
    include: {
      articles: {
        where: VISIBLE_ARTICLE,
        omit: { bodyHtml: true },
        orderBy: [{ order: "asc" }, { id: "asc" }],
      },
    },
  });
}

async function _getIssues() {
  return db.issue.findMany({
    where: { published: true },
    orderBy: { id: "desc" },
  });
}

/**
 * Lean recent-issues query for the homepage archive strip: cover + article
 * count only, without loading every article (avoids a huge over-fetch).
 */
async function _getRecentIssuesForPreview(n: number) {
  return db.issue.findMany({
    where: { published: true },
    orderBy: { id: "desc" },
    take: n,
    include: { _count: { select: { articles: true } } },
  });
}

async function _getIssue(id: number) {
  return db.issue.findUnique({
    where: { id, published: true },
    include: {
      articles: {
        where: VISIBLE_ARTICLE,
        omit: { bodyHtml: true },
        orderBy: [{ order: "asc" }, { id: "asc" }],
      },
    },
  });
}

/**
 * Get article - returns null if article's issue is not published (triggers 404)
 */
async function _getArticle(id: number) {
  const article = await db.article.findUnique({
    where: { id },
    include: { issue: true },
  });

  // Return null if issue unpublished or article is a draft - triggers 404
  if (article && (!article.issue.published || article.published === false)) {
    return null;
  }

  return article;
}

/**
 * Get articles from published issue only
 */
async function _getIssueArticles(issueId: number) {
  return db.article.findMany({
    where: { issueId, issue: { published: true }, ...VISIBLE_ARTICLE },
    omit: { bodyHtml: true },
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });
}

export async function getAdjacentArticles(article: {
  id: number;
  issueId: number;
  order: number;
}) {
  const articles = await getIssueArticles(article.issueId);
  const currentIndex = articles.findIndex((a) => a.id === article.id);

  return {
    prev:
      currentIndex > 0
        ? articles[currentIndex - 1]
        : articles[articles.length - 1],
    next:
      currentIndex < articles.length - 1
        ? articles[currentIndex + 1]
        : articles[0],
  };
}

async function _getPage(slug: string) {
  return db.page.findUnique({
    where: { slug },
  });
}

interface ContactValue {
  editorial?: { label?: string; address?: string; phone?: string; email?: string };
  manager?: { label?: string; address?: string; phone?: string; email?: string };
  team?: string[];
}

async function _getContact() {
  const setting = await db.setting.findUnique({
    where: { key: "contact" },
  });

  if (!setting) return null;

  try {
    const parsed = JSON.parse(setting.value) as ContactValue;
    return {
      editorial: parsed.editorial || {},
      manager: parsed.manager || {},
      team: parsed.team || [],
    };
  } catch {
    return null;
  }
}

/**
 * Get recent articles from published issues only
 */
async function _getRecentArticles(n: number) {
  return db.article.findMany({
    where: { issue: { published: true }, ...VISIBLE_ARTICLE },
    omit: { bodyHtml: true },
    orderBy: { id: "desc" },
    take: n,
    include: { issue: true },
  });
}

function issueYear(period: string): string {
  return period.match(/^\d{4}/)?.[0] ?? "Undated";
}

/**
 * Distinct years among published issues, newest first ("Undated" last)
 */
async function _getAvailableIssueYears(): Promise<string[]> {
  const issues = await db.issue.findMany({
    where: { published: true },
    select: { period: true },
  });
  const years = new Set(issues.map((i) => issueYear(i.period)));
  return Array.from(years).sort((a, b) => {
    if (a === "Undated") return 1;
    if (b === "Undated") return -1;
    return parseInt(b) - parseInt(a);
  });
}

/**
 * Paginated published issues, optionally filtered by free-text query and/or year
 */
async function _searchIssuesPaged(
  query: string,
  year: string,
  page: number = 1,
  perPage: number = 12
) {
  // ponytail: fetch-all-then-filter is fine at ~51 issues (no article bodies);
  // push filters into Mongo if issue count ever grows into the thousands.
  const all = await db.issue.findMany({
    where: { published: true },
    orderBy: { id: "desc" },
  });

  const q = query.trim().toLowerCase();

  // Also surface issues containing an article whose title/author matches.
  let articleMatchIssueIds = new Set<number>();
  if (q) {
    const matches = await db.article.findMany({
      where: {
        issue: { published: true },
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { author: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { issueId: true },
    });
    articleMatchIssueIds = new Set(matches.map((m) => m.issueId));
  }

  const filtered = all.filter((issue) => {
    if (year && year !== "all" && issueYear(issue.period) !== year) return false;
    if (q) {
      const haystack = `vol ${issue.volume} issue ${issue.issueNo} ${issue.period}`.toLowerCase();
      if (!haystack.includes(q) && !articleMatchIssueIds.has(issue.id)) return false;
    }
    return true;
  });

  const total = filtered.length;
  const skip = (page - 1) * perPage;
  const items = filtered.slice(skip, skip + perPage);

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

/**
 * Search articles in published issues only, with pagination
 */
async function _searchArticlesPaged(
  query: string,
  page: number = 1,
  perPage: number = 12,
  category?: string
) {
  const q = query.trim();
  const skip = (page - 1) * perPage;
  const where = {
    issue: { published: true },
    ...VISIBLE_ARTICLE,
    ...(category ? { category } : {}),
    OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      { author: { contains: q, mode: "insensitive" as const } },
      { excerpt: { contains: q, mode: "insensitive" as const } },
      // Deep search: full article body (HTML) too
      { bodyHtml: { contains: q, mode: "insensitive" as const } },
    ],
  };
  const [total, items] = await Promise.all([
    db.article.count({ where }),
    db.article.findMany({
      where,
      include: { issue: true },
      omit: { bodyHtml: true },
      orderBy: { id: "desc" },
      skip,
      take: perPage,
    }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  return {
    items,
    total,
    page,
    perPage,
    totalPages,
  };
}

/** Distinct categories across published articles, for the search filter. */
async function _getSearchCategories(): Promise<string[]> {
  const rows = await db.article.findMany({
    where: { issue: { published: true }, ...VISIBLE_ARTICLE, category: { not: null } },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return rows.map((r) => r.category).filter((c): c is string => Boolean(c));
}

// ============ AUTHOR QUERIES ============

/**
 * Distinct authors across published-issue articles, with per-author article count
 */
async function _getAuthorsPaged(page: number = 1, perPage: number = 24) {
  const articles = await db.article.findMany({
    where: { author: { not: null }, issue: { published: true }, ...VISIBLE_ARTICLE },
    select: { author: true },
  });

  const counts = new Map<string, { name: string; count: number }>();
  for (const a of articles) {
    if (!a.author) continue;
    const key = normalizeCategoryName(a.author);
    const existing = counts.get(key);
    if (existing) existing.count += 1;
    else counts.set(key, { name: a.author.trim(), count: 1 });
  }

  const all = Array.from(counts.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "ml")
  );
  const total = all.length;
  const skip = (page - 1) * perPage;
  const items = all.slice(skip, skip + perPage);

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

/**
 * Paginated articles by a given author, across all published issues
 */
async function _getArticlesByAuthorPaged(
  authorName: string,
  page: number = 1,
  perPage: number = 12
) {
  const normalized = normalizeCategoryName(authorName);
  return pageByNormalizedField("author", normalized, page, perPage);
}

/**
 * Paginate articles whose author/category matches after Unicode normalization.
 * The match must run in JS (ZWJ variants), so only id + field are scanned for
 * every article; full rows are loaded for the current page alone.
 */
async function pageByNormalizedField(
  field: "author" | "category",
  normalized: string,
  page: number,
  perPage: number
) {
  // ponytail: store a normalized key field if article count grows past ~5k.
  const where = { [field]: { not: null }, issue: { published: true }, ...VISIBLE_ARTICLE };
  const candidates = await db.article.findMany({
    where,
    select: { id: true, author: true, category: true },
    orderBy: { id: "desc" },
  });
  const matchedIds = candidates
    .filter((a) => {
      const v = a[field];
      return v && normalizeCategoryName(v) === normalized;
    })
    .map((a) => a.id);

  const total = matchedIds.length;
  const skip = (page - 1) * perPage;
  const pageIds = matchedIds.slice(skip, skip + perPage);
  const items = pageIds.length
    ? await db.article.findMany({
        where: { id: { in: pageIds } },
        omit: { bodyHtml: true },
        include: { issue: true },
        orderBy: { id: "desc" },
      })
    : [];

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

// ============ COLUMN & COVER STORY QUERIES ============

/**
 * Get all columns ordered by column order
 */
const cachedColumns = cached(
  () => db.column.findMany({ orderBy: { order: "asc" } }),
  "getColumns"
);

export async function getColumns() {
  try {
    return await cachedColumns();
  } catch {
    return []; // ponytail: DB blip → empty nav, not a dead site (not cached)
  }
}

/**
 * Get cover stories (covernum > 0) from published issue, ordered by covernum
 */
export async function getCoverStories(issueId: number) {
  return db.article.findMany({
    where: {
      issueId,
      covernum: { gt: 0 },
      issue: { published: true },
      ...VISIBLE_ARTICLE,
    },
    omit: { bodyHtml: true },
    orderBy: { covernum: "asc" },
    take: 4,
  });
}

/**
 * Get paginated articles matching a category/topic name, across all published issues
 */
async function _getArticlesByCategoryPaged(
  categoryName: string,
  page: number = 1,
  perPage: number = 12
) {
  const normalized = normalizeCategoryName(categoryName);
  return pageByNormalizedField("category", normalized, page, perPage);
}

/**
 * Get articles for a specific column name from published issue
 */
export async function getColumnArticles(issueId: number, columnName: string) {
  const normalized = normalizeCategoryName(columnName);

  return db.article
    .findMany({
      where: {
        issueId,
        category: { not: null },
        issue: { published: true },
        ...VISIBLE_ARTICLE,
      },
      omit: { bodyHtml: true },
      orderBy: [{ order: "asc" }, { id: "asc" }],
    })
    .then((articles) =>
      articles.filter(
        (a) => a.category && normalizeCategoryName(a.category) === normalized
      )
    );
}

// ============ CACHED EXPORTS ============

export const getLatestIssue = cached(_getLatestIssue, "getLatestIssue");
export const getIssues = cached(_getIssues, "getIssues");
export const getRecentIssuesForPreview = cached(_getRecentIssuesForPreview, "getRecentIssuesForPreview");
export const getIssue = cached(_getIssue, "getIssue");
export const getArticle = cached(_getArticle, "getArticle");
export const getIssueArticles = cached(_getIssueArticles, "getIssueArticles");
export const getRecentArticles = cached(_getRecentArticles, "getRecentArticles");
export const getPage = cached(_getPage, "getPage");
export const getContact = cached(_getContact, "getContact");
export const getAvailableIssueYears = cached(_getAvailableIssueYears, "getAvailableIssueYears");
export const searchIssuesPaged = cached(_searchIssuesPaged, "searchIssuesPaged");
export const getSearchCategories = cached(_getSearchCategories, "getSearchCategories");
export const getAuthorsPaged = cached(_getAuthorsPaged, "getAuthorsPaged");
export const getArticlesByAuthorPaged = cached(_getArticlesByAuthorPaged, "getArticlesByAuthorPaged");
export const getArticlesByCategoryPaged = cached(_getArticlesByCategoryPaged, "getArticlesByCategoryPaged");
// Body search is a full scan; repeat searches (and pagination back/forth) hit the cache.
export const searchArticlesPaged = cached(_searchArticlesPaged, "searchArticlesPaged");
