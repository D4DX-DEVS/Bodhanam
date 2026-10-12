"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DEFAULT_IMAGE } from "@/app/_components/Media";
import type { getCoverStories } from "@/lib/data";

type Article = Awaited<ReturnType<typeof getCoverStories>>[number];

const SLIDE_MS = 7000;

export default function FeaturedStories({
  stories,
}: {
  stories: Article[];
}) {
  // ponytail: max 4 cover stories; right column static, only left feature cycles
  const items = stories.slice(0, 4);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  if (items.length === 0) return null;

  const multi = items.length > 1;

  function go(next: number) {
    setIndex((next + items.length) % items.length);
  }

  return (
    <section className="py-5 md:py-6">
      <div className="mb-4">
        <h2 className="font-serif-ml text-xl font-bold text-ink md:text-2xl">
          കവര്‍‌സ്റ്റോറി
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Main feature: every slide is mounted and stacked, so changing slide
            is a pure opacity crossfade — no remount, no image reload flash. */}
        <div
          className="relative aspect-video overflow-hidden rounded-2xl border lg:col-span-3"
          style={{ borderColor: "var(--border)" }}
          role="region"
          aria-roledescription="carousel"
          aria-label="Cover stories"
          tabIndex={0}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") go(index - 1);
            if (e.key === "ArrowRight") go(index + 1);
          }}
          onTouchStart={(e) => {
            touchX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
          }}
        >
          {items.map((story, i) => {
            const active = i === index;
            return (
              <Link
                key={story.id}
                href={`/articles/show/${story.id}`}
                aria-hidden={!active}
                tabIndex={active ? 0 : -1}
                className={`group absolute inset-0 block transition-opacity duration-700 ease-out motion-reduce:transition-none ${
                  active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"
                }`}
              >
                {/* Slow zoom on the active slide (Ken Burns); snaps back while hidden */}
                <img
                  src={story.coverImage || DEFAULT_IMAGE}
                  alt={story.title}
                  fetchPriority={i === 0 ? "high" : "low"}
                  className={`h-full w-full object-cover ease-linear motion-reduce:transform-none ${
                    active ? "scale-[1.08] transition-transform" : "scale-100"
                  }`}
                  style={{ transitionDuration: active ? `${SLIDE_MS + 1000}ms` : "0ms" }}
                />
                <div
                  className="absolute inset-0 flex flex-col justify-end p-5 pb-9 md:p-6 md:pb-10"
                  style={{ background: "var(--overlay-grad)" }}
                >
                  <div
                    className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
                      active ? "translate-y-0 opacity-100 delay-200" : "translate-y-3 opacity-0"
                    }`}
                  >
                    {story.slug && (
                      <span
                        className="mb-2 inline-block w-fit rounded px-2.5 py-1 text-xs font-medium text-white"
                        style={{ backgroundColor: "var(--primary)" }}
                      >
                        {story.slug}
                      </span>
                    )}
                    <h3 className="font-serif-ml text-lg font-bold leading-ml-title text-white line-clamp-2 md:text-2xl">
                      {story.title}
                    </h3>
                    {story.author && (
                      <p className="mt-1.5 text-sm text-white/85">{story.author}</p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}

          {multi && (
            <>
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="Previous story"
                className="absolute left-3 top-1/2 z-20 -translate-y-1/2 cursor-pointer rounded-full bg-black/35 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
              >
                <ChevronLeft size={18} strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="Next story"
                className="absolute right-3 top-1/2 z-20 -translate-y-1/2 cursor-pointer rounded-full bg-black/35 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
              >
                <ChevronRight size={18} strokeWidth={2} />
              </button>

              {/* Progress pills: the active pill's fill animation drives autoplay
                  (onAnimationEnd → next), so hover-pause and reduced motion
                  (animation hidden → no autoplay) need no extra timers. */}
              <div className="absolute bottom-3 left-5 z-20 flex gap-1.5 md:left-6">
                {items.map((story, i) => (
                  <button
                    key={story.id}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Show story ${i + 1}`}
                    aria-current={i === index}
                    className={`relative h-1.5 cursor-pointer overflow-hidden rounded-full bg-white/35 transition-all duration-300 ${
                      i === index ? "w-8" : "w-3 hover:bg-white/60"
                    }`}
                  >
                    {i === index && (
                      <span
                        key={index}
                        className="absolute inset-0 origin-left rounded-full bg-white motion-reduce:hidden"
                        style={{
                          animation: `slide-progress ${SLIDE_MS}ms linear forwards`,
                          animationPlayState: paused ? "paused" : "running",
                        }}
                        onAnimationEnd={() => go(index + 1)}
                      />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* All cover stories — static list, does not slide */}
        {/* h-0 + min-h-full: row height comes from the left 16/9 card; column stretches to it */}
        <div className="flex flex-col gap-3 lg:col-span-2 lg:h-0 lg:min-h-full">
          {items.map((a, i) => (
            <Link
              key={a.id}
              href={`/articles/show/${a.id}`}
              className="featured-mini group block flex-1 lg:min-h-0"
            >
              <article
                className="flex h-full flex-row overflow-hidden rounded-[14px] border bg-[var(--paper-elevated)] transition-colors duration-500 hover:border-primary"
                style={{ borderColor: i === index ? "var(--primary)" : "var(--border)" }}
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
