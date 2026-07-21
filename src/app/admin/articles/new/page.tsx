import ArticleForm from "@/app/admin/_components/ArticleForm";
import { db } from "@/lib/db";

export const metadata = {
  title: "New Article · Admin",
};

export default async function NewArticlePage() {
  const issues = await db.issue.findMany({ orderBy: { id: "desc" } });
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-ink mb-8">New Article</h1>
      <ArticleForm issues={issues} />
    </div>
  );
}
