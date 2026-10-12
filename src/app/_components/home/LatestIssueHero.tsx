import Link from "next/link";
import { ArrowRight, FileText, Users } from "lucide-react";
import type { getLatestIssue } from "@/lib/data";
import BotanicalDecoration from "@/app/_components/BotanicalDecoration";
import { DEFAULT_IMAGE } from "@/app/_components/Media";
import IslamicPattern from "@/app/_components/IslamicPattern";
import { cleanExcerpt } from "@/lib/text";

type Issue = NonNullable<Awaited<ReturnType<typeof getLatestIssue>>>;
type Article = Issue["articles"][number];

interface LatestIssueHeroProps {
  issue: Issue;
  mugavurapArticle?: Article;
}

export default function LatestIssueHero({ issue, mugavurapArticle }: LatestIssueHeroProps) {
  const authorCount = new Set(
    issue.articles.map((a) => a.author).filter((a): a is string => Boolean(a))
  ).size;

  const exploreCta = (className = "") => (
    <Link
      href={`/issue/${issue.id}`}
      className={`btn-primary group/cta inline-flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium sm:gap-2 sm:px-5 ${className}`}
    >
      Explore the Issue
      <ArrowRight
        size={16}
        strokeWidth={2}
        className="transition-transform duration-200 group-hover/cta:translate-x-0.5"
      />
    </Link>
  );
  const cta = exploreCta();

  return (
    <section className="py-5 md:py-6">
      <div
        className="relative overflow-hidden rounded-[20px] border px-4 py-4 sm:px-6 sm:py-5 lg:px-7"
        style={{ borderColor: "var(--hero-border)", backgroundColor: "var(--hero-bg)" }}
      >
        <IslamicPattern className="opacity-[0.15] [mask-image:linear-gradient(to_left,black,transparent)]" />
        <BotanicalDecoration
          flip
          className="hidden lg:block absolute -right-8 -top-6 h-56 w-56 opacity-70"
        />

        <div className="relative grid grid-cols-[7rem_1fr] items-center gap-x-4 gap-y-4 sm:flex sm:flex-row sm:gap-6">
          {/* Cover */}
          <Link
            href={`/issue/${issue.id}`}
            className="group block w-full shrink-0 sm:w-40"
          >
            <div
              className="overflow-hidden rounded-lg shadow-lg"
              style={{ aspectRatio: "3 / 4" }}
            >
              <img
                src={issue.coverImage || DEFAULT_IMAGE}
                alt={`Vol ${issue.volume} Issue ${issue.issueNo}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </Link>

          {/* Meta + CTAs */}
          <div className="min-w-0 flex-1 text-left lg:max-w-md">
            <span
              className="mb-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.15em] text-primary sm:mb-3 sm:px-3 sm:py-1 sm:text-xs sm:tracking-[0.2em]"
              style={{ borderColor: "var(--border)" }}
            >
              Latest Issue
            </span>
            <h1 className="font-serif-ml text-base font-bold leading-tight text-ink md:text-lg">
              {issue.period}
            </h1>
            <p className="mt-1.5 text-sm font-medium text-muted">
              Vol. {issue.volume} · Issue {issue.issueNo}
            </p>

            <div className="mt-3 flex gap-4 sm:mt-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-primary" strokeWidth={1.75} />
                <div className="text-left">
                  <div className="text-sm font-semibold text-ink">{issue.articles.length}</div>
                  <div className="text-xs text-muted">Articles</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users size={18} className="text-primary" strokeWidth={1.75} />
                <div className="text-left">
                  <div className="text-sm font-semibold text-ink">{authorCount}</div>
                  <div className="text-xs text-muted">Authors</div>
                </div>
              </div>
            </div>

            <div className="mt-5 hidden gap-3 sm:flex">
              {cta}
            </div>
          </div>

          {/* Mobile: CTA spans both columns so the cover matches the details height */}
          <div className="col-span-2 sm:hidden">{exploreCta("w-full")}</div>

          {/* Mugavurap (editorial) excerpt */}
          {mugavurapArticle && (
            <div
              className="hidden max-w-sm shrink-0 rounded-xl border p-5 lg:block lg:max-w-md"
              style={{ borderColor: "var(--hero-border)", backgroundColor: "var(--paper-elevated)" }}
            >
              {mugavurapArticle.category && (
                <p className="mb-1.5 font-serif-ml text-base font-bold uppercase tracking-wide text-primary">
                  {mugavurapArticle.category}
                </p>
              )}
              <p className="font-serif-ml text-lg font-bold leading-snug text-ink">
                {mugavurapArticle.title}
              </p>
              {mugavurapArticle.excerpt && (
                <p className="line-clamp-3 mt-3 text-sm leading-relaxed text-muted">
                  {cleanExcerpt(mugavurapArticle.excerpt)}
                </p>
              )}
              <Link
                href={`/articles/show/${mugavurapArticle.id}`}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-light"
              >
                Read More
                <ArrowRight size={14} strokeWidth={2} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
