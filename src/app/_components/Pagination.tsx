"use client";

import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  searchParams?: Record<string, string>;
}

export default function Pagination({
  page,
  totalPages,
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Build query string preserving other params
  const buildUrl = (pageNum: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(pageNum));
    return `?${params.toString()}`;
  };

  const pageNumbers = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      {page > 1 && (
        <Link
          href={buildUrl(page - 1)}
          className="px-3 py-2 border border-default rounded hover:bg-paper-light transition-colors text-ink font-sans-ml"
        >
          ← Prev
        </Link>
      )}

      {start > 1 && (
        <>
          <Link
            href={buildUrl(1)}
            className="px-3 py-2 border border-default rounded hover:bg-paper-light transition-colors text-ink font-sans-ml"
          >
            1
          </Link>
          {start > 2 && <span className="text-muted">…</span>}
        </>
      )}

      {pageNumbers.map((num) => (
        <Link
          key={num}
          href={buildUrl(num)}
          className={`px-3 py-2 border rounded font-sans-ml transition-colors ${
            num === page
              ? "bg-primary text-paper border-primary"
              : "border-default hover:bg-paper-light text-ink"
          }`}
        >
          {num}
        </Link>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-muted">…</span>}
          <Link
            href={buildUrl(totalPages)}
            className="px-3 py-2 border border-default rounded hover:bg-paper-light transition-colors text-ink font-sans-ml"
          >
            {totalPages}
          </Link>
        </>
      )}

      {page < totalPages && (
        <Link
          href={buildUrl(page + 1)}
          className="px-3 py-2 border border-default rounded hover:bg-paper-light transition-colors text-ink font-sans-ml"
        >
          Next →
        </Link>
      )}
    </div>
  );
}
