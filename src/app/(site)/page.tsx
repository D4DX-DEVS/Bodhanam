import {
  getLatestIssue,
  getColumns,
  getRecentIssuesForPreview,
  normalizeCategoryName,
} from "@/lib/data";
import LatestIssueHero from "@/app/_components/home/LatestIssueHero";
import FeaturedStories from "@/app/_components/home/FeaturedStories";
import ColumnsSection from "@/app/_components/home/ColumnsSection";
import ArchivePreview from "@/app/_components/home/ArchivePreview";

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

  if (latestIssue) {
    const mugavurapTarget = normalizeCategoryName("മുഖക്കുറിപ്പ്");
    mugavurapArticle = latestIssue.articles.find(
      (a) => a.category && normalizeCategoryName(a.category) === mugavurapTarget
    );

    // Original CMS convention: covernum 1-4 = cover stories on the home hero;
    // covernum 5+ only orders the remaining articles in the main grid.
    // Cover stories lead, then top up with the rest so the carousel has
    // enough cards to fill the 1-feature + 4-side window and still rotate.
    const covers = latestIssue.articles
      .filter((a) => a.covernum > 0 && a.covernum <= 4)
      .sort((a, b) => a.covernum - b.covernum);
    const coverIds = new Set(covers.map((a) => a.id));
    const rest = latestIssue.articles
      .filter((a) => !coverIds.has(a.id))
      .sort((a, b) => (a.covernum || 99) - (b.covernum || 99));
    coverStories = [...covers, ...rest];

    for (const column of columns) {
      const target = normalizeCategoryName(column.name);
      const article = latestIssue.articles.find(
        (a) => a.category && normalizeCategoryName(a.category) === target
      );
      if (article) columnSections.push({ column, article });
    }
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
        <ColumnsSection sections={columnSections} issueId={latestIssue.id} />
      )}

      <ArchivePreview issues={recentIssues} />
    </div>
  );
}
