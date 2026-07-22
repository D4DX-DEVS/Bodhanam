import { db } from "@/lib/db";
import Link from "next/link";
import { Plus, Search, Pencil, Eye } from "lucide-react";
import Pagination from "@/app/_components/Pagination";
import StatusBadge from "@/app/admin/_components/StatusBadge";
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
  const from = total === 0 ? 0 : (pageNum - 1) * pageSize + 1;
  const to = Math.min(pageNum * pageSize, total);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ink">Articles</h1>
          <p className="text-muted mt-1">Browse and manage all articles.</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 btn-primary rounded-xl font-medium text-sm"
        >
          <Plus size={16} /> New Article
        </Link>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <form action="/admin/articles" method="get" className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search by title…"
              className="pl-10 pr-4 py-2.5 w-72 border border-default rounded-xl text-sm text-ink bg-white dark:bg-[#242424] focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          <IssueFilterSelect issues={issues} initial={issueFilter || "all"} />
          <button
            type="submit"
            className="px-5 py-2.5 border border-default rounded-xl font-medium text-sm text-ink hover:border-primary hover:text-primary transition-colors bg-white dark:bg-[#242424]"
          >
            Filter
          </button>
        </form>
      </div>

      {articles.length === 0 ? (
        <p className="text-muted">No articles yet.</p>
      ) : (
        <>
          <div className="bg-white dark:bg-[#242424] border border-default rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-default bg-paper dark:bg-[#1f1f1f]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Issue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">
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
                    <td className="px-6 py-4 text-sm max-w-md">
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="text-ink hover:text-primary line-clamp-1"
                      >
                        {article.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {article.issue?.volume}/{article.issue?.issueNo}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {article.category || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge published={article.published} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          title="Edit"
                          className="p-2 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Pencil size={16} />
                        </Link>
                        <Link
                          href={`/articles/show/${article.id}`}
                          target="_blank"
                          title="View"
                          className="p-2 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Eye size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-3 border-t border-default text-sm text-muted">
              Showing {from} to {to} of {total} articles
            </div>
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
