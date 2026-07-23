import ArticleForm from "@/app/admin/_components/ArticleForm";
import { db } from "@/lib/db";

export const metadata = {
  title: "New Article · Admin",
};

export default async function NewArticlePage() {
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
      <h1 className="text-4xl font-bold text-ink mb-8">New Article</h1>
      <ArticleForm issues={issues} categorySuggestions={categorySuggestions} />
    </div>
  );
}
