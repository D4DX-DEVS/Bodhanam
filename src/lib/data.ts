import { db } from "./db";

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

export async function getLatestIssue() {
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

export async function getIssues() {
  return db.issue.findMany({
    where: { published: true },
    orderBy: { id: "desc" },
  });
}

/**
 * Lean recent-issues query for the homepage archive strip: cover + article
 * count only, without loading every article (avoids a huge over-fetch).
 */
export async function getRecentIssuesForPreview(n: number) {
  return db.issue.findMany({
    where: { published: true },
    orderBy: { id: "desc" },
    take: n,
    include: { _count: { select: { articles: true } } },
  });
}

export async function getIssue(id: number) {
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
export async function getArticle(id: number) {
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
export async function getIssueArticles(issueId: number) {
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

export async function getPage(slug: string) {
  return db.page.findUnique({
    where: { slug },
  });
}

interface ContactValue {
  editorial?: { label?: string; address?: string; phone?: string; email?: string };
  manager?: { label?: string; address?: string; phone?: string; email?: string };
  team?: string[];
}

export async function getContact() {
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
export async function getRecentArticles(n: number) {
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
export async function getAvailableIssueYears(): Promise<string[]> {
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
export async function searchIssuesPaged(
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
export async function searchArticlesPaged(
  query: string,
  page: number = 1,
  perPage: number = 12
) {
  const q = query.trim();
  const skip = (page - 1) * perPage;
  const where = {
    issue: { published: true },
    ...VISIBLE_ARTICLE,
    OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      { author: { contains: q, mode: "insensitive" as const } },
      { excerpt: { contains: q, mode: "insensitive" as const } },
    ],
  };
  const total = await db.article.count({ where });
  const items = await db.article.findMany({
    where,
    include: { issue: true },
    orderBy: { id: "desc" },
    skip,
    take: perPage,
  });

  const totalPages = Math.ceil(total / perPage);

  return {
    items,
    total,
    page,
    perPage,
    totalPages,
  };
}

// ============ AUTHOR QUERIES ============

/**
 * Distinct authors across published-issue articles, with per-author article count
 */
export async function getAuthorsPaged(page: number = 1, perPage: number = 24) {
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
export async function getArticlesByAuthorPaged(
  authorName: string,
  page: number = 1,
  perPage: number = 12
) {
  const normalized = normalizeCategoryName(authorName);

  // ponytail: normalized match must happen in JS (Unicode ZWJ variants);
  // store a normalized authorKey field if article count grows past ~5k.
  const candidates = await db.article.findMany({
    where: { author: { not: null }, issue: { published: true }, ...VISIBLE_ARTICLE },
    omit: { bodyHtml: true },
    include: { issue: true },
    orderBy: { id: "desc" },
  });
  const matched = candidates.filter(
    (a) => a.author && normalizeCategoryName(a.author) === normalized
  );

  const total = matched.length;
  const skip = (page - 1) * perPage;
  const items = matched.slice(skip, skip + perPage);

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
export async function getColumns() {
  try {
    return await db.column.findMany({
      orderBy: { order: "asc" },
    });
  } catch {
    return []; // ponytail: DB blip → empty nav, not a dead site
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
export async function getArticlesByCategoryPaged(
  categoryName: string,
  page: number = 1,
  perPage: number = 12
) {
  const normalized = normalizeCategoryName(categoryName);

  const candidates = await db.article.findMany({
    where: { category: { not: null }, issue: { published: true }, ...VISIBLE_ARTICLE },
    omit: { bodyHtml: true },
    include: { issue: true },
    orderBy: { id: "desc" },
  });
  const matched = candidates.filter(
    (a) => a.category && normalizeCategoryName(a.category) === normalized
  );

  const total = matched.length;
  const skip = (page - 1) * perPage;
  const items = matched.slice(skip, skip + perPage);

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
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
