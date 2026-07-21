import { searchArticlesPaged } from "@/lib/data";
import Link from "next/link";
import { Metadata } from "next";
import Pagination from "@/app/_components/Pagination";
import { DEFAULT_IMAGE } from "@/app/_components/Media";

type SearchPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export const metadata: Metadata = {
  title: "Search",
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, page } = await searchParams;
  const pageNum = page ? parseInt(page) : 1;
  const { items: results, totalPages } = q
    ? await searchArticlesPaged(q, pageNum, 12)
    : { items: [], totalPages: 0 };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="mb-8 md:mb-12">
          <h1 className="font-serif-ml text-4xl md:text-5xl lg:text-6xl font-bold text-ink mb-4 leading-tight">
            Search Results
          </h1>
          {q && (
            <p className="text-muted font-sans-ml">
              {results.length > 0
                ? `Found ${results.length} result${results.length === 1 ? "" : "s"} for "${q}"`
                : `No results found for "${q}"`}
            </p>
          )}
        </div>

        {!q && (
          <div className="text-center py-12 md:py-16">
            <p className="text-muted font-sans-ml">
              Enter a search query in the header to find articles
            </p>
          </div>
        )}

        {results.length > 0 && (
          <>
            <div className="space-y-4 md:space-y-6 mb-12">
              {results.map((article) => (
                <Link key={article.id} href={`/articles/show/${article.id}`}>
                  <div
                    className="border rounded-lg p-5 md:p-6 transition-all duration-300 hover:shadow-md group"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="flex items-start gap-4 md:gap-6">
                      <img
                        src={article.coverImage || DEFAULT_IMAGE}
                        alt={article.title}
                        className="w-20 h-20 md:w-24 md:h-24 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        {article.category && (
                          <span className="chip mb-2 block w-fit">{article.category}</span>
                        )}
                        <h2 className="font-serif-ml text-lg md:text-xl font-bold text-ink mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-tight">
                          {article.title}
                        </h2>
                        {article.author && (
                          <p className="text-sm font-sans-ml text-muted mb-2">
                            By {article.author}
                          </p>
                        )}
                        {article.excerpt && (
                          <p className="text-sm text-muted mb-3 line-clamp-2">
                            {article.excerpt}
                          </p>
                        )}
                        <p className="text-xs font-sans-ml text-muted">
                          Vol {article.issue?.volume} · Issue {article.issue?.issueNo}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Pagination page={pageNum} totalPages={totalPages} searchParams={{ q: q || "" }} />
          </>
        )}

        {q && results.length === 0 && (
          <div className="text-center py-12 md:py-16">
            <p className="text-muted font-sans-ml mb-6">
              Try a different search term or browse the archives
            </p>
            <Link
              href="/archives"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-paper rounded transition-all duration-300 hover:shadow-lg"
              style={{ backgroundColor: "var(--primary)" }}
            >
              View Archives →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
