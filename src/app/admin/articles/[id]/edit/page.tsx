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

  const issues = await db.issue.findMany({ orderBy: { id: "desc" } });

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-ink mb-8">Edit Article</h1>
      <ArticleForm issues={issues} article={article} />
    </div>
  );
}
