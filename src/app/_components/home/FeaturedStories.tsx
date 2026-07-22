"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Media, { DEFAULT_IMAGE } from "@/app/_components/Media";
import type { getCoverStories } from "@/lib/data";

type Article = Awaited<ReturnType<typeof getCoverStories>>[number];

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function FeaturedStories({
  stories,
  issueId,
}: {
  stories: Article[];
  issueId: number;
}) {
  // Shuffle after mount (not during render) so server HTML and hydration
  // match, then keep rotating the feature slot while the page is open.
  const [ordered, setOrdered] = useState(stories);
  useEffect(() => {
    setOrdered(shuffle(stories));
    const id = setInterval(() => {
      // Cycle instead of reshuffling so every cover story gets a turn as
      // the feature and the change is visible each tick.
      setOrdered((prev) => (prev.length > 1 ? [...prev.slice(1), prev[0]] : prev));
    }, 8000);
    return () => clearInterval(id);
  }, [stories]);

  function rotate(dir: 1 | -1) {
    setOrdered((prev) => {
      if (prev.length < 2) return prev;
      return dir === 1
        ? [...prev.slice(1), prev[0]]
        : [prev[prev.length - 1], ...prev.slice(0, -1)];
    });
  }

  if (ordered.length === 0) return null;

  const [feature, ...secondary] = ordered;

  return (
    <section className="py-5 md:py-6">
      <div className="mb-4 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => rotate(-1)}
          aria-label="Previous story"
          className="cursor-pointer rounded-full border p-1.5 text-ink transition-colors hover:border-primary hover:text-primary"
          style={{ borderColor: "var(--border)" }}
        >
          <ChevronLeft size={16} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={() => rotate(1)}
          aria-label="Next story"
          className="cursor-pointer rounded-full border p-1.5 text-ink transition-colors hover:border-primary hover:text-primary"
          style={{ borderColor: "var(--border)" }}
        >
          <ChevronRight size={16} strokeWidth={2} />
        </button>
        <Link
          href={`/issue/${issueId}#contents`}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary-light"
        >
          View all
          <ArrowRight size={15} strokeWidth={2} />
        </Link>
      </div>

      {/* key on the lead story re-mounts the grid each rotation → fade-in */}
      <div key={feature.id} className="fade-swap grid grid-cols-1 gap-5 lg:grid-cols-5">
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
              <Link
                key={a.id}
                href={`/articles/show/${a.id}`}
                className="featured-mini group block flex-1"
              >
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
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted">
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
    </section>
  );
}
