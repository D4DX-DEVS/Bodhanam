import {
  getArticle,
  getAdjacentArticles,
  getIssueArticles,
  getRecentArticles,
} from "@/lib/data";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { sanitizeArticleHtml, stripDuplicateCoverImage } from "@/lib/sanitize";
import { User } from "lucide-react";
import ArticleSidebar from "@/app/_components/ArticleSidebar";
import ArticleActions from "@/app/_components/ArticleActions";
import { DEFAULT_IMAGE } from "@/app/_components/Media";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import DraftPreviewBar from "@/app/admin/_components/DraftPreviewBar";
import JsonLd from "@/app/_components/JsonLd";
import { Suspense } from "react";
import { RelatedSkeleton, SidebarSkeleton } from "@/app/_components/skeletons/ArticleSkeleton";
import { htmlToExcerpt } from "@/lib/text";
import {
  ORG_ID, absUrl, articlePath, authorPath, breadcrumb, issueNode, issuePath, pageMeta, periodToIsoDate,
} from "@/lib/seo";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(parseInt(id));

  if (!article) {
    return { title: "Not Found", robots: { index: false } };
  }

  return pageMeta({
    title: article.title,
    description: article.excerpt || htmlToExcerpt(article.bodyHtml) || article.title,
    path: articlePath(article.id),
    image: article.coverImage || article.issue.coverImage,
    type: "article",
    publishedTime: periodToIsoDate(article.issue.period),
    authors: article.author ? [article.author] : undefined,
    section: article.category,
  });
}

type ArticleWithIssue = NonNullable<Awaited<ReturnType<typeof getArticle>>>;

function articleJsonLd(article: ArticleWithIssue) {
  const url = absUrl(articlePath(article.id));
  const date = periodToIsoDate(article.issue.period);
  const issueLabel = `Vol ${article.issue.volume ?? "?"} · Issue ${article.issue.issueNo ?? "?"}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ScholarlyArticle",
        "@id": `${url}#article`,
        mainEntityOfPage: url,
        url,
        headline: article.title.slice(0, 110),
        name: article.title,
        description: article.excerpt || htmlToExcerpt(article.bodyHtml),
        inLanguage: "ml",
        ...(date && { datePublished: date }),
        ...(article.coverImage && { image: absUrl(article.coverImage) }),
        ...(article.category && { articleSection: article.category }),
        ...(article.author && {
          author: { "@type": "Person", name: article.author, url: absUrl(authorPath(article.author)) },
        }),
        publisher: { "@id": ORG_ID },
        isPartOf: issueNode(article.issue),
        isAccessibleForFree: true,
      },
      breadcrumb([
        { name: "Home", path: "/" },
        { name: "Archives", path: "/archives" },
        { name: issueLabel, path: issuePath(article.issueId) },
        { name: article.title, path: articlePath(article.id) },
      ]),
    ],
  };
}

// Below-the-fold pieces stream in after the article body: the reader sees the
// text immediately while these shimmer, instead of waiting for every query.

