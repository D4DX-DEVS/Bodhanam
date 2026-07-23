import { db } from "@/lib/db";
import Link from "next/link";
import { Plus, Search, Pencil, Eye } from "lucide-react";
import Pagination from "@/app/_components/Pagination";
import StatusBadge from "@/app/admin/_components/StatusBadge";
import DeleteRowButton from "@/app/admin/_components/DeleteRowButton";

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
  const from = total === 0 ? 0 : (pageNum - 1) * pageSize + 1;
  const to = Math.min(pageNum * pageSize, total);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ink">Issues</h1>
          <p className="text-muted mt-1">Manage and organize your issues by period.</p>
        </div>
        <Link
          href="/admin/issues/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 btn-primary rounded-xl font-medium text-sm"
        >
          <Plus size={16} /> New Issue
        </Link>
      </div>

      <div className="mb-6">
        <form action="/admin/issues" method="get" className="flex gap-3 items-center">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search by period…"
              className="pl-10 pr-4 py-2.5 w-72 border border-default rounded-xl text-sm text-ink bg-white dark:bg-[#242424] focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 border border-default rounded-xl font-medium text-sm text-ink hover:border-primary hover:text-primary transition-colors bg-white dark:bg-[#242424]"
          >
            Filter
          </button>
        </form>
      </div>

      {issues.length === 0 ? (
        <p className="text-muted">{query ? "No issues match this search." : "No issues yet."}</p>
      ) : (
        <div className="bg-white dark:bg-[#242424] border border-default rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-default bg-paper dark:bg-[#1f1f1f]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  Volume / Issue
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  Articles
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
              {issues.map((issue) => (
                <tr
                  key={issue.id}
                  className="border-t border-default hover:bg-paper dark:hover:bg-[#1f1f1f] transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-ink">
                    {issue.volume}/{issue.issueNo}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">{issue.period}</td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {issue._count.articles}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge published={issue.published} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        href={`/admin/issues/${issue.id}/edit`}
                        title="Edit"
                        className="p-2 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Pencil size={16} />
                      </Link>
                      <Link
                        href={`/admin/issues/${issue.id}/preview`}
                        title="Home preview"
                        className="p-2 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Eye size={16} />
                      </Link>
                      <DeleteRowButton kind="issue" id={issue.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-3 border-t border-default text-sm text-muted">
            Showing {from} to {to} of {total} issues
          </div>
        </div>
      )}

      <Pagination page={pageNum} totalPages={totalPages} searchParams={query ? { q: query } : {}} />
    </div>
  );
}
