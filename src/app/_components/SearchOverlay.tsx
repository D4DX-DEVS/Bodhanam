"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search as SearchIcon, X } from "lucide-react";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  topics: Array<{ id: number; name: string }>;
}

interface ResultItem {
  id: number;
  title: string;
  author: string | null;
  category: string | null;
}

export default function SearchOverlay({ open, onClose, topics }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResultItem[]>([]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !query.trim()) {
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
  }, [query, open]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-24 sm:pt-32">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search Bodhanam"
        className="relative w-full max-w-xl rounded-2xl border p-5 shadow-2xl sm:p-6"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--paper-elevated)" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif-ml text-lg font-bold text-ink">Search Bodhanam</h2>
          <button
            onClick={onClose}
            aria-label="Close search"
            className="rounded p-1 text-muted hover:text-ink"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <form action="/search" method="get" onSubmit={onClose}>
          <div className="relative">
            <SearchIcon
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              ref={inputRef}
              type="text"
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              placeholder="Search articles, authors, topics…"
              className="w-full rounded-lg border py-3 pl-10 pr-4 text-sm text-ink"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--paper)" }}
            />
          </div>
        </form>

        {query.trim() && results.length > 0 && (
          <div className="mt-4 space-y-1">
            {results.map((r) => (
              <Link
                key={r.id}
                href={`/articles/show/${r.id}`}
                onClick={onClose}
                className="block rounded-lg px-3 py-2 text-sm hover:bg-primary/5"
              >
                <span className="font-sans-ml text-ink">{r.title}</span>
                {r.author && <span className="ml-2 text-xs text-muted">by {r.author}</span>}
              </Link>
            ))}
          </div>
        )}

        {!query.trim() && topics.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
              Suggested
            </p>
            <div className="flex flex-wrap gap-2">
              {topics.slice(0, 8).map((topic) => (
                <Link
                  key={topic.id}
                  href={`/topics/${encodeURIComponent(topic.name)}`}
                  onClick={onClose}
                  className="rounded-full border px-3 py-1 text-xs font-sans-ml text-ink transition-colors hover:border-primary hover:text-primary"
                  style={{ borderColor: "var(--border)" }}
                >
                  {topic.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
