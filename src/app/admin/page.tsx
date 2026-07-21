import { db } from "@/lib/db";
import Link from "next/link";

export const metadata = {
  title: "Dashboard · Admin",
};

export default async function AdminDashboard() {
  const issueCount = await db.issue.count();
  const articleCount = await db.article.count();
  const recentArticles = await db.article.findMany({
    take: 5,
    omit: { bodyHtml: true },
    orderBy: { id: "desc" },
    include: { issue: true },
  });

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-ink mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-[#2a2a2a] border border-default rounded-lg p-6">
          <div className="text-sm text-muted mb-2">Total Issues</div>
          <div className="text-3xl font-bold text-primary">{issueCount}</div>
          <Link
            href="/admin/issues"
            className="mt-4 inline-block text-sm text-primary hover:text-primary-light"
          >
            View all issues →
          </Link>
        </div>

        <div className="bg-white dark:bg-[#2a2a2a] border border-default rounded-lg p-6">
          <div className="text-sm text-muted mb-2">Total Articles</div>
          <div className="text-3xl font-bold text-primary">{articleCount}</div>
          <Link
            href="/admin/articles"
            className="mt-4 inline-block text-sm text-primary hover:text-primary-light"
          >
            View all articles →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-ink mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/issues/new"
            className="px-6 py-2 btn-primary rounded-lg font-medium"
          >
            New Issue
          </Link>
          <Link
            href="/admin/articles/new"
            className="px-6 py-2 btn-primary rounded-lg font-medium"
          >
            New Article
          </Link>
        </div>
      </div>

      {/* Recent Articles */}
      <div>
        <h2 className="text-2xl font-bold text-ink mb-4">Recent Articles</h2>
        {recentArticles.length === 0 ? (
          <p className="text-muted">No articles yet.</p>
        ) : (
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
                  <th className="px-6 py-3 text-right text-sm font-medium text-ink">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentArticles.map((article) => (
                  <tr
                    key={article.id}
                    className="border-t border-default hover:bg-paper dark:hover:bg-[#1f1f1f] transition-colors"
                  >
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="text-primary hover:text-primary-light"
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
        )}
      </div>
    </div>
  );
}
