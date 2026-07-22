"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";

interface ResultItem {
  id: number;
  title: string;
  author: string | null;
  category: string | null;
}

export default function HeaderSearch({
  autoFocus = false,
  onNavigate,
}: {
  autoFocus?: boolean;
  onNavigate?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [focused, setFocused] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data: { items: ResultItem[] }) => setResults(data.items))
        .catch(() => {});
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Close the suggestions dropdown when clicking anywhere outside.
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function handleResultClick() {
    setQuery("");
    setFocused(false);
    onNavigate?.();
  }

  return (
    <div ref={boxRef} className="relative w-full md:w-56 lg:w-64">
      <form action="/search" method="get">
        <SearchIcon
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="text"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          autoFocus={autoFocus}
          autoComplete="off"
          placeholder="Search…"
          aria-label="Search articles, authors"
          className="w-full rounded-full border py-2 pl-9 pr-4 text-sm text-ink outline-none transition-colors focus:border-primary"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--paper)" }}
        />
      </form>

      {focused && query.trim() && results.length > 0 && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border py-1 shadow-xl"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--paper-elevated)" }}
        >
          {results.map((r) => (
            <Link
              key={r.id}
              href={`/articles/show/${r.id}`}
              onClick={handleResultClick}
              className="block px-3 py-2 text-sm hover:bg-primary/5"
            >
              <span className="font-sans-ml text-ink line-clamp-1">{r.title}</span>
              {r.author && <span className="text-xs text-muted">by {r.author}</span>}
            </Link>
          ))}
          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            onClick={handleResultClick}
            className="mt-1 block border-t px-3 py-2.5 text-center text-sm font-medium text-primary hover:bg-primary/5"
            style={{ borderColor: "var(--border)" }}
          >
            View all results →
          </Link>
        </div>
      )}
    </div>
  );
}
