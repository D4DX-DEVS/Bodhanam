import {
  getLatestIssue,
  getColumns,
  getRecentIssuesForPreview,
  normalizeCategoryName,
} from "@/lib/data";
import LatestIssueHero from "@/app/_components/home/LatestIssueHero";
import FeaturedStories from "@/app/_components/home/FeaturedStories";
import ColumnsSection from "@/app/_components/home/ColumnsSection";
import LatestArticles from "@/app/_components/home/LatestArticles";
import ArchivePreview from "@/app/_components/home/ArchivePreview";

// Keep latest-issue content fresh — no static caching. (Cover-story shuffle
// happens client-side in FeaturedStories, so it reshuffles on every visit
// regardless of router/prefetch caches.)
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Home",
  description: "Latest research and scholarship from Bodhanam Quarterly",
};

type LatestIssue = NonNullable<Awaited<ReturnType<typeof getLatestIssue>>>;
type Article = LatestIssue["articles"][number];

export default async function Home() {
  // getLatestIssue already includes every article of the issue, so cover
  // stories and column picks are derived in memory — no extra DB round-trips.
  const [latestIssue, columns, recentIssues] = await Promise.all([
    getLatestIssue(),
    getColumns(),
    getRecentIssuesForPreview(6),
  ]);

  let coverStories: Article[] = [];
  const columnSections: Array<{
    column: { id: number; name: string; order: number };
    article: Article;
  }> = [];
  let mugavurapArticle: Article | undefined;
  let remainingArticles: Article[] = [];

  if (latestIssue) {
    const mugavurapTarget = normalizeCategoryName("മുഖക്കുറിപ്പ്");
    mugavurapArticle = latestIssue.articles.find(
      (a) => a.category && normalizeCategoryName(a.category) === mugavurapTarget
    );

    // Original CMS convention: covernum 1-4 = this issue's actual cover stories.
    // Order shuffled client-side in FeaturedStories.
    const covers = latestIssue.articles.filter((a) => a.covernum > 0 && a.covernum <= 4);
    coverStories = covers;

    for (const column of columns) {
      const target = normalizeCategoryName(column.name);
      const article = latestIssue.articles.find(
        (a) => a.category && normalizeCategoryName(a.category) === target
      );
      if (article) columnSections.push({ column, article });
    }

    // ലേഖനങ്ങൾ: this issue's remaining articles — same convention as the
    // reference site, not a sitewide "recent articles" feed.
    const usedIds = new Set([
      ...covers.map((a) => a.id),
      ...columnSections.map((s) => s.article.id),
    ]);
    remainingArticles = latestIssue.articles.filter((a) => !usedIds.has(a.id));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {latestIssue && (
        <LatestIssueHero issue={latestIssue} mugavurapArticle={mugavurapArticle} />
      )}

      {latestIssue && (
        <FeaturedStories stories={coverStories} issueId={latestIssue.id} />
      )}

      {latestIssue && (
        <ColumnsSection sections={columnSections} />
      )}

      {latestIssue && (
        <LatestArticles articles={remainingArticles} issueId={latestIssue.id} />
      )}

      <ArchivePreview issues={recentIssues} />
    </div>
  );
}
