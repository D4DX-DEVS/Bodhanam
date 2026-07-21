"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Media, { DEFAULT_IMAGE } from "@/app/_components/Media";
import type { getCoverStories } from "@/lib/data";

type Article = Awaited<ReturnType<typeof getCoverStories>>[number];

const WINDOW_SIZE = 5;
const AUTO_ADVANCE_MS = 6000;
const FADE_MS = 600;

function SlideWindow({ stories, page }: { stories: Article[]; page: number }) {
  // Page-based: each page shows a fresh, non-overlapping window of stories.
  const start = page * WINDOW_SIZE;
  const [feature, ...secondary] = stories.slice(start, start + WINDOW_SIZE);
  if (!feature) return null;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
      {/* Main feature — capped height so it doesn't dominate */}
      <Link href={`/articles/show/${feature.id}`} className="group block lg:col-span-3">
        <article
          className="h-full overflow-hidden rounded-2xl border"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="relative h-full">
            <Media
              src={feature.coverImage}
              alt={feature.title}
              ratio="16 / 9"
              className="h-full"
            />
            <div
              className="absolute inset-0 flex flex-col justify-end p-5 md:p-6"
              style={{ background: "var(--overlay-grad)" }}
            >
              {feature.slug && (
                <span
                  className="mb-2 w-fit rounded px-2.5 py-1 text-xs font-medium text-white"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  {feature.slug}
                </span>
              )}
              <h3 className="font-serif-ml text-lg font-bold leading-ml-title text-white md:text-2xl line-clamp-2">
                {feature.title}
              </h3>
              {feature.author && (
                <p className="mt-1.5 text-sm text-white/85">{feature.author}</p>
              )}
            </div>
          </div>
        </article>
      </Link>

      {/* Secondary stories — stretch to fill the column height beside the feature */}
      {secondary.length > 0 && (
        <div className="flex flex-col gap-5 lg:col-span-2">
          {secondary.map((a) => (
            <Link key={a.id} href={`/articles/show/${a.id}`} className="group block flex-1">
              <article
                className="flex h-full flex-row overflow-hidden rounded-[14px] border bg-[var(--paper-elevated)] transition-shadow duration-200 hover:border-primary"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="w-2/5 shrink-0 self-stretch overflow-hidden bg-[var(--border-subtle)]">
                  <img
                    src={a.coverImage || DEFAULT_IMAGE}
                    alt={a.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-center p-4">
                  {a.slug && (
                    <span className="text-xs font-medium uppercase tracking-wide text-primary">
                      {a.slug}
                    </span>
                  )}
                  <h3 className="mt-1 font-serif-ml text-sm font-bold leading-ml-title text-ink line-clamp-2">
                    {a.title}
                  </h3>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FeaturedStories({
  stories,
  issueId,
}: {
  stories: Article[];
  issueId: number;
}) {
  const pageCount = Math.ceil(stories.length / WINDOW_SIZE);
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const indexRef = useRef(0);

  const goTo = (i: number) => {
    if (i === indexRef.current) return;
    setPrevIndex(indexRef.current);
    indexRef.current = i;
    setIndex(i);
  };

  useEffect(() => {
    if (pageCount <= 1) return;
    const timer = setInterval(
      () => goTo((indexRef.current + 1) % pageCount),
      AUTO_ADVANCE_MS
    );
    return () => clearInterval(timer);
  }, [pageCount]);

  // Drop the outgoing layer once its fade-out finishes
  useEffect(() => {
    if (prevIndex === null) return;
    const t = setTimeout(() => setPrevIndex(null), FADE_MS);
    return () => clearTimeout(t);
  }, [prevIndex, index]);

  if (stories.length === 0) return null;

  return (
    <section className="border-t py-10 md:py-14" style={{ borderColor: "var(--border)" }}>
      <div className="mb-8 flex items-center justify-between gap-4">
        <h2 className="font-serif-ml text-2xl font-bold text-ink md:text-3xl">
          Featured / Cover Story
        </h2>
        <Link
          href={`/issue/${issueId}#contents`}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary-light"
        >
          View all
          <ArrowRight size={15} strokeWidth={2} />
        </Link>
      </div>

      {/* Crossfade: incoming window fades in underneath while the outgoing
          copy sits absolutely on top fading out — no blank gap between slides. */}
      <div className="relative">
        <div key={index} className="xfade-in">
          <SlideWindow stories={stories} page={index} />
        </div>
        {prevIndex !== null && (
          <div
            key={`prev-${prevIndex}`}
            className="xfade-out pointer-events-none absolute inset-0"
          >
            <SlideWindow stories={stories} page={prevIndex} />
          </div>
        )}
      </div>

      {pageCount > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Show page ${i + 1}`}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === index ? "1.5rem" : "0.5rem",
                backgroundColor: i === index ? "var(--primary)" : "var(--border)",
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
