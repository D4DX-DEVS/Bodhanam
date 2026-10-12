import Link from "next/link";
import Media from "@/app/_components/Media";
import { normalizeCategoryName, type getColumns, type getCoverStories } from "@/lib/data";
import { cleanExcerpt } from "@/lib/text";
import CardAuthor from "./CardAuthor";

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
      {/* flex-wrap + justify-center (not grid-cols-4) so a short row — e.g. one
          column has no matching article this issue — stays centered instead
          of left-aligned with a dangling gap */}
      <div className="flex flex-wrap justify-center gap-5">
        {sections.map(({ column, article }) => {
          const isDuplicateAuthor =
            article.author && normalizeCategoryName(article.author) === normalizeCategoryName(column.name);

          return (
            <Link
              key={column.id}
              href={`/articles/show/${article.id}`}
              className="group block h-full w-full sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-3.75rem)/4)]"
            >
              <article className="article-card flex h-full flex-col overflow-hidden">
                <Media src={article.coverImage} alt={article.title} ratio="4 / 3" />
                <div className="p-4">
                  <span className="text-xs font-medium uppercase tracking-wide text-primary">
                    {column.name}
                  </span>
                  {/* min-h reserves 2 title lines so a 1-line title doesn't
                      shift the author/excerpt up against neighboring cards */}
                  <h3 className="mt-1 min-h-[2.5rem] font-serif-ml text-base font-bold leading-[1.25] text-ink line-clamp-2">
                    {article.title}
                  </h3>
                  {/* author equal to the column name is a placeholder, not a person */}
                  <CardAuthor author={isDuplicateAuthor ? null : article.author} />
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
