import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Media from "@/app/_components/Media";
import type { getColumns, getCoverStories } from "@/lib/data";

type Column = Awaited<ReturnType<typeof getColumns>>[number];
type Article = Awaited<ReturnType<typeof getCoverStories>>[number];

export default function ColumnsSection({
  sections,
  issueId,
}: {
  sections: Array<{ column: Column; article: Article }>;
  issueId: number;
}) {
  if (sections.length === 0) return null;

  return (
    <section className="border-t py-10 md:py-14" style={{ borderColor: "var(--border)" }}>
      <div className="mb-8 flex items-center justify-between gap-4">
        <h2 className="font-serif-ml text-2xl font-bold text-ink md:text-3xl">
          പംക്തികൾ
        </h2>
        <Link
          href={`/issue/${issueId}#contents`}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary-light"
        >
          View all columns
          <ArrowRight size={15} strokeWidth={2} />
        </Link>
      </div>
      <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map(({ column, article }) => (
          <Link
            key={column.id}
            href={`/articles/show/${article.id}`}
            className="group block"
          >
            <article className="article-card overflow-hidden" style={{ height: "auto" }}>
              <Media src={article.coverImage} alt={article.title} ratio="4 / 3" />
              <div className="p-4">
                <span className="text-xs font-medium uppercase tracking-wide text-primary">
                  {column.name}
                </span>
                <h3 className="mt-1 font-serif-ml text-base font-bold leading-ml-title text-ink line-clamp-2">
                  {article.title}
                </h3>
                {article.author && (
                  <p className="mt-1 text-xs text-muted">{article.author}</p>
                )}
                {article.excerpt && (
                  <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
