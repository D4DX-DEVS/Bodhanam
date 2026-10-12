import Link from "next/link";
import Media from "@/app/_components/Media";
import { cleanExcerpt } from "@/lib/text";
import CardAuthor from "./CardAuthor";
import type { getCoverStories } from "@/lib/data";

type Article = Awaited<ReturnType<typeof getCoverStories>>[number];

export default function LatestArticles({
  articles,
}: {
  articles: Article[];
}) {
  // Up to 6 in two rows of 3; flex-wrap + justify-center keeps a partial
  // last row (e.g. 2 of 5) centered instead of left-orphaned.
  const shown = articles.slice(0, 6);
  if (shown.length === 0) return null;

  return (
    <section className="py-5 md:py-6">
      <div className="mb-4">
        <h2 className="font-serif-ml text-xl font-bold text-ink md:text-2xl">
          ലേഖനങ്ങൾ
        </h2>
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
                {/* Prefer the admin-set sub-category label; otherwise fall back to
                    the raw category — hidden for plain ലേഖനം since the section
                    heading already says it */}
                {(article.subcategory ||
                  (article.category && !article.category.includes("ലേഖനം"))) && (
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {article.subcategory || article.category}
                  </span>
                )}
                <h3 className="mt-1 font-serif-ml text-base font-bold leading-[1.25] text-ink line-clamp-2">
                  {article.title}
                </h3>
                <CardAuthor author={article.author} />
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
