import Link from "next/link";
import type { getRecentArticles } from "@/lib/data";
import { DEFAULT_IMAGE } from "@/app/_components/Media";

type Issue = {
  id: number;
  volume: number | null;
  issueNo: number | null;
  period: string;
  coverImage: string | null;
};
type RecentArticle = Awaited<ReturnType<typeof getRecentArticles>>[number];

interface ArticleSidebarProps {
  issue: Issue;
  recent: RecentArticle[];
}

export default function ArticleSidebar({ issue, recent }: ArticleSidebarProps) {
  return (
    <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto space-y-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {/* Issue cover banner */}
      <Link
        href={`/issue/${issue.id}`}
        className="group block overflow-hidden rounded-2xl border shadow-sm transition-shadow duration-300 hover:shadow-md"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--paper-elevated)" }}
      >
        <div className="relative overflow-hidden" style={{ aspectRatio: "3 / 4" }}>
          <img
            src={issue.coverImage || DEFAULT_IMAGE}
            alt={`Vol ${issue.volume} Issue ${issue.issueNo}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-4 pt-10">
            <p className="font-serif-ml text-lg font-bold leading-tight text-white">{issue.period}</p>
            <p className="mt-0.5 text-xs font-medium tracking-wide text-white/80">
              Vol {issue.volume} · Issue {issue.issueNo}
            </p>
          </div>
        </div>
      </Link>

      {/* Recent posts */}
      {recent.length > 0 && (
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted">
            <span className="h-px w-5 bg-primary" />
            Recent Posts
          </h2>
          <ul className="space-y-1">
            {recent.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/articles/show/${a.id}`}
                  className="recent-post-link group flex gap-3 rounded-xl border border-transparent p-2 transition-colors duration-200 hover:border-[var(--primary)] hover:bg-[var(--paper-elevated)]"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                    <img
                      src={a.coverImage || a.issue.coverImage || DEFAULT_IMAGE}
                      alt={a.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="min-w-0 self-center">
                    <h3 className="font-serif-ml text-sm font-semibold leading-snug text-ink line-clamp-2 group-hover:text-primary transition-colors duration-200">
                      {a.title}
                    </h3>
                    {a.author && (
                      <p className="mt-1 text-xs text-muted transition-colors duration-200 group-hover:text-primary">
                        {a.author}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
