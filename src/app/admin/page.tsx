import { db } from "@/lib/db";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  TrendingUp,
  Clock,
  Plus,
  Pencil,
  Eye,
  ArrowRight,
} from "lucide-react";
import StatusBadge from "./_components/StatusBadge";

export const metadata = {
  title: "Dashboard · Admin",
};

export default async function AdminDashboard() {
  const [issueCount, articleCount, draftCount, recentArticles] =
    await Promise.all([
      db.issue.count(),
      db.article.count(),
      db.article.count({ where: { published: false } }),
      db.article.findMany({
        take: 5,
        omit: { bodyHtml: true },
        orderBy: { id: "desc" },
        include: { issue: true },
      }),
    ]);
  const publishedCount = articleCount - draftCount;
  const publishedPct =
    articleCount > 0 ? Math.round((publishedCount / articleCount) * 1000) / 10 : 0;

  const stats = [
    {
      label: "Total Issues",
      value: issueCount,
      icon: BookOpen,
      tint: "bg-primary/10 text-primary",
      foot: (
        <Link href="/admin/issues" className="text-primary hover:text-primary-light">
          View all issues →
        </Link>
      ),
    },
    {
      label: "Total Articles",
      value: articleCount,
      icon: FileText,
      tint: "bg-primary/10 text-primary",
      foot: (
        <Link href="/admin/articles" className="text-primary hover:text-primary-light">
          View all articles →
        </Link>
      ),
    },
    {
      label: "Published Articles",
      value: publishedCount,
      icon: TrendingUp,
      tint: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
      foot: <span className="text-muted">This is {publishedPct}% of all articles</span>,
    },
    {
      label: "Draft Articles",
      value: draftCount,
      icon: Clock,
      tint: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
      foot: <span className="text-muted">Pending review</span>,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink">Welcome back, Admin 👋</h1>
        <p className="text-muted mt-1">
          Here&apos;s what&apos;s happening with your content today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-[#242424] border border-default rounded-2xl p-5 transition-all duration-300 hover:border-primary hover:bg-primary/5 hover:shadow-[0_10px_30px_-10px_rgba(179,22,22,0.25)] hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between">
                <div className="text-sm text-muted">{stat.label}</div>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.tint}`}
                >
                  <Icon size={18} strokeWidth={1.75} />
                </div>
              </div>
              <div className="text-3xl font-bold text-ink -mt-2">{stat.value}</div>
              <div className="mt-3 text-sm">{stat.foot}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-ink mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/issues/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 btn-primary rounded-xl font-medium text-sm"
          >
            <Plus size={16} /> New Issue
          </Link>
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-default rounded-xl font-medium text-sm text-ink hover:border-primary hover:text-primary transition-colors bg-white dark:bg-[#242424]"
          >
            <Plus size={16} /> New Article
          </Link>
        </div>
      </div>

      {/* Recent Articles */}
      <div className="bg-white dark:bg-[#242424] border border-default rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-default">
          <h2 className="text-lg font-bold text-ink">Recent Articles</h2>
          <Link
            href="/admin/articles"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-light font-medium"
          >
            View all <ArrowRight size={15} />
          </Link>
        </div>
        {recentArticles.length === 0 ? (
          <p className="text-muted px-6 py-8">No articles yet.</p>
        ) : (
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
              {recentArticles.map((article) => (
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
        )}
      </div>
    </div>
  );
}
