import { getAuthorsPaged } from "@/lib/data";
import Link from "next/link";
import { Metadata } from "next";
import { User } from "lucide-react";
import Pagination from "@/app/_components/Pagination";

export const metadata: Metadata = {
  title: "Authors",
  description: "Contributors to Bodhanam Quarterly",
};

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function AuthorsPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const pageNum = page ? parseInt(page) : 1;
  const { items: authors, totalPages } = await getAuthorsPaged(pageNum, 24);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="mb-12 md:mb-16">
          <h1 className="font-serif-ml text-4xl md:text-5xl lg:text-6xl font-bold text-ink mb-4">
            Authors
          </h1>
          <p className="text-muted font-sans-ml">Contributors to Bodhanam Quarterly</p>
        </div>

        {authors.length === 0 ? (
          <p className="text-muted font-sans-ml">No authors found yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {authors.map((author) => (
                <Link
                  key={author.name}
                  href={`/authors/${encodeURIComponent(author.name)}`}
                  className="group flex flex-col items-center gap-2 rounded-xl border p-5 text-center transition-colors duration-200 hover:bg-primary/5"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: "var(--border-subtle)" }}
                  >
                    <User size={20} strokeWidth={1.5} className="text-muted" />
                  </span>
                  <span className="font-sans-ml text-sm font-medium text-ink line-clamp-2">
                    {author.name}
                  </span>
                  <span className="text-xs text-muted">
                    {author.count} article{author.count !== 1 ? "s" : ""}
                  </span>
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