async function RelatedSection({ article }: { article: ArticleWithIssue }) {
  const [adjacent, allArticlesInIssue] = await Promise.all([
    getAdjacentArticles(article),
    getIssueArticles(article.issueId),
  ]);

  return (
    <section>
      <div className="py-10 md:py-14">
        {/* Article Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16">
          {/* Prev Article */}
          {adjacent.prev && (
            <Link href={`/articles/show/${adjacent.prev.id}`}>
              <div className="article-card card-hover-all group p-5 md:p-6">
                <p className="text-xs font-sans-ml font-medium text-muted mb-2 uppercase tracking-wide">
                  Previous Article
                </p>
                <h3 className="font-serif-ml font-bold text-ink line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight">
                  {adjacent.prev.title}
                </h3>
              </div>
            </Link>
          )}

          {/* Next Article */}
          {adjacent.next && (
            <Link href={`/articles/show/${adjacent.next.id}`}>
              <div className="article-card card-hover-all group p-5 md:p-6">
                <p className="text-xs font-sans-ml font-medium text-muted mb-2 uppercase tracking-wide">
                  Next Article
                </p>
                <h3 className="font-serif-ml font-bold text-ink line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight">
                  {adjacent.next.title}
                </h3>
              </div>
            </Link>
          )}
        </div>

        {/* More from this issue */}
        {allArticlesInIssue.length > 1 && (
          <div>
            <h2 className="font-serif-ml text-2xl md:text-3xl font-bold text-ink mb-6 md:mb-8">
              More from this Issue
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {allArticlesInIssue
                .filter((a) => a.id !== article.id)
                .slice(0, 4)
                .map((a) => (
                  <Link key={a.id} href={`/articles/show/${a.id}`}>
                    <div
                      className="article-card card-hover-all group items-center gap-4 p-4"
                      style={{ flexDirection: "row" }}
                    >
                      <img
                        src={a.coverImage || DEFAULT_IMAGE}
                        alt={a.title}
                        loading="lazy"
                        className="h-20 w-20 shrink-0 rounded-lg object-cover"
                        style={{ aspectRatio: "1 / 1" }}
                      />
                      <div className="min-w-0">
                        {a.category && (
                          <span className="chip text-xs mb-1 block w-fit">{a.category}</span>
                        )}
                        <h3 className="font-serif-ml font-bold text-ink line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight">
                          {a.title}
                        </h3>
                        {a.author && (
                          <p className="mt-1 text-xs font-sans-ml text-muted">By {a.author}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

async function SidebarSection({ article }: { article: ArticleWithIssue }) {
  const recent = await getRecentArticles(7);
  const recentPosts = recent.filter((a) => a.id !== article.id).slice(0, 6);
  return <ArticleSidebar issue={article.issue} recent={recentPosts} />;
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;
  let article = await getArticle(parseInt(id));
  let isDraftPreview = false;

  if (!article) {
    // Draft preview for logged-in admins only
    const session = await getSession();
    if (session) {
      article = await db.article.findUnique({
        where: { id: parseInt(id) },
        include: { issue: true },
      });
      isDraftPreview = !!article;
    }
    if (!article) {
      notFound();
    }
  }

  return (
    <>
    {isDraftPreview ? (
      <DraftPreviewBar articleId={article.id} issueId={article.issueId} />
    ) : (
      <JsonLd data={articleJsonLd(article)} />
    )}
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
      <article className="min-w-0">
      {/* Article Header */}
      <section>
        <div className="pb-5 pt-6 md:pt-8">
          {article.category && (
            <span className="chip mb-4 block w-fit">{article.category}</span>
          )}
          <h1 className="font-serif-ml text-3xl md:text-4xl font-bold text-ink mb-4 md:mb-6 leading-tight">
            {article.title}
          </h1>
          {article.author && (
            <div className="flex items-center gap-3 text-sm md:text-base text-brand-red">
              <User size={16} className="flex-shrink-0" />
              <Link href={authorPath(article.author)} rel="author" className="font-sans-ml font-medium hover:underline">
                {article.author}
              </Link>
            </div>
          )}
          <p className="mt-3 text-sm text-muted font-sans-ml">
            <Link href={issuePath(article.issueId)} className="hover:underline">
              ബോധനം Vol {article.issue.volume ?? "?"} · Issue {article.issue.issueNo ?? "?"} · {article.issue.period}
            </Link>
          </p>
        </div>
      </section>

      {/* Article Body with refined typography */}
      <section className="py-1 md:py-2">
        <div className="content-card">
          {/* Hero image lives inside the card */}
          {article.coverImage && (
            <div className="mb-6 overflow-hidden rounded-lg">
              <img
                src={article.coverImage}
                alt={article.title}
                className="aspect-video w-full object-cover"
              />
            </div>
          )}
          <div
            className="prose-ml prose-ml-wide text-lg leading-relaxed"
            style={{ maxWidth: "none", textAlign: "left" }}
            dangerouslySetInnerHTML={{
              __html: stripDuplicateCoverImage(
                sanitizeArticleHtml(article.bodyHtml),
                article.coverImage
              ),
            }}
          />
          <ArticleActions title={article.title} />
        </div>
      </section>

      {/* Navigation and Related */}
      <Suspense fallback={<RelatedSkeleton />}>
        <RelatedSection article={article} />
      </Suspense>
      </article>

      {/* Sidebar: issue cover + recent posts */}
      <div className="mt-10 lg:mt-8">
        <Suspense fallback={<SidebarSkeleton />}>
          <SidebarSection article={article} />
        </Suspense>
      </div>
    </div>
    </>
  );
}
