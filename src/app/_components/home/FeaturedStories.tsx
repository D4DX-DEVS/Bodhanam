"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Media, { DEFAULT_IMAGE } from "@/app/_components/Media";
import type { getCoverStories } from "@/lib/data";

type Article = Awaited<ReturnType<typeof getCoverStories>>[number];

export default function FeaturedStories({
  stories,
}: {
  stories: Article[];
}) {
  // ponytail: max 4 cover stories; right column static, only left feature cycles
  const items = stories.slice(0, 4);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 8000);
    return () => clearInterval(id);
  }, [items.length]);

  if (items.length === 0) return null;

  const feature = items[index];

  function rotate(dir: 1 | -1) {
    setIndex((i) => (i + dir + items.length) % items.length);
  }

  return (
    <section className="py-5 md:py-6">
      <div className="mb-4">
        <h2 className="font-serif-ml text-xl font-bold text-ink md:text-2xl">
          കവര്‍‌സ്റ്റോറി
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Main feature — cycles through the same stories; arrows on both sides */}
        <div className="relative lg:col-span-3">
          {/* key re-mounts on change → fade-in */}
          <Link
            key={feature.id}
            href={`/articles/show/${feature.id}`}
            className="fade-swap group block"
          >
            <article
              className="overflow-hidden rounded-2xl border"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="relative">
                <Media
                  src={feature.coverImage}
                  alt={feature.title}
                  ratio="16 / 9"
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

          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => rotate(-1)}
                aria-label="Previous story"
                className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-black/35 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
              >
                <ChevronLeft size={18} strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => rotate(1)}
                aria-label="Next story"
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-black/35 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
              >
                <ChevronRight size={18} strokeWidth={2} />
              </button>
            </>
          )}
        </div>

        {/* All cover stories — static list, does not slide */}
        {/* h-0 + min-h-full: row height comes from the left 16/9 card; column stretches to it */}
        <div className="flex flex-col gap-3 lg:col-span-2 lg:h-0 lg:min-h-full">
          {items.map((a) => (
            <Link
              key={a.id}
              href={`/articles/show/${a.id}`}
              className="featured-mini group block flex-1 lg:min-h-0"
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
                <div className="flex flex-1 flex-col justify-center p-3">
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
      </div>
    </section>
  );
}
