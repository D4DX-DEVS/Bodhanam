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

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(parseInt(id));

  if (!article) {
    return { title: "Not Found" };
  }

  return {
    title: article.title,
    description: article.excerpt || article.title,
    openGraph: article.coverImage
      ? {
          images: [{ url: article.coverImage }],
        }
      : undefined,
  };
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

  const [adjacent, allArticlesInIssue, recent] = await Promise.all([
    getAdjacentArticles(article),
    getIssueArticles(article.issueId),
    getRecentArticles(7),
  ]);
  const recentPosts = recent.filter((a) => a.id !== article.id).slice(0, 6);

  return (
    <>
    {isDraftPreview && <DraftPreviewBar articleId={article.id} />}
    <div className="min-h-screen max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
      <article className="min-w-0">
      {/* Article Header */}
      <section>
        <div className="pb-5 pt-6 md:pt-8">
          {article.category && (
            <span className="chip mb-4 block w-fit">{article.category}</span>
          )}
          <h1 className="font-serif-ml text-3xl md:text-4xl font-bold text-ink mb-4 md:mb-6 leading-ml-title">
            {article.title}
          </h1>
          {article.author && (
            <div className="flex items-center gap-3 text-base md:text-lg text-brand-red">
              <User size={18} className="flex-shrink-0" />
              <span className="font-sans-ml font-medium">{article.author}</span>
            </div>
          )}
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
      </article>

      {/* Sidebar: issue cover + recent posts */}
      <div className="mt-10 lg:mt-8">
        <ArticleSidebar issue={article.issue} recent={recentPosts} />
      </div>
    </div>
    </>
  );
}
