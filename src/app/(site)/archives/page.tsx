import { searchIssuesPaged, getAvailableIssueYears } from "@/lib/data";
import Link from "next/link";
import { Metadata } from "next";
import { Search as SearchIcon } from "lucide-react";
import Pagination from "@/app/_components/Pagination";
import { DEFAULT_IMAGE } from "@/app/_components/Media";
import YearSelect from "./YearSelect";

export const metadata: Metadata = {
  title: "Archives",
  description: "Browse all issues of Bodhanam Quarterly",
};

type ArchivesPageProps = {
  searchParams: Promise<{ page?: string; q?: string; year?: string }>;
};

export default async function Archives({ searchParams }: ArchivesPageProps) {
  const { page, q, year } = await searchParams;
  const pageNum = page ? parseInt(page) : 1;
  const query = q ?? "";
  const selectedYear = year ?? "all";

  const [{ items: issues, totalPages }, years] = await Promise.all([
    searchIssuesPaged(query, selectedYear, pageNum, 12),
    getAvailableIssueYears(),
  ]);

  const extraParams: Record<string, string> = {};
  if (query) extraParams.q = query;
  if (selectedYear !== "all") extraParams.year = selectedYear;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="mb-8 md:mb-10">
          <h1 className="font-serif-ml text-4xl md:text-5xl lg:text-6xl font-bold text-ink mb-4">
            Archives
          </h1>
          <p className="text-muted font-sans-ml">
            Browse all published issues of Bodhanam Quarterly
          </p>
        </div>

        {/* Filters — plain GET form, works without JS */}
        <form
          method="get"
          className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1">
            <SearchIcon
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search year, volume, article title or author — e.g. 2024, Vol 21, ഖുർആൻ"
              className="w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm text-ink"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--paper-elevated)" }}
            />
          </div>
          <YearSelect years={years} initial={selectedYear} />
        </form>

        {years.length > 1 && (
          <div className="mb-12 flex flex-wrap items-center gap-x-1 gap-y-2 text-sm md:mb-16">
            <Link
              href="/archives"
              className={selectedYear === "all" ? "font-semibold text-primary" : "text-muted hover:text-primary"}
            >
              All
            </Link>
            {years.map((y) => (
              <span key={y} className="flex items-center gap-1">
                <span className="text-muted">·</span>
                <Link
                  href={`/archives?year=${y}`}
                  className={y === selectedYear ? "font-semibold text-primary" : "text-muted hover:text-primary"}
                >
                  {y}
                </Link>
              </span>
            ))}
          </div>
        )}

        {issues.length === 0 && (
          <p className="text-muted font-sans-ml">No issues match this filter.</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10 lg:gap-x-8 lg:gap-y-12">
          {issues.map((issue) => {
            const year = issue.period.slice(0, 4);
            const months = issue.period.slice(4).trim();
            return (
              <Link key={issue.id} href={`/issue/${issue.id}`} className="group text-center">
                <div className="cover-frame">
                  <img
                    src={issue.coverImage || DEFAULT_IMAGE}
                    alt={`${year} ${months}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="mt-4 font-sans-ml text-base md:text-lg text-ink">
                  {year} <span className="font-bold">{months}</span>
                </p>
              </Link>
            );
          })}
        </div>

        <div className="mt-16 md:mt-20">
          <Pagination page={pageNum} totalPages={totalPages} searchParams={extraParams} />
        </div>
      </div>
    </div>
  );
}
