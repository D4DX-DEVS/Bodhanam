import { searchArticlesPaged, getSearchCategories } from "@/lib/data";
import Link from "next/link";
import { Metadata } from "next";
import { Search as SearchIcon } from "lucide-react";
import Pagination from "@/app/_components/Pagination";
import { DEFAULT_IMAGE } from "@/app/_components/Media";

type SearchPageProps = {
  searchParams: Promise<{ q?: string; page?: string; cat?: string }>;
};

export const metadata: Metadata = {
  title: "Search",
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, page, cat } = await searchParams;
  const pageNum = page ? parseInt(page) : 1;
  const [{ items: results, total, totalPages }, categories] = await Promise.all([
    q
      ? searchArticlesPaged(q, pageNum, 12, cat || undefined)
      : Promise.resolve({ items: [], total: 0, totalPages: 0 }),
    getSearchCategories(),
  ]);

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="mb-8 md:mb-10 text-center">
          <h1 className="font-serif-ml text-4xl md:text-5xl font-bold text-ink mb-6 leading-tight">
            Search
          </h1>
          <form action="/search" method="get" className="relative mx-auto max-w-2xl">
            <SearchIcon
              size={20}
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              name="q"
              defaultValue={q ?? ""}
              autoComplete="off"
              placeholder="Search articles, authors…"
              aria-label="Search articles, authors"
              className="w-full rounded-full border py-4 pl-13 pr-32 text-base text-ink shadow-sm outline-none transition-colors focus:border-primary"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--paper-elevated)",
                paddingLeft: "3.25rem",
              }}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-full px-5 py-2.5 text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: "var(--primary)" }}
            >
              Search
            </button>
            {/* Category filter — submitting resets to page 1 automatically
                (no page field in the form) */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <select
                name="cat"
                defaultValue={cat ?? ""}
                className="cursor-pointer rounded-full border px-4 py-2 text-sm text-ink outline-none"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--paper)" }}
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="cursor-pointer rounded-full border px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
                style={{ borderColor: "var(--border)" }}
              >
                Filter
              </button>
            </div>
          </form>
          {q && (
            <p className="mt-5 text-muted font-sans-ml">
              {total > 0
                ? `Found ${total} result${total === 1 ? "" : "s"} for "${q}"`
                : `No results found for "${q}"`}
            </p>
          )}
        </div>

        {!q && (
          <div className="text-center py-12 md:py-16">
            <p className="text-muted font-sans-ml">
              Type above to search across every article and author
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
            <Pagination
              page={pageNum}
              totalPages={totalPages}
              searchParams={{ q: q || "", ...(cat ? { cat } : {}) }}
            />
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
