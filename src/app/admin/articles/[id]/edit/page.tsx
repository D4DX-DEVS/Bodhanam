import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ArticleForm from "@/app/admin/_components/ArticleForm";

export const metadata = {
  title: "Edit Article · Admin",
};

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await db.article.findUnique({
    where: { id: parseInt(id) },
    include: { issue: true },
  });

  if (!article) {
    notFound();
  }

  const [issues, categories] = await Promise.all([
    db.issue.findMany({ orderBy: { id: "desc" } }),
    db.article.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
  ]);
  const categorySuggestions = categories
    .map((c) => c.category)
    .filter((c): c is string => Boolean(c));

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-ink mb-8">Edit Article</h1>
      <ArticleForm
        issues={issues}
        article={article}
        categorySuggestions={categorySuggestions}
      />
    </div>
  );
}
