import Link from "next/link";

export default function DraftPreviewBar({
  articleId,
  issueId,
}: {
  articleId: number;
  issueId: number;
}) {
  return (
    <div className="sticky top-0 z-40 flex flex-wrap items-center gap-3 bg-amber-100 dark:bg-amber-900/40 border-b border-amber-300 dark:border-amber-700 px-4 py-3 text-sm">
      <span className="font-medium text-amber-800 dark:text-amber-200">
        Preview — issue not published yet, not visible to visitors
      </span>
      <div className="ml-auto flex items-center gap-3">
        <Link
          href={`/admin/articles/${articleId}/edit`}
          className="px-4 py-1.5 border border-amber-400 rounded-lg font-medium text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800/40"
        >
          Edit Article
        </Link>
        <Link
          href={`/admin/issues/${issueId}/edit`}
          className="px-4 py-1.5 btn-primary rounded-lg font-medium"
        >
          Publish from Issue
        </Link>
      </div>
    </div>
  );
}
