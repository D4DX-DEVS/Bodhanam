import { getIssue, getIssues } from "@/lib/data";
import Media, { DEFAULT_IMAGE } from "@/app/_components/Media";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const issue = await getIssue(parseInt(id));

  if (!issue) {
    return { title: "Not Found" };
  }

  return {
    title: `Vol ${issue.volume} · Issue ${issue.issueNo}`,
    description: `${issue.period} · ${issue.articles.length} articles`,
  };
}

export async function generateStaticParams() {
  const issues = await getIssues();
  return issues.map((issue) => ({
    id: issue.id.toString(),
  }));
}

export default async function IssuePage({ params }: Props) {
  const { id } = await params;
  const issue = await getIssue(parseInt(id));

  if (!issue) {
    notFound();
  }

  // Cluster by category (so same-category articles sit together) but render one
  // dense uniform grid — with many single-article categories, per-section rows
  // just leave the right half of each row empty.
  const seen: string[] = [];
  issue.articles.forEach((a) => {
    const c = a.category || "ലേഖനങ്ങൾ";
    if (!seen.includes(c)) seen.push(c);
  });
  const sortedArticles = [...issue.articles].sort(
    (a, b) =>
      seen.indexOf(a.category || "ലേഖനങ്ങൾ") - seen.indexOf(b.category || "ലേഖനങ്ങൾ")
  );

  return (
    <div className="min-h-screen">
      {/* Issue Header */}
      <section className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,240px)_1fr] gap-8 lg:gap-12 items-center">
            <div className="mx-auto w-full max-w-[220px] md:mx-0">
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg shadow-lg">
                <img
                  src={issue.coverImage || DEFAULT_IMAGE}
                  alt={`Volume ${issue.volume} Issue ${issue.issueNo}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-xs font-sans-ml font-medium tracking-widest text-primary uppercase mb-3">
                Issue Details
              </div>
              <h1 className="font-serif-ml text-3xl md:text-4xl lg:text-5xl font-bold text-ink mb-2 leading-tight">
                Vol {issue.volume} · Issue {issue.issueNo}
              </h1>
              <p className="text-base md:text-lg text-muted font-sans-ml mb-4">
                {issue.period}
              </p>
              <p className="text-sm font-sans-ml text-muted">
                {issue.articles.length} article{issue.articles.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contents — one dense uniform grid, clustered by category via chips */}
      <section id="contents" className="py-10 md:py-14 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-3">
            <h2 className="font-serif-ml text-xl md:text-2xl font-bold text-ink">
              ഉള്ളടക്കം
            </h2>
            <span className="h-px flex-1" style={{ backgroundColor: "var(--border)" }} />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedArticles.map((article) => (
              <Link key={article.id} href={`/articles/show/${article.id}`} className="group block">
                <article className="article-card flex h-full flex-col overflow-hidden">
                  <Media src={article.coverImage} alt={article.title} ratio="4 / 3" />
                  <div className="flex flex-1 flex-col p-4">
                    {article.category && (
                      <span className="text-xs font-medium uppercase tracking-wide text-primary">
                        {article.category}
                      </span>
                    )}
                    <h3 className="mt-1 font-serif-ml text-sm font-bold leading-ml-title text-ink line-clamp-2 md:text-base">
                      {article.title}
                    </h3>
                    {article.author && (
                      <p className="mt-1 text-xs text-muted line-clamp-1">{article.author}</p>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
