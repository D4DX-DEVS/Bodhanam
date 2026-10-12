import {
  getLatestIssue,
  getColumns,
  getRecentIssuesForPreview,
  normalizeCategoryName,
  withDerivedExcerpts,
} from "@/lib/data";
import LatestIssueHero from "@/app/_components/home/LatestIssueHero";
import FeaturedStories from "@/app/_components/home/FeaturedStories";
import ColumnsSection from "@/app/_components/home/ColumnsSection";
import LatestArticles from "@/app/_components/home/LatestArticles";
import ArchivePreview from "@/app/_components/home/ArchivePreview";
import { Suspense } from "react";
import {
  HeroSkeleton,
  CoverStoriesSkeleton,
  CardsSkeleton,
  ArchiveSkeleton,
} from "@/app/_components/skeletons/HomeSkeleton";
import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, pageMeta } from "@/lib/seo";

// Keep latest-issue content fresh — no static caching. (Cover-story shuffle
// happens client-side in FeaturedStories, so it reshuffles on every visit
// regardless of router/prefetch caches.)
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...pageMeta({ title: SITE_NAME, description: SITE_DESCRIPTION, path: "/" }),
  title: { absolute: "ബോധനം | Bodhanam — Malayalam Islamic Quarterly Research Journal" },
};

type LatestIssue = NonNullable<Awaited<ReturnType<typeof getLatestIssue>>>;
type Article = LatestIssue["articles"][number];

const MUGAVURAP = normalizeCategoryName("മുഖക്കുറിപ്പ്");

function findMugavurap(articles: Article[]): Article | undefined {
  return articles.find(
    (a) => a.category && normalizeCategoryName(a.category) === MUGAVURAP
  );
}

// Each section is its own async component inside a Suspense boundary, so the
// page shell paints at once and every section swaps its shimmer for content
// as soon as its own data is ready (the hero usually lands first).

async function HeroSection() {
  const latestIssue = await getLatestIssue();
  if (!latestIssue) return null;
  const mugavurap = findMugavurap(latestIssue.articles);
  const [withExcerpt] = mugavurap ? await withDerivedExcerpts([mugavurap]) : [];
  return <LatestIssueHero issue={latestIssue} mugavurapArticle={withExcerpt} />;
}

async function IssueSections() {
  // getLatestIssue already includes every article of the issue, so cover
  // stories and column picks are derived in memory — no extra DB round-trips.
  const [latestIssue, columns] = await Promise.all([getLatestIssue(), getColumns()]);
  if (!latestIssue) return null;
  const articles = await withDerivedExcerpts(latestIssue.articles);

  // Original CMS convention: covernum 1-4 = this issue's actual cover stories.
  // Order shuffled client-side in FeaturedStories.
  const coverStories = articles.filter((a) => a.covernum > 0 && a.covernum <= 4);

  const columnSections: Array<{
    column: { id: number; name: string; order: number };
    article: Article;
  }> = [];
  for (const column of columns) {
    const target = normalizeCategoryName(column.name);
    const article = articles.find(
      (a) => a.category && normalizeCategoryName(a.category) === target
    );
    if (article) columnSections.push({ column, article });
  }

  // ലേഖനങ്ങൾ: old CMS marked these "ലേഖനം / പഠനം". Prefer that label;
  // issues entered without it (e.g. issue 57) fall back to every article
  // not already shown as cover story or column pick.
  const usedIds = new Set([
    ...coverStories.map((a) => a.id),
    ...columnSections.map((s) => s.article.id),
  ]);
  const unused = articles.filter((a) => !usedIds.has(a.id));
  const lekhanam = unused.filter(
    (a) => a.category && normalizeCategoryName(a.category).includes("ലേഖനം")
  );
  const remainingArticles = lekhanam.length > 0 ? lekhanam : unused;

  return (
    <>
      <FeaturedStories stories={coverStories} />
      <ColumnsSection sections={columnSections} />
      <LatestArticles articles={remainingArticles} />
    </>
  );
}

async function ArchiveSection() {
  const recentIssues = await getRecentIssuesForPreview(6);
  return <ArchivePreview issues={recentIssues} />;
}

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      <Suspense
        fallback={
          <>
            <CoverStoriesSkeleton />
            <CardsSkeleton />
          </>
        }
      >
        <IssueSections />
      </Suspense>

      <Suspense fallback={<ArchiveSkeleton />}>
        <ArchiveSection />
      </Suspense>
    </div>
  );
}
