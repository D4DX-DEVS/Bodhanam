import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DEFAULT_IMAGE } from "@/app/_components/Media";
import type { getRecentIssuesForPreview } from "@/lib/data";

type Issue = Awaited<ReturnType<typeof getRecentIssuesForPreview>>[number];

export default function ArchivePreview({ issues }: { issues: Issue[] }) {
  if (issues.length === 0) return null;

  return (
    <section className="border-t py-10 md:py-14" style={{ borderColor: "var(--border)" }}>
      <div className="mb-8 flex items-center justify-between gap-4">
        <h2 className="font-serif-ml text-2xl font-bold text-ink md:text-3xl">
          From the Archive
        </h2>
        <Link
          href="/archives"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary-light"
        >
          View all issues
          <ArrowRight size={15} strokeWidth={2} />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {issues.map((issue) => (
          <Link key={issue.id} href={`/issue/${issue.id}`}>
            <div className="issue-card h-full">
              <img
                src={issue.coverImage || DEFAULT_IMAGE}
                alt={`Vol ${issue.volume} Issue ${issue.issueNo}`}
                className="w-full h-full object-cover"
              />
              <div className="p-3">
                <p className="text-xs font-sans-ml font-medium text-muted uppercase tracking-wide">
                  Vol {issue.volume} · Issue {issue.issueNo}
                </p>
                <p className="mt-1 text-xs font-sans-ml text-ink line-clamp-1">
                  {issue.period}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {issue._count.articles} article{issue._count.articles !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
