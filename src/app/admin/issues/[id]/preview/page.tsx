import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getColumns,
  normalizeCategoryName,
  withDerivedExcerpts,
} from "@/lib/data";
import LatestIssueHero from "@/app/_components/home/LatestIssueHero";
import FeaturedStories from "@/app/_components/home/FeaturedStories";
import ColumnsSection from "@/app/_components/home/ColumnsSection";
import LatestArticles from "@/app/_components/home/LatestArticles";
import PublishIssueButton from "@/app/admin/_components/PublishIssueButton";

export const metadata = {
  title: "Home Preview · Admin",
};

// Renders the home-page composition for one issue (draft or published) so the
// admin can verify how it will look before publishing.
export default async function IssueHomePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const issue = await db.issue.findUnique({
    where: { id: parseInt(id) },
    include: {
      articles: {
        omit: { bodyHtml: true },
        orderBy: [{ order: "asc" }, { id: "asc" }],
      },
    },
  });

  if (!issue) notFound();

  issue.articles = await withDerivedExcerpts(issue.articles);
  const columns = await getColumns();

  const mugavurapTarget = normalizeCategoryName("മുഖക്കുറിപ്പ്");
  const mugavurapArticle = issue.articles.find(
    (a) => a.category && normalizeCategoryName(a.category) === mugavurapTarget
  );

  const coverStories = issue.articles.filter(
    (a) => a.covernum > 0 && a.covernum <= 4
  );

  const columnSections: Array<{
    column: { id: number; name: string; order: number };
    article: (typeof issue.articles)[number];
  }> = [];
  for (const column of columns) {
    const target = normalizeCategoryName(column.name);
    const article = issue.articles.find(
      (a) => a.category && normalizeCategoryName(a.category) === target
    );
    if (article) columnSections.push({ column, article });
  }

  const usedIds = new Set([
    ...coverStories.map((a) => a.id),
    ...columnSections.map((s) => s.article.id),
  ]);
  // ലേഖനങ്ങൾ: same hybrid rule as the live home page — prefer ലേഖനം-labelled
  // articles, else fall back to everything not used above.
  const unused = issue.articles.filter((a) => !usedIds.has(a.id));
  const lekhanam = unused.filter(
    (a) => a.category && normalizeCategoryName(a.category).includes("ലേഖനം")
  );
  const remainingArticles = lekhanam.length > 0 ? lekhanam : unused;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-100 dark:bg-amber-900/40 px-4 py-3 text-sm">
        <span className="font-medium text-amber-800 dark:text-amber-200">
          Home page preview — {issue.published ? "issue is live" : "draft, not visible to visitors"}
        </span>
        <div className="ml-auto flex items-center gap-3">
          <Link
            href={`/admin/issues/${issue.id}/edit`}
            className="px-4 py-1.5 border border-amber-400 rounded-lg font-medium text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800/40"
          >
            Edit Issue
          </Link>
          {!issue.published && <PublishIssueButton issueId={issue.id} />}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <LatestIssueHero issue={issue} mugavurapArticle={mugavurapArticle} />
        {coverStories.length === 0 && (
          <div className="my-6 rounded-xl border-2 border-dashed border-default p-8 text-center text-sm text-muted">
            No cover stories yet. Edit 2–4 articles of this issue and set
            &ldquo;Cover story slot&rdquo; to 1–4 — they will appear here.
          </div>
        )}
        <FeaturedStories stories={coverStories} />
        <ColumnsSection sections={columnSections} />
        <LatestArticles articles={remainingArticles} />
      </div>
    </div>
  );
}
