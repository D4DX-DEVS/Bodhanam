import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import IssueForm from "@/app/admin/_components/IssueForm";

export const metadata = {
  title: "Edit Issue · Admin",
};

export default async function EditIssuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const issue = await db.issue.findUnique({
    where: { id: parseInt(id) },
  });

  if (!issue) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-ink mb-8">Edit Issue</h1>
      <IssueForm issue={issue} />
    </div>
  );
}
