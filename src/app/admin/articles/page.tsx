import { db } from "@/lib/db";
import Link from "next/link";
import Pagination from "@/app/_components/Pagination";
import IssueFilterSelect from "./IssueFilterSelect";

export const metadata = {
  title: "Articles · Admin",
};

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; issue?: string; q?: string }>;
}) {
  const { page = "1", issue: issueFilter, q } = await searchParams;
  const pageNum = Math.max(1, parseInt(page) || 1);
  const pageSize = 30;
  const query = q?.trim() || "";

  const where = {
    ...(issueFilter && issueFilter !== "all" ? { issueId: parseInt(issueFilter) } : {}),
    ...(query ? { title: { contains: query, mode: "insensitive" as const } } : {}),
  };

  let articles, total, issues;
  try {
    [articles, total, issues] = await Promise.all([
      db.article.findMany({
        where,
        omit: { bodyHtml: true },
        include: { issue: true },
        orderBy: { id: "desc" },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
      db.article.count({ where }),
      db.issue.findMany({ orderBy: { id: "desc" } }),
    ]);
  } catch {
    // ponytail: DB unreachable → readable message, not a stack-trace crash
    return (
      <div className="max-w-6xl mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold text-ink mb-2">Database unavailable</h1>
        <p className="text-muted">
          Can’t reach the database right now. Refresh in a minute.
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-ink">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="px-6 py-2 btn-primary rounded-lg font-medium"
        >
          New Article
        </Link>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <form action="/admin/articles" method="get" className="flex flex-wrap gap-4 items-center">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by title…"
            className="px-4 py-2 border border-default rounded-lg text-ink bg-paper"
          />
          <IssueFilterSelect issues={issues} initial={issueFilter || "all"} />
          <button type="submit" className="px-4 py-2 btn-primary rounded-lg font-medium">
            Filter
          </button>
        </form>
      </div>

      {articles.length === 0 ? (
        <p className="text-muted">No articles yet.</p>
      ) : (
        <>
          <div className="bg-white dark:bg-[#2a2a2a] border border-default rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-default bg-paper dark:bg-[#1f1f1f]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-ink">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-ink">
                    Issue
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-ink">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-ink">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-ink">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr
                    key={article.id}
                    className="border-t border-default hover:bg-paper dark:hover:bg-[#1f1f1f] transition-colors"
                  >
                    <td className="px-6 py-4 text-sm line-clamp-1">
                      {article.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {article.issue?.volume}/{article.issue?.issueNo}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {article.category || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {article.published === false ? (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">Draft</span>
                      ) : (
                        <span className="text-green-600 dark:text-green-400 font-medium">Published</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="text-primary hover:text-primary-light"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={pageNum}
            totalPages={totalPages}
            searchParams={{
              ...(issueFilter && issueFilter !== "all" ? { issue: issueFilter } : {}),
              ...(query ? { q: query } : {}),
            }}
          />
        </>
      )}
    </div>
  );
}
