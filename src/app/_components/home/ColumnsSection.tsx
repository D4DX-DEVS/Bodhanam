import Link from "next/link";
import Media from "@/app/_components/Media";
import { normalizeCategoryName, type getColumns, type getCoverStories } from "@/lib/data";
import { cleanExcerpt } from "@/lib/text";

type Column = Awaited<ReturnType<typeof getColumns>>[number];
type Article = Awaited<ReturnType<typeof getCoverStories>>[number];

export default function ColumnsSection({
  sections,
}: {
  sections: Array<{ column: Column; article: Article }>;
}) {
  if (sections.length === 0) return null;

  return (
    <section className="py-5 md:py-6">
      <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map(({ column, article }) => {
          const isDuplicateAuthor =
            article.author && normalizeCategoryName(article.author) === normalizeCategoryName(column.name);

          return (
            <Link
              key={column.id}
              href={`/articles/show/${article.id}`}
              className="group block h-full"
            >
              <article className="article-card flex h-full flex-col overflow-hidden">
                <Media src={article.coverImage} alt={article.title} ratio="4 / 3" />
                <div className="p-4">
                  <span className="text-xs font-medium uppercase tracking-wide text-primary">
                    {column.name}
                  </span>
                  <h3 className="mt-1 font-serif-ml text-base font-bold leading-ml-title text-ink line-clamp-2">
                    {article.title}
                  </h3>
                  {article.author && !isDuplicateAuthor && (
                    <p className="mt-1 text-xs font-medium text-brand-red">
                      {article.author}
                    </p>
                  )}
                  {article.excerpt && (
                    <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-2">
                      {cleanExcerpt(article.excerpt)}
                    </p>
                  )}
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
