import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Media from "@/app/_components/Media";
import { cleanExcerpt } from "@/lib/text";
import type { getCoverStories } from "@/lib/data";

type Article = Awaited<ReturnType<typeof getCoverStories>>[number];

export default function LatestArticles({
  articles,
  issueId,
}: {
  articles: Article[];
  issueId: number;
}) {
  // Up to 6 in two rows of 3; flex-wrap + justify-center keeps a partial
  // last row (e.g. 2 of 5) centered instead of left-orphaned.
  const shown = articles.slice(0, 6);
  if (shown.length === 0) return null;

  return (
    <section className="py-5 md:py-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-serif-ml text-2xl font-bold text-ink md:text-3xl">
          ലേഖനങ്ങൾ
        </h2>
        <Link
          href={`/issue/${issueId}#contents`}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary-light"
        >
          View all
          <ArrowRight size={15} strokeWidth={2} />
        </Link>
      </div>
      <div className="flex flex-wrap justify-center gap-5">
        {shown.map((article) => (
          <Link
            key={article.id}
            href={`/articles/show/${article.id}`}
            className="group block w-full md:w-[calc((100%-2.5rem)/3)]"
          >
            <article className="article-card overflow-hidden">
              <Media src={article.coverImage} alt={article.title} ratio="16 / 9" />
              <div className="p-4">
                {article.category && (
                  <span className="text-xs font-medium uppercase tracking-wide text-primary">
                    {article.category}
                  </span>
                )}
                <h3 className="mt-1 font-serif-ml text-base font-bold leading-ml-title text-ink line-clamp-2">
                  {article.title}
                </h3>
                {article.author && (
                  <p className="mt-1 text-xs font-medium text-brand-red">{article.author}</p>
                )}
                {article.excerpt && (
                  <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-2">
                    {cleanExcerpt(article.excerpt)}
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
