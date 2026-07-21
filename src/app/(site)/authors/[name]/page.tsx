import { getArticlesByAuthorPaged } from "@/lib/data";
import Media from "@/app/_components/Media";
import Link from "next/link";
import { Metadata } from "next";
import { User } from "lucide-react";
import Pagination from "@/app/_components/Pagination";

type Props = {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const authorName = decodeURIComponent(name);
  return {
    title: authorName,
    description: `Articles by ${authorName} in Bodhanam Quarterly`,
  };
}

export default async function AuthorPage({ params, searchParams }: Props) {
  const { name } = await params;
  const { page } = await searchParams;
  const authorName = decodeURIComponent(name);
  const pageNum = page ? parseInt(page) : 1;

  const { items: articles, total, totalPages } = await getArticlesByAuthorPaged(
    authorName,
    pageNum,
    12
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="mb-12 flex items-center gap-4 md:mb-16">
          <span
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--border-subtle)" }}
          >
            <User size={26} strokeWidth={1.5} className="text-muted" />
          </span>
          <div>
            <h1 className="font-serif-ml text-3xl md:text-4xl lg:text-5xl font-bold text-ink">
              {authorName}
            </h1>
            <p className="mt-1 text-muted font-sans-ml">
              {total} article{total !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {articles.length === 0 ? (
          <p className="text-muted font-sans-ml">No articles found for this author.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => (
                <Link key={a.id} href={`/articles/show/${a.id}`} className="group block">
                  <article className="article-card flex h-full flex-col overflow-hidden">
                    <Media src={a.coverImage} alt={a.title} ratio="4 / 3" />
                    <div className="flex flex-1 flex-col p-4">
                      {a.category && (
                        <span className="text-xs font-medium uppercase tracking-wide text-primary">
                          {a.category}
                        </span>
                      )}
                      <h3 className="mt-1 font-serif-ml text-base font-bold leading-ml-title text-ink line-clamp-2">
                        {a.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted">
                        Vol {a.issue?.volume} · Issue {a.issue?.issueNo}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
            <Pagination page={pageNum} totalPages={totalPages} />
          </>
        )}
      </div>
    </div>
  );
}
