import { db } from "@/lib/db";
import Link from "next/link";
import { deleteIssueAction } from "@/app/admin/actions";
import Pagination from "@/app/_components/Pagination";

export const metadata = {
  title: "Issues · Admin",
};

export default async function IssuesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page = "1", q } = await searchParams;
  const pageNum = Math.max(1, parseInt(page) || 1);
  const pageSize = 20;
  const query = q?.trim() || "";

  const where = query
    ? { period: { contains: query, mode: "insensitive" as const } }
    : {};

  const [issues, total] = await Promise.all([
    db.issue.findMany({
      where,
      include: { _count: { select: { articles: true } } },
      orderBy: { id: "desc" },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    }),
    db.issue.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-ink">Issues</h1>
        <Link
          href="/admin/issues/new"
          className="px-6 py-2 btn-primary rounded-lg font-medium"
        >
          New Issue
        </Link>
      </div>

      <div className="mb-6">
        <form action="/admin/issues" method="get" className="flex gap-4 items-center">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by period…"
            className="px-4 py-2 border border-default rounded-lg text-ink bg-paper"
          />
          <button type="submit" className="px-4 py-2 btn-primary rounded-lg font-medium">
            Filter
          </button>
        </form>
      </div>

      {issues.length === 0 ? (
        <p className="text-muted">{query ? "No issues match this search." : "No issues yet."}</p>
      ) : (
        <div className="bg-white dark:bg-[#2a2a2a] border border-default rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-default bg-paper dark:bg-[#1f1f1f]">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-ink">
                  Volume / Issue
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-ink">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-ink">
                  Articles
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
              {issues.map((issue) => (
                <tr
                  key={issue.id}
                  className="border-t border-default hover:bg-paper dark:hover:bg-[#1f1f1f] transition-colors"
                >
                  <td className="px-6 py-4 text-sm">
                    {issue.volume}/{issue.issueNo}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">{issue.period}</td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {issue._count.articles}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {issue.published ? (
                      <span className="text-green-600 dark:text-green-400 font-medium">Published</span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">Draft</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-right space-x-4">
                    <Link
                      href={`/admin/issues/${issue.id}/edit`}
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
      )}

      <Pagination page={pageNum} totalPages={totalPages} searchParams={query ? { q: query } : {}} />
    </div>
  );
}
